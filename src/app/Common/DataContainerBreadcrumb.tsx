import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import * as React from 'react';

const DataContainerBreadcrumb = (props: { currentPage: string; cacheName?: string }) => {
  const addCacheName = () => {
    if (props.cacheName) {
      return (
        <BreadcrumbItem data-cy="cacheNameLink">
          <Link
            to={{
              pathname: '/cache/' + encodeURIComponent(props.cacheName),
              search: location.search
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
      <BreadcrumbItem data-cy="dataContainerLink">
        <Link
          to={{
            pathname: '/',
            search: location.search
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
