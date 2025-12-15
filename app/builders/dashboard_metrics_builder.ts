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
      value: totalRequests,
    },
    {
      title: "Total SubscribersList",
      value: totalSubscribers,
    },
    {
      title: "Total Conversions",
      value: totalConversion,
    },
    {
      title: "Sent Notifications",
      value: sentNotifications,
    },
  ];

  return labels;
};
