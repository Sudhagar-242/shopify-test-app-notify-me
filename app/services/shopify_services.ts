import {
  AdminApiContext,
  ApiVersion,
  Session,
} from "@shopify/shopify-app-react-router/server";
import shopifyAPIService from "./shopify_api_services";
import { flattenThemes } from "app/routes/app._index";

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
    ] = await Promise.all([
      this.api.getApp(),
      this.api.getThemes(),
      this.api.getAnalyticsOverview(),
      this.api.getRecentActivity(),
      this.api.getAnalyticsPerformance("7_days"),
      this.api.getDemandingProducts(),
    ]);

    return {
      App,
      Store: this.store,
      Theme: flattenThemes(Theme),
      AnalyticsOverviewData,
      AnalyticsRecentActivity,
      AnalyticsPerfomaceData,
      AnalyticsDemandingProducts,
    };
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

  /* Theme Link Generator For Enable The Theme App Extension */
  gotoThemeAppExtension(themeId: string, blockName: string, apiKey: string) {
    const normalizedThemeId = themeId.split("/").pop() as string;
    return `https://${this.store?.shop}/admin/themes/${normalizedThemeId}/editor?context=apps&template=${"main"}&activateAppId=${apiKey?.split("/")?.pop()}/${blockName}`;
  }

  gotoProductsLink(productId: string) {
    const normalizedproductId = productId.split("/").pop() as string;
    return `https://admin.shopify.com/store/${this.store?.shop.split(".").shift()}/products/${normalizedproductId}`;
  }
}

const shopifyService = (
  admin: AdminApiContext,
  session: Session,
  apiVersion: ApiVersion,
  store: Store | null,
) => new ShopifyService(admin, session, store, apiVersion);

export default shopifyService;
