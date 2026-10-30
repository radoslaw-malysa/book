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
    $per_page = 50; //pagination

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
    
    // service_id
    $service_id = 0;
    if ($params['lesson'] == 1) {
      $service_id = $params['appointment_providers']['lesson'][0]['service_id'] ?? 0;
    } elseif ($params['tour'] == 1) {
      $service_id = $params['appointment_providers']['tour'][0]['service_id'] ?? 0;
    } elseif ($params['blockade'] == 1) {
      $service_id = $params['appointment_providers']['blockade'][0]['service_id'] ?? 0;
    } elseif ($params['cinema'] == 1) {
      $service_id = $params['appointment_providers']['cinema'][0]['service_id'] ?? 0;
    }

    $data = [
      'service_id' => $service_id ?? 0,
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

      if (isset($params['cinema']) && $params['cinema']) {
        array_push($appointment_providers, ...$params['appointment_providers']['cinema']);
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

  // BOOKING

  public function getCalculation($appointment)
  {
    // wszsytkie pozycje (może które mają cene > 0)
    $query = "select id, service_type, name, price, " . (int)$appointment['pax'] . " as quantity, price * " . (int)$appointment['pax'] . " as value
    from {$this->tables->services} 
    where id IN(select service_id from {$this->tables->appointment_providers} where appointment_id='" . $appointment['id'] . "' group by service_id)";
    
    $st = $this->connection->prepare($query);
    $st->execute();
    $prices = $st->fetchAll();

    return $prices;
  }

  /**
   * Save web reservation
   */
  public function postBooking($params=[])
  {
    // validation
    if (!isset($params['client']) || !$params['client']) { return ['error' => 1, 'message' => 'Brak danych klienta']; }
    if (!isset($params['appointment']) || !$params['appointment']) { return ['error' => 1, 'message' => 'Brak danych rezerwacji']; }
    //if (!isset($appointment['visit_date']) || !$appointment['visit_date']) { return ['error' => 1, 'message' => 'Brak daty wizyty']; }
    //if (!isset($appointment['visit_time']) || !$appointment['visit_time']) { return ['error' => 1, 'message' => 'Brak godziny wizyty']; }

    // client
    $customer = $params['client'];
    try {
      $customer_id = $this->customers->insert([
        'customer_type' => (isset($customer['customer_type']) && $customer['customer_type']) ? $customer['customer_type'] : NULL,
        'name' => $customer['name'] ?? '',
        'address' => $customer['address'] ?? '',
        'zip' => $customer['zip'] ?? '',
        'city' => $customer['city'] ?? '',
        'email' => $customer['email'] ?? '',
        'phone' => $customer['phone'] ?? '',
        'contact_name' => $customer['contact_name'] ?? '',
        'contact_phone' => $customer['contact_phone'] ?? '',
        'contact_email' => $customer['contact_email'] ?? '',
        'pax_care' => $customer['pax_care'] ?? 0,
        'notes' => $customer['notes'] ?? '',
        'accept_processing' => $customer['accept_processing'] ?? 0,
        'accept_regulations' => $customer['accept_regulations'] ?? 0,
        'accept_kultura_zl' => $customer['accept_kultura_zl'] ?? 0
      ]);
    } catch(Exception $e) {
      $message = $e->getMessage();
      return ['error' => 1, 'message' => $message ?? 'Nie udało się dodać klienta'];
    }
    if (!isset($customer_id) || !$customer_id) { return ['error' => 1, 'message' => 'Nie udało się dodać danych klienta']; }

    // appointment
    $appointment = $params['appointment'];
    $lesson = $appointment['lesson'] ?? [];
    $guide = $appointment['guide'] ?? [];

    if (isset($lesson['id'])) {
      $service_id = $lesson['id'];
    } elseif (isset($guide['id'])) {
      $service_id = $guide['id'];
    }
    
    $appointment_data = [
      'service_id' => $service_id ?? 0,
      'customer_id' => $customer_id ?? 0,
      'visit_date' => (isset($appointment['visit_date']) && $appointment['visit_date']) ? $appointment['visit_date'] : NULL,
      'visit_time' => (isset($appointment['visit_time']) && $appointment['visit_time']) ? $appointment['visit_time'] : NULL,
      'lesson' => (isset($lesson['id'])) ? 1 : 0,
      'tour' => (isset($guide)) ? 1 : 0,
      'cinema' => 0,
      'blockade' => 0,
      'kulturalna_szkola' => (isset($appointment['kulturalna_szkola']) && $appointment['kulturalna_szkola']) ? 1 : 0,
      'kultura_za_zl' => (isset($appointment['kultura_za_zl']) && $appointment['kultura_za_zl']) ? 1 : 0,
      'pax' => (isset($appointment['pax']) && $appointment['pax']) ? (int)$appointment['pax'] : 0,
      'notes' => $customer['notes'] ?? '',
      'total_price' => $params['total_price'] ? $params['total_price'] : 0,
      'sell_price' => $params['sell_price'] ? $params['sell_price'] : 0,
      'sell_doc' => '',
      'state' => 'pending',
      'create_ip' => $_SERVER['REMOTE_ADDR'],
      'update_ip' => $_SERVER['REMOTE_ADDR']
    ];

    $id_appointment = $this->insert($appointment_data);
    if (!isset($id_appointment) || !$id_appointment) { return ['error' => 1, 'message' => 'Nie udało się dodać rezerwacji']; }

    // appointment_providers (rooms)
    if (isset($lesson['id'])) {
      // lesson duration
      $lesson_duration = $lesson['duration']; // lepiej byloby pobrac z bazy
      if (!$lesson_duration) { $lesson_duration = 60; }

      $lesson_start_datetime = $appointment['visit_date'] . ' ' . $appointment['visit_time'];
      $lesson_end_datetime = date('Y-m-d H:i:s', strtotime($lesson_start_datetime . ' +' . $lesson_duration . ' minutes'));

      // rooms needed for lesson
      $lesson_providers = $this->services->getServiceProviders($lesson['id']);
      for ($i = 0; $i < count($lesson_providers); $i++) {
        $lesson_providers[$i]['start_time'] = $lesson_start_datetime;
        $lesson_providers[$i]['end_time'] = $lesson_end_datetime;
      }
      
      foreach ($lesson_providers as $lesson_provider) {
        $this->appointment_providers->insert([
          'appointment_id' => $id_appointment,
          'service_id' => $lesson['id'],
          'provider_id' => $lesson_provider['provider_id'],
          'start_time' => $lesson_provider['start_time'],
          'end_time' => $lesson_provider['end_time']
        ]);
      }
    }

    // providers guide
    if (isset($guide['id'])) {
      // tour duration
      $guide_duration = $guide['duration']; // lepiej byloby pobrac z bazy
      if (!$guide_duration) { $guide_duration = 60; }

      if (isset($lesson_end_datetime) && $lesson_end_datetime) {
        $guide_start_datetime = $lesson_end_datetime;
        $guide_end_datetime = date('Y-m-d H:i:s', strtotime($guide_start_datetime . ' +' . $guide_duration . ' minutes'));
      } else {
        $guide_start_datetime = $appointment['visit_date'] . ' ' . $appointment['visit_time'];
        $guide_end_datetime = date('Y-m-d H:i:s', strtotime($guide_start_datetime . ' +' . $guide_duration . ' minutes'));
      }

      // rooms needed for guide
      $guide_providers = $this->services->getServiceProviders($guide['id']);
      for ($i = 0; $i < count($guide_providers); $i++) {
        $guide_providers[$i]['start_time'] = $guide_start_datetime;
        $guide_providers[$i]['end_time'] = $guide_end_datetime;
      }
      
      foreach ($guide_providers as $guide_provider) {
        $this->appointment_providers->insert([
          'appointment_id' => $id_appointment,
          'service_id' => $guide['id'],
          'provider_id' => $guide_provider['provider_id'],
          'start_time' => $guide_provider['start_time'],
          'end_time' => $guide_provider['end_time']
        ]);
      }
    }

    // price calculation
    $calculation = $this->getCalculation([
      'id' => $id_appointment,
      'pax' => $appointment['pax']
    ]);

    $total_price = array_sum(array_column($calculation, 'value'));
    $sell_price = (isset($appointment_data['kulturalna_szkola']) && $appointment_data['kulturalna_szkola'] == 1) ? ($appointment_data['pax'] * 1) : $total_price;

    $this->where('id', $id_appointment)->update([
      'total_price' => $total_price,
      'sell_price' => $sell_price
    ]);

    return ['id' => $id_appointment];
  }

  public function getToken($appointment_id)
  {
    $appo = $this->where('id', $appointment_id)->first(['create_time']);

    return base64_encode($appointment_id . '@' . $appo['create_time']);
  }

  public function getByToken($token) 
  {
    list($id, $create_time) = explode('@', base64_decode($token));

    if (isset($id) && isset($create_time)) {
      $appointment = $this->where('id', $id)->where('create_time', $create_time)->first();

      return ($appointment) ? $appointment : ['error' => 34, 'message' => 'Brak takiej rezerwacji'];
    }

    return ['error' => 34, 'message' => 'Token rezerwacji nieprawidłowy'];
  }

  /**
   * Confirm appointment by customer
   */
  public function confirm($appointment_id)
  {
    $this->where('id', $appointment_id)->where('state', 'pending')->update(['state' => 'confirmed']);

    return ['success' => 1];
  }

  /**
   * Cancel appointment by customer
   */
  public function cancel($appointment_id)
  {
    $this->where('id', $appointment_id)->where('state', 'pending')->update(['state' => 'cancelled']);

    return ['success' => 1];
  }

  /**
   * Verify zip code for kulturalna szkola
   */
  public function zipValidate($zip)
  {
    $query = "select id from {$this->tables->zip_codes} where zip_code = :zip limit 1";
    $st = $this->connection->prepare($query);
    $st->bindParam(':zip', $zip, PDO::PARAM_STR);
    $st->execute();
    $item = $st->fetch();

    return (isset($item['id']) && $item['id']) ? true : false;
  }

}
