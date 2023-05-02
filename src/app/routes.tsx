import * as React from 'react';
import { useEffect } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { CacheManagerPage } from '@app/CacheManagers/CacheMangerPage';
import { NotFound } from '@app/NotFound/NotFound';
import { CreateCache } from '@app/Caches/CreateCache';
import { Welcome } from '@app/Welcome/Welcome';
import { DetailConfigurations } from '@app/Caches/Configuration/DetailConfigurations';
import { GlobalStats } from '@app/GlobalStats/GlobalStats';
import { ClusterStatus } from '@app/ClusterStatus/ClusterStatus';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { IndexManagement } from '@app/IndexManagement/IndexManagement';
import { XSiteCache } from '@app/XSite/XSiteCache';
import { DetailCachePage } from '@app/Caches/DetailCachePage';
import { ConnectedClients } from './ConnectedClients/ConnectedClients';
import { AccessManager } from '@app/AccessManagement/AccessManager';

let routeFocusTimer: number;

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  useEffect(() => {
    if (!isAsync !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync]);
};

const RouteWithTitleUpdates = ({ component: Component, isAsync = false, title, ...rest }: IAppRoute) => {
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
  component: React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  menu?: boolean;
  subRoutes?: string[];
  init?: string;
  readonlyUser?: boolean;
}

const routes: IAppRoute[] = [
  {
    component: Welcome,
    exact: true,
    label: 'Welcome to the Infinispan server',
    path: '/welcome',
    title: 'Welcome to the Infinispan server',
    menu: false
  },
  {
    component: CacheManagerPage,
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
    component: CreateCache,
    exact: true,
    label: 'Cache Setup',
    path: '/setup',
    title: 'Cache Setup',
    menu: false,
    readonlyUser: true
  },
  {
    component: CreateCache,
    exact: true,
    label: 'Create cache',
    path: '/container/caches/create',
    title: 'Create cache',
    menu: false
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
    component: IndexManagement,
    exact: true,
    label: 'Index management',
    path: '/cache/:cacheName/indexing',
    title: 'Index management',
    menu: false
  },
  {
    component: XSiteCache,
    exact: true,
    label: 'XSite Replication Cache',
    path: '/cache/:cacheName/backups',
    title: 'XSite management caches',
    menu: false
  },
  {
    component: DetailCachePage,
    exact: true,
    label: 'Cache',
    path: '/cache/:cacheName',
    title: 'Cache',
    menu: false
  },
  {
    component: AccessManager,
    exact: true,
    label: 'Access Management',
    path: '/access-management',
    title: 'Access Management',
    // TODO: enable when Rest API is implemented
    menu: true
  },
  {
    component: ConnectedClients,
    exact: true,
    label: 'Connected Clients',
    path: '/connected-clients',
    title: 'Connected Clients',
    menu: true
  }
];

const AppRoutes = (props: { init: string }) => {
  return (
    <Switch>
      {routes.map(({ path, exact, component, title, isAsync }, idx) => (
        <RouteWithTitleUpdates
          path={path}
          exact={exact}
          component={component}
          key={idx}
          title={title}
          isAsync={isAsync}
          init={props.init}
        />
      ))}
      <PageNotFound title="404 Page Not Found" />
    </Switch>
  );
};

export { AppRoutes, routes };
