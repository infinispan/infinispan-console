import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import * as React from 'react';

const DataContainerBreadcrumb = (props: {
  currentPage: string;
  cacheName?: string;
}) => {
  const addCacheName = () => {
    if (props.cacheName) {
      return (
        <BreadcrumbItem>
          <Link
            to={{
              pathname: '/cache/' + encodeURIComponent(props.cacheName),
            }}
          >
            {props.cacheName}
          </Link>
        </BreadcrumbItem>
      );
    }
    return;
  };

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Link
          to={{
            pathname: '/',
          }}
        >
          Data container
        </Link>
      </BreadcrumbItem>
      {addCacheName()}
      <BreadcrumbItem isActive>{props.currentPage}</BreadcrumbItem>
    </Breadcrumb>
  );
};

export { DataContainerBreadcrumb };
