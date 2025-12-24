# Using ServiceProvider Context

## Overview

The `ServiceProvider` context gives you access to the Shopify Admin API in your React components without having to pass it as props. It's set up in the root layout (`app.tsx`) and accessible via the `useShopifyService()` hook.

## Setup (Already Done)

In [app.tsx](app.tsx), the ServiceProvider is now wrapping your entire app:

```tsx
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const adminData = await authenticate.admin(request);
  const store = await prisma.shop.findUnique({
    where: { shop: adminData.session?.shop },
  });

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    admin: adminData.admin,
    session: adminData.session,
    apiVersion: adminData.apiVersion,
    store,
  };
};

export default function App() {
  const { apiKey, admin, session, apiVersion, store } =
    useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <ServiceProvider
        admin={admin}
        session={session}
        apiVersion={apiVersion}
        store={store}
      >
        {/* All child components can now access the service */}
        <Outlet />
      </ServiceProvider>
    </AppProvider>
  );
}
```

## How to Use in Components

### Hook 1: `useShopifyService()` - Access the Shopify API Service

This gives you access to all your custom API methods:

```tsx
import { useShopifyService } from "app/context/shopify_shop_context";

export default function MyComponent() {
  const shopifyService = useShopifyService();

  useEffect(() => {
    // Call any method from your shopifyService
    const fetchData = async () => {
      const products = await shopifyService.getProducts();
      setProducts(products);
    };

    fetchData();
  }, [shopifyService]);

  return <div>{/* render products */}</div>;
}
```

### Hook 2: `useShopifyContext()` - Access Raw Admin Data

If you need the raw admin context, session, or store:

```tsx
import { useShopifyContext } from "app/context/shopify_shop_context";

export default function MyComponent() {
  const { admin, session, store } = useShopifyContext();

  // Use admin to make GraphQL calls directly if needed
  const makeCustomCall = async () => {
    const response = await admin.graphql(`
      query {
        products(first: 10) {
          edges {
            node { id title }
          }
        }
      }
    `);
    return response.json();
  };

  return <div>{/* use makeCustomCall */}</div>;
}
```

## Example Usage Patterns

### Pattern 1: Fetch on Component Mount

```tsx
export default function ProductList() {
  const shopifyService = useShopifyService();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await shopifyService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Only run once on mount

  if (loading) return <s-spinner />;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
```

### Pattern 2: Event Handler with Service

```tsx
export default function CreateNotification() {
  const shopifyService = useShopifyService();

  const handleCreateNotification = async (productId: string) => {
    try {
      const result = await shopifyService.createNotification(productId);
      showToast("Notification created!");
    } catch (error) {
      showToast("Error creating notification");
    }
  };

  return (
    <s-button onClick={() => handleCreateNotification("product-1")}>
      Notify Me
    </s-button>
  );
}
```

### Pattern 3: Multiple Service Calls

```tsx
export default function Dashboard() {
  const shopifyService = useShopifyService();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const [products, notifications, store] = await Promise.all([
        shopifyService.getProducts(),
        shopifyService.getNotifications(),
        shopifyService.getStoreInfo(),
      ]);

      setStats({ products, notifications, store });
    };

    loadDashboard();
  }, [shopifyService]);

  return <div>{/* render stats */}</div>;
}
```

## Key Points

1. **ServiceProvider must wrap components** - Only components inside `<ServiceProvider>` can use the hooks
2. **Server vs Client** - Data flows from server loader → context → client components
3. **No prop drilling** - No need to pass `admin` through multiple component levels
4. **Type-safe** - Use `useShopifyService()` for your custom typed service methods
5. **Error handling** - Always wrap service calls in try/catch

## What NOT to Do

❌ DON'T use the service in loaders (use direct admin calls instead):

```tsx
// BAD - loaders can't use hooks
export const loader = async ({ request }) => {
  const service = useShopifyService(); // ❌ Can't do this in loaders
};
```

✅ DO pass data from loader to context:

```tsx
// GOOD - loader gets data, context provides it to components
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  return { admin }; // Pass to ServiceProvider in parent route
};
```

## Migration Checklist

If you're updating existing components to use the context:

- [ ] Remove `admin` from component props
- [ ] Remove `useShopifyService` imports and replace with `useShopifyService()` hook
- [ ] Update service calls from `shopifyService(admin, session...)` to `shopifyService` hook
- [ ] Remove destructuring of admin/session from loaders if no longer needed
- [ ] Test component loads data correctly on mount
- [ ] Verify error handling works

## Troubleshooting

**Error: "useShopifyService must be used within ServiceProvider"**

- Solution: Make sure component is rendered inside `<ServiceProvider>` (in a child route of app.tsx)

**Service methods are undefined**

- Solution: Check that your [shopify_services.ts](app/services/shopify_services.ts) exports all expected methods

**Data not updating**

- Solution: Add the service to your useEffect dependency array, or use a useCallback wrapper
