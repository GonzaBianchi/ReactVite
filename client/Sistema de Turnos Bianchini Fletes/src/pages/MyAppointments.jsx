/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import axiosInstance from '../axioConfig.js';
import EditAppointmentModal from '../components/EditAppointmentModal.jsx';

const MyAppointments = ({ username }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(username || '');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUsername = async () => {
    try {
      const response = await axiosInstance.get('/session/username');
      setUser(response.data.username);
    } catch (error) {
      console.error('Error fetching username:', error);
      setError('No se pudo obtener el username');
    }
  };

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get(`/appointment/user/${user}`);
      console.log(response.data);

      if (response.data.message) {
        setMessage(response.data.message);
        toast.success(response.data.message);
        setAppointments([]);
      } else {
        setAppointments(response.data.appointments);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error fetching appointments. Please try again.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!username) {
      fetchUsername();
    }
  }, [username]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleUpdateAppointment = async (id, updatedData) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id 
          ? { ...app, ...updatedData } 
          : app
      )
    );
    // Fetch appointments after update to ensure data consistency
    await fetchAppointments();
  };

  const handleDeleteAppointment = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas cancelar este turno?');

    if (!confirmDelete) {
      return;
    }
    try {
      const response = await axiosInstance.put(`/appointment/user/${id}`);
      if (response.status === 200) {
        setAppointments(prevAppointments => prevAppointments.filter(a => a.id !== id));
        toast.success('Turno eliminado exitosamente');
        
        if (appointments.length === 1) {
          setMessage('No tienes turnos reservados');
        }
        // Fetch appointments after deletion to ensure data consistency
        await fetchAppointments();
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
    
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDifference > 48;
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4">Turnos de {user}</h1>

      {message ? (
        <p className="text-center text-gray-500">{message}</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-500">No tienes turnos reservados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-center text-gray-700">Fecha</th>
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

export default MyAppointments;

