"use client";

const LICENSE_KEY_STORAGE_KEY = "_rm_s_k"; // Obfuscated key for license
const LAST_VALIDATED_STORAGE_KEY = "_rm_lv_at"; // Last validation timestamp
const SIGNATURE_STORAGE_KEY = "_rm_sig"; // Signature to prevent tampering
const SALT = "readmore-secure-salt-v1-889b3cda"; // Obfuscation salt

const POLAR_VALIDATE_URL = "https://sandbox-api.polar.sh/v1/customer-portal/license-keys/validate";
const ORGANIZATION_ID = "889b3cda-08d8-4d35-bed0-693cbbfb440a";

export interface LicenseStatus {
    isValid: boolean;
    key?: string;
    lastValidated?: string;
}

async function computeSignature(key: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(key + SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const getLicense = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LICENSE_KEY_STORAGE_KEY);
};

export const setLicense = async (key: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LICENSE_KEY_STORAGE_KEY, key);
    localStorage.setItem(LAST_VALIDATED_STORAGE_KEY, new Date().toISOString());

    // Compute and store signature
    const signature = await computeSignature(key);
    localStorage.setItem(SIGNATURE_STORAGE_KEY, signature);
};

export const clearLicense = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LICENSE_KEY_STORAGE_KEY);
    localStorage.removeItem(LAST_VALIDATED_STORAGE_KEY);
    localStorage.removeItem(SIGNATURE_STORAGE_KEY);
};

export const validateLicense = async (key: string): Promise<boolean> => {
    try {
        const response = await fetch(POLAR_VALIDATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: key.trim(),
                organization_id: ORGANIZATION_ID,
            }),
        });

        if (!response.ok) {
            return false;
        }

        // If valid, update storage
        await setLicense(key);
        return true;
    } catch (error) {
        console.error("License validation failed:", error);
        return false;
    }
};

export const checkLicenseStatus = async (): Promise<boolean> => {
    const key = getLicense();
    if (!key) return false;

    // Verify signature
    const storedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (!storedSignature) {
        // Migration: If no signature but key exists, re-validate and sign
        const isValid = await validateLicense(key);
        return isValid;
    }

    const computedSignature = await computeSignature(key);
    if (storedSignature !== computedSignature) {
        console.warn("License signature mismatch. Tampering detected.");
        clearLicense();
        return false;
    }

    const lastValidated = localStorage.getItem(LAST_VALIDATED_STORAGE_KEY);
    if (!lastValidated) {
        // If key exists but never validated (shouldn't happen with setLicense), validate now
        return validateLicense(key);
    }

    const lastValidatedDate = new Date(lastValidated);
    const now = new Date();
    const daysSinceValidation = (now.getTime() - lastValidatedDate.getTime()) / (1000 * 60 * 60 * 24);

    // Revalidate if older than 7 days
    if (daysSinceValidation > 7) {
        const isValid = await validateLicense(key);
        if (!isValid) {
            clearLicense(); // Revoke if no longer valid
            return false;
        }
    }

    return true;
};
