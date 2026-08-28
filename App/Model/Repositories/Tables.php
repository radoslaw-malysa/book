<?php
namespace App\Model\Repositories;
/**
 * Table constants.
 */
final class Tables
{
    public $companies = 'companies';
    public $users = 'users';
    public $shipments = 'shipments';
    public $shipments_packages = 'shipments_packages';
    public $shipments_fv = 'shipments_fv';
    public $route_stops = 'route_stops';
    public $locations = 'locations';
    public $orderer_supplier = 'orderer_supplier';
    public $bids = 'bids';
    public $countries = 'countries';
    public $log = 'log';
    public $documents = 'documents';

    public function __construct($prefix=null)
    {
        if ($prefix) {
            foreach (get_object_vars($this) as $var => $val) {
                $this->$var = $prefix . $val;
            }
        }
    }
}