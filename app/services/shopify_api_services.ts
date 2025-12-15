import {
  AdminApiContext,
  ApiVersion,
  Session,
} from "@shopify/shopify-app-react-router/server";
import { Store } from "./shopify_services";
import { AnalyticsOverviewResponseType } from "app/types/app_index";
import { ChartComponentDataType } from "app/types/chart_component";
import { ActivityItem, AnalyticsProductsInDemand } from "app/types/analytics";

class ShopifyAPIService {
  private readonly admin: AdminApiContext;
  private readonly session: Session;
  private readonly apiVersion: ApiVersion;
  private readonly store: Store | null;
  private readonly baseUrl: string;

  constructor(
    admin: AdminApiContext,
    session: Session,
    store: Store | null,
    apiVersion: ApiVersion,
  ) {
    this.admin = admin;
    this.session = session;
    this.store = store;
    this.apiVersion = apiVersion;
    // Only access process.env on server side, use fallback for client
    this.baseUrl =
      typeof window === "undefined"
        ? (process.env.BASE_URL ?? "http://localhost:3000")
        : "http://localhost:3000";
  }

  /* ---------------- Shopify Admin APIs ---------------- */

  async getThemes() {
    const response = await this.admin.graphql(`#graphql
      query GetThemes {
        themes(first: 250) {
          edges {
            node {
              id
              name
              role
              createdAt
              updatedAt
              prefix
            }
          }
        }
      }
    `);

    const json = await response.json();
    return json.data;
  }

  async getApp() {
    const response = await this.admin.graphql(`#graphql
      query GetApp {
        app {
          apiKey
        }
      }
    `);

    const json = await response.json();
    return json.data as {
      app: {
        apiKey: string;
      };
    };
  }

  /* ---------------- Shopify Theme App Extension Fetch ---------------- */

  async fetchThemeSettingsData(
    themeId: string,
  ): Promise<Record<string, unknown>> {
    if (!this.getAccessToken() || !themeId) {
      throw new Error("Missing access token or theme id");
    }

    const response = await fetch(
      `https://${this.store?.shop}/admin/api/${this.apiVersion}/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": this.getAccessToken() ?? "",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch settings_data.json: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /* ---------------- Internal APIs ---------------- */

  private get storeId(): string {
    return this.store?.shopId?.split("/").pop() || "";
  }

  async getSubscribers() {
    return await fetch(
      `${this.baseUrl}/notification/subscribe?store_id=${this.storeId}`,
    ).then((res) => res.json());
  }

  async getAnalyticsOverview(): Promise<AnalyticsOverviewResponseType> {
    return await fetch(
      `${this.baseUrl}/store/analytics/overview?store_id=${this.storeId}`,
    ).then((res) => res.json());
  }

  async getAnalyticsPerformance(
    days = "7_days",
  ): Promise<ChartComponentDataType> {
    return await fetch(
      `${this.baseUrl}/store/analytics/performance?store_id=${this.storeId}&days=${days}`,
    ).then((res) => res.json());
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    return await fetch(
      `${this.baseUrl}/store/analytics/recent-activity?store_id=${this.storeId}`,
    ).then((res) => res.json());
  }

  async getDemandingProducts(): Promise<AnalyticsProductsInDemand[]> {
    return await fetch(
      `${this.baseUrl}/store/analytics/demanding-products?store_id=${this.storeId}`,
    ).then((res) => res.json());
  }

  /* ---------------- Helpers ---------------- */

  getAccessToken() {
    return this.session.accessToken;
  }
}

const shopifyAPIService = (
  admin: AdminApiContext,
  session: Session,
  apiVersion: ApiVersion,
  store: Store | null,
) => new ShopifyAPIService(admin, session, store, apiVersion);

export default shopifyAPIService;
