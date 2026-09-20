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

  public function __invoke(Request $request, Response $response, $args) {
    $query_params = $request->getQueryParams();

    $payload = ['message' => 'ok'];
    
    return $this->json->render($response, $payload);
  }
}