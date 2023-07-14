import React, { useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  Form,
  FormGroup,
  Modal,
  TextArea,
  TextAreResizeOrientation,
  TextInput
} from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import formUtils, { IField } from '../../services/formUtils';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { PopoverHelp } from '@app/Common/PopoverHelp';

const schemaNameInitialState: IField = {
  value: '',
  isValid: true,
  invalidText: 'Schema name is required',
  helperText: 'The schema name must not exist',
  validated: 'default'
};

const schemaInitialState: IField = {
  value: '',
  isValid: true,
  invalidText: 'Schema is required',
  helperText: 'Protobuf schema',
  validated: 'default'
};

const CreateProtoSchema = (props: { isModalOpen: boolean; closeModal: (boolean) => void }) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();
  const [error, setError] = useState<string | undefined>(undefined);
  const [schemaName, setSchemaName] = useState<IField>(schemaNameInitialState);
  const [schema, setSchema] = useState<IField>(schemaInitialState);

  const clearCreateProtoSchema = (createDone: boolean) => {
    setSchemaName(schemaNameInitialState);
    setSchema(schemaInitialState);
    setError('');
    props.closeModal(createDone);
  };

  const handleCreateButton = () => {
    let isValid = true;
    setError(undefined);
    isValid = formUtils.validateRequiredField(schemaName.value, 'Schema name', setSchemaName) && isValid;
    isValid = formUtils.validateRequiredField(schema.value, 'Schema', setSchema) && isValid;

    if (!isValid) {
      setError('There are form errors');
      return;
    }

    ConsoleServices.protobuf()
      .createOrUpdateSchema(schemaName.value, schema.value, true)
      .then((actionResponse) => {
        if (actionResponse.success) {
          addAlert(actionResponse);
          clearCreateProtoSchema(true);
        } else {
          setError(actionResponse.message);
        }
      });
  };

  const buildContent = () => {
    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {error && <Alert variant={AlertVariant.danger} isInline title={error} />}

        <FormGroup label={t('schemas.create.name')} isRequired fieldId="schema-name">
          <TextInput
            value={schemaName.value}
            id="schema-name"
            name="schema-name"
            aria-label="schema-name"
            aria-describedby="schema-name-helper"
            onChange={(v) =>
              setSchemaName((prevState) => {
                return { ...prevState, value: v.trim() };
              })
            }
            validated={schemaName.validated}
          />
        </FormGroup>
        <FormGroup
          label={t('schemas.create.schema')}
          labelIcon={
            <PopoverHelp
              name="schema-content"
              label={t('schemas.create.schema')}
              content={t('schemas.create.schema-tooltip')}
            />
          }
          isRequired
          fieldId="schema-content"
        >
          <TextArea
            value={schema.value}
            id="schema"
            name="schema"
            aria-describedby="schema-content-helper"
            height={400}
            resizeOrientation={TextAreResizeOrientation.vertical}
            onChange={(v) =>
              setSchema((prevState) => {
                return { ...prevState, value: v };
              })
            }
            validated={schema.validated}
            rows={15}
          />
        </FormGroup>
      </Form>
    );
  };

  return (
    <Modal
      titleIconVariant={AddCircleOIcon}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('schemas.create.modal-title')}
      onClose={() => clearCreateProtoSchema(false)}
      aria-label="Add Protobuf schema"
      actions={[
        <Button
          data-cy="addSchemaButton"
          aria-label="add-schema-button"
          key="add-schema-button"
          onClick={handleCreateButton}
        >
          {t('schemas.add-button')}
        </Button>,
        <Button
          data-cy="cancelAddSchemaButton"
          aria-label="cancel-add-schema-button"
          key="cancel-add-schema-button"
          variant="link"
          onClick={() => clearCreateProtoSchema(false)}
        >
          {t('schemas.cancel-button')}
        </Button>
      ]}
    >
      {buildContent()}
    </Modal>
  );
};

export { CreateProtoSchema };
