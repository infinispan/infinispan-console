import * as React from 'react';
import { useEffect, useState, useContext } from 'react';
import {
  Button,
  Bullseye,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  PageSectionVariants,
  Pagination,
  SearchInput,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateFooter
} from '@patternfly/react-core';
import { Thead, Tr, Th, Tbody, Td, ExpandableRowContent } from '@patternfly/react-table';
import { Table } from '@patternfly/react-table/deprecated';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useTranslation } from 'react-i18next';
import { SearchIcon, CubeIcon } from '@patternfly/react-icons';
import { useFetchCacheTemplates } from '@app/services/cachesHook';
import { TableErrorState } from '@app/Common/TableErrorState';
import { onSearch } from '@app/utils/searchFilter';
import { global_spacer_sm, global_spacer_md } from '@patternfly/react-tokens';
import { ThemeContext } from '@app/providers/ThemeProvider';

const DetailConfigurations: React.FunctionComponent<any> = (props) => {
  const { t } = useTranslation();
  const cmName = props.computedMatch.params.cmName;
  const { cacheTemplates, loading, error } = useFetchCacheTemplates(cmName);
  const [filteredTemplates, setFilteredTemplates] = useState<CacheConfig[]>([]);
  const [rows, setRows] = useState<(string | any)[]>([]);
  const [expandedTemplateNames, setExpandedRepoNames] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [pageConfigsPagination, setCacheConfigsPagination] = useState({
    page: 1,
    perPage: 10
  });

  const {syntaxHighLighterTheme} = useContext(ThemeContext)

  useEffect(() => {
    setFilteredTemplates(cacheTemplates);
  }, [cacheTemplates]);

  useEffect(() => {
    if (filteredTemplates) {
      const initSlice = (pageConfigsPagination.page - 1) * pageConfigsPagination.perPage;
      const updateRows = filteredTemplates.slice(initSlice, initSlice + pageConfigsPagination.perPage);
      updateRows.length > 0 ? setRows(updateRows) : setRows([]);
    }
  }, [pageConfigsPagination, filteredTemplates]);

  useEffect(() => {
    setFilteredTemplates(cacheTemplates.filter((cache) => onSearch(searchValue, cache.name)));
  }, [searchValue]);

  const columnNames = {
    name: t('caches.configuration.title')
  };

  const isTemplateExpanded = (row) => expandedTemplateNames.includes(row.name);

  const setTemplateExpanded = (template, isExpanding = true) =>
    setExpandedRepoNames((prevExpanded) => {
      const otherExpandedRepoNames = prevExpanded.filter((r) => r !== template.name);
      return isExpanding ? [...otherExpandedRepoNames, template.name] : otherExpandedRepoNames;
    });

  const onSetPage = (_event, pageNumber) => {
    setCacheConfigsPagination({
      page: pageNumber,
      perPage: pageConfigsPagination.perPage
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setCacheConfigsPagination({
      page: pageConfigsPagination.page,
      perPage: perPage
    });
  };

  const emptyPage = (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        titleText={<>{t('caches.configuration.no-templates')}</>}
        icon={<EmptyStateIcon icon={CubeIcon} />}
        headingLevel="h4"
      />
      <EmptyStateBody>{t('caches.configuration.no-templates-body')}</EmptyStateBody>
    </EmptyState>
  );

  const searchInput = (
    <SearchInput
      placeholder="Filter by template name"
      value={searchValue}
      onChange={(_event, value) => setSearchValue(value)}
      onClear={() => setSearchValue('')}
    />
  );

  const toolbarPagination = (
    <Pagination
      data-cy="cacheTemplatePagination"
      itemCount={filteredTemplates.length}
      perPage={pageConfigsPagination.perPage}
      page={pageConfigsPagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-configs"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const toolbar = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem variant="search-filter">{searchInput}</ToolbarItem>
        {filteredTemplates.length !== 0 && <ToolbarItem variant="pagination">{toolbarPagination}</ToolbarItem>}
      </ToolbarContent>
    </Toolbar>
  );

  const buildCacheTemplatePage = () => {
    if (loading) {
      return (
        <Card>
          <CardBody>
            <Spinner size="xl" />
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardBody>
            <TableErrorState error={error} />
          </CardBody>
        </Card>
      );
    }

    if (cacheTemplates.length === 0) {
      return emptyPage;
    }

    return (
      <Card>
        <CardBody>
          {toolbar}
          <Table
            data-cy="cacheTemplatesTable"
            className={'cache-templates-table'}
            aria-label={'cache-templates-table-label'}
            variant="compact"
          >
            <Thead>
              <Tr>
                <Th colSpan={7}>{columnNames.name}</Th>
              </Tr>
            </Thead>
            {filteredTemplates.length == 0 ? (
              <Tbody>
                <Tr>
                  <Td colSpan={6}>
                    <Bullseye>
                      <EmptyState variant={EmptyStateVariant.sm}>
                        <EmptyStateHeader
                          titleText={<>{t('caches.configuration.no-filtered-templates')}</>}
                          icon={<EmptyStateIcon icon={SearchIcon} />}
                          headingLevel="h2"
                        />
                        <EmptyStateBody>{t('caches.configuration.no-filtered-templates-body')}</EmptyStateBody>
                        <EmptyStateFooter>
                          <EmptyStateActions style={{ marginTop: global_spacer_sm.value }}>
                            <Button variant={'link'} onClick={() => setSearchValue('')}>
                              {t('caches.configuration.clear-filter')}
                            </Button>
                          </EmptyStateActions>
                        </EmptyStateFooter>
                      </EmptyState>
                    </Bullseye>
                  </Td>
                </Tr>
              </Tbody>
            ) : (
              rows.map((row, rowIndex) => {
                return (
                  <Tbody key={row.name} isExpanded={isTemplateExpanded(row)}>
                    <Tr>
                      <Td
                        data-cy={row.name + 'Config'}
                        expand={
                          row.config
                            ? {
                                rowIndex,
                                isExpanded: isTemplateExpanded(row),
                                onToggle: () => setTemplateExpanded(row, !isTemplateExpanded(row))
                              }
                            : undefined
                        }
                      />
                      <Td dataLabel={columnNames.name}>{row.name}</Td>
                    </Tr>
                    {row.config ? (
                      <Tr isExpanded={isTemplateExpanded(row)}>
                        <Td />
                        <Td noPadding colSpan={1}>
                          <ExpandableRowContent data-cy={row.name + 'ConfigExpanded'}>
                            <SyntaxHighlighter
                              wrapLines={false}
                              style={syntaxHighLighterTheme}
                              useInlineStyles={true}
                              showLineNumbers={true}
                            >
                              {row.config}
                            </SyntaxHighlighter>
                          </ExpandableRowContent>
                        </Td>
                      </Tr>
                    ) : null}
                  </Tbody>
                );
              })
            )}
          </Table>
        </CardBody>
      </Card>
    );
  };

  const pageTitle = t('caches.configuration.page-title');

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb currentPage={pageTitle} />
        <Toolbar id="detail-config-header">
          <ToolbarContent style={{ paddingLeft: 0 }}>
            <TextContent>
              <Text component={TextVariants.h1}>{pageTitle}</Text>
            </TextContent>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <PageSection>{buildCacheTemplatePage()}</PageSection>
    </React.Fragment>
  );
};
export { DetailConfigurations };
