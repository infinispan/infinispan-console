import * as React from 'react';
import {PageSection, Title,} from '@patternfly/react-core';

const DetailCache: React.FunctionComponent<any> = (props) => {
  const cm = props.match;
  console.log(cm);
  return (
    <PageSection>
      <Title size="lg"> Cache Detail </Title>
    </PageSection>
  );
}
export {DetailCache};
