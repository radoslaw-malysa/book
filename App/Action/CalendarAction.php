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
use \App\Model\Repositories\ProvidersRepository;

use \App\Support\JsonRenderer;

//define('RESERVATION_TIME_INTERVAL', 30); //dlugosc slotu czasowego, odstepy czasowe do wyboru
define('RESERVATION_TIME_START', '08:00:00'); //godzina otwarcia muzeum
define('RESERVATION_TIME_END', '18:00:00'); //godzina zamkniecia muzeum
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
    AppointmentServicesRepository $appointment_services,
    ProvidersRepository $providers
    )
  {
    $this->json = $json;
    $this->appointments = $appointments;
    $this->users = $users;
    $this->services = $services;
    $this->categories = $categories;
    $this->appointment_services = $appointment_services;
    $this->providers = $providers;
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

    // days
    $day_period = new \DatePeriod(
      $range_start,
      new \DateInterval('P1D'),
      $range_end
    );

    $day_names = ['','Pon','Wt','Śr','Czw','Pt','Sob','Niedz'];

    // get rows
    $items = [];
    $days = [];

    foreach ($day_period as $d) {
      $d_index = $d->format('Y-m-d');
      $d_params['start_time'] = $d_index . ' ' . RESERVATION_TIME_START;
      $d_params['end_time'] = $d_index . ' ' . RESERVATION_TIME_END;

      $rows = $this->appointment_services->getRange(array_merge($query_params, $d_params));

      foreach ($rows as $row) {
        $d_start = substr($row['start_time'], 0, 10);
        $d_end = substr($row['end_time'], 0, 10);

        //odleglosc od godziny otwarcia w minutach
        if ($d_index == $d_start) {
          $row['offset'] = round((strtotime($row['start_time']) - strtotime($d_index . ' ' . RESERVATION_TIME_START)) / 60);
        } else {
          $row['offset'] = (int)0;
          $row['cut_start'] = 1;
        }

        //dlugosc w minutach
        if ($d_index == $d_start && $d_index == $d_end) {
          $row['duration'] = round((strtotime($row['end_time']) - strtotime($row['start_time'])) / 60);
        } else if ($d_index == $d_end) {
          $row['duration'] = round((strtotime($row['end_time']) - strtotime($d_index . ' ' . RESERVATION_TIME_START)) / 60);
        } else if ($d_index == $d_start) {
          $row['duration'] = round((strtotime($d_index . ' ' . RESERVATION_TIME_END) - strtotime($row['start_time'])) / 60);
          $row['cut_end'] = 1;
        } else {
          $row['duration'] = round((strtotime($d_index . ' ' . RESERVATION_TIME_END) - strtotime($d_index . ' ' . RESERVATION_TIME_START)) / 60);
          $row['cut_end'] = 1;
        }

        $row['hours'] = substr($row['start_time'], 11, 5) . ' - ' . substr($row['end_time'], 11, 5);

        $items[$d_index][$row['provider_id']][] = $row;
      }

      // labels
      $days[] = [
        'date' => $d_index,
        'week_day' => $day_names[(int)date('N', strtotime($d_index))]
      ];
    }

    // hours
    $hour_open = \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_START);
    $hour_period = new \DatePeriod(
      $hour_open,
      new \DateInterval('PT1H'),
      \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_END) 
    );

    foreach ($hour_period as $h) {
      $hours[] = $h->format('H:i');
    }

    $payload = [
      'items' => $items,
      'days' => $days,
      'hours' => $hours,
      'providers' => $this->providers->where('state', 1)->get(['id', 'name'])
    ];

    // echo '<pre>'; print_r($payload); exit;

    return $this->json->render($response, $payload);
  }

  

}
