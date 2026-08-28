<?php

declare(strict_types=1);

use Slim\App;
use App\Error\Renderer\HtmlErrorRenderer;

return static function (App $app) {
    $app->addRoutingMiddleware();
    $app->addBodyParsingMiddleware();
    $app->addErrorMiddleware(true, true, true);


    $displayErrorDetails = (bool)($_ENV['DEBUG'] ?? false);
    // $displayErrorDetails = true;
    /*$errorMiddleware = $app->addErrorMiddleware($displayErrorDetails, true, true);
    $errorHandler = $errorMiddleware->getDefaultErrorHandler();
    $errorHandler->registerErrorRenderer('text/html', HtmlErrorRenderer::class);*/
};
