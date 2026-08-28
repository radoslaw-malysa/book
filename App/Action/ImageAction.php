<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Support\JsonRenderer;
use App\Model\Ai\ApiImagen;

class ImageAction
{
  protected $api;

  public function __construct(ApiImagen $apiImagen, JsonRenderer $json)
  {
    $this->api = $apiImagen;
    $this->json = $json;
  }

  /**
   * Image query
   */
  public function __invoke(Request $request, Response $response, $args) {
    
    //$result = $this->apiImage::query('A person sitting comfortably in an armchair, reading a book with a warm light illuminating them. The scene should convey relaxation, knowledge, and the joy of reading.');
    //$result = ['url' => 'generated_image.png'];
    
    $data = $request->getParsedBody();

    if (!$data['query']) {
      return $this->json->render($response, ['error' => 1, 'message' => 'No query in request.']);
    }

    $result = $this->api::query($data['query']);

    return $this->json->render($response, $result);
  }
}
