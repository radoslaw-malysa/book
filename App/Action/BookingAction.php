<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use \App\Model\Repositories\AppointmentsRepository;
use \App\Model\Repositories\UsersRepository;
use \App\Model\Repositories\ServicesRepository;
use \App\Model\Repositories\CategoriesRepository;
use \App\Model\Repositories\AppointmentProvidersRepository;
use \App\Model\Repositories\ProvidersRepository;

use \App\Support\JsonRenderer;

//define('RESERVATION_TIME_INTERVAL', 30); //dlugosc slotu czasowego, odstepy czasowe do wyboru
//define('RESERVATION_TIME_START', '08:00:00'); //godzina otwarcia muzeum
//define('RESERVATION_TIME_END', '18:00:00'); //godzina zamkniecia muzeum

class BookingAction
{
  protected $json;
  static $settings = [
    'phone_reservation' => ''
  ];
  
  public function __construct(
    JsonRenderer $json, 
    AppointmentsRepository $appointments,
    UsersRepository $users,
    ServicesRepository $services,
    CategoriesRepository $categories,
    AppointmentProvidersRepository $appointment_providers,
    ProvidersRepository $providers
    )
  {
    $this->json = $json;
    $this->appointments = $appointments;
    $this->users = $users;
    $this->services = $services;
    $this->categories = $categories;
    $this->appointment_providers = $appointment_providers;
    $this->providers = $providers;
  }

  /**
   * Get offer data for new reservation
   */
  public function __invoke(Request $request, Response $response, $args) {
    $query_params = $request->getQueryParams();

    $service_id = $query_params['service_id'] ?? 0;
    $visit_date = $query_params['date'] ?? date("Y-m-d");

    // service prices
    $service = $this->services->getServicePrices($service_id, $visit_date);

    // preferential programs
    $kulturalna_szkola = 1;

    // free rooms
    $schedule = [
      ['start_time' => '09:00', 'free' => 1],
      ['start_time' => '11:00', 'free' => 1],
      ['start_time' => '12:00', 'free' => 0]
    ];

    // disabled dates


    $payload = [
      'service' => $service,
      'service_id' => $service_id,
      'visit_date' => $visit_date,
      'schedule' => $schedule,
      'kulturalna_szkola' => $kulturalna_szkola
    ];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Save new reservation
   */
  public function postBooking(Request $request, Response $response, $args) {
    $data = $request->getParsedBody();

    // json string in body
    if (isset($data['json_data'])) {
      $data = json_decode($data['json_data'], true);
    }
    
    if ($data) {
      $status = $this->appointments->postBooking($data);

      if (isset($status['error'])) {
        return $this->json->render($response, $status);
      }

      if (isset($status['id']) && $status['id']) {
        $token = $this->appointments->getToken($status['id']);

        $payload = ['token' => $token];
      } else {
        $payload = ['error' => 2, 'message' => 'Nie udało się zapisać rezerwacji.'];
      }

      
    } else {
      $payload = ['error' => 1, 'message' => 'Nie udało się zapisać rezerwacji. Brak danych rezerwacji.'];
    }
    
    return $this->json->render($response, $payload);
  }

  public function testBooking(Request $request, Response $response, $args) {
    $appointment_date = '2026-10-19';
    $appointment_date_end = '2026-10-22';
    $service_id = 2;

    //$slots = $this->appointment_providers->getAvailableLessonSlots($appointment_date, $service_id);
    $slots = $this->appointment_providers->getAvailableLessonSlotsPerDay($appointment_date, $appointment_date_end, $service_id);
    exit;
    
  }

  /**
   * Get reservation for "Before visit" page
   */
  public function getBeforeVisit(Request $request, Response $response, $args) {
    $token = $args['token'] ?? '';

    if (!$token) {
      return $this->json->render($response, ['error' => 33, 'message' => 'Token rezerwacji nieprawidłowy']);
    }

    // reservation
    $appointment = $this->appointments->getByToken($token);

    $payload = [
      'token' => $token,
      'appointment' => $appointment,
      'calculation' => $this->appointments->getCalculation($appointment)
    ];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Reservation confirmation
   */
  public function getConfirmBooking(Request $request, Response $response, $args) {
    $token = $args['token'] ?? '';

    if (!$token) {
      return $this->json->render($response, ['error' => 35, 'message' => 'Token rezerwacji nieprawidłowy']);
    }

    // reservation
    $appointment = $this->appointments->getByToken($token);

    if (isset($appointment['state']) && $appointment['state'] == 'pending') {
      $status = $this->appointments->confirm($appointment['id']);

      if (isset($status['success'])) {
        $appointment['state'] = 'confirmed';
      }
    }

    $payload = [
      'token' => $token,
      'appointment' => $appointment
    ];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Reservation cancellation 
   */
  public function getCancelBooking(Request $request, Response $response, $args) {
    $token = $args['token'] ?? '';

    if (!$token) {
      return $this->json->render($response, ['error' => 35, 'message' => 'Token rezerwacji nieprawidłowy']);
    }

    // reservation
    $appointment = $this->appointments->getByToken($token);

    if (isset($appointment['state']) && $appointment['state'] == 'pending') {
      $status = $this->appointments->cancel($appointment['id']);

      if (isset($status['success'])) {
        $appointment['state'] = 'cancelled';
      }
    }

    $payload = [
      'token' => $token,
      'appointment' => $appointment
    ];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Validate zip
   */
  public function zipValidate(Request $request, Response $response, $args) {
    $zip = $args['zip'] ?? '';

    if (!$zip) {
      return $this->json->render($response, ['error' => 35, 'message' => 'Brak kodu pocztowego w wywołaniu']);
    }
    $zip_formatted = (strpos($zip, '-') === false) ? substr_replace($zip, '-', 2, 0) : $zip;
    $allowed = $this->appointments->zipValidate($zip_formatted);
    
    return $this->json->render($response, ['allowed' => ($allowed) ? 1 : 0, 'zip' => $zip_formatted]);
  }
}