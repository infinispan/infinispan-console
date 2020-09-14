import {
  chart_color_black_100,
  chart_color_black_500,
  chart_color_blue_500,
  chart_color_cyan_100,
  chart_color_cyan_500,
  chart_color_gold_100,
  chart_color_orange_500,
  chart_color_purple_500,
  chart_global_label_Fill,
  global_danger_color_100,
  global_palette_black_100,
  global_palette_blue_50,
  global_palette_purple_100,
  global_success_color_100,
  global_warning_color_100
} from '@patternfly/react-tokens';
import {AlertVariant} from '@patternfly/react-core';
import {CacheType, ComponentHealth, ComponentStatus} from "@services/utils";

/**
 * Utility class to manage display features
 *
 * @author Katia Aresti
 */
class DisplayUtils {
  /**
   * Get the status color
   * @param componentStatus
   * @param isIcon
   */
  public statusColor(componentStatus: ComponentStatus | string | undefined, isIcon: boolean) {
    let color;
    if (!componentStatus) {
      return chart_global_label_Fill.value;
    }

    if (!isIcon) {
      return chart_global_label_Fill.value;
    }

    switch (componentStatus.toString()) {
      case ComponentStatus.RUNNING.toString():
      case ComponentStatus.OK.toString():
        color = global_success_color_100.value;
        break;
      case ComponentStatus.INITIALIZING.toString():
      case ComponentStatus.CANCELLING.toString():
      case ComponentStatus.SENDING.toString():
        color = global_warning_color_100.value;
        break;
      case ComponentStatus.FAILED.toString():
      case ComponentStatus.ERROR.toString():
        color = global_danger_color_100.value;
        break;
      default:
        color = chart_global_label_Fill.value;
    }
    return color;
  }

  /**
   * Status alert icon
   *
   * @param status
   */
  public statusAlterVariant(status: string | ComponentStatus): AlertVariant {
    let variant;
    switch (status.toString()) {
      case ComponentStatus.RUNNING.toString():
      case ComponentStatus.OK.toString():
        variant = AlertVariant.success;
        break;
      case ComponentStatus.ERROR.toString():
      case ComponentStatus.FAILED.toString():
        variant = AlertVariant.danger;
        break;
      case ComponentStatus.TERMINATED.toString():
        variant = AlertVariant.info;
        break;
      default:
        variant = AlertVariant.warning;
    }
    return variant;
  }

  /**
   * Get the health color
   * @param health, string value
   * @param isIcon, color depends on the icon as well
   */
  public healthColor(health: string | ComponentHealth | undefined, isIcon: boolean): string {
    if (health == undefined) {
      return chart_global_label_Fill.value;
    }

    if (!isIcon) {
      return chart_global_label_Fill.value;
    }

    let color;
    switch (health.toString()) {
      case ComponentHealth.HEALTHY.toString():
        color = global_success_color_100.value;
        break;
      case ComponentHealth.HEALTHY_REBALANCING.toString():
        color = global_warning_color_100.value;
        break;
      case ComponentHealth.DEGRADED.toString():
        color = global_danger_color_100.value;
        break;
      default:
        color = chart_global_label_Fill.value;
    }
    return color;
  }

  /**
   * Used to display a health label instead of the backend value
   *
   * @param health
   */
  public healthLabel(health: string | ComponentHealth | undefined): string {
    if (health === undefined) {
      return '-';
    }

    let label;
    switch (health.toString()) {
      case ComponentHealth.HEALTHY.toString():
        label = 'Healthy';
        break;
      case ComponentHealth.HEALTHY_REBALANCING.toString():
        label = 'Rebalancing';
        break;
      case ComponentHealth.DEGRADED.toString():
        label = 'Degraded';
        break;
      default:
        label = 'Unknown';
    }
    return label;
  }

  /**
   * Alert variant for the icon in the
   * @param health
   */
  public healthAlertVariant(health: (string | ComponentHealth | undefined)): AlertVariant {
    if (health == undefined) {
      return AlertVariant.warning;
    }

    let variant;

    switch (health.toString()) {
      case ComponentHealth.HEALTHY.toString():
        variant = AlertVariant.success;
        break;
      case ComponentHealth.HEALTHY_REBALANCING.toString():
        variant = AlertVariant.warning;
        break;
      case ComponentHealth.DEGRADED.toString():
        variant = AlertVariant.danger;
        break;
      default:
        variant = AlertVariant.default;
    }
    return variant;
  }

  /**
   * Cache type color calculation for labels
   *
   * @param cacheType
   */
  public cacheTypeColor(cacheType: (string|CacheType)): string {
    let color;
    switch (cacheType.toString()) {
      case CacheType.Distributed.toString():
        color = global_palette_blue_50.value;
        break;
      case CacheType.Replicated.toString():
        color = global_palette_purple_100.value;
        break;
      case CacheType.Local.toString():
        color = chart_color_cyan_100.value;
        break;
      case CacheType.Invalidated.toString():
        color = chart_color_gold_100.value;
        break;
      case CacheType.Scattered.toString():
        color = global_palette_black_100.value;
        break;
      default:
        color = chart_color_black_100.value;
    }
    return color;
  }

  /**
   * Cache type label color
   *
   * @param cacheType
   */
  public cacheTypeColorLabel(cacheType: string): string {
    let color;
    switch (cacheType) {
      case 'Distributed':
        color = chart_color_blue_500.value;
        break;
      case 'Replicated':
        color = chart_color_purple_500.value;
        break;
      case 'Local':
        color = chart_color_cyan_500.value;
        break;
      case 'Invalidated':
        color = chart_color_orange_500.value;
        break;
      case 'Scattered':
        color = chart_color_black_500.value;
        break;
      default:
        color = chart_color_black_500.value;
    }
    return color;
  }

  public taskTypeColor(counterType: string): string {
    let color;
    switch (counterType) {
      case 'AdminServerTask':
        color = chart_color_cyan_100.value;
        break;
      default:
        color = global_palette_blue_50.value;
    }
    return color;
  }

  public capitalize(value: string | undefined): string {
    if (value === undefined) return '';
    if (value.length <= 1) return value;

    return value.charAt(0).toUpperCase() + value.slice(1).toLocaleLowerCase();
  }

  public formatNumber(digit: number | undefined): string {
    if (!digit) return '0';

    return digit.toLocaleString('en', { maximumFractionDigits: 2 });
  }

  public createFeaturesString(features: Features): string {
    let featuresString = '';

    if (features.bounded) {
      featuresString = this.appendFeature(featuresString, 'Bounded');
    }
    if (features.indexed) {
      featuresString = this.appendFeature(featuresString, 'Indexed');
    }
    if (features.persistent) {
      featuresString = this.appendFeature(featuresString, 'Persistent');
    }
    if (features.transactional) {
      featuresString = this.appendFeature(featuresString, 'Transactional');
    }
    if (features.secured) {
      featuresString = this.appendFeature(featuresString, 'Secured');
    }
    if (features.hasRemoteBackup) {
      featuresString = this.appendFeature(featuresString, 'Backups');
    }
    return featuresString;
  }

  public displayValue(value: string): string {
    try {
      let parse = JSON.stringify(JSON.parse(value), null, 2);
      return parse;
    } catch (err) {
      return value;
    }
  }

  private appendFeature = (features: string, feature: string): string => {
    return features + (features.length > 0 ? ' / ' : '') + feature;
  };
}

const displayUtils: DisplayUtils = new DisplayUtils();

export default displayUtils;
