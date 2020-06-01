import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Button,
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
  TextVariants
} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import {Link} from 'react-router-dom';
import {global_spacer_md} from '@patternfly/react-tokens';
import {useApiAlert} from '@app/utils/useApiAlert';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import {useLocation} from "react-router";
import {TableErrorState} from "@app/Common/TableErrorState";
import displayUtils from "../../services/displayUtils";

const IndexManagement = props => {
  const { addAlert } = useApiAlert();
  let location = useLocation();
  const [cacheName, setCacheName] = useState<string>('');
  const [indexStats, setIndexStats] = useState<IndexStats | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let locationCacheName = location.pathname.substr(7).replace('/indexation', '');
    setCacheName(locationCacheName);
  }, [location]);

  useEffect(() => {
    if(cacheName == '') {
      return;
    }

    cacheService.retrieveIndexStats(cacheName).then(eitherResult => {
      setLoading(false);
      if(eitherResult.isRight()) {
        console.log(eitherResult.value);
        setIndexStats(eitherResult.value);
      } else {
        addAlert(eitherResult.value);
        setError(eitherResult.value.message);
      }
    })
  }, [cacheName]);

  const displayClassNames = () => {
    if(!indexStats) {
      return (
        <Text></Text>
      );
    }
   return (
     indexStats?.class_names.map(className =>
      <Text component={TextVariants.small}>
        {className}
      </Text>
    ));
  }

  const displayIndexValues = (label: string, values: IndexValue[]) => {
    if(!indexStats) {
      return '';
    }
    return (
      <TextList component={TextListVariants.dl}>
        {values.map(indexValue =>
          <React.Fragment>
            <TextListItem component={TextListItemVariants.dt}>{indexValue.entity}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {displayUtils.formatNumber(indexValue.count) + ' ' + label}
            </TextListItem>
          </React.Fragment>
        )}
      </TextList>
    );
  }

  const buildIndexPageContent = () => {
    if(loading) {
      return (
        <Spinner size={'lg'}/>
      )
    }

    if(error != '') {
      return (
        <TableErrorState error={error}/>
      );
    }

    if(indexStats) {
      return (
        <TextContent style={{marginTop: global_spacer_md.value}}>
          <TextList component={TextListVariants.dl}>
            <TextListItem component={TextListItemVariants.dt}>Class names:</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              <TextContent>
                {displayClassNames()}
              </TextContent>
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>Entities count:</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {displayIndexValues('entities', indexStats?.entities_count)}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>Sizes:</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {displayIndexValues('bytes', indexStats?.sizes)}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>Reindexing:</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>{' ' + indexStats?.reindexing}</TextListItem>
          </TextList>
          <Text>
            <Link
              to={{
                pathname: '/cache/' + cacheName
              }}
            >
              <Button>Back</Button>
            </Link>
          </Text>
        </TextContent>
      );
    }
    return ;
  };

  return (
  <React.Fragment>
    <PageSection variant={PageSectionVariants.light}>
      <DataContainerBreadcrumb currentPage="Indexation" cacheName={cacheName} />
      <Level>
        <LevelItem>
          <TextContent style={{marginTop: global_spacer_md.value}}>
            <Text component={TextVariants.h1}>Indexation</Text>
          </TextContent>
        </LevelItem>
        {/*<LevelItem>PURGE BUTTON</LevelItem>*/}
      </Level>

      <Divider component={DividerVariant.hr}></Divider>
      {buildIndexPageContent()}
    </PageSection>
  </React.Fragment>
  );
};
export { IndexManagement };
