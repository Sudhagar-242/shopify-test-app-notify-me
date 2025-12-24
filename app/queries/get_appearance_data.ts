export const GET_APPEARANCE_FORM = `query appearanceForm {
    shop {
      appearance: metafield(namespace: "zuper_notify_me", key: "appearance") {
        id
        value
        type
      }
     }
    }
  `;
