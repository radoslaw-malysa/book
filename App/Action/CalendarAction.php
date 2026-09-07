<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use \App\Model\Repositories\AppointmentsRepository;
use \App\Model\Repositories\UsersRepository;
use \App\Model\Repositories\ServicesRepository;
use \App\Model\Repositories\CategoriesRepository;
use \App\Model\Repositories\AppointmentServicesRepository;

use \App\Support\JsonRenderer;

//define('RESERVATION_TIME_INTERVAL', 30); //dlugosc slotu czasowego, odstepy czasowe do wyboru
define('RESERVATION_TIME_START', '09:00:00'); //godzina otwarcia muzeum
define('RESERVATION_TIME_END', '15:30:00'); //godzina zamkniecia muzeum
//define('FIRST_LESSON_START', [1 => '09:00:00', 2 => '09:00:00']); // godzina rozpoczecia pierwszej lekcji na placowkach
//define('LAST_LESSON_START', [1 => '13:30:00', 2 => '14:30:00']); // godzina rozpoczecia ostatniej lekcji na placowkach

class CalendarAction
{
  protected $json;
  
  public function __construct(
    JsonRenderer $json, 
    AppointmentsRepository $appointments,
    UsersRepository $users,
    ServicesRepository $services,
    CategoriesRepository $categories,
    AppointmentServicesRepository $appointment_services
    )
  {
    $this->json = $json;
    $this->appointments = $appointments;
    $this->users = $users;
    $this->services = $services;
    $this->categories = $categories;
    $this->appointment_services = $appointment_services;
  }

  // week
  public function __invoke(Request $request, Response $response, $args) {
    $query_params = $request->getQueryParams();

    $salon_id = $query_params['salon_id'] ?? 1;
    $day = $query_params['day'] ?? date("Y-m-d");

    // week start/end
    $datetime_day = \DateTime::createFromFormat('Y-m-d', $day);
    $range_start = clone $datetime_day;
    $range_start->modify('Monday this week');
    $range_end = clone $datetime_day;
    $range_end->modify('Sunday this week')->modify('+1 day');

    $day_period = new \DatePeriod(
      $range_start,
      new \DateInterval('P1D'),
      $range_end
    );

    $hour_open = \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_START);
    $hour_period = new \DatePeriod(
      $hour_open,
      new \DateInterval('PT1H'),
      \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_END) 
    );


    $rows = $this->appointment_services->getRange();

    $items = [];
    foreach ($rows as $row) {
      //$items[]
    }

    print_r($items); exit;

    return $this->json->render($response, ['error' => '404', 'message' => 'No action']);
  }

  

}
