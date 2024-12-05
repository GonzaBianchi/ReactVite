import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.webp';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from "@/components/ui/button";

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
                <Button onClick={handleLogout}>Cerrar sesión</Button>
              </>
            ) : (
              <>
                <Button asChild variant="default">
                  <Link to="/login" className="flex items-center">Iniciar Sesión</Link>
                </Button>                
                <Button asChild variant="secondary">
                  <Link to="/register" className="flex items-center">Registro</Link>
                </Button>
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
          <div className="md:hidden fixed left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
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
                  <Button 
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="w-full mt-2"
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="default" className="w-full mt-2">
                    <Link to="/login" className="flex items-center justify-center" onClick={closeMenu}>
                      Iniciar Sesión
                    </Link>
                  </Button>                
                  <Button asChild variant="secondary" className="w-full mt-2">
                    <Link to="/register" className="flex items-center justify-center" onClick={closeMenu}>
                      Registro
                    </Link>
                  </Button>
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