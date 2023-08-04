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
import { useSetCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const SetCounter = (props: {
  name: string;
  value: number;
  setValue;
  isValid: boolean;
  submitModal: () => void;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onSetCounter } = useSetCounter(props.name, props.value);

  const handleSubmit = () => {
    if (props.isValid) {
      onSetCounter();
      props.submitModal();
    }
  };

  const validateForm = (): 'default' | 'error' => {
    return props.isValid ? 'default' : 'error';
  };

  return (
    <Modal
      id={'set-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('cache-managers.counters.modal-set-title')}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-set-title')}
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Confirm'}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={handleSubmit}
          data-cy="confirmSetbutton"
        >
          {t('cache-managers.counters.modal-confirm-button')}
        </Button>,
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelSetButton"
        >
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          Edit value for counter <strong>{props.name}</strong>.
        </Text>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup>
            <TextInput
              validated={validateForm()}
              value={props.value}
              type="number"
              onChange={(_event, value) => props.setValue(value)}
              aria-label={'set-text-input'}
              data-cy="counterSetNum"
            />
            {validateForm() === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {t('cache-managers.counters.modal-set-helper-invalid')}
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

export { SetCounter };
