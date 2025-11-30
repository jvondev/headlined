"use client";

/**
 * License Manager for Compendia
 * Currently, Compendia doesn't have premium features.
 * This is a stub that always returns false (no premium).
 * 
 * If premium features are added in the future, this should be
 * a SEPARATE license system from ReadMore (different keys, different validation).
 */

export interface LicenseStatus {
    isValid: boolean;
    key?: string;
    lastValidated?: string;
}

export const getLicense = (): string | null => {
    // Compendia doesn't support licenses yet
    return null;
};

export const setLicense = async (key: string) => {
    // No-op: Compendia doesn't support licenses yet
    console.warn("Compendia doesn't support premium licenses yet");
};

export const clearLicense = () => {
    // No-op
};

export const validateLicense = async (key: string): Promise<boolean> => {
    // Always return false - no premium features
    return false;
};

export const checkLicenseStatus = async (): Promise<boolean> => {
    // Always return false - no premium features in Compendia
    return false;
};
