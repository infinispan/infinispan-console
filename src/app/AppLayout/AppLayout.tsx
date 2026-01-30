import React, { useContext, useEffect, useState } from 'react';

import {
  Brand,
  Button,
  Content,
  ContentVariants,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  MenuToggleElement,
  Nav,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  SkipToContent,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import brandLight from '!!url-loader!@app/assets/images/brand.svg';
import brandDark from '!!url-loader!@app/assets/images/brand_dark.svg';
import { NavLink } from 'react-router-dom';
import { IAppRoute, routes } from '@app/routes';
import { ActionResponseAlert } from '@app/Common/ActionResponseAlert';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { About } from '@app/About/About';
import { ErrorBoundary } from '@app/ErrorBoundary';
import { BannerAlert } from '@app/Common/BannerAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useAppInitState, useConnectedUser } from '@app/services/userManagementHook';
import { KeycloakService } from '@services/keycloakService';
import {
  BarsIcon,
  ExternalLinkAltIcon,
  MoonIcon,
  OutlinedArrowAltCircleRightIcon,
  QuestionCircleIcon,
  SunIcon
} from '@patternfly/react-icons';
import { ConsoleACL } from '@services/securityService';
import { DARK, LIGHT, ThemeContext } from '@app/providers/ThemeProvider';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { LanguageSelector } from `@app/Common/LanguageSelector`;

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const { t } = useTranslation();
  const { init } = useAppInitState();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { connectedUser } = useConnectedUser();

  const [isWelcomePage, setIsWelcomePage] = useState(ConsoleServices.isWelcomePage());
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    setIsWelcomePage(pathname == '/welcome');
  }, [pathname]);

  const Logo = (
    <Brand src={theme == DARK ? brandDark : brandLight} alt={t('layout.console-name')} widths={{ default: '150px' }}>
      <source srcSet={theme == DARK ? brandDark : brandLight} />
    </Brand>
  );

  const userActions = () => {
    const chromeAgent = navigator.userAgent.toString().indexOf('Chrome') > -1;
    if (chromeAgent || (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated())) {
      return (
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
      );
    }
    return (
      <ToolbarGroup variant="label-group">
        <ToolbarItem>
          <PopoverHelp
            text={connectedUser.name}
            name={'close'}
            label={t('layout.logout')}
            content={t('layout.close-browser-message')}
            icon={<OutlinedArrowAltCircleRightIcon />}
          />
        </ToolbarItem>
      </ToolbarGroup>
    );
  };

  const headerToolbar = (
    <Toolbar id="toolbar" isFullHeight>
      <ToolbarContent>
        <ToolbarGroup variant="label-group">
          <ToolbarItem>
            <Content component={ContentVariants.h2}>{t('layout.console-name')}</Content>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup align={{ default: 'alignEnd' }}>
          <ToolbarItem>
            <ToggleGroup>
              <ToggleGroupItem
                icon={<SunIcon />}
                aria-label={'Light mode'}
                isSelected={theme == LIGHT}
                onChange={() => toggleTheme(true)}
                buttonId="themeLight"
              />
              <ToggleGroupItem
                icon={<MoonIcon />}
                isSelected={theme == DARK}
                aria-label={'Dark mode'}
                onChange={() => toggleTheme(false)}
                buttonId="themeDark"
              />
            </ToggleGroup>
          </ToolbarItem>
          <LanguageSelector />
          <ToolbarItem>
            <Dropdown
              id="aboutInfoQuestionMark"
              onSelect={() => setIsHelpOpen(!isHelpOpen)}
              popperProps={{ position: 'right' }}
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
                {t('layout.about-name')}
              </DropdownItem>
            </Dropdown>
          </ToolbarItem>
          {!ConsoleServices.authentication().isNotSecured() && userActions()}
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  const NoHeader = (
    <Masthead style={{ zIndex: 0 }}>
      <MastheadMain></MastheadMain>
    </Masthead>
  );

  const Header = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <Button
            data-cy="sideBarToggle"
            icon={<BarsIcon />}
            variant="plain"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Global navigation"
          />
        </MastheadToggle>
        <MastheadBrand>
          <MastheadLogo>{Logo}</MastheadLogo>
        </MastheadBrand>
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
    <Nav id="nav-primary-simple">
      <NavList id="nav-list-simple">
        <NavGroup title={t('routes.operations')}>
          {filteredRoutes.map(
            (route, idx) =>
              displayNavMenu(route) && (
                <NavItem key={`${route.label}-${idx}`} id={`${route.label}-${idx}`}>
                  <NavLink
                    itemID={route.id}
                    caseSensitive={true}
                    to={route.path + location.search}
                    className={isCurrentActiveNavItem(route) ? 'pf-m-current' : ''}
                  >
                    {t(route.label)}
                  </NavLink>
                </NavItem>
              )
          )}
        </NavGroup>
        <NavGroup title={t('routes.devops-tools')}>
          <NavItem icon={<ExternalLinkAltIcon />} onClick={() => window.open(ConsoleServices.swaggerUi(), '_blank')}>
            {t('layout.swagger-ui')}
          </NavItem>
          <NavItem
            icon={<ExternalLinkAltIcon />}
            onClick={() => window.open(ConsoleServices.metricsEndpoint(), '_blank')}
          >
            {t('layout.metrics')}
          </NavItem>
        </NavGroup>
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

    const Sidebar = (
      <PageSidebar>
        <PageSidebarBody>{Navigation}</PageSidebarBody>
      </PageSidebar>
    );

    return (
      <Page
        mainContainerId="primary-app-container"
        masthead={isWelcomePage ? NoHeader : Header}
        isContentFilled
        skipToContent={isWelcomePage ? undefined : PageSkipToContent}
        sidebar={!isWelcomePage && sidebarOpen && Sidebar}
      >
        <ActionResponseAlert />
        <BannerAlert />
        <ErrorBoundary>{children}</ErrorBoundary>
        <About isModalOpen={isAboutOpen} closeModal={() => setIsAboutOpen(false)} />
      </Page>
    );
  };
  return displayPage();
};

export { AppLayout };
