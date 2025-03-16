export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
}

export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "email",
    "User.Read",
    `api://${process.env.REACT_APP_AZURE_AD_CLIENT_ID}/access_as_user`,
  ],
}

export const protectedResources = {
  api: {
    endpoint: process.env.REACT_APP_API_URL,
    scopes: [
      `api://${process.env.REACT_APP_AZURE_AD_CLIENT_ID}/access_as_user`,
    ],
  },
}
