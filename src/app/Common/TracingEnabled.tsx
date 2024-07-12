import React from 'react';
import { AlertVariant, Flex, FlexItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { AlertIcon } from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import { useTranslation } from 'react-i18next';
import { global_disabled_color_100, global_info_color_100 } from '@patternfly/react-tokens';

const TracingEnabled = (props: { enabled: boolean }) => {
  const { t } = useTranslation();

  return (
    <Flex data-cy="tracingEnabled">
      <FlexItem spacer={{ default: 'spacerXs' }}>
        <AlertIcon
          variant={AlertVariant.info}
          style={{
            color: props.enabled ? global_info_color_100.value : global_disabled_color_100.value,
            display: 'inline'
          }}
        />
      </FlexItem>
      <FlexItem>
        <TextContent>
          <Text component={TextVariants.p}>
            {props.enabled ? t('common.tracing.enabled') : t('common.tracing.disabled')}
          </Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );
};
export { TracingEnabled };
