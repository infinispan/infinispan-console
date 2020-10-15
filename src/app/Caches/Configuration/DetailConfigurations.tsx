import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  ExpandableSection,
  PageSection,
  PageSectionVariants,
  Pagination,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import dataContainerService from '@services/dataContainerService';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { TableEmptyState } from '@app/Common/TableEmptyState';
import { useTranslation } from 'react-i18next';

const DetailConfigurations: React.FunctionComponent<any> = (props) => {
  const [cmName, setCmName] = useState(props.computedMatch.params.cmName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheConfigs, setCacheConfigs] = useState<CacheConfig[]>([]);
  const [pageConfigsPagination, setCacheConfigsPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const columns = [
    {
      title: t('caches.configuration.title')
    }
  ];

  useEffect(() => {
    dataContainerService
      .getCacheConfigurationTemplates(cmName)
      .then((eitherConfigs) => {
        setLoading(false);
        if (eitherConfigs.isRight()) {
          setCacheConfigs(eitherConfigs.value);
        } else {
          setError(eitherConfigs.value.message);
        }
      })
      .then(() => setLoading(false));
  }, [cmName]);

  useEffect(() => {
    const slice =
      (pageConfigsPagination.page - 1) * pageConfigsPagination.perPage;
    updateRows(
      cacheConfigs.slice(slice, slice + pageConfigsPagination.perPage)
    );
  }, [cacheConfigs, pageConfigsPagination]);

  const onSetPage = (_event, pageNumber) => {
    setCacheConfigsPagination({
      page: pageNumber,
      perPage: pageConfigsPagination.perPage,
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setCacheConfigsPagination({
      page: pageConfigsPagination.page,
      perPage: perPage,
    });
  };

  const updateRows = (configs: CacheConfig[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];
    if (configs.length == 0 || loading) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              title: (
                <TableEmptyState
                  loading={loading}
                  error={error}
                  empty={'There are no cache configurations templates'}
                />
              ),
            },
          ],
        },
      ];
    } else {
      rows = configs.map((config) => {
        return {
          heightAuto: true,
          cells: [
            {
              title: displayConfig(config.name, config.config),
            },
          ],
        };
      });
    }
    setRows(rows);
  };

  const displayConfig = (name: string, config: string) => {
    return (
      <ExpandableSection
        toggleTextExpanded={name}
        toggleTextCollapsed={name}
        key={name + '-config-value'}
      >
        <SyntaxHighlighter
          wrapLines={false}
          style={githubGist}
          useInlineStyles={true}
          showLineNumbers={true}
        >
          {config}
        </SyntaxHighlighter>
      </ExpandableSection>
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
              aria-label={t('caches.configuration.table-label')}
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
