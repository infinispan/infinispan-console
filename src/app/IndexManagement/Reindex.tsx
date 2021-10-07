import React from 'react';
import { Button, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";

/**
 * Reindex modal
 */
const Reindex = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const onClickReindex = () => {
    ConsoleServices.search().reindex(props.cacheName).then((actionResponse) => {
      props.closeModal();
      addAlert(actionResponse);
    });
  };

  return (
    <Modal
      titleIconVariant={'info'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Rebuild index?'}
      onClose={props.closeModal}
      aria-label="Reindex modal"
      actions={[
        <Button key="reindex" onClick={onClickReindex}>
          Rebuild index
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          All indexes will be rebuilt. To ensure accurate results, do not query caches until rebuilding is complete.
          <br />
          This process may take a few minutes.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { Reindex };
