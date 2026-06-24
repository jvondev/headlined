
// This file is no longer needed as we are using a unified color palette
// defined in globals.css to reduce cognitive load and improve readability.
// This data is kept here for reference but is not used in the application.

export interface ColorPalette {
    '--color-mode-bg': string;
    '--color-mode-fg': string;
    '--color-mode-primary': string;
    '--color-mode-primary-fg': string;
    '--color-mode-secondary': string;
    '--color-mode-secondary-fg': string;
    '--color-mode-muted': string;
    '--color-mode-muted-fg': string;
    '--color-mode-accent': string;
    '--color-mode-accent-fg': string;
    '--color-mode-border': string;

    '--color-mode-deep-dive-bg': string;
    '--color-mode-deep-dive-fg': string;

    '--color-mode-btn-bg': string;
    '--color-mode-btn-fg': string;
    '--color-mode-btn-border': string;
    '--color-mode-btn-hover-bg': string;
    '--color-mode-btn-hover-fg': string;
}

export const lightColorPalettes: ColorPalette[] = [];
export const darkColorPalettes: ColorPalette[] = [];
