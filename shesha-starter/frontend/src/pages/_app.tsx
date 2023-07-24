import {
  GlobalStateProvider,
  PageWithLayout,
  ShaApplicationProvider,
  StoredFilesProvider,
} from '@shesha/reactjs';
import { CustomErrorBoundary, CustomNProgress } from 'components';
import App from 'next/app';
import { withRouter } from 'next/router';
import React from 'react';
import { BASE_URL } from 'src/api/utils/constants';
import { StyledThemeProvider } from 'src/definitions/styled-components';
require('@shesha/reactjs/dist/styles.less');
require('src/styles/compiled.antd.variable.css');
require('src/styles/custom-n-progress.less');

interface IState { }

// eslint-disable-next-line @typescript-eslint/ban-types
export class Main extends App<{}, {}, IState> {
  static async getInitialProps({ Component, ctx }: { Component: any; ctx: any }): Promise<{
    pageProps: any;
  }> {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};
    return { pageProps };
  }

  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setAppInsights();
  }

  setAppInsights() {
    // Register Application Insights
    if (process.browser && process.env.NODE_ENV === 'production') {
      import('utils/applicationInsights').then(({ initAppInsights }) => {
        initAppInsights();
      });
    }
  }

  render() {
    const { Component, pageProps, router } = this.props;

    // Use the layout defined at the page level, if available
    const getLayout = (Component as PageWithLayout<any>).getLayout ?? ((page) => page);

    return (
      <CustomErrorBoundary>
        <StyledThemeProvider>
          <GlobalStateProvider>
            <ShaApplicationProvider backendUrl={BASE_URL} router={router}>
              <CustomNProgress />
              <StoredFilesProvider baseUrl={BASE_URL} ownerId={''} ownerType={''}>
                {getLayout(<Component {...(router?.query || {})} {...pageProps} />)}
              </StoredFilesProvider>
            </ShaApplicationProvider>
          </GlobalStateProvider>
        </StyledThemeProvider>
      </CustomErrorBoundary>
    );
  }
}

export default withRouter(Main);
