import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { Toaster } from 'sonner';
import axiosInstance from './axioConfig.js';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Appointments from './pages/Appointments';
import MyAppointments from './pages/MyAppointments';
import AdminPanel from './pages/AdminPanel';
import AdminAppointments from './pages/AdminAppointments';

function App() {
  const { 
    isAuthenticated, 
    role, 
    username, 
    isLoading, 
    setIsAuthenticated, 
    setRole, 
    setUsername 
  } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/session/logout');
      
      setIsAuthenticated(false);
      setRole('');
      setUsername('');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster position="bottom-right" closeButton richColors />
        <Navbar 
          isAuthenticated={isAuthenticated} 
          role={role}
          handleLogout={handleLogout}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} role={role} username={username} />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/"/> : <Login setIsAuthenticated={setIsAuthenticated} setRole={setRole} setUsername={setUsername} />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/"/> : <Register />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login"/>} />
            <Route path="/turnero" element={isAuthenticated ? <Appointments username={username} /> : <Navigate to="/login" />} />
            <Route path="/mis-turnos" element={isAuthenticated ? <MyAppointments username={username} /> : <Navigate to="/login" />} />
            <Route path="/panel-admin" element={isAuthenticated && role === 'admin' ? <AdminPanel /> : <Navigate to="/login" />} />
            <Route path="/panel-admin-turnos" element={isAuthenticated && role === 'admin' ? <AdminAppointments /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

