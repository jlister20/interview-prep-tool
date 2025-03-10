import { useSelector } from 'react-redux';
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
  CardMedia,
  Stack
} from '@mui/material';
import { 
  Description, 
  QuestionAnswer, 
  Feedback, 
  TrendingUp 
} from '@mui/icons-material';
import { RootState } from '../store';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const features = [
    {
      title: 'Document Analysis',
      description: 'Upload your CV and job specifications to generate tailored interview questions.',
      icon: <Description fontSize="large" color="primary" />,
      path: '/upload'
    },
    {
      title: 'Interview Simulation',
      description: 'Practice with AI-generated questions and record your responses.',
      icon: <QuestionAnswer fontSize="large" color="primary" />,
      path: '/interview'
    },
    {
      title: 'Detailed Feedback',
      description: 'Receive comprehensive feedback on your responses and delivery.',
      icon: <Feedback fontSize="large" color="primary" />,
      path: '/dashboard'
    },
    {
      title: 'Track Progress',
      description: 'Monitor your improvement over time with performance analytics.',
      icon: <TrendingUp fontSize="large" color="primary" />,
      path: '/dashboard'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?interview)',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                Ace Your Next Interview
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Practice with AI-powered interview questions tailored to your CV and job specifications.
                Get real-time feedback and improve your interview skills.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {isAuthenticated ? (
                  <Button
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/dashboard"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      component={RouterLink}
                      to="/register"
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={RouterLink}
                      to="/login"
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
        Key Features
      </Typography>
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                {feature.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" textAlign="center">
                  {feature.title}
                </Typography>
                <Typography textAlign="center">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How It Works Section */}
      <Paper sx={{ p: 4, mb: 6, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          How It Works
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>1. Upload Your Documents</Typography>
              <Typography paragraph>
                Start by uploading your CV and the job specification you're applying for.
                Our AI will analyze these documents to understand your background and the job requirements.
              </Typography>
              
              <Typography variant="h6" gutterBottom>2. Practice with AI-Generated Questions</Typography>
              <Typography paragraph>
                Based on your documents, our system generates relevant interview questions.
                You can practice answering these questions verbally, just like in a real interview.
              </Typography>
              
              <Typography variant="h6" gutterBottom>3. Receive Detailed Feedback</Typography>
              <Typography paragraph>
                After each practice session, receive comprehensive feedback on your responses,
                including content quality, delivery style, confidence indicators, and language usage.
              </Typography>
              
              <Typography variant="h6" gutterBottom>4. Track Your Progress</Typography>
              <Typography paragraph>
                Monitor your improvement over time with performance analytics and continue
                practicing until you feel confident for your real interview.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              image="https://source.unsplash.com/random?presentation"
              alt="Interview preparation"
              sx={{ borderRadius: 2, boxShadow: 3 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* CTA Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 6, 
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Ace Your Next Interview?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Start practicing today and build your confidence for the real thing.
        </Typography>
        {isAuthenticated ? (
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/dashboard"
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Go to Dashboard
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Get Started Now
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
