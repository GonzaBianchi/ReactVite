import { useState, useEffect } from 'react';
import axiosInstance from '../axioConfig';

// eslint-disable-next-line react/prop-types
const MisTurnos = ({ username }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get(`/appointment/${username}`);
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Error fetching appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [username]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Turnos de {username}</h1>
      
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No tienes turnos reservados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-gray-700">Hora</th>
                <th className="px-4 py-2 text-left text-gray-700">Servicio</th>
                <th className="px-4 py-2 text-left text-gray-700">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-gray-200">
                  <td className="px-4 py-2">{new Date(appointment.day).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{appointment.schedule}</td>
                  <td className="px-4 py-2">{appointment.description || 'No description available'}</td>
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
