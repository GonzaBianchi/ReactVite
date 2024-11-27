/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Calendar, User, LogIn, UserPlus } from 'lucide-react';

const Home = ({ isAuthenticated, role, username }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bienvenido al Sistema de Turnos Bianchini Fletes
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gestiona tus envíos de manera eficiente y sencilla con nuestro sistema de turnos.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Truck className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Servicios de Fletes</h2>
          <p className="text-gray-600">
            Ofrecemos servicios de fletes confiables y puntuales para todas tus necesidades de transporte.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <Calendar className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sistema de Turnos</h2>
          <p className="text-gray-600">
            Reserva y gestiona tus turnos de manera fácil y rápida con nuestro sistema en línea.
          </p>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Accede a Todas las Funciones</h2>
          <p className="text-lg text-gray-700 mb-6">
            Para disfrutar de todas las características de nuestro sistema, por favor inicia sesión o regístrate.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/login" className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
              <LogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </Link>
            <Link to="/register" className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
              <UserPlus className="w-5 h-5 mr-2" />
              Registrarse
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-blue-100 rounded-lg p-8 text-center">
          <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Bienvenido, {username || (role === 'admin' ? 'Administrador' : 'Usuario')}
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            {role === 'admin' 
              ? 'Accede al panel de administración para gestionar los turnos y usuarios.' 
              : 'Explora nuestras funciones para reservar y gestionar tus turnos.'}
          </p>
          <Link 
            to={role === 'admin' ? "/panel-admin" : "/turnero"} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-300"
          >
            {role === 'admin' ? 'Ir al Panel de Administración' : 'Reservar un Turno'}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;

