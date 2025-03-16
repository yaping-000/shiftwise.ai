import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "./theme"
import Navigation from "./components/Navigation"
import Upload from "./components/Upload"
import ApiTest from "./components/ApiTest"

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Routes>
          <Route path="/upload" element={<Upload />} />
          <Route path="/test" element={<ApiTest />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
