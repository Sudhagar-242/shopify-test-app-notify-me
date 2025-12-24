const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f6f6f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  container: {
    display: "flex",
    alignItems: "center",
    gap: "48px",
    padding: "40px",
    maxWidth: "900px",
  },

  card: {
    display: "flex",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },

  leftBar: {
    width: "48px",
    backgroundColor: "#007f5f", // Shopify green
  },

  cardContent: {
    width: "220px",
    height: "160px",
    backgroundColor: "#f1f2f3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },

  topLine: {
    width: "56px",
    height: "8px",
    backgroundColor: "#c9cccf",
    borderRadius: "4px",
  },

  code: {
    fontSize: "56px",
    fontWeight: 600,
    color: "#9aa0a6",
    lineHeight: 1,
  },

  textContainer: {
    maxWidth: "420px",
  },

  heading: {
    margin: "0 0 12px",
    fontSize: "28px",
    fontWeight: 600,
    color: "#202223",
  },

  paragraph: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#6d7175",
  },
};

export function Error404Page() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <img
          src="https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/error-404-IFvpO0lLftqG.svg"
          alt="Simplified illustration of the Shopify admin with a 404."
        ></img>

        {/* Text */}
        <div style={styles.textContainer}>
          <h1 style={styles.heading}>There&apos;s no page at this address</h1>
          <p style={styles.paragraph}>
            Check the URL and try again, or use the search bar to find what you
            need.
          </p>
        </div>
      </div>
    </div>
  );
}
