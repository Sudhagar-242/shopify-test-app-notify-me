import {
  AdminApiContext,
  Session,
  ApiVersion,
} from "@shopify/shopify-app-react-router/server";
import shopifyService, { Store } from "app/services/shopify_services";
import React, { createContext, useContext } from "react";

// interface ServiceContextType {
//   admin: AdminApiContext;
//   session: Session;
//   apiVersion: ApiVersion;
//   store: Store | null;
// }

interface ServiceContextType {
  admin: AdminApiContext;
  session: Session;
  apiVersion: ApiVersion;
  store: Store | null;
  service: ReturnType<typeof shopifyService>;
}

const ServiceContext = createContext<ServiceContextType | null>(null);

export const ServiceProvider: React.FC<{
  children: React.ReactNode;
  admin: AdminApiContext;
  session: Session;
  apiVersion: ApiVersion;
  store: Store | null;
}> = ({ children, admin, session, apiVersion, store }) => {
  const service = React.useMemo(
    () => shopifyService(admin, session, apiVersion, store),
    [admin, session, apiVersion, store], // re-init only if these change
  );

  const value: ServiceContextType = {
    admin,
    session,
    apiVersion,
    store,
    service,
  };

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
};

export const useShopifyService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useShopifyService must be used within ServiceProvider");
  }

  return context.service;
};

export const useShopifyContext = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useShopifyContext must be used within ServiceProvider");
  }
  return context;
};
