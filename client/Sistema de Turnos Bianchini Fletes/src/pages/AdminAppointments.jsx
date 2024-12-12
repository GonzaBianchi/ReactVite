import { useState, useEffect } from 'react'
import axiosInstance from '../axioConfig.js'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // eslint-disable-next-line no-unused-vars
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster, toast } from 'sonner'
import { useTheme } from '../contexts/ThemeContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";


const AdminAppointments = () => {
  const { darkMode } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [showModalVans, setShowModalVans] = useState(false);
  const [availableVans, setAvailableVans] = useState([]);
  const [selectedVan, setSelectedVan] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelUserInfo, setCancelUserInfo] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

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
  
  const fetchAvailableVans = async (schedule) => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      console.log(schedule, selectedDate)
      const response = await axiosInstance.get('van/available', {
        params: {
          date: formattedDate,
          schedule
        }
      });
      console.log(response)
      setAvailableVans(response.data.vans);
    } catch (error) {
      console.error('Error al obtener las camionetas disponibles:', error);
      toast.error('Error al obtener las camionetas disponibles. Por favor, intente nuevamente.');
    }
  };

  const handleSelectVan = (van) => {
    setSelectedVan(van);
  };
  
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModalDetails(true);
  };
  
  const handleAddVan = async (appointment) => {
    setSelectedAppointment(appointment);
    if (appointment) {
      await fetchAvailableVans(appointment.schedule);
      setShowModalVans(true);
      setShowModalDetails(false);
    }
  };

  const handleCloseModal = () => {
    if (showModalVans) {
      setShowModalVans(false);
      setSelectedVan(null);
    }
    if (showModalDetails) {
      setShowModalDetails(false);
    }
    if (showUserModal) {
      setCancelUserInfo([])
      setShowUserModal(false)
    }
  };

  const handleAssignVan = async () => {
    try {
      await axiosInstance.put(`appointment/${selectedAppointment.id}`, {
        id_van: selectedVan.id
      });
      setShowModalVans(false);
      setSelectedVan(null);
      
      await fetchAppointments(selectedDate);
      toast.success('Van asignada correctamente');
    } catch (error) {
      console.error('Error al asignar la camioneta al turno:', error);
      toast.error('Error al asignar la camioneta al turno. Por favor, intente nuevamente.')
    }
  };

  const handleCancelAppointment = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    try {
      const response = await axiosInstance.put(`appointment/admin/${selectedAppointment.id}`, {
        id: selectedAppointment.id_user
      });
      
      if (response.status === 200) {
        setCancelUserInfo(response.data.userInfo);
        setShowUserModal(true)
        
        await fetchAppointments(selectedDate);
        
        toast.success('Turno cancelado exitosamente');
      }
    } catch (error) {
      console.error('Error al cancelar el turno:', error);
      toast.error('Error al cancelar el turno. Por favor, intente nuevamente.');
    } finally {
      setShowCancelModal(false);
    }
  };

  const handleSendEmail = (email) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
    window.open(gmailUrl, '_blank');
  };

  const handleSendWhatsApp = (phone) => {
    // Asumimos que el número de teléfono está en formato internacional
    const whatsappUrl = `https://wa.me/${phone}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4">Bienvenido a la gestión de turnos, Administrador</h1>

      <div className="mb-4">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className={`p-2 border rounded ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          minDate={new Date()}
        />
      </div>

      {loading && <p>Cargando turnos...</p>}
      {message && <p className="text-blue-500">{message}</p>}

      {appointments.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Movil</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Dirección inicial</TableHead>
              <TableHead>Dirección final</TableHead>
              <TableHead>Costo estimado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.first_name} {appointment.last_name}</TableCell>
                <TableCell>{appointment.driver_name || 'N/A'}</TableCell>
                <TableCell>{appointment.schedule.split(':').slice(0, 2).join(':')}</TableCell>
                <TableCell>{appointment.start_address}</TableCell>
                <TableCell>{appointment.end_address}</TableCell>
                <TableCell>${appointment.cost}</TableCell>
                <TableCell>{appointment.state_name}</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => handleViewAppointment(appointment)} className="mr-2">
                    Ver detalles
                  </Button>
                  <Button variant="outline" onClick={() => handleAddVan(appointment)} className="mr-2">
                    {appointment.driver_name ? 'Cambiar Van' : 'Agregar Van'}
                  </Button>
                  <Button variant="destructive" onClick={() => handleCancelAppointment(appointment)}>
                    Cancelar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showModalDetails} onOpenChange={setShowModalDetails}>
        <DialogContent className="dark:text-primary">
          <DialogHeader>
            <DialogTitle>Detalles del turno</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Nombre:</strong> {selectedAppointment.first_name} {selectedAppointment.last_name}</p>
                <p><strong>Movil:</strong> {selectedAppointment.driver_name || 'N/A'}</p>
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
              <div className="col-span-1 md:col-span-2">
                <p><strong>Descripción:</strong> {selectedAppointment.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cerrar</Button>
            <Button onClick={() => handleAddVan(selectedAppointment)}>
              {selectedAppointment?.driver_name ? 'Cambiar Van' : 'Agregar Van'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showModalVans} onOpenChange={setShowModalVans}>
        <DialogContent className="sm:max-w-[425px] dark:text-primary">
          <DialogHeader>
            <DialogTitle>Seleccionar van</DialogTitle>
            <DialogDescription>
              Seleccione una van disponible para asignar al turno.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {availableVans.map((van) => (
              <Button
                key={van.id}
                variant={selectedVan?.id === van.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handleSelectVan(van)}
              >
                {van.driver_name}
              </Button>
            ))}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleAssignVan} disabled={!selectedVan}>
              {selectedAppointment?.driver_name ? 'Cambiar Van' : 'Agregar Van'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="dark:text-primary">
          <DialogHeader>
            <DialogTitle>Confirmar Cancelación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea cancelar el turno de {selectedAppointment?.first_name} {selectedAppointment?.last_name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>No, mantener turno</Button>
            <Button variant="destructive" onClick={confirmCancelAppointment}>Sí, cancelar turno</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="dark:text-primary">
          <DialogHeader>
            <DialogTitle>Información del Usuario</DialogTitle>
          </DialogHeader>
          {cancelUserInfo && (
            <div className="space-y-4">
              <p><strong>Email:</strong> {cancelUserInfo.email}</p>
              <p><strong>Teléfono:</strong> {cancelUserInfo.phone}</p>
              <div className="flex space-x-2">
                <Button onClick={() => handleSendEmail(cancelUserInfo.email)}>
                  Enviar Email
                </Button>
                <Button onClick={() => handleSendWhatsApp(cancelUserInfo.phone)}>
                  Enviar WhatsApp
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseModal}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppointments;

