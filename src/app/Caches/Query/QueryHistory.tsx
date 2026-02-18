import React, { Fragment, useContext, useMemo } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  ClipboardCopy,
  ClipboardCopyButton,
  ClipboardCopyVariant,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  EmptyState,
  EmptyStateBody,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ExpandableRowContent, Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { useLocalStorage } from '@utils/localStorage';
import { ThemeContext } from '@app/providers/ThemeProvider';
import SyntaxHighlighter from 'react-syntax-highlighter';

const QueryHistory = (props: { cacheName: string; changeTab: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { syntaxHighLighterTheme } = useContext(ThemeContext);
  const [history, setHistory] = useLocalStorage<HistoryMap>('cache-query-history', {});
  const currentHistory = useMemo(() => history[props.cacheName] || [], [history, props.cacheName]);
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
    value: 'Query'
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
            variant={ButtonVariant.primary}
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

  const clipboardCopyFunc = (event, text) => {
    navigator.clipboard.writeText(text.toString());
  };

  const onClick = (event, text) => {
    clipboardCopyFunc(event, text);
    // setCopied(true);
  };

  const displayContent = () => {
    return (
      <React.Fragment>
        <Table
          data-cy="queryHistoryTable"
          className={'query-history-table'}
          aria-label={'query-history-table-label'}
          variant="compact"
        >
          <Tbody>
            {currentHistory.length == 0 ? (
              <Tr>
                <Td>{emptySearchMessage}</Td>
              </Tr>
            ) : (
              currentHistory
                .slice(getSlice(), getSlice() + queryHistoryPagination.perPage)
                .map((historyItem, index) => {
                  return (
                    <Tr key={index} isContentExpanded={true}>
                      <Td dataLabel={columnNames.value}>
                        <ExpandableRowContent data-cy={index + 'ConfigExpanded'}>
                          <ClipboardCopyButton
                            id="basic-copy-button"
                            aria-label="Copy to clipboard basic example code block"
                            // exitDelay={copied ? 1500 : 600}
                            onClick={(e) => () => onClick(e, historyItem.query)}
                            maxWidth="110px"
                            variant="plain"
                          >
                            {true ? 'Successfully copied to clipboard!' : 'Copy to clipboard'}
                          </ClipboardCopyButton>
                          <SyntaxHighlighter wrapLines={false} style={syntaxHighLighterTheme} useInlineStyles={true}>
                            {historyItem.query}
                          </SyntaxHighlighter>
                        </ExpandableRowContent>
                      </Td>
                      <Td isActionCell>
                        <Button variant="secondary">{t('caches.query.history.delete')}</Button>
                      </Td>
                    </Tr>
                  );
                })
            )}
          </Tbody>
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
