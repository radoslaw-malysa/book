<?php

declare(strict_types=1);

return static function(string $appEnv) {
    
    if ($appEnv === 'DEVELOPMENT') {
        $settings =  [
            'app_env' => $appEnv,
            'di_compilation_path' => '', 
            'display_error_details' => true,
            'log_errors' => true,
            'view_path' => __DIR__ . '/../App/View',
            'db_driver' => 'mysql',
            'db_host' => 'localhost',
            'db_username' => 'root', 
            'db_database' => 'routetrade', 
            'db_password' => '', 
            'db_charset' => 'utf8mb4',
            'db_collation' => 'utf8mb4_polish_ci',
            'db_prefix' => 'rt_',
            'upl' => 'img/',
            'thumbs' => 'thumbs/'
        ];

    } else {
        $settings =  [
            'app_env' => $appEnv,
            'di_compilation_path' => '', 
            'display_error_details' => true,
            'log_errors' => true,
            'view_path' => __DIR__ . '/../App/View',
            'db_driver' => 'mysql',
            'db_host' => 'mysql8',
            'db_username' => '40484962_auctions', 
            'db_database' => '40484962_auctions', 
            'db_password' => '2_KdmbfH', 
            'db_charset' => 'utf8mb4',
            'db_collation' => 'utf8mb4_polish_ci',
            'db_prefix' => 'rt_',
            'upl' => 'img/',
            'thumbs' => 'thumbs/'
        ];
        //__DIR__ . '/../var/cache'
    }
    
    return $settings;
};

// https://serwer2600345.home.pl/sql/?server=mysql8