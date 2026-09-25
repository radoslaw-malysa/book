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
    /*$json = '{"id":0,"service_id":"2","customer_id":0,"salon_id":1,"visit_time":"2026-09-28 08:00","admission":0,"guide":0,"cinema":0,"kulturalna_szkola":0,"kultura_za_zl":0,"pax":"20","notes":"test nr 2","state":"pending","total_price":"","sell_price":"","sell_doc":"","create_time":"","create_ip":"","update_time":"","update_ip":"","appointment_providers":[{"appointment_id":0,"provider_id":1,"start_time":"2026-09-28 08:00","end_time":"2026-09-28T10:30"}],"services":[{"id":1,"name":"Rezerwacja sali"},{"id":2,"name":"Spacer po wystawie i warsztaty plastyczne"},{"id":3,"name":"Nowe Horyzonty Edukacji Filmowej"},{"id":4,"name":"Warsztaty ruchowo-plastyczne podczas spaceru po wystawie"},{"id":5,"name":"Seanse filmowe z bieżącego repertuaru"},{"id":6,"name":"Warsztaty sensoryczno-plastyczne „Bajki z pieca”"},{"id":7,"name":"Filmowe pokazy specjalne"}],"providers":[{"id":1,"name":"Sala edukacyjna 1"},{"id":2,"name":"Sala wystawowa"}],"customer":{"id":0,"customer_type":"","name":"","address":"","email":"","phone":"","contact_name":"","contact_phone":"","contact_email":"","pax_care":0,"accept_processing":0,"accept_regulations":0,"accept_kultura_zl":0}}';
    $params = json_decode($json, true);
    $test = [];
  
    if (!isset($params['state']) || !$params['state']) { $test[] = ['error' => 2, 'message' => 'Ustaw status rezerwacji']; }
    if (!isset($params['visit_time']) || !$params['visit_time'] || !isValidDateTime($params['visit_time'])) { $test[] = ['error' => 2, 'message' => 'Wypełnij datę wizyty.']; }
    if (isset($params['appointment_providers'][0]['provider_id']) && $params['appointment_providers'][0]['provider_id']) { 
      
      if (!$params['appointment_providers'][0]['start_time']) { echo 'dupa'; $test[] = ['error' => 2, 'message' => 'Wypełnij czas rozpoczęcia bookingu sali.']; } else { echo 'zzzz'; }
      if (!isValidDateTime($params['appointment_providers'][0]['start_time'])) { $test[] = ['error' => 2, 'message' => 'Nieprawidłowy czas rozpoczęcia zajęć w sali.']; } else { echo 'xxxxx'; }
      if (!$params['appointment_providers'][0]['end_time']) { $test[] = ['error' => 2, 'message' => 'Wypełnij czas zakończenia zajęć w sali.']; }
      if (!isValidDateTime($params['appointment_providers'][0]['end_time'])) { $test[] = ['error' => 2, 'message' => 'Nieprawidłowy czas zakończenia zajęć w sali.']; }
    }
    print_r($test);
    exit;*/
  
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
    $data['appointment_providers'] = (!$is_new) ? $this->appointment_providers->where('appointment_id', (int)$params['id'])->get() : $this->appointment_providers->getNew();

    // services select
    $data['services'] = $this->services->get(['id','name']);

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
    if (!isset($params['state']) || !$params['state']) { return ['error' => 2, 'message' => 'Ustaw status rezerwacji']; }
    if (!isset($params['visit_time']) || !$params['visit_time'] || !isValidDateTime($params['visit_time'])) { return ['error' => 2, 'message' => 'Wypełnij prawidłową datę wizyty.']; }
    if (isset($params['appointment_providers'][0]['appointment_id'])) { 
      if (!$params['appointment_providers'][0]['start_time']) { return ['error' => 2, 'message' => 'Wypełnij czas rozpoczęcia bookingu sali.']; }
      if (!isValidDateTime($params['appointment_providers'][0]['start_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas rozpoczęcia zajęć w sali.']; }
      if (!$params['appointment_providers'][0]['end_time']) { return ['error' => 2, 'message' => 'Wypełnij czas zakończenia zajęć w sali.']; }
      if (!isValidDateTime($params['appointment_providers'][0]['end_time'])) { return ['error' => 2, 'message' => 'Nieprawidłowy czas zakończenia zajęć w sali.']; }
    }
    
    $id = (int)$params['id'];

    // customer first: 1-1 relation
    if (isset($params['customer'])) {
      $params['customer_id'] = $this->customers->updateCustomer($params['customer']);
    }

    $data = [
      'service_id' => $params['service_id'] ?? 0,
      'customer_id' => $params['customer_id'] ?? 0,
      'visit_time' => $params['visit_time'] ?? NULL,
      'lesson' => $params['lesson'] ?? 0,
      'tour' => $params['tour'] ?? 0,
      'cinema' => $params['cinema'] ?? 0,
      'blockade' => $params['blockade'] ?? 0,
      'kulturalna_szkola' => $params['kulturalna_szkola'] ?? 0,
      'kultura_za_zl' => $params['kultura_za_zl'] ?? 0,
      'pax' => $params['pax'] ?? 0,
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
    if (isset($params['appointment_providers'])) {
      $this->appointment_providers->updateAppointment($id, $params['appointment_providers']);
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
