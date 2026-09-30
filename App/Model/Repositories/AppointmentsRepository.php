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
  public function getRows($params = []) 
  {
    $filters = [];
    $per_page = 5; //pagination

    if (isset($params['q']) && $params['q']) {
      $filters[] = "(cu.name like :name) ";
      $q_param = '%'.$params['q'].'%';
    }
    if (isset($params['from']) && $params['from']) {
      $filters[]= "ap.visit_time >= '{$params['from']} 00:00:00' ";
    }
    if (isset($params['to']) && $params['to']) {
      $filters[]= "ap.visit_time <= '{$params['to']} 23:59:59' ";
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
      //$st->bindParam(':description', $q_param, PDO::PARAM_STR);
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
      //$st->bindParam(':description', $q_param, PDO::PARAM_STR);
    }

    $st->execute();
    $items = $st->fetchAll();

    $paginator->setResults($items);

    return $paginator;
  }

  public function getRow($params=[])
  {   
    $is_new = (!isset($params['id']) || $params['id'] == 0);

    if ($is_new) {
      $data = $this->getNew();
    } else {
      $data = $this->where('id', (int)$params['id'])->first();
    }

    // remove null
    $data['total_price'] = $data['total_price'] ? $data['total_price'] : '';
    $data['sell_price'] = $data['sell_price'] ? $data['sell_price'] : '';

    // appointment_providers
    $data['appointment_providers'] = $this->appointment_providers->getGrouppedByType($params);

    // services select
    $data['services'] = $this->services->getGrouppedByType();

    // providers select (sale)
    $data['providers'] = $this->providers->get(['id','name']);

    // customer
    $data['customer'] = (!$is_new) ? $this->customers->where('id', $data['customer_id'])->first() : $this->customers->getNew();
    $data['customer']['customer_type'] = $data['customer']['customer_type'] ? $data['customer']['customer_type'] : '';

    // params from calendar click
    if ($is_new && isset($params['visit_time']) && $params['visit_time']) { 
      $data['visit_time'] = $params['visit_time']; 

      if (isset($params['provider_id']) && $params['provider_id']) {
        $data['appointment_providers'][0]['provider_id'] = (int)$params['provider_id'];
        $data['appointment_providers'][0]['start_time'] = $params['visit_time'];
      }
    }
    
    return $data;
  }

  public function postRow($params=[])
  {    
    if ($params['lesson'] == 1) { 
      if (!$params['appointment_providers']['lesson'][0]['service_id']) { return ['error' => 2, 'message' => 'Wybierz warsztaty.']; }
      if (!$params['appointment_providers']['lesson'][0]['provider_id']) { return ['error' => 2, 'message' => 'Wybierz salę dla warszatów']; }
      if (!$params['appointment_providers']['lesson'][0]['start_time']) { return ['error' => 2, 'message' => 'Wypełnij czas rozpoczęcia rezerwacji sali.']; }
      if (!isValidDateTime($params['appointment_providers']['lesson'][0]['start_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas rozpoczęcia zajęć w sali.']; }
      if (!$params['appointment_providers']['lesson'][0]['end_time']) { return ['error' => 2, 'message' => 'Wypełnij czas zakończenia zajęć w sali.']; }
      if (!isValidDateTime($params['appointment_providers']['lesson'][0]['end_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas zakończenia zajęć w sali.']; }
    }
    if ($params['tour'] == 1) { 
      if (!$params['appointment_providers']['tour'][0]['service_id']) { return ['error' => 2, 'message' => 'Wybierz rodzaj zwiedzania.']; }
      if (!$params['appointment_providers']['tour'][0]['provider_id']) { return ['error' => 2, 'message' => 'Wybierz salę.']; }
      if (!$params['appointment_providers']['tour'][0]['start_time']) { return ['error' => 2, 'message' => 'Wypełnij czas rozpoczęcia rezerwacji sali.']; }
      if (!isValidDateTime($params['appointment_providers']['tour'][0]['start_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas rozpoczęcia zajęć w sali.']; }
      if (!$params['appointment_providers']['tour'][0]['end_time']) { return ['error' => 2, 'message' => 'Wypełnij czas zakończenia zajęć w sali.']; }
      if (!isValidDateTime($params['appointment_providers']['tour'][0]['end_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas zakończenia zajęć w sali.']; }
    }
    if ($params['blockade'] == 1) { 
      if (!$params['appointment_providers']['blockade'][0]['service_id']) { return ['error' => 2, 'message' => 'Wybierz rodzaj blokady sali.']; }
      if (!$params['appointment_providers']['blockade'][0]['provider_id']) { return ['error' => 2, 'message' => 'Wybierz salę.']; }
      if (!$params['appointment_providers']['blockade'][0]['start_time']) { return ['error' => 2, 'message' => 'Wypełnij początek blokady sali.']; }
      if (!isValidDateTime($params['appointment_providers']['blockade'][0]['start_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas rozpoczęcia blokady sali.']; }
      if (!$params['appointment_providers']['blockade'][0]['end_time']) { return ['error' => 2, 'message' => 'Wypełnij koniec blokady sali.']; }
      if (!isValidDateTime($params['appointment_providers']['blockade'][0]['end_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas zakończenia blokady sali.']; }
    }

    $id = (int)$params['id'];

    // customer first: 1-1 relation
    if (isset($params['customer'])) {
      $params['customer_id'] = $this->customers->updateCustomer($params['customer']);
    }

    // visit_date
    


    $data = [
      'service_id' => $params['service_id'] ?? 0,
      'customer_id' => $params['customer_id'] ?? 0,
      'visit_time' => (isset($params['visit_time']) && $params['visit_time']) ? $params['visit_time'] : NULL,
      'lesson' => (isset($params['lesson']) && $params['lesson']) ? (int)$params['lesson'] : 0,
      'tour' => (isset($params['tour']) && $params['tour']) ? (int)$params['tour'] : 0,
      'cinema' => (isset($params['cinema']) && $params['cinema']) ? (int)$params['cinema'] : 0,
      'blockade' => (isset($params['blockade']) && $params['blockade']) ? (int)$params['blockade'] : 0,
      'kulturalna_szkola' => (isset($params['kulturalna_szkola']) && $params['kulturalna_szkola']) ? (int)$params['kulturalna_szkola'] : 0,
      'kultura_za_zl' => (isset($params['kultura_za_zl']) && $params['kultura_za_zl']) ? (int)$params['kultura_za_zl'] : 0,
      'pax' => (isset($params['pax']) && $params['pax']) ? (int)$params['pax'] : 0,
      'notes' => $params['notes'] ?? '',
      'total_price' => $params['total_price'] ? $params['total_price'] : 0,
      'sell_price' => $params['sell_price'] ? $params['sell_price'] : 0,
      'sell_doc' => $params['sell_doc'] ?? 0,
      'state' => $params['state'],
      'update_ip' => $_SERVER['REMOTE_ADDR']
    ];
    
    if ($id > 0) {
      $status = $this->where('id', $id)->update($data);
    } else {
      $data['create_ip'] = $_SERVER['REMOTE_ADDR'];

      $id = $this->insert($data);
    }

    // appointment_providers
    if ($id && isset($params['appointment_providers'])) {
      $appointment_providers = [];

      // duplicate attributes from first row
      if (isset($params['lesson']) && $params['lesson']) {
        if ($params['appointment_providers']['lesson'][1]['provider_id'] > 0) {
          $params['appointment_providers']['lesson'][1]['service_id'] = $params['appointment_providers']['lesson'][0]['service_id'];
          $params['appointment_providers']['lesson'][1]['start_time'] = $params['appointment_providers']['lesson'][0]['start_time'];
          $params['appointment_providers']['lesson'][1]['end_time'] = $params['appointment_providers']['lesson'][0]['end_time'];
        } else {
          unset($params['appointment_providers']['lesson'][1]);
        }
        array_push($appointment_providers, ...$params['appointment_providers']['lesson']);
      }

      if (isset($params['tour']) && $params['tour']) {
        if (isset($params['appointment_providers']['tour'][1]['provider_id']) && $params['appointment_providers']['tour'][1]['provider_id'] > 0) {
          $params['appointment_providers']['tour'][1]['service_id'] = $params['appointment_providers']['tour'][0]['service_id'];
          $params['appointment_providers']['tour'][1]['start_time'] = $params['appointment_providers']['tour'][0]['start_time'];
          $params['appointment_providers']['tour'][1]['end_time'] = $params['appointment_providers']['tour'][0]['end_time'];
        } else {
          unset($params['appointment_providers']['tour'][1]);
        }
        array_push($appointment_providers, ...$params['appointment_providers']['tour']);
      }

      if (isset($params['blockade']) && $params['blockade']) {
        if (isset($params['appointment_providers']['blockade'][1]['provider_id']) && $params['appointment_providers']['blockade'][1]['provider_id'] > 0) {
          $params['appointment_providers']['blockade'][1]['service_id'] = $params['appointment_providers']['blockade'][0]['service_id'];
          $params['appointment_providers']['blockade'][1]['start_time'] = $params['appointment_providers']['blockade'][0]['start_time'];
          $params['appointment_providers']['blockade'][1]['end_time'] = $params['appointment_providers']['blockade'][0]['end_time'];
        } else {
          unset($params['appointment_providers']['blockade'][1]);
        }
        array_push($appointment_providers, ...$params['appointment_providers']['blockade']);
      }

      $this->appointment_providers->updateAppointment($id, $appointment_providers);
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
      'visit_time' => '',
      'lesson' => 0,
      'tour' => 0,
      'cinema' => 0,
      'blockade' => 0,
      'kulturalna_szkola' => 0,
      'kultura_za_zl' => 0,
      'pax' => 0,
      'notes' => '',
      'state' => 'pending',
      'total_price' => 0,
      'sell_price' => 0,
      'sell_doc' => '',
      'create_time' => '',
      'create_ip' => '',
      'update_time' => '',
      'update_ip' => ''
    ];

    return $new_row;
  }
}
