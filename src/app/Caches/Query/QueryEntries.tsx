import React, { useContext, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Checkbox,
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
  ToolbarItem
} from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon, SearchIcon, TrashIcon } from '@patternfly/react-icons';
import displayUtils from '../../../services/displayUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useTranslation } from 'react-i18next';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { useSearch } from '@app/services/searchHook';
import { DeleteByQueryEntries } from '@app/Caches/Query/DeleteByQueryEntries';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';

const QueryEntries = (props: { cacheName: string; changeTab: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { search, setSearch } = useSearch(props.cacheName);
  const { syntaxHighLighterTheme } = useContext(ThemeContext);
  const [deleteByQueryOpen, setDeleteByQueryOpen] = useState(false);
  const [trim, setTrim] = useState<boolean>(false);
  const { theme } = useContext(ThemeContext);

  const displayValue = (value: string) => {
    return (
      <SyntaxHighlighter
        lineProps={{ style: { wordBreak: 'break-all' } }}
        style={syntaxHighLighterTheme}
        useInlineStyles={true}
        wrapLongLines={true}
      >
        {trim ? displayUtils.formatContentToDisplayWithTruncate(value) : displayUtils.formatContentToDisplay(value)}
      </SyntaxHighlighter>
    );
  };

  const onSearch = () => {
    setSearch((prevState) => {
      return { ...prevState, loading: true };
    });
  };

  const onClear = () => {
    setSearch((prevState) => {
      return {
        ...prevState,
        query: '',
        searchResult: {
          total: 0,
          values: [],
          error: false,
          cause: '',
          executed: false
        },
        loading: false
      };
    });
  };

  const onChangeSearch = (value) => {
    setSearch((prevState) => {
      return { ...prevState, query: value };
    });
    if (value.length == 0) {
      onClear();
    }
  };

  const onSetPage = (_event, pageNumber) => {
    setSearch((prevState) => {
      return { ...prevState, page: pageNumber, loading: true };
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setSearch((prevState) => {
      return { ...prevState, perPage: perPage, loading: true };
    });
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
        <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const emptyQueryMessage = (
    <EmptyState variant={EmptyStateVariant.lg} icon={SearchIcon}>
      <EmptyStateBody>{t('caches.query.no-query-body')}</EmptyStateBody>
    </EmptyState>
  );

  const emptyStateLoading = <EmptyState titleText={t('caches.query.query-loading')} headingLevel="h4" icon={Spinner} />;

  const errorSearchMessage = (
    <EmptyState status={'danger'} headingLevel="h2" titleText={t('caches.query.query-error')}>
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
        <Table data-cy="queryTable" className={'query-table'} aria-label={'query-table-label'} variant="compact">
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
          <ToolbarItem variant="pagination">{toolbarPagination('up')}</ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  const customControl = (
    <CodeEditorControl
      icon={<SearchIcon />}
      aria-label="Execute code"
      tooltipProps={{ content: 'Execute code' }}
      onClick={onSearch}
      isVisible
    />
  );

  const shortcutsPopoverProps = {
    headerContent: t('caches.query.ickle-query'),
    footerContent: (
      <Button
        variant={'link'}
        style={{ paddingLeft: 0 }}
        iconPosition={'start'}
        icon={<ExternalLinkSquareAltIcon />}
        onClick={() => window.open(t('brandname.ickle-query-docs-link'), '_blank')}
      >
        {t('caches.query.ickle-query-docs')}
      </Button>
    ),
    bodyContent: t('caches.query.ickle-query-tooltip', {
      brandname: brandname
    })
  };

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        <Grid hasGutter>
          <GridItem span={9}>
            <CodeEditor
              headerMainContent={brandname + ' Ickle Query Language'}
              name="textSearchByQuery"
              id="textSearchByQuery"
              isLineNumbersVisible
              isLanguageLabelVisible={false}
              language={Language.sql}
              onChange={(value, event) => onChangeSearch(value)}
              isFullHeight
              height={'sizeToFit'}
              isDarkTheme={theme === DARK}
              shortcutsPopoverButtonText={''}
              shortcutsPopoverProps={shortcutsPopoverProps}
            />
          </GridItem>
          <GridItem span={3}>
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
              <FlexItem>
                <Button
                  variant={ButtonVariant.primary}
                  size={'sm'}
                  onClick={() => onSearch()}
                  name="textSearchByQuery"
                  id="textSearchByQuery"
                  icon={<SearchIcon />}
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
            onSearch();
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
