import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  Pagination,
  Spinner,
  Stack,
  StackItem,
  TextArea,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useApiAlert } from '@app/utils/useApiAlert';
import { global_FontSize_sm } from '@patternfly/react-tokens';
import { global_spacer_md } from '@patternfly/react-tokens';
import { TableEmptyState } from '@app/Common/TableEmptyState';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { CreateProtoSchema } from '@app/ProtoSchema/CreateProtoSchema';
import { DeleteSchema } from '@app/ProtoSchema/DeleteSchema';
import { useFetchProtobufSchemas } from '@app/services/protobufHooks';

/**
 * Protobuf Schemas display
 */
const ProtobufSchemasDisplay = (props: {
  setProtoSchemasCount: (number) => void;
  isVisible: boolean;
}) => {
  const protobufService = ConsoleServices.protobuf();
  const { connectedUser } = useConnectedUser();
  const { schemas, loading, setLoading, error } = useFetchProtobufSchemas();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const [schemasContent, setSchemasContent] = useState(
    new Map<string, string>()
  );
  const [filteredSchemas, setFilteredSchemas] = useState<ProtoSchema[]>([]);
  const [createSchemaFormOpen, setCreateSchemaFormOpen] =
    useState<boolean>(false);
  const [deleteSchemaModalOpen, setDeleteSchemaModalOpen] =
    useState<boolean>(false);
  const [deleteSchemaName, setDeleteSchemaName] = useState<string>('');
  const [editSchemaName, setEditSchemaName] = useState<string>('');
  const [editSchemaContent, setEditSchemaContent] = useState<string>('');
  const [schemasPagination, setSchemasPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    if (loading) {
      props.setProtoSchemasCount(schemas.length);
      const initSlice =
        (schemasPagination.page - 1) * schemasPagination.perPage;
      setFilteredSchemas(
        schemas.slice(initSlice, initSlice + schemasPagination.perPage)
      );
    }
  }, [loading, schemas]);

  useEffect(() => {
    const initSlice = (schemasPagination.page - 1) * schemasPagination.perPage;
    setFilteredSchemas(
      schemas.slice(initSlice, initSlice + schemasPagination.perPage)
    );
  }, [schemasPagination]);

  const loadSchema = (schemaName: string) => {
    protobufService.getSchema(schemaName).then((eitherResponse) => {
      if (eitherResponse.isRight()) {
        schemasContent.set(schemaName, eitherResponse.value);
      } else {
        schemasContent.set(
          schemaName,
          'An error occurred. Try closing the tab and opening it again.'
        );
        addAlert(eitherResponse.value);
      }
    });
  };

  const toggle = (schemaName) => {
    const index = expanded.indexOf(schemaName);
    const newExpanded =
      index >= 0
        ? [
            ...expanded.slice(0, index),
            ...expanded.slice(index + 1, expanded.length),
          ]
        : [...expanded, schemaName];
    setExpanded(newExpanded);
  };

  const closeDeleteSchemaModal = () => {
    setDeleteSchemaModalOpen(false);
    setDeleteSchemaName('');
    setLoading(true);
  };

  if (!props.isVisible) {
    return <span />;
  }

  const displayProtoError = (error: ProtoError | undefined) => {
    if (error) {
      return (
        <Alert
          isInline
          variant={AlertVariant.danger}
          title={error.message}
          className="alert-message"
        >
          <p>{error.cause}</p>
        </Alert>
      );
    }

    return (
      <Alert
        isInline
        variant={AlertVariant.success}
        title={''}
        className="alert-message"
      />
    );
  };

  const buildSchemaContent = (name) => {
    if (!schemasContent.get(name)) {
      loadSchema(name);
      return <Spinner size={'sm'} />;
    }

    if (editSchemaName != name) {
      return (
        <SyntaxHighlighter
          wrapLines={false}
          style={githubGist}
          useInlineStyles={true}
          showLineNumbers={true}
        >
          {schemasContent.get(name)}
        </SyntaxHighlighter>
      );
    }
    return (
      <TextArea
        id="schema-edit-area"
        data-cy="schemaEditArea"
        onChange={(v) => setEditSchemaContent(v)}
        value={editSchemaContent}
        validated={editSchemaContent.length > 0 ? 'default' : 'error'}
        style={{ fontSize: global_FontSize_sm.value }}
        rows={15}
      />
    );
  };

  const buildSchemaToolbar = (schemaName) => {
    if (
      !ConsoleServices.security().hasConsoleACL(
        ConsoleACL.CREATE,
        connectedUser
      )
    ) {
      return '';
    }

    return (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <Button
              isDisabled={
                editSchemaName == schemaName && editSchemaContent.length == 0
              }
              id={'edit-button-schema-' + schemaName}
              name={'edit-button-schema-' + schemaName}
              aria-label={'edit-button-schema-' + schemaName}
              variant={ButtonVariant.secondary}
              onClick={() => handleEdit(schemaName)}
            >
              {editSchemaName == schemaName
                ? t('schemas.save-button')
                : t('schemas.edit-button')}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              id={'delete-button-schema-' + schemaName}
              name={'delete-button-schema-' + schemaName}
              aria-label={'delete-button-schema-' + schemaName}
              variant={ButtonVariant.link}
              onClick={() => {
                if (editSchemaName == schemaName) {
                  setEditSchemaName('');
                } else {
                  setDeleteSchemaName(schemaName);
                  setDeleteSchemaModalOpen(true);
                }
              }}
            >
              {editSchemaName == schemaName
                ? t('schemas.cancel-button')
                : t('schemas.delete-button')}
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
  };

  const handleEdit = (schemaName: string) => {
    if (editSchemaName == '' || editSchemaName != schemaName) {
      setEditSchemaName(schemaName);
      setEditSchemaContent(schemasContent.get(schemaName) as string);
    } else {
      setEditSchemaName('');
      if (
        !schemasContent.has(schemaName) ||
        schemasContent.get(schemaName) == ''
      ) {
        return;
      }
      schemasContent.set(schemaName, editSchemaContent);
      protobufService
        .createOrUpdateSchema(schemaName, editSchemaContent, false)
        .then((eitherCreate) => {
          addAlert(eitherCreate);
          loadSchema(schemaName);
        })
        .then(() => setLoading(true));
    }
  };

  const buildSchemaList = () => {
    if (filteredSchemas.length == 0) {
      return (
        <TableEmptyState
          loading={loading}
          error={error}
          empty={t('schemas.empty')}
        />
      );
    }

    return (
      <DataList aria-label="data-list-proto-schemas">
        {filteredSchemas.map((protoSchema) => {
          return (
            <DataListItem
              id={'item-' + protoSchema.name}
              key={'key-' + protoSchema.name}
              aria-labelledby={protoSchema.name + '-list-item'}
              isExpanded={expanded.includes(protoSchema.name)}
            >
              <DataListItemRow>
                <DataListToggle
                  onClick={() => toggle(protoSchema.name)}
                  isExpanded={expanded.includes(protoSchema.name)}
                  id={protoSchema.name}
                  aria-label={'expand-schema-' + protoSchema.name}
                  aria-controls={'ex-' + protoSchema.name}
                />
                <DataListItemCells
                  dataListCells={[
                    <DataListCell
                      width={2}
                      key={'schema-name' + protoSchema.name}
                    >
                      {protoSchema.name}
                    </DataListCell>,
                    <DataListCell
                      width={4}
                      key={'schema-validation' + protoSchema.name}
                    >
                      {displayProtoError(protoSchema.error)}
                    </DataListCell>,
                    <DataListCell width={2}>
                      {expanded.includes(protoSchema.name)
                        ? buildSchemaToolbar(protoSchema.name)
                        : ''}
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
              <DataListContent
                aria-label="Primary content details"
                id={protoSchema.name}
                isHidden={!expanded.includes(protoSchema.name)}
                style={{ boxShadow: 'none' }}
              >
                {editSchemaName == protoSchema.name && (
                  <Alert
                    style={{ marginBottom: global_spacer_md.value }}
                    variant="warning"
                    title={t('schemas.edit-alert', {
                      schemaname: protoSchema.name,
                    })}
                  />
                )}
                {buildSchemaContent(protoSchema.name)}
              </DataListContent>
            </DataListItem>
          );
        })}
      </DataList>
    );
  };

  const buildCreateSchemaButton = () => {
    if (
      !ConsoleServices.security().hasConsoleACL(
        ConsoleACL.CREATE,
        connectedUser
      )
    ) {
      return '';
    }
    return (
      <ToolbarItem>
        <Button
          aria-label="create-schema-button"
          variant={'primary'}
          onClick={() => setCreateSchemaFormOpen(true)}
        >
          {t('schemas.create-button')}
        </Button>
      </ToolbarItem>
    );
  };

  const closeCreateSchemaModal = (createDone: boolean) => {
    if (createDone) {
      setLoading(true);
    }
    setCreateSchemaFormOpen(false);
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Toolbar id="schemas-table-toolbar">
          <ToolbarContent>
            {buildCreateSchemaButton()}
            <ToolbarItem variant={ToolbarItemVariant.pagination}>
              <Pagination
                data-cy="paginationArea"
                itemCount={schemas.length}
                perPage={schemasPagination.perPage}
                page={schemasPagination.page}
                onSetPage={(onSetPage, pageNumber) => {
                  setSchemasPagination({
                    page: pageNumber,
                    perPage: schemasPagination.perPage,
                  });
                }}
                widgetId="pagination-schemas"
                onPerPageSelect={(_event, perPage) =>
                  setSchemasPagination({
                    page: 1,
                    perPage: perPage,
                  })
                }
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </StackItem>
      <StackItem>{buildSchemaList()}</StackItem>
      <StackItem>
        <CreateProtoSchema
          isModalOpen={createSchemaFormOpen}
          closeModal={closeCreateSchemaModal}
        />
        <DeleteSchema
          schemaName={deleteSchemaName}
          isModalOpen={deleteSchemaModalOpen}
          closeModal={closeDeleteSchemaModal}
        />
      </StackItem>
    </Stack>
  );
};

export { ProtobufSchemasDisplay };
