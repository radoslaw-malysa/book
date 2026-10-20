<div style="padding: 0 32px 0 32px; color: #0a0a0a; margin-top: 32px;">
  <h1 style="font-size: 20px;">Dziękujemy za rezerwację.</h1>

  <?php if (isset($email_message) && $email_message): ?>
  <h2><?php echo $email_message ?></h2>
  <?php endif ?>

  <div style="font-family:Verdana, Arial, Helvetica, sans-serif;">
    <p><strong>Nr rezerwacji:</strong> <?php echo $appointment['id'] ?></p>
    <p><strong>Termin wizyty:</strong> <?php echo $appointment['visit_date'] ?> godz. <?php echo substr($appintment['visit_time'], 0 , -3) ?></p>
    <p><strong>Warsztaty:</strong> <?php echo $service['name'] ?? '' ?></p>
    <p><a href="<?php echo $appointment_url ?>" target="_blank">Szczegóły rezerwacji</a></p>
  </div>
</div>

<?php if (isset($appointment['kulturalna_szkola']) && $appointment['kulturalna_szkola'] == 1): ?>
<div style="font-family:Verdana, Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: #0a0a0a; padding: 32px; border-radius: 0px; margin-top: 32px; margin-bottom: 32px;">
  <table style="border: none;">
    <tr>
      <td style="border: 3px solid #0a0a0a;"><h2 style="margin: 0">&nbsp;1&nbsp;</h2></td>
      <td style="padding-left: 8px; color: #0a0a0a;"><h2 style="margin: 0">Wydrukuj i prześlij zgłoszenie</h2></td>
    </tr>
  </table>
  <ul style="margin-left: 0; color: #0a0a0a;">
    <li>Wydrukuj zgłoszenie.</li>
    <li>Najpóźniej <strong>7 dni</strong> przed planowaną wizytą prześlij skan zgłoszenia z pieczątką szkoły i podpisem dyrektora (lub wicedyr.) na adres <?php echo $reservation_email ?>. Oryginał wniosku przekaż w kasie Muzeum w dniu wizyty.</li>
    <li><strong>Bez dostarczonego w terminie wniosku, obowiązują ceny regularne.</strong></li>
  </ul>
  <p style="margin-top:32px;">
  <a href="<?php echo $zgloszenie_url ?>" target="_blank" style="display:inline-block; background-color: #0a0a0a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold;">Pobierz zgłoszenie</a>
  </p>
</div>
<?php endif ?>

<div style="font-family:Verdana, Arial, Helvetica, sans-serif; background-color: #f6c1e6; color: #002e61; padding: 32px; border-radius: 0px; margin-top: 32px; margin-bottom: 32px;">
  <?php if (isset($appointment['kulturalna_szkola']) && $appointment['kulturalna_szkola'] == 1): ?>
  <table style="border: none; color: #002e61;">
    <tr>
      <td style="border: 3px solid #002e61;"><h2 style="margin: 0">&nbsp;2&nbsp;</h2></td>
      <td style="padding-left: 8px;"><h2 style="margin: 0;">Potwierdź rezerwację</h2></td>
    </tr>
  </table>
  <?php else: ?>
  <h2 style="margin-top: 0">Potwierdź rezerwację</h2>
  <?php endif ?>
  <ul style="margin-left: 0;">
    <li>Prosimy o potwierdzenie najpóźniej <strong>5 dni</strong> przed terminem zajęć.</li>
    <li>W szczególnych przypadkach (np. znacząca zmiana liczby osób) rezerwacja może być potwierdzona telefonicznie pod numerem <strong style="white-space: nowrap;">tel. <?php echo $reservation_phone ?? '' ?></strong>.</li>
    <li>W przypadku braku potwierdzenia lekcja uznana zostaje za odwołaną.</li>
  </ul>
  <p style="margin-top:32px;">
    <a href="<?php echo $confirm_url ?>?confirm=1" target="_blank" style="display:inline-block; background-color: #002e61; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold;">Potwierdź rezerwację</a>
    <strong style="display: inline-block; padding-left: 8px; padding-right: 8px;">lub</strong>
    <a href="<?php echo $cancel_url ?>?cancel=1" target="_blank" style="display:inline-block; border: 3px solid #002e61; color: #002e61; padding: 10px 24px; text-decoration: none; font-weight: bold;">Anuluj rezerwację</a>
  </p>
</div>
<?php if (isset($reservation->preferential) && $reservation->preferential == 1): ?>
<p style="margin-top:32px; margin-bottom: 32px; font-family:Verdana, Arial, Helvetica, sans-serif; opacity: 0.7;"><span>&#42;</span> Program "Kulturalna szkoła na Mazowszu" jest finansowany przez Urząd Marszałkowski. Uczestnictwo jest uzależnione od środków w dyspozycji. Decyduje kolejność wpływu zgłoszeń.</p>
<?php endif ?>