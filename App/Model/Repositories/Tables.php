<?php
namespace App\Model\Repositories;
/**
 * Table constants.
 */
final class Tables
{
    public $users = 'users';
    public $appointments = 'appointments';
    public $services = 'services';
    public $customers = 'customers';
    public $categories = 'categories';
    public $salons = 'salons';

    public function __construct($prefix=null)
    {
        if ($prefix) {
            foreach (get_object_vars($this) as $var => $val) {
                $this->$var = $prefix . $val;
            }
        }
    }
}