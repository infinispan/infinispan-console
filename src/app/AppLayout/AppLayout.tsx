import * as React from 'react';
import {NavLink} from 'react-router-dom';
import {Brand, Nav, NavItem, NavList, NavVariants, Page, PageHeader, SkipToContent} from '@patternfly/react-core';
import {routes} from '@app/routes';
import brand from 'url-loader!@app/assets/images/brand.svg';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({children}) => {
  const logoProps = {
    href: '/',
    target: '_blank'
  };
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  }
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const Header = (
    <PageHeader
      logo={<Brand src={brand} alt="Datagrid Management Console"/>}
      logoProps={logoProps}
      toolbar=""
      showNavToggle={false}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
    />
  );

  const Navigation = (
    <Nav id="nav-primary-simple">
      <NavList id="nav-list-simple" variant={NavVariants.simple}>
        {routes.map((route, idx) => {
          return route.menu ? (
            <NavItem key={`${route.label}-${idx}`} id={`${route.label}-${idx}`}>
              {route.icon} <NavLink exact={true} to={route.path} activeClassName="pf-m-current">{route.label}</NavLink>
            </NavItem>
          ) : ('');
        })}
      </NavList>
    </Nav>
  );
  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">
      Skip to Content
    </SkipToContent>
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      header={Header}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}>
      {children}
    </Page>
  );
}

export {AppLayout};
