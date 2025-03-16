import axios from "axios"
import { PublicClientApplication } from "@azure/msal-browser"
import { msalConfig, loginRequest } from "../auth/authConfig"

const msalInstance = new PublicClientApplication(msalConfig)

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for handling authentication cookies
})

// Add a request interceptor for authentication
api.interceptors.request.use(async (config) => {
  // Get the token from MSAL
  try {
    const token = await getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.error("Error getting auth token:", error)
  }
  return config
})

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      msalInstance.loginRedirect(loginRequest).catch(console.error)
    }
    return Promise.reject(error)
  }
)

// Helper function to get auth token
async function getAuthToken() {
  try {
    const currentAccounts = msalInstance.getAllAccounts()
    if (currentAccounts.length === 0) {
      return null
    }

    const request = {
      ...loginRequest,
      account: currentAccounts[0],
    }

    const response = await msalInstance.acquireTokenSilent(request)
    return response.accessToken
  } catch (error) {
    if (error.name === "InteractionRequiredAuthError") {
      return msalInstance.acquireTokenRedirect(loginRequest)
    }
    throw error
  }
}

export default api
