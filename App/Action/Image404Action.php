<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Factory\StreamFactory;
use App\Model\Support\Magician\imageLib;

final class ImageAction
{   
    private $source_dir = 'img/';
    private $thumb_dir = 'thumbs/';
    //private $default_width = 400;
    //private $defaul_height = 300;
    private $default_resize_method = 'crop-auto'; //auto/crop_auto/landscape
    
    public function __invoke(Request $request, Response $response, $args) 
    {
        $thumb_image = ltrim($request->getUri()->getPath(), '/');
        
        if (strpos($thumb_image, $this->thumb_dir) !== false) {
            
            //thumb
            $thumb_image_parts = explode('/', str_replace($this->thumb_dir, '', $thumb_image));
            
            if (strpos($thumb_image_parts[0], 'x') !== false) {
                list($width, $height) = explode('x', $thumb_image_parts[0]);
                
                //source
                unset($thumb_image_parts[0]);
                $source_image = $this->source_dir . implode("/", $thumb_image_parts);
                
                if (file_exists($source_image) && $width && $height) {
                    $this->create_image($source_image, $thumb_image, $width, $height, $this->default_resize_method, false);
                }
            } else {
                $no_thumb_size = true;
            }
        }
        
        if (file_exists($thumb_image)) {
            $data = file_get_contents($thumb_image);
        } elseif (!isset($width) || !isset($height)) {
            $data = file_get_contents('img/dev/2.avif');
        } else {
            $data = file_get_contents('img/dev/1.avif');
        }

        $mime = finfo_buffer(finfo_open(FILEINFO_MIME_TYPE), $data);
        $response = $response->withHeader('Content-Type', $mime);
        return $response->withBody((new StreamFactory())->createStream($data));
    }

    private function create_image($source_image, $destination_image, $width, $height, $resize_method='auto', $watermark=false)
    {
        $destination_dir = pathinfo($destination_image, PATHINFO_DIRNAME);
        makedirs($destination_dir);

        $magicianObj = new imageLib($source_image);
        
        if ($resize_method == 'crop-landscape-only') { 
            list($src_width, $src_height, $src_type, $src_attr) = getimagesize($source_image);
            if ($src_width < $src_height) {
                $magicianObj -> resizeImage($width, $height, 'auto');
            } else {
                $magicianObj -> resizeImage($width, $height, 'crop-auto');
            }
        } else if ($resize_method) { 
            $magicianObj -> resizeImage($width, $height, $resize_method);
        } else { 
            $magicianObj -> resizeImage($width, $height, 'crop-auto');
        }
        
        //znak wodny
        /*if ($watermark && WATERMARK) {
            $magicianObj->addWatermark(WATERMARK,'tr','20');
        }*/
        
        $magicianObj -> saveImage($destination_image, 80);
    }
}