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

    // count all records
    $query = "select count(*) 
    from " . $this->model . " ap 
    left join " . $this->tables->services . " se on ap.service_id = se.id
    left join " . $this->tables->locations . " lb on rb.id_location = lb.id 
    left join " . $this->tables->locations . " le on re.id_location = le.id 
    left join " . $this->tables->companies . " co on sh.id_orderer = co.id 
    left join " . $this->tables->companies . " cs on sh.id_supplier = cs.id ";
    $query .= ($filters) ? 'where '. $filters : '';
    $query .= " group by sh.id";
    
    $st = $this->connection->prepare($query);
    $st->execute();
    $total_items = $st->fetchColumn();
    
    // actual query
    $query = "select sh.*, 
    rb.scheduled_time as begin_planned_time,
    re.scheduled_time as end_planned_time,
    lb.country_code as begin_country_code, lb.city as begin_city,
    le.country_code as end_country_code, le.city as end_city,
    co.shortname as orderer_name,
    cs.shortname as supplier_name,  
    now() as server_time 
    from " . $this->model . " sh 
    left join " . $this->tables->route_stops . " rb on sh.id_route_begin = rb.id 
    left join " . $this->tables->route_stops . " re on sh.id_route_end = re.id
    left join " . $this->tables->locations . " lb on rb.id_location = lb.id 
    left join " . $this->tables->locations . " le on re.id_location = le.id 
    left join " . $this->tables->companies . " co on sh.id_orderer = co.id 
    left join " . $this->tables->companies . " cs on sh.id_supplier = cs.id ";
    
    $query .= ($filters) ? 'where '. $filters : '';
    $query .= " group by sh.id order by sh.id desc";
    $st = $this->connection->prepare($query);
    $st->execute();
    $items = $st->fetchAll();

    $paginator = new Paginator([], $total_items, 50, $params['page'], '');
    $paginator->setResults($items);

    return $paginator;
  }
}