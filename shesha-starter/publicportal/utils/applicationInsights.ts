import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

import ConfigManager from 'utils/configManager';

export const initAppInsights = (): void => {
  const { appInsightsInstrumentationKey } = new ConfigManager().getConfig();

  if (process.browser && process.env.NODE_ENV === 'production' && appInsightsInstrumentationKey) {
    import('history').then(({ createBrowserHistory }) => {
      const browserHistory = createBrowserHistory({ });
      const reactPlugin = new ReactPlugin();
      const appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: appInsightsInstrumentationKey,
          extensions: [reactPlugin],
          extensionConfig: {
            [reactPlugin.identifier]: { history: browserHistory },
          },
          enableAutoRouteTracking: true,
        },
      });
      appInsights.loadAppInsights();
    });
  }
};
