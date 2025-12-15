export interface ChartComponentDataType {
  range: string;
  summary: {
    backInStockNotifications: {
      count: number;
      change: number;
    };
  };
  backInStockNotificationschart: {
    labels: string[];
    current: {
      date: string;
      notifications: number;
    }[];
    previous: {
      date: string;
      notifications: number;
    }[];
  };
}

export type ChartComponentBuilderAurument =
  ChartComponentDataType["backInStockNotificationschart"];

export type ChartComponentBuilderResponse = {
  date: string;
  value: number | string;
  previous: number | string;
};
