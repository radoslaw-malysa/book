<?php
namespace Model\Reports;

require(realpath(dirname(__FILE__) . '/../../../tcpdf/tcpdf.php'));

class Pdf extends \TCPDF
{
  public function Header() {
    /*// Logo
    $image_file = realpath(dirname(__FILE__) . '/../../../public/images/norway_grants_logo.png');
    $this->Image($image_file, 10, 10, 15, '', 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
    // Set font
    $this->SetFont('helvetica', 'B', 20);
    // Title
    $this->Cell(0, 15, '<< TCPDF Example 003 >>', 0, false, 'C', 0, '', 0, false, 'M', 'M');*/

    $image_file = realpath(dirname(__FILE__) . '/../../../public/api/images/norway_grants_logo.png');

    $html = '<table><tr><td width="25%"><img src="' . $image_file . '" style="display: block; width: 76px" /></td>
    <td width="75%" style="text-align: right; line-height: 1.25;"><br /><br /><strong>System IT wspierający szkolnictwo wyższe i rozwój kariery<br />
    z wykorzystaniem metodyki foresight (FORhesIT)</strong><br />
    nr projektu: EOG/21/K4/W/0118</td></tr></table>';

    $this->SetFont('dejavusans', '', 8);
    $this->writeHTMLCell(0, 0, '', '', $html, 0, 1, 0, true, '', true);
  }

  // Page footer
  public function Footer() {
    // Position at 15 mm from bottom
    $this->SetY(-15);
    // Set font
    $this->SetFont('dejavusans', '', 8);
    // Page number
    $this->Cell(0, 10, $this->getAliasNumPage(), 0, false, 'R', 0, '', 0, false, 'T', 'M');
  }
}