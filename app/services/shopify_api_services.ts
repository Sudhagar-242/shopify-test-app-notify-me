import {
  AdminApiContext,
  ApiVersion,
  Session,
} from "@shopify/shopify-app-react-router/server";
import { Store } from "./shopify_services";
import { AnalyticsOverviewResponseType } from "app/types/app_index";
import { ChartComponentDataType } from "app/types/chart_component";
import { ActivityItem, AnalyticsProductsInDemand } from "app/types/analytics";
import { GetSubscriberResponse, Subscriber } from "app/types/subscribers";
import { CREATE_OR_UPDATE_METAFIELD } from "app/queries/create_or_update_metafield";
import { AppearanceForm } from "app/routes/app.requests._index";
import { GET_APPEARANCE_FORM } from "app/queries/get_appearance_data";
import { AppearanceFormGQLRes } from "app/types/appearence_form";

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

  async getAppearanceMetaFields() {
    const response = await this.admin.graphql(GET_APPEARANCE_FORM);
    return (await response.json())?.data as AppearanceFormGQLRes;
  }

  async saveMetaField(
    value: FormData,
    namespace: string,
    key: string,
    type: string,
  ) {
    const resp = await this.admin.graphql(CREATE_OR_UPDATE_METAFIELD, {
      variables: {
        ownerId: this.store?.shopId,
        namespace,
        key,
        type,
        value,
      },
    });
    return resp;
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

  async getSubscribers(params: {
    page?: number;
    limit?: number;
    storeId: string;
    order?: "asc" | "desc";
  }) {
    const { page = 1, limit = 10, storeId, order = "desc" } = params;
    const url =
      `${this.baseUrl}/store/submissions/subscribers` +
      `?page=${page}&limit=${limit}&store_id=${storeId}&order=${order}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch subscribers");
    return response;
  }

  async getProductsTableData(params: {
    page?: number;
    limit?: number;
    storeId: string;
    order?: "asc" | "desc";
  }) {
    const { page = 1, limit = 10, storeId, order = "desc" } = params;
    const url =
      `${this.baseUrl}/store/all/products_with_variants` +
      `?page=${page}&limit=${limit}&store_id=${storeId}&order=${order}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch products Table");
    return response;
  }

  async getSpecificSubscriber(params: { userId: string; storeId: string }) {
    const { userId, storeId } = params;

    const url =
      `${this.baseUrl}/store/submissions/specific/subscriber` +
      `?user_id=${userId}&store_id=${storeId}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch subscriber details");
    }

    return response.json() as Promise<Subscriber[]>;
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

  async getRecentActivity(retries = 3, delayMs = 500): Promise<ActivityItem[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/store/analytics/recent-activity?store_id=${this.storeId}`,
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      return this.getRecentActivity(
        retries - 1,
        delayMs * 2, // exponential backoff
      );
    }
  }

  async getDemandingProducts(
    retries = 3,
    delayMs = 500,
  ): Promise<AnalyticsProductsInDemand[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/store/analytics/demanding-products?store_id=${this.storeId}`,
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      return this.getDemandingProducts(
        retries - 1,
        delayMs * 2, // exponential backoff
      );
    }
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
