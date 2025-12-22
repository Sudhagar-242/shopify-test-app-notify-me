export interface Subscriber {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  store_id: string;
  store_domain: string;
  email: string | null;
  country: string | null;
  country_code: string | null;
  number: string | null;
  product_id: string;
  variant_id: string;
  is_sent: boolean;
  is_error: boolean;
  error_message: string;
  product_title: string | null;
  variant_title: string | null;
  sku: string | null;
}

export interface GetSubscriberResponse {
  data: Subscriber[];
  pagination: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    skip: number;
  };
}
