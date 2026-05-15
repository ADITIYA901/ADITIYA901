import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageLoader } from './components/ui/LoadingSpinner';
import ToastProvider from './components/ui/Toast';
import Chatbot from './components/ui/Chatbot';
import PublicNavbar from './components/layout/PublicNavbar';
import PublicFooter from './components/layout/PublicFooter';
import AdminLayout from './components/layout/AdminLayout';
import VoterLayout from './components/layout/VoterLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const FAQPage = lazy(() => import('./pages/public/FAQPage'));
const ElectionResultsPage = lazy(() => import('./pages/public/ElectionResultsPage'));

const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const AdminSignup = lazy(() => import('./pages/auth/AdminSignup'));
const VoterLogin = lazy(() => import('./pages/auth/VoterLogin'));
const VoterSignup = lazy(() => import('./pages/auth/VoterSignup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ElectionManagement = lazy(() => import('./pages/admin/ElectionManagement'));
const CreateElection = lazy(() => import('./pages/admin/CreateElection'));
const EditElection = lazy(() => import('./pages/admin/EditElection'));
const ElectionDetail = lazy(() => import('./pages/admin/ElectionDetail'));
const CandidateManagement = lazy(() => import('./pages/admin/CandidateManagement'));
const VoterManagement = lazy(() => import('./pages/admin/VoterManagement'));
const ResultsPage = lazy(() => import('./pages/admin/ResultsPage'));
const AnnouncementsPage = lazy(() => import('./pages/admin/AnnouncementsPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const BlockchainExplorerPage = lazy(() => import('./pages/admin/BlockchainExplorerPage'));
const AdminHelpPage = lazy(() => import('./pages/admin/AdminHelpPage'));

const VoterDashboard = lazy(() => import('./pages/voter/VoterDashboard'));
const ActiveElections = lazy(() => import('./pages/voter/ActiveElections'));
const ElectionDetailVoter = lazy(() => import('./pages/voter/ElectionDetail'));
const MyVotes = lazy(() => import('./pages/voter/MyVotes'));
const VoterResults = lazy(() => import('./pages/voter/VoterResults'));
const VoterProfile = lazy(() => import('./pages/voter/VoterProfile'));
const VoterHelpPage = lazy(() => import('./pages/voter/VoterHelpPage'));

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Chatbot />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
          <Route path="/results" element={<PublicLayout><ElectionResultsPage /></PublicLayout>} />

          {/* Auth routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/voter/login" element={<VoterLogin />} />
          <Route path="/voter/signup" element={<VoterSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="elections" element={<ElectionManagement />} />
            <Route path="elections/create" element={<CreateElection />} />
            <Route path="elections/:id/edit" element={<EditElection />} />
            <Route path="elections/:id" element={<ElectionDetail />} />
            <Route path="candidates" element={<CandidateManagement />} />
            <Route path="voters" element={<VoterManagement />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="blockchain-explorer" element={<BlockchainExplorerPage />} />
            <Route path="help" element={<AdminHelpPage />} />
          </Route>

          {/* Voter routes */}
          <Route path="/voter" element={<ProtectedRoute role="voter"><VoterLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<VoterDashboard />} />
            <Route path="elections" element={<ActiveElections />} />
            <Route path="elections/:id" element={<ElectionDetailVoter />} />
            <Route path="my-votes" element={<MyVotes />} />
            <Route path="results" element={<VoterResults />} />
            <Route path="profile" element={<VoterProfile />} />
            <Route path="help" element={<VoterHelpPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
