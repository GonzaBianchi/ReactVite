/* eslint-disable react/prop-types */
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axioConfig'
import logo from '../assets/logo.webp';


const Navbar = ({ 
    isAuthenticated, 
    role, 
    setIsAuthenticated, 
    setRole, 
    setUsername 
  }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        await axiosInstance.post('/session/logout');
        
        setIsAuthenticated(false);
        setRole('');
        setUsername('');
        
        navigate('/');
      } catch (error) {
        console.error('Error al cerrar sesión', error);
      }
    };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          <img src={logo} alt="logo" className="h-14 rounded" />
        </Link>
        <div>
          <Link to="/" className="mr-4">Home</Link>
          {isAuthenticated ? (
            <>
              {role === 'admin' ? (
                <>
                  <Link to="/panel-admin" className="mr-4">Panel Admin</Link>
                  <Link to="/panel-admin-turnos" className="mr-4">Administrar Turnos</Link>
                </>
              ) : (
                <>
                  <Link to="/turnero" className="mr-4">Turnero</Link>
                  <Link to="/mis-turnos" className="mr-4">Mis Turnos</Link>
                  <Link to="/profile" className="mr-4">Perfil</Link>
                </>
              )}
              <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">Login</Link>
              <Link to="/register" className="bg-blue-500 px-4 py-2 rounded">Registro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;