import { useEffect, useState } from "react";

/* ===================== Types ===================== */

interface NotificationData {
  id: string;
  createdAt: string;
  updatedAt: string;
  store_id: string;
  store_domain: string;
  email: string;
  country: string;
  country_code: string;
  number: string;
  product_id: string;
  variant_id: string;
  is_sent: boolean;
  is_error: boolean;
  error_message: string;
}

interface Product {
  id: string;
  title: string;
  featuredImage?: {
    url: string;
  };
}

interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: string;
}

/* ===================== Component ===================== */

export default function NotificationDetails() {
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /** Mock data - replace with loader / API data */
  const notificationData: NotificationData = {
    id: "0bd8957d-a9b6-4a1b-b94f-64e30f8558d0",
    createdAt: "2025-12-02T13:05:09.672Z",
    updatedAt: "2025-12-02T13:05:09.672Z",
    store_id: "71078445206",
    store_domain: "matrix-market-9.myshopify.com",
    email: "huihuih@rtuu.vi",
    country: "AF",
    country_code: "93",
    number: "871511515135",
    product_id: "8549298241686",
    variant_id: "45853099458710",
    is_sent: false,
    is_error: false,
    error_message: "",
  };

  /* ===================== Helpers ===================== */

  const formatDate = (value: string): string => {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getStatus = (): {
    text: string;
    tone: "success" | "critical" | "warning";
  } => {
    if (notificationData.is_sent) return { text: "Sent", tone: "success" };
    if (notificationData.is_error) return { text: "Error", tone: "critical" };
    return { text: "Pending", tone: "warning" };
  };

  /* ===================== Data Fetch ===================== */

  useEffect(() => {
    async function fetchData() {
      try {
        if (notificationData.product_id) {
          const productResponse = await shopify.query(
            `
            query GetProduct($id: ID!) {
              product(id: $id) {
                id
                title
                featuredImage {
                  url
                }
              }
            }
          `,
            {
              variables: {
                id: `gid://shopify/Product/${notificationData.product_id}`,
              },
            },
          );

          setProduct(productResponse.data?.product ?? null);
          if (!productResponse.data?.product) {
            setProductError("Product no longer available");
          }
        } else {
          setProductError("Product information unavailable");
        }

        if (notificationData.variant_id) {
          const variantResponse = await shopify.query(
            `
            query GetVariant($id: ID!) {
              productVariant(id: $id) {
                id
                title
                sku
                price
              }
            }
          `,
            {
              variables: {
                id: `gid://shopify/ProductVariant/${notificationData.variant_id}`,
              },
            },
          );

          setVariant(variantResponse.data?.productVariant ?? null);
          if (!variantResponse.data?.productVariant) {
            setVariantError("Variant no longer available");
          }
        } else {
          setVariantError("Variant information unavailable");
        }
      } catch {
        setProductError("Product information unavailable");
        setVariantError("Variant information unavailable");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <s-text>Loading notification details...</s-text>;
  }

  const status = getStatus();

  /* ===================== UI ===================== */

  return (
    <s-page heading="Back in Stock Notification">
      {/* Customer */}
      <s-section>
        <s-heading>Customer Information</s-heading>
        <s-stack gap="base">
          <s-text>
            <s-text type="strong">Email: </s-text>
            {notificationData.email || "Not provided"}
          </s-text>

          <s-text>
            <s-text type="strong">Phone: </s-text>
            {notificationData.country_code && notificationData.number
              ? `+${notificationData.country_code} ${notificationData.number}`
              : "Not provided"}
          </s-text>

          {notificationData.country && (
            <s-text>
              <s-text type="strong">Country: </s-text>
              {notificationData.country}
            </s-text>
          )}
        </s-stack>
      </s-section>

      {/* Product */}
      <s-section>
        <s-heading>Product Information</s-heading>

        {productError && <s-text tone="critical">{productError}</s-text>}

        {product && (
          <s-stack gap="base">
            {product.featuredImage?.url && (
              <s-box inlineSize="200px" blockSize="200px">
                <s-image
                  src={product.featuredImage.url}
                  alt={product.title}
                  objectFit="contain"
                />
              </s-box>
            )}
            <s-text>
              <s-text type="strong">Product: </s-text>
              {product.title}
            </s-text>
          </s-stack>
        )}

        {variantError && <s-text tone="critical">{variantError}</s-text>}

        {variant && (
          <s-stack gap="base">
            <s-text>
              <s-text type="strong">Variant: </s-text>
              {variant.title}
            </s-text>

            {variant.sku && (
              <s-text>
                <s-text type="strong">SKU: </s-text>
                {variant.sku}
              </s-text>
            )}

            <s-text>
              <s-text type="strong">Price: </s-text>${variant.price}
            </s-text>
          </s-stack>
        )}
      </s-section>

      {/* Status */}
      <s-section>
        <s-heading>Notification Status</s-heading>

        <s-stack gap="base">
          <s-badge tone={status.tone}>{status.text}</s-badge>

          {notificationData.is_error && (
            <s-text tone="critical">
              <s-text type="strong">Error: </s-text>
              {notificationData.error_message || "An error occurred"}
            </s-text>
          )}

          <s-text color="subdued">
            <s-text type="strong">Created: </s-text>
            {formatDate(notificationData.createdAt)}
          </s-text>

          <s-text color="subdued">
            <s-text type="strong">Updated: </s-text>
            {formatDate(notificationData.updatedAt)}
          </s-text>
        </s-stack>
      </s-section>
    </s-page>
  );
}
