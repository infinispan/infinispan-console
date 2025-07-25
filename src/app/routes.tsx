import * as React from 'react';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CacheManagerPage } from '@app/CacheManagers/CacheMangerPage';
import { CreateCache } from '@app/Caches/CreateCache';
import { Welcome } from '@app/Welcome/Welcome';
import { DetailConfigurations } from '@app/Caches/Configuration/DetailConfigurations';
import { GlobalStats } from '@app/GlobalStats/GlobalStats';
import { ClusterMembership } from '@app/ClusterStatus/ClusterMembership';
import { IndexManagement } from '@app/IndexManagement/IndexManagement';
import { XSiteCache } from '@app/XSite/XSiteCache';
import { DetailCachePage } from '@app/Caches/DetailCachePage';
import { ConnectedClients } from './ConnectedClients/ConnectedClients';
import { AccessManager } from '@app/AccessManagement/AccessManager';
import { useAppInitState, useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { NotAuthorized } from '@app/NotAuthorized/NotAuthorized';
import { NotFound } from '@app/NotFound/NotFound';
import { RoleDetail } from '@app/AccessManagement/RoleDetail';
import { useDocumentTitle } from '@utils/useDocumentTitle';
import { accessibleRouteChangeHandler } from '@utils/utils';
import { ContainerDataProvider } from '@app/providers/CacheManagerContextProvider';
import { EditConfiguration } from '@app/Caches/Configuration/EditConfiguration';
import { CacheDetailProvider } from '@app/providers/CacheDetailProvider';

export interface IAppRoute {
  id: string;
  label?: string;
  component: React.JSX.Element;
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
    id: 'data_container',
    component: <CacheManagerPage />,
    exact: true,
    label: 'Data Container',
    path: '/',
    title: 'Data Container',
    menu: true,
    subRoutes: ['container', 'cache'],
    admin: false
  },
  {
    id: 'global_stats',
    component: <GlobalStats />,
    exact: true,
    label: 'Global Statistics',
    path: '/global-stats',
    title: 'Global Statistics',
    menu: true,
    admin: false
  },
  {
    id: 'cluster_membership',
    component: <ClusterMembership />,
    exact: true,
    label: 'Cluster Membership',
    path: '/cluster-membership',
    title: 'Cluster Membership',
    menu: true,
    admin: false
  },
  {
    id: 'cache_setup',
    component: (
      <ContainerDataProvider>
        <CreateCache />
      </ContainerDataProvider>
    ),
    exact: true,
    label: 'Cache Setup',
    path: '/caches/setup',
    title: 'Cache Setup',
    menu: false,
    readonlyUser: true,
    admin: false
  },
  {
    id: 'create_cache',
    component: (
      <ContainerDataProvider>
        <CreateCache />
      </ContainerDataProvider>
    ),
    exact: true,
    label: 'Create cache',
    path: '/container/caches/create',
    title: 'Create cache',
    menu: false,
    admin: false
  },
  {
    id: 'detail_configurations',
    component: <DetailConfigurations />,
    exact: true,
    label: 'Cache Manager Configurations',
    path: '/container/configurations',
    title: 'Configurations',
    menu: false,
    admin: false
  },
  {
    id: 'cache_index_management',
    component: <IndexManagement />,
    exact: true,
    label: 'Index management',
    path: '/cache/:cacheName/indexing',
    title: 'Index management',
    menu: false,
    admin: false
  },
  {
    id: 'cache_edit_configuration',
    component: (
      <CacheDetailProvider>
        <EditConfiguration />
      </CacheDetailProvider>
    ),
    exact: true,
    label: 'Edit cache configuration',
    path: '/cache/:cacheName/configuration',
    title: 'Edit configuration',
    menu: false,
    admin: true
  },
  {
    id: 'cache_xsite_management',
    component: <XSiteCache />,
    exact: true,
    label: 'XSite Replication Cache',
    path: '/cache/:cacheName/backups',
    title: 'XSite management caches',
    menu: false,
    admin: true
  },
  {
    id: 'cache_detail',
    component: <DetailCachePage />,
    exact: true,
    label: 'Cache',
    path: '/cache/:cacheName',
    title: 'Cache',
    menu: false,
    admin: false
  },
  {
    id: 'access_management',
    component: <AccessManager />,
    exact: true,
    label: 'Access Management',
    path: '/access-management',
    title: 'Access Management',
    menu: true,
    admin: true,
    subRoutes: ['role']
  },
  {
    id: 'connected_clients',
    component: <ConnectedClients />,
    exact: true,
    label: 'Connected Clients',
    path: '/connected-clients',
    title: 'Connected Clients',
    menu: true,
    admin: true
  },
  {
    id: 'access_management_role_detail',
    component: <RoleDetail />,
    exact: true,
    label: 'Role detail',
    path: '/access-management/role/:roleName',
    title: 'Role detail',
    menu: false,
    admin: true
  }
];

let routeFocusTimer: number;
const useA11yRouteChange = (isAsync: boolean) => {
  useEffect(() => {
    if (isAsync !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync]);
};

const ComponentWithTitleUpdates = (props: { appRoute: IAppRoute }) => {
  useDocumentTitle(props.appRoute.title);
  useA11yRouteChange(false);
  return props.appRoute.component;
};

const AppRoutes = () => {
  const { connectedUser } = useConnectedUser();
  const { init } = useAppInitState();
  return (
    <Routes>
      {routes.map((iroute, idx) => {
        if (iroute.admin && !ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
          return <Route key={idx} path={iroute.path} element={<NotAuthorized />} />;
        }
        return <Route key={idx} path={iroute.path} element={<ComponentWithTitleUpdates appRoute={iroute} />} />;
      })}
      <Route key={'welcome'} path={'/welcome'} element={<Welcome />} />
      <Route key={'not-found'} path={'*'} element={<NotFound />} />
    </Routes>
  );
};

export { AppRoutes, routes };
