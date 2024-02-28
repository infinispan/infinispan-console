import React from 'react';
import { Button, Modal, Text, TextContent } from '@patternfly/react-core';
import { useCaches } from '@app/services/dataContainerHooks';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useIgnoreCache, useUndoIgnoreCache } from '@app/services/cachesHook';

/**
 * Ignore cache modal
 */
const IgnoreCache = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: (boolean) => void;
  action: string;
}) => {
  const { reloadCaches } = useCaches();
  const { onIgnore } = useIgnoreCache(props.cacheName);
  const { onUndoIgnore } = useUndoIgnoreCache(props.cacheName);

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const clearIgnoreCacheModal = (ignoreDone: boolean) => {
    props.closeModal(ignoreDone);
  };

  const handleIgnoreButton = () => {
    if (props.action == 'ignore') {
      onIgnore();
      clearIgnoreCacheModal(true);
      reloadCaches();
    } else {
      onUndoIgnore();
      clearIgnoreCacheModal(true);
      reloadCaches();
    }
  };

  const buildContent = () => {
    if (props.action == 'undo') {
      return (
        <TextContent>
          <Text>
            Shows the <strong>{`' ${props.cacheName} '`}</strong>.
          </Text>
        </TextContent>
      );
    }
    return (
      <TextContent>
        <Text>
          Hides the <strong>{`'${props.cacheName}'`}</strong> cache.
          <br />
          {t('caches.ignore.hide-body')}
        </Text>
      </TextContent>
    );
  };

  return (
    <Modal
      data-cy={`${props.action}CacheModal`}
      id="hideShowModal"
      titleIconVariant={props.action == 'ignore' ? EyeSlashIcon : EyeIcon}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={props.action == 'ignore' ? t('caches.ignore.hide-title') : t('caches.ignore.show-title')}
      onClose={() => clearIgnoreCacheModal(false)}
      aria-label={props.action == 'ignore' ? 'Hide cache modal' : 'Show cache modal'}
      actions={[
        <Button
          aria-label={props.action == 'ignore' ? 'Hide' : 'Show'}
          key={props.action == 'ignore' ? 'ignore-modal-button' : 'undo-ignore-modal'}
          onClick={handleIgnoreButton}
          data-cy={props.action == 'ignore' ? 'hideCacheButton' : 'showCacheButton'}
        >
          {props.action == 'ignore' ? 'Hide' : 'Show'}
        </Button>,
        <Button
          aria-label="Cancel"
          key="cancel"
          variant="link"
          onClick={() => clearIgnoreCacheModal(false)}
          data-cy="cancelAction"
        >
          {t('caches.ignore.cancel')}
        </Button>
      ]}
    >
      {buildContent()}
    </Modal>
  );
};

export { IgnoreCache };
