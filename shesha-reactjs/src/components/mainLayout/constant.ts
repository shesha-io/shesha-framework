import { LayoutMode } from '@/hooks';
import { FormFullName } from '@/providers';

export const SIDEBAR_COLLAPSE = 'SIDEBAR_COLLAPSE';

//#region Available Form Configurations
/**
 * These are all available form configurations.
 * DO NOT modify these - they represent the actual forms available in your system.
 */
export const HEADER_CONFIGURATION: FormFullName = { name: 'header', module: 'Shesha' };
export const HEADER_PUB_PORTAL_CONFIGURATION: FormFullName = { name: 'header-public-portal', module: 'Shesha' };
export const LOGIN_CONFIGURATION: FormFullName = { name: 'login', module: 'Shesha' };
export const LOGIN_PUB_PORTAL_CONFIGURATION: FormFullName = { name: 'login-public-portal', module: 'Shesha' };
export const FOOTER_CONFIGURATION: FormFullName = { name: 'footer-public-portal', module: 'Shesha' };
//#endregion

/** The layout mode to use throughout the application */
export const LAYOUT_MODE: LayoutMode = 'defaultLayout';
