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
  const { isCheckingAuth, loginInfo, checkAuth, getAccessToken } = useAuth();

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

  return isCheckingAuth || !loginInfo ? (
    <OverlayLoader loading={true} loadingText="Initializing..." />
  ) : (
    <Fragment>{props.children(router?.query)}</Fragment>
  );
};

/**
 * Ensures that a particular page cannot be accessed if you're not authenticated
 */
export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  unauthorizedRedirectUrl = '/login',
  landingPage = '/'
): FC<P> => props => {
  const _props = Array.isArray(props) ? props[0] : props;

  return (
    <ComponentWithAuth landingPage={landingPage} unauthorizedRedirectUrl={unauthorizedRedirectUrl}>
      {query => (
        <IdleTimerRenderer>
          <Component {..._props} id={query?.id} />
        </IdleTimerRenderer>
      )}
    </ComponentWithAuth>
  );
};
