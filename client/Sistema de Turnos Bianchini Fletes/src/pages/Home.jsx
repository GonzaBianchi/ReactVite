// eslint-disable-next-line no-unused-vars
import React from 'react';

const Home = (isAuthenticated, role) => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-bold mb-6">Bienvenido al Sistema de Turnos Bianchini Fletes</h1>
      <p className="text-lg mb-4">
        Esta es la página principal. Aquí puedes encontrar información sobre la aplicación.
      </p>
      
      {!isAuthenticated ? (
        <p className="text-lg">
          Por favor, <strong>regístrate</strong> o <strong>inicia sesión</strong> para acceder a más funciones.
        </p>
      ) : (
        <p className="text-lg">
          <strong>Bienvenido {role === 'admin' ? 'administrador' : 'usuario'}</strong>, acceda a todas nuestras funciones
        </p>
      )}
      
    </div>
  );
};

export default Home;
