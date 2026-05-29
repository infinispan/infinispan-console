import React, { useContext, useEffect, useState } from 'react';

import {
  Brand,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
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
  PageToggleButton,
  SkipToContent,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
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
import {
  useAppInitState,
  useConnectedUser,
} from '@app/hooks/userManagementHook';
import { KeycloakService } from '@services/keycloakService';
import {
  EllipsisVIcon,
  ExternalLinkAltIcon,
  MoonIcon,
  OutlinedArrowAltCircleRightIcon,
  QuestionCircleIcon,
  ShieldAltIcon,
  SunIcon,
  UserIcon,
  UsersIcon,
} from '@patternfly/react-icons';
import { ConsoleACL } from '@services/securityService';
import { DARK, LIGHT, ThemeContext } from '@app/providers/ThemeProvider';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { LanguageSelector } from '@app/Common/LanguageSelector';

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

  const [isWelcomePage, setIsWelcomePage] = useState(
    ConsoleServices.isWelcomePage(),
  );
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const [isFullKebabOpen, setIsFullKebabOpen] = useState(false);

  useEffect(() => {
    setIsWelcomePage(pathname == '/welcome');
  }, [pathname]);

  const Logo = (
    <Brand
      src={theme == DARK ? brandDark : brandLight}
      alt={t('layout.console-name')}
      widths={{ default: '150px' }}
    >
      <source srcSet={theme == DARK ? brandDark : brandLight} />
    </Brand>
  );

  const isAdmin = ConsoleServices.security().hasConsoleACL(
    ConsoleACL.ADMIN,
    connectedUser,
  );

  const handleLogout = () => {
    if (
      KeycloakService.Instance.isInitialized() &&
      KeycloakService.Instance.authenticated()
    ) {
      KeycloakService.Instance.logout(ConsoleServices.landing());
    } else {
      ConsoleServices.authentication().logOutLink();
      navigate('/welcome');
      window.location.reload();
    }
  };

  const isSecured = !ConsoleServices.authentication().isNotSecured();
  const showUserDropdown =
    isSecured &&
    (navigator.userAgent.toString().indexOf('Chrome') > -1 ||
      (KeycloakService.Instance.isInitialized() &&
        KeycloakService.Instance.authenticated()));

  const userDropdownItems = (
    <>
      <DropdownItem
        key="view-permissions"
        icon={<ShieldAltIcon />}
        onClick={() => {
          navigate('/my-permissions');
        }}
      >
        {t('layout.view-my-permissions')}
      </DropdownItem>
      {isAdmin && (
        <DropdownItem
          key="access-management"
          icon={<UsersIcon />}
          onClick={() => {
            navigate('/access-management');
          }}
        >
          {t('routes.access-management')}
        </DropdownItem>
      )}
    </>
  );

  const helpAndAboutItems = (
    <>
      <DropdownItem
        onClick={() => window.open(t('brandname.documentation-link'), '_blank')}
        key="documentation"
        icon={<ExternalLinkAltIcon />}
      >
        {t('layout.documentation-name')}
      </DropdownItem>
      <DropdownItem
        onClick={() => setIsAboutOpen(true)}
        key="about"
        component="button"
      >
        {t('layout.about-name')}
      </DropdownItem>
    </>
  );

  const headerToolbar = (
    <Toolbar id="toolbar" isStatic>
      <ToolbarContent>
        <ToolbarGroup
          variant="label-group"
          visibility={{ default: 'hidden', lg: 'visible' }}
        >
          <ToolbarItem>
            <Content component={ContentVariants.h2}>
              {t('layout.console-name')}
            </Content>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup
          variant="action-group-plain"
          align={{ default: 'alignEnd' }}
          gap={{ default: 'gapNone', md: 'gapMd' }}
        >
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
          {/* Desktop: individual language + help items */}
          <ToolbarGroup
            variant="action-group-plain"
            visibility={{ default: 'hidden', lg: 'visible' }}
          >
            <LanguageSelector />
            <ToolbarItem>
              <Dropdown
                id="aboutInfoQuestionMark"
                onSelect={() => setIsHelpOpen(false)}
                popperProps={{ position: 'right' }}
                isOpen={isHelpOpen}
                onOpenChange={(open) => setIsHelpOpen(open)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    data-cy="aboutInfoQuestionMark"
                    variant={'plain'}
                    ref={toggleRef}
                    onClick={() => setIsHelpOpen(!isHelpOpen)}
                    isExpanded={isHelpOpen}
                  >
                    <QuestionCircleIcon />
                  </MenuToggle>
                )}
              >
                <DropdownList>{helpAndAboutItems}</DropdownList>
              </Dropdown>
            </ToolbarItem>
          </ToolbarGroup>
          {/* Medium screens: kebab with help items */}
          <ToolbarItem
            visibility={{ default: 'hidden', md: 'visible', lg: 'hidden' }}
          >
            <Dropdown
              isOpen={isKebabOpen}
              onSelect={() => setIsKebabOpen(false)}
              onOpenChange={(open) => setIsKebabOpen(open)}
              popperProps={{ position: 'right' }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsKebabOpen(!isKebabOpen)}
                  isExpanded={isKebabOpen}
                  variant="plain"
                  aria-label="Toolbar menu"
                  icon={<EllipsisVIcon />}
                />
              )}
            >
              <DropdownList>{helpAndAboutItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
          {/* Small screens: full kebab with user actions + help */}
          <ToolbarItem visibility={{ md: 'hidden' }}>
            <Dropdown
              isOpen={isFullKebabOpen}
              onSelect={() => setIsFullKebabOpen(false)}
              onOpenChange={(open) => setIsFullKebabOpen(open)}
              popperProps={{ position: 'right' }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsFullKebabOpen(!isFullKebabOpen)}
                  isExpanded={isFullKebabOpen}
                  variant="plain"
                  aria-label="Toolbar menu"
                  icon={<EllipsisVIcon />}
                />
              )}
            >
              {isSecured && showUserDropdown && (
                <DropdownGroup key="user-actions" aria-label="User actions">
                  <DropdownList>
                    {userDropdownItems}
                    <DropdownItem key="logout" onClick={handleLogout}>
                      {t('layout.logout')}
                    </DropdownItem>
                  </DropdownList>
                </DropdownGroup>
              )}
              {isSecured && showUserDropdown && <Divider />}
              <DropdownList>{helpAndAboutItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
          {/* User dropdown: visible on md+ */}
          {isSecured &&
            (showUserDropdown ? (
              <ToolbarItem visibility={{ default: 'hidden', md: 'visible' }}>
                <Dropdown
                  onSelect={() => setIsDropdownOpen(false)}
                  isOpen={isDropdownOpen}
                  onOpenChange={(open) => setIsDropdownOpen(open)}
                  popperProps={{ position: 'right' }}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      isExpanded={isDropdownOpen}
                      icon={<UserIcon />}
                    >
                      {connectedUser.name}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <DropdownList>{userDropdownItems}</DropdownList>
                  <Divider />
                  <DropdownList>
                    <DropdownItem key="logout" onClick={handleLogout}>
                      {t('layout.logout')}
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
            ) : (
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
            ))}
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
    <Masthead display={{ default: 'inline' }}>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton
            data-cy="sideBarToggle"
            variant="plain"
            isHamburgerButton
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

  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>
  );

  const create = ConsoleServices.security().hasConsoleACL(
    ConsoleACL.CREATE,
    connectedUser,
  );

  // The menu for non admin users
  const filteredRoutes = routes.filter(
    (route) => !route.readonlyUser || (!create && route.readonlyUser),
  );

  const displayNavMenu = (route: IAppRoute): boolean => {
    return (
      route.menu == true &&
      route.label !== undefined &&
      (!route.admin ||
        (route.admin &&
          ConsoleServices.security().hasConsoleACL(
            ConsoleACL.ADMIN,
            connectedUser,
          )))
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
                <NavItem
                  key={`${route.label}-${idx}`}
                  id={`${route.label}-${idx}`}
                >
                  <NavLink
                    itemID={route.id}
                    caseSensitive={true}
                    to={route.path + location.search}
                    className={
                      isCurrentActiveNavItem(route) ? 'pf-m-current' : ''
                    }
                  >
                    {t(route.label as string)}
                  </NavLink>
                </NavItem>
              ),
          )}
        </NavGroup>
        <NavGroup title={t('routes.devops-tools')}>
          <NavItem
            icon={<ExternalLinkAltIcon />}
            onClick={() => window.open(ConsoleServices.swaggerUi(), '_blank')}
          >
            {t('layout.swagger-ui')}
          </NavItem>
          <NavItem
            icon={<ExternalLinkAltIcon />}
            onClick={() =>
              window.open(ConsoleServices.metricsEndpoint(), '_blank')
            }
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

    if (
      (init == 'NOT_READY' || init == 'SERVER_ERROR') &&
      !ConsoleServices.isWelcomePage()
    ) {
      return <Navigate to="/welcome" />;
    }

    const Sidebar = (
      <PageSidebar>
        <PageSidebarBody>{Navigation}</PageSidebarBody>
      </PageSidebar>
    );

    return (
      <Page
        key="page-ready"
        mainContainerId="primary-app-container"
        masthead={isWelcomePage ? NoHeader : Header}
        isContentFilled
        defaultManagedSidebarIsOpen={false}
        isManagedSidebar
        skipToContent={isWelcomePage ? undefined : PageSkipToContent}
        sidebar={!isWelcomePage && Sidebar}
      >
        <ActionResponseAlert />
        <BannerAlert />
        <ErrorBoundary>{children}</ErrorBoundary>
        <About
          isModalOpen={isAboutOpen}
          closeModal={() => setIsAboutOpen(false)}
        />
      </Page>
    );
  };
  return displayPage();
};

export { AppLayout };
