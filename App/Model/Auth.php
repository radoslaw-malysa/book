<?php

namespace App\Model;

use App\Model\Repositories\UsersRepository;
use App\Model\Repositories\CompaniesRepository;
// use App\Model\Mailer\Mailer;

class Auth
{
  public function __construct(
    UsersRepository $users,
    CompaniesRepository $companies
  )
  {
    $this->users = $users;
    $this->companies = $companies;
  }

  public function login($email, $password)
  {
    $user = $this->users->where('email', $email)->first(['id', 'email', 'password', 'name', 'id_company', 'state']);
    
    if ($user) {
      if (password_verify((string)$password, $user['password'])) {
        if ($user['state'] == 1) {
          $company = $this->companies->where('id', $user['id_company'])->first(['name', 'company_type', 'state']);

          if ($company['state'] == 1) {
            $user['company_type'] = $company['company_type'];
            $user['company_name'] = $company['name'];
            $this->createSession($user);
            $payload = [
              'id' => $user['id'],
              'name' => $user['name'],
              'id_company' => $user['id_company'],
              'company_type' => $user['company_type']
            ];
          } else {
            $payload = ['error' => 1, 'message' => 'auth.disabled'];
          }
        } else {
          $payload = ['error' => 1, 'message' => 'auth.disabled'];
        }
      } else {
        $payload = ['error' => 1, 'message' => 'auth.bad-pass'];
      }
    } else {
      $payload = ['error' => 1, 'message' => 'auth.no-email'];
    }

    return $payload;
  }

  private function createSession($user)
  {
    $_SESSION['id_user'] = $user['id'];
    $_SESSION['id_company'] = $user['id_company'];
    $_SESSION['company_type'] = $user['company_type'];
    $_SESSION['company_name'] = $user['company_name'];
  }

  public function logout()
  {
    $_SESSION = array();

    if (ini_get("session.use_cookies")) {
      $params = session_get_cookie_params();
      setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
      );
    }

    session_destroy();
  }
}