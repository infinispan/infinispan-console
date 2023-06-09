import displayUtils, {
  CANCEL_STATUS,
  ERROR_STATUS,
  FAILED_STATUS,
  INIT_STATUS,
  INSTANTIATED_STATUS,
  OK_STATUS,
  RUNNING_STATUS,
  ST_IDLE,
  ST_SEND_CANCELED,
  ST_SEND_FAILED,
  ST_SEND_OK,
  ST_SENDING,
  STOPPING_STATUS,
  TERMINATED_STATUS,
  UNKNOWN_STATUS
} from '@services/displayUtils';
import {
  chart_color_cyan_100,
  chart_color_gold_100,
  chart_global_label_Fill,
  global_danger_color_100,
  global_palette_blue_50,
  global_palette_purple_100,
  global_success_color_100,
  global_warning_color_100
} from '@patternfly/react-tokens';
import { AlertVariant } from '@patternfly/react-core';
import { CacheType, ComponentHealth } from '@services/infinispanRefData';

describe('Display Utils tests', () => {
  test('parseStateTransferStatus', () => {
    expect(displayUtils.parseStateTransferStatus(undefined)).toBe(ST_IDLE);
    expect(displayUtils.parseStateTransferStatus('OK')).toBe(ST_SEND_OK);
    expect(displayUtils.parseStateTransferStatus('IDLE')).toBe(ST_IDLE);
    expect(displayUtils.parseStateTransferStatus('CANCELED')).toBe(ST_SEND_CANCELED);
    expect(displayUtils.parseStateTransferStatus('ERROR')).toBe(ST_SEND_FAILED);
    expect(displayUtils.parseStateTransferStatus('SENDING')).toBe(ST_SENDING);
  });

  test('parseComponentStatus', () => {
    expect(displayUtils.parseComponentStatus(undefined)).toBe(UNKNOWN_STATUS);
    expect(displayUtils.parseComponentStatus('OK')).toBe(OK_STATUS);
    expect(displayUtils.parseComponentStatus('RUNNING')).toBe(RUNNING_STATUS);
    expect(displayUtils.parseComponentStatus('INITIALIZING')).toBe(INIT_STATUS);
    expect(displayUtils.parseComponentStatus('CANCELLING')).toBe(CANCEL_STATUS);
    expect(displayUtils.parseComponentStatus('FAILED')).toBe(FAILED_STATUS);
    expect(displayUtils.parseComponentStatus('ERROR')).toBe(ERROR_STATUS);
    expect(displayUtils.parseComponentStatus('STOPPING')).toBe(STOPPING_STATUS);
    expect(displayUtils.parseComponentStatus('TERMINATED')).toBe(TERMINATED_STATUS);
    expect(displayUtils.parseComponentStatus('INSTANTIATED')).toBe(INSTANTIATED_STATUS);
  });

  test('format number should cut 2 digits', () => {
    expect(displayUtils.formatNumber(undefined)).toBe('0');
    expect(displayUtils.formatNumber(12.9999)).toBe('13');
    expect(displayUtils.formatNumber(12.349876567)).toBe('12.35');
  });

  test('cache type color', () => {
    expect(displayUtils.cacheTypeLabelBackgroundColor(CacheType.Distributed)).toBe(global_palette_blue_50.value);
    expect(displayUtils.cacheTypeLabelBackgroundColor(CacheType.Replicated)).toBe(global_palette_purple_100.value);
    expect(displayUtils.cacheTypeLabelBackgroundColor(CacheType.Invalidated)).toBe(chart_color_gold_100.value);
    expect(displayUtils.cacheTypeLabelBackgroundColor(CacheType.Local)).toBe(chart_color_cyan_100.value);
  });

  test('health alert variant', () => {
    expect(displayUtils.healthAlertVariant(undefined)).toBe(AlertVariant.default);
    expect(displayUtils.healthAlertVariant(ComponentHealth.DEGRADED)).toBe(AlertVariant.danger);
    expect(displayUtils.healthAlertVariant(ComponentHealth.HEALTHY_REBALANCING)).toBe(AlertVariant.warning);
    expect(displayUtils.healthAlertVariant(ComponentHealth.HEALTHY)).toBe(AlertVariant.success);
    expect(displayUtils.healthAlertVariant(ComponentHealth.FAILED)).toBe(AlertVariant.danger);
  });

  test('health label', () => {
    expect(displayUtils.healthLabel(ComponentHealth.HEALTHY)).toBe('Healthy');
    expect(displayUtils.healthLabel(ComponentHealth.HEALTHY_REBALANCING)).toBe('Rebalancing');
    expect(displayUtils.healthLabel(ComponentHealth.DEGRADED)).toBe('Degraded');
    expect(displayUtils.healthLabel(ComponentHealth.FAILED)).toBe('Failed');
  });

  test('health color', () => {
    expect(displayUtils.healthColor(undefined, false)).toBe(chart_global_label_Fill.value);
    expect(displayUtils.healthColor(ComponentHealth.HEALTHY, false)).toBe(chart_global_label_Fill.value);
    expect(displayUtils.healthColor(ComponentHealth.DEGRADED, false)).toBe(global_danger_color_100.value);
    expect(displayUtils.healthColor(ComponentHealth.HEALTHY_REBALANCING, false)).toBe(chart_global_label_Fill.value);
    expect(displayUtils.healthColor(ComponentHealth.FAILED, false)).toBe(global_danger_color_100.value);

    expect(displayUtils.healthColor(ComponentHealth.HEALTHY, true)).toBe(global_success_color_100.value);
    expect(displayUtils.healthColor(ComponentHealth.DEGRADED, true)).toBe(global_danger_color_100.value);
    expect(displayUtils.healthColor(ComponentHealth.HEALTHY_REBALANCING, true)).toBe(global_warning_color_100.value);
    expect(displayUtils.healthColor(ComponentHealth.FAILED, true)).toBe(global_danger_color_100.value);
  });
});
