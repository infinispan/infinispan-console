import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Expandable,
  PageSection,
  PageSectionVariants,
  Pagination,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import dataContainerService from '../../services/dataContainerService';
import { SearchIcon } from '@patternfly/react-icons';
import {
  cellWidth,
  Table,
  TableBody,
  TableHeader
} from '@patternfly/react-table';

const DetailConfigurations: React.FunctionComponent<any> = props => {
  const cm: string = props.location.state.cacheManager;
  const [cacheConfigs, setCacheConfigs] = useState<CacheConfig[]>([]);
  const [pageConfigsPagination, setCacheConfigsPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const columns = [
    { title: 'Name', transforms: [cellWidth(40)] },
    {
      title: 'Detail'
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
              props: { colSpan: 8 },
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
            { title: config.name },
            {
              title: <DisplayConfig name={config.name} config={config.config} />
            }
          ]
        };
      });
    }
    setRows(rows);
  };

  const DisplayConfig = (props: { name: string; config: string }) => {
    return (
      <Expandable
        toggleTextExpanded="Hide"
        toggleTextCollapsed="View"
        key={name + '-config-value'}
      >
        <TextContent>
          <Text component={TextVariants.p}>
            <pre id={props.name + '-json'}>{props.config}</pre>
          </Text>
        </TextContent>
      </Expandable>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Breadcrumb>
          <BreadcrumbItem to="/console">Data container</BreadcrumbItem>
          <BreadcrumbItem isActive>
            Cache configurations templates
          </BreadcrumbItem>
        </Breadcrumb>
        <TextContent>
          <Text component={TextVariants.h1}>Configuration templates</Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.light}>
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
          aria-label="Cache configurations"
          cells={columns}
          rows={rows}
          className={'configs-table'}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </PageSection>
    </React.Fragment>
  );
};
export { DetailConfigurations };
