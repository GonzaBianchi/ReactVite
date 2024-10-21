import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Calendar from '../components/Calendar.jsx';
import { format, startOfToday } from 'date-fns';
import axiosInstance from '../axioConfig.js';
import { Toaster, toast } from 'sonner'

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom hook to update map view
// eslint-disable-next-line react/prop-types
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// eslint-disable-next-line react/prop-types
const Appointments = ({ username }) => {
  const [selectedDay, setSelectedDay] = useState(undefined);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [noSlotsAvailable, setNoSlotsAvailable] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    start_address: '',
    end_address: '',
    stairs: '',
    description: '',
    staff: false,
  });
  const [prices, setPrices] = useState({ Hour: 0, Escaleras: 0, 'Personal extra': 0, Distancia: 0 });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axiosInstance.get('/prices');
        const pricesData = response.data.prices.reduce((acc, price) => {
          acc[price.service_name] = parseFloat(price.price);
          return acc;
        }, {});
        setPrices(pricesData);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
    fetchPrices();
  }, []);

  const calculatePrice = useCallback(() => {
    const basePrice = prices.Hour;
    const stairsPrice = parseInt(appointmentData.stairs, 10) * prices.Escaleras || 0;
    const staffPrice = appointmentData.staff ? prices['Personal extra'] : 0;
    const distancePrice = distance ? (distance / 1000) * prices.Distancia : 0;
    
    const total = basePrice + stairsPrice + staffPrice + distancePrice;
    setEstimatedPrice(Math.round(total * 100) / 100);
  }, [appointmentData, prices, distance]);

  useEffect(() => {
    calculatePrice();
  }, [appointmentData, prices, distance, calculatePrice]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  const calculateRoute = useCallback(async () => {
    if (!appointmentData.start_address || !appointmentData.end_address) return;

    const start = await geocodeAddress(appointmentData.start_address);
    const end = await geocodeAddress(appointmentData.end_address);

    if (start && end) {
      setMarkers([
        { position: start, popup: 'Start' },
        { position: end, popup: 'End' }
      ]);

      // Calculate center point
      const centerLat = (start[0] + end[0]) / 2;
      const centerLng = (start[1] + end[1]) / 2;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(12);

      // Calculate distance (this is a simple straight-line distance)
      const distanceInMeters = L.latLng(start).distanceTo(L.latLng(end));
      setDistance(distanceInMeters);

      const durationInMinutes = Math.round(distanceInMeters / 833.33); // Assuming 50 km/h average speed
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
  }, [appointmentData.start_address, appointmentData.end_address]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const handleDaySelect = (day, modifiers) => {
    if (modifiers.selected) {
      return;
    }
    setSelectedDay(day);
    setSelectedTime(null);
    setShowForm(false);
    fetchAvailableTimes(day);
    
    if (day.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(day);
    }
  };

  const fetchAvailableTimes = async (day) => {
    const formattedDate = format(day, 'yyyy-MM-dd');

    try {
      const response = await axiosInstance.get(`/appointment/available-times/${formattedDate}`);
      if (response.data.availableTimes.length > 0) {
        setAvailableTimeSlots(response.data.availableTimes);
        setNoSlotsAvailable(false);
      } else {
        setAvailableTimeSlots([]);
        setNoSlotsAvailable(true);
      }
    } catch (error) {
      console.error('Error fetching available time slots:', error);
    }
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const appointment = {
        ...appointmentData,
        username,
        day: format(selectedDay, 'yyyy-MM-dd'),
        schedule: selectedTime,
        distance: distance ? distance / 1000 : null,
        duration: duration,
        cost: estimatedPrice,
      };

      const response = await axiosInstance.post('/appointment', appointment);
      console.log('Appointment created:', response.data);
      toast.success('Turno creado exitosamente');
      setShowForm(false);
      // Add some user feedback here (e.g., success message)
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear turno. Por favor, intente de nuevo.');
      // Add some user feedback here (e.g., error message)
    }
  };

  const formatDurationForDisplay = (duration) => {
    const [hours, minutes] = duration.split(':');
    return `${parseInt(hours)}h ${parseInt(minutes)}min`;
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4">Appointment Scheduler</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Calendar
            selectedDay={selectedDay}
            handleDaySelect={handleDaySelect}
            disabledDays={[{ before: startOfToday() }]}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
          {selectedDay && (
            <div className="bg-white rounded-lg shadow p-4 mt-4">
              <h2 className="text-xl font-semibold mb-2">
                Select a Time for {format(selectedDay, 'MMMM d, yyyy')}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {noSlotsAvailable ? (
                  <p className="text-red-500">No appointments available for this day</p>
                ) : (
                  availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeClick(time)}
                      className={`py-2 px-4 rounded-md ${
                        selectedTime === time
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {showForm && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Appointment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="username" value={username} />
              <div>
                <label htmlFor="start_address" className="block text-sm font-medium text-gray-700">Start Address</label>
                <input
                  type="text"
                  id="start_address"
                  name="start_address"
                  value={appointmentData.start_address}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Enter start address"
                />
              </div>
              <div>
                <label htmlFor="end_address" className="block text-sm font-medium text-gray-700">End Address</label>
                <input
                  type="text"
                  id="end_address"
                  name="end_address"
                  value={appointmentData.end_address}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Enter end address"
                />
              </div>
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                  <ChangeView center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {markers.map((marker, index) => (
                    <Marker key={index} position={marker.position}>
                      <Popup>{marker.popup}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              {distance && duration && (
                <div>
                  <p>Distance: {(distance / 1000).toFixed(2)} km</p>
                  <p>Estimated travel time: {formatDurationForDisplay(duration)}</p>
                </div>
              )}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={appointmentData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label htmlFor="stairs" className="block text-sm font-medium text-gray-700">Stairs</label>
                <input
                  type="number"
                  id="stairs"
                  name="stairs"
                  value={appointmentData.stairs}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Enter number of stairs"
                />
              </div>
              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700">Extra Staff</label>
                <input
                  type="checkbox"
                  id="staff"
                  name="staff"
                  checked={appointmentData.staff}
                  onChange={handleChange}
                  className="mt-1 block"
                />
              </div>
              <div>
                <p className="text-lg font-semibold">Estimated Price: ${estimatedPrice.toFixed(2)}</p>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                Book Appointment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;