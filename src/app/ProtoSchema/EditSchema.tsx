import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { CodeEditor } from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import {
  useEditProtobufSchema,
  useFetchProtobufSchemaContent,
} from '@app/services/protobufHooks';
import { PencilAltIcon } from '@patternfly/react-icons';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { Language } from '@patternfly/react-code-editor';
import { PROTO_LANGUAGE_ID, registerProtobufLanguage } from './protoLanguage';

registerProtobufLanguage();

const EditSchema = (props: {
  schemaName: string;
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [editSchemaContent, setEditSchemaContent] = useState<string>('');
  const { onEditSchema } = useEditProtobufSchema(
    props.schemaName,
    editSchemaContent,
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const { schemaContent, setLoading } = useFetchProtobufSchemaContent(
    props.schemaName,
  );

  useEffect(() => {
    if (props.schemaName !== '') {
      setLoading(true);
    }
  }, [props.schemaName]);

  useEffect(() => {
    if (schemaContent) setEditSchemaContent(schemaContent);
  }, [schemaContent]);

  const onClickEditButton = () => {
    if (editSchemaContent.length === 0) {
      setError('Schema is required');
      return;
    }

    setError(undefined);
    onEditSchema().then(() => {
      props.submitModal();
    });
  };

  return (
    <Modal
      id={'edit-schema-modal'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label="Edit schema modal"
      variant="medium"
    >
      <ModalHeader
        titleIconVariant={PencilAltIcon}
        title={t('schemas.edit.heading')}
      />
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {error && (
            <Alert variant={AlertVariant.danger} isInline title={error} />
          )}

          <FormGroup label={t('schemas.create.name')} fieldId="schema-name">
            <strong>{props.schemaName}</strong>
          </FormGroup>
          <FormGroup
            label={t('schemas.create.schema')}
            labelHelp={
              <PopoverHelp
                name="schema-content"
                label={t('schemas.create.schema')}
                content={t('schemas.create.schema-tooltip')}
              />
            }
            isRequired
            fieldId="schema-content"
          >
            <CodeEditor
              id="schema-edit"
              isLineNumbersVisible
              isUploadEnabled
              language={PROTO_LANGUAGE_ID as Language}
              code={editSchemaContent}
              onCodeChange={(v) => setEditSchemaContent(v)}
              height="60vh"
              isDarkTheme={theme === DARK}
              options={{ editContext: false }}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="confirm-edit-schema-button"
          name="confirm-edit-schema-button"
          aria-label="confirm-edit-schema-button"
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={onClickEditButton}
          isDisabled={editSchemaContent.length === 0}
        >
          {t('schemas.save-button')}
        </Button>
        <Button
          id="cancel-edit-schema-button"
          name="cancel-edit-schema-button"
          aria-label="cancel-edit-schema-button"
          key="cancel"
          variant="link"
          onClick={props.closeModal}
        >
          {t('schemas.cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { EditSchema };
