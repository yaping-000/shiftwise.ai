import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material"
import { Line, Radar } from "react-chartjs-2"
import axios from "axios"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { protectedResources } from "../auth/authConfig"

function Analysis() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const fetchAnalysis = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const token = await instance.acquireTokenSilent({
        scopes: protectedResources.api.scopes,
        account: accounts[0],
      })

      const response = await axios.get(
        `${protectedResources.api.endpoint}/api/documents/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        }
      )
      setDocument(response.data)
    } catch (error) {
      console.error("Error fetching analysis:", error)
    } finally {
      setLoading(false)
    }
  }, [id, instance, accounts, isAuthenticated])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  if (!isAuthenticated) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Please login to view analysis
        </Typography>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!document) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Document not found
        </Typography>
      </Container>
    )
  }

  const roiScoreData = {
    labels: document.roi_analyses.map((analysis) =>
      new Date(analysis.analysis_date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "ROI Score History",
        data: document.roi_analyses.map((analysis) => analysis.score),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  const radarData = {
    labels: [
      "Cost Savings",
      "Revenue Impact",
      "Risk Reduction",
      "Time Savings",
      "Quality Improvement",
    ],
    datasets: [
      {
        label: "Impact Analysis",
        data: [
          document.analysis_result?.cost_savings || 0,
          document.analysis_result?.revenue_impact || 0,
          document.analysis_result?.risk_reduction || 0,
          document.analysis_result?.time_savings || 0,
          document.analysis_result?.quality_improvement || 0,
        ],
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(75, 192, 192)",
      },
    ],
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 4 }}>
        Analysis: {document.title}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ROI Score History
            </Typography>
            <Line data={roiScoreData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Impact Analysis
            </Typography>
            <Radar data={radarData} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                {document.analysis_result?.summary ||
                  "No analysis summary available."}
              </Typography>
              {document.analysis_result?.recommendations && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Recommendations
                  </Typography>
                  <ul>
                    {document.analysis_result.recommendations.map(
                      (rec, index) => (
                        <li key={index}>
                          <Typography variant="body1">{rec}</Typography>
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Analysis
