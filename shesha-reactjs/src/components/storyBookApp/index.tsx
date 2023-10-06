import { EntityCrudActions } from 'providers/dynamicActions/implementations/entityCrudActions';
import { ReportingActions } from 'providers/dynamicActions/implementations/reportingActions';
import React, { FC, PropsWithChildren } from 'react';
import { GlobalStateProvider, ShaApplicationProvider, SidebarMenuDefaultsProvider } from '../../providers';
import AuthContainer from '../authedContainer';
// require('antd/dist/antd.less');

const DEFAULT_ROUTER = {
  route: '',
  pathname: '',
  query: {},
  asPath: '',
  basePath: '',
  components: {},
  sde: {},
  clc: null,
  pageLoader: undefined,
  push(url: string) {
    return new Promise(resolve => {
      if (url) {
        resolve(true);
      }
    });
  },
};

export const StoryApp: FC<PropsWithChildren<{ layout?: boolean }>> = ({ children, layout = true }) => {
  const renderChildren = () => {
    try {
      const getLayout = (children as Array<any>)[0]?.type?.getLayout;

      return typeof getLayout === 'function' ? getLayout(children) : children;
    } catch (error) {
      return children;
    }
  };

  return (
    <GlobalStateProvider>
      <ShaApplicationProvider
        //applicationKey='admin-portal'
        backendUrl={process.env.STORYBOOK_BASE_URL}
        router={DEFAULT_ROUTER as any}
      >
        <EntityCrudActions>
          <ReportingActions>
            <AuthContainer layout={layout}>
              <SidebarMenuDefaultsProvider items={[]}>{renderChildren()}</SidebarMenuDefaultsProvider>
            </AuthContainer>
          </ReportingActions>
        </EntityCrudActions>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};

export default StoryApp;
