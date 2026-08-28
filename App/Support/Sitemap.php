<?php

namespace App\Support;

use App\Model\Repositories\ContentsRepository;
use App\Model\Repositories\TagsRepository;
use App\Model\Repositories\CategoriesRepository;

class Sitemap {

    
    var $domain = 'https://blokpres.pl';
    var $sitemap_file; //plik do zapisu
    var $xmlWriter; //bufor xml
    var $config;
    var $sitemapIndex = array(); //tablica z nazwami plikow sitemap
    var $index_file = 'sitemap_index.xml';
    var $mode = 'prod'; //prod- generuje tylko bezacy rok, dev - generuje caly sitemap
    
    public function __construct(
        ContentsRepository $contents,
        TagsRepository $tags,
        CategoriesRepository $categories
    )
    {
        $this->contents = $contents;
        $this->tags = $tags;
        $this->categories = $categories;
    }
    
    function setConfig()
    {
        $this->config = [
            'main' => [
                'priority'=>'1',
                'changefreq'=>'daily'
            ], //strona glowna
            'main_tag' => [
                'priority'=>'0.9',
                'changefreq'=>'weekly'
            ],
            'secondary_tag' => [
                'priority'=>'0.7',
                'changefreq'=>'weekly'
            ],
            'article' => [
                'priority'=>'0.8',
                'changefreq'=>'monthly'
            ]
        ];
    }
    
    function generateSitemap()
    {
        $this->setConfig(); //ustaw priorytety podstron
        
        $this->tags();
        $this->articles();
        $this->sitemapIndex();
        
        unset($this->xmlWriter);
    }
    
    function sitemapIndex()
    {
        $this->xmlWriter = new \XMLWriter();
        $this->xmlWriter->openMemory();
        $this->xmlWriter->setIndent(true);
        $this->xmlWriter->startDocument('1.0', 'UTF-8');
        
        $this->xmlWriter->startElement('sitemapindex');
        $this->xmlWriter->writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        $this->xmlWriter->writeAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');
        $this->xmlWriter->writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        $this->xmlWriter->writeAttribute('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd');
        
        foreach ($this->sitemapIndex as $sitemap) {
            $this->xmlWriter->startElement('sitemap');
            $this->xmlWriter->writeElement('loc', $this->domain.'/'.$sitemap);
            $this->xmlWriter->writeElement('lastmod', $this->formatDate(date("Y-m-d H:i:s")));
            $this->xmlWriter->endElement();
        }
        
        $this->xmlWriter->endElement(); //urlset
        
        $this->sitemap_file = fopen($this->index_file, "w");
        $this->flushXml();
        unset($this->xmlWriter);
    }
    
    //najwazniejsze tagi
    function tags()
    {
        $this->startXml();
        
        //strona glowna
        $this->appendXml([
        'loc' => $this->domain,
        'lastmod' => date("Y-m-d H:i:s"),
        'changefreq' => $this->config['main']['changefreq'],
        'priority' => $this->config['main']['priority']
        ]);

        // kategorie strony
        $categories_unindexed = $this->categories->get(['id', 'slug']);
        foreach ($categories_unindexed as $row) {
            $categories[$row['id']] = $row['slug'];
        }

        foreach ($categories as $item)
        {
            $config = $this->config['main_tag'];
            
            $this->appendXml([
                'loc' => $this->domain.'/'.$item,
                'lastmod' => date("Y-m-d H:i:s"),
                'changefreq' => $config['changefreq'],
                'priority' => $config['priority']
            ]);
        }

        // kategorie katalogow
        $items = $this->tags->where('active', 1)->where('catalog_tag', '>', '0')->orderBy('catalog_tag')->get(['slug', 'title', 'catalog_tag']);
        
        foreach ($items as $item)
        {
            $config = $this->config['main_tag'];
            
            $this->appendXml([
                'loc' => $this->domain.'/'.$categories[$item['catalog_tag']].'/'.$item['slug'],
                'lastmod' => date("Y-m-d H:i:s"),
                'changefreq' => $config['changefreq'],
                'priority' => $config['priority']
            ]);
        }

        // tagi
        $items = $this->tags->forSitemap();
        
        foreach ($items as $item)
        {
            $config = $this->config['main_tag'];
            
            $this->appendXml([
                'loc' => $this->domain.'/tag/'.$item['slug'],
                'lastmod' => date("Y-m-d H:i:s"),
                'changefreq' => $config['changefreq'],
                'priority' => $config['priority']
            ]);
        }

        // tematy
        $items = $this->contents->relatedToNewsForSitemap();

        foreach ($items as $item)
        {
            $config = $this->config['main_tag'];
            
            $this->appendXml([
                'loc' => $this->domain.'/temat/'.$item['slug'],
                'lastmod' => date("Y-m-d H:i:s"),
                'changefreq' => $config['changefreq'],
                'priority' => $config['priority']
            ]);
        }
        
        $this->endXml();
        
        $this->sitemap_file = fopen('sitemap_menu.xml', "w");
        $this->flushXml();
        $this->sitemapIndex[] = 'sitemap_menu.xml';
        unset($this->xmlWriter);
    }
    
    //artykuly podzielone latami
    function articles()
    {
        $curr_year = date("Y");
        $curr_time = date("Y-m-d H:i:s");
        
        $year = 2021;
        
        while ($year <= $curr_year) {
            $years[] = $year;
            $year++;
        }
        
        foreach ($years as $year) {
            
            if ($year == date("Y") || $this->mode == 'dev') {
                $this->startXml();

                $items = $this->contents->where('update_time', '>', $year.'-01-01 00:00:00')->where('update_time', '<', $year . '-12-31 23:59:00')->where('state', 1)->get(['slug', 'update_time']);
                
                foreach ($items as $item)
                {
                    $config['changefreq'] = 'monthly';
                    $config['priority'] = 0.6;

                    $this->appendXml([
                        'loc' => $this->domain . '/' . $item['slug'],
                        'lastmod' => $item['update_time'],
                        'changefreq' => $config['changefreq'],
                        'priority' => $config['priority']
                    ]);
                }
                
                $this->endXml();
                
                $this->sitemap_file = fopen('sitemap_'.$year.'.xml', "w");
                $this->flushXml();
                unset($this->xmlWriter);
            }
            
            $this->sitemapIndex[] = 'sitemap_'.$year.'.xml';
        }
    }
    
    
    /*formatowanie elementow*/
    /*function formatUrl($url)
    {
        return \App\Lib\Tools::prepare_txt_for_url($url);
    }*/
    //Y-m-d H:i:s
    function formatDate($datetime)
    {
        /*$datetime = new DateTime($lastmod);
        $result = $datetime->format('Y-m-d\TH:i:sP');*/
        
        if ($datetime == '0000-00-00 00:00:00') {
            $datetime = '2015-05-31 12:23:10';
        }
        
        return date('c', strtotime($datetime));
    }
    
    
    /*generowanei xmla*/
    
    function startXml()
    {
        $this->xmlWriter = new \XMLWriter();
        $this->xmlWriter->openMemory();
        $this->xmlWriter->setIndent(true);
        $this->xmlWriter->startDocument('1.0', 'UTF-8');
        
        $this->xmlWriter->startElement('urlset');
        $this->xmlWriter->writeAttribute('xmlns', 'http://www.google.com/schemas/sitemap/0.9');
        $this->xmlWriter->writeAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');
        $this->xmlWriter->writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        $this->xmlWriter->writeAttribute('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd');
    }
    
    //zakonczenie xmla - zamkniecie urlset
    function endXml()
    {
        $this->xmlWriter->endElement(); //urlset
    }
    
    function appendXml($data=array())
    {
        $this->xmlWriter->startElement('url');
        $this->xmlWriter->writeElement('loc', $data['loc']);
        $this->xmlWriter->writeElement('lastmod', $this->formatDate($data['lastmod']));
        $this->xmlWriter->writeElement('changefreq', $data['changefreq']);
        $this->xmlWriter->writeElement('priority', $data['priority']);
        $this->xmlWriter->endElement();
    }
    
    function flushXml()
    {
        fwrite($this->sitemap_file, $this->xmlWriter->flush(true));
    }
}