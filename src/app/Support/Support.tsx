import * as React from 'react';
import {
  Button,
  Modal,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import {
  global_FontSize_4xl,
  global_spacer_md,
  global_spacer_sm,
  global_warning_color_100,
} from '@patternfly/react-tokens';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

/**
 * Support pop up when the user has run the server and there is no user/password to log in
 */
const Support = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const header = (
    <Stack hasGutter={true}>
      <StackItem>
        <TextContent>
          <Text component={TextVariants.h1}>
            <ExclamationTriangleIcon
              style={{
                color: global_warning_color_100.value,
                fontSize: global_FontSize_4xl.value,
                verticalAlign: 'middle',
                marginRight: global_spacer_md.value,
                marginBottom: global_spacer_sm.value,
              }}
            />
            {t('support.no-user')}
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent>
          <Text>
            {t('support.no-user-text')}
          </Text>
        </TextContent>
      </StackItem>
    </Stack>
  );

  return (
    <Modal
      titleIconVariant={'info'}
      className="pf-m-redhat-font"
      header={header}
      width={'80%'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('support.no-user-label')}
      actions={[
        <Button aria-label={'Reload'} key="reload" onClick={props.closeModal}>
          {t('support.reload-button')}
        </Button>,
      ]}
    >
      <TextContent>
        <Text component={TextVariants.h6}>{t('support.text-create-user')}</Text>
        <Text component={TextVariants.pre}>
          {t('support.text-command')}
        </Text>
      </TextContent>
    </Modal>
  );
};

export { Support };
