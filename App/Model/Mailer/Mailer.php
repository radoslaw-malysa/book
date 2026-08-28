<?php

namespace App\Model\Mailer;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use App\Model\Mailer\MailerConfig;

/**
 * Service.
 */
class Mailer
{
  /**
   * Send email
   *
   * @param $params [address, address_name, reply_email, reply_name, subject, body, alt_body]
   *
   * @return int The new user ID
   */
  public function send($params)
  {
    $mail = new PHPMailer(true);
    
    try {
      //Server settings
      // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
      $mail->isSMTP();
      $mail->Host       = MailerConfig::ADMIN_HOST;
      $mail->SMTPAuth   = true;
      $mail->Username   = MailerConfig::ADMIN_USERNAME;
      $mail->Password   = MailerConfig::ADMIN_PASSWORD;
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` also accepted
      $mail->Port       = 587;                                    // TCP port to connect to
  
      //Recipients
      $mail->setFrom(MailerConfig::ADMIN_EMAIL, MailerConfig::ADMIN_NAME);

      if (is_array($params['address'])) {
        foreach ($params['address'] as $item) {
          $mail->addAddress($item, ($params['address_name']) ?? null);
        }
      } else {
        $mail->addAddress($params['address'], ($params['address_name']) ?? null);
      }

      if ($params['reply_email']) {
          $mail->addReplyTo($params['reply_email'], ($params['reply_name']) ?? null);
      } else {
          $mail->addReplyTo(MailerConfig::ADMIN_EMAIL, MailerConfig::ADMIN_NAME);
      }

      if (isset($params['bcc'])) {
        $mail->addBCC($params['bcc']);
      }

      //$mail->addCC('cc@example.com');
      //$mail->addBCC('bcc@example.com');
  
      // Attachments
      if (isset($params['attachments']) && is_array($params['attachments'])) {
        foreach ($params['attachments'] as $attachment) {
          $mail->addAttachment($attachment);
        }
      }
      //$mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
      //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
  
      // Content
      //$mail->AddEmbeddedImage('images/logo.png', 'logo', 'logo.png');
      
      $body = '<html><style>h2 { font-family:Arial, Helvetica, sans-serif; margin-bottom: 32px; font-size: 16px; color: #013C51; } p, ul li, table td, table th { font-family:Arial, Helvetica, sans-serif; font-size: 14px; color: #013C51; }</style><body style="max-width: 100% !important; padding: 16px 0;">';
      $body .= '<div style="max-width: 680px; margin:0 auto;">';
      $body .= '<div style="text-align: center;"><img src="cid:logo" alt="carteam logo" style="display:inline-block; width: 25%;" /></div>';
      $body .= '<div style="font-family:Arial, Helvetica, sans-serif; background-color: rgba(53, 65, 90, 0.08); padding: 32px; border-radius: 24px; margin-top: 32px; margin-bottom: 32px; font-size: 18px;">' . $params['body'] . '</div>';
      $body .= '<div style="font-family:Arial, Helvetica, sans-serif; color: rgba(0,0,0,0.68); padding: 0 16px;">This message was sent automatically. Do not reply to this email. If you have any questions, please contact us.</div>';
      $body .= '</div></body></html>';
      
      $mail->isHTML(true);
      $mail->CharSet = 'UTF-8';
      $mail->Subject = $params['subject'];
      $mail->Body = $body;
      if (isset($params['alt_body']) && $params['alt_body']) { $mail->AltBody = $params['alt_body']; }
      
      $mail->AddEmbeddedImage("images/routetrade_logo_v.png", "logo", "routetrade_logo_v.png");
      // $mail->addStringAttachment(file_get_contents("https://carteam.pl/images/envelope.png"), "envelope");
      
      if ($mail->send()) {
          return true;
      } else {
          return false;
      }
    } catch (Exception $e) {
      //echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
      //$result = ['error' => '1', 'message' => 'Nie udało się wysłać wiadomości. Problem z serwerem poczty. '.$mail->ErrorInfo];
      return false;
    }
  }
  
}