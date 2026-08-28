<?php

declare(strict_types=1);

namespace App\Error\Renderer;

use Slim\Exception\HttpNotFoundException;
// use Slim\Interfaces\ErrorRendererInterface;
use Throwable;

final class HtmlErrorRenderer
{
    public function __invoke(Throwable $exception, bool $displayErrorDetails): string
    {
        $title = 'Błąd';
        $message = 'Wystapił błąd.';

        if ($exception instanceof HttpNotFoundException) {
            $title = 'Błąd 404';
            $message = 'Nie można znaleźć tej strony.';
        }

        return $this->renderHtmlPage($title, $message);
    }

    public function renderHtmlPage(string $title = '', string $message = ''): string
    {
        $title = htmlentities($title, ENT_COMPAT|ENT_HTML5, 'utf-8');
        $message = htmlentities($message, ENT_COMPAT|ENT_HTML5, 'utf-8');

        return <<<EOT
<!DOCTYPE html>
<html>
<head>
  <title>$title - Carteam</title>
</head>
<body>
  <h1>$title</h1>
  <p>$message</p>
</body>
</html>
EOT;
    }
}