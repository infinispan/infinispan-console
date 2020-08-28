import * as React from 'react';
import {Button, Modal, Stack, StackItem, Text, TextContent, TextVariants} from '@patternfly/react-core';
import {
  global_FontSize_4xl,
  global_spacer_md,
  global_spacer_sm,
  global_warning_color_100
} from "@patternfly/react-tokens";
import {ExclamationTriangleIcon} from "@patternfly/react-icons";

/**
 * Support pop up when the user has run the server and there is no user/password to log in
 */
const Support = (props: {
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const header = (
    <Stack hasGutter={true}>
      <StackItem>
        <TextContent>
          <Text component={TextVariants.h1}>
            <ExclamationTriangleIcon style={{
              color: global_warning_color_100.value,
              fontSize: global_FontSize_4xl.value,
              verticalAlign: "middle",
              marginRight: global_spacer_md.value,
              marginBottom: global_spacer_sm.value
            }}/>
            User not configured
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent>
          <Text>
            By default, Infinispan Server requires user authentication, but you did not
            configure any user before running the server.
          </Text>
        </TextContent>
      </StackItem>
    </Stack>
  );

  return (
    <Modal
      className="pf-m-redhat-font"
      header={header}
      width={'80%'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label="Unable to log"
      actions={[
        <Button key="reload" onClick={props.closeModal}>
          Reload
        </Button>
      ]}
    >
      <TextContent>
        <Text component={TextVariants.h6}>Download and run</Text>
        <Text component={TextVariants.pre}>
          ./bin/cli.sh user create admin -p pass
        </Text>
        <Text component={TextVariants.pre}>
          ./bin/server.sh
        </Text>
        <Text component={TextVariants.h6}>Podman</Text>
        <Text component={TextVariants.pre}>
          podman run --net=host -p 11222:11222 -e USER="admin" -e PASS="pass" quay.io/infinispan/server:12.0
        </Text>
        <Text component={TextVariants.h6}>Docker</Text>
        <Text component={TextVariants.pre}>
          docker run -it -p 11222:11222 -e USER="admin" -e PASS="pass" infinispan/server:12.0
        </Text>
      </TextContent>
    </Modal>
  );
};

export { Support };
