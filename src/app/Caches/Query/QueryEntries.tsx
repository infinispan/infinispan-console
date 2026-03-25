import React, { useContext, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Checkbox,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Pagination,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  ExternalLinkSquareAltIcon,
  SearchIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useTranslation } from 'react-i18next';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { useSearch } from '@app/hooks/searchHook';
import { DeleteByQueryEntries } from '@app/Caches/Query/DeleteByQueryEntries';
import {
  CodeEditor,
  CodeEditorControl,
  Language,
} from '@patternfly/react-code-editor';
import displayUtils from '@services/displayUtils';

const QueryEntries = (props: { cacheName: string; changeTab: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const {
    search,
    onStoreQuery,
    storeResult,
    startSearch,
    clearSearch,
    onPerPageSelect,
    onSetPage,
  } = useSearch(props.cacheName);
  const { syntaxHighLighterTheme, theme } = useContext(ThemeContext);
  const [deleteByQueryOpen, setDeleteByQueryOpen] = useState(false);
  const [trim, setTrim] = useState<boolean>(false);

  const displayValue = (value: string) => {
    return (
      <SyntaxHighlighter
        lineProps={{ style: { wordBreak: 'break-all' } }}
        style={syntaxHighLighterTheme}
        useInlineStyles={true}
        wrapLongLines={true}
      >
        {trim
          ? displayUtils.formatContentToDisplayWithTruncate(value)
          : displayUtils.formatContentToDisplay(value)}
      </SyntaxHighlighter>
    );
  };

  const onChangeSearch = (value: string) => {
    if (value.length == 0) {
      clearSearch();
    } else {
      onStoreQuery(value);
      storeResult({
        total: 0,
        values: [],
        error: false,
        cause: '',
        executed: false,
      });
    }
  };

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={search.searchResult.total}
        perPage={search.perPage}
        page={search.page}
        onSetPage={onSetPage}
        widgetId="pagination-query"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  const toolbar = (
    <Toolbar id="cache-query-toolbar" style={{ paddingLeft: 0 }} isSticky>
      <ToolbarContent>
        <ToolbarItem>
          <Checkbox
            labelPosition="start"
            label={t('caches.query.truncate-results')}
            id="checkbox-trim"
            onClick={() => setTrim(!trim)}
          />
        </ToolbarItem>
        <ToolbarItem variant="pagination">
          {toolbarPagination('down')}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const emptyQueryMessage = (
    <EmptyState variant={EmptyStateVariant.lg} icon={SearchIcon}>
      <EmptyStateBody>{t('caches.query.no-query-body')}</EmptyStateBody>
    </EmptyState>
  );

  const emptyStateLoading = (
    <EmptyState
      titleText={t('caches.query.query-loading')}
      headingLevel="h4"
      icon={Spinner}
    />
  );

  const errorSearchMessage = (
    <EmptyState
      status={'danger'}
      headingLevel="h2"
      titleText={t('caches.query.query-error')}
    >
      <EmptyStateBody>{search.searchResult.cause}</EmptyStateBody>
    </EmptyState>
  );

  const emptySearchMessage = (
    <EmptyState>
      <EmptyStateBody>{t('caches.query.no-search-value')}</EmptyStateBody>
    </EmptyState>
  );

  const displayContent = () => {
    if (!search.searchResult.executed) {
      return emptyQueryMessage;
    }

    if (search.loading) {
      return emptyStateLoading;
    }

    if (search.searchResult.error) {
      return errorSearchMessage;
    }

    return (
      <React.Fragment>
        <Table
          data-cy="queryTable"
          className={'query-table'}
          aria-label={'query-table-label'}
          variant="compact"
        >
          <Tbody>
            {search.searchResult.values.length == 0 ? (
              <Tr>
                <Td>{emptySearchMessage}</Td>
              </Tr>
            ) : (
              search.searchResult.values.map((row, index) => {
                return (
                  <Tr key={index}>
                    <Td dataLabel={'Value'}>{displayValue(row)}</Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
        <Toolbar id="query-table-toolbar" className={'query-table-display'}>
          <ToolbarItem variant="pagination">
            {toolbarPagination('up')}
          </ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  const customControl = (
    <CodeEditorControl
      icon={<SearchIcon />}
      aria-label="Execute code"
      tooltipProps={{ content: 'Execute code' }}
      onClick={startSearch}
      isVisible
    />
  );

  const ickleHelp = (
    <Content>
      {' '}
      {t('caches.query.ickle-query-tooltip', {
        brandname: brandname,
      })}
      <Content component={'p'}></Content>
      <Content component={'small'}>
        <code>FROM Entity</code>
      </Content>
      <Content component={'small'}>
        <code>SELECT ... FROM Entity WHERE ...</code>
      </Content>
      <Content component={'small'}>
        <code>DELETE FROM Entity</code>
      </Content>
    </Content>
  );

  const shortcutsPopoverProps = {
    headerContent: t('caches.query.ickle-query'),
    footerContent: (
      <Button
        variant={'link'}
        style={{ paddingLeft: 0 }}
        iconPosition={'start'}
        icon={<ExternalLinkSquareAltIcon />}
        onClick={() =>
          window.open(t('brandname.ickle-query-docs-link'), '_blank')
        }
      >
        {t('caches.query.ickle-query-docs')}
      </Button>
    ),
    bodyContent: ickleHelp,
  };

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        <Grid hasGutter>
          <GridItem span={9} id="textSearchByQuery">
            <CodeEditor
              headerMainContent={brandname + ' Ickle Query Language'}
              isLineNumbersVisible
              isLanguageLabelVisible={false}
              language={Language.sql}
              code={search.query}
              onChange={(value, event) => onChangeSearch(value)}
              isFullHeight
              height={'sizeToFit'}
              isDarkTheme={theme === DARK}
              shortcutsPopoverButtonText={''}
              shortcutsPopoverProps={shortcutsPopoverProps}
              options={{ editContext: false }}
            />
          </GridItem>
          <GridItem span={3}>
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsXs' }}
            >
              <FlexItem>
                <Button
                  variant={ButtonVariant.primary}
                  size={'sm'}
                  onClick={startSearch}
                  data-cy="searchButton"
                  icon={<SearchIcon />}
                  isDisabled={
                    search.query.trim().length == 0 ||
                    search.query.toLowerCase().startsWith('delete')
                  }
                >
                  {'Search values'}
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant={ButtonVariant.secondary}
                  isDanger
                  onClick={() => setDeleteByQueryOpen(true)}
                  data-cy="deleteByQueryButton"
                  icon={<TrashIcon />}
                  isDisabled={
                    search.query.trim().length == 0 ||
                    !search.query.toLowerCase().startsWith('delete')
                  }
                  size={'sm'}
                >
                  {t('caches.query.button-delete-entries')}
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant={ButtonVariant.link}
                  onClick={() => props.changeTab()}
                  data-cy="viewQueryMetricsButton"
                  size={'sm'}
                >
                  {t('caches.query.view-all-query-stats')}
                </Button>
              </FlexItem>
            </Flex>
          </GridItem>
        </Grid>
        {toolbar}
        {displayContent()}
        <DeleteByQueryEntries
          isModalOpen={deleteByQueryOpen}
          closeModal={() => {
            setDeleteByQueryOpen(false);
          }}
          cacheName={props.cacheName}
          query={search.query}
        />
      </CardBody>
    </Card>
  );
};

export { QueryEntries };
