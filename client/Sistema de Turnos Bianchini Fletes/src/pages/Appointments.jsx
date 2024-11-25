// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import Calendar from '../components/Calendar';
import { format, startOfToday } from 'date-fns';
import axiosInstance from '../axioConfig';
import { Toaster, toast } from 'sonner';

const INITIAL_CENTER = { lat: -34.6037, lng: -58.3816 };
const INITIAL_ZOOM = 12;

const libraries = ['places', 'directions'];

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
  // eslint-disable-next-line no-unused-vars
  const [directionsResponse, setDirectionsResponse] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    language: 'es',
    region: 'AR'
  });

  const mapOptions = useMemo(() => ({
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: true,
  }), []);

  const clearMap = useCallback(() => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    setDirectionsResponse(null);
    setDistance(null);
    setDuration(null);
  }, []);

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
        toast.error('Error al obtener los precios');
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
    clearMap();
  };

  const calculateRoute = useCallback(async () => {
    if (!window.google || !appointmentData.start_address || !appointmentData.end_address || !mapRef.current) {
      clearMap();
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: appointmentData.start_address + ', Argentina',
        destination: appointmentData.end_address + ', Argentina',
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      clearMap();

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#1E90FF',
          strokeOpacity: 0.8,
          strokeWeight: 5
        }
      });
      directionsRendererRef.current.setDirections(results);
      directionsRendererRef.current.setMap(mapRef.current);

      setDirectionsResponse(results);
      
      if (results.routes[0].bounds) {
        const bounds = results.routes[0].bounds;
        mapRef.current.fitBounds(bounds);
        
        const leg = results.routes[0].legs[0];
        setDistance(leg.distance.value);
        setDuration(leg.duration.text);

        // Add markers for start and end points
        const startMarker = new window.google.maps.Marker({
          position: leg.start_location,
          map: mapRef.current,
          title: 'Inicio'
        });
        const endMarker = new window.google.maps.Marker({
          position: leg.end_location,
          map: mapRef.current,
          title: 'Destino'
        });
        markersRef.current = [startMarker, endMarker];
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Error al calcular la ruta');
      clearMap();
    }
  }, [appointmentData.start_address, appointmentData.end_address, clearMap]);

  useEffect(() => {
    if (isLoaded && appointmentData.start_address && appointmentData.end_address) {
      calculateRoute();
    }
  }, [isLoaded, calculateRoute, appointmentData.start_address, appointmentData.end_address]);

  const handleDaySelect = (day, modifiers) => {
    if (modifiers.selected) return;
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
      toast.error('Error al obtener horarios disponibles');
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
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear turno. Por favor, intente de nuevo.');
    }
  };

  // const formatDurationForDisplay = (duration) => {
  //   const [hours, minutes] = duration.split(':');
  //   return `${parseInt(hours)}h ${parseInt(minutes)}min`;
  // };

  if (loadError) {
    return <div>Error al cargar Google Maps</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4">Programador de Citas</h1>
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
                Seleccione una hora para {format(selectedDay, 'MMMM d, yyyy')}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {noSlotsAvailable ? (
                  <p className="text-red-500">No hay citas disponibles para este día</p>
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
            <h2 className="text-xl font-semibold mb-2">Detalles de la Cita</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="username" value={username} />
              <div>
                <label htmlFor="start_address" className="block text-sm font-medium text-gray-700">Dirección de Inicio</label>
                <input
                  type="text"
                  id="start_address"
                  name="start_address"
                  value={appointmentData.start_address}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Calle número, provincia/localidad"
                />
              </div>
              <div>
                <label htmlFor="end_address" className="block text-sm font-medium text-gray-700">Dirección de Destino</label>
                <input
                  type="text"
                  id="end_address"
                  name="end_address"
                  value={appointmentData.end_address}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Calle número, provincia/localidad"
                />
              </div>
              <div style={{ height: '400px', width: '100%' }}>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    center={mapCenter}
                    zoom={INITIAL_ZOOM}
                    options={mapOptions}
                    onLoad={(map) => {
                      mapRef.current = map;
                    }}
                  >
                    {/* No need to render DirectionsRenderer or Markers here */}
                  </GoogleMap>
                ) : (
                  <div>Cargando mapa...</div>
                )}
              </div>
              {distance && duration && (
                <div>
                  <p>Distancia: {(distance / 1000).toFixed(2)} km</p>
                  <p>Tiempo estimado de viaje: {duration}</p>
                </div>
              )}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={appointmentData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Ingrese una descripción"
                />
              </div>
              <div>
                <label htmlFor="stairs" className="block text-sm font-medium text-gray-700">Escaleras</label>
                <input
                  type="number"
                  id="stairs"
                  name="stairs"
                  value={appointmentData.stairs}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Ingrese el número de escaleras"
                />
              </div>
              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700">Personal Extra</label>
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
                <p className="text-lg font-semibold">Precio Estimado: ${estimatedPrice.toFixed(2)}</p>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                Reservar Turno
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;

