import React, { useState, useEffect } from 'react';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  EmptyStateBody,
  Pagination,
  Popover,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  EmptyStateHeader
} from '@patternfly/react-core';
import { SearchIcon, ExclamationCircleIcon, HelpIcon } from '@patternfly/react-icons';
import displayUtils from '../../../services/displayUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Table } from '@patternfly/react-table/deprecated';
import { global_danger_color_200, global_spacer_md, global_spacer_sm } from '@patternfly/react-tokens';

const QueryEntries = (props: { cacheName: string; indexed: boolean; changeTab: () => void }) => {
  const [query, setQuery] = useState<string>('');
  const [rows, setRows] = useState<string[] | undefined>([]);
  const [filteredRows, setFilteredRows] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isResultEmpty, setIsResultEmpty] = useState(false);
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [queryPagination, setQueryPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0
  });

  const columnNames = {
    value: 'Value'
  };

  useEffect(() => {
    if (rows) {
      const initSlice = (queryPagination.page - 1) * queryPagination.perPage;
      const updateFilteredRowss = rows.slice(initSlice, initSlice + queryPagination.perPage);
      updateFilteredRowss.length > 0 ? setFilteredRows(updateFilteredRowss) : setFilteredRows([]);
    }
  }, [queryPagination, rows]);

  const displayValue = (value: string) => {
    return (
      <SyntaxHighlighter
        lineProps={{ style: { wordBreak: 'break-all' } }}
        style={githubGist}
        useInlineStyles={true}
        wrapLongLines={true}
      >
        {displayUtils.formatContentToDisplay(value)}
      </SyntaxHighlighter>
    );
  };

  const onChangeSearch = (value) => {
    if (value.length == 0) {
      setIsResultEmpty(false);
      setError('');
      setRows([]);
    }
    setQuery(value.trim());
  };

  const searchByQuery = (perPage: number, page: number) => {
    if (query.length == 0) {
      return;
    }

    ConsoleServices.search()
      .searchValues(props.cacheName, query, perPage, page - 1)
      .then((response) => {
        if (response.isRight()) {
          setQueryPagination((prevState) => {
            return { ...prevState, total: response.value.total };
          });
          setError('');
          if (response.value.values.length == 0) setIsResultEmpty(true);
          setRows(response.value.values);
        } else {
          setRows(undefined);
          setError(response.value.message);
        }
      });
  };

  const onSetPage = (_event, pageNumber) => {
    setQueryPagination((prevState) => {
      return { ...prevState, page: pageNumber };
    });
    searchByQuery(queryPagination.perPage, pageNumber);
  };

  const onPerPageSelect = (_event, perPage) => {
    setQueryPagination((prevState) => {
      return { ...prevState, page: queryPagination.page };
    });
    searchByQuery(perPage, queryPagination.page);
  };

  const buildViewAllQueryStats = () => {
    if (!props.indexed) return '';

    return (
      <React.Fragment>
        <ToolbarItem variant={'separator'} style={{ marginInline: global_spacer_sm.value }} />
        <ToolbarItem>
          <Button
            style={{ marginLeft: global_spacer_md.value }}
            variant={ButtonVariant.secondary}
            onClick={() => props.changeTab()}
            data-cy="viewQueryMetricsButton"
          >
            {t('caches.query.view-all-query-stats')}
          </Button>
        </ToolbarItem>
      </React.Fragment>

    );
  };

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={rows?.length}
        perPage={queryPagination.perPage}
        page={queryPagination.page}
        onSetPage={onSetPage}
        widgetId="pagination-query"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  const toolbar = (
    <Toolbar id="cache-query-toolbar" style={{ paddingLeft: 0 }}>
      <ToolbarContent>
        <ToolbarItem>
          <SearchInput
            name="textSearchByQuery"
            id="textSearchByQuery"
            aria-label="Query textfield"
            placeholder={t('caches.query.ickle-query')}
            type="search"
            submitSearchButtonLabel={'searchButton'}
            style={{ width: '35rem' }}
            onChange={(e, value) => onChangeSearch(value)}
            onSearch={() => searchByQuery(queryPagination.perPage, queryPagination.page)}
            onClear={() => setQuery('')}
          />
        </ToolbarItem>
        <ToolbarItem>
          <Popover
            headerContent={t('caches.query.ickle-query')}
            bodyContent={t('caches.query.ickle-query-tooltip', { brandname: brandname })}
          >
            <Button
              variant="plain"
              aria-label={'more-info-ickle'}
              onClick={(e) => e.preventDefault()}
              aria-describedby={'helpickle'}
              className="pf-v5-c-form__group-label-help"
              icon={<HelpIcon />}
            />
          </Popover>
        </ToolbarItem>
        {buildViewAllQueryStats()}
        <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const emptyQuery = (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader icon={<EmptyStateIcon icon={SearchIcon} />} />
      <EmptyStateBody>{t('caches.query.no-query-body')}</EmptyStateBody>
    </EmptyState>
  );

  const errorQuery = (
    <EmptyState>
      <EmptyStateHeader
        titleText={<>{t('caches.query.query-error')}</>}
        icon={<EmptyStateIcon color={global_danger_color_200.value} icon={ExclamationCircleIcon} />}
        headingLevel="h2"
      />
      <EmptyStateBody>{error}</EmptyStateBody>
    </EmptyState>
  );

  const noValueError = (
    <EmptyState>
      <EmptyStateBody>{t('caches.query.no-search-value')}</EmptyStateBody>
    </EmptyState>
  );

  return (
    <Card>
      <CardBody>
        {toolbar}
        {rows?.length == 0 && !isResultEmpty ? (
          emptyQuery
        ) : (
          <React.Fragment>
            <Table data-cy="queryTable" className={'query-table'} aria-label={'query-table-label'} variant="compact">
              <Thead>
                <Tr>
                  <Th>{columnNames.value}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRows.length == 0 ? (
                  <Tr>
                    <Td>
                      <Bullseye>{error !== '' ? errorQuery : noValueError}</Bullseye>
                    </Td>
                  </Tr>
                ) : (
                  filteredRows.map((row, index) => {
                    return (
                      <Tr key={index}>
                        <Td dataLabel={columnNames.value}>{displayValue(row)}</Td>
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
        )}
      </CardBody>
    </Card>
  );
};

export { QueryEntries };
