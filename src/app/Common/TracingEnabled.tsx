import React from 'react';
import { Content, ContentVariants, Flex, FlexItem, Icon } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleIcon, InfoCircleIcon } from '@patternfly/react-icons';

const TracingEnabled = (props: { enabled: boolean }) => {
  const { t } = useTranslation();

  return (
    <Flex data-cy="tracingEnabled">
      <FlexItem spacer={{ default: 'spacerXs' }}>
        <Icon status={props.enabled ? 'info' : undefined}>
          {props.enabled ? <InfoCircleIcon /> : <ExclamationCircleIcon />}
        </Icon>
      </FlexItem>
      <FlexItem>
        <Content component={ContentVariants.p}>
          {props.enabled ? t('common.tracing.enabled') : t('common.tracing.disabled')}
        </Content>
      </FlexItem>
    </Flex>
  );
};
export { TracingEnabled };
