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
            'db_database' => 'book', 
            'db_password' => '', 
            'db_charset' => 'utf8mb4',
            'db_collation' => 'utf8mb4_polish_ci',
            'db_prefix' => 'book_',
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
            'db_host' => 'localhost',
            'db_username' => 'mcswelektrownia_26', 
            'db_database' => 'mcswelektrownia_26', 
            'db_password' => 'ZI2dE-3vEq%dai-U', 
            'db_charset' => 'utf8mb4',
            'db_collation' => 'utf8mb4_polish_ci',
            'db_prefix' => 'book_',
            'upl' => 'img/',
            'thumbs' => 'thumbs/'
        ];
        //__DIR__ . '/../var/cache'
    }
    
    return $settings;
};

// https://serwer2600345.home.pl/sql/?server=mysql8