import {mount, shallow} from "enzyme";
import {Support} from "@app/Support/Support";
import React from "react";
import {Modal} from "@patternfly/react-core";

describe('Support page', () => {
  test('should render Support component', () => {
    const view = shallow(<Support isModalOpen={true} closeModal={() => {}}/>);
    expect(view).toMatchSnapshot();
  });

  it('should hide the modal when the support page is closed', () => {
    const support = mount(<Support isModalOpen={false} closeModal={() => {}} />);
    let supportModal = support.find(Modal);
    expect(supportModal.props().isOpen).toBe(false);
  });

  it('should call the close function when the modal is closed', () => {
    let click = 0;
    const support = mount(<Support isModalOpen={false} closeModal={() => click=42} />);
    let supportModal = support.find(Modal);
    expect(supportModal.props().onClose).toBeDefined();
    // @ts-ignore
    supportModal.props().onClose();
    expect(click).toBe(42);
  });
});
