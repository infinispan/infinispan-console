import * as React from 'react';
import { useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Divider,
  DividerVariant,
  Grid,
  GridItem,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { global_spacer_md } from '@patternfly/react-tokens';
import { useApiAlert } from '@app/utils/useApiAlert';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { TableErrorState } from '@app/Common/TableErrorState';
import { PurgeIndex } from '@app/IndexManagement/PurgeIndex';
import { Reindex } from '@app/IndexManagement/Reindex';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useSearchStats } from '@app/services/statsHook';

const IndexManagement = (props) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();
  const { connectedUser } = useConnectedUser();
  const cacheName = decodeURIComponent(props.computedMatch.params.cacheName);
  const { stats, loading, error, setLoading } = useSearchStats(cacheName);
  const [purgeModalOpen, setPurgeModalOpen] = useState<boolean>(false);
  const [reindexModalOpen, setReindexModalOpen] = useState<boolean>(false);

  const closePurgeModal = () => {
    setPurgeModalOpen(false);
    setLoading(true);
  };

  const closeReindexModal = () => {
    setReindexModalOpen(false);
    setLoading(true);
  };

  const buildReindexAction = () => {
    if (
      !ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)
    ) {
      return;
    }

    if (stats?.reindexing) {
      return <Spinner size={'md'} />;
    }
    return (
      <Button
        variant={ButtonVariant.secondary}
        onClick={() => setReindexModalOpen(true)}
      >
        {t('caches.index.button-rebuild')}
      </Button>
    );
  };

  const buildPurgeIndexButton = () => {
    if (
      !ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)
    ) {
      return;
    }

    return (
      <LevelItem>
        <Button
          variant={ButtonVariant.danger}
          disabled={!stats?.reindexing}
          onClick={() => setPurgeModalOpen(true)}
        >
          {t('caches.index.button-clear')}
        </Button>
      </LevelItem>
    );
  };

  const buildIndexPageContent = () => {
    if (loading) {
      return <Spinner size={'lg'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    if (stats) {
      return (
        <Grid hasGutter>
          {stats.index.map((indexData, num) => (
            <GridItem span={6} key={'grid-item-index-' + num}>
              <TextContent
                style={{ marginTop: global_spacer_md.value }}
                key={'index-className-' + num}
              >
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    {t('caches.index.class-name')}
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dd}
                    key={'classNameValue'}
                  >
                    <TextContent>{indexData.name}</TextContent>
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dt}
                    key={'entriesCount'}
                  >
                    {t('caches.index.entities-number')}
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dd}
                    key={'entriesCountValue'}
                  >
                    <TextContent>{indexData.count}</TextContent>
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dt}
                    key={'sizes'}
                  >
                    {t('caches.index.size')}
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dd}
                    key={'sizesValue'}
                  >
                    <TextContent>{indexData.size}</TextContent>
                  </TextListItem>
                </TextList>
              </TextContent>
            </GridItem>
          ))}
        </Grid>
      );
    }

    return (
      <Alert variant={AlertVariant.info} title={t('caches.index.empty')} />
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb
          currentPage={t('caches.index.title')}
          cacheName={cacheName}
        />
        <Level>
          <LevelItem>
            <TextContent
              style={{ marginTop: global_spacer_md.value }}
              key={'title-indexing'}
            >
              <Text component={TextVariants.h1} key={'title-value-indexing'}>
                {t('caches.index.indexing-status')}
              </Text>
            </TextContent>
          </LevelItem>
          {buildPurgeIndexButton()}
        </Level>

        <Divider component={DividerVariant.hr}></Divider>
        {buildIndexPageContent()}
        <Divider
          component={DividerVariant.hr}
          style={{ marginTop: global_spacer_md.value }}
        ></Divider>
        <Toolbar id="indexing-page-toolbar">
          <ToolbarContent>
            <ToolbarItem>{buildReindexAction()}</ToolbarItem>
            <ToolbarItem>
              <TextContent>
                <Text key={'button-back'}>
                  <Link
                    to={{
                      pathname: '/cache/' + encodeURIComponent(cacheName),
                    }}
                  >
                    <Button>
                      {' '}
                      {t('caches.index.button-back-to-cache-detail')}
                    </Button>
                  </Link>
                </Text>
              </TextContent>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <PurgeIndex
          cacheName={cacheName}
          isModalOpen={purgeModalOpen}
          closeModal={closePurgeModal}
        />
        <Reindex
          cacheName={cacheName}
          isModalOpen={reindexModalOpen}
          closeModal={closeReindexModal}
        />
      </PageSection>
    </React.Fragment>
  );
};
export { IndexManagement };
