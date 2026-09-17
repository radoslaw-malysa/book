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

  /**
   * Appointment Edit
   */
  public function updateCustomer($customer) {
    $data = [
      'customer_type' => (isset($customer['customer_type']) && $customer['customer_type']) ? $customer['customer_type'] : NULL,
      'name' => $customer['name'] ?? '',
      'address' => $customer['address'] ?? '',
      'email' => $customer['email'] ?? '',
      'phone' => $customer['phone'] ?? '',
      'contact_name' => $customer['contact_name'] ?? '',
      'contact_phone' => $customer['contact_phone'] ?? '',
      'contact_email' => $customer['contact_email'] ?? '',
      'pax_care' => $customer['pax_care'] ?? 0,
      'accept_processing' => $customer['accept_processing'] ?? 0,
      'accept_regulations' => $customer['accept_regulations'] ?? 0,
      'accept_kultura_zl' => $customer['accept_kultura_zl'] ?? 0
    ];

    if (isset($customer['id']) && $customer['id'] != 0) {
      $this->where('id', $customer['id'])->update($data);
    } elseif (isset($customer['id'])) {
      $customer['id'] = $this->insert($data);
    }

    return $customer['id'];
  }

  public function getNew()
  {
    return [
      'id' => 0,
      'customer_type' => '',
      'name' => '',
      'address' => '',
      'email' => '',
      'phone' => '',
      'contact_name' => '',
      'contact_phone' => '',
      'contact_email' => '',
      'pax_care' => 0,
      'accept_processing' => 0,
      'accept_regulations' => 0,
      'accept_kultura_zl' => 0
    ];
  }
}