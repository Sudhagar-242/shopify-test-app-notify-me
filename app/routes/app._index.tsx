import React, { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useActionData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "app/db.server";
import SubscribersList, { SubscribersType } from "app/components/subscribers_list";
import MetricsGrid from "app/components/metrics_card";
import SubscribersTable from "app/components/sunscription_table";
import BackInStockTable from "app/components/back_in_stock";
import TestCard from "app/components/counter";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const Store = await prisma.shop.findUnique({
    where: { shop: session?.shop }
  });

  const storeId = Store?.shopId?.split("/").pop() || "";

  const subscribersResponse = await fetch(
    `http://localhost:3000/notification/subscribe?store_id=${storeId}`
  );
  const subscribers = (await subscribersResponse.json()) as SubscribersType[];

const AnalyticsOverviewResponse = await fetch(
    `http://localhost:3000/store/analytics/overview?store_id=${storeId}`);
  const AnalyticsOverviewData = (await AnalyticsOverviewResponse.json());


  const productIds = [
    ...new Set(
      subscribers.map((s) => `gid://shopify/Product/${s.product_id}`)
    )
  ];

  let products = [];

  if (productIds.length > 0) {
    const productQuery = `#graphql
      query getProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            status
            totalInventory
            featuredMedia {
              preview{
                image{
                  url
                }
              }
              mediaContentType
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price
                }
              }
            }
          }
        }
      }
    `;

    const shopifyResp = await admin.graphql(productQuery, {
      variables: { ids: productIds }
    });

    const productJson = await shopifyResp.json();
    products = productJson.data.nodes.filter(Boolean);
  }

  const OrderResponse = await admin.graphql(
    `#graphql 
    query ordersData {
      orders(first: 250) {
        edges {
          node {
            id
            name
            email
          }
        }
      }
      customers(first: 250) {
        edges {
          node {
            id
            firstName
            lastName
            verifiedEmail
          }
        }
      }
    }
  `
  );

  const OrdersJson = await OrderResponse.json();

  return {
    orders: OrdersJson.data,
    subscribers,
    products, 
    AnalyticsOverviewData
  };
};


export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    data: (await request.formData()).get("visitorsName"),
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const { orders, subscribers, products, AnalyticsOverviewData } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const data = useActionData();
  const shopify = useAppBridge();

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.product?.id) {
      shopify.toast.show("Product created");
    }
    if (shopify.support.registerHandler) {
      shopify.support.registerHandler(handler);
    }
  }, [fetcher.data?.product?.id, shopify]);

  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  const handler = () => {
    console.log("Support Handler Called");
  };

  function DemandingProduct(subscribers: SubscribersType[]) {
    const countMap: Record<string, number> = {};

    for (const sub of subscribers) {
      countMap[sub.product_id] = (countMap[sub.product_id] || 0) + 1;
    }

    let maxProduct = "N/A";
    let maxCount = 0;

    for (const productId in countMap) {
      if (countMap[productId] > maxCount) {
        maxCount = countMap[productId];
        maxProduct = productId;
      }
    }

    return maxProduct;
  }

  const metricsData = [
    {
      title: "No of Requests",
      value: subscribers.length,
      badge: { tone: "success", icon: "arrow-up", text: "12%" },
    },
    {
      title: "Demanding Product",
      value: DemandingProduct(subscribers),
      badge: { tone: "warning", text: "0%" },
    },
    {
      title: "Notification Sent",
      value: subscribers.filter((sub) => sub.is_sent == true).length,
      badge: { tone: "critical", icon: "arrow-down", text: "0.8%" },
    },
    {
      title: "Notification Pending",
      value: subscribers.filter((sub) => sub.is_sent == false).length,
      badge: { tone: "critical", icon: "arrow-down", text: "0.8%" },
    }
  ] as const;

  const someData = {
    'high-demand': [
      {
        id: '1',
        thumbnailUrl: 'https://cdn.shopify.com/.../copper-light.jpg',
        title: 'Copper Light',
        subtitle: undefined,
        currentRequests: 1,
        avgRequestAge: '50 minutes',
        historicalRequests: 1,
      },
      {
        id: '2',
        thumbnailUrl: 'https://cdn.shopify.com/.../beanie-navy.jpg',
        title: 'Beanie (varying quantity tracker settings)',
        subtitle: 'Navy',
        currentRequests: 1,
        avgRequestAge: '50 minutes',
        historicalRequests: 1,
      },
    ],
    trending: [],
    'high-potential': [],
  };

  return (
    <>
    <div>
          <h1 className="bg-black">Hello World!</h1>
        </div>
        <div>
          <p>{JSON.stringify(AnalyticsOverviewData)}</p>
        </div>
        <TestCard />
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