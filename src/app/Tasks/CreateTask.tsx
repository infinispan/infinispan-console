import React, { useState } from 'react';
import { Button, ButtonVariant, Form, FormGroup, Modal, ModalVariant, TextInput } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CodeEditor } from '@patternfly/react-code-editor';
import formUtils, { IField } from '@services/formUtils';
import { useCreateTask } from '@app/services/tasksHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';

const CreateTask = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();

  const nameInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [name, setName] = useState<IField>(nameInitialState);
  const [script, setScript] = useState<string>('');
  const { onCreateTask } = useCreateTask(name.value, script);

  const handleSubmit = () => {
    const isValid = formUtils.validateRequiredField(
      name.value.trim(),
      t('cache-managers.counters.modal-counter-name'),
      setName
    );

    if (isValid) {
      props.submitModal();
      onCreateTask();
    }
  };

  return (
    <Modal
      id={'create-task-modal'}
      variant={ModalVariant.medium}
      isOpen={props.isModalOpen}
      title={t('cache-managers.tasks.create-task')}
      onClose={props.closeModal}
      aria-label={t('cache-managers.tasks.create-task')}
      disableFocusTrap={true}
      actions={[
        <Button key={'Confirm'} aria-label={'Confirm'} variant={ButtonVariant.primary} onClick={handleSubmit}>
          {t('cache-managers.tasks.confirm')}
        </Button>,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={props.closeModal}>
          {t('cache-managers.tasks.cancel')}
        </Button>
      ]}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup
          validated={name.validated}
          isRequired
          helperTextInvalid={name.invalidText}
          isInline
          label={t('cache-managers.tasks.task-name')}
        >
          <TextInput
            type="text"
            validated={name.validated}
            value={name.value}
            onChange={(value) => formUtils.validateRequiredField(value, t('cache-managers.tasks.task-name'), setName)}
          />
        </FormGroup>
        <FormGroup
          label={t('cache-managers.tasks.script')}
          labelIcon={
            <PopoverHelp
              name="script"
              label={t('cache-managers.tasks.script')}
              content={t('cache-managers.tasks.script-tooltip')}
            />
          }
        >
          <CodeEditor isLineNumbersVisible code={script} onChange={setScript} height="200px" />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { CreateTask };
