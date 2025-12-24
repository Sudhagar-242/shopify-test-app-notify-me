import { AppearanceForm } from "app/routes/app.requests._index";

export interface AppearanceFormGQLRes {
  shop: {
    appearance: {
      id: string;
      value: AppearanceForm;
      type: "json";
    };
  };
}
