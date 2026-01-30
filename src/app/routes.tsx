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
    label: 'routes.data-container',
    path: '/',
    title: 'routes.data-container',
    menu: true,
    subRoutes: ['container', 'cache'],
    admin: false
  },
  {
    id: 'global_stats',
    component: <GlobalStats />,
    exact: true,
    label: 'routes.global-statistics',
    path: '/global-stats',
    title: 'routes.global-statistics',
    menu: true,
    admin: false
  },
  {
    id: 'cluster_membership',
    component: <ClusterMembership />,
    exact: true,
    label: 'routes.cluster-membership',
    path: '/cluster-membership',
    title: 'routes.cluster-membership',
    menu: true,
    admin: true
  },
  {
    id: 'cache_setup',
    component: (
      <ContainerDataProvider>
        <CreateCache />
      </ContainerDataProvider>
    ),
    exact: true,
    label: 'routes.cache-setup',
    path: '/caches/setup',
    title: 'routes.cache-setup',
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
    label: 'routes.create-cache',
    path: '/container/caches/create',
    title: 'routes.create-cache',
    menu: false,
    admin: false
  },
  {
    id: 'detail_configurations',
    component: <DetailConfigurations />,
    exact: true,
    label: 'routes.configurations',
    path: '/container/configurations',
    title: 'routes.configurations',
    menu: false,
    admin: false
  },
  {
    id: 'cache_index_management',
    component: <IndexManagement />,
    exact: true,
    label: 'routes.index-management',
    path: '/cache/:cacheName/indexing',
    title: 'routes.index-management',
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
    label: 'routes.cache-edit-configuration',
    path: '/cache/:cacheName/configuration',
    title: 'routes.cache-edit-configuration',
    menu: false,
    admin: true
  },
  {
    id: 'cache_xsite_management',
    component: <XSiteCache />,
    exact: true,
    label: 'routes.xsite-management-cache',
    path: '/cache/:cacheName/backups',
    title: 'routes.xsite-management-cache',
    menu: false,
    admin: true
  },
  {
    id: 'cache_detail',
    component: <DetailCachePage />,
    exact: true,
    label: 'routes.cache',
    path: '/cache/:cacheName',
    title: 'routes.cache',
    menu: false,
    admin: false
  },
  {
    id: 'access_management',
    component: <AccessManager />,
    exact: true,
    label: 'routes.access-management',
    path: '/access-management',
    title: 'routes.access-management',
    menu: true,
    admin: true,
    subRoutes: ['role']
  },
  {
    id: 'connected_clients',
    component: <ConnectedClients />,
    exact: true,
    label: 'routes.connected-clients',
    path: '/connected-clients',
    title: 'routes.connected-clients',
    menu: true,
    admin: true
  },
  {
    id: 'access_management_role_detail',
    component: <RoleDetail />,
    exact: true,
    label: 'routes.role-detail',
    path: '/access-management/role/:roleName',
    title: 'routes.role-detail',
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
