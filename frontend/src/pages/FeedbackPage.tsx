import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  LinearProgress,
  Tab,
  Tabs
} from '@mui/material';
import {
  ExpandMore,
  ThumbUp,
  ThumbDown,
  Info,
  Lightbulb,
  PlayArrow,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { getSessionFeedback, generateFeedback } from '../store/slices/feedbackSlice';
import { RootState } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const FeedbackPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useDispatch();
  const { sessionFeedback, feedbackItems, suggestions, loading, error } = useSelector(
    (state: RootState) => state.feedback
  );
  const { currentSession } = useSelector((state: RootState) => state.interview);
  
  const [tabValue, setTabValue] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);
  
  useEffect(() => {
    if (sessionId) {
      dispatch(getSessionFeedback(sessionId) as any);
    }
  }, [dispatch, sessionId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleAccordionChange = (questionId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedQuestion(isExpanded ? questionId : false);
  };
  
  const handleGenerateFeedback = () => {
    if (sessionId) {
      dispatch(generateFeedback(sessionId) as any);
    }
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <Info />;
      case 'delivery':
        return <PlayArrow />;
      case 'language':
        return <Info />;
      case 'confidence':
        return <ThumbUp />;
      default:
        return <Info />;
    }
  };
  
  if (loading && !sessionFeedback) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );
  }
  
  // If no feedback exists yet, show generate feedback button
  if (!sessionFeedback && !loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Interview Feedback
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            No feedback generated yet
          </Typography>
          <Typography variant="body1" paragraph>
            Generate AI-powered feedback based on your interview responses.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateFeedback}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Lightbulb />}
          >
            {loading ? 'Generating...' : 'Generate Feedback'}
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Interview Feedback
      </Typography>
      
      {/* Overall feedback summary */}
      {sessionFeedback && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Overall Performance
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Overall Score
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 120,
                    height: 120,
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={sessionFeedback.overallScore}
                    size={120}
                    thickness={5}
                    sx={{
                      color: (theme) => {
                        if (sessionFeedback.overallScore >= 80) return theme.palette.success.main;
                        if (sessionFeedback.overallScore >= 60) return theme.palette.warning.main;
                        return theme.palette.error.main;
                      },
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary">
                      {sessionFeedback.overallScore}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {sessionFeedback.summary}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Strengths
              </Typography>
              <List dense>
                {sessionFeedback.strengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ThumbUp color="success" fontSize="small" sx={{ mr: 1 }} />
                          {strength}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Areas for Improvement
              </Typography>
              <List dense>
                {sessionFeedback.weaknesses.map((weakness, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ThumbDown color="error" fontSize="small" sx={{ mr: 1 }} />
                          {weakness}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Detailed feedback by question */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Question-by-Question Feedback
        </Typography>
        
        {currentSession && currentSession.questions.map((question, index) => (
          <Accordion
            key={question.id}
            expanded={expandedQuestion === question.id}
            onChange={handleAccordionChange(question.id)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ width: '80%', flexShrink: 0 }}>
                Question {index + 1}: {question.text.substring(0, 80)}...
              </Typography>
              {feedbackItems[question.id] && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Rating
                    value={
                      feedbackItems[question.id].filter(
                        (item) => item.sentiment === 'positive'
                      ).length / 2
                    }
                    max={5}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </Box>
              )}
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Question:
                </Typography>
                <Typography variant="body1" paragraph>
                  {question.text}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="feedback tabs">
                    <Tab label="Feedback" />
                    <Tab label="Suggestions" />
                    <Tab label="Your Response" />
                  </Tabs>
                </Box>
                
                {/* Feedback Tab */}
                <TabPanel value={tabValue} index={0}>
                  {feedbackItems[question.id] ? (
                    feedbackItems[question.id].map((item, i) => (
                      <Card key={i} className="feedback-card" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {getCategoryIcon(item.category)}
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </Typography>
                            <Chip
                              label={item.sentiment}
                              color={getSentimentColor(item.sentiment) as any}
                              size="small"
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                          <Typography variant="body1">{item.content}</Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      No feedback available for this question.
                    </Typography>
                  )}
                </TabPanel>
                
                {/* Suggestions Tab */}
                <TabPanel value={tabValue} index={1}>
                  {suggestions[question.id] ? (
                    suggestions[question.id].map((suggestion, i) => (
                      <Card key={i} className="suggestion-card" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Lightbulb color="secondary" />
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                              Suggestion for {suggestion.category}
                            </Typography>
                          </Box>
                          <Typography variant="body1">{suggestion.content}</Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      No suggestions available for this question.
                    </Typography>
                  )}
                </TabPanel>
                
                {/* Response Tab */}
                <TabPanel value={tabValue} index={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Your Transcribed Response:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                    <Typography variant="body1">
                      {/* This would come from the actual response data */}
                      {/* For now, using placeholder text */}
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
                      nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl 
                      nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl 
                      aliquet nunc, quis aliquam nisl nunc quis nisl.
                    </Typography>
                  </Paper>
                  
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    sx={{ mb: 2 }}
                  >
                    Play Recording
                  </Button>
                </TabPanel>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
        >
          Back to Dashboard
        </Button>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/interview"
          endIcon={<ArrowForward />}
        >
          Practice Again
        </Button>
      </Box>
    </Box>
  );
};

export default FeedbackPage;
