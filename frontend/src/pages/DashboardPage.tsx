import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Description,
  QuestionAnswer,
  Feedback,
  Schedule,
  ArrowForward,
} from '@mui/icons-material';
import { getDocuments, DocumentState } from '../store/slices/documentSlice';
import { interviewAPI } from '../services/api';
import { RootState } from '../store';
import { useSessionHistory, useLoading, useError } from '../hooks';
import { SessionHistoryItem } from '../types';
import { AuthState } from '../store/slices/authSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth) as AuthState;
  const { user } = auth;
  const document = useSelector((state: RootState) => state.document) as DocumentState;
  const { cv, jobSpec, loading: docLoading, error: docError } = document;
  
  // Use custom hooks for state management
  const [sessionHistory, setSessionHistory] = useSessionHistory();
  const [loading, setLoading] = useLoading(false);
  const [error, setError] = useError();

  // Fetch documents and session history when component mounts
  useEffect(() => {
    dispatch(getDocuments() as any);
    fetchSessionHistory();
  }, [dispatch]);
  
  // Function to fetch session history from API
  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getSessions();
      
      if (response.data && response.data.data) {
        // Transform the API response to match our SessionHistoryItem interface
        const formattedSessions = response.data.data.map((session: any) => ({
          id: session.id,
          date: new Date(session.startTime).toLocaleDateString(),
          questions: session.questions ? session.questions.length : 0,
          duration: calculateDuration(session.startTime, session.endTime),
          score: session.score || 0
        }));
        
        setSessionHistory(formattedSessions);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch session history');
      setLoading(false);
    }
  };
  
  // Helper function to calculate duration between start and end times
  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    return `${minutes} min`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {(docError || error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {docError || error}
        </Alert>
      )}

      {/* Welcome Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Typography variant="body1">
          Continue your interview preparation journey. Upload documents, practice with AI-generated questions, and track your progress.
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Description fontSize="large" color="primary" />
              </Box>
              <Typography variant="h6" component="h2" align="center" gutterBottom>
                Upload Documents
              </Typography>
              <Typography variant="body2" align="center">
                Upload your CV and job specifications to generate tailored interview questions.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/upload"
                endIcon={<ArrowForward />}
              >
                Upload
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <QuestionAnswer fontSize="large" color="primary" />
              </Box>
              <Typography variant="h6" component="h2" align="center" gutterBottom>
                Start Interview
              </Typography>
              <Typography variant="body2" align="center">
                Practice with AI-generated questions based on your uploaded documents.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/interview"
                endIcon={<ArrowForward />}
                disabled={!cv || !jobSpec}
              >
                Start
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Feedback fontSize="large" color="primary" />
              </Box>
              <Typography variant="h6" component="h2" align="center" gutterBottom>
                View Feedback
              </Typography>
              <Typography variant="body2" align="center">
                Review feedback from your previous interview practice sessions.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                variant="contained"
                component={RouterLink}
                to={`/feedback/${sessionHistory[0]?.id || '1'}`}
                endIcon={<ArrowForward />}
                disabled={sessionHistory.length === 0}
              >
                View
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Schedule fontSize="large" color="primary" />
              </Box>
              <Typography variant="h6" component="h2" align="center" gutterBottom>
                Schedule Practice
              </Typography>
              <Typography variant="body2" align="center">
                Set up regular practice sessions to improve your interview skills.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/schedule"
                endIcon={<ArrowForward />}
                disabled={true}
              >
                Schedule
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Document Status */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Document Status
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              CV Status
            </Typography>
            {docLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : cv ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Filename:</strong> {cv.fileName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Uploaded:</strong> {new Date(cv.uploadDate).toLocaleDateString()}
                </Typography>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/upload" 
                  sx={{ mt: 2 }}
                >
                  Update CV
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" gutterBottom>
                  No CV uploaded yet.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/upload" 
                  sx={{ mt: 2 }}
                >
                  Upload CV
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Job Specification Status
            </Typography>
            {docLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : jobSpec ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Filename:</strong> {jobSpec.fileName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Uploaded:</strong> {new Date(jobSpec.uploadDate).toLocaleDateString()}
                </Typography>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/upload" 
                  sx={{ mt: 2 }}
                >
                  Update Job Spec
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" gutterBottom>
                  No job specification uploaded yet.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/upload" 
                  sx={{ mt: 2 }}
                >
                  Upload Job Spec
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Practice Sessions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Practice Sessions
      </Typography>
      <Paper sx={{ mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : sessionHistory.length > 0 ? (
          <List>
            {sessionHistory.map((session, index) => (
              <Box key={session.id}>
                <ListItem
                  secondaryAction={
                    <Button
                      component={RouterLink}
                      to={`/feedback/${session.id}`}
                      endIcon={<ArrowForward />}
                    >
                      View Details
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          Practice Session - {session.date}
                        </Typography>
                        <Box sx={{ ml: 2 }}>
                          <Chip 
                            label={`Score: ${session.score}%`} 
                            color={getScoreColor(session.score) as any}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Questions: {session.questions}
                        </Typography>
                        <Typography variant="body2">
                          Duration: {session.duration}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
                {index < sessionHistory.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              No practice sessions yet.
            </Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/interview" 
              sx={{ mt: 2 }}
              disabled={!cv || !jobSpec}
            >
              Start Practice
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;
