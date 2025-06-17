import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

const DeleteByQueryEntries = (props: {
  cacheName: string;
  query: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onClickOnDeleteByQuery = () => {
    const match = props.query.match(/FROM\s+.+$/i);
    if (match) {
      ConsoleServices.search()
        .deleteByQuery(props.cacheName, `DELETE ${match[0]}`, t('caches.query.modal-action-entries-success'))
        .then((actionResponse) => {
          addAlert(actionResponse);
        })
        .finally(props.closeModal);
    } else {
      props.closeModal();
    }
  };

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
          {t('caches.query.modal-delete-entries-body-line-one', { cacheName: props.cacheName })}
        </Content>
        <Content component={'p'}>{t('caches.query.modal-delete-entries-body-line-two')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button data-cy="deleteButton" key="confirm" variant={ButtonVariant.danger} onClick={onClickOnDeleteByQuery}>
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
