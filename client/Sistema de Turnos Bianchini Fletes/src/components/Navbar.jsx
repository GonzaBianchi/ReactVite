import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axiosInstance from '../axioConfig'; // Importa la instancia de Axios

// eslint-disable-next-line react/prop-types
const Navbar = ({ isAuthenticated, role, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/session/logout'); // Hacer una solicitud para cerrar sesión
      Cookies.remove('access_token'); // Eliminar la cookie de acceso
      Cookies.remove('refresh_token'); // Eliminar el refresh token si es necesario
      setIsAuthenticated(false); // Actualizar el estado de autenticación
      localStorage.setItem('isAuthenticated', 'false');
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Mi App</Link>
        <div>
          <Link to="/" className="mr-4">Home</Link>
          {isAuthenticated ? (
            <>
              {role === 'admin' ? (
                <Link to="/panel-admin" className="mr-4">Panel Admin</Link>
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
