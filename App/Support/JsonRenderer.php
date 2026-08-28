<?php

declare(strict_types=1);

namespace App\Support;

use Psr\Http\Message\ResponseInterface as Response;

class JsonRenderer
{
  public function render(Response $response, $payload) {
    /*if (!(isset($_SESSION['user']['id']) && $_SESSION['user']['id'] > 0)) {
      $payload = ['error' => 403, 'message' => 'Not logged in'];
    }*/
    
    $payload = json_encode($payload, JSON_UNESCAPED_UNICODE);
    $response->getBody()->write($payload);
    return $response
      ->withHeader('Content-Type', 'application/json')
      ->withHeader('Access-Control-Allow-Origin', '*')
      ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
      ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  }
}