import * as React from 'react';
import { useState } from 'react';
import {
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Nav,
  NavItem,
  NavList,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { RoleTableDisplay } from '@app/AccessManagement/RoleTableDisplay';
import { FlushRoleCacheModal } from '@app/AccessManagement/FlushRoleCacheModal';

const AccessManager = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [showRoles, setShowRoles] = useState(true);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFlushCache, setIsFlushCache] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setIsOpen(false);
  };

  interface AccessTab {
    key: string;
    name: string;
  }

  const handleTabClick = (ev, nav) => {
    const tabIndex = nav.itemId;
    setActiveTabKey(tabIndex);
    setShowRoles(tabIndex == '0');
    setShowAccessControl(tabIndex == '1');
  };
  const buildTabs = () => {
    const tabs: AccessTab[] = [{ name: t('access-management.tab-roles'), key: '0' }];

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

  const displayActions = (
    <ToolbarGroup align={{ default: 'alignRight' }}>
      <ToolbarItem>
        <Dropdown
          isOpen={isOpen}
          onSelect={onSelect}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} data-cy="aclActions" onClick={onToggleClick} isExpanded={isOpen}>
              {t('common.actions.actions')}
            </MenuToggle>
          )}
          ouiaId="accessManagementDropdown"
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            <DropdownItem
              value={0}
              key="flushCacheAction"
              data-cy="flushCacheAction"
              onClick={() => setIsFlushCache(true)}
            >
              {t('access-management.flush-cache-action')}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light} style={{ paddingBottom: 0 }}>
        <Toolbar id="access-management-toolbar">
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>{t('access-management.title')}</Text>
                  <Text component={TextVariants.p}>{t('access-management.description', { brandname: brandname })}</Text>
                </TextContent>
              </ToolbarItem>
            </ToolbarGroup>
            {displayActions}
          </ToolbarContent>
        </Toolbar>
        {buildTabs()}
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        {buildSelectedContent}
        <FlushRoleCacheModal
          isModalOpen={isFlushCache}
          closeModal={() => setIsFlushCache(false)}
          submitModal={() => {
            setIsFlushCache(false);
          }}
        />
      </PageSection>
    </React.Fragment>
  );
};

export { AccessManager };
