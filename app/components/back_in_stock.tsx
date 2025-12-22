import { ActionType } from "app/constants/requests";
import { useShopifyService } from "app/context/shopify_shop_context";
import { ProductRow, ProductTableRes } from "app/types/products_table";
import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { useFetcher } from "react-router";

const RenderProductTableRow = ({
  variant,
  isSelected,
  onToggleSelect,
  subscribers,
  lastAdded,
}: {
  variant: ProductRow;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  subscribers: number;
  lastAdded: string;
}) => {
  const Service = useShopifyService();
  const variantId = variant.variant_id.split("/").pop();

  return (
    <s-table-row id={`product-row-${variantId}`}>
      {/* <s-table-cell id={`checkbox-cell-${variantId}`}>
        <s-checkbox
          id={`checkbox-${variantId}`}
          checked={isSelected}
          onChange={() => onToggleSelect(variant.id)}
        />
      </s-table-cell> */}
      <s-table-cell id={`product-cell-${variantId}`}>
        <s-clickable
          href={Service?.gotoProductsLink(variant?.product_id, variantId)}
          target="_blank"
        >
          <s-stack direction="inline" gap="small" alignItems="center">
            {variant.imageUrl && (
              <s-box inlineSize="40px" blockSize="40px">
                <s-image
                  id={`product-image-${variantId}`}
                  src={variant.imageUrl}
                  alt={variant.name}
                  aspectRatio="1/1"
                  objectFit="cover"
                  borderRadius="small"
                />
              </s-box>
            )}
            <s-stack direction="block" gap="small-100">
              <s-text id={`product-title-${variantId}`} type="strong">
                {variant.name}
              </s-text>
              {variant.variant !== "Default Title" && (
                <s-text id={`variant-title-${variantId}`} color="subdued">
                  {variant.variant}
                </s-text>
              )}
            </s-stack>
          </s-stack>
        </s-clickable>
      </s-table-cell>
      <s-table-cell id={`sku-cell-${variantId}`}>
        <s-text color="subdued">{variant.sku || "-"}</s-text>
      </s-table-cell>
      <s-table-cell id={`quantity-cell-${variantId}`}>
        <s-text>{variant.variant}</s-text>
      </s-table-cell>
      <s-table-cell id={`subscribers-cell-${variantId}`}>
        <s-text>{subscribers}</s-text>
      </s-table-cell>
      <s-table-cell id={`last-added-cell-${variantId}`}>
        <s-text color="subdued">{lastAdded}</s-text>
      </s-table-cell>
    </s-table-row>
  );
};

const renderProductTableHeader = (
  allSelected: boolean,
  someSelected: boolean,
  onToggleSelectAll: (checked: boolean) => void,
) => {
  return (
    <s-table-header-row id="table-header-row">
      {/* <s-table-header id="header-checkbox">
        <s-checkbox
          id="select-all-checkbox"
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={(e) => onToggleSelectAll(e.currentTarget.checked)}
        />
      </s-table-header> */}
      <s-table-header id="header-product" listSlot="primary">
        Product
      </s-table-header>
      <s-table-header id="header-sku" listSlot="labeled">
        SKU
      </s-table-header>
      <s-table-header id="header-quantity" listSlot="labeled" format="numeric">
        Available quantity
      </s-table-header>
      <s-table-header
        id="header-subscribers"
        listSlot="labeled"
        format="numeric"
      >
        Subscriber(s)
      </s-table-header>
      <s-table-header id="header-last-added" listSlot="labeled">
        Last added
      </s-table-header>
    </s-table-header-row>
  );
};

const renderEmptyState = (message: string) => {
  return (
    <s-table-row id="empty-state-row">
      <s-table-cell id="empty-state-cell">
        <s-box padding="large">
          <s-text color="subdued">{message}</s-text>
        </s-box>
      </s-table-cell>
      <s-table-cell id="empty-cell-2"></s-table-cell>
      <s-table-cell id="empty-cell-3"></s-table-cell>
      <s-table-cell id="empty-cell-4"></s-table-cell>
      <s-table-cell id="empty-cell-5"></s-table-cell>
      <s-table-cell id="empty-cell-6"></s-table-cell>
    </s-table-row>
  );
};

export default function ProductTable({
  productTableData,
}: {
  productTableData: ProductTableRes;
}) {
  console.log("Product table inside the Variants", productTableData);
  const [variants, setVariants] = useState<ProductRow[]>(
    [], // productTableData?.data,
  );
  console.log("variants", variants);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [pageInfo, setPageInfo] = useState<
    ProductTableRes["pagination"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useFetcher<ProductTableRes>();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef(false);

  // Debounced fetch function - DON'T set loading here
  const debouncedFetch = useCallback(
    (page: number, limit: number, order: string) => {
      // Cancel any pending fetch
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Don't queue if already fetching
      if (fetcher.state !== "idle") {
        console.log("Fetch in progress, skipping");
        return;
      }

      console.log("Scheduling fetch for page:", page);

      // Delay the actual fetch
      debounceTimerRef.current = setTimeout(() => {
        // Double-check before submitting
        if (fetcher.state !== "idle") {
          console.log("Fetch started during debounce, skipping");
          return;
        }

        console.log("Actually fetching page:", page);
        fetcher.submit(
          {
            type: ActionType.GET_PRODUCTS,
            skip: page.toString(),
            limit: limit.toString(),
            order,
          },
          {
            method: "POST",
            encType: "application/json",
          },
        );
      }, 300);
    },
    [fetcher.state], // Add fetcher.state as dependency
  );

  // Handle loading state based on fetcher.state instead
  useEffect(() => {
    if (fetcher.state === "submitting" || fetcher.state === "loading") {
      setLoading(true);
    }
  }, [fetcher.state]);

  // Handle fetcher data updates
  useEffect(() => {
    if (fetcher.data) {
      console.log("Set Data");
      setVariants(fetcher.data.data);
      setPageInfo(fetcher.data.pagination);
      setLoading(false);
    }
  }, [fetcher.data]);

  // Initial fetch - runs only once
  useEffect(() => {
    if (hasFetched.current) return;
    if (fetcher.state !== "idle") return; // Extra guard

    hasFetched.current = true;
    console.log("Initial fetch");

    fetcher.submit(
      {
        type: ActionType.GET_PRODUCTS,
        skip: "1",
        limit: "10",
        order: "desc",
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  }, []); // Keep empty - hasFetched ref handles it

  const handleNextPage = (pageInfo: ProductTableRes["pagination"]): void => {
    debouncedFetch(+pageInfo.currentPage + 1, pageInfo.limit, "desc");
  };

  const handlePreviousPage = (
    pageInfo: ProductTableRes["pagination"],
  ): void => {
    debouncedFetch(+pageInfo.currentPage - 1, pageInfo.limit, "desc");
  };

  const toggleSelect = (id: string) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {};
    variants.forEach((variant) => {
      newSelected[variant.id] = checked;
    });
    setSelectedRows(newSelected);
  };

  const allSelected =
    variants?.length > 0 &&
    variants?.every((variant) => selectedRows[variant.id]);
  const someSelected = variants?.some((variant) => selectedRows[variant.id]);

  if (error) {
    return (
      <s-page id="main-page" heading="Back in Stock Products">
        <s-banner id="error-banner" tone="critical">
          <s-text>{error}</s-text>
        </s-banner>
      </s-page>
    );
  }

  return (
    <s-page id="main-page" heading="Back in Stock Products" inlineSize="large">
      <s-section id="products-section" padding="none">
        <s-table
          id="products-table"
          paginate={true}
          loading={loading}
          hasNextPage={pageInfo?.hasNextPage || false}
          hasPreviousPage={pageInfo?.hasPreviousPage || false}
          onNextPage={() => handleNextPage(pageInfo!)}
          onPreviousPage={() => handlePreviousPage(pageInfo!)}
        >
          {renderProductTableHeader(allSelected, someSelected, handleSelectAll)}

          <s-table-body id="table-body">
            {variants?.length === 0 && !loading
              ? renderEmptyState("No products found")
              : variants.map((variant) => (
                  <Fragment key={variant.variant_id + variant.id}>
                    <RenderProductTableRow
                      variant={variant}
                      isSelected={!!selectedRows[variant.id]}
                      onToggleSelect={toggleSelect}
                      subscribers={variant.subscribers}
                      lastAdded={variant.lastAdded}
                    />
                  </Fragment>
                ))}
          </s-table-body>
        </s-table>
      </s-section>
    </s-page>
  );
}
