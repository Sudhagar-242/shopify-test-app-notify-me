export interface DemandProduct {
  id: string;
  title: string;
  count?: string | number;
  imageUrl?: string;
  date?: Date;
}

export interface ProductsInDemandTabs {
  label: string;
  value: string;
  onChange?: (products: DemandProduct[]) => DemandProduct[] | undefined;
}

export interface ProductsInDemandComponentProps {
  products: DemandProduct[];
  //   activeTab: string;
  //   onTabChange: (tabValue: string) => void;
  //   tabs: ProductsInDemandTabs[];
}
