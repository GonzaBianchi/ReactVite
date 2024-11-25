import './App.css'
// import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import axiosInstance from './axioConfig';
import { useAuth } from './auth/useAuth';

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
  // const [isAuthenticated, setIsAuthenticated] = useState(() => {
  //   const storedAuth = localStorage.getItem('isAuthenticated');
  //   return storedAuth === 'true';
  // });

  // const [role, setRole] = useState('');
  // const [username, setUsernameSession] = useState('');
  const { 
    isAuthenticated, 
    role, 
    username, 
    isLoading, 
    setIsAuthenticated, 
    setRole, 
    setUsername 
  } = useAuth();
  // useEffect(() => {
  //   localStorage.setItem('isAuthenticated', isAuthenticated);
  //   if (isAuthenticated) {
  //     axiosInstance.get('/session/role').then((response) => {
  //       setRole(response.data.role);
  //       setUsernameSession(response.data.username);
  //     });
  //   }
  // }, [isAuthenticated]);
  

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Router>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        role={role} 
        setIsAuthenticated={setIsAuthenticated}
        setRole={setRole}
        setUsername={setUsername}
      />

      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} role={role} />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/"/> : <Login setIsAuthenticated={setIsAuthenticated}  setRole={setRole} setUsername={setUsername} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/"/> : <Register />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/"/> } />
        <Route path="/turnero" element={isAuthenticated ? <Appointments username={username} /> : <Navigate to="/login" />} />
        <Route path="/mis-turnos" element={isAuthenticated ? <MyAppointments username={username} /> : <Navigate to="/login" />} />
        <Route path="/panel-admin" element={isAuthenticated && role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/panel-admin-turnos" element={isAuthenticated && role === 'admin' ? <AdminAppointments /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App
