import { Link } from 'react-router-dom';
import { Truck, Calendar, User, LogIn, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// eslint-disable-next-line react/prop-types
const Home = ({ isAuthenticated, role, username }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Bienvenido al Sistema de Turnos Bianchini Fletes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gestiona tus envíos de manera eficiente y sencilla con nuestro sistema de turnos.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <Truck className="w-12 h-12 text-primary mb-4" />
            <CardTitle>Servicios de Fletes</CardTitle>
            <CardDescription>
              Ofrecemos servicios de fletes confiables y puntuales para todas tus necesidades de transporte.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Calendar className="w-12 h-12 text-primary mb-4" />
            <CardTitle>Sistema de Turnos</CardTitle>
            <CardDescription>
              Reserva y gestiona tus turnos de manera fácil y rápida con nuestro sistema en línea.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Accede a Todas las Funciones</CardTitle>
            <CardDescription>
              Para disfrutar de todas las características de nuestro sistema, por favor inicia sesión o regístrate.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center space-x-4">
            <Button asChild variant="default">
              <Link to="/login" className="flex items-center">
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/register" className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Registrarse
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <User className="w-16 h-16 mx-auto mb-4" />
            <CardTitle className="text-2xl">
              Bienvenido, {username || (role === 'admin' ? 'Administrador' : 'Usuario')}
            </CardTitle>
            <CardDescription>
              {role === 'admin' 
                ? 'Accede al panel de administración para gestionar los turnos y usuarios.' 
                : 'Explora nuestras funciones para reservar y gestionar tus turnos.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="secondary">
              <Link to={role === 'admin' ? "/panel-admin" : "/turnero"}>
                {role === 'admin' ? 'Ir al Panel de Administración' : 'Reservar un Turno'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;