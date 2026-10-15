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
define('RESERVATION_TIME_START', '08:00:00'); //godzina otwarcia muzeum
define('RESERVATION_TIME_END', '18:00:00'); //godzina zamkniecia muzeum

class BookingAction
{
  protected $json;
  
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

    $payload = [
      'service' => $service,
      'service_id' => $service_id,
      'visit_date' => $visit_date
    ];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Save new reservation
   */
  public function postBooking(Request $request, Response $response, $args) {
  
    $payload = ['message' => 'ok', 'token' => 'XXX'];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Get reservation for "Before visit" page
   */
  public function getBeforeVisit(Request $request, Response $response, $args) {
    $token = $args['token'] ?? '';

    $payload = ['message' => 'ok', 'token' => $token];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Reservation confirmation
   */
  public function getConfirmBooking(Request $request, Response $response, $args) {
  
    $payload = ['message' => 'ok', 'token' => 'XXX'];
    
    return $this->json->render($response, $payload);
  }

  /**
   * Reservation cancellation 
   */
  public function getCancelBooking(Request $request, Response $response, $args) {
  
    $payload = ['message' => 'ok', 'token' => 'XXX'];
    
    return $this->json->render($response, $payload);
  }
}