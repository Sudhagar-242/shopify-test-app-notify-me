export interface ActivityItem {
  id?: string;
  title?: string;
  imageUrl?: string;
  storeUrl?: string;
  product_id: string;
  variant_id: string;
  email?: string | null;
  number?: string | null;
  created_at: string;
  is_sent: boolean;
}

export interface AnalyticsProductsInDemand {
  id?: string;
  title?: string;
  imageUrl?: string;
  storeUrl?: string;
  product_id: string;
  is_sent: boolean;
  product_count: string;
  latest_created_at: string;
}
