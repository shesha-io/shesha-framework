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

//#region Active Layout Configuration
/**
 * CUSTOMIZE YOUR APPLICATION LAYOUT HERE
 *
 * These constants control which layout components and forms are used throughout your application.
 * To change your app's layout, header, login page, or footer, simply modify the values below.
 *
 * Available layout modes: 'defaultLayout' | 'horizontalLayout'
 * - 'defaultLayout': Traditional sidebar layout with collapsible menu
 * - 'horizontalLayout': Horizontal top navigation layout
 */

/** The layout mode to use throughout the application */
export const LAYOUT_MODE: LayoutMode = 'horizontalLayout';

/** The header form to display in the layout */
export const ACTIVE_HEADER = HEADER_CONFIGURATION;

/** The login form to display on the login page */
export const ACTIVE_LOGIN = LOGIN_CONFIGURATION;

/** The footer form to display in the layout */
export const ACTIVE_FOOTER = FOOTER_CONFIGURATION;
//#endregion
