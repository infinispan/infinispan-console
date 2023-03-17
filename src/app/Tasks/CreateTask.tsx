import React, { useState } from 'react';
import { Button, ButtonVariant, Form, FormGroup, Modal, ModalVariant, TextInput } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CodeEditor } from '@patternfly/react-code-editor';
import formUtils, { IField } from '@services/formUtils';
import { useCreateTask } from '@app/services/tasksHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';

const CreateTask = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const nameInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const scriptInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [name, setName] = useState<IField>(nameInitialState);
  const [script, setScript] = useState<IField>(scriptInitialState);
  const { onCreateTask } = useCreateTask(name.value, script.value);

  const handleSubmit = () => {
    let isValid = true;
    isValid =
      formUtils.validateRequiredField(name.value.trim(), t('cache-managers.tasks.task-name'), setName) && isValid;
    isValid =
      formUtils.validateRequiredField(script.value.trim(), t('cache-managers.tasks.script'), setScript) && isValid;

    if (isValid) {
      onCreateTask();
      setName(nameInitialState);
      setScript(scriptInitialState);
      props.submitModal();
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
        <Button
          key={'Confirm'}
          data-cy="add-task-button"
          aria-label={'Confirm'}
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
        >
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
            id="task-name"
            aria-label="task-name"
            type="text"
            validated={name.validated}
            value={name.value}
            onChange={(value) => formUtils.validateRequiredField(value, t('cache-managers.tasks.task-name'), setName)}
          />
        </FormGroup>
        <FormGroup
          validated={script.validated}
          label={t('cache-managers.tasks.provide-script')}
          labelIcon={
            <PopoverHelp
              name="script"
              label={t('cache-managers.tasks.provide-script')}
              content={t('cache-managers.tasks.script-tooltip',{ brandname: brandname })}
            />
          }
          helperTextInvalid={script.invalidText}
          isRequired
        >
          <CodeEditor
            id="script"
            isLineNumbersVisible
            code={script.value}
            onChange={(value) => formUtils.validateRequiredField(value, t('cache-managers.tasks.script'), setScript)}
            height="200px"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { CreateTask };
