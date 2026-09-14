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
    $filters = [];
    $per_page = 50; //pagination

    if (isset($params['q']) && $params['q']) {
      $filters[] = "(se.name like :name or se.description like :description) ";
      $q_param = '%'.$params['q'].'%';
    }

    // deleted state
    if (!isset($params['state']) || !$params['state']) {
      $filters[] = "se.state != '3' ";
    }

    // count all records
    $query = "select count(*) 
    from " . $this->model . " se ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $st = $this->connection->prepare($query);
    
    if (isset($params['q']) && $params['q']) {
      $st->bindParam(':name', $q_param, PDO::PARAM_STR);
      $st->bindParam(':description', $q_param, PDO::PARAM_STR);
    }

    $st->execute();
    $total_items = $st->fetchColumn();
    
    // paginate
    $paginator = new Paginator([], $total_items, $per_page, $params['page'] ?? 1, '');
    $offset = $paginator->getCurrentPageFirstItem();

    // actual query
    $query = "select se.* 
    from " . $this->model . " se ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $query .= " order by se.id desc ";
    $query .= ($per_page) ? (" limit " . $offset . ", " . $per_page) : '';
    $st = $this->connection->prepare($query);
    
    if (isset($params['q']) && $params['q']) {
      $st->bindParam(':name', $q_param, PDO::PARAM_STR);
      $st->bindParam(':description', $q_param, PDO::PARAM_STR);
    }

    $st->execute();
    $items = $st->fetchAll();

    $paginator->setResults($items);

    return $paginator;
  }

  public function getRow($params=[])
  { 
    if (!isset($params['id']) || $params['id'] == 0) {
      return $this->getNew();
    }
    
    return $this->where($this->model.'.id', (int)$params['id'])
      ->first([
        $this->model.'.id', 
        $this->model.'.name', 
        $this->model.'.description', 
        $this->model.'.state'
    ]);
  }

  public function postRow($params=[])
  {
    if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'Wypełnij nazwę warsztatów']; }
    if (!isset($params['state']) || !$params['state'] || $params['state'] === '0') { return ['error' => 2, 'message' => 'Ustaw status']; }

    $data = [
      'name' => $params['name'] ?? '',
      'description' => $params['description'] ?? '',
      'state' => (int)$params['state']
    ];
    
    if (isset($params['id']) && $params['id']) {
      $status = $this->where('id', (int)$params['id'])->update($data);
    } else {
      $data['create_ip'] = $_SERVER['REMOTE_ADDR'];

      $status = $this->insert($data);
    }

    return $data;
  }

  public function getNew()
  {
    $new_row = [
      'id' => 0,
      'name' => '',
      'description' => '',
      'state' => 1
    ];

    return $new_row;
  }
}