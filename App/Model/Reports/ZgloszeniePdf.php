<?php
namespace App\Model\Reports;

require(realpath(dirname(__FILE__) . '/../../../tcpdf/tcpdf.php'));

/**
 * Zgloszenie kulturalna szkola Pdf
 */
class ZgloszeniePdf
{  
  /**
   * Retun path to document file
   */
  private function getRealDocumentPath($id_project, $filename = '')
  {
    $dir = __DIR__ . '/../../../reports/' . floor($id_project / 1000);
    
    if (!is_dir($dir)) {
      makedirs($dir);
    }
    
    if ($filename) {
      return $dir . '/' . \strtolower($filename) . '.pdf';
    } else {
      return $dir . '/' . $id_project . '.pdf';
    }
  }

  public function print($params = [])
  {    
    $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    
    // set document information
    $pdf->setCreator('Mazowieckie Centrum Sztuki Współczesnej Elektrownia');
    $pdf->setAuthor('Elektrownia');
    $pdf->setTitle('Kulturalna Szkoła na Mazowszu');
    $pdf->setSubject('Zgłoszenie szkoły do Programu');

    // remove default header/footer
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    // set header and footer fonts
    // $pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
    // $pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));

    // set margins
    $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
    $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);
    $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
    
    // set auto page breaks
    $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

    // set image scale factor
    $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);  

    // set default font subsetting mode
    $pdf->setFontSubsetting(true);

    // $pdf->SetFont('dejavusans', '', 14, '', true);
    $pdf->SetFont('dejavusans', '', 14, '', true);



    $pdf->AddPage();

    $html = '<table cellpadding="6" style="line-height: 2.5">
      <tbody>
        <tr>
          <td width="40%">(pieczątka szkoły/nazwa szkoły)</td>
          <td width="60%" align="right">Załącznik nr 2</td>
        </tr>
      </tbody>
    </table>
    <p style="text-align: center; font-size: 16px; font-weight: bold;">Zgłoszenie szkoły do Programu <br />"Kulturalna szkoła na Mazowszu"</p>
    <p>Niniejszym zgłaszamy naszą szkołę:</p>
    <table border="1" bordercolor="#CCCCCC" cellpadding="6" style="line-height: 2">
      <tbody>
        <tr>
          <td width="30%" style="text-align: center; font-weight: bold;">' . (($params['customer_type'] == 'primary') ? '<strong>X</strong>' : '') . '</td>
          <td width="70%">szkoła podstawowa</td>
        </tr>
        <tr>
          <td width="30%" style="text-align: center; font-weight: bold;">' . (($params['customer_type'] == 'post_primery') ? '<strong>X</strong>' : '') . '</td>
          <td width="70%">szkoła ponadpodstawowa</td>
        </tr>
      </tbody>
    </table>
    <div style="line-height: 1.75">(prosimy wstawić x w odpowiedniej rubryce)</div>
    <br /><br />
    <p>Do wypełnienia:</p>
    <table border="1" bordercolor="#CCCCCC" cellpadding="6">
      <tbody>
        <tr>
          <td width="30%">Pełna nazwa szkoły</td>
          <td width="70%" colspan="2">' . ($params['name'] ?? '') . '</td>
        </tr>
        <tr>
          <td>Adres szkoły (ulica, kod pocztowy, miejscowość)</td>
          <td colspan="2">' . $params['street'] . ', ' . $params['zip_code'] . ' ' . $params['city'] . '</td>
        </tr>
        <tr>
          <td>Telefon szkoły</td>
          <td colspan="2">' . $params['phone'] . '</td>
        </tr>
        <tr>
          <td>Adres e-mail szkoły</td>
          <td colspan="2">' . $params['email'] . '</td>
        </tr>
        <tr>
          <td>Osoba do kontaktu (Imię i nazwisko)</td>
          <td colspan="2">' . $params['contact_name'] . '</td>
        </tr>
        <tr>
          <td>Telefon</td>
          <td colspan="2">' . $params['contact_phone'] . '</td>
        </tr>
        <tr>
          <td>Adres e-mail</td>
          <td colspan="2">' . $params['contact_email'] . '</td>
        </tr>
        <tr>
          <td>Ogółem liczba uczniów</td>
          <td colspan="2">' . ($params['pax']) . '</td>
        </tr>
        <tr>
          <td>w tym dzieci do lat 7</td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>Liczba grup</td>
          <td colspan="2">' . $params['group_number'] . '</td>
        </tr>
        <tr>
          <td>Liczba opiekunów</td>
          <td colspan="2">' . $params['pax_care'] . '</td>
        </tr>
        <tr>
          <td>Termin wizyty</td>
          <td colspan="2">' . $params['visit_date'] . '</td>
        </tr>
        <tr>
          <td>Rodzaj, zakres oraz nazwa oferty /np. warsztatów, lekcji muzealnych, spektakli, wystaw/</td>
          <td colspan="2">' . $params['offer_description'] . '</td>
        </tr>
      </tbody>
    </table>
    <br /><br /><br /><br /><br />
    <table cellpadding="6">
      <tbody>
        <tr>
          <td width="60%">....................................., dnia .....................................</td>
          <td width="40%" align="center">................................................................<br />(podpis dyrektora szkoły)</td>
        </tr>
      </tbody>
    </table>
    ';

    $pdf->SetFont('dejavusans', '', 9);
    $pdf->writeHTMLCell(0, 0, '', '', $html, 0, 1, 0, true, '', true);






    $document_url = $this->getRealDocumentPath(1, 'dup');

    $pdf->Output($document_url, 'F');
    
    return ['url' => $document_url];
  }
}