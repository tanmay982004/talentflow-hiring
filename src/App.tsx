import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout'; // Import the new layout
import JobsListPage from './pages/Jobs/JobsList';
import JobDetailsPage from './pages/Jobs/JobDetails';
import CandidatesListPage from './pages/Candidates/CandidatesList';
import CandidateProfilePage from './pages/Candidates/CandidateProfilePage';
import AssessmentsPage from './pages/Assessments/AssessmentsPage';
import AssessmentBuilderPage from './pages/Assessments/AssessmentBuilder';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/jobs" element={<JobsListPage />} />
                        <Route path="/jobs/:slug" element={<JobDetailsPage />} />
                        <Route path="/assessments" element={<AssessmentsPage />} />
                        <Route path="/assessments/new" element={<AssessmentBuilderPage />} />
                        <Route path="/assessments/:jobSlug" element={<AssessmentBuilderPage />} />
                        <Route path="/assessments/:jobSlug/create" element={<AssessmentBuilderPage />} />
                        <Route path="/assessments/:jobSlug/edit" element={<AssessmentBuilderPage />} />
                        <Route path="/candidates" element={<CandidatesListPage />} />
                        <Route path="/candidates/:candidateId" element={<CandidateProfilePage />} />
                        {/* The root path now redirects to /jobs */}
                        <Route path="/" element={<Navigate to="/jobs" replace />} />
                    </Route>
                    {/* You can add non-layout routes here if needed, e.g., a login page */}
                    <Route path="*" element={<Navigate to="/jobs" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App;