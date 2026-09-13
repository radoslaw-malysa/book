<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;
use App\Model\Repositories\CategoriesRepository;

/**
 * Repository.
 */
class ServicesRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables, CategoriesRepository $categories)
  {
    $this->connection = $connection;
    $this->model = $tables->services;
    $this->tables = $tables;
    $this->categories = $categories;
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
      $data = $this->getNew();
    } else {
      $data = $this->where($this->model.'.id', (int)$params['id'])->first();
    }
    
    $data['categories'] = $this->categories->get();

    return $data;
  }

  public function postRow($params=[])
  {
    if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'Wypełnij nazwę warsztatów']; }
    if (!isset($params['state']) || !$params['state'] || $params['state'] === '0') { return ['error' => 2, 'message' => 'Ustaw status']; }

    $data = [
      'name' => $params['name'] ?? '',
      'description' => $params['description'] ?? '',
      'price' => $params['price'] ?? 0,
      'duration' => $params['duration'] ?? 0,
      'online' => $params['online'] ?? 0,
      'state' => $params['state'] ?? 0,
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