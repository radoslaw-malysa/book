<div style="font-family:Verdana, Arial, Helvetica, sans-serif; background-color: #F5F5F5; color: #0a0a0a; padding: 32px; border-radius: 0px; margin-top: 32px; margin-bottom: 32px; font-size: 14px;">
  <h1 style="font-size: 18px">Nowa rezerwacja</h1>

  <div style="font-family:Verdana, Arial, Helvetica, sans-serif;">
    <p><strong>Nr</strong> <?php echo $appointment['id'] ?></p>
    <p><strong>Termin:</strong> <?php echo $appointment['visit_date'] ?> godz. <?php echo substr($appointment['visit_time'], 0 , -3) ?></p>
    <p><strong>Warsztaty:</strong> <?php echo $service['name'] ?? '' ?></p>
    <p><strong>Szkoła:</strong> <?php echo $customer['name'] ?? '' ?></p>
    <p><a href="<?php echo $appointment_url ?? '' ?>" target="_blank">Szczegóły rezerwacji</a></p>
    <p></p><p></p>
  </div>
</div>