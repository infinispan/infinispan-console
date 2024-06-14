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
  global_Color_100,
  global_danger_color_100,
  global_info_color_100,
  global_palette_blue_50,
  global_palette_purple_100,
  global_success_color_100,
  global_warning_color_100
} from '@patternfly/react-tokens';
import { AlertVariant } from '@patternfly/react-core';
import numeral from 'numeral';
import { CacheType, ComponentHealth, ContentType } from '@services/infinispanRefData';

/**
 * Utility class to manage display features
 *
 * @author Katia Aresti
 */
export const UNKNOWN_STATUS = {
  name: 'Unknown',
  color: chart_global_label_Fill.value,
  icon: AlertVariant.warning
};
export const OK_STATUS = {
  name: 'Ok',
  color: global_success_color_100.value,
  icon: AlertVariant.success
};
export const RUNNING_STATUS = {
  name: 'Running',
  color: global_success_color_100.value,
  icon: AlertVariant.success
};
export const INIT_STATUS = {
  name: 'Initializing',
  color: global_warning_color_100.value,
  icon: AlertVariant.warning
};
export const CANCEL_STATUS = {
  name: 'Cancelling',
  color: global_warning_color_100.value,
  icon: AlertVariant.warning
};
export const FAILED_STATUS = {
  name: 'Failed',
  color: global_danger_color_100.value,
  icon: AlertVariant.danger
};
export const ERROR_STATUS = {
  name: 'Error',
  color: global_danger_color_100.value,
  icon: AlertVariant.danger
};
export const TERMINATED_STATUS = {
  name: 'Terminated',
  color: global_info_color_100.value,
  icon: AlertVariant.info
};
export const STOPPING_STATUS = {
  name: 'Stopping',
  color: global_info_color_100.value,
  icon: AlertVariant.info
};
export const INSTANTIATED_STATUS = {
  name: 'Instantiated',
  color: global_info_color_100.value,
  icon: AlertVariant.info
};

export const ST_IDLE = {
  name: 'Inactive',
  color: global_Color_100.value,
  icon: AlertVariant.success
};
export const ST_SENDING = {
  name: 'Sending',
  color: global_info_color_100.value,
  icon: AlertVariant.info
};
export const ST_SEND_OK = {
  name: 'Transfer Ok',
  color: global_success_color_100.value,
  icon: AlertVariant.success
};
export const ST_SEND_FAILED = {
  name: 'Transfer Failed',
  color: global_danger_color_100.value,
  icon: AlertVariant.danger
};
export const ST_SEND_CANCELED = {
  name: 'Transfer Cancelled',
  color: global_warning_color_100.value,
  icon: AlertVariant.warning
};

class DisplayUtils {
  public parseStateTransferStatus(value?: string): Status {
    let stateTransfertStatus: Status;
    switch (value) {
      case 'IDLE':
        stateTransfertStatus = ST_IDLE;
        break;
      case 'SENDING':
        stateTransfertStatus = ST_SENDING;
        break;
      case 'OK':
        stateTransfertStatus = ST_SEND_OK;
        break;
      case 'ERROR':
        stateTransfertStatus = ST_SEND_FAILED;
        break;
      case 'CANCELED':
        stateTransfertStatus = ST_SEND_CANCELED;
        break;
      default:
        stateTransfertStatus = ST_IDLE;
    }

    return stateTransfertStatus;
  }

  public parseComponentStatus(value?: string): Status {
    let componentStatus: Status;

    switch (value) {
      case 'RUNNING':
        componentStatus = RUNNING_STATUS;
        break;
      case 'OK':
        componentStatus = OK_STATUS;
        break;
      case 'INITIALIZING':
        componentStatus = INIT_STATUS;
        break;
      case 'CANCELLING':
        componentStatus = CANCEL_STATUS;
        break;
      case 'FAILED':
        componentStatus = FAILED_STATUS;
        break;
      case 'ERROR':
        componentStatus = ERROR_STATUS;
        break;
      case 'TERMINATED':
        componentStatus = TERMINATED_STATUS;
        break;
      case 'STOPPING':
        componentStatus = STOPPING_STATUS;
        break;
      case 'INSTANTIATED':
        componentStatus = INSTANTIATED_STATUS;
        break;
      default:
        componentStatus = UNKNOWN_STATUS;
    }

    return componentStatus;
  }

  /**
   * Get the health color
   * @param health, string value
   * @param isIcon, color depends on the icon as well
   */
  public healthColor(health: ComponentHealth | undefined, isIcon: boolean): string {
    if (health == undefined) {
      return chart_global_label_Fill.value;
    }

    if (!isIcon) {
      if (health == ComponentHealth.FAILED || health == ComponentHealth.DEGRADED) {
        return global_danger_color_100.value;
      }
      return chart_global_label_Fill.value;
    }

    let color;
    switch (health) {
      case ComponentHealth.HEALTHY:
        color = global_success_color_100.value;
        break;
      case ComponentHealth.HEALTHY_REBALANCING:
        color = global_warning_color_100.value;
        break;
      case ComponentHealth.FAILED:
      case ComponentHealth.DEGRADED:
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
  public healthLabel(health: ComponentHealth | undefined): string {
    if (health === undefined) {
      return '-';
    }

    let label;
    switch (health) {
      case ComponentHealth.HEALTHY:
        label = 'Healthy';
        break;
      case ComponentHealth.HEALTHY_REBALANCING:
        label = 'Rebalancing';
        break;
      case ComponentHealth.DEGRADED:
        label = 'Degraded';
        break;
      case ComponentHealth.FAILED:
        label = 'Failed';
        break;
      default:
        label = 'Unknown';
    }
    return label;
  }

  /**
   * Used to define color for cache health label
   * @param health
   */
  public healthLabelColor(health: ComponentHealth | undefined) {
    if (!health) return;

    let color;
    switch (health) {
      case ComponentHealth.HEALTHY:
        color = 'green';
        break;
      case ComponentHealth.HEALTHY_REBALANCING:
        color = 'orange';
        break;
      case ComponentHealth.DEGRADED:
        color = 'grey';
        break;
      case ComponentHealth.FAILED:
        color = 'red';
        break;
      default:
        color = 'blue';
    }
    return color;
  }

  /**
   * Alert variant for the icon in the
   * @param health
   */
  public healthAlertVariant(health: ComponentHealth | undefined): AlertVariant {
    if (health == undefined) {
      return AlertVariant.custom;
    }

    let variant;

    switch (health) {
      case ComponentHealth.HEALTHY:
        variant = AlertVariant.success;
        break;
      case ComponentHealth.HEALTHY_REBALANCING:
        variant = AlertVariant.warning;
        break;
      case ComponentHealth.FAILED:
      case ComponentHealth.DEGRADED:
        variant = AlertVariant.danger;
        break;
      default:
        variant = AlertVariant.custom;
    }
    return variant;
  }

  /**
   * Cache type color calculation for labels
   *
   * @param cacheType
   */
  public cacheTypeColor(cacheType: CacheType | undefined) {
    let color;
    if (cacheType == undefined) {
      return 'grey';
    }
    switch (cacheType) {
      case CacheType.Distributed:
        color = 'blue';
        break;
      case CacheType.Replicated:
        color = 'purple';
        break;
      case CacheType.Local:
        color = 'cyan';
        break;
      case CacheType.Invalidated:
        color = 'gold';
        break;
      default:
        color = 'grey';
    }
    return color;
  }

  /**
   * Cache type label text color
   *
   * @param cacheType
   */
  public cacheTypeLabelTextColor(cacheType: CacheType): string {
    if (cacheType == undefined) {
      return chart_color_black_100.value;
    }

    let color;
    switch (cacheType) {
      case CacheType.Distributed:
        color = chart_color_blue_500.value;
        break;
      case CacheType.Replicated:
        color = chart_color_purple_500.value;
        break;
      case CacheType.Local:
        color = chart_color_cyan_500.value;
        break;
      case CacheType.Invalidated:
        color = chart_color_orange_500.value;
        break;
      default:
        color = chart_color_black_500.value;
    }
    return color;
  }

  /**
   * Cache type label background color
   *
   * @param cacheType
   */
  public cacheTypeLabelBackgroundColor(cacheType: CacheType | undefined) {
    let color;
    if (cacheType == undefined) {
      return chart_color_black_100.value;
    }
    switch (cacheType) {
      case CacheType.Distributed:
        color = global_palette_blue_50.value;
        break;
      case CacheType.Replicated:
        color = global_palette_purple_100.value;
        break;
      case CacheType.Local:
        color = chart_color_cyan_100.value;
        break;
      case CacheType.Invalidated:
        color = chart_color_gold_100.value;
        break;
      default:
        color = chart_color_black_100.value;
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

    if (digit >= 100000000) {
      return numeral(digit).format('0.0a');
    }

    return digit.toLocaleString('en', { maximumFractionDigits: 2 });
  }

  public formatBigNumber(digit: number | undefined): string {
    if (!digit) return '0';

    if (digit >= 1000000) {
      return numeral(digit).format('0.0a');
    }

    if (digit >= 1000) {
      return numeral(digit).format('0 a');
    }

    return this.formatNumber(digit);
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

    return featuresString.length > 0 ? featuresString : 'None';
  }

  public createFeaturesChipGroup(features: Features): string[] {
    let featureChipGroup: string[] = [];

    if (features.bounded) {
      featureChipGroup = ['Bounded', ...featureChipGroup];
    }
    if (features.indexed) {
      featureChipGroup = ['Indexed', ...featureChipGroup];
    }
    if (features.persistent) {
      featureChipGroup = ['Persistent', ...featureChipGroup];
    }
    if (features.transactional) {
      featureChipGroup = ['Transactional', ...featureChipGroup];
    }
    if (features.secured) {
      featureChipGroup = ['Secured', ...featureChipGroup];
    }
    if (features.hasRemoteBackup) {
      featureChipGroup = ['Backups', ...featureChipGroup];
    }

    return featureChipGroup;
  }

  public formatContentToDisplay(content: any, contentType?: ContentType): string {
    if (!contentType || contentType == ContentType.JSON || contentType == ContentType.customType) {
      // Try parse and stringify
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch (err) {
        /* empty */
      }
    }

    return content as string;
  }

  private appendFeature = (features: string, feature: string): string => {
    return features + (features.length > 0 ? ' / ' : '') + feature;
  };
}

const displayUtils: DisplayUtils = new DisplayUtils();

export default displayUtils;
