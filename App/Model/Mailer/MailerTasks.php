<?php

namespace App\Model\Mailer;

use App\Model\Mailer\Mailer;
use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\MailerTasksRepository;

/**
 * Mailer tasks service
 */
class MailerTasks extends Mailer
{
  private $mailer_tasks;
  
  public function __construct(PDO $connection, Tables $tables, MailerTasksRepository $mailer_tasks)
  {
    $this->mailer_tasks = $mailer_tasks;
  } 

  /**
   * Add task
   */
  public function addTask($data)
  {
    if (!isset($data['address'])) {
      return ['error' => 1, 'status' => 'error', 'message' => 'No address'];
    }
    if (!isset($data['subject'])) {
      return ['error' => 1, 'status' => 'error', 'message' => 'No subject'];
    }
    if (!isset($data['body'])) {
      return ['error' => 1, 'status' => 'error', 'message' => 'No body'];
    }

    $status = $this->mailer_tasks->insert([
      'address' => $data['address'],
      'address_name' => $data['address_name'] ?? '',
      'reply_email' => $data['reply_email'] ?? '',
      'subject' => $data['subject'],
      'body' => $data['body'],
      'state' => '0'
    ]);

    return ['status' => 'success'];
  }
  
  /**
   * Execute waiting tasks (10)
   */
  public function executeTasks()
  {
    $tasks = $this->getToExecute();

    if ($tasks && is_array($tasks)) {
      foreach ($tasks as $task) {
        if ($this->send([
          'address' => $task['address'],
          'address_name' => $task['address_name'] ?? null,
          'reply_email' => $task['reply_email'] ?? null,
          'subject' => $task['subject'] ?? 'Wiadomość od CarTeam.pl',
          'body' => $task['body']
        ])) {
          $update_payload = [
            'sending_time' => time(),
            'state' => 1
          ];
        } else {
          $update_payload = [
            'sending_time' => time(),
            'state' => 2,
            'error_message' => $this->ErrorInfo ?? ''
          ];
        }

        $this->mailer_tasks->where('id', $task['id'])->update($update_payload);
      }
    }
  }

  /**
   * Get 10 waiting tasks to execute
   */
  private function getToExecute()
  {
    return $this->mailer_tasks->where('state', '0')->limit(5)->get();
  }

}