import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { MsalProvider } from "@azure/msal-react"
import { PublicClientApplication } from "@azure/msal-browser"
import Navigation from "./components/Navigation"
import Dashboard from "./pages/Dashboard"
import DocumentUpload from "./pages/DocumentUpload"
import Analysis from "./pages/Analysis"
import { msalConfig } from "./auth/authConfig"

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

// Create theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
})

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/analysis/:id" element={<Analysis />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </MsalProvider>
  )
}

export default App
