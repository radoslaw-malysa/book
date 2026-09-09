<?php
declare(strict_types=1);

use App\Action\CrudAction;
use App\Action\AuthAction;
use App\Action\CalendarAction;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
// use App\Support\CacheFile;

use Slim\App;

return function (App $app) {

    $app->any('/login', AuthAction::class);
    $app->any('/logged-out', AuthAction::class . ":loggedOut");
    $app->any('/logout', AuthAction::class . ":logOut");
    
    $app->group('', function ($app) {
        $app->get('/my-profile', CrudAction::class . ":getMyProfile");
        $app->post('/my-profile', CrudAction::class . ":postMyProfile");

        $app->get('/search/{table}', CrudAction::class . ":searchTable"); // combobox
        $app->get('/find/{table}', CrudAction::class . ":findTable"); // find one

        $app->get('/calendar/week', CalendarAction::class); // combobox
        $app->get('/calendar/day', CalendarAction::class . ":day"); // combobox
        
        //$app->get('/{table}/{id}', CrudAction::class . ":fakePostRow");
        $app->get('/{table}/{id}', CrudAction::class . ":getRow");
        $app->get('/{table}', CrudAction::class . ":getTable");
        $app->post('/{table}', CrudAction::class . ":postRow");
        $app->post('/{table}/{id}', CrudAction::class . ":postRow");

        $app->get('/', CurrentAction::class); // home ->add($cache)
    }); /*->add(function (Request $request, RequestHandler $handler) use ($app) {
        
        if (isset($_SESSION['id_user']) && $_SESSION['id_user'] > 0) {
            $response = $handler->handle($request);
            return $response;
        } else {
            //header("HTTP/1.1 302");
            //header("Location: /api/logged-out"); exit;

            $response = $app->getResponseFactory()->createResponse();
            return $response->withHeader('Location', '/api/logged-out')
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
            ->withStatus(302);
        }
    });*/
};

// https://api.freepik.com/v1/ai/text-to-image/imagen3

/*$cache = function (Request $request, RequestHandler $handler) {
    $response = $handler->handle($request);
    CacheFile::getInstance()->set($_SERVER['REQUEST_URI'], $response->getBody(), 3600, ['headers' => $response->getHeaders()]);
    return $response;
};*/

// $app->get('/thumbs/[{params:.*}]', Image404Action::class);
//composer dump-autoload