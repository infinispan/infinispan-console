import { Content, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import React from 'react';
import { useTranslation } from 'react-i18next';

const MetricDescriptionListGroup = (props: {
  metricName: string;
  metricValue?: number;
  isBig?: boolean;
  ariaLabel?: string;
  dataCy?: string;
}) => {
  const { t } = useTranslation();

  return (
    <DescriptionListGroup aria-label={props.ariaLabel}>
      <DescriptionListTerm>
        <Content data-cy={props.dataCy + '-val'}>
          {props.isBig ? displayUtils.formatBigNumber(props.metricValue) : displayUtils.formatNumber(props.metricValue)}
        </Content>
      </DescriptionListTerm>
      <DescriptionListDescription data-cy={props.dataCy + '-desc'}>
        {t(props.metricName)}
        <PopoverHelp name={props.metricName} label={t(props.metricName)} content={t(`${props.metricName}-tooltip`)} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export { MetricDescriptionListGroup };
