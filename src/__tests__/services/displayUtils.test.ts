import displayUtils, {
  CANCEL_CS, ERROR_CS,
  FAILED_CS,
  INIT_CS, INSTANTIATED_CS,
  OK_CS,
  RUNNING_CS,
  SENDING_CS, STOPPING_CS, TERMINATED_CS,
  UNKNOWN_CS
} from '@services/displayUtils';
import {
  chart_color_cyan_100,
  chart_color_gold_100,
  chart_global_label_Fill,
  global_danger_color_100,
  global_palette_blue_50,
  global_palette_purple_100,
  global_success_color_100,
  global_warning_color_100,
} from '@patternfly/react-tokens';
import { AlertVariant } from '@patternfly/react-core';
import {CacheType, ComponentHealth} from "@services/infinispanRefData";

describe('Display Utils tests', () => {
  test('parseComponentStatus', () => {
    expect(displayUtils.parseComponentStatus(undefined)).toBe(UNKNOWN_CS);
    expect(displayUtils.parseComponentStatus('OK')).toBe(OK_CS);
    expect(displayUtils.parseComponentStatus('RUNNING')).toBe(RUNNING_CS);
    expect(displayUtils.parseComponentStatus('INITIALIZING')).toBe(INIT_CS);
    expect(displayUtils.parseComponentStatus('CANCELLING')).toBe(CANCEL_CS);
    expect(displayUtils.parseComponentStatus('SENDING')).toBe(SENDING_CS);
    expect(displayUtils.parseComponentStatus('FAILED')).toBe(FAILED_CS);
    expect(displayUtils.parseComponentStatus('ERROR')).toBe(ERROR_CS);
    expect(displayUtils.parseComponentStatus('STOPPING')).toBe(STOPPING_CS);
    expect(displayUtils.parseComponentStatus('TERMINATED')).toBe(TERMINATED_CS);
    expect(displayUtils.parseComponentStatus('INSTANTIATED')).toBe(INSTANTIATED_CS);
  });

  test('format number should cut 2 digits', () => {
    expect(displayUtils.formatNumber(undefined)).toBe('0');
    expect(displayUtils.formatNumber(12.9999)).toBe('13');
    expect(displayUtils.formatNumber(12.349876567)).toBe('12.35');
  });

  test('cache type color', () => {
    expect(displayUtils.cacheTypeColor(CacheType.Distributed)).toBe(
      global_palette_blue_50.value
    );
    expect(displayUtils.cacheTypeColor(CacheType.Replicated)).toBe(
      global_palette_purple_100.value
    );
    expect(displayUtils.cacheTypeColor(CacheType.Invalidated)).toBe(
      chart_color_gold_100.value
    );
    expect(displayUtils.cacheTypeColor(CacheType.Local)).toBe(
      chart_color_cyan_100.value
    );
  });

  test('health alert variant', () => {
    expect(displayUtils.healthAlertVariant(undefined)).toBe(
      AlertVariant.default
    );
    expect(displayUtils.healthAlertVariant(ComponentHealth.DEGRADED)).toBe(
      AlertVariant.danger
    );
    expect(
      displayUtils.healthAlertVariant(ComponentHealth.HEALTHY_REBALANCING)
    ).toBe(AlertVariant.warning);
    expect(displayUtils.healthAlertVariant(ComponentHealth.HEALTHY)).toBe(
      AlertVariant.success
    );
    expect(displayUtils.healthAlertVariant(ComponentHealth.FAILED)).toBe(
      AlertVariant.danger
    );
  });

  test('health label', () => {
    expect(displayUtils.healthLabel(ComponentHealth.HEALTHY)).toBe('Healthy');
    expect(displayUtils.healthLabel(ComponentHealth.HEALTHY_REBALANCING)).toBe(
      'Rebalancing'
    );
    expect(displayUtils.healthLabel(ComponentHealth.DEGRADED)).toBe('Degraded');
    expect(displayUtils.healthLabel(ComponentHealth.FAILED)).toBe('Failed');
  });

  test('health color', () => {
    expect(displayUtils.healthColor(undefined, false)).toBe(
      chart_global_label_Fill.value
    );
    expect(displayUtils.healthColor(ComponentHealth.HEALTHY, false)).toBe(
      chart_global_label_Fill.value
    );
    expect(displayUtils.healthColor(ComponentHealth.DEGRADED, false)).toBe(
      global_danger_color_100.value
    );
    expect(
      displayUtils.healthColor(ComponentHealth.HEALTHY_REBALANCING, false)
    ).toBe(chart_global_label_Fill.value);
    expect(displayUtils.healthColor(ComponentHealth.FAILED, false)).toBe(
      global_danger_color_100.value
    );

    expect(displayUtils.healthColor(ComponentHealth.HEALTHY, true)).toBe(
      global_success_color_100.value
    );
    expect(displayUtils.healthColor(ComponentHealth.DEGRADED, true)).toBe(
      global_danger_color_100.value
    );
    expect(
      displayUtils.healthColor(ComponentHealth.HEALTHY_REBALANCING, true)
    ).toBe(global_warning_color_100.value);
    expect(displayUtils.healthColor(ComponentHealth.FAILED, true)).toBe(
      global_danger_color_100.value
    );
  });
});
