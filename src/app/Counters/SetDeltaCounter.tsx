import React, { useState, useEffect } from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent, TextInput } from '@patternfly/react-core';
import { useSetDeltaCounter } from '@app/services/countersHook';
import { number } from 'prop-types';

/**
 * Delete counter modal
 */
const SetDeltaCounter = (props: { name: string; deltaValue: number; isModalOpen: boolean; closeModal: () => void }) => {
  const { onSetDelta } = useSetDeltaCounter(props.name, props.deltaValue);
  const [value, setValue] = useState<number>(props.deltaValue);

  return (
    <Modal
      id={'delta-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Set delta value for counter'}
      onClose={props.closeModal}
      aria-label="Set delta value for counter"
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Confirm'}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onSetDelta();
            props.closeModal();
          }}
        >
          Confirm
        </Button>,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={props.closeModal}>
          Cancel
        </Button>
      ]}
    >
      <TextContent>
        <Text>Set value for delta</Text>
        <TextInput
          value={value}
          type="number"
          onChange={(val) => setValue(parseInt(val))}
          aria-label="text area example"
        />
      </TextContent>
    </Modal>
  );
};

export { SetDeltaCounter };
