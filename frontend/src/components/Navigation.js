import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { loginRequest } from "../auth/authConfig"

function Navigation() {
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((error) => console.log(error))
  }

  const handleLogout = () => {
    instance.logoutRedirect().catch((error) => console.log(error))
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
