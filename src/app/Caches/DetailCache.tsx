import * as React from 'react';
import {PageSection, Title,} from '@patternfly/react-core';
import cacheService from "../../services/cacheService";
import {useEffect} from "react";
import dataContainerService from "../../services/dataContainerService";
import {useState} from "react";

const DetailCache: React.FunctionComponent<any> = (props) => {
  const cacheName:string = props.location.state.cacheName;
  const [detail, setDetail] = useState<DetailedInfinispanCache>({name:cacheName});

  useEffect(() => {
    cacheService.retrieveFullDetail(cacheName)
      .then(detailedCache => setDetail(detailedCache));
  }, []);

  return (
    <PageSection>
      <Title size="lg"> Cache {detail.name} </Title>

    </PageSection>
  );
}
export {DetailCache};
