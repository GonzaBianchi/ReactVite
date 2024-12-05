// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import axiosInstance from '../axioConfig.js';
import EditAppointmentModal from '../components/EditAppointmentModal.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// eslint-disable-next-line react/prop-types
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
    return <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Turnos de {user}</h1>

      {message ? (
        <p className="text-center text-gray-500 dark:text-gray-400">{message}</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No tienes turnos reservados</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Fecha</TableHead>
                <TableHead className="text-center">Hora</TableHead>
                <TableHead className="text-center">Costo estimado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="text-center">
                    {new Date(appointment.day).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {appointment.schedule.split(':').slice(0, 2).join(':')}
                  </TableCell>
                  <TableCell className="text-center">{appointment.cost}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex space-x-2 justify-center">
                    {canEditAppointment(appointment.day) && (
                      <Button
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        Editar
                      </Button>
                    )}
                      <Button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        variant="destructive"
                      >
                        Cancelar turno
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

