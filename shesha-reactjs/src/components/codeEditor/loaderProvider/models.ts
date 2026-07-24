export type MonacoLocalPathProps = {
  localPath: string;
};

export type MonacoCdnProps = {
  vsCdnUrl: string;
};

export type MonacoLoaderSettings = MonacoLocalPathProps | MonacoCdnProps;

export const isLocalMonacoSettings = (settings: MonacoLoaderSettings): settings is MonacoLocalPathProps => 'localPath' in settings;
export const isCdnMonacoSettings = (settings: MonacoLoaderSettings): settings is MonacoCdnProps => 'vsCdnUrl' in settings;

export const DEFAULT_MONACO_LOADER_SETTINGS: MonacoLoaderSettings = {
  vsCdnUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs',
};
