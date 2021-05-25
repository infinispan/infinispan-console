import displayUtils from '@services/displayUtils';
import { CacheType, ComponentHealth, ComponentStatus } from '@services/restUtils';
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

describe('Display Utils tests', () => {
  test('status color', () => {
    expect(displayUtils.statusColor(undefined, false)).toBe(
      chart_global_label_Fill.value
    );
    expect(displayUtils.statusColor(ComponentStatus.OK, true)).toBe(
      global_success_color_100.value
    );
    expect(displayUtils.statusColor(ComponentStatus.RUNNING, true)).toBe(
      global_success_color_100.value
    );
    expect(displayUtils.statusColor(ComponentStatus.INITIALIZING, true)).toBe(
      global_warning_color_100.value
    );
    expect(displayUtils.statusColor(ComponentStatus.CANCELLING, true)).toBe(
      global_warning_color_100.value
    );
    expect(displayUtils.statusColor(ComponentStatus.SENDING, true)).toBe(
      global_warning_color_100.value
    );
    expect(displayUtils.statusColor(ComponentStatus.FAILED, true)).toBe(
      global_danger_color_100.value
    );
    expect(displayUtils.statusColor(ComponentStatus.ERROR, true)).toBe(
      global_danger_color_100.value
    );
    expect(displayUtils.statusColor(ComponentStatus.STOPPING, true)).toBe(
      chart_global_label_Fill.value
    );
    expect(displayUtils.statusColor(ComponentStatus.TERMINATED, true)).toBe(
      chart_global_label_Fill.value
    );
    expect(displayUtils.statusColor(ComponentStatus.INSTANTIATED, true)).toBe(
      chart_global_label_Fill.value
    );
  });

  test('status altert variant', () => {
    expect(displayUtils.statusAlterVariant(ComponentStatus.OK)).toBe(
      AlertVariant.success
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.RUNNING)).toBe(
      AlertVariant.success
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.INITIALIZING)).toBe(
      AlertVariant.warning
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.CANCELLING)).toBe(
      AlertVariant.warning
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.SENDING)).toBe(
      AlertVariant.warning
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.FAILED)).toBe(
      AlertVariant.danger
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.ERROR)).toBe(
      AlertVariant.danger
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.STOPPING)).toBe(
      AlertVariant.warning
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.TERMINATED)).toBe(
      AlertVariant.info
    );
    expect(displayUtils.statusAlterVariant(ComponentStatus.INSTANTIATED)).toBe(
      AlertVariant.warning
    );
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
