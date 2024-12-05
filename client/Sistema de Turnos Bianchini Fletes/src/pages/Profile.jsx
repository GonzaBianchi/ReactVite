import { useEffect, useState } from 'react';
import axiosInstance from '../axioConfig.js';
import { Toaster, toast } from 'sonner';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-foreground">No se encontró información del usuario</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="container max-w-2xl mx-auto space-y-8">
        <Toaster position="bottom-right" closeButton richColors />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido a tu perfil, {user.username}
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias de cuenta
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Información del perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Nombre</div>
                <div className="text-foreground">{user.first_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Apellido</div>
                <div className="text-foreground">{user.last_name}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Teléfono</div>
              <div className="text-foreground">{user.phone}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div className="text-foreground">{user.email}</div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Actualizar Perfil</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] text-secondary-foreground dark:text-primary">
            <DialogHeader>
              <DialogTitle>Actualizar Perfil</DialogTitle>
              <DialogDescription>
                Actualice su información personal aquí. Haga clic en guardar cuando termine.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Actualizar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;

