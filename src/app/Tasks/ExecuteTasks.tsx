import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  Text,
  TextContent,
  TextInput
} from '@patternfly/react-core';
import { useExecuteTask } from '@app/services/tasksHook';
import { useTranslation } from 'react-i18next';

const ExecuteTasks = (props: { task; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const [paramsValue, setParamsValue] = useState({});
  const { onExecute } = useExecuteTask(props.task?.name, paramsValue);

  useEffect(() => {
    const obj = props.task?.parameters?.reduce((o, key) => ({ ...o, [key]: '' }), {});
    setParamsValue(obj);
  }, [props.task]);

  const onValueChange = (parameter, value) => {
    setParamsValue((prevState) => ({
      ...prevState,
      [parameter]: value
    }));
  };

  return (
    <Modal
      height={'1000px'}
      id={'execute-task-modal'}
      variant={ModalVariant.medium}
      isOpen={props.isModalOpen}
      title={t('cache-managers.tasks.execution')}
      onClose={props.closeModal}
      aria-label={t('cache-managers.tasks.execution')}
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Confirm'}
          aria-label={'Confirm'}
          variant={ButtonVariant.primary}
          onClick={() => {
            onExecute();
            props.closeModal();
          }}
        >
          {t('cache-managers.tasks.execute')}
        </Button>,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={props.closeModal}>
          {t('cache-managers.tasks.cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          There are multiple parameters on the script <strong>{props.task?.name}</strong>. Select a parameter to run
          script.
        </Text>
      </TextContent>
      {props.task !== undefined && (
        <Form style={{ paddingTop: '3%' }} isHorizontal onSubmit={(e) => e.preventDefault()}>
          {props.task.parameters?.map((p) => {
            return (
              <FormGroup key={p} isStack label={p}>
                <TextInput type="text" onChange={(val) => onValueChange(p, val)} />
              </FormGroup>
            );
          })}
        </Form>
      )}
    </Modal>
  );
};

export { ExecuteTasks };
