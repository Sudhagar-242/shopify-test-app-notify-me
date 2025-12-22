export interface ProductRow {
  id: string;
  product_id: string;
  variant_id: string;
  name: string;
  imageUrl: string;
  variant: string;
  sku: string;
  availableQuantity: number;
  subscribers: number;
  lastAdded: string;
}

export interface ProductTableRes {
  data: ProductRow[];
  pagination: {
    currentPage: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
