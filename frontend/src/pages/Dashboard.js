import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material"
import { Line } from "react-chartjs-2"
import axios from "axios"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { protectedResources } from "../auth/authConfig"

function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [roiData, setRoiData] = useState(null)
  const navigate = useNavigate()
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments()
      fetchROIAnalytics()
    }
  }, [fetchDocuments, fetchROIAnalytics])

  const fetchDocuments = async () => {
    try {
      const token = await instance.acquireTokenSilent({
        scopes: protectedResources.api.scopes,
        account: accounts[0],
      })

      const response = await axios.get(
        `${protectedResources.api.endpoint}/api/documents/`,
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        }
      )
      setDocuments(response.data.results)
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

  const fetchROIAnalytics = async () => {
    try {
      const token = await instance.acquireTokenSilent({
        scopes: protectedResources.api.scopes,
        account: accounts[0],
      })

      const response = await axios.get(
        `${protectedResources.api.endpoint}/api/analyses/`,
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        }
      )

      // Process ROI data for chart
      const chartData = {
        labels: response.data.results.map((analysis) =>
          new Date(analysis.analysis_date).toLocaleDateString()
        ),
        datasets: [
          {
            label: "ROI Score",
            data: response.data.results.map((analysis) => analysis.score),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      }
      setRoiData(chartData)
    } catch (error) {
      console.error("Error fetching ROI analytics:", error)
    }
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Please login to view your dashboard
        </Typography>
      </Container>
    )
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Dashboard
      </Typography>

      {roiData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ROI Analysis Trends
            </Typography>
            <Line data={roiData} />
          </CardContent>
        </Card>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        Recent Documents
      </Typography>

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {doc.title}
                </Typography>
                <Typography color="textSecondary">
                  Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                </Typography>
                <Typography color="textSecondary">
                  Status:{" "}
                  {doc.analysis_complete ? "Analysis Complete" : "Processing"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/analysis/${doc.id}`)}
                >
                  View Analysis
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Dashboard
