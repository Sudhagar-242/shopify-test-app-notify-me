export interface ThmemeSelectionType {
  id: string;
  name: string;
  role: "MAIN" | "UNPUBLISHED" | "DEMO";
  value: string;
}

// Reusable App Embed component
export interface AppEmbedComponentProps {
  apiKey: string;
  blockName: string;
  currentTheme: ThmemeSelectionType;
  themes: ThmemeSelectionType[];
}
