export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
    authority: `https://${process.env.REACT_APP_AZURE_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_AZURE_TENANT_ID}`,
    knownAuthorities: [
      `${process.env.REACT_APP_AZURE_TENANT_NAME}.b2clogin.com`,
    ],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
}

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
}

export const protectedResources = {
  api: {
    endpoint: process.env.REACT_APP_API_URL,
    scopes: [`${process.env.REACT_APP_AZURE_CLIENT_ID}/api.access`],
  },
}
