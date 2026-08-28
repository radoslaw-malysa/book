<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Support\JsonRenderer;
use App\Model\Ai\ApiGemini;

class TextAction
{
  protected $api;

  public function __construct(ApiGemini $apiGemini, JsonRenderer $json)
  {
    $this->api = $apiGemini;
    $this->json = $json;
  }

  /**
   * Article query
   */
  public function __invoke(Request $request, Response $response, $args) {
    
    $data = $request->getParsedBody();

    // $data['query'] = 'Jakie korzyści płyną z regularnego czytania książek.';

    if (!$data['query']) {
      return $this->json->render($response, ['error' => 1, 'message' => 'No query in request.']);
    }

    // 'Napisz artykuł na bloga o korzyściach płynących z regularnego czytania książek. Użyj nagłówków i list wypunktowanych.'
    // $result = $this->api::query('Napisz artykuł na portal na temat: Jakie korzyści płyną z regularnego czytania książek. Użyj nagłówków.');
    $result = $this->api::query('Napisz artykuł na portal na temat: ' . $data['query'] . ' Użyj nagłówków.');
    // $result = ['title' => 'to jest tytuł', 'lead' => 'to jest wprowadzenie', 'content_html' => 'To jest treść', 'image_prompt' => 'Prompt'];

    if (is_array($result)) {
      return $this->json->render($response, $result);
    } 
    
    return $this->json->render($response, ['error' => 1, 'message' => 'Wystąpił błąd.']);
  }

}
