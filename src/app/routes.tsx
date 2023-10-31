import * as React from 'react';
import { useEffect } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { CacheManagerPage } from '@app/CacheManagers/CacheMangerPage';
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
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { NotAuthorized } from '@app/NotAuthorized/NotAuthorized';
import { NotFound } from '@app/NotFound/NotFound';

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

const RouteWithTitleUpdates = ({ component: Component, isAsync = false, title, admin, ...rest }: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);
  const { connectedUser } = useConnectedUser();
  function routeWithTitle(routeProps: RouteComponentProps) {
    if (admin && !ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return <PageNotAuthorized title={'Not authorized'} />;
    }
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} />;
};

const PageNotAuthorized = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotAuthorized} />;
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
  admin: boolean;
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
    menu: false,
    admin: false
  },
  {
    component: CacheManagerPage,
    exact: true,
    label: 'Data Container',
    path: '/',
    title: 'Data Container',
    menu: true,
    subRoutes: ['container', 'cache'],
    admin: false
  },
  {
    component: GlobalStats,
    exact: true,
    label: 'Global Statistics',
    path: '/global-stats',
    title: 'Global Statistics',
    menu: true,
    admin: false
  },
  {
    component: ClusterStatus,
    exact: true,
    label: 'Cluster Membership',
    path: '/cluster-membership',
    title: 'Cluster Membership',
    menu: true,
    admin: false
  },
  {
    component: CreateCache,
    exact: true,
    label: 'Cache Setup',
    path: '/caches/setup',
    title: 'Cache Setup',
    menu: false,
    readonlyUser: true,
    admin: false
  },
  {
    component: CreateCache,
    exact: true,
    label: 'Create cache',
    path: '/container/caches/create',
    title: 'Create cache',
    menu: false,
    admin: true
  },
  {
    component: DetailConfigurations,
    exact: true,
    label: 'Cache Manager Configurations',
    path: '/container/:cmName/configurations',
    title: 'Configurations',
    menu: false,
    admin: false
  },
  {
    component: IndexManagement,
    exact: true,
    label: 'Index management',
    path: '/cache/:cacheName/indexing',
    title: 'Index management',
    menu: false,
    admin: false
  },
  {
    component: XSiteCache,
    exact: true,
    label: 'XSite Replication Cache',
    path: '/cache/:cacheName/backups',
    title: 'XSite management caches',
    menu: false,
    admin: true
  },
  {
    component: DetailCachePage,
    exact: true,
    label: 'Cache',
    path: '/cache/:cacheName',
    title: 'Cache',
    menu: false,
    admin: false
  },
  {
    component: AccessManager,
    exact: true,
    label: 'Access Management',
    path: '/access-management',
    title: 'Access Management',
    menu: true,
    admin: true
  },
  {
    component: ConnectedClients,
    exact: true,
    label: 'Connected Clients',
    path: '/connected-clients',
    title: 'Connected Clients',
    menu: true,
    admin: true
  }
];

const AppRoutes = (props: { init: string }) => {
  return (
    <Switch>
      {routes.map(({ path, exact, component, title, admin, isAsync }, idx) => (
        <RouteWithTitleUpdates
          path={path}
          exact={exact}
          component={component}
          key={idx}
          title={title}
          isAsync={isAsync}
          init={props.init}
          admin={admin}
        />
      ))}
      ;
      <PageNotFound title="404 Page Not Found" />
    </Switch>
  );
};

export { AppRoutes, routes };
