import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Alert, PageSection } from '@patternfly/react-core';
import { DynamicImport } from '@app/DynamicImport';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { CacheManagers } from '@app/CacheManagers/CacheManagers';
import { NotFound } from '@app/NotFound/NotFound';
import {
  LastLocationProvider,
  useLastLocation
} from 'react-router-last-location';
import { CreateCache } from '@app/Caches/CreateCache';
import { Welcome } from '@app/Welcome/Welcome';
import { DetailCache } from '@app/Caches/DetailCache';
import { DetailConfigurations } from '@app/Caches/DetailConfigurations';
import { ServerGroupIcon, VolumeIcon } from '@patternfly/react-icons';
import { GlobalStats } from '@app/GlobalStats/GlobalStats';
import { ClusterStatus } from '@app/ClusterStatus/ClusterStatus';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

let routeFocusTimer: number;
const getSupportModuleAsync = () => {
  return () => import(/* webpackChunkName: 'support' */ '@app/Support/Support');
};

const Support = (routeProps: RouteComponentProps) => {
  const lastNavigation = useLastLocation();
  return (
    <DynamicImport
      load={getSupportModuleAsync()}
      focusContentAfterMount={lastNavigation !== null}
    >
      {(Component: any) => {
        let loadedComponent: any;
        if (Component === null) {
          loadedComponent = (
            <PageSection aria-label="Loading Content Container">
              <div className="pf-l-bullseye">
                <Alert title="Loading" className="pf-l-bullseye__item" />
              </div>
            </PageSection>
          );
        } else {
          loadedComponent = <Component.Support {...routeProps} />;
        }
        return loadedComponent;
      }}
    </DynamicImport>
  );
};

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({
  component: Component,
  isAsync = false,
  title,
  ...rest
}: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

export interface IAppRoute {
  label?: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  menu?: boolean;
  subRoutes?: string[];
}

const routes: IAppRoute[] = [
  {
    component: Welcome,
    exact: true,
    label: 'Welcome to the server',
    path: '/welcome',
    title: 'Welcome to the server',
    menu: false
  },
  {
    component: CacheManagers,
    exact: true,
    label: 'Data Container',
    path: '/',
    title: 'Data Container',
    menu: true,
    subRoutes: ['container', 'cache']
  },
  {
    component: GlobalStats,
    exact: true,
    label: 'Global Statistics',
    path: '/global-stats',
    title: 'Global Statistics',
    menu: true
  },
  {
    component: ClusterStatus,
    exact: true,
    label: 'Cluster Membership',
    path: '/cluster-membership',
    title: 'Cluster Membership',
    menu: true
  },
  {
    component: DetailConfigurations,
    exact: true,
    label: 'Cache Manager Configurations',
    path: '/container/:cmName/configurations',
    title: 'Configurations',
    menu: false
  },
  {
    component: CreateCache,
    exact: true,
    label: 'Caches',
    path: '/container/:cmName/caches/create',
    title: 'Caches',
    menu: false
  },
  {
    component: DetailCache,
    exact: true,
    label: 'Caches',
    path: '/cache/:name',
    title: 'Cache',
    menu: false
  }
];

export let user = {
  user: 'admin',
  password: 'admin'
};
const AppRoutes = () => (
  <LastLocationProvider>
    <Switch>
      {routes.map(({ path, exact, component, title, isAsync }, idx) => (
        <RouteWithTitleUpdates
          path={path}
          exact={exact}
          component={component}
          key={idx}
          title={title}
          isAsync={isAsync}
        />
      ))}
      <PageNotFound title="404 Page Not Found" />
    </Switch>
  </LastLocationProvider>
);

export { AppRoutes, routes };
