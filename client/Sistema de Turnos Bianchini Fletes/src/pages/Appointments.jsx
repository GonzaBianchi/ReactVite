// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import Calendar from '../components/Calendar';
import { format, startOfToday } from 'date-fns';
import axiosInstance from '../axioConfig';
import { Toaster, toast } from 'sonner';
import { debounce } from 'lodash';

const INITIAL_CENTER = { lat: -34.6037, lng: -58.3816 };
const INITIAL_ZOOM = 12;

const libraries = ['places'];

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
    has_elevator: false,
    furniture_fits_elevator: false,
    stairs: 0,
    description: '',
    staff: false,
  });
  const [prices, setPrices] = useState({ Hour: 0, Escaleras: 0, 'Personal extra': 0, Distancia: 0 });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  // eslint-disable-next-line no-unused-vars
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const markersRef = useRef([]);

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
    console.log('Iniciando limpieza del mapa');
    
    // Limpiar el renderer actual y sus polylines
    if (directionsRendererRef.current) {
      console.log('Limpiando DirectionsRenderer');
      // Primero limpiar las direcciones
      directionsRendererRef.current.setDirections({ routes: [] });
      // Luego remover del mapa
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
  
    // Limpiar los marcadores
    if (markersRef.current && markersRef.current.length > 0) {
      console.log('Limpiando marcadores:', markersRef.current.length);
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }
  
    // Resetear estados
    setDirectionsResponse(null);
    setDistance(null);
    setDuration(null);
    console.log('Limpieza completa');
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
    const stairsPrice = appointmentData.stairs * prices.Escaleras || 0;
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
  
    console.log('Calculando nueva ruta');
    // Limpiar el mapa antes de calcular la nueva ruta
    clearMap();
  
    const directionsService = new window.google.maps.DirectionsService();
    
    try {
      const results = await directionsService.route({
        origin: appointmentData.start_address + ', Argentina',
        destination: appointmentData.end_address + ', Argentina',
        travelMode: window.google.maps.TravelMode.DRIVING
      });
  
      console.log('Nueva ruta calculada');
  
      // Crear nuevo DirectionsRenderer
      const newRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#1E90FF',
          strokeOpacity: 0.8,
          strokeWeight: 5
        }
      });
  
      // Asignar el nuevo renderer
      directionsRendererRef.current = newRenderer;
      newRenderer.setMap(mapRef.current);
      newRenderer.setDirections(results);
      
      setDirectionsResponse(results);
      
      if (results.routes[0].bounds) {
        const bounds = results.routes[0].bounds;
        mapRef.current.fitBounds(bounds);
        
        const leg = results.routes[0].legs[0];
        setDistance(leg.distance.value);
        setDuration(leg.duration.text);
  
        // Actualizar marcadores
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
        console.log('Marcadores actualizados');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Error al calcular la ruta');
      clearMap();
    }
  }, [appointmentData.start_address, appointmentData.end_address, clearMap]);

  const debouncedCalculateRoute = useMemo(
    () => debounce(calculateRoute, 1000),
    [calculateRoute]
  );

  useEffect(() => {
    if (isLoaded && appointmentData.start_address && appointmentData.end_address) {
      debouncedCalculateRoute.cancel(); // Cancela cualquier cálculo pendiente
      debouncedCalculateRoute();
    }
    return () => {
      debouncedCalculateRoute.cancel();
      clearMap();
    };
  }, [isLoaded, debouncedCalculateRoute, appointmentData.start_address, appointmentData.end_address, clearMap]);

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

    const appointment = {
      ...appointmentData,
      username,
      day: format(selectedDay, 'yyyy-MM-dd'),
      schedule: selectedTime,
      distance: distance ? distance / 1000 : null,
      duration: duration,
      cost: estimatedPrice,
    };
    console.log('Appointment data:', appointment);
    try {

      const response = await axiosInstance.post('/appointment', appointment);
      console.log('Appointment created:', response.data);
      toast.success('Turno creado exitosamente');
      setShowForm(false);
      setSelectedDay(undefined);
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
    return <div>Error al cargar Google Maps: {loadError.message}</div>;
  }


  return (
    <div className="container mx-auto p-4 dark:text-primary">
  <Toaster position="bottom-right" closeButton richColors />
  <h1 className="text-2xl font-bold mb-4">Programador de Citas</h1>
  
  {/* Contenedor para el calendario y los horarios */}
  <div className="flex flex-col md:flex-row gap-4 mb-4">
    {/* Columna del calendario */}
    <div className="w-full md:w-1/2">
      <Calendar
        selectedDay={selectedDay}
        handleDaySelect={handleDaySelect}
        disabledDays={[{ before: startOfToday() }]}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
    </div>
    
    {/* Columna de los horarios */}
    <div className="w-full md:w-1/2">
      {selectedDay && (
        <div className="bg-white rounded-lg shadow p-4 dark:bg-background dark:border">
          <h2 className="text-xl font-semibold mb-2 dark:text-primary">
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
                      ? 'bg-primary text-white dark:bg-transparent dark:text-primary dark:border dark:border-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-primary-foreground dark:text-primary dark:hover:border-white'
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
  </div>
  
  {/* Formulario debajo del calendario y horarios */}
  {showForm && (
    <div className="bg-white rounded-lg shadow p-4 dark:bg-background dark:border dark:border-white dark:text-primary">
      <h2 className="text-xl font-semibold mb-2">Detalles de la Cita</h2>
      <form onSubmit={handleSubmit} className="space-y-4 dark:text-primary">
        <input type="hidden" name="username" value={username} />
        <div>
          <label htmlFor="start_address" className="block text-sm font-medium text-gray-700 dark:text-primary">Dirección de Inicio</label>
          <input
            type="text"
            id="start_address"
            name="start_address"
            value={appointmentData.start_address}
            onChange={handleAddressChange}
            required
            className="mt-1 block w-full rounded-md p-2 border dark:bg-transparent dark:border dark:border-white"
            placeholder="Calle número, provincia/localidad"
          />
        </div>
        <div>
          <label htmlFor="end_address" className="block text-sm font-medium text-gray-700 dark:text-primary">Dirección de Destino</label>
          <input
            type="text"
            id="end_address"
            name="end_address"
            value={appointmentData.end_address}
            onChange={handleAddressChange}
            required
            className="mt-1 block w-full rounded-md p-2 border dark:bg-transparent dark:border dark:border-white"
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
              {/* {directionsResponse && (
                <DirectionsRenderer
                  directions={directionsResponse}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#1E90FF',
                      strokeOpacity: 0.8,
                      strokeWeight: 5
                    }
                  }}
                />
              )} */}
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-primary">Descripción de los muebles a transportar</label>
          <textarea
            id="description"
            name="description"
            value={appointmentData.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md p-2 dark:bg-transparent border dark:border dark:border-white"
            placeholder="Ingrese una descripción de los muebles con respecto a cantidad y tamaño a transportar en el flete"
          />
        </div>
        <div className='flex items-start mb-2'>
          <input
            type="checkbox"
            id="has_elevator"
            name="has_elevator"
            checked={appointmentData.has_elevator}
            onChange={handleChange}
            className="mt-1 block"
          />
          <label htmlFor="has_elevator" className="block text-sm font-medium text-gray-700 dark:text-primary ml-1">¿Tiene ascensor?</label>
        </div>

        {appointmentData.has_elevator && (
          <div className='flex items-start mb-2'>
            <input
              type="checkbox"
              id="furniture_fits_elevator"
              name="furniture_fits_elevator"
              checked={appointmentData.furniture_fits_elevator}
              onChange={handleChange}
              className="mt-1 block"
            />
            <label htmlFor="furniture_fits_elevator" className="block text-sm font-medium text-gray-700 dark:text-primary ml-1">¿Los muebles caben en el ascensor?</label>
          </div>
        )}

        {(!appointmentData.has_elevator || !appointmentData.furniture_fits_elevator) && (
          <div>
            <label htmlFor="stairs" className="block text-sm font-medium text-gray-700 dark:text-primary">Número de escaleras a subir</label>
            <input
              type="number"
              id="stairs"
              name="stairs"
              value={appointmentData.stairs}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md shadow-sm p-2 border dark:bg-transparent dark:border dark:border-white"
              placeholder="Ingrese el número de escaleras"
            />
          </div>
        )}
        <div className='flex items-start'>
          <input
            type="checkbox"
            id="staff"
            name="staff"
            checked={appointmentData.staff}
            onChange={handleChange}
            className="mt-1 block"
          />
          <label htmlFor="staff" className="block text-sm font-medium text-gray-700 dark:text-primary ml-1">Desea personal para carga/descarga?</label>
        </div>
        <div>
          <p className="text-lg font-semibold">Precio Estimado: ${estimatedPrice.toFixed(2)}</p>
        </div>
        <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md dark:bg-primary-foreground">
          Reservar Turno
        </button>
      </form>
    </div>
  )}
</div>
  );
};

export default Appointments;

