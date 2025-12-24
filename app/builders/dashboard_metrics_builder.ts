import { AnalyticsOverviewResponseType } from "app/types/app_index";
import { MetricsCard } from "app/types/metrics_card";

export const BuildAnalyticsOverview: (
  payload: AnalyticsOverviewResponseType,
) => MetricsCard[] = (payload: AnalyticsOverviewResponseType) => {
  const {
    totalRequests,
    totalSubscribers,
    totalConversion,
    sentNotifications,
  } = payload;

  const labels: MetricsCard[] = [
    {
      title: "Total Requests",
      value: totalRequests || 0,
    },
    {
      title: "Total SubscribersList",
      value: totalSubscribers || 0,
    },
    {
      title: "Total Conversions",
      value: totalConversion || 0,
    },
    {
      title: "Sent Notifications",
      value: sentNotifications || 0,
    },
  ];

  return labels;
};
