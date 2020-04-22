import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Brand,
  Nav,
  NavItem,
  NavList,
  NavVariants,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/brand.svg';
import {NavLink} from 'react-router-dom';
import dataContainerService from '../../services/dataContainerService';
import {routes} from '@app/routes';
import {chart_color_black_500, chart_color_blue_500} from "@patternfly/react-tokens";

interface IAppLayout {
  children: React.ReactNode;
  welcome: boolean;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({
  children,
  welcome
}) => {
  const logoProps = {
    href: '/console/',
    target: '_self'
  };

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);
  const [cacheManagerName, setCacheManagerName] = useState('');

  useEffect(() => {
    dataContainerService
      .getPrincipalCacheManagerName()
      .then(name => setCacheManagerName(name));
  }, []);

  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };

  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const Header = (
    <PageHeader
      logo={
        <Brand src={icon} alt="Server Management Console" style={{ width: 600 }} />
      }
      logoProps={logoProps}
      showNavToggle={true}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
    />
  );

  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>
  );

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      <NavList id="nav-list-simple" variant={NavVariants.default}>
        {routes.map(
          (route, idx) =>
            route.menu &&
            route.label && (
              <NavItem
                key={`${route.label}-${idx}`}
                id={`${route.label}-${idx}`}
              >
                <NavLink exact to={route.path} activeClassName="pf-m-current">
                  {route.label}
                </NavLink>
              </NavItem>
            )
        )}
      </NavList>
    </Nav>
  );

  const Sidebar = (
    <PageSidebar
      theme="dark"
      nav={Navigation}
      isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
    />
  );

  return (
    <Page
      mainContainerId="primary-app-container"
      header={welcome ? null : Header}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}
      sidebar={welcome ? null : Sidebar}
    >
      {children}
    </Page>
  );
};

export { AppLayout };
