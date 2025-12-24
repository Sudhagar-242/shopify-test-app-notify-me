import { useShopifyService } from "app/context/shopify_shop_context";
import { AnalyticsProductsInDemand } from "app/types/analytics";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

// Reusable Products in Demand component
// interface DemandProduct {
//   id: string;
//   title: string;
//   count?: string | number;
//   imageUrl?: string;
//   date?: Date;
// }

interface ProductsInDemandTabs {
  label: string;
  value: string;
  onChange?: (
    products: AnalyticsProductsInDemand[],
  ) => AnalyticsProductsInDemand[] | undefined;
}

interface ProductsInDemandComponentProps {
  products: AnalyticsProductsInDemand[];
  activeTab: string;
  onTabChange: (tabValue: string) => void;
  tabs: ProductsInDemandTabs[];
}

export default function RenderProductsInDemandComponent({
  products,
  tabs,
}: ProductsInDemandComponentProps) {
  const [currentTab, setcurrentTab] = useState<ProductsInDemandTabs>(tabs[0]);
  const [activeTab, setactiveTab] = useState<string>(tabs[0].value);

  const fetcher = useFetcher<{ isEnabled?: boolean; error?: string }>();
  const [loading, setLoading] = useState<boolean>(true);

  const service = useShopifyService();

  // Get status from fetcher response
  const isActive = fetcher.data?.isEnabled ?? false;
  const error = fetcher.data?.error ?? null;

  useEffect(() => {
    // Fetch theme status when component mounts or theme changes
  }, []);

  useEffect(() => {
    // Stop loading when data is received
    if (fetcher.data) {
      setLoading(false);
    }
  }, [fetcher.data]);

  return (
    <>
      <s-section id="products-in-demand-section">
        <s-heading id="products-in-demand-heading">
          Products in demand
        </s-heading>
        <s-stack id="products-in-demand-tabs" direction="inline" gap="small">
          {tabs.map((tab) => {
            const isActive: boolean = activeTab === String(tab.value);
            return (
              <s-button
                key={tab.value}
                id={`demand-tab-${tab.value}`}
                variant={isActive ? "primary" : "secondary"}
                onClick={() => {
                  setcurrentTab(tab);
                  setactiveTab(tab.value);
                }}
              >
                {tab.label ?? "Unknown Product"}
              </s-button>
            );
          })}
        </s-stack>
        <s-stack id="products-in-demand-list" gap="none" direction="block">
          {Array.isArray(products) && products.length === 0 ? (
            <s-box id="products-in-demand-empty" padding="base">
              <s-text id="products-in-demand-empty-text" color="subdued">
                No products found
              </s-text>
            </s-box>
          ) : (
            Array.isArray(products) &&
            products?.map((product, index) => (
              <s-clickable
                key={product.id || index}
                id={`demand-product-${index}`}
                padding="base"
                borderWidth="none none base none"
                href={service.gotoProductsLink(product.product_id)}
              >
                <s-stack
                  id={`demand-product-stack-${index}`}
                  direction="inline"
                  gap="base"
                  alignItems="center"
                >
                  <s-thumbnail
                    id={`demand-product-thumbnail-${index}`}
                    src={product.imageUrl || ""}
                    alt={product.title}
                    size="base"
                  />
                  <s-stack
                    id={`demand-product-info-${index}`}
                    gap="small"
                    direction="block"
                  >
                    <s-text id={`demand-product-title-${index}`} type="strong">
                      {product.title ?? "Unknown Product"}
                    </s-text>
                    {product?.product_count && (
                      <s-text
                        id={`demand-product-subtitle-${index}`}
                        color="subdued"
                      >
                        {product.product_count}
                      </s-text>
                    )}
                  </s-stack>
                </s-stack>
              </s-clickable>
            ))
          )}
        </s-stack>
      </s-section>
      {/* {loading || fetcher.state === "submitting" ? (
        <s-spinner accessibilityLabel="Loading Theme Status" size="base" />
      ) : (
        <s-badge
          id="app-embed-status-badge"
          tone={error ? "critical" : isActive ? "success" : "caution"}
        >
          {error ? "Error" : isActive ? "Active" : "Disabled"}
        </s-badge>
      )} */}
    </>
  );
}
