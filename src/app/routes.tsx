import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Alert, PageSection } from '@patternfly/react-core';
import { DynamicImport } from '@app/DynamicImport';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { CacheManagers } from '@app/CacheManagers/CacheManagers';
import { NotFound } from '@app/NotFound/NotFound';
import DocumentTitle from 'react-document-title';
import {
  LastLocationProvider,
  useLastLocation
} from 'react-router-last-location';
import { CreateCache } from '@app/Caches/CreateCache';
import { Welcome } from '@app/Welcome/Welcome';
import { DetailCache } from '@app/Caches/DetailCache';
import { DetailStats } from '@app/CacheManagers/DetailStats';
import { DetailConfigurations } from '@app/CacheManagers/DetailConfigurations';
import { ServerGroupIcon, VolumeIcon } from '@patternfly/react-icons';
import { Home } from '@app/Home/Home';
import { ClusterStatus } from '@app/ClusterStatus/ClusterStatus';

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

const RouteWithTitleUpdates = ({
  component: Component,
  isAsync = false,
  title,
  ...rest
}) => {
  const lastNavigation = useLastLocation();

  function routeWithTitle(routeProps: RouteComponentProps) {
    return (
      <DocumentTitle title={title}>
        <Component {...rest} {...routeProps} />
      </DocumentTitle>
    );
  }

  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      clearTimeout(routeFocusTimer);
    };
  }, []);

  return <Route render={routeWithTitle} />;
};

export interface IAppRoute {
  label: string;
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  icon: any;
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  menu: boolean;
}

const routes: IAppRoute[] = [
  {
    component: Welcome,
    exact: true,
    icon: <ServerGroupIcon />,
    label: 'Welcome to the server',
    path: '/welcome',
    title: 'Welcome to the server',
    menu: false
  },
  {
    component: Home,
    exact: true,
    icon: <ServerGroupIcon />,
    label: 'Home',
    path: '/',
    title: 'Home',
    menu: true
  },
  {
    component: CacheManagers,
    exact: true,
    icon: <VolumeIcon />,
    label: 'Cluster',
    path: '/cluster',
    title: 'Cluster',
    menu: true
  },
  {
    component: ClusterStatus,
    exact: true,
    icon: <VolumeIcon />,
    label: 'Cluster status',
    path: '/cluster-status',
    title: 'Cluster Status',
    menu: true
  },
  {
    component: DetailStats,
    exact: true,
    icon: null,
    label: 'Cache Manager Stats',
    path: '/container/:containerName/stats',
    title: 'Stats',
    menu: false
  },
  {
    component: DetailConfigurations,
    exact: true,
    icon: null,
    label: 'Cache Manager Configurations',
    path: '/container/:containerName/configurations',
    title: 'Configurations',
    menu: false
  },
  {
    component: CreateCache,
    exact: true,
    icon: null,
    label: 'Caches',
    path: '/caches/create',
    title: 'Caches',
    menu: false
  },
  {
    component: DetailCache,
    exact: true,
    icon: null,
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
      {routes.map(({ path, exact, component, title, isAsync, icon }, idx) => (
        <RouteWithTitleUpdates
          path={path}
          exact={exact}
          component={component}
          key={idx}
          icon={icon}
          title={title}
          isAsync={isAsync}
        />
      ))}
      <RouteWithTitleUpdates
        component={NotFound}
        title={'404 Page Not Found'}
      />
    </Switch>
  </LastLocationProvider>
);

export { AppRoutes, routes };
