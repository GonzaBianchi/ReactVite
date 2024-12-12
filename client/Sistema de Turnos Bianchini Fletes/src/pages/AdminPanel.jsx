import { useState, useEffect } from 'react'
import axiosInstance from '../axioConfig.js'
import { Toaster, toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const AdminPanel = () => {
  const [prices, setPrices] = useState([]);
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isVanModalOpen, setIsVanModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editingVan, setEditingVan] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricesResponse, vansResponse] = await Promise.all([
        axiosInstance.get('/prices'),
        axiosInstance.get('/van')
      ]);
      setPrices(pricesResponse.data.prices);
      setVans(vansResponse.data.vans);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response && error.response.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else {
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
        toast.error('Error al cargar los datos. Por favor, intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando datos...</div>;
  }

  if (error) {
    return <div className="text-destructive text-center">{error}</div>;
  }

  // Price management functions
  const handleEditPrice = (price) => {
    setEditingPrice(price);
    setIsPriceModalOpen(true);
  };

  const handleClosePriceModal = () => {
    setIsPriceModalOpen(false);
    setEditingPrice(null);
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/prices/${editingPrice.id}`, {
        service_name: editingPrice.service_name,
        price: editingPrice.price
      });
      if (response.status === 200) {
        setPrices(prices.map(p => p.id === editingPrice.id ? { ...p, ...editingPrice } : p));
        handleClosePriceModal();
        toast.success('Precio actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar el precio:', error);
      toast.error(error.response.data.error);
    }
  };

  // Van management functions
  const handleAddVan = () => {
    setEditingVan({ driver_name: '', license_plate: '', model: '' });
    setIsVanModalOpen(true);
  };

  const handleEditVan = (van) => {
    setEditingVan(van);
    setIsVanModalOpen(true);
  };

  const handleCloseVanModal = () => {
    setIsVanModalOpen(false);
    setEditingVan(null);
  }

  const handleAvailableVan = async (idVan) => {
    try {
      const response = await axiosInstance.post(`/van/available/${idVan}`);
      if (response.status === 200) {
        setVans(vans.map(v => v.id === idVan ? { ...v, available: !v.available } : v));
        toast.success('Cambio de estado de la camioneta exitoso');
      }
    } catch (error) {
      console.error('Error al cambiar el estado de la camioneta:', error);
      toast.error('Error al cambiar el estado de la camioneta. Por favor, intente de nuevo.');
    }
  }

  const handleSaveVan = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingVan.id) {
        response = await axiosInstance.post(`/van/${editingVan.id}`, editingVan);
      } else {
        response = await axiosInstance.post('/van', editingVan);
      }
      if (response.status === 200 || response.status === 201) {
        if (editingVan.id) {
          setVans(vans.map(v => v.id === editingVan.id ? { ...v, ...editingVan } : v));
          toast.success('Camioneta actualizada correctamente');
        } else {
          setVans([...vans, { ...editingVan, id: response.data.insertId }]);
          toast.success('Camioneta agregada correctamente');
        }
        handleCloseVanModal();
      }
    } catch (error) {
      console.error('Error al guardar la camioneta:', error);
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error[0].message;
        console.log(errorMessage);
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error('Error al guardar la camioneta. Por favor, intente de nuevo.');
      }
    }
  };

  const handleDeleteVan = async (vanId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta camioneta?')) {
      try {
        const response = await axiosInstance.delete(`/van/${vanId}`);
        if (response.status === 200) {
          setVans(vans.filter(v => v.id !== vanId));
          toast.success('Camioneta eliminada correctamente');
        }
      } catch (error) {
        console.error('Error al eliminar la camioneta:', error);
        toast.error('Error al eliminar la camioneta. Por favor, intente de nuevo.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-3xl font-bold">Bienvenido a la gestión de camionetas y precios, Administrador</h1>
      
      {/* Prices Section */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{price.service_name}</TableCell>
                  <TableCell>${price.price}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditPrice(price)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vans Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Gestión de Camionetas</CardTitle>
          <Button onClick={handleAddVan}>
            Agregar nueva camioneta
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dueño</TableHead>
                  <TableHead>Patente</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vans.map((van) => (
                  <TableRow key={van.id}>
                    <TableCell>{van.driver_name}</TableCell>
                    <TableCell>{van.license_plate}</TableCell>
                    <TableCell>{van.model}</TableCell>
                    <TableCell>{van.available ? 'Disponible' : 'No disponible'}</TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Button variant="secondary" onClick={() => handleAvailableVan(van.id)}>
                          {van.available ? 'Deshab' : 'Habilitar'}
                        </Button>
                        <Button variant="outline" onClick={() => handleEditVan(van)}>
                          Editar
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteVan(van.id)}>
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Price Edit Modal */}
      <Dialog open={isPriceModalOpen} onOpenChange={setIsPriceModalOpen}>
        <DialogContent className="text-secondary-foreground dark:text-primary">
          <DialogHeader>
            <DialogTitle>Editar Precio</DialogTitle>
            <DialogDescription>
              Actualice los detalles del precio aquí. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePrice}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service_name" className="text-right">
                  Nombre del Servicio
                </Label>
                <Input
                  id="service_name"
                  value={editingPrice?.service_name || ''}
                  onChange={(e) => setEditingPrice({...editingPrice, service_name: e.target.value})}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={editingPrice?.price || ''}
                  onChange={(e) => setEditingPrice({...editingPrice, price: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClosePriceModal}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Van Edit/Add Modal */}
      <Dialog open={isVanModalOpen} onOpenChange={setIsVanModalOpen}>
        <DialogContent className="text-secondary-foreground dark:text-primary">
          <DialogHeader>
            <DialogTitle>{editingVan?.id ? 'Editar' : 'Agregar'} Camioneta</DialogTitle>
            <DialogDescription>
              {editingVan?.id ? 'Actualice' : 'Ingrese'} los detalles de la camioneta aquí. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveVan}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="driver_name" className="text-right">
                  Nombre del Conductor
                </Label>
                <Input
                  id="driver_name"
                  value={editingVan?.driver_name || ''}
                  onChange={(e) => setEditingVan({...editingVan, driver_name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="license_plate" className="text-right">
                  Patente
                </Label>
                <Input
                  id="license_plate"
                  value={editingVan?.license_plate || ''}
                  onChange={(e) => setEditingVan({...editingVan, license_plate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Modelo
                </Label>
                <Input
                  id="model"
                  value={editingVan?.model || ''}
                  onChange={(e) => setEditingVan({...editingVan, model: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseVanModal}>
                Cancelar
              </Button>
              <Button type="submit">{editingVan?.id ? 'Actualizar' : 'Agregar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;

