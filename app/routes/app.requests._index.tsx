import { CallbackEvent } from "@shopify/polaris-types";
import ProductTable from "app/components/back_in_stock";
import shopifyService from "app/services/shopify_services";
import { apiVersion, authenticate } from "../shopify.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useFetcher,
  useFormAction,
  useLoaderData,
} from "react-router";
import prisma from "app/db.server";
import SubscribersManagement from "app/components/subscriber_management_table";

import { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import Expandable from "app/components/expandable";
import { ActionType } from "app/constants/requests";
import ProductPreview from "app/components/preview_product_page/preview_product";
import {
  ButtonStyleEditor,
  ButtonStyleValues,
} from "app/components/form_components/button_style_editor";
import SubmissionAndProducts from "app/components/submission_table_header";
import { ProductTableRes } from "app/types/products_table";
import { GetSubscriberResponse } from "app/types/subscribers";
import { useDirtyForm } from "app/hooks/useDirtyForm";
import FieldCard, {
  DynamicFieldConfig,
} from "app/components/form_builder/edit_card";
import {
  AppearanceErrors,
  DynamicFieldErrors,
  FieldError,
  useAppearanceValidation,
} from "app/hooks/useAppearanceValidation";
// IconType import removed — use string for s-button icons

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const Store = await prisma.shop.findUnique({
    where: { shop: session?.shop },
  });
  const ShopifyService = shopifyService(admin, session, apiVersion, Store);
  // const { Subscriber, ProductsTable } =
  //   await ShopifyService.getRequestsPageLoaderData();

  // return { Subscriber, ProductsTable };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const Store = await prisma.shop.findUnique({
    where: { shop: session?.shop },
  });
  const formData = await request.json();
  console.log(formData);
  const ShopifyService = shopifyService(admin, session, apiVersion, Store);
  try {
    switch (formData.type) {
      case ActionType.GET_SUBSCRIBERS: {
        const { skip, limit, order } = formData;
        const result = await ShopifyService.getSubscribers(skip, limit, order);
        console.log(result);
        return result;
      }

      case ActionType.GET_PRODUCTS: {
        const { skip, limit, order } = formData;
        const result = await ShopifyService.getProductTableData(
          skip,
          limit,
          order,
        );
        return result;
      }

      default:
        return [{ error: "Invalid action type" }, { status: 400 }];
    }
  } catch (error) {
    console.error("Action error:", error);

    return [{ error: "Internal server error" }, { status: 500 }];
  }
};

const TabsMethod: (
  submissions: GetSubscriberResponse,
  products: ProductTableRes,
) => () => {
  label: string;
  value: string;
  section: JSX.Element;
  aside?: JSX.Element;
}[] = (submissions: GetSubscriberResponse, products: ProductTableRes) => () => [
  {
    label: "Submissions & Products",
    value: "requests",
    section: (
      <SubmissionAndProducts submissions={submissions} products={products} />
    ),
  },
  {
    label: "Appearance",
    value: "appearance",
    section: <Appearance />,
  },
];

function Request() {
  // const { Subscriber, ProductsTable } = useLoaderData<typeof loader>();
  const Tabs = TabsMethod({} as GetSubscriberResponse, {} as ProductTableRes)();
  const [currentTab, setCurrentTab] = useState<(typeof Tabs)[0]>(Tabs[0]);
  const fetcher = useFetcher<typeof action>();

  // console.log("Products Table", ProductsTable);

  return (
    <s-page>
      <s-stack gap="base">
        <s-stack
          direction="inline"
          alignContent="center"
          justifyContent="center"
          gap="base"
        >
          {Tabs.map((tab) => (
            <s-button
              key={tab.label}
              variant={currentTab.value === tab.value ? "primary" : "tertiary"}
              onClick={() => setCurrentTab(tab)}
            >
              {tab.label}
            </s-button>
          ))}
        </s-stack>

        {currentTab.section}
      </s-stack>
      {currentTab.aside && currentTab.aside}
    </s-page>
  );
}

export default Request;

const displayOptions: {
  label: string;
  value: "inline" | "float" | "hidden";
}[] = [
  {
    label: "Show inline button and popup",
    value: "inline",
  },
  {
    label: "Show float button",
    value: "float",
  },
  {
    label: "Hidden",
    value: "hidden",
  },
];

type ButtonStyleValues = {
  normalTextColor: string;
  normalBgColor: string;
  hoverTextColor: string;
  hoverBgColor: string;
  fontSize: number;
  padding: number;
  borderCorner: number;
};

export type AppearanceForm = {
  product_detail_show: "inline" | "float" | "hidden";
  notify_me: ButtonStyleValues;
  subscribe: ButtonStyleValues;
  footer: string;
  fields: DynamicFieldConfig[];
};

const appearanceForm: AppearanceForm = {
  product_detail_show: "float",
  notify_me: {
    normalTextColor: "#FFFFFF",
    normalBgColor: "#008060",
    hoverTextColor: "#FFFFFF",
    hoverBgColor: "#006E52",
    fontSize: 16,
    padding: 14,
    borderCorner: 4,
  },
  subscribe: {
    normalTextColor: "#000000",
    normalBgColor: "#FFD814",
    hoverTextColor: "#000000",
    hoverBgColor: "#F7CA00",
    fontSize: 14,
    padding: 12,
    borderCorner: 6,
  },
  footer: "We will notify you once the product is back in stock.",
  fields: [
    {
      id: "fld_email",
      type: "text",
      label: "Email address",
      showLabel: true,
      required: true,
      placeholder: "Enter your email",
    },
    {
      id: "fld_phone",
      type: "text",
      label: "Phone number",
      showLabel: true,
      required: false,
      placeholder: "Optional phone number",
    },
    {
      id: "fld_country",
      type: "select",
      label: "Country",
      showLabel: true,
      required: true,
      placeholder: "Select your country",
      options: "India\nUnited States\nUnited Kingdom",
      defaultValue: "India",
    },
    {
      id: "fld_notify",
      type: "checkbox",
      label: "Notify me via",
      showLabel: true,
      required: false,
      options: "Email,SMS",
      defaultValue: "Email",
    },
    {
      id: "fld_terms",
      type: "terms",
      label: "Terms & Conditions",
      showLabel: false,
      required: true,
      value: "I agree to receive notifications about product availability.",
      defaultSelected: false,
    },
  ],
};

export function validateAppearance(values: AppearanceForm): AppearanceErrors {
  return {
    product_detail: validateProductDetail(values?.product_detail_show),
    notify_me: validateButton(values.notify_me),
    subscribe: validateButton(values.subscribe),
    footer: validateFooter(values.footer),
    fields: validateDynamicFields(values.fields),
  };
}

function validateProductDetail(value: string): FieldError {
  return value ? undefined : "Please select a display option";
}

function validateFooter(value: string): FieldError {
  if (!value.trim()) return "Footer cannot be empty";
  if (value.length > 200) return "Footer must be under 200 characters";
  return undefined;
}

function validateButton(btn: ButtonStyleValues): AppearanceErrors["notify_me"] {
  const errors: Partial<Record<keyof ButtonStyleValues, FieldError>> = {};

  if (btn.fontSize < 12 || btn.fontSize > 30) {
    errors.fontSize = "Font size must be between 12 and 30";
  }

  if (btn.padding < 0 || btn.padding > 40) {
    errors.padding = "Padding must be between 0 and 40";
  }

  if (btn.borderCorner < 0 || btn.borderCorner > 20) {
    errors.borderCorner = "Border radius must be between 0 and 20";
  }

  return Object.keys(errors).length ? errors : undefined;
}

function validateDynamicFields(
  fields: DynamicFieldConfig[],
): DynamicFieldErrors | undefined {
  const errors: DynamicFieldErrors = {};

  for (const field of fields) {
    const fieldErrors: DynamicFieldErrors["x"] = {};

    // Base validation (all fields)
    if (!field.label.trim()) {
      fieldErrors.label = "Label is required";
    }

    // Type-specific validation
    switch (field.type) {
      case "text":
      case "textarea":
        if (field.required && !field.placeholder.trim()) {
          fieldErrors.placeholder = "Placeholder is required";
        }
        break;

      case "select":
      case "checkbox":
      case "radio":
        if (!field.options.trim()) {
          fieldErrors.options = "At least one option is required";
        }
        break;

      case "terms":
        if (!field.value.trim()) {
          fieldErrors.value = "Terms text cannot be empty";
        }
        break;
    }

    // Attach only if errors exist
    if (Object.keys(fieldErrors).length > 0) {
      errors[field.id] = fieldErrors;
    }
  }

  return Object.keys(errors).length ? errors : undefined;
}

function Appearance() {
  const {
    values,
    savedData,
    setValues,
    markSaved,
    discardChanges,
    dirtyFields,
    setField,
    isDirty,
  } = useDirtyForm<AppearanceForm>(appearanceForm);
  const appearanceFormKeys = Object.fromEntries(
    Object.keys(appearanceForm).map((key) => [key, key.toString()]),
  ) as Record<keyof AppearanceForm, keyof AppearanceForm>;

  const { errors, isValid } = useAppearanceValidation(values);

  const expandableMenus = [
    {
      label: "Show on Product Detail page",
      value: "product_detail",
      contents: (
        <ChoiceList
          Choices={displayOptions}
          name={appearanceFormKeys?.product_detail_show}
          selected={values?.product_detail_show ?? displayOptions[0].value}
          onChange={setField}
          error={errors?.product_detail}
        />
      ),
    },
    {
      label: "Notify Me Button",
      value: "notify_me",
      contents: (
        <ButtonSettings
          name={appearanceFormKeys?.notify_me}
          value={values.notify_me}
          onChange={(field, value) =>
            setField(appearanceFormKeys?.notify_me, {
              ...values.notify_me,
              [field]: value,
            })
          }
          error={errors?.notify_me || {}}
        />
      ),
    },
    {
      label: "Subscribe button",
      value: "subscribe",
      contents: (
        <ButtonSettings
          name={appearanceFormKeys?.subscribe}
          value={values?.subscribe}
          onChange={(field, value) =>
            setField(appearanceFormKeys?.subscribe, {
              ...values?.subscribe,
              [field]: value,
            })
          }
          error={errors?.subscribe || {}}
        />
      ),
    },
    {
      label: "Fields setting",
      value: "fields",
      contents: (
        <FieldCard
          fields={values?.fields}
          onChange={(next) => setField(appearanceFormKeys?.fields, next)}
          errors={errors?.fields || {}}
        />
      ),
    },
    {
      label: "Footer",
      value: "footer",
      contents: (
        <Footer
          name={appearanceFormKeys?.footer}
          value={values?.footer}
          onChange={setField}
          error={errors?.footer}
        />
      ),
    },
  ];
  const [currentlyOpen, setCurrentlyOpen] = useState<string>(
    expandableMenus[0].value,
  );

  useEffect(() => {
    if (isDirty) {
      shopify.saveBar.show("my-save-bar");
    } else {
      shopify.saveBar.hide("my-save-bar");
    }
  }, [isDirty]);

  const handleSave = () => {
    if (!isValid) return;
    markSaved();
  };

  console.log(errors);

  return (
    <>
      <s-stack gap="base">
        <s-banner id="info-banner" tone="info" dismissible={true}>
          Would you like to customize the button and form more, like changing
          the font, color, and background? Chat with us &nbsp;
          <s-link href="#" target="_blank">
            here
          </s-link>
        </s-banner>

        <s-query-container>
          <s-grid
            gridTemplateColumns="@container (inline-size < 400px) 1fr, 2fr 1fr"
            gap="base"
          >
            <s-box>
              <s-section>
                <s-stack gap="base">
                  <h2>Appearance {isDirty && <span>Dirty</span>}</h2>
                  <s-section>
                    <s-stack gap="base">
                      {expandableMenus.map((menu, idx) => (
                        <Fragment key={menu.label}>
                          <s-box>
                            <Expandable
                              label={menu.label}
                              Details={
                                <AppearanceExpandsDetails
                                  onOpen={() =>
                                    setCurrentlyOpen((prev) =>
                                      prev !== menu.value ? menu.value : "",
                                    )
                                  }
                                  label={menu.label}
                                  isExpanded={currentlyOpen === menu.value}
                                />
                              }
                              isExpanded={currentlyOpen === menu.value}
                              Contents={menu.contents}
                              onOpen={() =>
                                setCurrentlyOpen((prev) =>
                                  prev !== menu.value ? menu.value : "",
                                )
                              }
                            />
                          </s-box>
                          {idx !== expandableMenus.length - 1 && <s-divider />}
                        </Fragment>
                      ))}
                    </s-stack>
                  </s-section>
                </s-stack>
              </s-section>
            </s-box>

            <s-box>
              <ProductPreview formData={values} />
            </s-box>
          </s-grid>
        </s-query-container>

        <div id="portals">
          <ui-save-bar id="my-save-bar">
            <button onClick={discardChanges}>Discard</button>
            <button variant="primary" onClick={handleSave}>
              Save
            </button>
          </ui-save-bar>
        </div>
      </s-stack>
    </>
  );
}

function AppearanceExpandsDetails({
  onOpen,
  label,
  isExpanded,
}: {
  onOpen: (l: string) => void;
  label: string;
  isExpanded: boolean;
}) {
  return (
    <s-grid gridTemplateColumns="1fr auto" justifyContent="space-between">
      <s-clickable
        onClick={() => {
          if (onOpen) onOpen(label);
        }}
      >
        <s-stack
          direction="inline"
          gap="small"
          justifyContent="space-between"
          alignItems="center"
        >
          <s-text>{label}</s-text>
          <s-button
            variant="tertiary"
            icon={isExpanded ? "chevron-up" : "chevron-down"}
          ></s-button>
        </s-stack>
      </s-clickable>
    </s-grid>
  );
}

interface ChoiceListProps {
  Choices: {
    label: string;
    value: string;
  }[];
  name: string;
  label?: string;
  selected: string | null;
  onChange: <K extends keyof AppearanceForm>(
    key: K,
    value: AppearanceForm[K],
  ) => void;
  error: AppearanceErrors["product_detail"];
}

export function ChoiceList({
  Choices,
  name,
  label = "exclusive",
  selected,
  onChange,
  error,
}: ChoiceListProps) {
  const handleChange = (event: CallbackEvent<"s-choice-list">) => {
    onChange(name as keyof AppearanceForm, event.currentTarget?.values[0]);
    console.log("Values: ", event.currentTarget.values);
  };

  console.log("Re renders");

  return (
    <s-choice-list
      label="Company name"
      labelAccessibilityVisibility={
        label === "exclusive" ? "exclusive" : "visible"
      }
      name={name}
      onChange={handleChange}
      error={error}
    >
      {Choices.map((choice) => (
        <s-choice
          value={choice.value}
          key={choice.label}
          selected={selected === choice.value}
          // defaultSelected={selected === choice.value}
        >
          {choice.label}
        </s-choice>
      ))}
    </s-choice-list>
  );
}

interface ButtonSettingsProps {
  name: string;
  value: ButtonStyleValues;
  onChange: (field: keyof ButtonStyleValues, value: string | number) => void;
  error: Partial<Record<keyof ButtonStyleValues, FieldError>>;
}

export function ButtonSettings({
  name,
  value,
  onChange,
  error,
}: ButtonSettingsProps) {
  const handleChange = (field: keyof ButtonStyleValues, v: string | number) => {
    onChange(field, v);
  };

  return (
    <ButtonStyleEditor
      name={name}
      label="Customize the 'Email when available' button"
      value={value}
      onChange={handleChange}
      error={error}
    />
  );
}

export function Footer({
  name,
  value,
  onChange,
  error,
}: {
  name: keyof AppearanceForm;
  value: string;
  onChange: (field: keyof AppearanceForm, value: string) => void;
  error: AppearanceErrors["footer"];
}) {
  return (
    <s-text-area
      label="Footer"
      labelAccessibilityVisibility="exclusive"
      name={name}
      value={value}
      onInput={(e) => onChange(name, e.currentTarget?.value)}
      error={error}
    />
  );
}
