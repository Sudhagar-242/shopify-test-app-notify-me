import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),

  hooks: {
    afterAuth: async ({ session, admin }) => {
      try {
        console.log("=== AFTER AUTH STARTED ===");
        console.log("Session:", session);

        // ---------------------------
        // Get Store Info from GraphQL
        // ---------------------------
        const gqlResponse = await admin.graphql(`
          #graphql
          query getData {
            shop {
              id
              myshopifyDomain
              shopOwnerName
            }
          }
        `);

        const gqlJson = await gqlResponse.json();
        console.log("GraphQL Result:", JSON.stringify(gqlJson, null, 2));

        // ---------------------------
        // Send details to your server
        // ---------------------------
        const webhookBody = {
          "store_id": gqlJson.data.shop.id.split('/').pop(),
          "store_domain": gqlJson.data.shop.myshopifyDomain,
          "owner": gqlJson.data.shop.shopOwnerName,
          "access_token": session.accessToken,
          "scopes": session.scope?.split(','),
          "is_deleted": false,
          "is_active": "true"
        };


        console.log("Sending to webhook.site:", webhookBody);

        const responses = await Promise.all([
          fetch(`${process.env.BASE_URL}/store/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookBody),
          }),
        ]);

        await prisma.shop.upsert({
          where: { shop: session.shop },
          update: {
            accessToken: session.accessToken,
            shopId: gqlJson.data.shop.id,
          },
          create: {
            shop: session.shop,
            accessToken: session.accessToken,
            shopId: gqlJson.data.shop.id,
          },
        });


        // Log each response
        for (const res of responses) {
          console.log("Webhook Response Status:", res.status);
          console.log("Webhook Response OK:", res.ok);
          const text = await res.text();
          console.log("Webhook Response Body:", text);
        }

        // ---------------------------
        // Register Webhooks
        // ---------------------------
        console.log("Registering Webhooks...");
        await shopify.registerWebhooks({ session });
        console.log("Webhooks Registered Successfully");

        console.log("=== AFTER AUTH DONE ===");

      } catch (err) {
        console.error("❌ ERROR IN afterAuth:", err);
      }
    },
  },

  distribution: AppDistribution.AppStore,
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
