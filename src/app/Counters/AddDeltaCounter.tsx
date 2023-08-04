import React from 'react';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  Text,
  TextContent,
  TextInput
} from '@patternfly/react-core';
import { useAddDeltaCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const AddDeltaCounter = (props: {
  name: string;
  deltaValue: number;
  setDeltaValue;
  isDeltaValid: boolean;
  submitModal: () => void;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onAddDelta } = useAddDeltaCounter(props.name, props.deltaValue);

  const handleSubmit = () => {
    if (props.isDeltaValid) {
      onAddDelta();
      props.submitModal();
    }
  };

  const validateForm = (): 'default' | 'error' => {
    return props.isDeltaValid ? 'default' : 'error';
  };

  return (
    <Modal
      id={'add-delta-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('cache-managers.counters.modal-delta-title')}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-delta-title')}
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Confirm'}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={handleSubmit}
          data-cy="confirmAddDeltaButton"
        >
          {t('cache-managers.counters.modal-confirm-button')}
        </Button>,
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelAddDeltaButton"
        >
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          Increment or decrement counter <strong>{props.name}</strong> with arbitrary values. To subtract counter value
          use negative numbers.
        </Text>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup>
            <TextInput
              validated={validateForm()}
              value={props.deltaValue}
              type="number"
              onChange={(_event, value) => props.setDeltaValue(value)}
              aria-label={'delta-text-input'}
              data-cy="counterDeltaNum"
            />
            {validateForm() && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {t('cache-managers.counters.modal-delta-helper-invalid')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </Form>
      </TextContent>
    </Modal>
  );
};

export { AddDeltaCounter };
