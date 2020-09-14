import {Health} from "@app/Common/Health";
import {ComponentHealth} from "@services/utils";
import {mount} from "enzyme";
import React from "react";
import {AlertIcon} from "@patternfly/react-core/dist/js/components/Alert/AlertIcon";
import displayUtils from "@services/displayUtils";
import {Text} from "@patternfly/react-core";

describe('Health Component Test', () => {
  test('Health label is displayed', () => {
    let healthy = ComponentHealth.HEALTHY.toString();
    const healthComponent = mount(<Health health={healthy} />);
    const alert = healthComponent.find(AlertIcon);
    expect(alert.exists()).toBe(true);
    expect(healthComponent.contains(<Text>{displayUtils.healthLabel(healthy)}</Text>)).toBe(true);
  });
});
