<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class ProvidersRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->providers;
    $this->tables = $tables;
  }

  public function getRows($params = []) 
  {
    $filters = [];
    $per_page = 5; //pagination

    if (isset($params['q']) && $params['q']) {
      $filters[] = "(pr.name like :name or pr.description like :description) ";
      $q_param = '%'.$params['q'].'%';
    }

    // deleted state
    if (!isset($params['state']) || !$params['state']) {
      $filters[] = "pr.state != '3' ";
    }

    // count all records
    $query = "select count(*) 
    from " . $this->model . " pr ";
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
    $query = "select pr.* 
    from " . $this->model . " pr ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $query .= " order by pr.ord ";
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
    
    return $this->where($this->model.'.id', (int)$params['id'])->first();
  }

  public function postRow($params=[])
  {
    if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'Wypełnij nazwę']; }
    if (!isset($params['state']) || !$params['state'] || $params['state'] === '0') { return ['error' => 2, 'message' => 'Ustaw status']; }

    $data = [
      'name' => $params['name'] ?? '',
      'description' => $params['description'] ?? '',
      'state' => (int)$params['state'],
      'ord' => $params['ord'] ?? 0
    ];
    
    if (isset($params['id']) && $params['id']) {
      $status = $this->where('id', (int)$params['id'])->update($data);
    } else {
      $data['salon_id'] = 1;

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
      'ord' => 0
    ];

    return $new_row;
  }
}