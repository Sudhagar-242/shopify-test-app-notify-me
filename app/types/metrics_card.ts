export interface MetricsCard {
  title: string;
  value: string | number;
  change?: string | number; // e.g., "12%"
  tone?:
    | "success"
    | "warning"
    | "critical"
    | "info"
    | "auto"
    | "neutral"
    | "caution"
    | undefined;
  icon?: "arrow-up" | "arrow-down" | null;
  href?: string;
}
