import { useState, useEffect } from 'react';
import axiosInstance from '../axioConfig.js';
import { Toaster, toast } from 'sonner'
// eslint-disable-next-line react/prop-types
const MisTurnos = ({ username }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Estado para manejar mensajes
  const [user, setUser] = useState(username || ''); // Si el username viene como prop, úsalo; si no, inicializa vacío

  // Función para obtener el username del servidor si no está disponible
  const fetchUsername = async () => {
    try {
      const response = await axiosInstance.get('/session/username');
      setUser(response.data.username); // Almacena el username obtenido
    } catch (error) {
      console.error('Error fetching username:', error);
      setError('No se pudo obtener el username');
    }
  };

  // Obtener el username si no viene como prop
  useEffect(() => {
    if (!username) {
      fetchUsername(); // Si no hay username como prop, se obtiene del backend
    }
  }, [username]);

  useEffect(() => {
    if (!user) return; // Espera a que se obtenga el username

    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get(`/appointment/user/${user}`);
        console.log(response.data);

        // Si hay un mensaje, manejarlo como estado
        if (response.data.message) {
          setMessage(response.data.message); // Establece el mensaje en el estado
          toast.success(response.data.message); // Mostrar mensaje en toast
          setAppointments([]); // Vacía la lista de citas
        } else {
          setAppointments(response.data.appointments); // Establece las citas
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Error fetching appointments. Please try again.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }


  const handleDeleteAppointment = async (id) => {

    const confirmDelete = window.confirm('¿Estás seguro de que deseas cancelar este turno?');

    if (!confirmDelete) {
      // Si el usuario cancela, salir de la función
      return;
    }
    try {
      const response = await axiosInstance.delete(`/appointment/user/${id}`);
      if (response.status === 200) {
        setAppointments(prevAppointments => prevAppointments.filter(a => a.id !== id));
        toast.success('Turno eliminado exitosamente');
        
        // Si era el último turno, actualizar el mensaje
        if (appointments.length === 1) {
          setMessage('No tienes turnos reservados');
        }
      } else {
        toast.error('Error al eliminar el turno. Por favor, intente de nuevo.');
      }
    } catch (error) {
      console.error('Error al eliminar el turno:', error);
      toast.error('Error al eliminar el turno. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4">Turnos de {user}</h1>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : message ? (
        <p className="text-center text-gray-500">{message}</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-500">No tienes turnos reservados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-center text-gray-700 ">Fecha</th>
                <th className="px-4 py-2 text-center text-gray-700">Hora</th>
                <th className="px-4 py-2 text-center text-gray-700">Costo estimado</th>
                <th className="px-4 py-2 text-center text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-gray-200">
                <td className="px-4 py-2 text-center">{new Date(appointment.day).toLocaleDateString()}</td>
                <td className="p-2 text-center">
                  {appointment.schedule.split(':').slice(0, 2).join(':')}
                </td>
                  <td className="px-4 py-2 text-center">{appointment.cost}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded w-fit">
                      Cancelar turno
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisTurnos;
