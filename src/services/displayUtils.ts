import {
  chart_color_black_100,
  chart_color_black_300,
  chart_color_blue_200,
  chart_color_cyan_300,
  chart_color_gold_300,
  chart_color_green_300,
  chart_color_orange_300,
  chart_color_purple_200,
  chart_color_red_300
} from "@patternfly/react-tokens";

class DisplayUtils {
  public healthColor(health: string): string {
    let color;
    switch (health) {
      case 'HEALTHY':
        color = chart_color_green_300.value;
        break;
      case 'HEALTHY_REBALANCING':
        color = chart_color_orange_300.value;
        break;
      case 'DEGRADED':
        color = chart_color_red_300.value;
        break;
      default:
        color = chart_color_black_100.value;
    }
    return color;
  };

  public cacheTypeColor(cacheType: string): string {
    let color;
    switch (cacheType) {
      case 'Distributed':
        color = chart_color_blue_200.value;
        break;
      case 'Replicated':
        color = chart_color_purple_200.value;
        break;
      case 'Local':
        color = chart_color_cyan_300.value;
        break;
      case 'Invalidated':
        color = chart_color_gold_300.value;
        break;
      case 'Scattered':
        color = chart_color_black_300.value;
        break;
      default:
        color = chart_color_black_100.value;
    }
    return color;
  };
};

const displayUtils: DisplayUtils = new DisplayUtils();

export default displayUtils;
