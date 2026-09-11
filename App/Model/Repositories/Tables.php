<?php
namespace App\Model\Repositories;
/**
 * Table constants.
 */
final class Tables
{
    public $users = 'users';
    public $appointments = 'appointments';
    //public $appointment_services = 'appointment_services';
    public $appointment_providers = 'appointment_providers';
    public $services = 'services';
    public $customers = 'customers';
    public $categories = 'categories';
    public $salons = 'salons';
    public $providers = 'providers';

    public function __construct($prefix=null)
    {
        if ($prefix) {
            foreach (get_object_vars($this) as $var => $val) {
                $this->$var = $prefix . $val;
            }
        }
    }
}