import {
  ChartComponentBuilderAurument,
  ChartComponentBuilderResponse,
} from "app/types/chart_component";

/**
 * Build a flat array of { date, value, previous } for `days` (any number).
 *
 * Logic:
 * - labels = first `days` labels from input.chart.labels, reversed -> oldest -> newest
 * - value = lookup by date from input.chart.current
 * - previous:
 *    - if previous contains any of the label dates -> use date lookup
 *    - else -> align previous values by index: take the last `days` entries from input.chart.previous
 *      (assumed oldest->newest order). If fewer, pad at start with zeros.
 */

export const buildChartComponentData: (
  input: ChartComponentBuilderAurument,
  days: number,
) => ChartComponentBuilderResponse[] | undefined = (
  input: ChartComponentBuilderAurument,
  days: number,
) => {
  try {
    // Take first N labels (input often provides labels in newest->oldest), then reverse to oldest->newest
    const labels = (input?.labels || []).slice(0, days).reverse();

    console.log(input);

    const currentMap = Object.fromEntries(
      (input.current || []).map((e) => [e.date, e.notifications]),
    );

    const previousMap = Object.fromEntries(
      (input.previous || []).map((e) => [e.date, e.notifications]),
    );

    // If any of the labels match a key in previousMap, prefer date-based lookup
    const hasDateOverlap = labels.some((d) => previousMap[d] !== undefined);

    // If no date overlap, prepare an index-aligned previous-values array
    let prevValuesByIndex: number[] | null = null;
    if (!hasDateOverlap) {
      const prevArr = (input.previous || []).slice(-days); // take last N (closest previous period)
      const extracted = prevArr.map((p) => p.notifications ?? 0);

      // If previous has fewer than `days`, pad at the start so indices align oldest->newest
      if (extracted.length < days) {
        const pad = new Array(days - extracted.length).fill(0);
        prevValuesByIndex = pad.concat(extracted);
      } else if (extracted.length > days) {
        // shouldn't happen because of slice(-days) but safe guard
        prevValuesByIndex = extracted.slice(-days);
      } else {
        prevValuesByIndex = extracted;
      }
    }

    // Build final array (oldest -> newest)
    return labels.map((date, i) => ({
      date,
      value: currentMap[date] ?? 0,
      previous: hasDateOverlap
        ? (previousMap[date] ?? 0)
        : prevValuesByIndex
          ? (prevValuesByIndex[i] ?? 0)
          : 0,
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(message);
  }
};
