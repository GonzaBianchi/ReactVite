import { useState, useEffect } from 'react'
import axiosInstance from '../axioConfig.js'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Toaster, toast } from 'sonner'

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [showModalVans, setShowModalVans] = useState(false)
  const [availableVans, setAvailableVans] = useState([]);
  const [selectedVan, setSelectedVan] = useState(null);


  const fetchAppointments = async (date) => {
    setLoading(true);
    setMessage(null);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`appointment/day/${formattedDate}`);
      if (response.status === 200) {
        setAppointments(response.data);
        toast.success('Turnos obtenidos correctamente');
      } else {
        setAppointments([]);
        setMessage('No se encontraron turnos para el día seleccionado.');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setAppointments([]);
        setMessage('No se encontraron turnos para el día seleccionado.');
        toast.error(err.response.data.error);
      } else {
        console.error('Error fetching appointments:', err);
        toast.error('Error al obtener los turnos. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => {
    const today = new Date();
    if (date >= today) {
      setSelectedDate(date);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    // Implementar lógica para cancelar el turno
    console.log('Cancelar turno:', appointment);
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModalDetails(true);
  };
  
  const handleAddVan = async (appointment) => {
    await fetchAvailableVans();
    setSelectedAppointment(appointment);
    setShowModalVans(true);
  };

  const fetchAvailableVans = async () => {
    try {
      const response = await axiosInstance.get('van/available');
      setAvailableVans(response.data.vans);
    } catch (error) {
      console.error('Error al obtener las camionetas disponibles:', error);
      setMessage('Error al obtener las camionetas disponibles. Por favor, intente nuevamente.');
    }
  };

  const handleSelectVan = (van) => {
    setSelectedVan(van);
  };

  const handleAssignVan = async () => {
    try {
      await axiosInstance.put(`appointment/${selectedAppointment.id}`, {
        id_van: selectedVan.id
      });
      setShowModalVans(false);
      setSelectedVan(null);
      // Actualizar el estado del turno en la lista de turnos
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === selectedAppointment.id) {
          return { ...appointment, id_van: selectedVan.id };
        }
        return appointment;
      });
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error al asignar la camioneta al turno:', error);
      setMessage('Error al asignar la camioneta al turno. Por favor, intente nuevamente.');
      toast.error('Error al asignar la camioneta al turno. Por favor, intente nuevamente.')
    }
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    if (showModalVans){
      setShowModalVans(false);
    } else {
      setShowModalDetails(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4">Bienvenido a la gestión de turnos, Administrador</h1>

      <div className="mb-4">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="p-2 border rounded"
          minDate={new Date()}
        />
      </div>

      {loading && <p>Cargando turnos...</p>}
      {message && <p className="text-blue-500">{message}</p>}

      {appointments.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Nombre</th>
              <th className="border p-2 text-center">Conductor</th>
              <th className="border p-2 text-center">Horario</th>
              <th className="border p-2 text-center">Dirección inicial</th>
              <th className="border p-2 text-center">Dirección final</th>
              <th className="border p-2 text-center">Costo estimado</th>
              <th className="border p-2 text-center">Piso</th>
              <th className="border p-2 text-center">Personal</th>
              <th className="border p-2 text-center">Estado</th>
              <th className="border p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={index}>
                <td className="border p-2 text-center">{appointment.first_name} {appointment.last_name}</td>
                <td className="border p-2 text-center">{appointment.driver_name || 'N/A'}</td>
                <td className="border p-2 text-center">
                  {appointment.schedule.split(':').slice(0, 2).join(':')}
                </td>
                <td className="border p-2 text-center">{appointment.start_address}</td>
                <td className="border p-2 text-center">{appointment.end_address}</td>
                <td className="border p-2 text-center">${appointment.cost}</td>
                <td className="border p-2 text-center">{appointment.stairs}</td>
                <td className="border p-2 text-center">
                  {appointment.staff ? 'Si' : 'No'}
                </td>
                <td className="border p-2 text-center">{appointment.state_name}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleViewAppointment(appointment)}
                    className="bg-orange-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Ver detalles
                  </button>
                  {appointment.driver_name ? (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleAddVan(selectedAppointment)}
                    >
                      Cambiar Van     
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleAddVan(selectedAppointment)}
                    >
                      Agregar Van
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelAppointment(appointment)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedAppointment && showModalDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg rounded-lg w-3/4 max-h-3/4 overflow-auto">
            <div className="px-6 py-4 border-b">
              <h2 className="text-2xl font-bold">Detalles del turno</h2>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p><strong>Nombre:</strong> {selectedAppointment.first_name} {selectedAppointment.last_name}</p>
                <p><strong>Conductor:</strong> {selectedAppointment.driver_name || 'N/A'}</p>
                <p><strong>Horario:</strong> {selectedAppointment.schedule}</p>
              </div>
              <div>
                <p><strong>Dirección inicial:</strong> {selectedAppointment.start_address}</p>
                <p><strong>Dirección final:</strong> {selectedAppointment.end_address}</p>
                <p><strong>Costo estimado:</strong> ${selectedAppointment.cost}</p>
                <p><strong>Piso:</strong> {selectedAppointment.stairs}</p>
                <p><strong>Personal:</strong> {selectedAppointment.staff ? 'Si' : 'No'}</p>
                <p><strong>Estado:</strong> {selectedAppointment.state_name}</p>
              </div>
              <div>
                <p><strong>Descripción:</strong> {selectedAppointment.description}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              {selectedAppointment.driver_name ? (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleAddVan(selectedAppointment)}
                >
                  Cambiar Van     
                </button>
              ) : (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleAddVan(selectedAppointment)}
                >
                  Agregar Van
                </button>
              )}
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {showModalVans && selectedAppointment && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg rounded-lg w-3/4 max-h-3/4 overflow-auto">
            <div className="px-6 py-4 border-b">
              <h2 className="text-2xl font-bold">Seleccionar van</h2>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Camionetas disponibles:</h3>
              <ul className='grid grid-cols-3 gap-4 overflow-y-scroll h-96'>
                {availableVans.map((van) => (
                  <li
                    key={van.id}
                    className={`p-2 rounded cursor-pointer ${
                      selectedVan?.id === van.id ? 'bg-gray-200' : ''
                    }`}
                    onClick={() => handleSelectVan(van)}
                  >
                    {van.driver_name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              {!selectedAppointment.id_van && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleAssignVan()}
                >
                  Agregar Van
                </button>
              )}
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;