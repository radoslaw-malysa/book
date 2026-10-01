<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class AppointmentProvidersRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->appointment_providers;
    $this->tables = $tables;
  }

  // get rows for calendar
  public function getRange($params = [])
  {
    $filters = [];
    if (!isset($params['state']) || !$params['state']) {
      $filters[] = "ap.state != 'cancelled' ";
    }
    if (isset($params['start_time']) && isset($params['end_time'])) {
      $filters[] = "(
        (a.start_time >= '{$params['start_time']}' and a.start_time < '{$params['end_time']}') or 
        (a.end_time > '{$params['start_time']}' and a.end_time <= '{$params['end_time']}') or 
        (a.start_time < '{$params['start_time']}' and a.end_time > '{$params['end_time']}')
      )";
    }

    $query = "select a.*, ap.state, se.name as service_name 
    from " . $this->model . " a left join " . $this->tables->appointments . " ap on a.appointment_id = ap.id 
    left join {$this->tables->services} se on ap.service_id = se.id ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $st = $this->connection->prepare($query);
    
    $st->execute();
    return $st->fetchAll();
  }

  /**
   * Edit appointment dialog
   */
  public function getGrouppedByType($params = [])
  {
    $appointment_providers = [];
    $appointment_id = $params['id'] ?? 0;

    if ($appointment_id) {
      $query = "select ap.*, se.service_type 
      from {$this->model} ap left join {$this->tables->services} se on ap.service_id = se.id 
      where ap.appointment_id = '{$appointment_id}' 
      order by ap.start_time ";

      $st = $this->connection->prepare($query);
      $st->execute();
      $rows = $st->fetchAll();

      foreach ($rows as $row) {
        $appointment_providers[$row['service_type']][] = $row;
      }
    }

    // fill with empty placeholders to edit dialog
    $placeholders = [
      'lesson' => 2,
      'tour' => 2,
      'cinema' => 1,
      'blockade' => 2
    ];

    foreach ($placeholders as $type => $type_count) {
      $services_count = (isset($appointment_providers[$type])) ? count($appointment_providers[$type]) : 0;

      if ($services_count < $type_count) {
        for ($i = 0; $i < $type_count - $services_count; $i++) {
          // fil params only for first row
          if ($services_count == 0 && $i == 0) {
            $appointment_providers[$type][] = $this->getNew([
              'appointment_id' => $appointment_id ?? 0,
              'provider_id' => $params['provider_id'] ?? 0,
              'start_time' => $params['start_time'] ?? ''
            ]);
          } else {
            $appointment_providers[$type][] = $this->getNew([
              'appointment_id' => $appointment_id ?? 0
            ]);
          }
        }
      }
    }

    return $appointment_providers;
  }

  /**
   * CRUD update appointment
   */
  public function updateAppointment($appointment_id, $data) 
  {
    if (is_array($data)) {
      $updated = [];

      foreach ($data as $item) {
        if ((isset($item['service_id']) && $item['service_id'] && isset($item['provider_id']) && $item['provider_id']) || (isset($item['notes']) && $item['notes'])) {
          $to_update_data = [
            'service_id' => $item['service_id'] ?? 0,
            'provider_id' => $item['provider_id'] ?? 0,
            'start_time' => (isset($item['start_time']) && $item['start_time']) ? $item['start_time'] : NULL,
            'end_time' => (isset($item['end_time']) && $item['end_time']) ? $item['end_time'] : NULL,
            'notes' => $item['notes'] ?? ''
          ];

          if (isset($item['id']) && $item['id'] > 0 ) {
            $this->where('id', $item['id'])->update($to_update_data);
            $updated[] = $item['id'];
          } else {
            $to_update_data['appointment_id'] = $appointment_id;
            $updated[] = $this->insert($to_update_data);
          }
        }
      }

      // delete not existing id in new dataset
      $this->where('appointment_id', $appointment_id)->where('id', 'NOT IN', $updated)->delete();
    }

    return true;
  }

  public function getNew($params = [])
  {
    return [
      'appointment_id' => $params['appointment_id'] ?? 0,
      'service_id' => 0,
      'provider_id' => $params['provider_id'] ?? 0,
      'start_time' => $params['start_time'] ?? '',
      'end_time' => ''
    ];
  }
}