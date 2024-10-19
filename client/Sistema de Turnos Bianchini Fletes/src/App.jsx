// import React from 'react'
import './App.css'
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axiosInstance from './axioConfig'; // Importa la instancia de Axios
// import Cookies from 'js-cookie'; borrar estas dos dependencias
// import { jwtDecode } from 'jwt-decode'

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Al cargar la aplicación, revisa si hay un valor de autenticación guardado en localStorage
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true'; // Si existe, lo convierte en booleano
  });

  const [role, setRole] = useState('');
  const [username, setUsernameSession] = useState('');

  useEffect(() => {
    // Si el valor de `isAuthenticated` cambia, actualiza el `localStorage`
    localStorage.setItem('isAuthenticated', isAuthenticated);
    if (isAuthenticated) {
      axiosInstance.get('/session/role').then((response) => {
        setRole(response.data.role);
        setUsernameSession(response.data.username);
      });
    }
  }, [isAuthenticated]);
  
  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} role={role} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/"/> : <Login setIsAuthenticated={setIsAuthenticated}  setRole={setRole} setUsernameSession={setUsernameSession} />} />
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
