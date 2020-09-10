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
  Flex,
  FlexItem,
  Pagination,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextArea,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {useApiAlert} from "@app/utils/useApiAlert";
import protobufService from "../../services/protobufService";
import {
  global_danger_color_100,
  global_FontSize_sm,
  global_spacer_md,
  global_success_color_100
} from "@patternfly/react-tokens";
import {AlertIcon} from "@patternfly/react-core/dist/js/components/Alert/AlertIcon";
import {CreateProtoSchema} from "@app/CacheManagers/CreateProtoSchema";
import {DeleteSchema} from "@app/CacheManagers/DeleteSchema";
import displayUtils from "../../services/displayUtils";
import {TableEmptyState} from "@app/Common/TableEmptyState";

/**
 * Protobuf Schemas display
 */
const ProtobufSchemasDisplay = (props: {
  setProtoSchemasCount: (number) => void;
  isVisible: boolean;
}) => {
  const { addAlert } = useApiAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schemas, setSchemas] = useState<ProtoSchema[]>([]);
  const [schemasContent, setSchemasContent] = useState(new Map<string, string>());
  const [filteredSchemas, setFilteredSchemas] = useState<ProtoSchema[]>([]);
  const [createSchemaFormOpen, setCreateSchemaFormOpen] = useState<boolean>(false);
  const [deleteSchemaModalOpen, setDeleteSchemaModalOpen] = useState<boolean>(false);
  const [deleteSchemaName, setDeleteSchemaName] = useState<string>('')
  const [editSchemaName, setEditSchemaName] = useState<string>('')
  const [schemasPagination, setSchemasPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    loadSchemas();
  }, [props.isVisible]);

  const loadSchemas = () => {
    protobufService.getProtobufSchemas().then(eitherResponse => {
      if(eitherResponse.isRight()) {
        setSchemas(eitherResponse.value);
        props.setProtoSchemasCount(eitherResponse.value.length);
        const initSlice = (schemasPagination.page - 1) * schemasPagination.perPage;
        setFilteredSchemas(eitherResponse.value.slice(initSlice, initSlice + schemasPagination.perPage));
      } else {
        addAlert(eitherResponse.value);
        setError(eitherResponse.value.message);
      }
      setLoading(false);
    })
  };

  const loadSchema = (schemaName: string) => {
    protobufService.getSchema(schemaName).then(eitherResponse => {
      if(eitherResponse.isRight()) {
        schemasContent.set(schemaName, eitherResponse.value);
      } else {
        schemasContent.set(schemaName, 'An error occurred. Retry closing and opening the tab again.');
        addAlert(eitherResponse.value);
      }
    });
  };

  const toggle = schemaName => {
    const index = expanded.indexOf(schemaName);
    const newExpanded =
      index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, schemaName];
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
      perPage: schemasPagination.perPage
    });
    const initSlice = (pageNumber - 1) * schemasPagination.perPage;
    setFilteredSchemas(schemas.slice(initSlice, initSlice + schemasPagination.perPage))
  };

  const onPerPageSelect = (_event, perPage) => {
    setSchemasPagination({
      page: schemasPagination.page,
      perPage: perPage
    });
    const initSlice = (schemasPagination.page - 1) * perPage;
    setFilteredSchemas(schemas.slice(initSlice, initSlice + schemasPagination.perPage))
  };

  if (!props.isVisible) {
    return <span />;
  }

  const displayProtoError = (error: (ProtoError | undefined)) => {
    if(error) {
      return (
            <Alert isInline variant={AlertVariant.danger} title={error.message} className="alert-message">
              <p>{error.cause}</p>
            </Alert>
      );
    }

    return (
      <Alert isInline variant={AlertVariant.success} title={''} className="alert-message"/>
    );
  };

  const buildSchemaContent = (name) => {
    if(!schemasContent.get(name)) {
      loadSchema(name);
      return <Spinner size={"sm"}/>
    }

    if(editSchemaName != name) {
      return (
        <SyntaxHighlighter wrapLines={false} style={githubGist}
                           useInlineStyles={true}
                           showLineNumbers={true}>
          {schemasContent.get(name)}
        </SyntaxHighlighter>
      )
    }
    return (
      <TextArea onChange={v => setSchemasContent(new Map(schemasContent.set(name, v)))}
                value={schemasContent.get(name)}
                aria-label={'text-area-' + name}
                isRequired={true}
                style={{fontSize:global_FontSize_sm.value}}
                rows={15}/>
    );
  };

  const handleEdit = (name: string) => {
    if(editSchemaName == '' || editSchemaName != name) {
      setEditSchemaName(name);
    } else {
      setEditSchemaName('');
      if(!schemasContent.has(name) || schemasContent.get(name) == '') {
        return;
      }
      protobufService.createOrUpdateSchema(name, schemasContent.get(name) as string, false).then(eitherCreate => {
        addAlert(eitherCreate.value);
        loadSchemas();
      })
    }
  };

  const buildSchemaList = () => {
    if(filteredSchemas.length == 0) {
      return (
        <TableEmptyState loading={loading} error={error} empty={'There are no Proto Schemas'}/>
      );
    }

    return (
      <DataList aria-label="Data list Protobuf Schemas">
        {filteredSchemas.map(protoSchema => {
          return (
            <DataListItem  key={'key-' + protoSchema.name} aria-labelledby={protoSchema.name + '-list-item'} isExpanded={expanded.includes(protoSchema.name)}>
            <DataListItemRow>
              <DataListToggle
                onClick={() => toggle(protoSchema.name)}
                isExpanded={expanded.includes(protoSchema.name)}
                id={protoSchema.name}
                aria-controls={'ex-' + protoSchema.name}
              />
              <DataListItemCells
                dataListCells={[
                  <DataListCell width={2} key={'schema-name' + protoSchema.name}>{protoSchema.name}</DataListCell>,
                  <DataListCell width={4} key={'schema-validation' + protoSchema.name}>{displayProtoError(protoSchema.error)}</DataListCell>,
                ]}
              />
            </DataListItemRow>
            <DataListContent
              aria-label="Primary Content Details"
              id={protoSchema.name}
              isHidden={!expanded.includes(protoSchema.name)}
              style={{boxShadow: 'none'}}
            >
              {buildSchemaContent(protoSchema.name)}
              <Divider component={DividerVariant.hr}
                       style={{
                         marginBottom: global_spacer_md.value,
                         marginTop: global_spacer_md.value}}/>
              <Toolbar>
                <ToolbarGroup>
                  <ToolbarItem>
                    <Button variant={ButtonVariant.secondary}
                            onClick={() => handleEdit(protoSchema.name)}>
                      {editSchemaName == protoSchema.name? 'Save' : 'Edit'}
                    </Button>
                  </ToolbarItem>
                  <ToolbarItem>
                    <Button variant={ButtonVariant.link}
                            onClick={() => {
                              if (editSchemaName == protoSchema.name) {
                                setEditSchemaName('');
                              } else {
                                setDeleteSchemaName(protoSchema.name);
                                setDeleteSchemaModalOpen(true);
                              }
                            }}>
                      {editSchemaName == protoSchema.name? 'Cancel' : 'Delete'}
                    </Button>
                  </ToolbarItem>
                </ToolbarGroup>
              </Toolbar>
            </DataListContent>
          </DataListItem>
          );
        })}
      </DataList>
    )
  };

  const buildCreateSchemaButton = () => {
    return (
        <Button variant={'primary'} onClick={() => setCreateSchemaFormOpen(true)}>Create Protobuf Schema</Button>
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
            <ToolbarItem>{buildCreateSchemaButton()}</ToolbarItem>
            <ToolbarItem  variant={ToolbarItemVariant.pagination}>
              <Pagination
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
        <CreateProtoSchema isModalOpen={createSchemaFormOpen} closeModal={closeCreateSchemaModal}/>
        <DeleteSchema schemaName={deleteSchemaName} isModalOpen={deleteSchemaModalOpen} closeModal={closeDeleteSchemaModal}/>
      </StackItem>
    </Stack>
  );
};

export {ProtobufSchemasDisplay};
