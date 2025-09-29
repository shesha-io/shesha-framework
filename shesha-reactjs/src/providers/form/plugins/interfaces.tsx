export interface IFormPlugin<TSettings = any> {
  name: string;
  settings: TSettings;
  // render: (props: IFormPluginRenderProps) => JSX.Element;
}

export interface IHasPlugins {
  plugins: IFormPlugin[];
}
