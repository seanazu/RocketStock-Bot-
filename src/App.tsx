import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

function App() {
  const [keywords, setKeywords] = useState("undervalued");
  const [sentiment, setSentiment] = useState("0.7");
  const [industries, setIndustries] = useState(
    "Technology,Healthcare,Consumer,Energy,Financial"
  );
  const [openAiPrompt, setOpenAiPrompt] =
    useState(`You are an expert financial analyst.

Here are stock summaries from news articles. Each includes:
- Ticker
- Company name
- Summary

Pick the **top 3 undervalued stocks with big upside potential**.

Respond in this format:

1. Ticker – Company Name  
   Short reason

2. ...

Data:

{{DATA}}
`);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        "https://stock-rocket-server.onrender.com/api/analyze-stocks",
        {
          searchParams: {
            keywords: keywords?.split(", ")?.join(" OR "),
            sentiment_gte: sentiment,
            industries,
          },
          openAiPromptTemplate: openAiPrompt,
        }
      );

      if (response.data.success) {
        setResult(response.data.topPicks);
      } else {
        setError(response.data.message || "Unknown error");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to run analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        📈 AI Stock Recommender
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          fullWidth
          helperText="Comma separated keywords for Marketaux"
        />

        <TextField
          label="Sentiment (0–1)"
          type="number"
          inputProps={{ min: 0, max: 1, step: 0.1 }}
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          fullWidth
          helperText="Minimum sentiment score"
        />

        <TextField
          label="Industries"
          value={industries}
          onChange={(e) => setIndustries(e.target.value)}
          fullWidth
          helperText="Comma separated industries to filter"
        />

        <TextField
          label="OpenAI Prompt Template"
          value={openAiPrompt}
          onChange={(e) => setOpenAiPrompt(e.target.value)}
          multiline
          minRows={8}
          fullWidth
          helperText="Use '{{DATA}}' where the news digest will be inserted"
        />

        <Button
          variant="contained"
          onClick={handleRunAnalysis}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Run Analysis"}
        </Button>

        {result && (
          <Alert severity="success" sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
            {result}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default App;
