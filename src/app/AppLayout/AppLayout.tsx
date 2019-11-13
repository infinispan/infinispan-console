import * as React from 'react';
import {Brand, Page, PageHeader, SkipToContent} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/infinispan_icon.svg';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({children}) => {
  const logoProps = {
    href: '/',
    target: '_self'
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
      logo={<Brand src={icon} alt="Datagrid Management Console"/>}
      logoProps={logoProps}
      toolbar=""
      showNavToggle={false}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
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
      header={Header}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}>
      {children}
    </Page>
  );
}

export {AppLayout};
