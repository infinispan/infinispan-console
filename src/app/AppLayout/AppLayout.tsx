import React, { useContext, useEffect, useState } from 'react';

import {
  Brand,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  Flex,
  FlexItem,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  MenuToggleElement,
  Nav,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  SkipToContent,
  Spinner,
  Switch,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/brand.svg';
import { Link, NavLink } from 'react-router-dom';
import { IAppRoute, routes } from '@app/routes';
import { APIAlertProvider } from '@app/providers/APIAlertProvider';
import { ActionResponseAlert } from '@app/Common/ActionResponseAlert';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { global_spacer_sm } from '@patternfly/react-tokens';
import { About } from '@app/About/About';
import { ErrorBoundary } from '@app/ErrorBoundary';
import { BannerAlert } from '@app/Common/BannerAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useAppInitState, useConnectedUser } from '@app/services/userManagementHook';
import { KeycloakService } from '@services/keycloakService';
import { BarsIcon, ExternalLinkAltIcon, InfoCircleIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { ConsoleACL } from '@services/securityService';
import { ThemeContext } from '@app/providers/ThemeProvider';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const { t } = useTranslation();
  const { init } = useAppInitState();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { connectedUser } = useConnectedUser();

  const [isWelcomePage, setIsWelcomePage] = useState(ConsoleServices.isWelcomePage());
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    setIsWelcomePage(pathname == '/welcome');
  }, [pathname]);

  const Logo = (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem style={{ marginTop: global_spacer_sm.value }}>
        <Link to={{ pathname: '/' /*, search: location.search */ }}>
          <Brand src={icon} alt={t('layout.console-name')} widths={{ default: '150px' }}>
            <source srcSet={icon} />
          </Brand>
        </Link>
      </FlexItem>
      <FlexItem>
        <TextContent>
          <Text component={TextVariants.h2}>{t('layout.console-name')}</Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );

  const userActions = () => {
    const chromeAgent = navigator.userAgent.toString().indexOf('Chrome') > -1;
    if (chromeAgent || (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated())) {
      return (
        <ToolbarGroup>
          <ToolbarItem>
            <Dropdown
              onSelect={() => setIsDropdownOpen(!isDropdownOpen)}
              isOpen={isDropdownOpen}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  isFullHeight
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  isExpanded={isDropdownOpen}
                >
                  {connectedUser.name}
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <DropdownGroup key="user-action-group">
                <DropdownItem
                  key="user-action-group-1 logout"
                  onClick={() => {
                    if (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated()) {
                      KeycloakService.Instance.logout(ConsoleServices.landing());
                    } else {
                      ConsoleServices.authentication().logOutLink();
                      navigate('/welcome');
                      window.location.reload();
                    }
                  }}
                >
                  {t('layout.logout')}
                </DropdownItem>
              </DropdownGroup>
            </Dropdown>
          </ToolbarItem>
        </ToolbarGroup>
      );
    }
    return (
      <ToolbarItem>
        {connectedUser.name}
        <Tooltip position="left" content={<Text>{t('layout.close-browser-message')}</Text>}>
          <span aria-label={t('layout.close-browser-message')} tabIndex={0}>
            <InfoCircleIcon style={{ marginLeft: global_spacer_sm.value, marginTop: global_spacer_sm.value }} />
          </span>
        </Tooltip>
      </ToolbarItem>
    );
  };

  const headerToolbar = (
    <Toolbar id="toolbar" isFullHeight isStatic>
      <ToolbarContent>
        <ToolbarGroup
          variant="icon-button-group"
          align={{ default: 'alignRight' }}
          spacer={{ default: 'spacerNone', md: 'spacerMd' }}
        >
          <ToolbarItem>
            <Dropdown
              id="aboutInfoQuestionMark"
              onSelect={() => setIsHelpOpen(!isHelpOpen)}
              isOpen={isHelpOpen}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  data-cy="aboutInfoQuestionMark"
                  variant={'plain'}
                  ref={toggleRef}
                  isFullHeight
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  isExpanded={isHelpOpen}
                >
                  <QuestionCircleIcon />
                </MenuToggle>
              )}
            >
              <DropdownItem
                onClick={() => window.open(t('brandname.documentation-link'), '_blank')}
                key="documentation"
                icon={<ExternalLinkAltIcon />}
              >
                {t('layout.documentation-name')}
              </DropdownItem>
              <DropdownItem onClick={() => setIsAboutOpen(!isAboutOpen)} key="about" component="button">
              <DropdownItem onClick={() => setIsAboutOpen(!isAboutOpen)} key="about" component="button">
                {t('layout.about-name')}
              </DropdownItem>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem>
            <Switch
              id="darkThemeSwitch"
              isChecked={theme === 'dark'}
              onChange={toggleTheme}
              ouiaId="DarkThemeOuiaId"
              label={t('layout.dark-theme')}
              className="darkThemeSwitch"
            />
          </ToolbarItem>
        </ToolbarGroup>
        {!ConsoleServices.authentication().isNotSecured() && userActions()}
      </ToolbarContent>
    </Toolbar>
  );

  const Header = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton variant="plain" aria-label="Global navigation">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand component={(props) => Logo} />
      </MastheadMain>
      <MastheadContent>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const PageSkipToContent = <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>;

  const create = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);

  // The menu for non admin users
  const filteredRoutes = routes.filter((route) => !route.readonlyUser || (!create && route.readonlyUser));

  const displayNavMenu = (route: IAppRoute): boolean => {
    return (
      route.menu == true &&
      route.label !== undefined &&
      (!route.admin || (route.admin && ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)))
    );
  };

  const isCurrentActiveNavItem = (route: IAppRoute) => {
    if (pathname == route.path) {
      return true;
    }

    let isSubRoute = false;
    if (route.subRoutes != null) {
      for (let i = 0; i < route.subRoutes.length; i++) {
        if (pathname.includes(route.subRoutes[i])) {
          isSubRoute = true;
          break;
        }
      }
    }
    return isSubRoute;
  };

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      <NavList id="nav-list-simple">
        {filteredRoutes.map(
          (route, idx) =>
            displayNavMenu(route) && (
              <NavItem key={`${route.label}-${idx}`} id={`${route.label}-${idx}`}>
                <NavLink
                  caseSensitive={true}
                  to={route.path + location.search}
                  className={isCurrentActiveNavItem(route) ? 'pf-m-current' : ''}
                >
                  {route.label}
                </NavLink>
              </NavItem>
            )
        )}
      </NavList>
    </Nav>
  );

  const displayPage = () => {
    if (init == 'PENDING') {
      return (
        <Page mainContainerId="primary-app-container">
          <ErrorBoundary>
            <Spinner />
          </ErrorBoundary>
        </Page>
      );
    }

    if ((init == 'NOT_READY' || init == 'SERVER_ERROR') && !ConsoleServices.isWelcomePage()) {
      return <Navigate to="/welcome" />;
    }

    return (
      <Page
        mainContainerId="primary-app-container"
        header={isWelcomePage ? null : Header}
        skipToContent={PageSkipToContent}
        sidebar={
          isWelcomePage ? null : (
            <PageSidebar theme="dark">
              <PageSidebarBody>{Navigation}</PageSidebarBody>
            </PageSidebar>
          )
        }
        isManagedSidebar
      >
        <ActionResponseAlert />
        <BannerAlert />
        <ErrorBoundary>{children}</ErrorBoundary>
        <About isModalOpen={isAboutOpen} closeModal={() => setIsAboutOpen(false)} />
      </Page>
    );
  };
  return <APIAlertProvider>{displayPage()}</APIAlertProvider>;
};

export { AppLayout };
