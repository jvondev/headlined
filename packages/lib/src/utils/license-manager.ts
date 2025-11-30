export interface LicenseStatus {
    isValid: boolean;
    key?: string;
    lastValidated?: string;
}

export const getLicense = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('license_key');
};

export const setLicense = async (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('license_key', key);
};

export const clearLicense = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('license_key');
};

export const validateLicense = async (key: string): Promise<boolean> => {
    // Mock validation
    return key.startsWith('RM-');
};

export const checkLicenseStatus = async (): Promise<boolean> => {
    const key = getLicense();
    if (!key) return false;
    return validateLicense(key);
};
