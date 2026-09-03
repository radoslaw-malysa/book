<?php
declare(strict_types=1);

ini_set('display_errors', 1);
error_reporting(E_ERROR | E_PARSE);

$session_lifetime = 86400; 
ini_set('session.gc_maxlifetime', $session_lifetime);
session_set_cookie_params([
    'lifetime' => $session_lifetime,
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'],
    'secure' => true,     // Send only over HTTPS
    'samesite' => 'Lax'
]);

session_start();

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;



// client 1 Faurecia
$_SESSION = [
    'id_user' => 1,
    'email' => 'rm@pawelec.info',
    'id_company' => 2,
    'company_type' => 1,
    'company_name' => 'Faurecia',
    'id_group' => 1,
    'lang' => 'pl',
    'state' => 1
];


//cache
/*if (isset($_SESSION['user_id_group'])) {
    define('CACHE_ON', false);
} else {
    define('CACHE_ON', false);
}

if (CACHE_ON) {
    require '../src/Support/CacheFile.php';
    $cache = \App\Support\CacheFile::getInstance()->get($_SERVER['REQUEST_URI'], 1);
    $cached = $cache->get_body();
 
    if ($cached) {
        $data = $cache->get_data();
        if ($data->headers) {
            foreach ($data->headers as $key => $val) {
                header("$key: {$val[0]}");
            }
        }
        die($cached);
    } 
}*/

require __DIR__ . '/../../vendor/autoload.php';

define('APP_ENV', $_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? 'DEVELOPMENT'); //PRODUCTION
$settings = (require __DIR__ . '/../../config/settings.php')(APP_ENV);

// Set up dependencies
$containerBuilder = new ContainerBuilder();
if($settings['di_compilation_path']) {
    $containerBuilder->enableCompilation($settings['di_compilation_path']);
}
(require __DIR__ . '/../../config/dependencies.php')($containerBuilder, $settings);

// Create app
AppFactory::setContainer($containerBuilder->build());
$app = AppFactory::create();

$app->setBasePath('/booking-api');

// Register middleware
(require __DIR__ . '/../../config/middleware.php')($app);

// Register routes
(require __DIR__ . '/../../config/routes.php')($app);

// Run app
$app->run();
