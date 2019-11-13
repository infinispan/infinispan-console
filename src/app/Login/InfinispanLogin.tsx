import React, {useState} from 'react';
import {LoginForm, LoginPage, PageSection, Title} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/infinispan_icon.svg';

/**
 * Note: When using background-filter.svg, you must also include #image_overlay as the fragment identifier
 */

const images = {};

const InfinispanLogin: React.FunctionComponent<any> = (props) => {

  return (
      <LoginPage footerListVariants="inline"
                 brandImgSrc={icon}
                 loginTitle="Log in to Infinispan server">
        <LoginForm
          usernameLabel="Username"
          passwordLabel="Password"
        />

      </LoginPage>
  );
}
export default InfinispanLogin;
