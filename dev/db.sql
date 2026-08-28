-- A. Multi-Industry Infrastructure

CREATE TABLE book_salons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  salon_id INT NOT NULL,
  name VARCHAR(50) NOT NULL, -- e.g., 'Hair', 'Nails', 'Massage'
  FOREIGN KEY (salon_id) REFERENCES book_salons(id)
);


-- B. Services & Providers (rooms or employees)

CREATE TABLE book_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2),
  base_duration INT, -- in minutes
  FOREIGN KEY (category_id) REFERENCES book_categories(id)
);

CREATE TABLE book_providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  salon_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (salon_id) REFERENCES book_salons(id)
);

-- Junction table for many-to-many relationship
CREATE TABLE book_providers_services (
  provider_id INT NOT NULL,
  service_id INT NOT NULL,
  custom_price DECIMAL(10, 2), -- Overrides base_price if set
  custom_duration INT,      -- Overrides base_duration if set
  PRIMARY KEY (provider_id, service_id),
  FOREIGN KEY (provider_id) REFERENCES book_providers(id),
  FOREIGN KEY (service_id) REFERENCES book_services(id)
);


-- C. Availability & Breaks

-- Regular weekly schedule (e.g., Mon 9:00 - 17:00)
CREATE TABLE book_working_hours (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider_id INT NOT NULL,
  day_of_week TINYINT, -- 0 (Sun) to 6 (Sat)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES book_providers(id)
);

-- One-time exceptions (Vacations, sick leave, or 1-hour lunch break)
CREATE TABLE book_unavailability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider_id INT NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  reason VARCHAR(255), -- 'Lunch', 'Vacation', 'Private'
  FOREIGN KEY (provider_id) REFERENCES book_providers(id)
);


-- D. Customers & Appointments

CREATE TABLE book_customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  provider_id INT NOT NULL,
  salon_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL, -- Calculated as start_time + total duration
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'pending',
  total_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES book_customers(id),
  FOREIGN KEY (provider_id) REFERENCES book_providers(id),
  FOREIGN KEY (salon_id) REFERENCES book_salons(id),
  INDEX (start_time, end_time), -- For fast availability queries
  INDEX (provider_id, start_time)
);

-- Records specific services for the appointment (Snapshot of price/duration)
CREATE TABLE book_appointment_services (
  appointment_id INT NOT NULL,
  service_id INT NOT NULL,
  price_at_booking DECIMAL(10, 2) NOT NULL,
  duration_at_booking INT NOT NULL,
  PRIMARY KEY (appointment_id, service_id),
  FOREIGN KEY (appointment_id) REFERENCES book_appointments(id),
  FOREIGN KEY (service_id) REFERENCES book_services(id)
);