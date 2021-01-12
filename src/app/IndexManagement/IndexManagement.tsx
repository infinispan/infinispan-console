import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Divider,
  DividerVariant,
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
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { global_spacer_md } from '@patternfly/react-tokens';
import { useApiAlert } from '@app/utils/useApiAlert';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { TableErrorState } from '@app/Common/TableErrorState';
import { PurgeIndex } from '@app/IndexManagement/PurgeIndex';
import { Reindex } from '@app/IndexManagement/Reindex';
import displayUtils from '../../services/displayUtils';
import { useTranslation } from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";

const IndexManagement = (props) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const cacheName = decodeURIComponent(props.computedMatch.params.cacheName);
  const [purgeModalOpen, setPurgeModalOpen] = useState<boolean>(false);
  const [reindexModalOpen, setReindexModalOpen] = useState<boolean>(false);
  const [indexStats, setIndexStats] = useState<IndexStats | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    retrieveIndexStats();
  }, []);

  const retrieveIndexStats = () => {
    ConsoleServices.caches().retrieveIndexStats(cacheName).then((eitherResult) => {
      setLoading(false);
      if (eitherResult.isRight()) {
        setIndexStats(eitherResult.value);
      } else {
        addAlert(eitherResult.value);
        setError(eitherResult.value.message);
      }
    });
  };

  const displayClassNames = () => {
    if (!indexStats) {
      return <Text></Text>;
    }
    return indexStats?.class_names.map((className) => (
      <Text component={TextVariants.p} key={className}>
        {className}
      </Text>
    ));
  };

  const displayIndexValues = (label: string, values: IndexValue[]) => {
    if (!indexStats) {
      return '';
    }
    return (
      <TextList component={TextListVariants.dl}>
        {values.map((indexValue) => (
          <React.Fragment key={'react-frangment-text-' + indexValue.entity}>
            <TextListItem component={TextListItemVariants.dt}>
              {indexValue.entity}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {displayUtils.formatNumber(indexValue.count) + ' ' + label}
            </TextListItem>
          </React.Fragment>
        ))}
      </TextList>
    );
  };

  const closePurgeModal = () => {
    setPurgeModalOpen(false);
    retrieveIndexStats();
  };

  const closeReindexModal = () => {
    setReindexModalOpen(false);
    retrieveIndexStats();
  };

  const buildReindexAction = () => {
    if (indexStats?.reindexing) {
      return <Spinner size={'md'} />;
    }
    return (
      <Button
        variant={ButtonVariant.secondary}
        onClick={() => setReindexModalOpen(true)}
      >
        Reindex
      </Button>
    );
  };

  const buildIndexPageContent = () => {
    if (loading) {
      return <Spinner size={'lg'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    if (indexStats) {
      return (
        <TextContent style={{ marginTop: global_spacer_md.value }}>
          <TextList component={TextListVariants.dl} key="indexes">
            <TextListItem component={TextListItemVariants.dt} key={'className'}>
              Class names
            </TextListItem>
            <TextListItem
              component={TextListItemVariants.dd}
              key={'classNameValue'}
            >
              <TextContent>{displayClassNames()}</TextContent>
            </TextListItem>
            <TextListItem
              component={TextListItemVariants.dt}
              key={'entriesCount'}
            >
              Entities count
            </TextListItem>
            <TextListItem
              component={TextListItemVariants.dd}
              key={'entriesCountValue'}
            >
              <TextContent>
                {displayIndexValues('entities', indexStats?.entities_count)}
              </TextContent>
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt} key={'sizes'}>
              Sizes
            </TextListItem>
            <TextListItem
              component={TextListItemVariants.dd}
              key={'sizesValue'}
            >
              <TextContent>
                {displayIndexValues('bytes', indexStats?.sizes)}
              </TextContent>
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt} key={'reindex'}>
              Reindexing
            </TextListItem>
            <TextListItem
              component={TextListItemVariants.dd}
              key={'reindexValue'}
            >
              {buildReindexAction()}
            </TextListItem>
          </TextList>
          <Text key={'button-back'}>
            <Link
              to={{
                pathname: '/cache/' + encodeURIComponent(cacheName),
              }}
            >
              <Button>Back</Button>
            </Link>
          </Text>
        </TextContent>
      );
    }
    return;
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb
          currentPage="Indexation"
          cacheName={cacheName}
        />
        <Level>
          <LevelItem>
            <TextContent
              style={{ marginTop: global_spacer_md.value }}
              key={'title-indexation'}
            >
              <Text component={TextVariants.h1} key={'title-value-indexation'}>
                Indexation
              </Text>
            </TextContent>
          </LevelItem>
          <LevelItem>
            <Button
              variant={ButtonVariant.danger}
              disabled={!indexStats?.reindexing}
              onClick={() => setPurgeModalOpen(true)}
            >
              Purge Index
            </Button>
          </LevelItem>
        </Level>

        <Divider component={DividerVariant.hr}></Divider>
        {buildIndexPageContent()}
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
