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
  TextInput,
} from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { global_spacer_md } from '@patternfly/react-tokens';
import formUtils, { IField } from '../../services/formUtils';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { useTranslation } from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";
import {AddCircleOIcon} from "@patternfly/react-icons";

/**
 * Proto Schema creation form
 */
const CreateProtoSchema = (props: {
  isModalOpen: boolean;
  closeModal: (boolean) => void;
}) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const [error, setError] = useState<string | undefined>(undefined);

  const schemaNameInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: 'Schema name is required',
    helperText: 'The schema name must not exist',
    validated: 'default',
  };
  const [schemaName, setSchemaName] = useState<IField>(schemaNameInitialState);

  const schemaInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: 'Schema is required',
    helperText: 'Protobuf schema',
    validated: 'default',
  };
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
    isValid =
      formUtils.validateRequiredField(
        schemaName.value,
        'Schema name',
        setSchemaName
      ) && isValid;
    isValid =
      formUtils.validateRequiredField(schema.value, 'Schema', setSchema) &&
      isValid;

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
        style={{ marginBottom: global_spacer_md.value }}
      >
        {error && (
          <Alert variant={AlertVariant.danger} isInline title={error} />
        )}

        <FormGroup label="Name:" isRequired fieldId="schema-name">
          <TextInput
            value={schemaName.value}
            id="schemaName"
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
          label={
            <MoreInfoTooltip
              label="Schema:"
              toolTip={
                "Protobuf schema describe entries in your caches so you can query them."
              }
            />
          }
          isRequired
          fieldId="schema-content"
        >
          <TextArea
            value={schema.value}
            id="schema"
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
      title={'Add Protobuf schema'}
      onClose={() => clearCreateProtoSchema(false)}
      aria-label="Add Protobuf schema"
      actions={[
        <Button key="create-button" onClick={handleCreateButton}>
          Add
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => clearCreateProtoSchema(false)}
        >
          Cancel
        </Button>,
      ]}
    >
      {buildContent()}
    </Modal>
  );
};

export { CreateProtoSchema };
