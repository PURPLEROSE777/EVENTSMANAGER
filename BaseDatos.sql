-- Crear base de datos
CREATE DATABASE IF NOT EXISTS events_manager;
USE events_manager;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  contraseña VARCHAR(100),
  tipo ENUM('gestor', 'asistente', 'staff') NOT NULL
);
-- Tabla de eventos
CREATE TABLE eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  fecha DATE,
  ubicacion VARCHAR(255),
  capacidad INT,
  precio DECIMAL(10,2)
);

-- Tabla de reservas
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  evento_id INT,
  cantidad INT,
  fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (evento_id) REFERENCES eventos(id)
);

-- Tabla de stands
CREATE TABLE stands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  tipo VARCHAR(100),
  descripcion TEXT,
  evento_id INT,
  privilegio VARCHAR(8) UNIQUE,
  FOREIGN KEY (evento_id) REFERENCES eventos(id)
);

-- Tabla de asignaciones de staff a stands
CREATE TABLE asignaciones_staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  stand_id INT,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (stand_id) REFERENCES stands(id)
);
