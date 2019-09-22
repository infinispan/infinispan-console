import React from 'react';
import {LoginForm, LoginPage, PageSection, Title} from '@patternfly/react-core';

/**
 * Note: When using background-filter.svg, you must also include #image_overlay as the fragment identifier
 */

const images = {};

const InfinispanLogin: React.FunctionComponent<any> = (props) => {
  return (
      <LoginPage footerListVariants="inline"
                 brandImgAlt="PatternFly logo"
                 backgroundImgAlt="Images"
                 textContent="This is placeholder text only. Use this area to place any information or introductory message about your
        application that may be relevant to users."
                 loginTitle="Log in to your account"
                 loginSubtitle="Please use your single sign-on LDAP credentials">
        <LoginForm
          usernameLabel="Username"
          usernameValue="this.state.usernameValue"
          passwordLabel="Password"
          rememberMeLabel="Keep me logged in for 30 days."
        />

      </LoginPage>
  );
}
export default InfinispanLogin;
