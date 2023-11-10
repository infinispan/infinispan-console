import React, { useEffect, useState } from 'react';
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
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { RoleGeneral } from '@app/AccessManagement/RoleDetailContent/RoleGeneral';
import { RolePermissions } from '@app/AccessManagement/RoleDetailContent/RolePermissions';
import { RoleCaches } from '@app/AccessManagement/RoleDetailContent/RoleCaches';
import { DeleteRole } from '@app/AccessManagement/DeleteRole';
import { useDescribeRole } from '@app/services/rolesHook';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

const RoleDetail = () => {
  const navigate = useNavigate();
  const roleName = useParams()['roleName'] as string;
  const { t } = useTranslation();
  const { role, loading } = useDescribeRole(roleName);
  const [activeTabKey, setActiveTabKey] = useState<'general' | 'permissions' | 'caches'>('general');
  const [showGeneralDescription, setShowGeneralDescription] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showCaches, setShowCaches] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteRole, setIsDeleteRole] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setIsOpen(false);
  };

  useEffect(() => {
    setShowGeneralDescription(activeTabKey === 'general');
    setShowPermissions(activeTabKey === 'permissions');
    setShowCaches(activeTabKey === 'caches');
  }, [activeTabKey]);

  interface AccessTab {
    key: string;
    name: string;
  }

  const handleTabClick = (event, nav) => {
    setActiveTabKey(nav.itemId);
  };

  const tabs: AccessTab[] = [
    { name: t('access-management.role.tab-general'), key: 'general' },
    { name: t('access-management.role.tab-permissions'), key: 'permissions' },
    { name: t('access-management.role.tab-caches'), key: 'caches' }
  ];

  const buildTabs = () => {
    return (
      <Nav data-cy="navigationTabs" onSelect={handleTabClick} variant={'tertiary'}>
        <NavList>
          {tabs.map((tab) => (
            <NavItem
              aria-label={'nav-item-' + tab.key}
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

  const displayActions = () => {
    if (!role || role.implicit) {
      return;
    }

    return (
      <ToolbarGroup align={{ default: 'alignRight' }}>
        <ToolbarItem>
          <Dropdown
            isOpen={isOpen}
            onSelect={onSelect}
            onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
                {t('access-management.role.actions')}
              </MenuToggle>
            )}
            ouiaId="roleDetailDropdown"
            shouldFocusToggleOnSelect
          >
            <DropdownList>
              <DropdownItem value={0} key="deleteRole" onClick={() => setIsDeleteRole(true)}>
                {t('common.actions.delete')}
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </ToolbarItem>
      </ToolbarGroup>
    );
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.light} style={{ paddingBottom: 0 }}>
        <DataContainerBreadcrumb
          parentPage={'/access-management'}
          label={'access-management.title'}
          currentPage={t('access-management.role.breadcrumb', { roleName: roleName })}
        />
        <Toolbar id="role-detail-toolbar">
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>{role?.name}</Text>
                </TextContent>
              </ToolbarItem>
            </ToolbarGroup>
            {displayActions()}
          </ToolbarContent>
        </Toolbar>
        {buildTabs()}
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        <Card>
          <CardBody>
            {showGeneralDescription && <RoleGeneral name={roleName} />}
            {showPermissions && <RolePermissions name={roleName} />}
            {showCaches && <RoleCaches name={roleName}/>}
          </CardBody>
        </Card>
      </PageSection>
      <DeleteRole
        name={roleName}
        isModalOpen={isDeleteRole}
        submitModal={() => {
          setIsDeleteRole(false);
          navigate('/access-management');
        }}
        closeModal={() => {
          setIsDeleteRole(false);
        }}
      />
    </>
  );
};

export { RoleDetail };
