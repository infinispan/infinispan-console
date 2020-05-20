import React, {useState} from 'react';
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
import {useApiAlert} from '@app/utils/useApiAlert';
import {global_spacer_md} from "@patternfly/react-tokens";
import protobufService from "../../services/protobufService";
import formUtils, {IField} from "../../services/formUtils";
import {MoreInfoTooltip} from "@app/Common/MoreInfoTooltip";

/**
 * Proto Schema creation form
 */
const CreateProtoSchema = (props: {
  isModalOpen: boolean;
  closeModal: (boolean) => void;
}) => {
  const { addAlert } = useApiAlert();
  const [error, setError] = useState<string | undefined>(undefined);

  const schemaNameInitialState:IField = {
    value: '',
    isValid: true,
    invalidText: 'Schema name is required',
    helperText:
      'The schema name must not exist',
    validated: 'default'};
  const [schemaName, setSchemaName] = useState<IField>(schemaNameInitialState);

  const schemaInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: 'Schema is required',
    helperText:
      'Protobuf schema',
    validated: 'default'};
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

    if(!isValid) {
      setError('There are form errors');
      return;
    }

    protobufService.createOrUpdateSchema(schemaName.value, schema.value, true).then(eitherCreate => {
      if(eitherCreate.isRight()) {
        addAlert(eitherCreate.value);
        clearCreateProtoSchema(true);
      } else {
        setError(eitherCreate.value.message);
      }
    })
  };

  const buildContent = () => {
    return (
      <Form
        onSubmit={e => {
          e.preventDefault();
        }}
        style={{ marginBottom: global_spacer_md.value }}
      >
        {error && (
          <Alert variant={AlertVariant.danger} isInline title={error} />
        )}

        <FormGroup
          label="Name:"
          isRequired
          fieldId="schema-name"
        >
          <TextInput
            value={schemaName.value}
            id="schemaName"
            aria-describedby="schema-name-helper"
            onChange={v => setSchemaName(prevState => { return { ...prevState, value: v.trim()}})}
            isValid={schemaName.isValid}
            validated={schemaName.validated}
          />
        </FormGroup>
        <FormGroup
          label={<MoreInfoTooltip
          label="Schema:"
          toolTip={
            'Protocol Buffers (a.k.a., protobuf) are Google\'s language-neutral, platform-neutral, extensible mechanism ' +
            'for serializing structured data. You can find protobuf\'s documentation on the Google Developers site.'
          }/>}
          isRequired
          fieldId="schema-content"
        >
          <TextArea
            value={schema.value}
            id="schema"
            aria-describedby="schema-content-helper"
            height={400}
            resizeOrientation={TextAreResizeOrientation.vertical}
            onChange={v => setSchema(prevState => { return { ...prevState, value: v }})}
            isValid={schema.isValid}
            validated={schema.validated}
            rows={15}
          />
        </FormGroup>
      </Form>
    )
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Add Protobuf Schema'}
      onClose={() => clearCreateProtoSchema(false)}
      isFooterLeftAligned
      aria-label="Add Protobuf Schema"
      actions={[
        <Button
          key="create-button"
          onClick={handleCreateButton}
        >
          Create
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => clearCreateProtoSchema(false)}
        >
          Cancel
        </Button>
      ]}
    >
      {buildContent()}
    </Modal>
  );
};

export { CreateProtoSchema };
