import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Divider,
  EmptyState,
  EmptyStateBody,
  Label,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ActionsColumn, ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useLocalStorage } from '@utils/localStorage';
import { ThemeContext } from '@app/providers/ThemeProvider';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useSearch } from '@app/services/searchHook';
import displayUtils from '@services/displayUtils';
import { ContentType } from '@services/infinispanRefData';
import { FlagIcon } from '@patternfly/react-icons';

const QueryHistory = (props: { cacheName: string; changeTab: () => void }) => {
  const { t } = useTranslation();
  const { syntaxHighLighterTheme } = useContext(ThemeContext);
  const { onStoreQuery } = useSearch(props.cacheName);
  const [history, setHistory] = useLocalStorage<HistoryMap>('cache-query-history', {});
  const currentHistory = useMemo(() => history[props.cacheName] || [], [history, props.cacheName]);
  const [expandedQueries, setExpandedQueries] = useState<string[]>([]);
  const [queryHistoryPagination, setQueryHistoryPagination] = useLocalStorage('query-history-table', {
    page: 1,
    perPage: 10
  });

  const onSetPage = (_event, pageNumber) => {
    setQueryHistoryPagination({
      ...queryHistoryPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setQueryHistoryPagination({
      page: 1,
      perPage: perPage
    });
  };

  const columnNames = {
    query: t('caches.query.history.query'),
    total: t('caches.query.history.total'),
    execution: t('caches.query.history.execution')
  };

  const emptySearchMessage = (
    <EmptyState>
      <EmptyStateBody>{t('caches.query.history.empty')}</EmptyStateBody>
    </EmptyState>
  );

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="queryHistoryPaginationArea"
        itemCount={currentHistory.length}
        perPage={queryHistoryPagination.perPage}
        page={queryHistoryPagination.page}
        onSetPage={onSetPage}
        widgetId="pagination-query-history"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  const getSlice = () => {
    return (queryHistoryPagination.page - 1) * queryHistoryPagination.perPage;
  };

  const toolbar = (
    <Toolbar id="cache-query-history-toolbar" style={{ paddingLeft: 0 }}>
      <ToolbarContent>
        <ToolbarItem>
          <Button
            variant={ButtonVariant.danger}
            size={'sm'}
            onClick={() =>
              setHistory({
                ...history,
                [props.cacheName]: []
              })
            }
            data-cy="removeAllQueryHistory"
          >
            {t('caches.query.history.clear')}
          </Button>
        </ToolbarItem>
        <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const deleteHistoryItem = (query: string) => {
    setHistory({
      ...history,
      [props.cacheName]: currentHistory.filter((item) => item.query !== query)
    });
  };

  const executeQuery = (query: string) => {
    props.changeTab();
    onStoreQuery(query);
  };

  const actions = (query: string) => {
    return [
      {
        'aria-label': 'executeQueryHistoryItem',
        title: t('caches.query.history.execute'),
        onClick: () => executeQuery(query)
      },
      {
        'aria-label': 'deleteQueryHistoryItem',
        title: t('caches.query.history.delete'),
        onClick: () => deleteHistoryItem(query)
      }
    ];
  };

  const isQueryExpanded = (query: string) => expandedQueries.includes(query);
  const toggleQueryExpanded = (query: string) => {
    setExpandedQueries((prev) => (prev.includes(query) ? prev.filter((q) => q !== query) : [...prev, query]));
  };
  const isQueryLong = (query: string) => query.length > 100;
  const isExpandable = (historyItem: QueryHistoryItem) => isQueryLong(historyItem.query) || historyItem.error;

  const historyTypeColor = (queryType: 'Search' | 'Delete' | 'Vector') => {
    if (queryType == 'Vector') {
      return 'purple';
    }

    if (queryType == 'Delete') {
      return 'red';
    }

    return 'blue';
  };

  const displayError = (historyItem: QueryHistoryItem) => {
    if (!historyItem.error) {
      return <></>;
    }

    return (
      <Alert title={t('caches.query.history.error-detail')} variant={'danger'} isInline isPlain>
        {historyItem.cause}
      </Alert>
    );
  };
  const displayContent = () => {
    return (
      <React.Fragment>
        <Table
          hasAnimations
          isExpandable
          data-cy="queryHistoryTable"
          className={'query-history-table'}
          aria-label={'query-history-table-label'}
          variant="compact"
        >
          <Thead>
            <Tr>
              <Th screenReaderText="Row expansion" />
              <Th colSpan={1}>{columnNames.query}</Th>
              <Th colSpan={1}>{columnNames.total}</Th>
              <Th colSpan={1}>{columnNames.execution}</Th>
            </Tr>
          </Thead>
          {currentHistory.length == 0 ? (
            <Tbody>
              <Tr>
                <Td>{emptySearchMessage}</Td>
              </Tr>
            </Tbody>
          ) : (
            currentHistory.slice(getSlice(), getSlice() + queryHistoryPagination.perPage).map((historyItem, index) => {
              const longQuery = isQueryLong(historyItem.query);
              const expandable = isExpandable(historyItem);
              const expanded = isQueryExpanded(historyItem.query);
              const truncatedQuery = displayUtils.formatContentToDisplayWithTruncate(
                historyItem.query,
                ContentType.string
              );
              return (
                <Tbody key={index} isExpanded={expandable && expanded}>
                  <Tr>
                    <Td
                      expand={
                        expandable
                          ? {
                              rowIndex: index,
                              isExpanded: expanded,
                              onToggle: () => toggleQueryExpanded(historyItem.query),
                              expandId: index + '-expandable-query'
                            }
                          : undefined
                      }
                    />
                    <Td dataLabel={columnNames.query}>
                      <SyntaxHighlighter
                        wrapLines={true}
                        wrapLongLines={true}
                        lineProps={{
                          style: {
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap'
                          }
                        }}
                        style={syntaxHighLighterTheme}
                        useInlineStyles={true}
                      >
                        {longQuery ? truncatedQuery : historyItem.query}
                      </SyntaxHighlighter>
                      <Label isCompact color={historyTypeColor(historyItem.type)}>
                        {historyItem.type}
                      </Label>
                      {historyItem.error && (
                        <Label isCompact variant={'outline'} status={'danger'} style={{ marginLeft: '0.5rem' }}>
                          {t('caches.query.history.error')}
                        </Label>
                      )}
                    </Td>
                    <Td dataLabel={columnNames.total}>{historyItem.total}</Td>
                    <Td dataLabel={columnNames.execution}>{historyItem.milliseconds}</Td>
                    <Td isActionCell data-cy={`actions-${index}`}>
                      <ActionsColumn items={actions(historyItem.query)} />
                    </Td>
                  </Tr>
                  {expandable && (
                    <Tr isExpanded={expanded}>
                      <Td />
                      <Td colSpan={4}>
                        <ExpandableRowContent>
                          {longQuery && (
                            <SyntaxHighlighter
                              wrapLines={true}
                              wrapLongLines={true}
                              lineProps={{
                                style: {
                                  wordBreak: 'break-all',
                                  whiteSpace: 'pre-wrap'
                                }
                              }}
                              style={syntaxHighLighterTheme}
                              useInlineStyles={true}
                            >
                              {historyItem.query}
                            </SyntaxHighlighter>
                          )}
                          {displayError(historyItem)}
                        </ExpandableRowContent>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              );
            })
          )}
        </Table>
        <Toolbar id="query-history-table-toolbar" className={'query-history-table-display'}>
          <ToolbarItem variant="pagination">{toolbarPagination('up')}</ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        {toolbar}
        {displayContent()}
      </CardBody>
    </Card>
  );
};

export { QueryHistory };
