import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axioConfig';
import { Toaster, toast } from 'sonner';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const Register = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!document.cookie.match(/access_token/);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    passwordConfirmation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.passwordConfirmation) {
      toast.warning('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await axiosInstance.post('/session/register', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      if (response.status === 201) {
        toast.success('Registro exitoso');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error en el registro', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error[0].message);
      } else {
        toast.error('Error en el registro. Por favor, intente nuevamente.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="bottom-right" closeButton richColors />
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Registro</CardTitle>
          <CardDescription>Crea una nueva cuenta para acceder a nuestros servicios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Nombre... e.g. John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Apellido... e.g. Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Celular</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Celular... e.g. 3421234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email... e.g. john@doe.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Usuario... e.g. john123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Contraseña... e.g. myPassword123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirmar contraseña</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                required
                placeholder="Confirmar contraseña... e.g. myPassword123"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" onClick={(e) => handleSubmit(e)}>
            Registrarse
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;

