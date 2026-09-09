<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class AppointmentsRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->appointments;
    $this->tables = $tables;
  }

  // CRUD
  public function _getRows($params = []) 
  {
    // $filters = $this->createFilters($params);
    $filters = '';

    // count all records
    $query = "select count(*) 
    from " . $this->model . " ap 
    left join " . $this->tables->customers . " cu on ap.customer_id = cu.id ";
    $query .= ($filters) ? 'where '. $filters : '';
    
    $st = $this->connection->prepare($query);
    $st->execute();
    $total_items = $st->fetchColumn();
    
    // actual query
    $query = "select ap.* 
    from " . $this->model . " ap 
    left join " . $this->tables->customers . " cu on ap.customer_id = cu.id ";
    
    $query .= ($filters) ? 'where '. $filters : '';
    $query .= " order by ap.id desc";
    $st = $this->connection->prepare($query);
    $st->execute();
    $items = $st->fetchAll();

    $paginator = new Paginator([], $total_items, 50, $params['page'], '');
    $paginator->setResults($items);

    return $paginator;
  }

  public function getRows($params = []) 
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
        $this->model.'.state', 
        $this->model.'.update_time', 
        $this->model.'.update_ip'
    ]);
  }

  public function postRow($params=[])
  {
    if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'Wypełnij nazwę warsztatów']; }
    if (!isset($params['state']) || !$params['state'] || $params['state'] === '0') { return ['error' => 2, 'message' => 'Ustaw status']; }

    $data = [
      'name' => $params['name'] ?? '',
      'description' => $params['description'] ?? '',
      'state' => (int)$params['state'],
      'update_ip' => $_SERVER['REMOTE_ADDR']
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
      'state' => 1,
      'create_time' => '',
      'create_ip' => '',
      'update_time' => '',
      'update_ip' => ''
    ];

    return $new_row;
  }
}