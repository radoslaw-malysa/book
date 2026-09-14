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