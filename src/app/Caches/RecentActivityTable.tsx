import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant
} from '@patternfly/react-table';
import { global_spacer_md } from '@patternfly/react-tokens';
import {
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateVariant,
  Title
} from '@patternfly/react-core';
import { useRecentActivity } from '@app/utils/useRecentActivity';

const RecentActivityTable = (props: { cacheName: string }) => {
  const { activities } = useRecentActivity();

  const columns = [
    { title: 'Key' },
    { title: 'Action' },
    { title: 'Local Date-Time' }
  ];

  const buildRows = () => {
    let cacheActivities: Activity[] = activities[props.cacheName];
    if (cacheActivities == null || cacheActivities.length == 0) {
      return [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 3 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                      There is no recent activity
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    }

    return cacheActivities.map(activity => {
      return {
        heightAuto: true,
        cells: [
          { title: activity.entryKey },
          { title: activity.action },
          { title: activity.date.toLocaleString() }
        ]
      };
    });
  };

  return (
    <Card style={{ marginTop: global_spacer_md.value}}>
      <CardHeader>Recent Activity</CardHeader>
      <CardBody>
        <Table
          aria-label="Recent Activity Table"
          cells={columns}
          rows={buildRows()}
          variant={TableVariant.compact}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </CardBody>
    </Card>
  );
};

export { RecentActivityTable };
