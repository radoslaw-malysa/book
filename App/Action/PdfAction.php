<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Factory\StreamFactory;

use \App\Model\Repositories\AppointmentsRepository;
use \App\Model\Repositories\CustomersRepository;
use \App\Model\Repositories\AppointmentProvidersRepository;

class PdfAction {

  public function __construct(
    AppointmentsRepository $appointments,
    CustomersRepository $customers,
    AppointmentProvidersRepository $appointment_providers
    )
  {
    $this->appointments = $appointments;
    $this->customers = $customers;
    $this->appointment_providers = $appointment_providers;
  }

  public function zgloszenie(Request $request, Response $response, $args)
  {
    $token = $args['token'] ?? '';

    $appointment = $this->appointments->getByToken($token);
  
    

    if (isset($appointment['id']) && $appointment['id']) {
      $customer = $this->customers->where('id', $appointment['customer_id'])->first();
  
      // offer description
      $services = $this->appointment_providers->getServicesWniosek($appointment['id']);
      $customer['offer_description'] = '';
      foreach ($services as $service) {
        $customer['offer_description'] .= (($service['service_type'] == 'lesson')) ? ('Warsztaty: ' . $service['name']) : $service['name'];
        $customer['offer_description'] .= '<br />';
      }
      
      //$info['offer_description'] = implode('<br />', $offer_scope);

      // group number
      $customer['group_number'] = 1;
      /*if ($reservation['guide'] || $reservation['id_offer']) {
        $info['group_number'] = ceil(($reservation['qty_adult'] + $reservation['qty_chd']) / 25);
      } else {
        $info['group_number'] = 1;
      }*/

      $file = (new \App\Model\Reports\ZgloszeniePdf())->print(array_merge($appointment, $customer));

      if (isset($file['url'])) {
        $data = file_get_contents($file['url']);

        //$mime = finfo_buffer(finfo_open(FILEINFO_MIME_TYPE), $data);
        //$response = $response->withHeader('Content-Type', $mime);
        $response = $response->withHeader('Content-Type', 'application/pdf');
        return $response->withBody((new StreamFactory())->createStream($data));
  
        //$response->write(file_get_contents($file['url']));
        //return $response->withHeader('Content-Type', 'application/pdf');
  
        // ->withHeader('Content-Disposition', 'attachment;filename=forhesit_report_' . $slug . '.pdf');
      }
    }

    echo 'eror'; exit;
  }

}