import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.webp';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// eslint-disable-next-line react/prop-types
const Navbar = ({ isAuthenticated, role, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="logo" className="h-10 w-auto rounded-full" />
            <span className="font-bold text-xl text-gray-800 dark:text-white">Bianchini Fletes</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300">Inicio</Link>
            {isAuthenticated ? (
              <>
                {role === 'admin' ? (
                  <>
                    <Link to="/panel-admin" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300">Panel Admin</Link>
                    <Link to="/panel-admin-turnos" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300">Administrar Turnos</Link>
                  </>
                ) : (
                  <>
                    <Link to="/turnero" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300">Turnero</Link>
                    <Link to="/mis-turnos" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300">Mis Turnos</Link>
                    <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300">Perfil</Link>
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
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300">Iniciar sesión</Link>
                <Link 
                  to="/register" 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Registro
                </Link>
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
              aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 mr-2"
              aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 dark:text-white focus:outline-none"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 py-2" onClick={closeMenu}>Inicio</Link>
              {isAuthenticated ? (
                <>
                  {role === 'admin' ? (
                    <>
                      <Link to="/panel-admin" className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 py-2" onClick={closeMenu}>Panel Admin</Link>
                      <Link to="/panel-admin-turnos" className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 py-2" onClick={closeMenu}>Administrar Turnos</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/turnero" className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 py-2" onClick={closeMenu}>Turnero</Link>
                      <Link to="/mis-turnos" className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 py-2" onClick={closeMenu}>Mis Turnos</Link>
                      <Link to="/profile" className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 py-2" onClick={closeMenu}>Perfil</Link>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }} 
                    className="w-full text-left bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 mt-2"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition duration-300 py-2" onClick={closeMenu}>Iniciar sesión</Link>
                  <Link 
                    to="/register" 
                    className="block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 mt-2"
                    onClick={closeMenu}
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