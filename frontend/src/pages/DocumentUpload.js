import React, { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { protectedResources } from "../auth/authConfig"

function DocumentUpload() {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!file || !title) return

    try {
      setUploading(true)

      const token = await instance.acquireTokenSilent({
        scopes: protectedResources.api.scopes,
        account: accounts[0],
      })

      const formData = new FormData()
      formData.append("title", title)
      formData.append("file", file)

      await axios.post(
        `${protectedResources.api.endpoint}/api/documents/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      navigate("/")
    } catch (error) {
      console.error("Error uploading document:", error)
    } finally {
      setUploading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Please login to upload documents
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 4 }}>
        Upload Document
      </Typography>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          variant="outlined"
        />

        <Box
          {...getRootProps()}
          sx={{
            mt: 2,
            p: 3,
            border: "2px dashed #ccc",
            borderRadius: 1,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography>Drop the file here...</Typography>
          ) : (
            <Typography>
              Drag and drop a file here, or click to select a file
            </Typography>
          )}
          {file && (
            <Typography variant="body2" sx={{ mt: 1, color: "success.main" }}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || !title || uploading}
          >
            {uploading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Uploading...
              </>
            ) : (
              "Upload Document"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default DocumentUpload
