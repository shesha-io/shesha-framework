import React, { ComponentType, FC, Fragment, useEffect } from 'react';
import { useAuth, useShaRouting } from '@/providers';
import { useLoginUrl } from '@/hooks/useLoginUrl';
import SheshaLoader from '@/components/sheshaLoader';

export interface IComponentWithAuthProps {
  unauthorizedRedirectUrl: string;
  landingPage: string;
  children: (query: NodeJS.Dict<string | string[]>) => React.ReactElement;
}

export const ComponentWithAuth: FC<IComponentWithAuthProps> = (props) => {
  const { landingPage, unauthorizedRedirectUrl } = props;
  const { isCheckingAuth, loginInfo, checkAuth, getAccessToken, isLoggedIn, isFetchingUserInfo, token } = useAuth();

  const loading = isFetchingUserInfo || (!isFetchingUserInfo && !loginInfo && token) || !isLoggedIn;

  const { goingToRoute, router } = useShaRouting();

  const loginUrl = useLoginUrl({ homePageUrl: landingPage, unauthorizedRedirectUrl });

  useEffect(() => {
    const token = getAccessToken();

    if (!loginInfo) {
      if (token) {
        checkAuth();
      } else {
        goingToRoute(loginUrl);
      }
    }
  }, [isCheckingAuth]);

  return loading ? (
    <SheshaLoader message='Initializing...' />
  ) : (
    <Fragment>{props.children(router?.query)}</Fragment>
  );
};

/**
 * Ensures that a particular page cannot be accessed if you're not authenticated
 */
export const withAuth =
  <P extends object>(Component: ComponentType<P>, unauthorizedRedirectUrl = '/login', landingPage = '/'): FC<P> =>
    (props) => {
      const propsObj = Array.isArray(props) ? props[0] : props;

      return (
        <ComponentWithAuth landingPage={landingPage} unauthorizedRedirectUrl={unauthorizedRedirectUrl}>
          {(query) => (
            // <IdleTimerRenderer>
            <Component {...propsObj} id={query?.id} />
            // </IdleTimerRenderer>
          )}
        </ComponentWithAuth>
      );
    };
