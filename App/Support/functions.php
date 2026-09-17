<?php

function isValidDateTime(string $string): bool
{
    if (trim($string) === '') {
        return false;
    }

    try {
        new DateTime($string);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Convert all applicable characters to HTML entities.
 *
 * @param string|null $text The string
 *
 * @return string The html encoded string
 */
function html(string $text = null): string
{
    return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Format user friendly datetime
 *
 * @param string|null $datetime
 *
 * @return string date and time
 */
function friendlyDate(string $datetime = null): string
{
    $date = date("Y-m-d", strtotime($datetime));
    
    if ($date == date("Y-m-d")) { 
        return 'Dzisiaj' . " " . substr($datetime, -8, 5);
    } else if ($date == date("Y-m-d", strtotime("-1 days"))) {
        return 'Wczoraj' . " " . substr($datetime, -8, 5);
    } else {
        return substr($datetime, 0, -3);
    }
}

function getPageUrl()
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    $domain = $_SERVER['HTTP_HOST'];

    return $protocol . "://" . $domain;
}

function trimStr($str, $len)
{
    if(strlen($str) > $len) {
        $str = preg_replace("/^(.{1,$len})(\s.*|$)/s", '\\1...', $str);
    }
    return($str);
}

function makedirs($dirpath, $mode=0755) {
    return is_dir($dirpath) || (mkdir($dirpath, $mode, true) && chmod($dirpath, $mode));
}

function slug($str) {
    $str = str_replace(
    array('ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż','Ą','Ć','Ę','Ł','Ń','Ó','Ś','Ź','Ż','?',',','!','#'), 
    array('a', 'c', 'e', 'l', 'n', 'o', 's', 'z', 'z','A','C','E','L','N','O','S','Z','Z','','','',''), 
    trim($str));
    
    $clean = iconv('UTF-8', 'ASCII//TRANSLIT', $str);
    $clean = preg_replace("/[^a-zA-Z0-9\/_|+ -]/", '', $clean);
    $clean = strtolower(trim($clean, '-'));
    $clean = preg_replace("/[\/_|+ -]+/", '-', $clean);
    
    return $clean;
}

function checkNull($arg) {
    return ($arg == "null" || $arg == "") ? null : $arg;
}

