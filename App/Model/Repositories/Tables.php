<?php
namespace App\Model\Repositories;
/**
 * Table constants.
 */
final class Tables
{
    public $users = 'users';
    public $appointments = 'appointments';
    public $appointment_providers = 'appointment_providers';
    public $services = 'services';
    public $service_schedule = 'service_schedule';
    public $customers = 'customers';
    public $categories = 'categories';
    public $categories_services = 'categories_services';
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