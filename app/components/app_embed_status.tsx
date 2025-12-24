import { CallbackEvent } from "@shopify/polaris-types";
import { useShopifyService } from "app/context/shopify_shop_context";
import {
  AppEmbedComponentProps,
  ThmemeSelectionType,
} from "app/types/components/theme_embed_status";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

export default function RenderAppEmbedComponent({
  apiKey,
  blockName,
  currentTheme,
  themes,
}: AppEmbedComponentProps) {
  const [selectedTheme, setSelectedTheme] =
    useState<ThmemeSelectionType>(currentTheme);

  const fetcher = useFetcher<{ isEnabled?: boolean; error?: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [sendData, setSendData] = useState<boolean>(false);
  const Service = useShopifyService();

  // Get status from fetcher response
  const isActive = fetcher.data?.isEnabled ?? false;
  const error = fetcher.data?.error ?? null;

  useEffect(() => {
    // Fetch theme status when component mounts or theme changes
    fetcher.submit(
      { themeId: selectedTheme.id, blockName },
      { method: "POST", encType: "application/json" },
    );
  }, [selectedTheme.id, blockName, sendData]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        return setSendData(true);
      }
      return setSendData(false);
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    // Stop loading when data is received
    if (fetcher.data) {
      setLoading(false);
    }
  }, [fetcher.data]);

  return (
    <s-section id="app-embed-section">
      <s-stack gap="base">
        <s-stack
          id="app-embed-header"
          direction="inline"
          gap="base"
          alignItems="center"
        >
          <s-heading id="app-embed-heading">App embed</s-heading>
          {loading || fetcher.state === "submitting" ? (
            <s-spinner accessibilityLabel="Loading Theme Status" size="base" />
          ) : (
            <s-badge
              id="app-embed-status-badge"
              tone={error ? "critical" : isActive ? "success" : "caution"}
            >
              {error ? "Error" : isActive ? "Active" : "Disabled"}
            </s-badge>
          )}
        </s-stack>
        <s-stack id="app-embed-content" gap="base" direction="block">
          <s-select
            id="app-embed-theme-select"
            label="Theme"
            value={selectedTheme.value}
            onInput={(e: CallbackEvent<"s-select">) => {
              const selectedValue: string = e.currentTarget.value;
              const selectedTheme: ThmemeSelectionType | undefined =
                themes.find((t) => t.value === selectedValue);
              if (selectedTheme) {
                setSelectedTheme(selectedTheme);
                setLoading(true);
              }
            }}
          >
            {themes.map((theme) => (
              <s-option
                key={theme.value}
                id={`theme-option-${theme.value}`}
                value={String(theme.value)}
              >
                {theme.name}
              </s-option>
            ))}
          </s-select>

          {error && (
            <s-banner tone="critical" id="app-embed-error-banner">
              <s-text>{error}</s-text>
            </s-banner>
          )}

          <s-text id="app-embed-helper-text" color="subdued">
            Enable app embed in theme settings to work on your online store.
          </s-text>
          <s-button
            id="app-embed-settings-button"
            icon="external"
            variant="secondary"
            href={Service.gotoThemeAppExtension(
              selectedTheme.id,
              blockName,
              apiKey,
            )}
            target="_blank"
          >
            Go to Theme Settings &gt; App Embeds
          </s-button>
        </s-stack>
      </s-stack>
    </s-section>
  );
}
