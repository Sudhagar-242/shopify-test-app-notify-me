import { defaultImage } from "app/constants/constants";
import { useShopifyService } from "app/context/shopify_shop_context";
import { ActivityItem } from "app/types/analytics";

function RecentActivity({
  recentActivity,
}: {
  recentActivity: ActivityItem[];
}) {
  const Service = useShopifyService();
  return (
    <s-section id="activity-section">
      <s-heading id="activity-heading">
        {recentActivity && recentActivity.length > 0
          ? "Recent Activity"
          : "No Recent Activity"}
      </s-heading>
      <s-stack id="activity-cards" gap="base" direction="block">
        {recentActivity &&
          recentActivity.length > 0 &&
          recentActivity.map((activity: ActivityItem, index: number) => (
            <s-clickable
              id={`activity-card-${index}`}
              key={index}
              padding="base"
              border="base"
              borderRadius="base"
              href={Service.gotoProductsLink(
                activity.product_id ?? activity.id,
              )}
            >
              <s-grid
                id={`card-grid-${index}`}
                gridTemplateColumns="60px 1fr"
                gap="base"
                alignItems="center"
              >
                <s-grid-item id={`image-item-${index}`}>
                  <s-image
                    id={`image-${index}`}
                    src={activity.imageUrl || defaultImage}
                    alt={activity.title || "Product image"}
                    aspectRatio="1/1"
                    objectFit="cover"
                    borderRadius="base"
                  />
                </s-grid-item>
                <s-grid-item id={`details-item-${index}`}>
                  <s-stack direction="block" gap="small-300">
                    <s-text id={`title-${index}`}>
                      {activity.title || "Unknown Product"}
                    </s-text>
                    {activity.email && (
                      <s-text id={`email-${index}`} color="subdued">
                        {activity.email}
                      </s-text>
                    )}
                    {activity.number && (
                      <s-text id={`number-${index}`} color="subdued">
                        {activity.number}
                      </s-text>
                    )}
                    <s-badge
                      id={`status-badge-${index}`}
                      tone={activity.is_sent === true ? "success" : "caution"}
                    >
                      {activity.is_sent === true ? "Sent" : "Not Sent"}
                    </s-badge>
                  </s-stack>
                </s-grid-item>
              </s-grid>
            </s-clickable>
          ))}
      </s-stack>
    </s-section>
  );
}

export default RecentActivity;
