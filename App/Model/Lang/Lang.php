<?php
namespace App\Model\Lang;
/**
 * Table constants.
 */
final class Lang
{
  private $dict;

  public function __construct($lang='pl')
  {
    $this->dict = require __DIR__ . "/{$lang}.php";
  }

  public function t($key)
  {
    return $this->dict[$key] ?? $key;
  }
}