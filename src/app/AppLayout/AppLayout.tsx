import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Brand,
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  KebabToggle,
  Page,
  PageHeader,
  SkipToContent,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/brand.svg';
import {chart_color_blue_500} from "@patternfly/react-tokens";
import {css} from '@patternfly/react-styles';
import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
import {Link} from "react-router-dom";
import dataContainerService from "../../services/dataContainerService";

interface IAppLayout {
  children: React.ReactNode;
  welcome: boolean;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({children, welcome}) => {
  const logoProps = {
    href: '/console/',
    target: '_self'
  };

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cacheManagerName, setCacheManagerName] = useState('');

  useEffect(() => {
    dataContainerService.getPrincipalCacheManagerName()
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

  const userDropdownItems = [
    <DropdownItem> <Link to={{
      pathname: '/caches/create',
      state: {
        cm: cacheManagerName,
      }
    }}><Button variant="link">Create cache</Button></Link>
    </DropdownItem>,
    <DropdownItem>
      <Link to={{
        pathname: 'container/' + cacheManagerName + '/configurations/',
        state: {
          cacheManager: cacheManagerName
        }
      }}> <Button variant="link">Display Configurations</Button>{' '}
      </Link>
    </DropdownItem>,
  ];

  const onDropdownSelect = (event) => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onDropdownToggle = (isDropdownOpen) => {
    setIsDropdownOpen(isDropdownOpen);
  };

  const PageToolbar = (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visible)}>
          <Dropdown
            isPlain
            position="right"
            onSelect={onDropdownSelect}
            isOpen={isDropdownOpen}
            toggle={isMobileView ? <KebabToggle onToggle={onDropdownToggle}/> :
              <DropdownToggle onToggle={onDropdownToggle}>Data management</DropdownToggle>}
            dropdownItems={userDropdownItems}
          />
        </ToolbarItem>
      </ToolbarGroup>
    </Toolbar>
  );

  const Header = (
    <PageHeader
      logo={<Brand src={icon} alt="Datagrid Management Console" style={{width: 600}}/>}
      logoProps={logoProps}
      toolbar={PageToolbar}
      showNavToggle={false}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
      style={{backgroundColor: chart_color_blue_500.value}}
    />
  );

  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">
      Skip to Content
    </SkipToContent>
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      header={welcome ? null : Header}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}>
      {children}
    </Page>
  );
}

export {AppLayout};
