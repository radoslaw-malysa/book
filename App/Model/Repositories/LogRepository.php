<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

// 1 - system, 2 - chat, 3 - destructive, 4 - important

/**
 * Repository.
 */
class LogRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->log;
    $this->tables = $tables;
  }

  public function getShipmentLog($params = [])
  {
    // if carrier, show only client and logged carrier logs
    $company_type = $_SESSION['company_type'] ?? 0;

    if ($company_type == 2) {
      $shipment = $this->query("select id_orderer from " . $this->tables->shipments . " where id = '" . (int)$params['id_shipment'] . "'")->fetch();
      $id_orderer = $shipment['id_orderer'];
      $id_carrier = $_SESSION['id_company'] ?? 0;
    }
  
    $query = "select l.*, c.shortname as company_name
    from " . $this->model . " l left join " . $this->tables->companies . " c on l.id_company = c.id 
    where 1 ";
    if (isset($params['id_shipment']) and $params['id_shipment']) { $query .= "and l.id_shipment = '" . (int)$params['id_shipment'] . "' "; }
    if (isset($params['id']) and $params['id']) { $query .= "and l.id = '" . $params['id'] . "' "; }
    if (isset($id_carrier) && isset($id_orderer)) { $query .= " and (l.id_company='" . $id_carrier . "' or l.id_company='" . $id_orderer . "') "; }
    $query .= "order by l.create_time desc limit 100";

    $st = $this->connection->prepare($query);
    $st->execute();

    return $st->fetchAll();
  }

  public function getRows($params = []) {
    $allowed_params = [
      'id' => [$this->model . '.id', '='],
      'id_shipment' => [$this->model . '.id_shipment', '='],
      'message' => [$this->model . '.message', 'LIKE'],
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

    $this->orderBy($this->model . '.create_time', 'desc');
    
    return $this->paginate(50, [$this->model.'.*']);
  }

  public function getRow($params=[])
  { 
    if (!isset($params['id']) || $params['id'] == 0) {
      return $this->getNew();
    }
    
    return [
      'item' => $this->where($this->model.'.id', $params['id'])
      ->first([$this->model.'.*'
    ])];
  }

  public function postRow($params=[])
  {
    if (!isset($params['symbol']) || !$params['symbol']) { return ['error' => 2, 'message' => 'missing symbol']; }
    if (!isset($params['name']) || !$params['name']) { return ['error' => 2, 'message' => 'missing name']; }
    
    if (isset($params['id']) && $params['id']) {
      $status = $this->where('id', (int)$params['id'])->update([
        'symbol' => $params['symbol'],
        'name' => $params['name'],
        'state' => $params['state']
      ]);
    } else {
      $status = $this->insert([
        'symbol' => $params['symbol'],
        'name' => $params['name'],
        'state' => $params['state']
      ]);
    }

    return ($status) ? ['ok' => 1] : ['error' => 1];
  }

  public function getNew()
  {
    $new_row = [
      'id' => 0,
      'symbol' => '',
      'name' => '',
      'state' => 1
    ];

    return [
      'item' => $new_row
    ];
  }

}