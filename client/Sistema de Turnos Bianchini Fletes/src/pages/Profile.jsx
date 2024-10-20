import { useEffect, useState } from 'react';
import axiosInstance from '../axioConfig.js';
import { Toaster, toast } from 'sonner';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      setUser(response.data);
      console.log(user)
      setFormData({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone: response.data.phone,
        email: response.data.email,
        username: response.data.username,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error al obtener el perfil', error);
      setError('No se pudo cargar el perfil del usuario');
      toast.error('No se pudo cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    if ((formData.password && !formData.confirmPassword) || (!formData.password && formData.confirmPassword)) {
      toast.error('Debe completar ambos campos de contraseña');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSend = { ...formData };
      delete dataToSend.confirmPassword;

      const response = await axiosInstance.post(`/user/${user.id}`, dataToSend);
      if (response.status === 200) {
        toast.success('Perfil actualizado correctamente');
        setIsModalOpen(false);
        fetchProfile();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error[0].message;
        console.log(errorMessage);
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error('Error al guardar los datos del usuario. Por favor, intente de nuevo.');
      }
    }
  };

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>No se encontró información del usuario</div>;
  }

  return (
    <div className="container mx-auto mt-10 flex flex-col items-center">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-3xl font-bold mb-6">
        Bienvenido a tu perfil, {user.username}
      </h1>
      <div className="flex flex-col space-y-4 mb-6">
        <p><strong>Nombre:</strong> {user.first_name}</p>
        <p><strong>Apellido:</strong> {user.last_name}</p>
        <p><strong>Teléfono:</strong> {user.phone}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Actualizar Perfil
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h2 className="text-2xl font-bold mb-4">Actualizar Perfil</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <label htmlFor="first_name" className="block mb-1">Nombre</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block mb-1">Apellido</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block mb-1">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="username" className="block mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;