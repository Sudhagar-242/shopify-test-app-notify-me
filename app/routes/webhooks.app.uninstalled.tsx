import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { config } from "process";
import prisma from "../db.server";

interface UninstallPayloadType {
  store_id: string;
  access_token: string;
  store_domain: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  const Store = await prisma.shop.findUnique({
    where: { shop: session?.shop },
  });

  // ---------------------------
  // Send details to your server
  // ---------------------------
  const uninstallPayload: UninstallPayloadType = {
    store_id: Store?.shopId?.split("/").pop() ?? "",
    store_domain: Store?.shop ?? "",
    access_token: Store?.accessToken ?? "",
  };

  console.log(uninstallPayload);

  const deleteStoreResponse = await fetch(
    `${process.env.BASE_URL}/store/uninstall`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uninstallPayload),
    },
  );

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
