import React, { useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { loginRequest } from "../auth/authConfig"

function Navigation() {
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    // Debug logging
    console.log("Auth Status:", { isAuthenticated })
    console.log("MSAL Instance:", instance)
    console.log("Environment Variables:", {
      clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID,
      tenantId: process.env.REACT_APP_AZURE_AD_TENANT_ID,
      redirectUri: process.env.REACT_APP_REDIRECT_URI,
    })
  }, [isAuthenticated, instance])

  const handleLogin = async () => {
    try {
      console.log("Initiating login...")
      await instance.loginRedirect(loginRequest)
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  const handleLogout = async () => {
    try {
      console.log("Initiating logout...")
      await instance.logoutRedirect()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ShiftWise.AI
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/upload">
            Upload
          </Button>
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
