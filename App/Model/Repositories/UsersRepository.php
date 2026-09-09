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

  public function getRows($params = []) 
  {
    $filters = [];
    $per_page = 5; //pagination

    if (isset($params['q']) && $params['q']) {
      $filters[] = "(us.email like :email or us.title like :title) ";
      $q_param = '%'.$params['q'].'%';
    }

    // deleted state
    if (!isset($params['state']) || !$params['state']) {
      $filters[] = "us.state != '3' ";
    }

    // count all records
    $query = "select count(*) 
    from " . $this->model . " us ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $st = $this->connection->prepare($query);
    
    if (isset($params['q']) && $params['q']) {
      $st->bindParam(':email', $q_param, PDO::PARAM_STR);
      $st->bindParam(':title', $q_param, PDO::PARAM_STR);
    }

    $st->execute();
    $total_items = $st->fetchColumn();
    
    // paginate
    $paginator = new Paginator([], $total_items, $per_page, $params['page'] ?? 1, '');
    $offset = $paginator->getCurrentPageFirstItem();

    // actual query
    $query = "select us.* 
    from " . $this->model . " us ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $query .= " order by us.id desc ";
    $query .= ($per_page) ? (" limit " . $offset . ", " . $per_page) : '';
    $st = $this->connection->prepare($query);
    
    if (isset($params['q']) && $params['q']) {
      $st->bindParam(':email', $q_param, PDO::PARAM_STR);
      $st->bindParam(':title', $q_param, PDO::PARAM_STR);
    }

    $st->execute();
    $items = $st->fetchAll();


    $paginator->setResults($items);
    //print_r($params); exit;

    return $paginator;
  }

  public function getRow($params=[])
  { 
    if (!isset($params['id']) || $params['id'] == 0) {
      return $this->getNew();
    }
    
    return $this->where($this->model.'.id', (int)$params['id'])
      ->first([
        $this->model.'.id', 
        $this->model.'.email', 
        "'' as password",
        $this->model.'.title', 
        $this->model.'.id_group',
        $this->model.'.state', 
        $this->model.'.update_time', 
        $this->model.'.update_ip'
    ]);
  }

  public function postRow($params=[])
  {
    if (!isset($params['email']) || !$params['email']) { return ['error' => 2, 'message' => 'Wypełnij e-mail']; }
    if (!isset($params['id_group']) || !$params['id_group'] || $params['id_group'] === '0') { return ['error' => 2, 'message' => 'Wybierz grupę uprawnień']; }
    if (!isset($params['state']) || !$params['state'] || $params['state'] === '0') { return ['error' => 2, 'message' => 'Ustaw status']; }

    $data = [
      'email' => $params['email'] ?? '',
      'title' => $params['title'] ?? '',
      'id_group' => (int)$params['id_group'],
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
      if (!isset($params['password']) || !$params['password']) {
        $data['password'] = password_hash(uniqid(), PASSWORD_DEFAULT);
      }

      $status = $this->insert($data);
    }

    return $data;
  }

  public function getNew()
  {
    $new_row = [
      'id' => 0,
      'email' => '',
      'password' => '',
      'title' => '',
      'id_group' => 2,
      'state' => 1,
      'create_time' => '',
      'create_ip' => '',
      'update_time' => '',
      'update_ip' => ''
    ];

    return $new_row;
  }
}