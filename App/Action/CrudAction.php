<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use \App\Model\Repositories\AppointmentsRepository;
use \App\Model\Repositories\UsersRepository;
use \App\Model\Repositories\ServicesRepository;
use \App\Model\Repositories\CategoriesRepository;
use \App\Model\Repositories\ProvidersRepository;

// use Slim\Views\PhpRenderer;
use \App\Support\JsonRenderer;

class CrudAction
{
  protected $json;
  
  public function __construct(
    JsonRenderer $json, 
    AppointmentsRepository $appointments,
    UsersRepository $users,
    ServicesRepository $services,
    CategoriesRepository $categories,
    ProvidersRepository $providers
    )
  {
    $this->json = $json;
    $this->appointments = $appointments;
    $this->users = $users;
    $this->services = $services;
    $this->categories = $categories;
    $this->providers = $providers;
  }

  public function __invoke(Request $request, Response $response, $args) {
    
    return $this->json->render($response, ['error' => '404', 'message' => 'No action']);
  }

  public function getTable($request, $response, $args) 
  {  
    $table = $args['table'];
    $query_params = $request->getQueryParams();

    $rows = $this->$table->getRows($query_params);

    $payload = [
      'items' => $rows->getResults(),
      'total_items' => $rows->getTotalItems(),
      'total_pages' => $rows->getNumPages()
    ];

    /*,
      'session_user' => [
        'id' => $_SESSION['id_user'] ?? 0,
        'id_company' => $_SESSION['id_company'] ?? 0,
        'company_type' => $_SESSION['company_type'] ?? 0,
        'company_name' => $_SESSION['company_name'] ?? ''
      ]*/

    return $this->json->render($response, $payload);
  }

  public function getRow($request, $response, $args) 
  {
    $table = $args['table'];
    $id = $args['id'];
    $query_params = $request->getQueryParams();

    if ($query_params) {
      $payload = $this->$table->getRow(array_merge($query_params, ['id' => $id]));
    } else {
      $payload = $this->$table->getRow(['id' => $id]);
    }

    //echo '<pre>'; print_r($payload); echo '</pre>'; exit;

    return $this->json->render($response, $payload);
  }

  public function postRow($request, $response, $args) 
  {
    $table = $args['table'];
    $id = $args['id'];
    $data = $request->getParsedBody();

    // json string in body
    if (isset($data['json_data'])) {
      $data = json_decode($data['json_data'], true);
    }

    // return $this->json->render($response, $data);

    if (is_array($data)) {
      $payload = $this->$table->postRow($data);
    } else {
      $payload = ['error' => 1, 'message' => 'Brak danych do zapisu'];
    }
    
    return $this->json->render($response, $payload);
  }

  public function fakePostRow($request, $response, $args) 
  {
    $table = $args['table'];
    $string = '{"id":0,"service_id":0,"customer_id":0,"salon_id":1,"visit_time":"","lesson":1,"tour":0,"cinema":0,"blockade":0,"kulturalna_szkola":0,"kultura_za_zl":0,"pax":"10","notes":"test","state":"pending","total_price":"","sell_price":"","sell_doc":"","create_time":"","create_ip":"","update_time":"","update_ip":"","appointment_providers":{"lesson":[{"appointment_id":"0","service_id":"2","provider_id":"2","start_time":"2026-09-30 08:00","end_time":"2026-09-30 10:00"},{"appointment_id":"0","service_id":0,"provider_id":0,"start_time":"","end_time":""}],"tour":[{"appointment_id":"0","service_id":0,"provider_id":"2","start_time":"2026-09-30 08:00","end_time":""},{"appointment_id":"0","service_id":0,"provider_id":0,"start_time":"","end_time":""}],"cinema":[{"appointment_id":"0","service_id":0,"provider_id":"2","start_time":"2026-09-30 08:00","end_time":""}],"blockade":[{"appointment_id":"0","service_id":0,"provider_id":"2","start_time":"2026-09-30 08:00","end_time":""},{"appointment_id":"0","service_id":0,"provider_id":0,"start_time":"","end_time":""}]},"services":{"blockade":[{"id":1,"name":"Rezerwacja sali"}],"lesson":[{"id":2,"name":"Spacer po wystawie i warsztaty plastyczne"},{"id":3,"name":"Nowe Horyzonty Edukacji Filmowej"},{"id":4,"name":"Warsztaty ruchowo-plastyczne podczas spaceru po wystawie"},{"id":5,"name":"Seanse filmowe z bieżącego repertuaru"},{"id":6,"name":"Warsztaty sensoryczno-plastyczne „Bajki z pieca”"},{"id":7,"name":"Filmowe pokazy specjalne"},{"id":8,"name":"Warsztaty plastyczne w sali edukacyjnej (cykl 5 spotkań)"},{"id":9,"name":"Seanse filmowe z bieżącego repertuaru"},{"id":10,"name":"Warsztaty plastyczne oraz spacer po wystawie"}],"tour":[{"id":11,"name":"Zwiedzanie wystaw"},{"id":12,"name":"Zwiedzanie wystaw z przewodnikiem"}],"cinema":[{"id":13,"name":"Kino"}]},"providers":[{"id":1,"name":"Sala wystawowa 1 piętro"},{"id":2,"name":"Sala wystawowa parter"},{"id":3,"name":"Sala edukacyjna"},{"id":4,"name":"Piec"},{"id":5,"name":"Biblioteka"}],"customer":{"id":0,"customer_type":"","name":"Radek","address":"","email":"","phone":"","contact_name":"","contact_phone":"","contact_email":"","pax_care":0,"accept_processing":0,"accept_regulations":0,"accept_kultura_zl":0}}';
    $data = json_decode($string, true);
    echo '<pre>'; print_r($data); //exit;
    if (is_array($data)) {
      $payload = $this->$table->postRow($data);
    }
    
    return $this->json->render($response, $payload);
  }

  public function searchTable($request, $response, $args) 
  {
    $table = $args['table'];
    $query_params = $request->getQueryParams();

    if (isset($query_params['q'])) {
      $rows = $this->$table->searchTable($query_params);
    }
    
    return $this->json->render($response, ['items' => $rows]);
  }

  public function findTable($request, $response, $args) 
  {
    $table = $args['table'];
    $query_params = $request->getQueryParams();

    if ($query_params) {
      $row = $this->$table->findTable($query_params);
    }
    
    return $this->json->render($response, ['item' => $row]);
  }

  public function getMyProfile(Request $request, Response $response, $args) 
  {
    return $this->json->render($response, [
      'user' => $this->users->where('id', $_SESSION['id_user'])->first(['id', 'email', 'name']),
      'company' => $this->companies->where('id', $_SESSION['id_company'])->first(),
      'countries' => $this->countries->orderBy('name')->get(),
      'session_user' => [
        'id' => $_SESSION['id_user'] ?? 0,
        'id_company' => $_SESSION['id_company'] ?? 0,
        'company_type' => $_SESSION['company_type'] ?? 0,
        'company_name' => $_SESSION['company_name'] ?? ''
      ]
    ]);
  }

  public function postMyProfile(Request $request, Response $response, $args) 
  {
    $data = $request->getParsedBody();

    if (is_array($data) && isset($_SESSION['id_company']) && $_SESSION['id_company']) {
      $row = $this->companies->where('id', $_SESSION['id_company'])->update([
        'contact_person' => $data['contact_person'] ?? '',
        'phone_number' => $data['phone_number'] ?? '',
        'email' => $data['email'] ?? '',
        'update_ip' => $_SERVER['REMOTE_ADDR']
      ]);
      
      /*$row = $this->companies->where('id', $_SESSION['id_company'])->update([
        'name' => $data['name'] ?? '',
        'country_code' => $data['country_code'] ?? '',
        'district' => $data['district'] ?? '',
        'street' => $data['street'] ?? '',
        'street_number' => $data['street_number'] ?? '',
        'postal_code' => $data['postal_code'] ?? '',
        'city' => $data['city'] ?? '',
        'contact_person' => $data['contact_person'] ?? '',
        'phone_number' => $data['phone_number'] ?? '',
        'email' => $data['email'] ?? '',
        'nip' => $data['nip'] ?? '',
        'update_ip' => $_SERVER['REMOTE_ADDR']
      ]);*/
    }

    if ($row && isset($row['error'])) {
      $payload = ['error' => $row['error'], 'message' => $row['message'] ?? 'err.net'];
    } else {
      $payload = ['success' => 1];
    } 
    
    return $this->json->render($response, $payload);
  }

  public function notAuthorized(Request $request, Response $response, $args) {
    return $this->json->render($response, ['error' => '403', 'message' => 'Not admin']);
  }

}
