/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axioConfig';
import logo from '../assets/logo.webp';
import { Menu, X } from 'lucide-react';

const Navbar = ({ isAuthenticated, role, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="logo" className="h-10 w-auto rounded-full" />
            <span className="font-bold text-xl text-white">Bianchini Fletes</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white transition duration-300">Inicio</Link>
            {isAuthenticated ? (
              <>
                {role === 'admin' ? (
                  <>
                    <Link to="/panel-admin" className="text-gray-300 hover:text-white transition duration-300">Panel Admin</Link>
                    <Link to="/panel-admin-turnos" className="text-gray-300 hover:text-white transition duration-300">Administrar Turnos</Link>
                  </>
                ) : (
                  <>
                    <Link to="/turnero" className="text-gray-300 hover:text-white transition duration-300">Turnero</Link>
                    <Link to="/mis-turnos" className="text-gray-300 hover:text-white transition duration-300">Mis Turnos</Link>
                    <Link to="/profile" className="text-gray-300 hover:text-white transition duration-300">Perfil</Link>
                  </>
                )}
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition duration-300">Iniciar sesión</Link>
                <Link 
                  to="/register" 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Registro
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block text-gray-300 hover:text-white transition duration-300 py-2">Inicio</Link>
              {isAuthenticated ? (
                <>
                  {role === 'admin' ? (
                    <>
                      <Link to="/panel-admin" className="block text-gray-300 hover:text-white transition duration-300 py-2">Panel Admin</Link>
                      <Link to="/panel-admin-turnos" className="block text-gray-300 hover:text-white transition duration-300 py-2">Administrar Turnos</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/turnero" className="block text-gray-300 hover:text-white transition duration-300 py-2">Turnero</Link>
                      <Link to="/mis-turnos" className="block text-gray-300 hover:text-white transition duration-300 py-2">Mis Turnos</Link>
                      <Link to="/profile" className="block text-gray-300 hover:text-white transition duration-300 py-2">Perfil</Link>
                    </>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 mt-2"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-gray-300 hover:text-white transition duration-300 py-2">Iniciar sesión</Link>
                  <Link 
                    to="/register" 
                    className="block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 mt-2"
                  >
                    Registro
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

