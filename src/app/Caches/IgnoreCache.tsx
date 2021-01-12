import React from 'react';
import { Button, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useCaches } from '@app/services/dataContainerHooks';
import { useTranslation } from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";

/**
 * Ignore cache modal
 */
const IgnoreCache = (props: {
  cmName: string;
  cacheName: string;
  isModalOpen: boolean;
  closeModal: (boolean) => void;
  action: string;
}) => {
  const { addAlert } = useApiAlert();
  const { reloadCaches } = useCaches();

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const clearIgnoreCacheModal = (ignoreDone: boolean) => {
    props.closeModal(ignoreDone);
  };

  const handleIgnoreButton = () => {
    if (props.action == 'ignore') {
      ConsoleServices.caches()
        .ignoreCache(props.cmName, props.cacheName)
        .then((actionResponse) => {
          clearIgnoreCacheModal(actionResponse.success);
          addAlert(actionResponse);
          reloadCaches();
        });
    } else {
      ConsoleServices.caches()
        .undoIgnoreCache(props.cmName, props.cacheName)
        .then((actionResponse) => {
          clearIgnoreCacheModal(actionResponse.success);
          addAlert(actionResponse);
          reloadCaches();
        });
    }
  };

  const buildContent = () => {
    if (props.action == 'undo') {
      return (
        <TextContent>
          <Text>
            <strong>'{props.cacheName}'</strong> will be accessible again .
          </Text>
        </TextContent>
      );
    }
    return (
      <TextContent>
        <Text>
          You won't be able to access <strong>'{props.cacheName}'</strong> cache
          anymore after you perform ignore cache .
          <br />
          You can undo the ignore cache operation.
        </Text>
      </TextContent>
    );
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={props.action == 'ignore' ? 'Ignore Cache?' : 'Undo ignore cache?'}
      onClose={() => clearIgnoreCacheModal(false)}
      aria-label={
        props.action == 'ignore'
          ? 'Ignore cache modal'
          : 'Undo ignore cache modal'
      }
      actions={[
        <Button
          key={
            props.action == 'ignore'
              ? 'ignore-modal-button'
              : 'undo-ignore-modal'
          }
          onClick={handleIgnoreButton}
        >
          {props.action == 'ignore' ? 'Ignore' : 'Undo ignore'}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => clearIgnoreCacheModal(false)}
        >
          Cancel
        </Button>,
      ]}
    >
      {buildContent()}
    </Modal>
  );
};

export { IgnoreCache };
