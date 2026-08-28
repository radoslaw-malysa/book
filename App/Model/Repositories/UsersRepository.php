<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class UsersRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->users;
    $this->tables = $tables;
  }

  // get all users of all partners (start bidding)
  public function getPartnersUsers($id_company)
  {
    $query = "select u.id, u.email 
    from " . $this->model . " u left join " . $this->tables->orderer_supplier . " os on u.id_company = os.id_supplier 
    left join " . $this->tables->companies . " c on c.id = u.id_company 
    where u.state='1' and c.state='1' and os.id_orderer = '" . $id_company . "'";
    return $this->query($query)->fetchAll();
  }

  // all users of company (bidding won)
  public function getCompanyUsers($id_company)
  {
    $query = "select id, email from " . $this->model . " where id_company='" . $id_company . "' and state='1'";
    return $this->query($query)->fetchAll();
  }

  // all users participating in bidding (cancel bidding)
  public function getBiddingUsers($id_shipment)
  {
    $query = "select u.id, u.email 
    from " . $this->tables->bids . " b inner join " . $this->model . " u on b.id_user = u.id 
    where b.id_shipment = '" . (int)$id_shipment . "' group by u.id";
    
    return $this->query($query)->fetchAll();
  }

  // get lost bidding users
  public function getBiddingUsersLost($id_shipment, $id_company_winner)
  {
    $query = "select u.id, u.email 
    from " . $this->tables->bids . " b inner join " . $this->model . " u on b.id_user = u.id 
    where b.id_shipment = '" . (int)$id_shipment . "' and u.id_company != '" . $id_company_winner . "'
    group by u.id";
    
    return $this->query($query)->fetchAll();
  }

  public function getRows($params = []) {
    $allowed_params = [
      'id' => [$this->model . '.id', '='],
      'name' => [$this->model . '.name', 'LIKE'],
      'email' => ['email', 'LIKE'],
      'company' => [$this->tables->companies.'.name', 'LIKE'],
      'id_company' => ['id_company', '='],
      'id_group' => ['id_group', '='],
      'state' => [$this->model . '.state', '=']
    ];
    
    $this->join($this->tables->companies, $this->model.'.id_company', '=', $this->tables->companies.'.id', 'left');

    foreach ($params as $param => $value) {
      if ($value && isset($allowed_params[$param])) {
        if ($allowed_params[$param][1] == 'LIKE') {
          $this->where($allowed_params[$param][0], $allowed_params[$param][1], "%$value%");
        } else {
          $this->where($allowed_params[$param][0], $allowed_params[$param][1], $value);
        }
      }
    }

    // deleted state
    if (!isset($params['state']) || !$params['state']) {
      $this->where($this->model.'.state', '!=', 3);
    }
    
    return $this->paginate(50, [$this->model.'.*', $this->tables->companies.'.name as company_name']);
  }

  public function getRow($params=[])
  { 
    if (!isset($params['id']) || $params['id'] == 0) {
      return $this->getNew();
    }
    
    return [
      'item' => $this->where($this->model.'.id', $params['id'])
      ->join($this->tables->companies, $this->model.'.id_company', '=', $this->tables->companies.'.id', 'left')
      ->first([
        $this->model.'.id', 
        $this->model.'.email', 
        "'' as password",
        $this->model.'.name', 
        'id_company',
        $this->model.'.state', 
        $this->model.'.update_time', 
        $this->model.'.update_ip', 
        $this->tables->companies.'.name as company_name'
    ])];
  }

  public function postRow($params=[])
  {
    if (!isset($params['email']) || !$params['email']) { return ['error' => 2, 'message' => 'missing email']; }
    if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'missing name']; }
    if (!isset($params['id_company']) || !$params['name']) { return ['error' => 2, 'message' => 'missing company']; }

    $data = [
      'email' => $params['email'],
      'name' => $params['name'],
      'id_company' => (int)$params['id_company'],
      'state' => (int)$params['state'],
      'update_ip' => $_SERVER['REMOTE_ADDR']
    ];

    if (isset($params['password']) && $params['password']) {
      $data['password'] = password_hash($params['password'], PASSWORD_DEFAULT);
    }
    
    if (isset($params['id']) && $params['id']) {
      $status = $this->where('id', (int)$params['id'])->update($data);
    } else {
      $data['create_ip'] = $_SERVER['REMOTE_ADDR'];

      $status = $this->insert($data);
    }

    return ['ok' => 1];
  }

  public function getNew()
  {
    $new_row = [
      'id' => 0,
      'email' => '',
      'password' => '',
      'name' => '',
      'id_company' => 0,
      'state' => 1,
      'create_time' => '',
      'create_ip' => '',
      'update_time' => '',
      'update_ip' => '',
      'company_name' => ''
    ];

    return [
      'item' => $new_row
    ];
  }
}