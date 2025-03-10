import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Mic,
  MicOff,
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  Timer
} from '@mui/icons-material';
import {
  startInterviewSession,
  endInterviewSession,
  saveResponse,
  nextQuestion,
  previousQuestion,
  setAudioRecording,
  setAudioPlaying,
  setSpeechRecognitionActive
} from '../store/slices/interviewSlice';
import { RootState } from '../store';

// Mock speech recognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
  onend: (event: any) => void;
}

// Mock speech synthesis interface
interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onend: (event: any) => void;
}

interface SpeechSynthesisVoice {
  default: boolean;
  lang: string;
  localService: boolean;
  name: string;
  voiceURI: string;
}

const InterviewSimulationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    currentSession, 
    currentQuestion, 
    currentQuestionIndex,
    responses,
    loading, 
    error,
    audioRecording,
    audioPlaying,
    speechRecognitionActive
  } = useSelector((state: RootState) => state.interview);

  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes per question
  const [transcription, setTranscription] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [confirmEndDialog, setConfirmEndDialog] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Initialize interview session
  useEffect(() => {
    if (!currentSession && !loading) {
      dispatch(startInterviewSession() as any);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [dispatch, currentSession, loading]);
  
  // Timer effect
  useEffect(() => {
    if (audioRecording && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStopRecording();
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioRecording, timeLeft]);
  
  // Speech synthesis for reading the question
  const speakQuestion = () => {
    if (currentQuestion && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en-US') && voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      dispatch(setAudioPlaying(true));
      
      utterance.onend = () => {
        dispatch(setAudioPlaying(false));
      };
    }
  };
  
  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      // Cast to any to avoid TypeScript errors with the Web Speech API
      const SpeechRecognition = window.webkitSpeechRecognition as any;
      speechRecognitionRef.current = new SpeechRecognition();
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        speechRecognitionRef.current.lang = 'en-US';
        
        speechRecognitionRef.current.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscription(finalTranscript || interimTranscript);
        };
        
        speechRecognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event);
        };
        
        speechRecognitionRef.current.onend = () => {
          dispatch(setSpeechRecognitionActive(false));
        };
      }
    }
  };
  
  // Start recording audio
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop all tracks on the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      dispatch(setAudioRecording(true));
      setTimeLeft(120); // Reset timer to 2 minutes
      
      // Start speech recognition if available
      if (!speechRecognitionRef.current) {
        initSpeechRecognition();
      }
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
        dispatch(setSpeechRecognitionActive(true));
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  // Stop recording audio
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && audioRecording) {
      mediaRecorderRef.current.stop();
      dispatch(setAudioRecording(false));
      
      // Stop speech recognition
      if (speechRecognitionRef.current && speechRecognitionActive) {
        speechRecognitionRef.current.stop();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  // Play recorded audio
  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };
  
  // Save response and move to next question
  const handleSaveResponse = async () => {
    if (currentSession && currentQuestion) {
      await dispatch(
        saveResponse({
          sessionId: currentSession.id,
          questionId: currentQuestion.id,
          audioBlob: audioBlob || undefined, // Convert null to undefined to match the expected type
          transcription
        }) as any
      );
      
      // Reset state for next question
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscription('');
      
      // Move to next question
      dispatch(nextQuestion());
      setTimeLeft(120); // Reset timer
    }
  };
  
  // Handle moving to previous question
  const handlePreviousQuestion = () => {
    dispatch(previousQuestion());
    
    // Reset state
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setTimeLeft(120);
  };
  
  // End interview session
  const handleEndInterview = async () => {
    if (currentSession) {
      await dispatch(endInterviewSession(currentSession.id) as any);
      navigate(`/feedback/${currentSession.id}`);
    }
  };
  
  // Format time left
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!currentSession) return 0;
    return ((currentQuestionIndex + 1) / currentSession.questions.length) * 100;
  };
  
  // Check if current question has a response
  const hasResponse = () => {
    if (!currentQuestion) return false;
    return !!responses[currentQuestion.id];
  };
  
  if (loading && !currentSession) {
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
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Interview Simulation
      </Typography>
      
      {/* Progress indicator */}
      {currentSession && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Question {currentQuestionIndex + 1} of {currentSession.questions.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(calculateProgress())}% Complete
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={calculateProgress()} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}
      
      {/* Question card */}
      {currentQuestion && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="overline" color="text.secondary">
                {currentQuestion.category} - {currentQuestion.difficulty}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Timer color="action" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color={timeLeft < 30 ? 'error' : 'text.secondary'}>
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h5" component="h2" gutterBottom>
              {currentQuestion.text}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                startIcon={<VolumeUp />}
                variant="outlined"
                onClick={speakQuestion}
                disabled={audioPlaying}
              >
                Read Question
              </Button>
              
              {hasResponse() ? (
                <Typography variant="body2" color="success.main">
                  Response saved
                </Typography>
              ) : null}
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Audio controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Response
        </Typography>
        
        <Box className="audio-controls">
          {!audioRecording && !audioUrl && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Mic />}
              onClick={handleStartRecording}
            >
              Start Recording
            </Button>
          )}
          
          {audioRecording && (
            <Button
              variant="contained"
              color="error"
              startIcon={<MicOff />}
              onClick={handleStopRecording}
            >
              Stop Recording
            </Button>
          )}
          
          {audioUrl && !audioRecording && (
            <>
              <Button
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={handlePlayAudio}
              >
                Play Recording
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Mic />}
                onClick={handleStartRecording}
              >
                Record Again
              </Button>
            </>
          )}
        </Box>
        
        {/* Transcription display */}
        {transcription && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Transcription:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1">{transcription}</Typography>
            </Paper>
          </Box>
        )}
      </Paper>
      
      {/* Navigation controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<SkipPrevious />}
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || audioRecording}
        >
          Previous Question
        </Button>
        
        {currentSession && currentQuestionIndex < currentSession.questions.length - 1 ? (
          <Button
            variant="contained"
            endIcon={<SkipNext />}
            onClick={handleSaveResponse}
            disabled={audioRecording || (!audioBlob && !hasResponse())}
          >
            {hasResponse() ? 'Next Question' : 'Save & Next'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={() => setConfirmEndDialog(true)}
            disabled={audioRecording || (!audioBlob && !hasResponse())}
          >
            Finish Interview
          </Button>
        )}
      </Box>
      
      {/* End interview confirmation dialog */}
      <Dialog
        open={confirmEndDialog}
        onClose={() => setConfirmEndDialog(false)}
      >
        <DialogTitle>End Interview Session?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this interview session? You'll be redirected to the feedback page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEndDialog(false)}>Cancel</Button>
          <Button onClick={handleEndInterview} variant="contained" color="primary">
            End Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewSimulationPage;
