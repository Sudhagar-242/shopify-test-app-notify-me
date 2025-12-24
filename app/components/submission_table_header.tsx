import { useState } from "react";
import ProductTable from "./back_in_stock";
import SubscribersManagement from "./subscriber_management_table";
import { GetSubscriberResponse } from "app/types/subscribers";
import { ProductTableRes } from "app/types/products_table";

export type View = {
  label: string;
  value: "product" | "submission";
  section: JSX.Element;
  icon: string;
};

const Views: (
  submissions: GetSubscriberResponse,
  products: ProductTableRes,
) => () => View[] =
  (submissions: GetSubscriberResponse, products: ProductTableRes) => () => [
    {
      label: "Product View",
      value: "product",
      section: <SubscribersManagement />,
      icon: "collection-list",
    },
    {
      label: "Submission View",
      value: "submission",
      section: <ProductTable productTableData={products} />,
      icon: "person-list",
    },
  ];

export default function SubmissionAndProducts({
  submissions,
  products,
}: {
  submissions: GetSubscriberResponse;
  products: ProductTableRes;
}) {
  // create views ONCE per render
  const views = Views(submissions, products)();

  const [view, setView] = useState<View>(views[0]);

  return (
    <>
      <s-stack
        direction="inline"
        gap="base"
        justifyContent="space-between"
        alignItems="center"
      >
        <s-heading id="page-title">Submissions & Products</s-heading>

        <s-stack direction="inline" gap="base">
          {views.map((tabView, idx) => {
            if (view.value === tabView.value) {
              return (
                <s-button
                  key={tabView.value}
                  icon={tabView.icon as ""}
                  onClick={() => setView(views[idx + 1] ?? views[0])}
                >
                  {tabView.label}
                </s-button>
              );
            }
            return null;
          })}
        </s-stack>
      </s-stack>

      {view.section}
    </>
  );
}
