<?php
namespace App\Support;
class CacheFile
{
    private static $_instance;
    private $cache_dir = '../cache/';
    private $body;
    private $data;
    
    public static function getInstance()
    {
        if (self::$_instance === null) { 
            self::$_instance = new self();
        }
        return self::$_instance;
    }
    
    public function __construct()
    {
        //$this->cache_dir = 'cache/';
    }
    
    private function __clone()
    {
    }
    
    public function __toString()
    {
        return $this->body;
    }
    
    //CACHE METHODS
    //extended=1 - 1: return full object, 0: value only
    public function get($key, $extended = null)
    {
        $file_path = $this->getFilePath($key);
        
        if ($content = @file_get_contents($file_path)) {
            //$this->data = strtok($txt, "\n");
            //$this->body = strtok("\n");
            $data_end = strpos($content, "-->") + 3;
            $this->data = json_decode(substr($content, 4, $data_end - 7));
            $this->body = substr($content, $data_end);
            
            if ($this->data && isset($this->data->expires)) {
                //$this->body = date("Y-m-d h:i:s",$this->data->expires).'<'.date("Y-m-d h:i:s",strtotime("now"));
                if ($this->data->expires < strtotime("now")) {
                    //$this->delete($key);
                    
                    if (!$this->is_locked($file_path)) {
                        $this->lock($file_path);
                        $this->body = null;
                    }
                }
            }
            
            if ($extended == 1) {
                return $this;
            } else {
                return $this->body;
            }
        } else {
            if ($extended == 1) {
                return $this;
            } else {
                return null;
            }
        }
    }
    
    private function lock($file_path)
    {
        //$dir = substr($file_path, 0, strrpos($file_path, '/'));
        //$this->makedirs($dir);
        
        file_put_contents($file_path . '_tmp', strtotime("+15 seconds"), LOCK_EX);
        file_put_contents($file_path . '', LOCK_EX);
    }
    
    private function unlock($file_path)
    {
        @\unlink($file_path . '_tmp');
    }
    
    private function is_locked($file_path)
    {
        return file_exists($file_path . '_tmp');
    }
    
    public function set($key, $value, $expiration=null, $data=null)
    {
        //if (is_array($value)) { $value = json_encode($value); }
        
        $file = $this->getFilePath($key);
        //if (is_array($value)) { print_r($value); exit;}
        //$dir = substr($file, 0, strrpos($file, '/'));
        //$this->makedirs($dir);
        
        $tmp_file = $file . uniqid('', true);
        //$tmp_file = $file . '_tmp';
        
        if ($expiration) {
            $data['expires'] = strtotime ("+$expiration seconds");
        }
        
        $content = ($data) ? '<!--'.json_encode($data).'-->' : '<!---->';
        $content .= $value;
        
        file_put_contents($tmp_file, $content, LOCK_EX);
        rename($tmp_file, $file);
        $this->unlock($file);
    }
    
    public function touch($key, $expiration)
    {
        
    }
    
    public function delete($key)
    {
        @\unlink($this->getFilePath($key));
    }
    
    //tworzy plik cache
    public function create($key)
    {
        $opts = array(
            'http' => array(
                'method' => "GET",
                'header' => "CC: 1"
            ),
            'ssl' => array(
                'verify_peer'      => false,
                'verify_peer_name' => false,
            )
        );
        $context = stream_context_create($opts);
        
        file_get_contents((isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]".$key, false, $context);
        //die();
    }
    
    public function get_body()
    {
        return $this->body;
    }
    
    public function get_data()
    {
        return $this->data;
    }
    
    //ADMIN UTILS
    
    public function clear_cache()
    {
        $this->delete_recursive($this->cache_dir);
    }
    
    //PRIVATE
    
    private function getFilePath($key)
    {
        $hash = md5($key);
        return $this->cache_dir . $hash;
        //return $this->cache_dir . substr($hash, 0, 2) . '/' . $hash;
    }
    
    //usuwa rekursywnie pliki
    private function delete_recursive($file_name)
    {
        if (is_file($file_name)) {
            return @\unlink($file_name);
        }
        elseif (is_dir($file_name)) {
            $scan = glob(rtrim($file_name,'/').'/*');
            
            foreach($scan as $path) {
                $this->delete_recursive($path);
            }
            
            if ($file_name != $this->cache_dir) {
                return @rmdir($file_name);
            }
        }
    }
    
    private function makedirs($dirpath, $mode=0777) {
        return is_dir($dirpath) || mkdir($dirpath, $mode, true);
    }
}
