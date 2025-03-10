import { useState, useRef, ChangeEvent } from 'react';
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
  Divider,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { CloudUpload, Description, Work } from '@mui/icons-material';
import { uploadDocument, processDocuments } from '../store/slices/documentSlice';
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
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const DocumentUploadPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cv, jobSpec, loading, error, processingStatus } = useSelector(
    (state: RootState) => state.document
  );

  const [tabValue, setTabValue] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobSpecFile, setJobSpecFile] = useState<File | null>(null);
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [cvText, setCvText] = useState('');
  const [jobSpecText, setJobSpecText] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');

  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const jobSpecFileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCvFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCvFile(event.target.files[0]);
    }
  };

  const handleJobSpecFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setJobSpecFile(event.target.files[0]);
    }
  };

  const handleIndustryChange = (event: SelectChangeEvent) => {
    setIndustry(event.target.value);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value);
  };

  const handleCvTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCvText(event.target.value);
  };

  const handleJobSpecTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setJobSpecText(event.target.value);
  };

  const handleUploadMethodChange = (event: SelectChangeEvent) => {
    setUploadMethod(event.target.value as 'file' | 'text');
  };

  const handleCvUpload = async () => {
    if (uploadMethod === 'file' && cvFile) {
      await dispatch(uploadDocument({ file: cvFile, type: 'cv' }) as any);
      setCvFile(null);
      if (cvFileInputRef.current) {
        cvFileInputRef.current.value = '';
      }
    } else if (uploadMethod === 'text' && cvText) {
      // Convert text to file
      const blob = new Blob([cvText], { type: 'text/plain' });
      const file = new File([blob], 'cv.txt', { type: 'text/plain' });
      await dispatch(uploadDocument({ file, type: 'cv' }) as any);
      setCvText('');
    }
  };

  const handleJobSpecUpload = async () => {
    if (uploadMethod === 'file' && jobSpecFile) {
      await dispatch(uploadDocument({ file: jobSpecFile, type: 'jobSpec' }) as any);
      setJobSpecFile(null);
      if (jobSpecFileInputRef.current) {
        jobSpecFileInputRef.current.value = '';
      }
    } else if (uploadMethod === 'text' && jobSpecText) {
      // Convert text to file
      const blob = new Blob([jobSpecText], { type: 'text/plain' });
      const file = new File([blob], 'jobSpec.txt', { type: 'text/plain' });
      await dispatch(uploadDocument({ file, type: 'jobSpec' }) as any);
      setJobSpecText('');
    }
  };

  const handleProcessDocuments = async () => {
    await dispatch(processDocuments() as any);
    if (processingStatus === 'completed') {
      navigate('/interview');
    }
  };

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Marketing',
    'Legal',
    'Consulting',
    'Other'
  ];

  const roles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Marketing Specialist',
    'Financial Analyst',
    'HR Manager',
    'Sales Representative',
    'Customer Support',
    'Other'
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Document Upload
      </Typography>
      <Typography variant="body1" paragraph>
        Upload your CV and job specification to generate tailored interview questions.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {processingStatus === 'processing' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Processing your documents. This may take a moment...
        </Alert>
      )}

      {processingStatus === 'completed' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Documents processed successfully! You can now start your interview simulation.
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="document upload tabs">
            <Tab label="CV Upload" />
            <Tab label="Job Specification Upload" />
            <Tab label="Additional Information" />
          </Tabs>
        </Box>

        {/* CV Upload Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Upload Your CV
          </Typography>
          <Typography variant="body2" paragraph>
            Upload your CV to generate interview questions relevant to your experience and skills.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="upload-method-label">Upload Method</InputLabel>
            <Select
              labelId="upload-method-label"
              id="upload-method"
              value={uploadMethod}
              label="Upload Method"
              onChange={handleUploadMethodChange}
            >
              <MenuItem value="file">File Upload</MenuItem>
              <MenuItem value="text">Text Input</MenuItem>
            </Select>
          </FormControl>

          {uploadMethod === 'file' ? (
            <Box>
              <Box
                className="file-upload-container"
                onClick={() => cvFileInputRef.current?.click()}
                sx={{ mb: 3 }}
              >
                <input
                  type="file"
                  ref={cvFileInputRef}
                  onChange={handleCvFileChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <CloudUpload fontSize="large" color="primary" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {cvFile ? cvFile.name : 'Click to upload your CV'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: PDF, DOC, DOCX, TXT
                </Typography>
              </Box>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Paste your CV text here"
              variant="outlined"
              value={cvText}
              onChange={handleCvTextChange}
              sx={{ mb: 3 }}
            />
          )}

          <Button
            variant="contained"
            onClick={handleCvUpload}
            disabled={
              loading || 
              (uploadMethod === 'file' && !cvFile) || 
              (uploadMethod === 'text' && !cvText)
            }
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {loading ? 'Uploading...' : 'Upload CV'}
          </Button>

          {cv && (
            <Alert severity="success" sx={{ mt: 3 }}>
              CV uploaded successfully: {cv.fileName}
            </Alert>
          )}
        </TabPanel>

        {/* Job Specification Upload Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Upload Job Specification
          </Typography>
          <Typography variant="body2" paragraph>
            Upload the job description to generate questions specific to the role you're applying for.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="upload-method-label-job">Upload Method</InputLabel>
            <Select
              labelId="upload-method-label-job"
              id="upload-method-job"
              value={uploadMethod}
              label="Upload Method"
              onChange={handleUploadMethodChange}
            >
              <MenuItem value="file">File Upload</MenuItem>
              <MenuItem value="text">Text Input</MenuItem>
            </Select>
          </FormControl>

          {uploadMethod === 'file' ? (
            <Box>
              <Box
                className="file-upload-container"
                onClick={() => jobSpecFileInputRef.current?.click()}
                sx={{ mb: 3 }}
              >
                <input
                  type="file"
                  ref={jobSpecFileInputRef}
                  onChange={handleJobSpecFileChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <CloudUpload fontSize="large" color="primary" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {jobSpecFile ? jobSpecFile.name : 'Click to upload job specification'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: PDF, DOC, DOCX, TXT
                </Typography>
              </Box>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Paste the job description here"
              variant="outlined"
              value={jobSpecText}
              onChange={handleJobSpecTextChange}
              sx={{ mb: 3 }}
            />
          )}

          <Button
            variant="contained"
            onClick={handleJobSpecUpload}
            disabled={
              loading || 
              (uploadMethod === 'file' && !jobSpecFile) || 
              (uploadMethod === 'text' && !jobSpecText)
            }
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {loading ? 'Uploading...' : 'Upload Job Specification'}
          </Button>

          {jobSpec && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Job specification uploaded successfully: {jobSpec.fileName}
            </Alert>
          )}
        </TabPanel>

        {/* Additional Information Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          <Typography variant="body2" paragraph>
            Provide additional details to help generate more relevant interview questions.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="industry-label">Industry</InputLabel>
                <Select
                  labelId="industry-label"
                  id="industry"
                  value={industry}
                  label="Industry"
                  onChange={handleIndustryChange}
                >
                  {industries.map((ind) => (
                    <MenuItem key={ind} value={ind}>
                      {ind}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="role-label">Role Type</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  label="Role Type"
                  onChange={handleRoleChange}
                >
                  {roles.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Any specific areas you want to focus on in the interview?"
            variant="outlined"
            sx={{ mb: 3 }}
          />
        </TabPanel>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setTabValue(Math.max(0, tabValue - 1))}
          disabled={tabValue === 0}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={() => setTabValue(Math.min(2, tabValue + 1))}
          disabled={tabValue === 2}
        >
          Next
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Document Status
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Description color={cv ? 'success' : 'disabled'} sx={{ mr: 1 }} />
              <Typography>
                CV: {cv ? `Uploaded (${cv.fileName})` : 'Not uploaded'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Work color={jobSpec ? 'success' : 'disabled'} sx={{ mr: 1 }} />
              <Typography>
                Job Specification: {jobSpec ? `Uploaded (${jobSpec.fileName})` : 'Not uploaded'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleProcessDocuments}
            disabled={loading || !cv || !jobSpec || processingStatus === 'processing'}
            startIcon={processingStatus === 'processing' ? <CircularProgress size={20} /> : null}
          >
            {processingStatus === 'processing'
              ? 'Processing...'
              : 'Generate Interview Questions'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DocumentUploadPage;
