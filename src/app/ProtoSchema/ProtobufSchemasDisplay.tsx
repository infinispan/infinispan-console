import React, {useEffect, useState} from 'react';
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
  Divider,
  DividerVariant,
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
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {useApiAlert} from '@app/utils/useApiAlert';
import {global_FontSize_sm, global_spacer_md} from '@patternfly/react-tokens';
import {CreateProtoSchema} from '@app/ProtoSchema/CreateProtoSchema';
import {DeleteSchema} from '@app/ProtoSchema/DeleteSchema';
import {TableEmptyState} from '@app/Common/TableEmptyState';
import {useTranslation} from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";
import {useConnectedUser} from "@app/services/userManagementHook";
import {ConsoleACL} from "@services/securityService";

/**
 * Protobuf Schemas display
 */
const ProtobufSchemasDisplay = (props: {
  setProtoSchemasCount: (number) => void;
  isVisible: boolean;
}) => {
  const protobufService = ConsoleServices.protobuf();
  const {connectedUser} = useConnectedUser();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schemas, setSchemas] = useState<ProtoSchema[]>([]);
  const [schemasContent, setSchemasContent] = useState(
    new Map<string, string>()
  );
  const [filteredSchemas, setFilteredSchemas] = useState<ProtoSchema[]>([]);
  const [createSchemaFormOpen, setCreateSchemaFormOpen] = useState<boolean>(
    false
  );
  const [deleteSchemaModalOpen, setDeleteSchemaModalOpen] = useState<boolean>(
    false
  );
  const [deleteSchemaName, setDeleteSchemaName] = useState<string>('');
  const [editSchemaName, setEditSchemaName] = useState<string>('');
  const [schemasPagination, setSchemasPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
      if (props.isVisible || schemas.length == 0) {
        loadSchemas();
      }
  }, [props.isVisible]);

  const loadSchemas = () => {
    protobufService.getProtobufSchemas().then((eitherResponse) => {
      if (eitherResponse.isRight()) {
        setSchemas(eitherResponse.value);
        props.setProtoSchemasCount(eitherResponse.value.length);
        const initSlice =
          (schemasPagination.page - 1) * schemasPagination.perPage;
        setFilteredSchemas(
          eitherResponse.value.slice(
            initSlice,
            initSlice + schemasPagination.perPage
          )
        );
      } else {
        setError(eitherResponse.value.message);
      }
      setLoading(false);
    });
  };

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
    loadSchemas();
  };

  const onSetPage = (_event, pageNumber) => {
    setSchemasPagination({
      page: pageNumber,
      perPage: schemasPagination.perPage,
    });
    const initSlice = (pageNumber - 1) * schemasPagination.perPage;
    setFilteredSchemas(
      schemas.slice(initSlice, initSlice + schemasPagination.perPage)
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setSchemasPagination({
      page: schemasPagination.page,
      perPage: perPage,
    });
    const initSlice = (schemasPagination.page - 1) * perPage;
    setFilteredSchemas(
      schemas.slice(initSlice, initSlice + schemasPagination.perPage)
    );
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
      <TextArea data-cy="schemaEditArea"
        onChange={(v) =>
          setSchemasContent(new Map(schemasContent.set(name, v)))
        }
        value={schemasContent.get(name)}
        isRequired={true}
        style={{ fontSize: global_FontSize_sm.value }}
        rows={15}
      />
    );
  };

  const buildSchemaToolbar = (schemaName) => {
    if(!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return '';
    }

    return (
      <React.Fragment>
        <Divider
          component={DividerVariant.hr}
          style={{
            marginBottom: global_spacer_md.value,
            marginTop: global_spacer_md.value,
          }}
        />
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem>
              <Button
                id={'edit-button-schema-' +  schemaName}
                name={'edit-button-schema-' +  schemaName}
                aria-label={'edit-button-schema-' +  schemaName}
                variant={ButtonVariant.secondary}
                onClick={() => handleEdit(schemaName)}
              >
                {editSchemaName == schemaName ? 'Save' : 'Edit'}
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                id={'delete-button-schema-' +  schemaName}
                name={'delete-button-schema-' +  schemaName}
                aria-label={'delete-button-schema-' +  schemaName}
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
                  ? 'Cancel'
                  : 'Delete'}
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
      </React.Fragment>
    );
  }

  const handleEdit = (schemaName: string) => {
    if (editSchemaName == '' || editSchemaName != schemaName) {
      setEditSchemaName(schemaName);
    } else {
      setEditSchemaName('');
      if (!schemasContent.has(schemaName) || schemasContent.get(schemaName) == '') {
        return;
      }
      protobufService
        .createOrUpdateSchema(schemaName, schemasContent.get(schemaName) as string, false)
        .then((eitherCreate) => {
          addAlert(eitherCreate);
          loadSchemas();
        });
    }
  };

  const buildSchemaList = () => {
    if (filteredSchemas.length == 0) {
      return (
        <TableEmptyState
          loading={loading}
          error={error}
          empty={'No schemas yet'}
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
                  ]}
                />
              </DataListItemRow>
              <DataListContent
                aria-label="Primary content details"
                id={protoSchema.name}
                isHidden={!expanded.includes(protoSchema.name)}
                style={{ boxShadow: 'none' }}
              >
                {buildSchemaContent(protoSchema.name)}
                {buildSchemaToolbar(protoSchema.name)}
              </DataListContent>
            </DataListItem>
          );
        })}
      </DataList>
    );
  };

  const buildCreateSchemaButton = () => {
    if(!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return '';
    }
    return (
      <ToolbarItem>
        <Button aria-label="create-schema-button" variant={'primary'} onClick={() => setCreateSchemaFormOpen(true)}>
          Add Protobuf schema
        </Button>
      </ToolbarItem>
    );
  };

  const closeCreateSchemaModal = (createDone: boolean) => {
    if (createDone) {
      loadSchemas();
    }
    setCreateSchemaFormOpen(false);
  };

  return (
    <Stack>
      <StackItem>
        <Toolbar id="schemas-table-toolbar">
          <ToolbarContent>
            {buildCreateSchemaButton()}
            <ToolbarItem variant={ToolbarItemVariant.pagination}>
              <Pagination data-cy="paginationArea"
                itemCount={schemas.length}
                perPage={schemasPagination.perPage}
                page={schemasPagination.page}
                onSetPage={onSetPage}
                widgetId="pagination-schemas"
                onPerPageSelect={onPerPageSelect}
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
