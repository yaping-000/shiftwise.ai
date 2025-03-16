import React, { useEffect, useCallback } from "react"
import { Link as RouterLink } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { InteractionStatus } from "@azure/msal-browser"
import { loginRequest } from "../auth/authConfig"

function Navigation() {
  const { instance, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    // Debug logging
    console.log("Auth Status:", {
      isAuthenticated,
      inProgress,
      accounts: instance.getAllAccounts(),
    })
  }, [isAuthenticated, inProgress, instance])

  const handleLogin = useCallback(async () => {
    try {
      console.log("Initiating login...")
      const response = await instance.loginRedirect({
        ...loginRequest,
        prompt: "select_account",
      })
      console.log("Login response:", response)
    } catch (error) {
      console.error("Login error:", {
        name: error.name,
        message: error.message,
        errorCode: error.errorCode,
        stack: error.stack,
      })
    }
  }, [instance])

  const handleLogout = useCallback(async () => {
    try {
      console.log("Initiating logout...")
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [instance])

  // Don't show login/logout buttons while authentication is in progress
  const showAuthButton = inProgress === InteractionStatus.None

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
          {showAuthButton &&
            (isAuthenticated ? (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button color="inherit" onClick={handleLogin}>
                Login
              </Button>
            ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
