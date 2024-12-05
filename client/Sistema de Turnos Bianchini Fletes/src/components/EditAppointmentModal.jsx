/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { toast } from 'sonner';
import axiosInstance from '../axioConfig.js';
import { format, parseISO, addHours, isAfter } from 'date-fns';
import { Button } from "@/components/ui/button"
const INITIAL_CENTER = { lat: -34.6037, lng: -58.3816 };
const INITIAL_ZOOM = 12;
const libraries = ['places', 'directions'];

const EditAppointmentModal = ({
  appointment,
  isOpen,
  onClose,
  onUpdateAppointment
}) => {
  const [prices, setPrices] = useState({ Hour: 0, Escaleras: 0, 'Personal extra': 0, Distancia: 0 });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [loadError, setLoadError] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [noSlotsAvailable, setNoSlotsAvailable] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si se cambia la fecha, resetear el horario
    if (name === 'day') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        schedule: '' // Resetear horario al cambiar fecha
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    language: 'es',
    region: 'AR'
  });

  useEffect(() => {
    if (!isLoaded) {
      setLoadError('Error loading Google Maps script. Please check your internet connection and try again.');
    } else {
      setLoadError(null);
    }
  }, [isLoaded]);

  const [formData, setFormData] = useState({
    day: appointment.day,
    schedule: appointment.schedule.split(':').slice(0, 2).join(':'),
    start_address: appointment.start_address,
    end_address: appointment.end_address,
    duration: appointment.duration.split(':').slice(0, 2).join(':'),
    distance: appointment.distance,
    cost: appointment.cost,
    stairs: appointment.stairs,
    staff: appointment.staff,
    description: appointment.description
  });

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
    const stairsPrice = parseInt(formData.stairs, 10) * prices.Escaleras || 0;
    const staffPrice = formData.staff ? prices['Personal extra'] : 0;
    const distancePrice = distance ? (distance / 1000) * prices.Distancia : 0;
    
    const total = basePrice + stairsPrice + staffPrice + distancePrice;
    setEstimatedPrice(Math.round(total * 100) / 100);
  }, [formData, prices, distance]);

  useEffect(() => {
    calculatePrice();
  }, [formData, prices, distance, calculatePrice]);

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

  const calculateRoute = useCallback(async () => {
    if (!window.google || !formData.start_address || !formData.end_address || !mapRef.current) {
      clearMap();
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: formData.start_address + ', Argentina',
        destination: formData.end_address + ', Argentina',
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
  }, [formData.start_address, formData.end_address, clearMap]);

  useEffect(() => {
    if (isLoaded && formData.start_address && formData.end_address) {
      calculateRoute();
    }
  }, [isLoaded, calculateRoute, formData.start_address, formData.end_address]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija los errores en el formulario');
      return;
    }
    
    try {
      const updatedAppointment = {
        ...formData,
        distance: distance ? distance / 1000 : formData.distance,
        duration: duration || formData.duration,
        cost: estimatedPrice
      };

      const response = await axiosInstance.put(`/appointment/appointmentUser/${appointment.id}`, updatedAppointment);
      
      if (response.status === 200) {
        toast.success('Turno actualizado exitosamente');
        onUpdateAppointment(appointment.id, updatedAppointment);
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar el turno:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar el turno');
    }
  };

  const fetchAvailableTimes = useCallback(async (day) => {
    const formattedDate = format(new Date(day), 'yyyy-MM-dd');
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
  }, []);

  // Efecto para cargar horarios al cambiar la fecha
  useEffect(() => {
    if (formData.day) {
      fetchAvailableTimes(formData.day);
    }
  }, [formData.day, fetchAvailableTimes]);

  const validateForm = useCallback(() => {
    const errors = {};
    const currentDate = new Date();
    const selectedDate = parseISO(formData.day);
    const minAllowedDate = addHours(currentDate, 48);

    // Validación de fecha
    if (!selectedDate || !isAfter(selectedDate, minAllowedDate)) {
      errors.day = 'La fecha debe ser al menos 48 horas después de hoy';
    }

    // Validación de horario
    if (!formData.schedule) {
      errors.schedule = 'Debe seleccionar un horario';
    }

    // Validación de descripción
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'La descripción debe ser más completa y detallada';
    }

    // Validación de direcciones (podría ser más compleja dependiendo de tus requisitos)
    const addressRegex = /^[a-zA-Z0-9\s,.-]+$/;
    if (!formData.start_address || !addressRegex.test(formData.start_address)) {
      errors.start_address = 'Ingrese una dirección de inicio válida';
    }

    if (!formData.end_address || !addressRegex.test(formData.end_address)) {
      errors.end_address = 'Ingrese una dirección de destino válida';
    }

    // Validación de escaleras (opcional, pero si se ingresa debe ser válido)
    if (formData.stairs && (isNaN(formData.stairs) || formData.stairs < 0)) {
      errors.stairs = 'Número de escaleras inválido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  if (!isOpen) return null;

  if (loadError) {
    return <div>Error: {loadError}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-white">
        <h2 className="text-2xl font-bold mb-4 dark:text-primary">Editar Turno</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 dark:text-primary">Fecha</label>
            <input 
              type="date" 
              name="day"
              value={formData.day ? new Date(formData.day).toISOString().split("T")[0] : ""}
              onChange={handleChange}
              required 
              className={`dark:bg-background dark:border-input w-full p-2 border rounded ${validationErrors.day ? 'border-red-500' : ''}`}
            />
            {validationErrors.day && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.day}</p>
            )}
          </div>
          
          {/* Selector de horarios */}
          <div>
            <label className="block mb-2 dark:text-primary">Hora</label>
            {noSlotsAvailable ? (
              <p className="text-red-500">No hay horarios disponibles para esta fecha</p>
            ) : (
              <select
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                required
                className={`dark:bg-background dark:border-input w-full p-2 border rounded ${validationErrors.schedule ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccione un horario</option>
                {availableTimeSlots.map((time, index) => (
                  <option 
                    key={index} 
                    value={time}
                  >
                    {time}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label htmlFor="start_address" className="block text-sm font-medium text-gray-700 dark:text-primary">Dirección de Inicio</label>
            <input
              type="text"
              id="start_address"
              name="start_address"
              value={formData.start_address}
              onChange={handleChange}
              required
              className={`dark:bg-background dark:border-input dark:ring-offset-background mt-1 block w-full rounded-md border p-2 ${validationErrors.start_address ? 'border-red-500' : ''}`}
              placeholder="Calle número, provincia/localidad"
            />
            {validationErrors.start_address && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.start_address}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_address" className="block text-sm font-medium text-gray-700 dark:text-primary">Dirección de Destino</label>
            <input
              type="text"
              id="end_address"
              name="end_address"
              value={formData.end_address}
              onChange={handleChange}
              required
              className={`dark:bg-background dark:border-input mt-1 block w-full rounded-md border p-2 ${validationErrors.end_address ? 'border-red-500' : ''}`}
              placeholder="Calle número, provincia/localidad"
            />
            {validationErrors.end_address && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.end_address}</p>
            )}
          </div>
          
          {isLoaded && (
            <div style={{ height: '300px', width: '100%' }}>
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={mapCenter}
                zoom={INITIAL_ZOOM}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
              >
                {/* DirectionsRenderer and Markers are handled programmatically */}
              </GoogleMap>
            </div>
          )}

          {distance && duration && (
            <div>
              <p>Distancia: {(distance / 1000).toFixed(2)} km</p>
              <p>Tiempo estimado de viaje: {duration}</p>
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-primary">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={`dark:bg-background dark:border-input mt-1 block w-full rounded-md border p-2 ${validationErrors.description ? 'border-red-500' : ''}`}
              placeholder="Ingrese una descripción (al menos 10 caracteres)"
              rows={3}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="stairs" className="block text-sm font-medium text-gray-700 dark:text-primary">Escaleras</label>
            <input
              type="number"
              id="stairs"
              name="stairs"
              value={formData.stairs}
              onChange={handleChange}
              className="dark:bg-background dark:border-input mt-1 block w-full rounded-md shadow-sm border p-2"
              placeholder="Ingrese el número de escaleras"
            />
          </div>

          <div>
            <label htmlFor="staff" className="block text-sm font-medium text-gray-700 dark:text-primary">Personal Extra</label>
            <input
              type="checkbox"
              id="staff"
              name="staff"
              checked={formData.staff}
              onChange={handleChange}
              className="mt-1 block dark:bg-background"
            />
          </div>

          <div>
            <p className="text-lg font-semibold dark:text-primary">Precio Estimado: ${estimatedPrice.toFixed(2)}</p>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              onClick={onClose} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;

