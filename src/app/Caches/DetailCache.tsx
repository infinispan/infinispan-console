import * as React from 'react';
import {PageSection, Title,} from '@patternfly/react-core';
import cacheService from "../../services/cacheService";

const DetailCache: React.FunctionComponent<any> = (props) => {
  const cm = props.match;
  // cacheService.retrieveConfig('eee');

  console.log(cm);
  return (
    <PageSection>
      <Title size="lg"> Cache Detail </Title>
    </PageSection>
  );
}
export {DetailCache};
