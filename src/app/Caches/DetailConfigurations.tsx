import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  ExpandableSection,
  PageSection,
  PageSectionVariants,
  Pagination,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarContent
} from '@patternfly/react-core';
import dataContainerService from '../../services/dataContainerService';
import {SearchIcon} from '@patternfly/react-icons';
import {Table, TableBody, TableHeader, TableVariant} from '@patternfly/react-table';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';

const DetailConfigurations: React.FunctionComponent<any> = props => {
  const cm: string = props.location.state.cmName;
  const [cacheConfigs, setCacheConfigs] = useState<CacheConfig[]>([]);
  const [pageConfigsPagination, setCacheConfigsPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const columns = [
    {
      title: 'Configuration template'
    }
  ];

  useEffect(() => {
    dataContainerService.getCacheConfigurationTemplates(cm).then(configs => {
      setCacheConfigs(configs);
      const initSlice =
        (pageConfigsPagination.page - 1) * pageConfigsPagination.perPage;
      updateRows(
        configs.slice(initSlice, initSlice + pageConfigsPagination.perPage)
      );
    });
  }, []);

  const onSetPage = (_event, pageNumber) => {
    setCacheConfigsPagination({
      page: pageNumber,
      perPage: pageConfigsPagination.perPage
    });
    const initSlice = (pageNumber - 1) * pageConfigsPagination.perPage;
    updateRows(
      cacheConfigs.slice(initSlice, initSlice + pageConfigsPagination.perPage)
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setCacheConfigsPagination({
      page: pageConfigsPagination.page,
      perPage: perPage
    });
    const initSlice = (pageConfigsPagination.page - 1) * perPage;
    updateRows(cacheConfigs.slice(initSlice, initSlice + perPage));
  };

  const updateRows = (configs: CacheConfig[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];
    if (configs.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      There are no cache configurations
                    </Title>
                    <EmptyStateBody>
                      Create a cache configuration
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    } else {
      rows = configs.map(config => {
        return {
          heightAuto: true,
          cells: [
            {
              title: displayConfig(config.name, config.config)
            }
          ]
        };
      });
    }
    setRows(rows);
  };

  const displayConfig = (name: string, config: string ) => {
    return (
      <ExpandableSection
        toggleTextExpanded={name}
        toggleTextCollapsed={name}
        key={name + '-config-value'}
      >
        <SyntaxHighlighter wrapLines={false} style={githubGist}
                           useInlineStyles={true}
                           showLineNumbers={true}>
          {config}
        </SyntaxHighlighter>
      </ExpandableSection>
    );
  };

  const pageTitle = 'Configuration templates';

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
      <PageSection>
        <Card>
          <CardBody>
            <Pagination
              itemCount={cacheConfigs.length}
              perPage={pageConfigsPagination.perPage}
              page={pageConfigsPagination.page}
              onSetPage={onSetPage}
              widgetId="pagination-configs"
              onPerPageSelect={onPerPageSelect}
              isCompact
            />
            <Table
              variant={TableVariant.compact}
              aria-label="Cache configurations"
              cells={columns}
              rows={rows}
              className={'configs-table'}
            >
              <TableHeader />
              <TableBody />
            </Table>
          </CardBody>
        </Card>
      </PageSection>
    </React.Fragment>
  );
};
export { DetailConfigurations };
