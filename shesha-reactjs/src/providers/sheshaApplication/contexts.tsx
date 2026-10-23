export interface ISheshaRoutes {
  formsDesigner: string;
  configurationStudio: string;
}

export interface IHttpHeadersDictionary {
  [key: string]: string;
}

export const DEFAULT_SHESHA_ROUTES: ISheshaRoutes = {
  formsDesigner: '/shesha/forms-designer',
  configurationStudio: '/configuration-studio',
};

export const DEFAULT_ACCESS_TOKEN_NAME = 'xDFcxiooPQxazdndDsdRSerWQPlincytLDCarcxVxv';
