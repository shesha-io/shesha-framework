/**
 * Layout Configuration Constants
 *
 * This file centralizes all layout-related configuration for your application.
 * By modifying the values below, you can customize the layout mode, header, login page, and footer.
 *
 * IMPORTANT: To use custom forms, you'll need to create them in the Forms Designer first,
 * then update the constants below to reference your custom forms.
 */

import {
  LayoutMode,
  FormFullName,
  // Available form configurations from @shesha-io/reactjs
  HEADER_CONFIGURATION,
  LOGIN_CONFIGURATION,
} from '@shesha-io/reactjs';

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
export const LAYOUT_MODE: LayoutMode = 'defaultLayout';

/** The header form to display in the layout */
export const ACTIVE_HEADER: FormFullName = HEADER_CONFIGURATION;

/** The login form to display on the login page */
export const ACTIVE_LOGIN: FormFullName = LOGIN_CONFIGURATION;

/** The footer form to display in the layout */
export const ACTIVE_FOOTER: FormFullName = null; // No footer form is set
//#endregion

