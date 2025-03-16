import React, { useState } from "react"
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"

function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    setFile(selectedFile)
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", file.name)

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/documents/`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.detail || `Upload failed: ${response.status}`
        )
      }

      setSuccess(true)
      setFile(null)
      // Reset the file input
      event.target.reset()
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Document
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "grey.300",
              borderRadius: 1,
              p: 3,
              mb: 2,
              textAlign: "center",
            }}
          >
            <input
              accept="application/pdf"
              style={{ display: "none" }}
              id="file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                Select File
              </Button>
            </label>
            {file && (
              <Typography sx={{ mt: 2 }}>Selected: {file.name}</Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!file || loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Upload"
            )}
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            File uploaded successfully!
          </Alert>
        )}
      </Paper>
    </Box>
  )
}

export default Upload
