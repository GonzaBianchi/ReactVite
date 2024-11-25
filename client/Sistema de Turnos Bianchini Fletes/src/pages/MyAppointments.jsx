/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axiosInstance from '../axioConfig.js';
import { Toaster, toast } from 'sonner'

const EditAppointmentModal = ({ 
  appointment, 
  isOpen, 
  onClose, 
  onUpdateAppointment 
}) => {
  const [formData, setFormData] = useState({
    day: appointment.day,
    schedule: appointment.schedule.split(':').slice(0, 2).join(':'),
    start_address: appointment.start_address,
    end_address: appointment.end_address,
    duration: appointment.duration.split(':').slice(0, 2).join(':'),
    cost: appointment.cost,
    stairs: appointment.stairs,
    distance: appointment.distance,
    staff: appointment.staff,
    description: appointment.description
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/appointment/${appointment.id}`, formData);
      
      if (response.status === 200) {
        toast.success('Turno actualizado exitosamente');
        onUpdateAppointment(appointment.id, formData);
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar el turno:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar el turno');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Editar Turno</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Fecha</label>
            <input 
              type="date" 
              name="day"
              value={formData.day}
              onChange={handleChange}
              required 
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Hora</label>
            <input 
              type="time" 
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              required 
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Dirección de Inicio</label>
            <input 
              type="text" 
              name="start_address"
              value={formData.start_address}
              onChange={handleChange}
              required 
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Dirección de Fin</label>
            <input 
              type="text" 
              name="end_address"
              value={formData.end_address}
              onChange={handleChange}
              required 
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Duración (horas)</label>
            <input 
              type="time" 
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required 
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Descripción</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <div className="flex justify-between">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MisTurnos = ({ username }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Estado para manejar mensajes
  const [user, setUser] = useState(username || ''); // Si el username viene como prop, úsalo; si no, inicializa vacío
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleUpdateAppointment = (id, updatedData) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id 
          ? { ...app, ...updatedData } 
          : app
      )
    );
  };

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
      const response = await axiosInstance.put(`/appointment/user/${id}`);
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

  const canEditAppointment = (appointmentDate) => {
    const appointmentDateTime = new Date(appointmentDate);
    const now = new Date();
    
    // Calcula la diferencia en horas
    const hoursDifference = (appointmentDateTime - now) / (1000 * 60 * 60);
    
    // Retorna true si faltan más de 48 horas para el turno
    return hoursDifference > 48;
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
                  <td className="px-4 py-2 text-center">
                    {new Date(appointment.day).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-center">
                    {appointment.schedule.split(':').slice(0, 2).join(':')}
                  </td>
                  <td className="px-4 py-2 text-center">{appointment.cost}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex space-x-2 justify-center">
                    {canEditAppointment(appointment.day) && (
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="bg-blue-500 text-white px-4 py-2 rounded w-fit"
                      >
                        Editar
                      </button>
                    )}
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded w-fit"
                      >
                        Cancelar turno
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateAppointment={handleUpdateAppointment}
        />
      )}
    </div>
  );
};

export default MisTurnos;
