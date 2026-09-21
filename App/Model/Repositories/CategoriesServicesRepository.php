<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class CategoriesServicesRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->categories_services;
    $this->tables = $tables;
  }

  /**
   * Edit service dialog
   */
  public function getServiceCategories($service_id)
  {
    $query = "select ca.id, ca.name, if(cs.service_id IS NULL, 0, 1) as selected
    from {$this->tables->categories} ca left join {$this->model} cs on ca.id = cs.category_id and cs.service_id = '{$service_id}'
    order by ca.ord desc";

    $st = $this->connection->prepare($query);
    $st->execute();
    
    return $st->fetchAll();
  }

  /**
   * Update service categories (Edit service dialog)
   */
  public function updateServiceCategories($service_id, $categories = [])
  {
    $before_ids = array_values(array_map(function($el) { return $el['category_id']; }, $this->where('service_id', $service_id)->get(['category_id'])));

    if (is_array($categories)) {
      foreach ($categories as $category) {
        if ($category['selected'] && !in_array($category['id'], $before_ids)) {
          // insert new category
          $this->insert([
            'category_id' => $category['id'],
            'service_id' => $service_id
          ]);
        } elseif ($category['selected'] != 1 && in_array($category['id'], $before_ids)) {
          // delete category selected before
          $this->where('category_id', $category['id'])->where('service_id', $service_id)->delete();
        }
      }
    }

    return true;
  }
}