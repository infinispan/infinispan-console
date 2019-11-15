import {
  chart_color_black_100,
  chart_color_green_300,
  chart_color_orange_300,
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
};

const displayUtils: DisplayUtils = new DisplayUtils();

export default displayUtils;
