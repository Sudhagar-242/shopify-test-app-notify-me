import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useNavigation, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";




export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // const loading = useAppBridge().loading;

  // useEffect(() => {
  //   if (navigation.state === "loading" || navigation.state === "submitting") {
  //     loading(true);
  //   } else {
  //     loading(false);
  //   }
  // }, [loading, navigation.state]);

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        <s-link href="/app/additional">Requests</s-link>
        <s-link href="/app/additional">Subscriber</s-link>
        <s-link href="/app/additional">Settings</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
