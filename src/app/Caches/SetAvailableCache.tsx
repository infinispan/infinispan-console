import React from 'react';
import { Button, Modal, Text, TextContent } from '@patternfly/react-core';
import { useCaches } from '@app/services/dataContainerHooks';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { useSetAvailableCache } from '@app/services/cachesHook';

/**
 * Set Available cache modal
 */
const SetAvailableCache = (props: { cacheName: string; isModalOpen: boolean; closeModal: (boolean) => void }) => {
  const { reloadCaches } = useCaches();
  const { onSetAvailable } = useSetAvailableCache(props.cacheName);

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const clearSetAvailableCacheModal = (setAvailableDone: boolean) => {
    props.closeModal(setAvailableDone);
  };

  const handleAvailableButton = () => {
    if (props.cacheName) {
      onSetAvailable();
      clearSetAvailableCacheModal(true);
      reloadCaches();
    }
  };

  return (
    <Modal
      titleIconVariant={CheckCircleIcon}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('caches.availability.modal-available-title')}
      onClose={() => clearSetAvailableCacheModal(false)}
      aria-label="make-cache-available"
      description={
        <TextContent>
          <Text>
            <strong>'{props.cacheName}'</strong> {t('caches.availability.modal-available-description')}
          </Text>
        </TextContent>
      }
      actions={[
        <Button aria-label="Confirm" key="available" onClick={handleAvailableButton}>
          {t('caches.availability.modal-available-button-done')}
        </Button>,
        <Button aria-label="Cancel" key="cancel" variant="link" onClick={() => clearSetAvailableCacheModal(false)}>
          {t('caches.availability.modal-available-button-cancel')}
        </Button>
      ]}
    >
      {/* {buildContent()} */}
    </Modal>
  );
};

export { SetAvailableCache };
