import {Button, ButtonVariant, Modal, Text, TextContent} from "@patternfly/react-core";
import React from "react";
import {useTranslation} from "react-i18next";

/**
 * Rebalancing confirmation modal
 */
const RebalancingConfirmationModal = (props: {
  isModalOpen: boolean;
  confirmAction: () => void;
  closeModal: (boolean) => void;
  enabled: boolean;
  type: 'caches' | 'cache-managers'
}) => {
  const { t } = useTranslation();
  return (
    <Modal data-cy='rebalancingModal'
      titleIconVariant={props.enabled? 'warning' : 'info'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={props.enabled? t(props.type + '.rebalancing.modal-disable-title') : t(props.type + '.rebalancing.modal-enable-title')}
      onClose={() => props.closeModal}
      aria-label={
        props.enabled? 'Disable' : 'Enable'
      }
      actions={[
        <Button
          variant={props.enabled? ButtonVariant.danger : ButtonVariant.primary}
          key={
            props.enabled
              ? 'disable-rebalancing'
              : 'enable-rebalancing'
          }
          data-cy='rebalanceChangeButton'
          onClick={props.confirmAction}
        >
          {props.enabled ?  t(props.type + '.rebalancing.modal-disable-button') :  t(props.type + '.rebalancing.modal-enable-button')}
        </Button>,
        <Button data-cy='rebalanceChangeCancelButton'
          key="cancel"
          variant="link"
          onClick={props.closeModal}
        >
          {t(props.type + '.rebalancing.modal-cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          {t(props.type + '.rebalancing.modal-description')}
        </Text>
      </TextContent>
    </Modal>
  );
};

export { RebalancingConfirmationModal };
