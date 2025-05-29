import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import LandingPage from './components/LandingPage';
import MainMenu from './components/2MainMenu';
import DetailedReport from './components/DetailedReport';
import EvaluationTypeSelection from './components/EvaluationTypeSelection';
import FirstPage from './components/FirstPage';
import CenteredWithWideButtons from './components/centered_with_wide_buttons';
import ValidateModal from './components/ValidateModal';


const pageVariants = {
  initial: {
    opacity: 0,
    // x: "-100vw", // Example: slide in from left
  },
  in: {
    opacity: 1,
    // x: 0,
  },
  out: {
    opacity: 0,
    // x: "100vw", // Example: slide out to right
  }
};

const pageTransition = {
  type: "tween", // Or "spring", "inertia"
  ease: "anticipate", // Example: "linear", "easeIn", "easeOut", "easeInOut", "circIn", etc.
  duration: 0.4 // Adjust duration as needed
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location for AnimatePresence key

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  console.log('Rendering App - isLoggedIn:', isLoggedIn);

  const createAnimatedRoute = (element) => (
    <motion.div
      key={location.pathname} // Ensure this key changes on route change
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ position: 'absolute', width: '100%', height: '100%' }} // Added for smoother transitions
    >
      {element}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={createAnimatedRoute(
          isLoggedIn ? <Navigate to="/home" replace /> : <LandingPage onLoginSuccess={handleLoginSuccess} />
        )} />
        <Route path="/home" element={createAnimatedRoute(
          isLoggedIn ? <MainMenu /> : <Navigate to="/" replace />
        )} />
        <Route path="/evaluation-type" element={createAnimatedRoute(
          isLoggedIn ? <EvaluationTypeSelection /> : <Navigate to="/" replace />
        )} />
        <Route path="/evaluation/split-screen" element={createAnimatedRoute(
          isLoggedIn ? <DetailedReport /> : <Navigate to="/" replace />
        )} />
        <Route path="/addeval" element={createAnimatedRoute(
          isLoggedIn ? <Navigate to="/evaluation-type" replace /> : <Navigate to="/" replace />
        )} />
        <Route path="/centered-with-wide-buttons" element={createAnimatedRoute(
          isLoggedIn ? <CenteredWithWideButtons /> : <Navigate to="/" replace />
        )} />
        <Route path="/validate-modal" element={createAnimatedRoute(
          isLoggedIn ? <ValidateModal /> : <Navigate to="/" replace />
        )} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
