import React, {useEffect, useState} from 'react';

import {
  Brand,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownToggle, Flex, FlexItem,
  Nav,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
  SkipToContent,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/brand.svg';
import {Link, NavLink, Redirect} from 'react-router-dom';
import {routes} from '@app/routes';
import {APIAlertProvider} from '@app/providers/APIAlertProvider';
import {ActionResponseAlert} from '@app/Common/ActionResponseAlert';
import {useHistory} from 'react-router';
import {global_spacer_sm} from '@patternfly/react-tokens';
import {About} from '@app/About/About';
import {ErrorBoundary} from '@app/ErrorBoundary';
import {BannerAlert} from '@app/Common/BannerAlert';
import {useTranslation} from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";
import {useConnectedUser} from "@app/services/userManagementHook";
import {KeycloakService} from "@services/keycloakService";
import {InfoCircleIcon} from "@patternfly/react-icons";

interface IAppLayout {
  init: string;
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ init, children }) => {
  const history = useHistory();
  const {connectedUser, notSecured, logUser} = useConnectedUser();
  const [isWelcomePage, setIsWelcomePage] = useState(ConsoleServices.isWelcomePage());
  const logoProps = {
    target: '_self',
    onClick: () => history.push('/'),
  };

  const {t} = useTranslation();
  const brandname = t('brandname.brandname');

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    history.listen((location, action) => {
      const isWelcomePage = location.pathname == '/welcome';
      setIsWelcomePage(isWelcomePage);
    });
  }, [])

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
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem style={{marginTop: global_spacer_sm.value}}>
            <Link to={'/'}>
              <Brand src={icon} alt={t('layout.console-name')} width={150}/>
            </Link>
          </FlexItem>
          <FlexItem>
            <TextContent>
              <Text component={TextVariants.h2}>{t('layout.console-name')}</Text>
            </TextContent>
          </FlexItem>
    </Flex>
  );

  const userDropdownItems = [
    <DropdownGroup key="user-action-group">
      <DropdownItem key="user-action-group-1 logout" onClick={() => {
        if (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated()) {
          KeycloakService.Instance.logout(ConsoleServices.landing());
        } else {
          ConsoleServices.authentication().logOutLink();
          history.push('/welcome');
          window.location.reload();
        }
      }}>Logout</DropdownItem>
    </DropdownGroup>
  ];

  const userActions = () => {
    let chromeAgent = navigator.userAgent.toString().indexOf("Chrome") > -1;
    if (chromeAgent || (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated())) {
      return (
        <PageHeaderTools>
          <Dropdown
            isPlain
            position="right"
            onSelect={() => setIsDropdownOpen(!isDropdownOpen)}
            isOpen={isDropdownOpen}
            toggle={<DropdownToggle onToggle={() => setIsDropdownOpen(!isDropdownOpen)}>{connectedUser.name}</DropdownToggle>}
            dropdownItems={userDropdownItems}
          />
        </PageHeaderTools>
      );
    }
   return (
     <PageHeaderTools>
       {connectedUser.name}
       <Tooltip
         position="left"
         content={
           <div>Close the browser or open an incognito window to log again.</div>
         }
       >
      <span aria-label="Close the browser or open an incognito window to log again." tabIndex={0}>
        <InfoCircleIcon style={{marginLeft: global_spacer_sm.value, marginTop: global_spacer_sm.value}}/>
      </span>
       </Tooltip>
     </PageHeaderTools>
   )
  }

  const Header = (
    <PageHeader
      logo={Logo}
      logoComponent={'div'}
      logoProps={logoProps}
      showNavToggle={true}
      isNavOpen={isNavOpen}
      headerTools={ConsoleServices.authentication().isNotSecured() ? null : userActions()}
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
        <NavItem onClick={() => setIsAboutOpen(true)}>About</NavItem>
      </NavList>
    </Nav>
  );

  const Sidebar = (
    <React.Fragment>
      <PageSidebar
        theme="dark"
        nav={Navigation}
        isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
      />
      <About
        isModalOpen={isAboutOpen}
        closeModal={() => setIsAboutOpen(false)}
      />
    </React.Fragment>
  );

  const displayPage = () => {
    if (init == 'PENDING') {
      return (
        <Page
          mainContainerId="primary-app-container"
        >
          <ErrorBoundary><Spinner/></ErrorBoundary>
        </Page>
      )
    }

    if ((init == 'NOT_READY' || init == 'SERVER_ERROR') && !ConsoleServices.isWelcomePage()) {
      return (
        <Redirect to="/welcome"/>
      )
    }

    return (
      <Page
        mainContainerId="primary-app-container"
        header={isWelcomePage ? null : Header}
        onPageResize={onPageResize}
        skipToContent={PageSkipToContent}
        sidebar={isWelcomePage ? null : Sidebar}
      >
        <ActionResponseAlert/>
        <BannerAlert/>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Page>
    )

  }
  return (
    <APIAlertProvider>
      {displayPage()}
    </APIAlertProvider>
  );
}

export { AppLayout };
