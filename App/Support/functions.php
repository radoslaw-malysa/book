<?php

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

/*
function price_pl($price) {
    if (floor($price) != $price) {
        return number_format($price, 2, ',', ' ').' zł';
    } else {
        return number_format($price, 0, ',', ' ').' zł';
    }
}

function social_btns($json) {
    $btns_html = '';
    $arr = json_decode($json, true);
    if (is_array($arr)) {
        foreach ($arr as $item) {
            $btns_html .= (in_array($item['id'], ['twitter','facebook','medium','youtube','telegram','instagram','reddit','github','www','blog','linkedin'])) ? '<a href="' . $item['url'] . '" rel="nofollow" target="_blank" class="mdc-icon-button"><span class="icon-' . $item['id'] . ' db"></span></a>' : '';
        }
    }
    return $btns_html;
}

function parseLinks($json) {
    $arr = json_decode($json, true);
    $result = [];
    if (is_array($arr)) {
        foreach ($arr as $item) {
            $type = $href = $icon = '';
            
            if ($item['url']) {
                if (strpos($item['url'], '@') !== false) {
                    $type = 'email';
                    $href = 'mailto:' . $item['url'];
                    $icon = 'email';
                } else {
                    if ((strpos($item['url'], 'http') !== false)) {
                        $href = $item['url'];
                    } else {
                        $digits_count = preg_match_all( "/[0-9]/", $item['url'] );
                        
                        if ($digits_count > 6) {
                            $type = 'phone';
                            $href = 'tel:' . $item['url'];
                            $icon = 'phone';
                        } else {
                            $href = '//' . $item['url'];
                        }
                    }
                }
            }

            array_push($result, [
                'url' => $item['url'],
                'title' => $item['title'],
                'tip' => $item['tip'],
                'type' => $type,
                'href' => $href,
                'icon' => $icon
            ]);
        }
    } 

    return $result;
}
*/
//return array_filter($arr, function($v, $k) { return in_array($v['id'], ['www','email','phone','address']); }, ARRAY_FILTER_USE_BOTH);