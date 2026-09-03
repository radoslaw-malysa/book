<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use \App\Model\Repositories\AppointmentsRepository;
use \App\Model\Repositories\UsersRepository;

// use Slim\Views\PhpRenderer;
use \App\Support\JsonRenderer;

class CrudAction
{
  protected $json;
  
  public function __construct(
    JsonRenderer $json, 
    AppointmentsRepository $appointments,
    UsersRepository $users
    )
  {
    $this->json = $json;
    $this->appointments = $appointments;
    $this->users = $users;
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
      'total_pages' => $rows->getNumPages(),
      'session_user' => [
        'id' => $_SESSION['id_user'] ?? 0,
        'id_company' => $_SESSION['id_company'] ?? 0,
        'company_type' => $_SESSION['company_type'] ?? 0,
        'company_name' => $_SESSION['company_name'] ?? ''
      ]
    ];

    return $this->json->render($response, $payload);
  }

  public function getRow($request, $response, $args) 
  {
    $table = $args['table'];
    $id = $args['id'];

    $payload = $this->$table->getRow(['id' => $id]);

    return $this->json->render($response, $payload);
  }

  public function postRow($request, $response, $args) 
  {
    $table = $args['table'];
    $data = $request->getParsedBody();

    if (is_array($data)) {
      $row = $this->$table->postRow($data);
    }

    if ($row && isset($row['error'])) {
      $payload = ['error' => $row['error'], 'message' => $row['message'] ?? 'err.net'];
    } elseif ($row) {
      $payload = ['success' => 1];
    } else {
      $payload = ['error' => 1, 'message' => 'err.net'];
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
