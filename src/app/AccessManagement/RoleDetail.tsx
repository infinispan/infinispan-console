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
import { DeleteRole } from '@app/AccessManagement/DeleteRole';
import { useHistory } from 'react-router';
import { useDescribeRole } from '@app/services/rolesHook';

const RoleDetail = (props) => {
  const roleName = decodeURIComponent(props.computedMatch.params.roleName);
  const history = useHistory();
  const { t } = useTranslation();
  const { role } = useDescribeRole(roleName);
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [showGeneralDescription, setShowGeneralDescription] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  // const [showCaches, setShowCaches] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteRole, setIsDeleteRole] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setIsOpen(false);
  };

  useEffect(() => {
    setShowGeneralDescription(activeTabKey === '0');
    setShowPermissions(activeTabKey === '1');
    // setShowCaches(activeTabKey === '2');
  }, [activeTabKey]);

  interface AccessTab {
    key: string;
    name: string;
  }

  const handleTabClick = (event, nav) => {
    setActiveTabKey(nav.itemId);
  };

  const tabs: AccessTab[] = [
    { name: t('access-management.role.tab-general'), key: '0' },
    { name: t('access-management.role.tab-permissions'), key: '1' }
    // { name: t('access-management.role.tab-caches'), key: '2' }
  ];

  const buildTabs = () => {
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
                  <Text component={TextVariants.h1}>{roleName}</Text>
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
            {/*{showCaches && <RoleCaches />}*/}
          </CardBody>
        </Card>
      </PageSection>
      <DeleteRole
        name={roleName}
        isModalOpen={isDeleteRole}
        submitModal={() => {
          setIsDeleteRole(false);
          history.push('/access-management');
        }}
        closeModal={() => {
          setIsDeleteRole(false);
        }}
      />
    </>
  );
};

export { RoleDetail };
