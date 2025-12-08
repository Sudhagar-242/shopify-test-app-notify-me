import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "app/db.server";

interface PayLoadType {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
  admin_graphql_api_id: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = await authenticate.webhook(request);
  const { topic, payload } = response;
  const admin = response.admin;
  const data = await admin?.graphql(
    `#graphql
    query InventoryItem($id: ID!) {
      inventoryItem(id: $id) {
        variant {
          id
          product {
            id
          }
        }
      }
    }
  `,
    {
      variables: {
        id: `gid://shopify/InventoryItem/${payload.inventory_item_id}`,
      },
    }
  );

  const { inventoryItem }: {
    inventoryItem: {
      variant: {
        id: string,
        product: {
          id: string
        }
      }
    }
  } = data ? (await data.json()).data : {};
  console.log(JSON.stringify(inventoryItem, null, 2));

  const Shop = await prisma.shop.findUnique({ where: { shop: response.shop } });

  console.log(`Received ${topic} webhook ${JSON.stringify(payload)} for ${response.shop}`);

  try {
    await fetch(
      `${process.env.BASE_URL}/store/inventory/update`,
      {
        method: "POST",
        body: JSON.stringify({
          ...response,
          store_id: Shop?.shopId?.split('/').pop(),
          product_id: inventoryItem?.variant?.product?.id.split('/').pop(),
          variant_id: inventoryItem?.variant?.id.split('/').pop(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log(payload);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error forwarding webhook:", error);
  }

  return new Response("OK", { status: 200 });
};

// import type { ActionFunctionArgs } from "react-router";
// import { authenticate } from "../shopify.server";

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const { shop, topic } = await authenticate.webhook(request);

//   console.log(`Received ${topic} webhook for ${shop}`);

//   return new Response();
// };
