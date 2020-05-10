import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import * as React from 'react';

const DataContainerBreadcrumb = (props: { currentPage: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Link
          to={{
            pathname: '/'
          }}
        >
          Data container
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem isActive>{props.currentPage}</BreadcrumbItem>
    </Breadcrumb>
  );
};

export { DataContainerBreadcrumb };
