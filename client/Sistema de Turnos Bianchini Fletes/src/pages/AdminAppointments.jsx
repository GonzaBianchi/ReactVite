import { useState, useEffect } from 'react'
import axiosInstance from '../axioConfig.js'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchAppointments = async (date) => {
    setLoading(true);
    setMessage(null);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`appointment/day/${formattedDate}`);
      if (response.status === 200) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
        setMessage('No se encontraron turnos para el día seleccionado.');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setAppointments([]);
        setMessage('No se encontraron turnos para el día seleccionado.');
      } else {
        setMessage('Error al obtener los turnos. Por favor, intente nuevamente.');
        console.error('Error fetching appointments:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleCancelAppointment = async (appointmentId) => {
    // Implementar lógica para cancelar el turno
    console.log('Cancelar turno:', appointmentId);
  };

  const handleAddVan = async (appointmentId) => {
    // Implementar lógica para agregar van al turno
    console.log('Agregar van al turno:', appointmentId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bienvenido a la gestión de turnos, Administrador</h1>
      
      <div className="mb-4">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="p-2 border rounded"
        />
      </div>

      {loading && <p>Cargando turnos...</p>}
      {message && <p className="text-blue-500">{message}</p>}

      {appointments.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Apellido</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Conductor</th>
              <th className="border p-2">Día</th>
              <th className="border p-2">Horario</th>
              <th className="border p-2">Dirección inicial</th>
              <th className="border p-2">Dirección final</th>
              <th className="border p-2">Duración</th>
              <th className="border p-2">Costo</th>
              <th className="border p-2">Escaleras</th>
              <th className="border p-2">Distancia</th>
              <th className="border p-2">Personal</th>
              <th className="border p-2">Descripción</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={index}>
                <td className="border p-2">{appointment.first_name}</td>
                <td className="border p-2">{appointment.last_name}</td>
                <td className="border p-2">{appointment.state_name}</td>
                <td className="border p-2">{appointment.driver_name || 'N/A'}</td>
                <td className="border p-2">{appointment.day}</td>
                <td className="border p-2">{appointment.schedule}</td>
                <td className="border p-2">{appointment.start_address}</td>
                <td className="border p-2">{appointment.end_address}</td>
                <td className="border p-2">{appointment.duration}</td>
                <td className="border p-2">{appointment.cost}</td>
                <td className="border p-2">{appointment.stairs}</td>
                <td className="border p-2">{appointment.distance}</td>
                <td className="border p-2">{appointment.staff}</td>
                <td className="border p-2">{appointment.description}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleCancelAppointment(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAddVan(index)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Agregar Van
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAppointments;