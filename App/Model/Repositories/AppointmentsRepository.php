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
  public function getRows($params = []) 
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
}