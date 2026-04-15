import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFetchProtobufSchemaDetailed } from '@app/hooks/protobufHooks';
import { useApiAlert } from '@app/utils/useApiAlert';
import { ConsoleServices } from '@services/ConsoleServices';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { DeleteSchema } from '@app/ProtoSchema/DeleteSchema';
import { PROTO_LANGUAGE_ID, registerProtobufLanguage } from './protoLanguage';
import { PageHeader } from '@patternfly/react-component-groups';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import './SchemaEditPage.css';

registerProtobufLanguage();

const SchemaEditPage = () => {
  const { schemaName } = useParams<{ schemaName: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addAlert } = useApiAlert();
  const { theme } = useContext(ThemeContext);
  const { schemaDetail, loading, error, reload } =
    useFetchProtobufSchemaDetailed(schemaName || '');
  const [editedContent, setEditedContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [deleteSchemaName, setDeleteSchemaName] = useState<string>('');

  useEffect(() => {
    if (schemaDetail) {
      setEditedContent(schemaDetail.content);
    }
  }, [schemaDetail]);

  const handleSave = () => {
    if (!schemaName || editedContent.length === 0) return;
    setSaving(true);
    ConsoleServices.protobuf()
      .createOrUpdateSchema(schemaName, editedContent, false)
      .then((actionResponse) => {
        addAlert(actionResponse);
        reload();
      })
      .finally(() => setSaving(false));
  };

  const handleCancel = () => {
    navigate('/schemas');
  };

  if (loading) {
    return (
      <PageSection>
        <Spinner size="lg" />
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Alert variant={AlertVariant.danger} title={error} />
      </PageSection>
    );
  }

  const hasCaches = schemaDetail && schemaDetail.caches.length > 0;
  const hasErrors = schemaDetail && schemaDetail.error !== null;

  const panelContent = (
    <DrawerPanelContent
      isResizable
      id="schema-info-panel"
      defaultSize="300px"
      minSize="200px"
    >
      <DrawerHead>
        <Title headingLevel="h3" size="md">
          {t('schemas.edit-page.validation-title')}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={() => setIsDrawerExpanded(false)} />
        </DrawerActions>
      </DrawerHead>
      <div style={{ padding: '0 1rem 1rem 1rem' }}>
        {hasErrors ? (
          <Alert
            isInline
            isPlain
            variant={AlertVariant.danger}
            title={t('schemas.edit-page.validation-errors')}
          >
            <p>{schemaDetail!.error!.message}</p>
            {schemaDetail!.error!.cause && <p>{schemaDetail!.error!.cause}</p>}
          </Alert>
        ) : (
          <Alert
            isInline
            isPlain
            variant={AlertVariant.success}
            title={t('schemas.edit-page.validation-valid')}
          />
        )}

        <Title headingLevel="h3" size="md" style={{ marginTop: '1.5rem' }}>
          {t('schemas.edit-page.dependent-caches-title')}
        </Title>
        <Content>
          <Content component="small">
            {hasCaches
              ? t('schemas.edit-page.dependent-caches-description')
              : t('schemas.edit-page.no-dependent-caches')}
          </Content>
        </Content>
        {hasCaches && (
          <Content component="ul">
            {schemaDetail!.caches.map((cacheName) => (
              <Content component="li" key={cacheName}>
                <Link to={'/cache/' + encodeURIComponent(cacheName)}>
                  {cacheName}
                </Link>
              </Content>
            ))}
          </Content>
        )}
      </div>
    </DrawerPanelContent>
  );

  const displayActions = (
    <Dropdown
      popperProps={{ position: 'right' }}
      isOpen={isActionsOpen}
      onSelect={() => setIsActionsOpen(false)}
      onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          data-cy="schemaEditActions"
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          isExpanded={isActionsOpen}
          icon={<CogIcon />}
        >
          {t('common.actions.actions')}
        </MenuToggle>
      )}
      ouiaId="schemaEditDropdown"
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem key="refresh" onClick={reload}>
          {t('common.actions.refresh')}
        </DropdownItem>
        <DropdownItem
          key="delete"
          onClick={() => setDeleteSchemaName(schemaName || '')}
        >
          {t('schemas.delete-button')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  return (
    <>
      <DataContainerBreadcrumb
        parentPage={'/schemas'}
        label={'schemas.edit-page.breadcrumb-schemas'}
        currentPage={schemaName}
      />
      <PageHeader
        title={t('schemas.edit-page.title')}
        subtitle={
          hasCaches
            ? t('schemas.edit-page.warning-dependent-caches', {
                schemaName,
              })
            : null
        }
        actionMenu={displayActions}
      />
      <PageSection
        className="schema-editor-section"
        isFilled
        padding={{ default: 'noPadding' }}
      >
        <Drawer isExpanded={isDrawerExpanded} position="end">
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody>
              <div id="schema-editor" data-cy="schema-editor">
                <CodeEditor
                  isLineNumbersVisible
                  isUploadEnabled
                  language={PROTO_LANGUAGE_ID as Language}
                  code={editedContent}
                  onCodeChange={(v) => setEditedContent(v)}
                  isDarkTheme={theme === DARK}
                />
              </div>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </PageSection>
      <PageSection variant="secondary" padding={{ default: 'padding' }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                onClick={handleSave}
                isDisabled={editedContent.length === 0 || saving}
                isLoading={saving}
                aria-label="save-schema-button"
              >
                {t('schemas.save-button')}
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.link}
                onClick={handleCancel}
                aria-label="cancel-edit-schema-button"
              >
                {t('schemas.cancel-button')}
              </Button>
            </ToolbarItem>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              {!isDrawerExpanded && (
                <ToolbarItem>
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={() => setIsDrawerExpanded(true)}
                    aria-label="toggle-info-panel"
                  >
                    {t('schemas.edit-page.info-panel-toggle')}
                  </Button>
                </ToolbarItem>
              )}
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <DeleteSchema
        schemaName={deleteSchemaName}
        isModalOpen={deleteSchemaName !== ''}
        closeModal={() => {
          setDeleteSchemaName('');
          if (deleteSchemaName !== '') {
            navigate('/schemas');
          }
        }}
      />
    </>
  );
};

export { SchemaEditPage };
