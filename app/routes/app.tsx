import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import {
  Outlet,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { apiVersion, authenticate } from "../shopify.server";
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { ServiceProvider } from "app/context/shopify_shop_context";
import prisma from "app/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Get store data from database
  const store = await prisma.shop.findUnique({
    where: { shop: session?.shop },
  });

  // eslint-disable-next-line no-undef
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    admin,
    session,
    apiVersion: apiVersion,
    store,
  };
};

export default function App() {
  const { apiKey, admin, session, apiVersion, store } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    if (navigation.state === "loading" || navigation.state === "submitting") {
      shopify.loading(true);
    } else {
      shopify.loading(false);
    }
  }, [shopify, navigation.state]);

  return (
    <AppProvider embedded apiKey={apiKey}>
      <ServiceProvider
        admin={admin}
        session={session}
        apiVersion={apiVersion}
        store={store}
      >
        <s-app-nav>
          <s-link href="/app" rel="home">
            Home
          </s-link>
          <s-link href="/app/requests">Requests</s-link>
          <s-link href="/app/additional">Subscriber</s-link>
          <s-link href="/app/additional/222">Settings</s-link>
        </s-app-nav>
        <Outlet />
        {isLoading && (
          <div className="loader-overlay">
            <s-spinner accessibilityLabel="Loading" size="large-100" />
          </div>
        )}
      </ServiceProvider>
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
