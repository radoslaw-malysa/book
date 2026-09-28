<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;
use App\Model\Repositories\CategoriesRepository;
use App\Model\Repositories\ServiceScheduleRepository;
use App\Model\Repositories\CategoriesServicesRepository;
use App\Model\Repositories\ProvidersServicesRepository;

/**
 * Repository.
 */
class ServicesRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables, CategoriesRepository $categories, ServiceScheduleRepository $service_schedule, CategoriesServicesRepository $categories_services, ProvidersServicesRepository $providers_services)
  {
    $this->connection = $connection;
    $this->model = $tables->services;
    $this->tables = $tables;
    $this->categories = $categories;
    $this->service_schedule = $service_schedule;
    $this->categories_services = $categories_services;
    $this->providers_services = $providers_services;
  }

  /**
   * For appointment edit dialog
   */
  public function getGrouppedByType()
  {
    $services = [];

    $rows = $this->get(['id','name', 'service_type']);
    foreach ($rows as $row) {
      $services[$row['service_type']][] = [
        'id' => $row['id'],
        'name' => $row['name']
      ];
    }

    return $services;
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

    // remove null
    $data['price'] = $data['price'] ? $data['price'] : '';
    $data['duration'] = $data['duration'] ? $data['duration'] : '';
    
    $data['categories'] = $this->categories_services->getServiceCategories($data['id']);
    $data['schedule'] = $this->service_schedule->getServiceScheduleEdit($data['id']);
    $data['providers'] = $this->providers_services->getServiceProviders($data['id']); // sale

    return $data;
  }

  public function postRow($params=[])
  {
    //$params = json_decode('{"id":0,"service_type":"cinema","name":"Kino","description":"","price":"","duration":"","online":"","pax_min":"","pax_max":"","state":1,"create_time":"","create_ip":"","update_time":"","update_ip":"","categories":[{"id":1,"name":"Przedszkola oraz klasy I-III szkół podstawowych","selected":0},{"id":2,"name":"Klasy IV-VIII szkół podstawowych","selected":0},{"id":3,"name":"Uczniowie szkół ponadpodstawowych","selected":0},{"id":4,"name":"Dorośli i seniorzy","selected":0},{"id":5,"name":"Rodziny","selected":0},{"id":6,"name":"Osoby z niepełnosprawnościami","selected":0}],"schedule":{"1":["","","",""],"2":["","","",""],"3":["","","",""],"4":["","","",""],"5":["","","",""],"6":["","","",""],"7":["","","",""]},"providers":[{"id":5,"name":"Biblioteka","selected":0},{"id":4,"name":"Piec","selected":0},{"id":3,"name":"Sala edukacyjna","selected":0},{"id":1,"name":"Sala wystawowa 1 piętro","selected":0},{"id":2,"name":"Sala wystawowa parter","selected":0}]}', true);
  
    if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'Wypełnij nazwę warsztatów']; }
    if (!isset($params['state']) || !$params['state'] || $params['state'] === '0') { return ['error' => 2, 'message' => 'Ustaw status']; }

    $data = [
      'service_type' => $params['service_type'] ?? 'lesson',
      'name' => $params['name'] ?? '',
      'description' => $params['description'] ?? '',
      'price' => (isset($params['price']) && $params['price']) ? $params['price'] : 0,
      'duration' => (isset($params['duration']) && $params['duration']) ? (int)$params['duration'] : 0,
      'online' => (isset($params['online']) && $params['online']) ? (int)$params['online'] : 0,
      'pax_min' => (isset($params['pax_min']) && $params['pax_min']) ? (int)$params['pax_min'] : 0,
      'pax_max' => (isset($params['pax_max']) && $params['pax_max']) ? (int)$params['pax_max'] : 0,
      'state' => (isset($params['state']) && $params['state']) ? (int)$params['state'] : 0,
      'update_ip' => $_SERVER['REMOTE_ADDR']
    ];
    
    if (isset($params['id']) && $params['id']) {
      $status = $this->where('id', (int)$params['id'])->update($data);
    } else {
      $data['create_ip'] = $_SERVER['REMOTE_ADDR'];

      $status = $this->insert($data);
    }

    // categories
    if (isset($params['categories'])) {
      $this->categories_services->updateServiceCategories($params['id'], $params['categories']);
    }

    // schedule
    if (isset($params['schedule'])) {
      $this->service_schedule->updateServiceSchedule($params['id'], $params['schedule']);
    }

    // providers (sale)
    if (isset($params['providers'])) {
      $this->providers_services->updateServiceProviders($params['id'], $params['providers']);
    }

    return $data;
  }

  public function getNew()
  {
    $new_row = [
      'id' => 0,
      'service_type' => 'lesson',
      'name' => '',
      'description' => '',
      'price' => '',
      'duration' => '',
      'online' => '',
      'pax_min' => '',
      'pax_max' => '',
      'state' => 1,
      'create_time' => '',
      'create_ip' => '',
      'update_time' => '',
      'update_ip' => ''
    ];

    return $new_row;
  }
}