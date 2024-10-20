import { useState, useEffect } from 'react'
import axiosInstance from '../axioConfig.js'
import { Toaster, toast } from 'sonner'

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
    return <p>Cargando datos...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Funciones para manejar precios
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

  // Funciones para manejar vans
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
    <div className="container mx-auto p-4 flex flex-col justify-between">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-3xl font-bold mb-6">Bienvenido a la gestión de camionetas y precios, Administrador</h1>
      
      {/* Sección de Precios */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Gestión de Precios</h2>
        <div className="grid grid-cols-3 gap-4 mb-2 font-bold">
          <div>Nombre</div>
          <div>Precio</div>
          <div>Acciones</div>
        </div>
        {prices.map((price) => (
          <div key={price.id} className="grid grid-cols-3 gap-4 mb-2 items-center">
            <div>{price.service_name}</div>
            <div>${price.price}</div>
            <button
              onClick={() => handleEditPrice(price)}
              className="bg-blue-500 text-white px-4 py-2 rounded w-fit">
              Editar
            </button>
          </div>
        ))}
      </section>

      {/* Sección de Camionetas */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Gestión de Camionetas</h2>
          <button
            onClick={handleAddVan}
            className="bg-green-500 text-white px-4 py-2 rounded">
            Agregar nueva camioneta
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-2 font-bold">
          <div>Dueño</div>
          <div>Patente</div>
          <div>Modelo</div>
          <div>Disponible</div>
          <div>Acciones</div>
        </div>
        <div className="h-96 overflow-y-auto">
          {vans.map((van) => (
            <div key={van.id} className="grid grid-cols-5 gap-4 mb-6 items-center">
              <div>{van.driver_name}</div>
              <div>{van.license_plate}</div>
              <div>{van.model}</div>
              <div>{van.available ? 'Disponible' : 'No disponible'}</div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAvailableVan(van.id)}
                  className="bg-green-500 text-white px-2 py-2 rounded">
                  {van.available ? 'Deshab' : 'Habilitar'}
                </button>
                <button
                  onClick={() => handleEditVan(van)}
                  className="bg-blue-500 text-white px-2 py-2 rounded">
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteVan(van.id)}
                  className="bg-red-500 text-white px-2 py-2 rounded">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de edición de precios */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Editar Precio</h3>
            <form onSubmit={handleUpdatePrice}>
              <div className="mb-4">
                <label htmlFor="service_name" className="block mb-2">Nombre del Servicio</label>
                <input
                  type="text"
                  id="service_name"
                  value={editingPrice.service_name}
                  onChange={(e) => setEditingPrice({...editingPrice, service_name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block mb-2">Precio</label>
                <input
                  type="number"
                  id="price"
                  value={editingPrice.price}
                  onChange={(e) => setEditingPrice({...editingPrice, price: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClosePriceModal}
                  className="bg-gray-300 text-black px-4 py-2 rounded">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición/adición de vans */}
      {isVanModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{editingVan.id ? 'Editar' : 'Agregar'} Camioneta</h3>
            <form onSubmit={handleSaveVan}>
              <div className="mb-4">
                <label htmlFor="driver_name" className="block mb-2">Nombre del Conductor</label>
                <input
                  type="text"
                  id="driver_name"
                  value={editingVan.driver_name}
                  onChange={(e) => setEditingVan({...editingVan, driver_name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="license_plate" className="block mb-2">Patente</label>
                <input
                  type="text"
                  id="license_plate"
                  value={editingVan.license_plate}
                  onChange={(e) => setEditingVan({...editingVan, license_plate: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="model" className="block mb-2">Modelo</label>
                <input
                  type="text"
                  id="model"
                  value={editingVan.model}
                  onChange={(e) => setEditingVan({...editingVan, model: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseVanModal}
                  className="bg-gray-300 text-black px-4 py-2 rounded">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded">
                  {editingVan.id ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;