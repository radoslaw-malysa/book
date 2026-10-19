<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use \App\Model\Repositories\AppointmentsRepository;
use \App\Model\Repositories\CustomersRepository;
use \App\Model\Repositories\ServicesRepository;
use \App\Model\Repositories\CategoriesRepository;
use \App\Model\Repositories\AppointmentProvidersRepository;
use \App\Model\Repositories\ProvidersRepository;

use Slim\Views\PhpRenderer;
use \App\Support\JsonRenderer;
use \App\Model\Mailer\Mailer;

//define('RESERVATION_TIME_INTERVAL', 30); //dlugosc slotu czasowego, odstepy czasowe do wyboru
//define('RESERVATION_TIME_START', '08:00:00'); //godzina otwarcia muzeum
//define('RESERVATION_TIME_END', '18:00:00'); //godzina zamkniecia muzeum

class EmailAction
{
  protected $json;
  
  public function __construct(
    PhpRenderer $view,
    JsonRenderer $json, 
    AppointmentsRepository $appointments,
    CustomersRepository $customers,
    ServicesRepository $services,
    CategoriesRepository $categories,
    AppointmentProvidersRepository $appointment_providers,
    ProvidersRepository $providers,
    Mailer $mailer
    )
  {
    $this->view = $view;
    $this->json = $json;
    $this->appointments = $appointments;
    $this->customers = $customers;
    $this->services = $services;
    $this->categories = $categories;
    $this->appointment_providers = $appointment_providers;
    $this->providers = $providers;
    $this->mailer = $mailer;
  }

  /**
   * Email to admin after customer appointment confirmation
   */
  public function confirmationAdmin(Request $request, Response $response, $args) {
    $token = $args['token'] ?? '';

    $appointment = $this->appointments->getByToken($token);

    if (isset($appointment['id'])) {
      

      $this->mailer->send([
        'address' => $addresses,
        'address_name' => null,
        'reply_email' => null,
        'subject' => 'Auction canceled. Shipment From: ' . ($route_stops[0]['city'] ?? '') . ' ' . ($route_stops[0]['country_code'] ?? '') . ', To: ' . ($route_stops[$end]['city'] ?? '') . ' ' . ($route_stops[$end]['country_code'] ?? ''),
        'body' => $body,
        'alt_body' => ''
      ]);
    }

    echo 'ok'; exit;
  }


}