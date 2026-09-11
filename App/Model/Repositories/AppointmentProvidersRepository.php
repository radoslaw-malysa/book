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

  /*public function getRows($params = []) 
  {
    $filters = [];
    $per_page = 5; //pagination

    if (isset($params['q']) && $params['q']) {
      $filters[] = "(se.name like :name or se.description like :description) ";
      $q_param = '%'.$params['q'].'%';
    }

    // deleted state
    if (!isset($params['state']) || !$params['state']) {
      $filters[] = "ap.state != '3' ";
    }

    // count all records
    $query = "select count(*) 
    from " . $this->model . " ap ";
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
    $query = "select ap.* 
    from " . $this->model . " ap ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $query .= " order by ap.id desc ";
    $query .= ($offset) ? (" limit " . $offset . ", " . $per_page) : '';
    $st = $this->connection->prepare($query);
    
    if (isset($params['q']) && $params['q']) {
      $st->bindParam(':name', $q_param, PDO::PARAM_STR);
      $st->bindParam(':description', $q_param, PDO::PARAM_STR);
    }

    $st->execute();
    $items = $st->fetchAll();

    $paginator->setResults($items);

    return $paginator;
  }*/
}