import { useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  IconButton,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "axios";

export default function AiStockRecommender() {
  const [keywords, setKeywords] = useState("undervalued");
  const [sentiment, setSentiment] = useState("0.7");
  const [industries, setIndustries] = useState(
    "Technology,Healthcare,Consumer,Energy,Financial"
  );
  const [openAiPrompt, setOpenAiPrompt] = useState(
    `You are an expert financial analyst.

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

{{DATA}}`
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#1976d2",
          },
          background: {
            default: darkMode ? "#121212" : "#f5f5f5",
            paper: darkMode ? "#1e1e1e" : "#ffffff",
          },
        },
      }),
    [darkMode]
  );

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          p: 4,
          maxWidth: 800,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            alignSelf: "flex-end",
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <IconButton
            onClick={() => setDarkMode((prev) => !prev)}
            color="inherit"
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
            userSelect: "none",
          }}
        >
          <RocketLaunchIcon color="primary" sx={{ fontSize: 48 }} />
          Rocket Stocks
        </Typography>

        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            width: "100%",
            backdropFilter: "blur(8px)",
          }}
        >
          <TextField
            label="Keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Comma separated keywords for Marketaux"
          />

          <TextField
            label="Sentiment (0–1)"
            type="number"
            inputProps={{ min: 0, max: 1, step: 0.1 }}
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Minimum sentiment score"
          />

          <TextField
            label="Industries"
            value={industries}
            onChange={(e) => setIndustries(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Comma separated industries"
          />

          <TextField
            label="OpenAI Prompt Template"
            value={openAiPrompt}
            onChange={(e) => setOpenAiPrompt(e.target.value)}
            multiline
            minRows={8}
            fullWidth
            margin="normal"
            helperText="Use '{{DATA}}' where the news digest will be inserted"
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            onClick={handleRunAnalysis}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "🚀 Run Analysis"
            )}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {result && (
          <Alert
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 3,
              width: "100%",
              backgroundColor: darkMode
                ? theme.palette.success.dark
                : "#e6f4ea",
              color: darkMode ? theme.palette.success.contrastText : "inherit",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              🔎 Top Picks
            </Typography>
            <List>
              {result
                .split("\n")
                .filter((line) => line.trim())
                .map((line, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText primary={line} />
                  </ListItem>
                ))}
            </List>
          </Alert>
        )}
      </Box>
    </ThemeProvider>
  );
}
