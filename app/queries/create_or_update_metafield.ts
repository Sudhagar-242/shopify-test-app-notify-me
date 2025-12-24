export const CREATE_OR_UPDATE_METAFIELD = `
mutation SetGoalDiscounts($ownerId: ID!,$key: String!,$namespace: String!, $value: String!, $type: String!) {
    metafieldsSet(
      metafields: [
        {
          ownerId: $ownerId,
          namespace: $namespace,
          key: $key,
          type: $type,
          value: $value
        }
      ]
    ) {
      metafields { id namespace key value }
      userErrors { code field message }
    }
  }
`;
