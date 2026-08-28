<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \App\Model\Auth;
use \App\Support\JsonRenderer;

class AuthAction
{
  private $json;
  private $auth;

  public function __construct(JsonRenderer $json, Auth $auth) {
    $this->json = $json;
    $this->auth = $auth;

  }

  /**
   * login form
   */
  public function __invoke(Request $request, Response $response, $args) 
  {
    $data = $request->getParsedBody();
    $payload = $this->auth->login($data['email'] ?? '', $data['password'] ?? '');
    
    return $this->json->render($response, $payload); //->withStatus(403);
  }

  public function loggedOut(Request $request, Response $response, $args)
  {
    return $this->json->render($response, ['error' => 401, 'message' => 'Not logged in']);
  }

  // loader on login screen
  public function logOut(Request $request, Response $response, $args)
  {
    $this->auth->logout();

    return $this->json->render($response, ['message' => 'Not logged in']);
  }

  /**
   * register form
   */
  public function register(Request $request, Response $response, $args) 
  {
    
  }

  /**
   * login or register (wybierz-plan)
   */
  public function loginOrRegister(Request $request, Response $response, $args)
  {
    
  }

  /**
   * register business form
   */
  public function registerBusiness(Request $request, Response $response, $args) 
  {
    
  }

  /**
   * confirm registration
   */
  public function confirm(Request $request, Response $response, $args) 
  {
    
  }

  /**
   * remind start
   */
  public function remindStartForm(Request $request, Response $response, $args) 
  {
    
  }

  /**
   * remind end
   */
  public function remindEndForm(Request $request, Response $response, $args) 
  {
    
  }

}