import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Alert, PageSection } from '@patternfly/react-core';

const NotFound = () => {
  return (
    <PageSection>
      <Alert variant="danger" title="404! This view hasn't been created yet." />
      <br />
      <NavLink to="/" className="pf-c-nav__link">
        Data container
      </NavLink>
    </PageSection>
  );
};

export { NotFound };
