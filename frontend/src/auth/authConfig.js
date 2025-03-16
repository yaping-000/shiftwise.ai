export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    navigateToLoginRequestUrl: true,
    validateAuthority: true,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case 0:
            console.error(message)
            return
          case 1:
            console.warn(message)
            return
          case 2:
            console.info(message)
            return
          case 3:
            console.debug(message)
            return
          default:
            console.log(message)
            return
        }
      },
      piiLoggingEnabled: false,
    },
  },
}

export const loginRequest = {
  scopes: ["User.Read"],
}

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
}

export const protectedResources = {
  api: {
    endpoint: process.env.REACT_APP_API_URL,
    scopes: ["User.Read"],
  },
}
