"use client";

const LICENSE_KEY_STORAGE_KEY = "_rm_s_k"; // Obfuscated key for license
const LAST_VALIDATED_STORAGE_KEY = "_rm_lv_at"; // Last validation timestamp
const SIGNATURE_STORAGE_KEY = "_rm_sig"; // Signature to prevent tampering
const SALT = "readmore-secure-salt-v1-889b3cda"; // Obfuscation salt

const POLAR_VALIDATE_URL = process.env.NEXT_PUBLIC_POLAR_API_URL || "https://api.polar.sh/v1/customer-portal/license-keys/validate";
const ORGANIZATION_ID = process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID || "5078246f-4a2f-45ff-8efa-0c42ddc4016e";

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
    const trimmedKey = key.trim();

    // Basic format validation (prevent "test", "123", etc.)
    // Assuming Polar keys are at least 10 chars long or have specific format.
    if (trimmedKey.length < 10) {
        return false;
    }

    try {
        const response = await fetch(POLAR_VALIDATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: trimmedKey,
                organization_id: ORGANIZATION_ID,
            }),
        });

        if (!response.ok) {
            return false;
        }

        // Double check response body just in case
        const data = await response.json();
        // Polar API returns the license object if valid.
        // We can check if data.key matches or data.status is 'active' if available.
        // For now, response.ok is the primary indicator, but let's be safe.
        if (!data || data.error) {
            return false;
        }

        // If valid, update storage
        await setLicense(trimmedKey);
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
