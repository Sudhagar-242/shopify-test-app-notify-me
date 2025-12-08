import { LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { json } from "stream/consumers";

// In a real app, you would fetch data from your database or the Shopify API.
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;

  console.log(id);
  const item = {
    id,
    title: `Item ${id}`,
    description: `This is the detailed description for item ${id}. It is fetched from the server.`,
    createdAt: new Date().toISOString(),
  };

  // If the item doesn't exist, you might want to throw a 404 response
  if (!item) {
    throw new Response("Not Found", { status: 404 });
  }

  return { item };
};

const AdditionalRoute = () => {
  const { item } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // The backAction needs to be handled via an attribute and an event listener
  // when using web components. We can attach it via a ref.
  const handleBackAction = (event: any) => {
    if (event.target.tagName === "S-PAGE") {
      navigate("/app/additional");
    }
  };

  return (
    <s-page
      heading={`Viewing ${item.title}`}
      back-action='{"content": "Additional Items"}'
    >
      <s-section>
        <s-box>
          <s-heading>{item.title}</s-heading>
          <s-paragraph>{item.description}</s-paragraph>
          <s-paragraph>
            <s-text color="subdued">
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </s-text>
          </s-paragraph>
        </s-box>
      </s-section>
    </s-page>
  );
};

export default AdditionalRoute;
