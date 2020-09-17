import {Health} from "@app/Common/Health";
import {ComponentHealth} from "@services/utils";
import React from "react";
import {render} from "@testing-library/react";

describe('Health Component Test', () => {
  test('Health label is displayed', () => {
    let healthy = ComponentHealth.HEALTHY.toString();
    const healthComponent = render(<Health health={healthy}/>);
    expect(healthComponent.container.firstChild).toMatchSnapshot();
  });
});
