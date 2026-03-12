import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useDeleteByQuery } from '@app/services/searchHook';

const DeleteByQueryEntries = (props: {
  cacheName: string;
  query: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { setExecute } = useDeleteByQuery(props.cacheName, props.query, props.closeModal);

  return (
    <Modal
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('caches.query.modal-delete-entries-label')}
    >
      <ModalHeader titleIconVariant={'warning'} title={t('caches.query.modal-delete-entries-title')} />
      <ModalBody>
        <Content component={'p'}>
          {t('caches.query.modal-delete-entries-body-line-one', {
            cacheName: props.cacheName
          })}
        </Content>
        <Content component={'p'}>{t('caches.query.modal-delete-entries-body-line-two')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button data-cy="deleteButton" key="confirm" variant={ButtonVariant.danger} onClick={() => setExecute(true)}>
          {t('common.actions.delete')}
        </Button>
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteByQueryEntries };
