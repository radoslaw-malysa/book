-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 03, 2026 at 02:18 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `book`
--

-- --------------------------------------------------------

--
-- Table structure for table `book_appointments`
--

CREATE TABLE `book_appointments` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled','no-show') COLLATE utf8mb4_polish_ci DEFAULT 'pending',
  `total_price` decimal(10,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_polish_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_appointment_services`
--

CREATE TABLE `book_appointment_services` (
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `provider_id` int UNSIGNED NOT NULL DEFAULT '0',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `price_at_booking` decimal(10,2) NOT NULL,
  `duration_at_booking` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_categories`
--

CREATE TABLE `book_categories` (
  `id` int NOT NULL,
  `salon_id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_customers`
--

CREATE TABLE `book_customers` (
  `id` int NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_polish_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_polish_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_polish_ci NOT NULL,
  `notes` text COLLATE utf8mb4_polish_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_providers`
--

CREATE TABLE `book_providers` (
  `id` int NOT NULL,
  `salon_id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_polish_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_polish_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_providers_services`
--

CREATE TABLE `book_providers_services` (
  `provider_id` int NOT NULL,
  `service_id` int NOT NULL,
  `custom_price` decimal(10,2) DEFAULT NULL,
  `custom_duration` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_salons`
--

CREATE TABLE `book_salons` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_polish_ci NOT NULL,
  `address` text COLLATE utf8mb4_polish_ci,
  `phone` varchar(20) COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `timezone` varchar(50) COLLATE utf8mb4_polish_ci DEFAULT 'UTC',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_services`
--

CREATE TABLE `book_services` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_polish_ci NOT NULL,
  `description` text COLLATE utf8mb4_polish_ci,
  `base_price` decimal(10,2) DEFAULT NULL,
  `base_duration` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_unavailability`
--

CREATE TABLE `book_unavailability` (
  `id` int NOT NULL,
  `provider_id` int NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_polish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_working_hours`
--

CREATE TABLE `book_working_hours` (
  `id` int NOT NULL,
  `provider_id` int NOT NULL,
  `day_of_week` tinyint DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `book_appointments`
--
ALTER TABLE `book_appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Indexes for table `book_appointment_services`
--
ALTER TABLE `book_appointment_services`
  ADD PRIMARY KEY (`appointment_id`,`service_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `start_time` (`start_time`,`end_time`);

--
-- Indexes for table `book_categories`
--
ALTER TABLE `book_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Indexes for table `book_customers`
--
ALTER TABLE `book_customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `book_providers`
--
ALTER TABLE `book_providers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Indexes for table `book_providers_services`
--
ALTER TABLE `book_providers_services`
  ADD PRIMARY KEY (`provider_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `book_salons`
--
ALTER TABLE `book_salons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `book_services`
--
ALTER TABLE `book_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `book_unavailability`
--
ALTER TABLE `book_unavailability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `book_working_hours`
--
ALTER TABLE `book_working_hours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `book_appointments`
--
ALTER TABLE `book_appointments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_categories`
--
ALTER TABLE `book_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_customers`
--
ALTER TABLE `book_customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_providers`
--
ALTER TABLE `book_providers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_salons`
--
ALTER TABLE `book_salons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_services`
--
ALTER TABLE `book_services`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_unavailability`
--
ALTER TABLE `book_unavailability`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_working_hours`
--
ALTER TABLE `book_working_hours`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
