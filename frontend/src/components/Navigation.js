import React from "react"
import { AppBar, Toolbar, Typography, Button } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"

function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ShiftWise.AI
        </Typography>
        <Button color="inherit" component={RouterLink} to="/upload">
          Upload
        </Button>
        <Button color="inherit" component={RouterLink} to="/test">
          API Test
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
