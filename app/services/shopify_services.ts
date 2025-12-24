import {
  AdminApiContext,
  ApiVersion,
  Session,
} from "@shopify/shopify-app-react-router/server";
import shopifyAPIService from "./shopify_api_services";
import { flattenThemes } from "app/routes/app._index";
import { GetSubscriberResponse, Subscriber } from "app/types/subscribers";
import { ProductTableRes } from "app/types/products_table";
import { AppearanceForm } from "app/routes/app.requests._index";

export interface Store {
  id: number;
  shop: string;
  accessToken: string | null;
  shopId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

class ShopifyService {
  private readonly api;
  private readonly admin: AdminApiContext;
  private readonly session: Session;
  private readonly apiVersion: ApiVersion;
  private readonly store: Store | null;

  constructor(
    admin: AdminApiContext,
    session: Session,
    store: Store | null,
    apiVersion: ApiVersion,
  ) {
    this.api = shopifyAPIService(admin, session, apiVersion, store);
    this.admin = admin;
    this.session = session;
    this.apiVersion = apiVersion;
    this.store = store;
  }

  async getIndexLoaderData() {
    const [
      App,
      Theme,
      AnalyticsOverviewData,
      AnalyticsRecentActivity,
      AnalyticsPerfomaceData,
      AnalyticsDemandingProducts,
      AppearanceSettings,
    ] = await Promise.all([
      this.api.getApp(),
      this.api.getThemes(),
      this.api.getAnalyticsOverview(),
      this.api.getRecentActivity(),
      this.api.getAnalyticsPerformance("7_days"),
      this.api.getDemandingProducts(),
      this.api.getAppearanceMetaFields(),
    ]);

    return {
      App,
      Store: this.store,
      Theme: flattenThemes(Theme),
      AnalyticsOverviewData,
      AnalyticsRecentActivity,
      AnalyticsPerfomaceData,
      AnalyticsDemandingProducts,
      AppearanceSettings,
    };
  }

  async getRequestsPageLoaderData() {
    const [appearanceResponse] = await Promise.all([
      // this.getSubscribers(1, 10, "desc"),
      // this.getProductTableData(1, 10, "desc"),
      this.api.getAppearanceMetaFields(),
    ]);

    let appearanceForm: AppearanceForm | null = null;

    try {
      const rawValue = appearanceResponse?.shop?.appearance?.value;

      if (typeof rawValue === "string") {
        appearanceForm = JSON.parse(rawValue) as AppearanceForm;
      }
    } catch (error) {
      console.error("Failed to parse AppearanceForm", error);
    }

    return {
      // Subscriber,
      // ProductsTable,
      AppearanceForm: appearanceForm,
    };
  }

  async getSubscribers(
    page?: number,
    limit?: number,
    order?: "asc" | "desc",
  ): Promise<GetSubscriberResponse> {
    const result = await this.api.getSubscribers({
      page,
      limit,
      storeId: this.store?.shopId?.split("/").pop() as string,
      order,
    });
    const data = result.json() as unknown as GetSubscriberResponse;
    return data as GetSubscriberResponse;
  }

  async getProductTableData(
    page?: number,
    limit?: number,
    order?: "asc" | "desc",
  ): Promise<ProductTableRes> {
    const result = await this.api.getProductsTableData({
      page,
      limit,
      storeId: this.store?.shopId?.split("/").pop() as string,
      order,
    });
    const data = result.json() as unknown as ProductTableRes;
    return data as ProductTableRes;
  }

  async getSpecificSubscriber(
    userId: string,
    storeId: string,
  ): Promise<Subscriber[]> {
    return await this.api.getSpecificSubscriber({ userId, storeId });
  }

  checkThemeExtensionStatus(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settingsData: Record<string, any>,
    blockName: string,
  ): { isEnabled: boolean; status: number } {
    if (settingsData?.error) {
      return { isEnabled: true, status: 500 };
    }

    const assetData = JSON.parse(
      (settingsData?.asset?.value as string) ?? "{}",
    );
    const blocks = assetData?.current?.blocks ?? {};

    for (const blockId in blocks) {
      const block = blocks[blockId];
      if (block.type?.includes(blockName)) {
        return {
          isEnabled: !block.disabled,
          status: 200,
        };
      }
    }

    return { isEnabled: false, status: 200 };
  }

  async getThemeEmbedStatus(params: {
    themeId: string;
    blockName: string;
  }): Promise<{ isEnabled: boolean; status: number }> {
    const { themeId, blockName } = params;

    const normalizedThemeId = themeId.split("/").pop() as string;

    const settingsData =
      await this.api.fetchThemeSettingsData(normalizedThemeId);

    return this.checkThemeExtensionStatus(settingsData, blockName);
  }

  async saveAppearanceSettings(appearanceForm: AppearanceForm) {
    return await this.api?.saveMetaField(
      appearanceForm as unknown as FormData,
      "zuper_notify_me",
      "appearance",
      "json",
    );
  }

  /* Theme Link Generator For Enable The Theme App Extension */
  gotoThemeAppExtension(themeId: string, blockName: string, apiKey: string) {
    const normalizedThemeId = themeId.split("/").pop() as string;
    return `https://${this.store?.shop}/admin/themes/${normalizedThemeId}/editor?context=apps&template=${"main"}&activateAppId=${apiKey?.split("/")?.pop()}/${blockName}`;
  }

  gotoProductsLink(productId: string, variantId = "") {
    const normalizedProductId = productId.split("/").pop() as string;
    const normalizedVariantId = variantId.split("/").pop() as string;
    return `https://admin.shopify.com/store/${this.store?.shop.split(".").shift()}/products/${normalizedProductId}${normalizedVariantId && "?variant="}${normalizedVariantId}`;
  }
}

const shopifyService = (
  admin: AdminApiContext,
  session: Session,
  apiVersion: ApiVersion,
  store: Store | null,
) => new ShopifyService(admin, session, store, apiVersion);

export default shopifyService;
