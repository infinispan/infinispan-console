import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  Tabs,
  TabsComponent,
  TabTitleText,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { CacheMetrics } from '@app/Caches/CacheMetrics';
import { CacheEntries } from '@app/Caches/Entries/CacheEntries';
import { CacheConfiguration } from '@app/Caches/Configuration/CacheConfiguration';
import { CacheTypeBadge } from '@app/Common/CacheTypeBadge';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { global_danger_color_200 } from '@patternfly/react-tokens';
import {
  AngleDownIcon,
  AngleRightIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import { QueryEntries } from '@app/Caches/Query/QueryEntries';
import { RecentActivityTable } from '@app/Caches/RecentActivityTable';
import { Link } from 'react-router-dom';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { CacheDetailProvider } from '@app/providers/CacheDetailProvider';
import { useFetchCache } from '@app/services/cachesHook';
import { DetailCache } from '@app/Caches/DetailCache';

const DetailCachePage = (props) => {
  const cacheName = decodeURIComponent(props.computedMatch.params.cacheName);
  return (
    <CacheDetailProvider>
      <DetailCache cacheName={cacheName} />
    </CacheDetailProvider>
  );
};

export { DetailCachePage };
