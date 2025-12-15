import { SetStateAction, useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useActionData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { apiVersion, authenticate } from "../shopify.server";
import {
  ApiVersion,
  boundary,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import prisma from "app/db.server";
import MetricsGrid from "app/components/metrics_card";
import ChartComponent from "app/components/chartComponent";
import { BuildAnalyticsOverview } from "app/builders/dashboard_metrics_builder";
import { AnalyticsOverviewResponseType } from "app/types/app_index";
import { ChartComponentDataType } from "app/types/chart_component";
import RenderDropdownComponent, {
  DropdownOption,
} from "app/components/dropdown_component";
import { CallbackEvent } from "@shopify/polaris-types";
import { useShopifyService } from "app/context/shopify_shop_context";
import shopifyService from "app/services/shopify_services";
import SubscribersMAnagement from "app/components/subscriber_management_table";
import { ActivityItem, AnalyticsProductsInDemand } from "app/types/analytics";
import RenderAppEmbedComponent from "app/components/app_embed_status";
import { ThmemeSelectionType } from "app/types/components/theme_embed_status";
import { statusOptionsDashBoard } from "app/constants/constants";
import RenderProductsInDemandComponent from "app/components/products_in_demand";
import RecentActivity from "app/components/recent_activity";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const Store = await prisma.shop.findUnique({
    where: { shop: session?.shop },
  });

  const ShopifyService = shopifyService(admin, session, apiVersion, Store);

  return ShopifyService.getIndexLoaderData();
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const Store = await prisma.shop.findUnique({
    where: { shop: session?.shop },
  });

  if (request.method === "POST") {
    const formData = await request.json();
    const { themeId, blockName } = formData;

    if (!themeId || !blockName) {
      return { error: "Missing themeId or blockName", isEnabled: false };
    }

    try {
      const ShopifyService = shopifyService(admin, session, apiVersion, Store);
      const status = await ShopifyService.getThemeEmbedStatus({
        themeId,
        blockName,
      });
      return status;
    } catch (error) {
      console.error("Failed to fetch theme status:", error);
      return { error: "Failed to fetch theme status", isEnabled: false };
    }
  }

  return null;
};

// 3. Define your tabs
const tabs: DropdownOption[] = [
  { label: "Top registered products", value: "top" },
  // { label: "Recently products", value: "recent" },
];

export function flattenThemes(data: {
  themes: { edges: { node: Record<string, string> }[] };
}): ThmemeSelectionType[] {
  return (
    data?.themes?.edges?.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      role: edge.node.role as ThmemeSelectionType["role"],
      value: edge.node.id,
    })) || []
  );
}

const defaultImage: string =
  "https://cdn.shopify.com/s/files/1/0757/9955/files/New_Post.png?12678548500147524304";

export default function Index() {
  const {
    App,
    Theme,
    AnalyticsOverviewData,
    AnalyticsRecentActivity,
    AnalyticsPerfomaceData,
    AnalyticsDemandingProducts,
    Store,
  } = useLoaderData<typeof loader>();

  console.log("App", App);
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  console.log(Theme);

  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("top");
  const [chartComponentData, setchartComponentData] =
    useState<ChartComponentDataType>(AnalyticsPerfomaceData);

  const Service = useShopifyService();

  // const isLoading =
  //   ["loading", "submitting"].includes(fetcher.state) &&
  //   fetcher.formMethod === "POST";

  // useEffect(() => {
  //   if (fetcher.data?.product?.id) {
  //     shopify.toast.show("Product created");
  //   }
  //   if (shopify.support.registerHandler) {
  //     shopify.support.registerHandler(handler);
  //   }
  // }, [fetcher.data?.product?.id, shopify]);

  // const generateProduct = () => fetcher.submit({}, { method: "POST" });

  // const handler = () => {
  //   console.log("Support Handler Called");
  // };

  return (
    <>
      <s-page>
        <s-button slot="primary-action">Hello</s-button>
        <s-button slot="secondary-actions">Welcome</s-button>
        <s-button slot="secondary-actions">Browse templates</s-button>
        <s-button slot="secondary-actions">Import image</s-button>
        <h1 className="mb-2 ml-0 text-2xl font-extrabold text-black">
          Welcome, Notify Me!
        </h1>
        <MetricsGrid cards={BuildAnalyticsOverview(AnalyticsOverviewData)} />
        <s-section>
          <s-stack gap="large">
            <s-stack direction="inline" justifyContent="space-between">
              <span></span>

              <RenderDropdownComponent
                options={statusOptionsDashBoard}
                selectedValue={status ?? "Products Options"}
                onSelect={(value: string | number) => setStatus(String(value))}
                changeValueOnSelect={
                  ((value: ChartComponentDataType) =>
                    setchartComponentData(value)) as <ChartComponentDataType>(
                    value: ChartComponentDataType,
                  ) => void
                }
                menuId="status-filter-menu"
                buttonId="status-filter-button"
                storeId={Store?.shopId?.split("/").pop()}
              />
            </s-stack>

            <s-stack>
              <div className="max-w-fit">
                <s-clickable
                  paddingBlock="small-400"
                  paddingInline="small-100"
                  borderRadius="base"
                  background="strong"
                >
                  <s-grid gap="small-300">
                    <s-heading>{"Back in stock notifications"}</s-heading>
                    <s-stack direction="inline" gap="small-200">
                      <s-text>
                        {
                          chartComponentData.summary?.backInStockNotifications
                            ?.count
                        }
                      </s-text>
                      <s-badge
                        tone={
                          +chartComponentData.summary?.backInStockNotifications
                            ?.change > 0
                            ? "success"
                            : "critical"
                        }
                        icon={
                          +chartComponentData.summary?.backInStockNotifications
                            ?.change > 0
                            ? "arrow-up"
                            : "arrow-down"
                        }
                      >
                        {
                          chartComponentData.summary?.backInStockNotifications
                            ?.change
                        }
                        %
                      </s-badge>
                    </s-stack>
                  </s-grid>
                </s-clickable>
              </div>

              <ChartComponent chartData={chartComponentData} />
              {/* <TestCard /> */}
            </s-stack>
          </s-stack>
        </s-section>

        <RenderAppEmbedComponent
          apiKey={App?.app?.apiKey}
          blockName={"zuper_notify_me"}
          themes={Theme}
          currentTheme={
            Theme.find((theme) => theme.role === "MAIN") ??
            ({} as ThmemeSelectionType)
          }
        />

        <RenderProductsInDemandComponent
          products={activeTab === "top" ? AnalyticsDemandingProducts : []}
          // activeTab={activeTab}
          // onTabChange={(value) => setActiveTab(value)}
          tabs={tabs}
        />

        <SubscribersMAnagement />

        {/* <s-section id="activity-section" padding="none" slot="aside">
          <s-box id="activity-heading-box" padding="base">
            <s-heading id="activity-heading">Recent Activity</s-heading>
          </s-box>
          <s-table id="activity-table">
            <s-table-header-row id="activity-table-header">
              <s-table-header id="header-image" listSlot="labeled">
                Image
              </s-table-header>
              <s-table-header id="header-product" listSlot="primary">
                Product
              </s-table-header>
              <s-table-header id="header-status" listSlot="inline">
                Status
              </s-table-header>
            </s-table-header-row>
            <s-table-body id="activity-table-body">
              {AnalyticsRecentActivity.map(
                (activity: ActivityItem, index: number) => (
                  <s-table-row id={`activity-row-${index}`} key={index}>
                    <s-table-cell id={`cell-image-${index}`}>
                      <s-thumbnail
                        id={`thumbnail-${index}`}
                        src={activity.imageUrl || ""}
                        alt={activity.title || "Product image"}
                        size="small-200"
                      />
                    </s-table-cell>
                    <s-table-cell id={`cell-title-${index}`}>
                      <s-text id={`title-text-${index}`}>
                        {activity.title || "Unknown Product"}
                      </s-text>
                    </s-table-cell>
                    <s-table-cell id={`cell-status-${index}`}>
                      <s-badge
                        id={`status-badge-${index}`}
                        tone={activity.is_sent === true ? "success" : "neutral"}
                      >
                        {activity.is_sent === true ? "Sent" : "Not Sent"}
                      </s-badge>
                    </s-table-cell>
                  </s-table-row>
                ),
              )}
            </s-table-body>
          </s-table>
        </s-section> */}

        <RecentActivity recentActivity={AnalyticsRecentActivity} />
      </s-page>
    </>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

// return (
//     <>
//       <s-page heading="Shopify app template">
//         <s-button slot="primary-action" onClick={generateProduct}>
//           Generate a product
//         </s-button>

//         <div>
//           <h1 className="bg-black">Hello World!</h1>
//         </div>
//         <TestCard />

//       </s-section>
//     </s - page >

//     {/* <MetricsGrid metrics={metricsData} />

//       <s-section heading="Subscribers List">
//         <SubscribersList subscribers={subscribers} />
//       </s-section>

//       <s-section heading="Subscribers Table">
//         <SubscribersTable subscribers={subscribers} />
//       </s-section>

//       <s-section padding="none">
//         <s-stack>
//           <s-box></s-box>
//           <s-heading>Back in Stock Products</s-heading>
//           <BackInStockTable dataByView={someData} />
//         </s-stack> */}

// </>

//   )

// Reusable tracking component
interface TrackingMetric {
  label: string;
  count: number;
  total: number;
  iconType: "email" | "click" | "view" | "notification";
}

interface TrackingComponentProps {
  metrics: TrackingMetric[];
}

function RenderTrackingComponent({ metrics }: TrackingComponentProps) {
  return (
    <s-section id="tracking-section" slot="aside">
      <s-heading id="tracking-heading">Tracking</s-heading>
      <s-stack id="tracking-stack" gap="base" direction="block">
        {metrics.map((metric, index) => (
          <s-stack
            key={`tracking-metric-${index}`}
            id={`tracking-metric-${index}`}
            direction="inline"
            gap="base"
            alignItems="center"
            justifyContent="space-between"
          >
            <s-stack
              id={`tracking-metric-content-${index}`}
              direction="inline"
              gap="small"
              alignItems="center"
            >
              <s-icon id={`tracking-icon-${index}`} type={metric.iconType} />
              <s-text id={`tracking-label-${index}`}>{metric.label}</s-text>
            </s-stack>
            <s-text id={`tracking-count-${index}`} type="strong">
              {metric.count}/{metric.total}
            </s-text>
          </s-stack>
        ))}
      </s-stack>
    </s-section>
  );
}
