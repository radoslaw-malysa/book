<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class ServiceScheduleRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->service_schedule;
    $this->tables = $tables;
  }

  /**
   * Get service schedule (Edit service dialog)
   */
  public function getServiceScheduleEdit($service_id)
  {
    $hours_count = 4; // number of placeholders in day schedule
    $data = []; // response

    $schedule = [];
    $data_schedule = $this->where('service_id', $service_id)->orderBy('day_of_week')->orderBy('start_time')->get();

    foreach ($data_schedule as $row) {
      $schedule[$row['day_of_week']][$row['ord']] = $row;
    }

    for ($day = 1; $day < 8; $day++) {
      for ($hour = 0; $hour < $hours_count; $hour++) {
        $data[$day][$hour] = $schedule[$day][$hour]['start_time'] ?? '';
      }
    }

    return $data;
  }

  /**
   * Update service schedule (Edit service dialog)
   */
  public function updateServiceSchedule($service_id, $schedule = [])
  {
    $before = [];
    $data_schedule = $this->where('service_id', $service_id)->orderBy('day_of_week')->orderBy('start_time')->get(['id','day_of_week','ord']);

    foreach ($data_schedule as $row) {
      $before[$row['day_of_week']][$row['ord']] = $row['id'];
    }

    if (is_array($schedule)) {
      foreach ($schedule as $day => $items) {
        foreach ($items as $index => $item) {
          if ($item && !isset($before[$day][$index])) {
            $this->insert([
              'service_id' => $service_id,
              'day_of_week' => $day,
              'start_time' => $item,
              'ord' => $index
            ]);
          } elseif ($schedule && isset($before[$day][$index])) {
            $this->where('id', $before[$day][$index])->update([
              'start_time' => $item
            ]);
          } elseif (isset($before[$day][$index])) {
            $this->where('id', $before[$day][$index])->delete();
          }
        }
      }
    }

    return true;
  }

  public function getRows($params = []) 
  {

  }

  public function getRow($params=[])
  { 

  }

  public function postRow($params=[])
  {

  }

  public function getNew()
  {

  }
}