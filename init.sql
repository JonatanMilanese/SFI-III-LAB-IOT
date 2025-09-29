-- Crea las tablas si no existen
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer VARCHAR(100) NOT NULL,
  item VARCHAR(100) NOT NULL,
  qty INT NOT NULL,
  correlation_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS led_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(64) NOT NULL,
  action VARCHAR(8) NOT NULL,
  source  VARCHAR(16) NOT NULL,
  correlation_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- esto otorga todos los privilegios al usuario 'leduser' en la base de datos 'ledactions'
GRANT ALL PRIVILEGES ON ledactions.* TO 'leduser'@'%';
-- Aplica los cambios de privilegios
FLUSH PRIVILEGES;