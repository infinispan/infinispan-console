import * as React from 'react';
import { useState } from 'react';
import {
  Card,
  CardBody,
  Nav,
  NavItem,
  NavList,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { RoleTableDisplay } from '@app/AccessManagement/RoleTableDisplay';

const AccessManager = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [showRoles, setShowRoles] = useState(true);
  const [showAccessControl, setShowAccessControl] = useState(false);

  interface AccessTab {
    key: string;
    name: string;
  }
  const handleTabClick = (nav) => {
    const tabIndex = nav.itemId;
    setActiveTabKey(tabIndex);
    setShowRoles(tabIndex == '0');
    setShowAccessControl(tabIndex == '1');
  };
  const buildTabs = () => {
    const tabs: AccessTab[] = [
      { name: t('access-management.tab-roles'), key: '0' },
    ];

    return (
      <Nav data-cy="navigationTabs" onSelect={handleTabClick} variant={'tertiary'}>
        <NavList>
          {tabs.map((tab) => (
            <NavItem
              aria-label={'nav-item-' + tab.name}
              key={'nav-item-' + tab.key}
              itemId={tab.key}
              isActive={activeTabKey === tab.key}
            >
              {tab.name}
            </NavItem>
          ))}
        </NavList>
      </Nav>
    );
  };

  const buildSelectedContent = (
    <Card>
      <CardBody>
        {showRoles && <RoleTableDisplay />}
        {showAccessControl && <div>Access Control</div>}
      </CardBody>
    </Card>
  );

  return (
    <>
      <PageSection variant={PageSectionVariants.light} style={{ paddingBottom: 0 }}>
        <TextContent style={{ marginBottom: '1rem' }}>
          <Text component={TextVariants.h1}>{t('access-management.title')}</Text>
          <Text component={TextVariants.p}>{t('access-management.description', { brandname: brandname })}</Text>
        </TextContent>
        {buildTabs()}
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>{buildSelectedContent}</PageSection>
    </>
  );
};

export { AccessManager };
