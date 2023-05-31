import React, { useEffect, useState } from 'react';

import {
  Brand,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownToggle,
  DropdownPosition,
  Flex,
  FlexItem,
  Nav,
  NavItem,
  NavList,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  Page,
  PageToggleButton,
  PageSidebar,
  SkipToContent,
  Spinner,
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
import { Link, NavLink, Redirect } from 'react-router-dom';
import { routes } from '@app/routes';
import { APIAlertProvider } from '@app/providers/APIAlertProvider';
import { ActionResponseAlert } from '@app/Common/ActionResponseAlert';
import { useHistory } from 'react-router';
import { global_spacer_sm } from '@patternfly/react-tokens';
import { About } from '@app/About/About';
import { ErrorBoundary } from '@app/ErrorBoundary';
import { BannerAlert } from '@app/Common/BannerAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { KeycloakService } from '@services/keycloakService';
import { BarsIcon, ExternalLinkAltIcon, InfoCircleIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { ConsoleACL } from '@services/securityService';

interface IAppLayout {
  init: string;
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ init, children }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const history = useHistory();
  const { connectedUser } = useConnectedUser();

  const [isWelcomePage, setIsWelcomePage] = useState(ConsoleServices.isWelcomePage());
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    history.listen((location, action) => {
      const isWelcomePage = location.pathname == '/welcome';
      setIsWelcomePage(isWelcomePage);
    });
  }, []);

  const Logo = (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem style={{ marginTop: global_spacer_sm.value }}>
        <Link to={{ pathname: '/', search: location.search }}>
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

  const userDropdownItems = [
    <DropdownGroup key="user-action-group">
      <DropdownItem
        key="user-action-group-1 logout"
        onClick={() => {
          if (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated()) {
            KeycloakService.Instance.logout(ConsoleServices.landing());
          } else {
            ConsoleServices.authentication().logOutLink();
            history.push('/welcome');
            window.location.reload();
          }
        }}
      >
        Logout
      </DropdownItem>
    </DropdownGroup>
  ];

  const userActions = () => {
    const chromeAgent = navigator.userAgent.toString().indexOf('Chrome') > -1;
    if (chromeAgent || (KeycloakService.Instance.isInitialized() && KeycloakService.Instance.authenticated())) {
      return (
        <ToolbarItem>
          <Dropdown
            isFullHeight
            onSelect={() => setIsDropdownOpen(!isDropdownOpen)}
            isOpen={isDropdownOpen}
            toggle={
              <DropdownToggle onToggle={() => setIsDropdownOpen(!isDropdownOpen)}>{connectedUser.name}</DropdownToggle>
            }
            dropdownItems={userDropdownItems}
          />
        </ToolbarItem>
      );
    }
    return (
      <ToolbarItem>
        {connectedUser.name}
        <Tooltip position="left" content={<Text>Close the browser or open an incognito window to log again.</Text>}>
          <span aria-label="Close the browser or open an incognito window to log again." tabIndex={0}>
            <InfoCircleIcon style={{ marginLeft: global_spacer_sm.value, marginTop: global_spacer_sm.value }} />
          </span>
        </Tooltip>
      </ToolbarItem>
    );
  };

  const helpDropdownItems = [
    <DropdownItem
      onClick={() => window.open('https://infinispan.org/documentation/', '_blank')}
      key="documentation"
      icon={<ExternalLinkAltIcon />}
    >
      Documentation
    </DropdownItem>,
    <DropdownItem onClick={() => setIsAboutOpen(!isAboutOpen)} key="about" component="button">
      About
    </DropdownItem>
  ];

  const headerToolbar = (
    <Toolbar id="toolbar" isFullHeight isStatic>
      <ToolbarContent>
        <ToolbarGroup
          variant="icon-button-group"
          alignment={{ default: 'alignRight' }}
          spacer={{ default: 'spacerNone', md: 'spacerMd' }}
        >
          <ToolbarItem>
            <Dropdown data-cy="aboutInfoQuestionMark" id="aboutInfoQuestionMark"
              position={DropdownPosition.right}
              isPlain
              onSelect={() => setIsHelpOpen(!isHelpOpen)}
              isOpen={isHelpOpen}
              toggle={
                <DropdownToggle toggleIndicator={null} onToggle={() => setIsHelpOpen(!isHelpOpen)}>
                  <QuestionCircleIcon />
                </DropdownToggle>
              }
              dropdownItems={helpDropdownItems}
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
        <MastheadBrand>{Logo}</MastheadBrand>
      </MastheadMain>
      <MastheadContent>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const PageSkipToContent = <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>;

  const create = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);

  // The menu for non admin users
  const filteredRoutes = routes.filter((route) => !route.readonlyUser || (!create && route.readonlyUser));

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      <NavList id="nav-list-simple">
        {filteredRoutes.map(
          (route, idx) =>
            route.menu &&
            route.label && (
              <NavItem key={`${route.label}-${idx}`} id={`${route.label}-${idx}`}>
                <NavLink
                  exact
                  to={route.path + history.location.search}
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
      return <Redirect to="/welcome" />;
    }

    return (
      <Page
        mainContainerId="primary-app-container"
        header={isWelcomePage ? null : Header}
        skipToContent={PageSkipToContent}
        sidebar={isWelcomePage ? null : <PageSidebar theme="dark" nav={Navigation} />}
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
