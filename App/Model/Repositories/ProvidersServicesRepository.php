<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * W których salach (providers) można zrealizować warsztaty (services)
 */
class ProvidersServicesRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->providers_services;
    $this->tables = $tables;
  }

  /**
   * Edit service dialog
   */
  public function getServiceProviders($service_id)
  {
    $query = "select pr.id, pr.name, if(ps.service_id IS NULL, 0, 1) as selected
    from {$this->tables->providers} pr left join {$this->model} ps on pr.id = ps.provider_id and ps.service_id = '{$service_id}'
    order by pr.name";

    $st = $this->connection->prepare($query);
    $st->execute();
    
    return $st->fetchAll();
  }

  /**
   * Update service providers (Edit service dialog)
   */
  public function updateServiceProviders($service_id, $providers = [])
  {
    $before_ids = array_values(array_map(function($el) { return $el['provider_id']; }, $this->where('service_id', $service_id)->get(['provider_id'])));

    if (is_array($providers)) {
      foreach ($providers as $provider) {
        if ($provider['selected'] && !in_array($provider['id'], $before_ids)) {
          // insert new category
          $this->insert([
            'provider_id' => $provider['id'],
            'service_id' => $service_id
          ]);
        } elseif ($provider['selected'] != 1 && in_array($provider['id'], $before_ids)) {
          // delete provider selected before
          $this->where('provider_id', $provider['id'])->where('service_id', $service_id)->delete();
        }
      }
    }

    return true;
  }

  public function getRows($params = []) 
  {

  }

  public function getRow($params=[])
  { 

  }

  public function postRow($params=[])
  {

  }

  public function getNew()
  {

  }
}