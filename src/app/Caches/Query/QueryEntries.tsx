import React, { useState } from 'react';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  InputGroup,
  Pagination,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import cacheService from '@services/cacheService';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { TableErrorState } from '@app/Common/TableErrorState';
import displayUtils from '../../../services/displayUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const QueryEntries: React.FunctionComponent<any> = (props: {
  cacheName: string;
  indexed: boolean;
  changeTab: () => void;
}) => {
  const [query, setQuery] = useState<string>('');
  const [rows, setRows] = useState<any[]>([]);
  const [queryPagination, setQueryPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
  });

  const columns = [{ title: 'Value' }];
  const updateRows = (values: string[], error?: string) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (error) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 1 },
              title: <TableErrorState error={'Query error'} detail={error} />,
            },
          ],
        },
      ];
    } else if (values.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 1 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      Values not found.
                    </Title>
                  </EmptyState>
                </Bullseye>
              ),
            },
          ],
        },
      ];
    } else {
      rows = values.map((value) => {
        return {
          heightAuto: true,
          cells: [{ title: displayValue(value) }],
        };
      });
    }
    setRows(rows);
  };

  const displayValue = (value: string) => {
    return (
      <SyntaxHighlighter
        wrapLines={false}
        style={githubGist}
        useInlineStyles={true}
      >
        {displayUtils.displayValue(value)}
      </SyntaxHighlighter>
    );
  };

  const onChangeSearch = (value) => {
    if (value.length == 0) {
      setRows([]);
    }
    setQuery(value.trim());
  };

  const searchByQuery = (perPage: number, page: number) => {
    if (query.length == 0) {
      return;
    }

    cacheService
      .searchValues(props.cacheName, query, perPage, page - 1)
      .then((response) => {
        if (response.isRight()) {
          setQueryPagination((prevState) => {
            return { ...prevState, total: response.value.total };
          });
          updateRows(response.value.values);
        } else {
          updateRows([], response.value.message);
        }
      });
  };

  const searchEntryOnKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchByQuery(queryPagination.perPage, queryPagination.page);
    }
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
      <ToolbarItem>
        <Button
          variant={ButtonVariant.secondary}
          onClick={() => props.changeTab()}
        >
          View all query stats
        </Button>
      </ToolbarItem>
    );
  };

  return (
    <React.Fragment>
      <Toolbar id="cache-query-toolbar" style={{ paddingLeft: 0 }}>
        <ToolbarContent>
          <ToolbarItem>
            <InputGroup>
              <TextInput
                name="textSearchByQuery"
                id="textSearchByQuery"
                type="search"
                aria-label="search by query textfield"
                placeholder={'Ickle query'}
                size={75}
                onChange={onChangeSearch}
                onKeyPress={searchEntryOnKeyPress}
              />
              <Button
                variant="control"
                aria-label="search button for search input"
                onClick={() =>
                  searchByQuery(queryPagination.perPage, queryPagination.page)
                }
              >
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
          {buildViewAllQueryStats()}
          <ToolbarItem variant={ToolbarItemVariant.pagination}>
            <Pagination
              itemCount={queryPagination.total}
              perPage={queryPagination.perPage}
              page={queryPagination.page}
              onSetPage={onSetPage}
              widgetId="pagination-query"
              onPerPageSelect={onPerPageSelect}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Card>
        <CardBody>
          <Table
            variant={TableVariant.compact}
            aria-label="Entries"
            cells={columns}
            rows={rows}
            className={'values-table'}
          >
            <TableHeader />
            <TableBody />
          </Table>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export { QueryEntries };
