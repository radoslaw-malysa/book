<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class CustomersRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->customers;
    $this->tables = $tables;
  }

  

  public function getNew()
  {
    $new_row = [
      'id' => 0,
      'name' => '',
      'description' => '',
      'state' => 1
    ];

    return $new_row;
  }
}