import React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant
} from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';

const ActionResponseAlert = () => {
  const { alert, removeAlert } = useApiAlert();

  if (alert.message.length == 0) {
    return <span />;
  }

  return (
    <AlertGroup isToast>
      <Alert
        isLiveRegion
        title={alert.message}
        variant={alert.success ? AlertVariant.success : AlertVariant.danger}
        actionClose={<AlertActionCloseButton onClose={removeAlert} />}
      />
    </AlertGroup>
  );
};
export { ActionResponseAlert };
