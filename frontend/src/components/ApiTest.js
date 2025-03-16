import React, { useState } from "react"
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material"

function ApiTest() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Make the API call without authentication
      const response = await fetch(
        `/api/test`, // Use relative URL since routing is handled by Static Web App
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.detail || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      setResponse(data)
      console.log("API Response:", data)
    } catch (err) {
      console.error("API Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          API Connection Test
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Test Message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Sending..." : "Send Test Request"}
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Response:</Typography>
            <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ApiTest
