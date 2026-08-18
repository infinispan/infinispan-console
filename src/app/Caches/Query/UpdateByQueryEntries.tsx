import React from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useUpdateByQuery } from '@app/hooks/searchHook';

const UpdateByQueryEntries = (props: {
  cacheName: string;
  query: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { setExecute } = useUpdateByQuery(
    props.cacheName,
    props.query,
    props.closeModal,
  );

  return (
    <Modal
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('caches.query.modal-update-entries-label')}
    >
      <ModalHeader
        titleIconVariant={'warning'}
        title={t('caches.query.modal-update-entries-title')}
      />
      <ModalBody>
        <Content component={'p'}>
          {t('caches.query.modal-update-entries-body-line-one', {
            cacheName: props.cacheName,
          })}
        </Content>
        <Content component={'p'}>
          {t('caches.query.modal-update-entries-body-line-two')}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="updateButton"
          key="confirm"
          variant={ButtonVariant.warning}
          onClick={() => setExecute(true)}
        >
          {t('common.actions.update')}
        </Button>
        <Button
          data-cy="cancelButton"
          key="cancel"
          variant="link"
          onClick={props.closeModal}
        >
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { UpdateByQueryEntries };
