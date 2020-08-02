import * as React from 'react';
import { useState } from 'react';
import {
  Brand,
  Nav,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/brand.svg';
import {Link, NavLink} from 'react-router-dom';
import {routes} from '@app/routes';
import {APIAlertProvider} from '@app/providers/APIAlertProvider';
import {ActionResponseAlert} from '@app/Common/ActionResponseAlert';
import {RecentActivityProvider} from '@app/providers/RecentActivityContextProvider';
import {useHistory} from 'react-router';
import {global_spacer_sm} from "@patternfly/react-tokens";
import {About} from "@app/About/About";
import utils from "../../services/utils";

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({
  children,
}) => {
  const history = useHistory();

  const logoProps = {
    target: '_self',
    onClick: () => history.push('/')
  };

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);

  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };

  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const Logo = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem style={{marginTop: global_spacer_sm.value}}>
          <Link to={'/'}>
          <Brand
            src={icon}
            alt="Server Management Console"
            width={150}
          />
          </Link>
        </ToolbarItem>
        <ToolbarItem  style={{marginTop: 0}}>
          <TextContent>
            <Text component={TextVariants.h2}>Server Management Console</Text>
          </TextContent>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const Header = (
    <PageHeader
      logo={Logo}
      logoComponent={'div'}
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
      <NavList id="nav-list-simple">
        {routes.map(
          (route, idx) =>
            route.menu &&
            route.label && (
              <NavItem
                key={`${route.label}-${idx}`}
                id={`${route.label}-${idx}`}
              >
                <NavLink
                  exact
                  to={route.path}
                  activeClassName="pf-m-current"
                  isActive={(match, location) => {
                    if (match) {
                      return true;
                    }
                    let isSubRoute = false;
                    if (route.subRoutes != null) {
                      for (let i = 0; i < route.subRoutes.length; i++) {
                        if (location.pathname.includes(route.subRoutes[i])) {
                          isSubRoute = true;
                          break;
                        }
                      }
                    }
                    return isSubRoute;
                  }}
                >
                  {route.label}
                </NavLink>
              </NavItem>
            )
        )}
        <NavItem onClick={()=> setIsAboutOpen(true)}>About</NavItem>
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

  const aboutModal = () => {
    if(utils.isWelcomePage())
      return;

    return (
      <About isModalOpen={isAboutOpen} closeModal={() => setIsAboutOpen(false)}/>
    )
  }
  return (
    <APIAlertProvider>
      <RecentActivityProvider>
        <ActionResponseAlert />
        {aboutModal()}
        <Page
          mainContainerId="primary-app-container"
          header={utils.isWelcomePage() ? null : Header}
          onPageResize={onPageResize}
          skipToContent={PageSkipToContent}
          sidebar={utils.isWelcomePage() ? null : Sidebar}
        >
          {children}
        </Page>
      </RecentActivityProvider>
    </APIAlertProvider>
  );
};

export { AppLayout };
