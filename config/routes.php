<?php
declare(strict_types=1);

use App\Action\CrudAction;
use App\Action\CurrentAction; // dashboard
use App\Action\ShipmentAction; // Shipment crud
use App\Action\AuthAction;
use App\Action\ChatAction;
use App\Action\BiddingAction;
use App\Action\PackagesAction;
use App\Action\FvAction;
use App\Action\DocumentsAction;
use App\Action\ContactAction;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
// use App\Support\CacheFile;

use Slim\App;

return function (App $app) {

    $app->post('/post-contact', ContactAction::class); // webpage contact form

    $app->any('/login', AuthAction::class);
    $app->any('/logged-out', AuthAction::class . ":loggedOut");
    $app->any('/logout', AuthAction::class . ":logOut");
    
    $app->group('', function ($app) {
        $app->get('/my-profile', CrudAction::class . ":getMyProfile");
        $app->post('/my-profile', CrudAction::class . ":postMyProfile");

        $app->get('/search/{table}', CrudAction::class . ":searchTable"); // combobox
        $app->get('/find/{table}', CrudAction::class . ":findTable"); // find one

        $app->get('/shipments/{id}', ShipmentAction::class); // view shipment
        $app->get('/shipments-edit[/{id}]', ShipmentAction::class . ":editShipment"); // edit shipment
        $app->any('/route-stops', ShipmentAction::class . ":saveRouteStops"); // save shipment route stops
        $app->any('/packages', PackagesAction::class . ":savePackages"); // save FV
        $app->any('/fv', FvAction::class . ":saveFv"); // save FV
        $app->post('/forwarder', ShipmentAction::class . ":saveForwarder"); // save forwarder
        $app->post('/docs', DocumentsAction::class . ":uploadDocument"); // upload document
        $app->get('/docs/{id_shipment}', DocumentsAction::class . ":getDocuments"); // upload document
        $app->any('/bidding-edit', BiddingAction::class . ":startBidding");
        $app->any('/bidding-cancel', BiddingAction::class . ":cancelBidding");
        // $app->any('/bidding-edit', ShipmentAction::class . ":editBidding");
        
        $app->get('/bidding/test', BiddingAction::class . ':test');
        $app->post('/bidding/cancel', BiddingAction::class . ':cancelBid'); 
        $app->post('/bidding/accept', BiddingAction::class . ':acceptBid'); 
        $app->post('/bidding/reject', BiddingAction::class . ':rejectBid'); 
        $app->get('/bidding/{id_shipment}', BiddingAction::class); // get bids
        $app->any('/bidding', BiddingAction::class . ':postBid'); // post bids

        $app->get('/chat/{id_shipment}', ChatAction::class); // get chat
        $app->any('/chat', ChatAction::class . ':postMessage'); // post chat
        
        $app->get('/{table}/{id}', CrudAction::class . ":getRow");
        $app->get('/{table}', CrudAction::class . ":getTable");
        $app->post('/{table}', CrudAction::class . ":postRow");

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