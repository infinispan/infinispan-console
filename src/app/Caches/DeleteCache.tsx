import React, {useState} from 'react';
import {Button, ButtonVariant, Form, FormGroup, Modal, Text, TextContent, TextInput} from '@patternfly/react-core';
import cacheService from '@services/cacheService';
import {useApiAlert} from '@app/utils/useApiAlert';
import {useRecentActivity} from "@app/utils/useRecentActivity";

/**
 * Delete cache modal
 */
const DeleteCache = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: (boolean) => void;
}) => {
  const { addAlert } = useApiAlert();
  const { clearHistoryForCache} = useRecentActivity();

  const [isValidCacheNameValue, setIsValidCacheNameValue] = useState<('success' | 'error' | 'default')>('default');
  const [cacheNameFormValue, setCacheNameFormValue] = useState('');

  const clearDeleteCacheModal = (deleteDone: boolean) => {
    setIsValidCacheNameValue('default');
    setCacheNameFormValue('');
    props.closeModal(deleteDone);
  };

  const handleCacheNameToDeleteInputChange = value => {
    setCacheNameFormValue(value);
  };
  const handleDeleteButton = () => {
    let trim = cacheNameFormValue.trim();
    setCacheNameFormValue(trim);
    if (trim.length == 0) {
      setIsValidCacheNameValue('error');
      return;
    }

    let validCacheName = trim === props.cacheName;
    setIsValidCacheNameValue(validCacheName ? 'success' : 'error');
    if (validCacheName) {
      cacheService.deleteCache(props.cacheName).then(actionResponse => {
        clearDeleteCacheModal(actionResponse.success);
        addAlert(actionResponse);
        clearHistoryForCache(props.cacheName);
      });
    }
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title="Delete Cache?"
      onClose={() => clearDeleteCacheModal(false)}
      aria-label="Delete cache modal"
      description={
        <TextContent>
          <Text>
            This action will permanently delete cache{' '}
            <strong>'{props.cacheName}'</strong> and all it's data.
            <br />
            This cannot be undone.
          </Text>
        </TextContent>
      }
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={handleDeleteButton}
          isDisabled={cacheNameFormValue == ''}
        >
          Delete
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => clearDeleteCacheModal(false)}
        >
          Cancel
        </Button>
      ]}
    >
      <Form>
        <FormGroup
          label="Type the CACHE NAME to confirm"
          helperTextInvalid="Cache names do not match"
          fieldId="cache-to-delete"
          validated={isValidCacheNameValue}
        >
          <TextInput
            validated={isValidCacheNameValue}
            value={cacheNameFormValue}
            id="cache-to-delete"
            aria-describedby="cache-to-delete-helper"
            onChange={handleCacheNameToDeleteInputChange}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { DeleteCache };
