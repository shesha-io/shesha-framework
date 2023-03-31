import React, { FC, useEffect, ComponentType, Fragment } from 'react';
import { useAuth, useShaRouting } from '../providers';
import { IdleTimerRenderer, OverlayLoader } from '../components';
import { getLoginUrlWithReturn } from '../utils/url';

export interface IComponentWithAuthProps {
  unauthorizedRedirectUrl: string;
  landingPage: string;
  children: (query: NodeJS.Dict<string | string[]>) => React.ReactElement;
}
export const ComponentWithAuth: FC<IComponentWithAuthProps> = props => {
  const { landingPage, unauthorizedRedirectUrl } = props;
  const { isCheckingAuth, loginInfo, checkAuth, getAccessToken, isLoggedIn } = useAuth();

  const { goingToRoute, router } = useShaRouting();

  useEffect(() => {
    const token = getAccessToken();

    if (!loginInfo) {
      if (token) {
        checkAuth();
      } else {
        goingToRoute(getLoginUrlWithReturn(landingPage, unauthorizedRedirectUrl));
      }
    }
  }, [isCheckingAuth]);

  return isLoggedIn 
    ? <Fragment>{props.children(router?.query)}</Fragment>
    : <OverlayLoader loading={true} loadingText="Initializing..." />;
};

/**
 * Ensures that a particular page cannot be accessed if you're not authenticated
 */
export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  unauthorizedRedirectUrl = '/login',
  landingPage = '/'
): FC<P> => props => {
  const propsObj = Array.isArray(props) ? props[0] : props;

  return (
    <ComponentWithAuth landingPage={landingPage} unauthorizedRedirectUrl={unauthorizedRedirectUrl}>
      {query => (
        <IdleTimerRenderer>
          <Component {...propsObj} id={query?.id} />
        </IdleTimerRenderer>
      )}
    </ComponentWithAuth>
  );
};
