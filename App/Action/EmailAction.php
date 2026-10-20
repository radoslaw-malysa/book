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
use \App\Model\Mailer\MailerConfig;

//define('RESERVATION_TIME_INTERVAL', 30); //dlugosc slotu czasowego, odstepy czasowe do wyboru
//define('RESERVATION_TIME_START', '08:00:00'); //godzina otwarcia muzeum
//define('RESERVATION_TIME_END', '18:00:00'); //godzina zamkniecia muzeum

class EmailAction
{
  protected $json;

  private const NOTIFICATION_EMAIL = 'rm@pawelec.info'; // informacje o potwierdzeniach rezerwacji przez klientów
  
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
   * Email to customer about new reservation
   */
  public function newAppointment(Request $request, Response $response, $args) {
    $token = $args['token'] ?? '';

    $appointment = $this->appointments->getByToken($token);

    if (isset($appointment['id']) || true) {
      $customer = $this->customers->where('id', $appointment['customer_id'])->first(['name']);
      
      if ($this->mailer->send([
        'address' => MailerConfig::NOTIFICATION_EMAIL,
        'address_name' => null,
        'reply_email' => null,
        'subject' => 'Potwierdzona rezerwacja nr ' . $appointment['id'] ?? '',
        'body' => $this->view->fetch('email_new_appointment.php', [
          'appointment' => $appointment,
          'service' => $this->services->where('id', $appointment['service_id'])->first(['name']),
          'appointment_url' => 'xxx',
          'confirm_url' => 'xxx',
          'cancel_url' => 'xxx',
          'zgloszenie_url' => '',
          'reservation_phone' => '884 320 030',
          'reservation_email' => MailerConfig::NOTIFICATION_EMAIL
        ]),
        'alt_body' => ''
      ])) {
        return $this->json->render($response, ['success' => 1]);
      } else {
        return $this->json->render($response, ['error' => 24, 'message' => 'Nie wysłano wiadomości']);
      }
    }
    
    return $this->json->render($response, ['error' => 24, 'message' => 'Nie znaleziono rezerwacji. Token nieprawidłowy.']);
  }

  /**
   * Email to admin after customer appointment confirmation
   */
  public function confirmationAdmin(Request $request, Response $response, $args) {
    $token = $args['token'] ?? '';

    $appointment = $this->appointments->getByToken($token);

    if (isset($appointment['id']) || true) {
      
      if ($this->mailer->send([
        'address' => MailerConfig::NOTIFICATION_EMAIL,
        'address_name' => null,
        'reply_email' => null,
        'subject' => 'Potwierdzona rezerwacja nr ' . $appointment['id'] ?? '',
        'body' => $this->view->fetch('email_confirmation_admin.php', [
          'appointment' => $appointment,
          'service' => $this->services->where('id', $appointment['service_id'])->first(['name']),
          'customer' => $this->customers->where('id', $appointment['customer_id'])->first(['name']),
          'appointment_url' => 'xxx'
        ]),
        'alt_body' => ''
      ])) {
        return $this->json->render($response, ['success' => 1]);
      } else {
        return $this->json->render($response, ['error' => 24, 'message' => 'Nie wysłano wiadomości']);
      }
    }
    
    return $this->json->render($response, ['error' => 24, 'message' => 'Nie znaleziono rezerwacji. Token nieprawidłowy.']);
  }
}