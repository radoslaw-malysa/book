-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 24, 2026 at 02:34 PM
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
  `service_id` int UNSIGNED NOT NULL,
  `customer_id` int NOT NULL,
  `salon_id` int NOT NULL DEFAULT '1',
  `visit_time` datetime DEFAULT NULL,
  `admission` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `guide` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `cinema` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `kulturalna_szkola` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `kultura_za_zl` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `pax` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `state` enum('pending','confirmed','completed','cancelled','no-show') CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT 'pending',
  `total_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sell_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sell_doc` varchar(32) COLLATE utf8mb4_polish_ci NOT NULL,
  `notes` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_ip` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_ip` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_appointments`
--

INSERT INTO `book_appointments` (`id`, `service_id`, `customer_id`, `salon_id`, `visit_time`, `admission`, `guide`, `cinema`, `kulturalna_szkola`, `kultura_za_zl`, `pax`, `state`, `total_price`, `sell_price`, `sell_doc`, `notes`, `create_time`, `create_ip`, `update_time`, `update_ip`) VALUES
(1, 1, 1, 1, '2026-09-22 09:00:00', 0, 0, 0, 0, 0, 0, 'confirmed', 100.00, 0.00, '', '', '2026-09-06 19:59:14', '', '2026-09-06 19:59:14', '127.0.0.1'),
(2, 3, 2, 1, '2026-09-23 10:00:00', 1, 0, 1, 1, 1, 25, 'pending', 100.00, 0.00, '', 'ta rezerwacja jest moja', '2026-09-06 19:59:14', '', '2026-09-06 19:59:14', '127.0.0.1'),
(3, 2, 5, 1, '2026-09-25 08:00:00', 0, 0, 0, 0, 0, 20, 'pending', 0.00, 0.00, '', 'test nr 2', '2026-09-17 16:05:18', '127.0.0.1', '2026-09-17 16:05:18', '127.0.0.1'),
(4, 3, 6, 1, '2026-09-25 11:00:00', 0, 0, 1, 0, 0, 20, 'confirmed', 0.00, 0.00, '', '', '2026-09-22 09:15:18', '127.0.0.1', '2026-09-22 09:15:18', '127.0.0.1'),
(5, 1, 7, 1, '2026-09-25 09:00:00', 0, 0, 0, 0, 0, 0, 'confirmed', 0.00, 0.00, '', 'Sprzątanie sali', '2026-09-22 09:17:45', '127.0.0.1', '2026-09-22 09:17:45', '127.0.0.1');

-- --------------------------------------------------------

--
-- Table structure for table `book_appointment_providers`
--

CREATE TABLE `book_appointment_providers` (
  `id` int UNSIGNED NOT NULL,
  `appointment_id` int NOT NULL,
  `service_id` smallint UNSIGNED NOT NULL DEFAULT '0',
  `provider_id` int UNSIGNED NOT NULL DEFAULT '0',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_appointment_providers`
--

INSERT INTO `book_appointment_providers` (`id`, `appointment_id`, `service_id`, `provider_id`, `start_time`, `end_time`) VALUES
(1, 1, 0, 1, '2026-09-22 09:00:00', '2026-09-23 16:00:00'),
(2, 2, 0, 2, '2026-09-23 10:00:00', '2026-09-23 11:45:00'),
(3, 3, 2, 1, '2026-09-25 08:00:00', '2026-09-25 10:30:00'),
(4, 4, 0, 1, '2026-09-25 11:00:00', '2026-09-25 12:45:00'),
(5, 5, 0, 2, '2026-09-25 09:00:00', '2026-09-25 11:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `book_categories`
--

CREATE TABLE `book_categories` (
  `id` int NOT NULL,
  `salon_id` int NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `state` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `ord` smallint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_categories`
--

INSERT INTO `book_categories` (`id`, `salon_id`, `name`, `description`, `state`, `ord`) VALUES
(1, 1, 'Przedszkola oraz klasy I–III szkół podstawowych', '', 1, 6),
(2, 1, 'Klasy IV–VIII szkół podstawowych', '', 1, 5),
(3, 1, 'Uczniowie szkół ponadpodstawowych', '', 1, 4),
(4, 1, 'Dorośli i seniorzy', '', 1, 3),
(5, 1, 'Rodziny', '', 1, 2),
(6, 1, 'Osoby z niepełnosprawnościami', '', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `book_categories_services`
--

CREATE TABLE `book_categories_services` (
  `category_id` int UNSIGNED NOT NULL,
  `service_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_categories_services`
--

INSERT INTO `book_categories_services` (`category_id`, `service_id`) VALUES
(1, 1),
(1, 5),
(1, 6),
(1, 7),
(2, 7),
(2, 8),
(2, 9),
(2, 10);

-- --------------------------------------------------------

--
-- Table structure for table `book_customers`
--

CREATE TABLE `book_customers` (
  `id` int NOT NULL,
  `customer_type` enum('primary','post_primary','individual','organized_group','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `contact_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `contact_phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `contact_email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `pax_care` tinyint NOT NULL DEFAULT '0',
  `accept_processing` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `accept_regulations` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `accept_kultura_zl` tinyint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_customers`
--

INSERT INTO `book_customers` (`id`, `customer_type`, `name`, `address`, `email`, `phone`, `contact_name`, `contact_phone`, `contact_email`, `pax_care`, `accept_processing`, `accept_regulations`, `accept_kultura_zl`) VALUES
(1, NULL, 'Elektrownia', '', '', '', '', '', '', 0, 0, 0, 0),
(2, 'primary', 'Szkoła Podstawowa nr 30', 'Graniczna 17/9', 'radek.malysa@gmail.com', '222', 'Joanna Kowalska', '997', 'radek.malysa@gmail.com', 1, 1, 0, 0),
(5, 'post_primary', 'Liceum Ogólnokształcące', '', '', '', '', '', '', 0, 0, 0, 0),
(6, 'primary', 'Szkoła Testowa', '', '', '', '', '', '', 0, 0, 0, 0),
(7, 'other', 'Radek', '', '', '', '', '', '', 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `book_providers`
--

CREATE TABLE `book_providers` (
  `id` int NOT NULL,
  `salon_id` int NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL DEFAULT '',
  `description` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL DEFAULT '',
  `state` tinyint(1) DEFAULT '1',
  `ord` tinyint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_providers`
--

INSERT INTO `book_providers` (`id`, `salon_id`, `name`, `last_name`, `description`, `state`, `ord`) VALUES
(1, 1, 'Sala wystawowa 1 piętro', '', '', 1, 1),
(2, 1, 'Sala wystawowa parter', '', '', 1, 2),
(3, 1, 'Sala edukacyjna', '', '', 1, 4),
(4, 1, 'Piec', '', '', 1, 3),
(5, 1, 'Biblioteka', '', '', 1, 5);

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

--
-- Dumping data for table `book_providers_services`
--

INSERT INTO `book_providers_services` (`provider_id`, `service_id`, `custom_price`, `custom_duration`) VALUES
(1, 0, NULL, NULL),
(1, 8, NULL, NULL),
(1, 9, NULL, NULL),
(2, 6, NULL, NULL),
(2, 9, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `book_salons`
--

CREATE TABLE `book_salons` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT NULL,
  `timezone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT 'UTC',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_salons`
--

INSERT INTO `book_salons` (`id`, `name`, `address`, `phone`, `timezone`, `created_at`) VALUES
(1, 'MCSW Elektrownia', NULL, NULL, 'UTC', '2026-09-06 17:55:23');

-- --------------------------------------------------------

--
-- Table structure for table `book_services`
--

CREATE TABLE `book_services` (
  `id` int NOT NULL,
  `service_type` enum('lesson','tour','cinema','blockade') COLLATE utf8mb4_polish_ci NOT NULL DEFAULT 'lesson',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL,
  `description` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL DEFAULT '',
  `price` decimal(10,2) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `online` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `pax_min` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `pax_max` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `state` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_ip` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_ip` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_services`
--

INSERT INTO `book_services` (`id`, `service_type`, `name`, `description`, `price`, `duration`, `online`, `pax_min`, `pax_max`, `state`, `create_time`, `create_ip`, `update_time`, `update_ip`) VALUES
(1, 'blockade', 'Rezerwacja sali', 'Blokowanie sali dla celów organizacyjnych', 100.00, NULL, 0, 0, 0, 1, '2026-09-06 18:00:28', '', '2026-09-06 18:00:28', '127.0.0.1'),
(2, 'lesson', 'Spacer po wystawie i warsztaty plastyczne', '', NULL, NULL, 0, 0, 0, 1, '2026-09-09 13:52:40', '127.0.0.1', '2026-09-09 13:52:40', '127.0.0.1'),
(3, 'lesson', 'Nowe Horyzonty Edukacji Filmowej', '', NULL, NULL, 0, 0, 0, 1, '2026-09-09 14:28:39', '127.0.0.1', '2026-09-09 14:28:39', '127.0.0.1'),
(4, 'lesson', 'Warsztaty ruchowo-plastyczne podczas spaceru po wystawie', '', 0.00, 0, 0, 0, 0, 1, '2026-09-09 14:28:52', '127.0.0.1', '2026-09-09 14:28:52', '127.0.0.1'),
(5, 'lesson', 'Seanse filmowe z bieżącego repertuaru', '', 100.00, 60, 0, 0, 0, 1, '2026-09-09 14:29:06', '127.0.0.1', '2026-09-09 14:29:06', '127.0.0.1'),
(6, 'lesson', 'Warsztaty sensoryczno-plastyczne „Bajki z pieca”', '', 0.00, 0, 1, 0, 0, 1, '2026-09-09 14:29:22', '127.0.0.1', '2026-09-09 14:29:22', '127.0.0.1'),
(7, 'lesson', 'Filmowe pokazy specjalne', '', 125.00, 60, 1, 0, 0, 1, '2026-09-09 14:29:33', '127.0.0.1', '2026-09-09 14:29:33', '127.0.0.1'),
(8, 'lesson', 'Warsztaty plastyczne w sali edukacyjnej (cykl 5 spotkań)', '', 20.00, 60, 0, 0, 0, 1, '2026-09-22 09:28:15', '127.0.0.1', '2026-09-22 09:28:15', '127.0.0.1'),
(9, 'lesson', 'Seanse filmowe z bieżącego repertuaru', '', 16.00, 0, 0, 0, 0, 1, '2026-09-22 09:30:11', '127.0.0.1', '2026-09-22 09:30:11', '127.0.0.1'),
(10, 'lesson', 'Warsztaty plastyczne oraz spacer po wystawie', '', 20.00, 70, 0, 10, 25, 1, '2026-09-22 09:38:27', '127.0.0.1', '2026-09-22 09:38:27', '127.0.0.1'),
(11, 'tour', 'Zwiedzanie wystaw', 'Bez przewodnika', 0.00, 0, 0, 0, 0, 1, '2026-09-24 12:31:05', '', '2026-09-24 12:31:05', '127.0.0.1'),
(12, 'tour', 'Zwiedzanie wystaw z przewodnikiem', '', 0.00, 0, 0, 0, 0, 1, '2026-09-24 12:31:05', '', '2026-09-24 12:31:05', '127.0.0.1');

-- --------------------------------------------------------

--
-- Table structure for table `book_service_schedule`
--

CREATE TABLE `book_service_schedule` (
  `id` int UNSIGNED NOT NULL,
  `service_id` int UNSIGNED NOT NULL DEFAULT '0',
  `day_of_week` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `ord` tinyint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `book_service_schedule`
--

INSERT INTO `book_service_schedule` (`id`, `service_id`, `day_of_week`, `start_time`, `end_time`, `ord`) VALUES
(1, 4, 1, '09:00:00', NULL, 0),
(2, 5, 1, '10:00:00', NULL, 0),
(3, 5, 1, '12:00:00', NULL, 1),
(4, 4, 1, '10:00:00', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `book_unavailability`
--

CREATE TABLE `book_unavailability` (
  `id` int NOT NULL,
  `provider_id` int NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_users`
--

CREATE TABLE `book_users` (
  `id` int UNSIGNED NOT NULL,
  `email` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `title` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `image_url` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci DEFAULT NULL,
  `id_group` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `state` tinyint UNSIGNED NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_ip` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_ip` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_polish_ci;

--
-- Dumping data for table `book_users`
--

INSERT INTO `book_users` (`id`, `email`, `password`, `title`, `image_url`, `id_group`, `state`, `create_time`, `create_ip`, `update_time`, `update_ip`) VALUES
(1, 'radek.malysa@gmail.com', '$2y$12$3/4r0D4V6ZehVKeQgyQFXOaUjVFODt4EkkXrD7p2Cg8dRLgyamzuq', 'Radek Małysa', '', 1, 1, '2020-12-23 12:33:43', '::1', '2026-07-27 12:52:23', '185.189.126.184'),
(14, 'marcin@pawelec.info', '$2y$12$NFECirp3eQMZcCneIHEkNumom55l95mqZXBndEfYtWnf10wGioOb6', 'Miś Marcin', 'dev/loco.webp', 1, 1, '2021-06-17 09:32:48', '185.189.126.184', '2026-07-16 15:55:58', '127.0.0.1'),
(16, 'przemyslaw.ochnia@mcswelektrownia.pl', '$2y$12$QaDN.sh/OnpUvEaPkujOgu9Dw8h12KoZn4G7JKzKF/.HMTcDvI7Wm', 'Przemysław Ochnia', '', 1, 2, '2026-04-13 10:37:07', '185.189.126.184', '2026-04-13 10:37:07', '185.189.126.184'),
(17, 'joanna.nitasamb@mcswelektrownia.pl', '$2y$12$AnzEcdrnwOHeXUF82MEnAeLWyQbFDxxG3QFHPho.RY0itwKlkG9xW', 'Joanna Nita', '', 1, 1, '2026-04-14 11:01:41', '185.189.126.184', '2026-04-14 11:01:41', '185.189.126.184'),
(18, 'ewelina.witkowska@mcswelektrownia.pl', '$2y$12$GrjED/X7fPja.g/FLka3MO1vch.glrAtpbpXlAwSnwIPvOAku2RjG', 'Ewelina Witkowska', '', 1, 1, '2026-04-14 11:05:13', '185.189.126.184', '2026-04-14 11:05:13', '185.189.126.184'),
(19, 'dawid.penkalla@mcswelektrownia.pl', '$2y$12$XAbIyqfOKaAE2IBbybiaKel/qx6oqzhJzXt./86YMxhSKP0ve4/kG', 'Dawid Penkalla', '', 1, 1, '2026-07-27 12:54:22', '185.189.126.184', '2026-07-27 12:54:22', '185.189.126.184'),
(20, 'test@test.pl', '$2y$10$c06hMinQFzxM5rp1WxGi9O34BSVZLwbQGU8DGliyL2rgoTciqpXTe', 'Testowy Janekx', NULL, 2, 1, '2026-09-06 14:56:24', '127.0.0.1', '2026-09-06 14:56:24', '127.0.0.1');

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
  ADD KEY `salon_id` (`salon_id`),
  ADD KEY `state` (`state`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `book_appointment_providers`
--
ALTER TABLE `book_appointment_providers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `start_time` (`start_time`,`end_time`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `book_categories`
--
ALTER TABLE `book_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Indexes for table `book_categories_services`
--
ALTER TABLE `book_categories_services`
  ADD PRIMARY KEY (`category_id`,`service_id`);

--
-- Indexes for table `book_customers`
--
ALTER TABLE `book_customers`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `book_service_schedule`
--
ALTER TABLE `book_service_schedule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `book_unavailability`
--
ALTER TABLE `book_unavailability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `book_users`
--
ALTER TABLE `book_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `book_appointment_providers`
--
ALTER TABLE `book_appointment_providers`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `book_categories`
--
ALTER TABLE `book_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `book_customers`
--
ALTER TABLE `book_customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `book_providers`
--
ALTER TABLE `book_providers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `book_salons`
--
ALTER TABLE `book_salons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `book_services`
--
ALTER TABLE `book_services`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `book_service_schedule`
--
ALTER TABLE `book_service_schedule`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `book_unavailability`
--
ALTER TABLE `book_unavailability`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_users`
--
ALTER TABLE `book_users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `book_working_hours`
--
ALTER TABLE `book_working_hours`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
