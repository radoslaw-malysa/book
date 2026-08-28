<?php

declare(strict_types=1);

use DI\ContainerBuilder;
// use Slim\Views\PhpRenderer;
use \App\Support\JsonRenderer;
use Psr\Container\ContainerInterface;
use App\Model\Repositories\Tables;
use App\Model\Lang\Lang;

return static function (ContainerBuilder $containerBuilder, array $settings) {
    $containerBuilder->addDefinitions([
        'settings' => $settings,
        
        /* PhpRenderer::class => function (ContainerInterface $container) {
            $settings = $container->get('settings');
            return new PhpRenderer($settings['view_path'], [
                'upl' => $settings['upl'],
                'thumbs' => $settings['thumbs']
            ]);
        }, */

        JsonRenderer::class => function () {
            return new JsonRenderer();
        },

        PDO::class => function (ContainerInterface $container) {
            $settings = $container->get('settings');
            return new PDO(
                "mysql:host=".$settings['db_host'].";dbname=".$settings['db_database'].";charset=".$settings['db_charset'], 
                $settings['db_username'], 
                $settings['db_password'], 
                array(
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES '.$settings['db_charset'].' COLLATE '.$settings['db_collation']
                )
            );
        },

        Tables::class => function (ContainerInterface $container) {
            return new Tables($container->get('settings')['db_prefix']);
        },

        Lang::class => function() {
            return new Lang($_SESSION['lang'] ?? 'pl');
        }
        
    ]);
};
