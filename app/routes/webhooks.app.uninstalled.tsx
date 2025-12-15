import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { config } from "process";

interface UninstallPayloadType {
  store_id: string;
  access_token: string;
  store_domain: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  const gqlResponse = await admin?.graphql(`
          #graphql
          query getData {
            shop {
              id
              myshopifyDomain
              shopOwnerName
            }
          }
        `);

  const gqlJson = await gqlResponse?.json();



  // ---------------------------
  // Send details to your server
  // ---------------------------
  const uninstallPayload: UninstallPayloadType = {
    "store_id": gqlJson?.data.shop.id.split('/').pop(),
    "store_domain": gqlJson?.data.shop.myshopifyDomain,
    "access_token": session?.accessToken ?? "",
  };

  console.log(gqlJson, uninstallPayload)
  
  const deleteStoreResponse = await fetch(`${process.env.BASE_URL}/store/uninstall`, {
    method: 'Delete',
    body: JSON.stringify(uninstallPayload)
  })

  console.log("Delete Store Response Status:", deleteStoreResponse.status);
  console.log("Delete Store Response OK:", deleteStoreResponse.ok);
  const text = await deleteStoreResponse.text();
  console.log("Delete Store Response Body:", text);
  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
