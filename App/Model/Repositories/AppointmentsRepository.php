<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;
use App\Model\Repositories\ServicesRepository;
use App\Model\Repositories\AppointmentProvidersRepository;
use App\Model\Repositories\ProvidersRepository;
use App\Model\Repositories\CustomersRepository;

/**
 * Repository.
 */
class AppointmentsRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables, ServicesRepository $services, AppointmentProvidersRepository $appointment_providers, ProvidersRepository $providers, CustomersRepository $customers)
  {
    $this->connection = $connection;
    $this->model = $tables->appointments;
    $this->tables = $tables;
    $this->services = $services;
    $this->appointment_providers = $appointment_providers;
    $this->providers = $providers;
    $this->customers = $customers;
  }

  // CRUD
  /*public function _getRows($params = []) 
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
  }*/

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
    from " . $this->model . " ap 
    left join {$this->tables->services} se on ap.service_id = se.id 
    left join {$this->tables->customers} cu on ap.customer_id = cu.id ";
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
    $query = "select ap.*, se.name as service_name, cu.name as customer_name 
    from " . $this->model . " ap 
    left join {$this->tables->services} se on ap.service_id = se.id 
    left join {$this->tables->customers} cu on ap.customer_id = cu.id ";
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
    } else {
      $data = $this->where('id', (int)$params['id'])->first();
    }

    // remove null
    $data['total_price'] = $data['total_price'] ? $data['total_price'] : '';

    // appointment_providers
    $data['appointment_providers'] = $this->appointment_providers->where('appointment_id', (int)$params['id'])->get();

    // services select
    $data['services'] = $this->services->get(['id','name']);

    // providers select (sale)
    $data['providers'] = $this->providers->get(['id','name']);

    // customer
    $data['customer'] = $this->customers->where('id', $data['customer_id'])->first();
    $data['customer']['customer_type'] = $data['customer']['customer_type'] ? $data['customer']['customer_type'] : '';
    
    return $data;
  }

  public function postRow($params=[])
  {
    //if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'Wypełnij nazwę warsztatów']; }
    if (!isset($params['state']) || !$params['state']) { return ['error' => 2, 'message' => 'Ustaw status rezerwacji']; }

    $data = [
      'service_id' => $params['service_id'] ?? 0,
      'customer_id' => $params['customer_id'] ?? 0,
      'admission' => $params['admission'] ?? 0,
      'guide' => $params['guide'] ?? 0,
      'cinema' => $params['cinema'] ?? 0,
      'kulturalna_szkola' => $params['kulturalna_szkola'] ?? 0,
      'kultura_za_zl' => $params['kultura_za_zl'] ?? 0,
      'pax' => $params['pax'] ?? 0,
      'notes' => $params['notes'] ?? '',
      'state' => $params['state'],
      'update_ip' => $_SERVER['REMOTE_ADDR']
    ];
    
    if (isset($params['id']) && $params['id']) {
      $status = $this->where('id', (int)$params['id'])->update($data);
    } elseif ($params['id'] == 0) {
      $data['create_ip'] = $_SERVER['REMOTE_ADDR'];

      $status = $this->insert($data);
    }

    // appointment_providers
    if (isset($params['appointment_providers'])) {
      $this->appointment_providers->updateAppointment($params['id'], $params['appointment_providers']);
    }

    // customer
    if (isset($params['customer'])) {
      $this->customers->updateCustomer($params['customer']);
    }

    return $data;
  }

  public function getNew()
  {
    $new_row = [
      'id' => 0,
      'service_id' => 0,
      'customer_id' => 0,
      'salon_id' => 1,
      'state' => 'pending',
      'total_price' => 0,
      'notes' => '',
      'create_time' => '',
      'create_ip' => '',
      'update_time' => '',
      'update_ip' => ''
    ];

    return $new_row;
  }
}