<?php

namespace App\Model\Repositories;

use PDO;
use App\Model\Repositories\Tables;
use App\Model\Repositories\Repository;

/**
 * Repository.
 */
class AppointmentProvidersRepository extends Repository
{
  public function __construct(PDO $connection, Tables $tables)
  {
    $this->connection = $connection;
    $this->model = $tables->appointment_providers;
    $this->tables = $tables;
  }

  // get rows for calendar
  public function getRange($params = [])
  {
    $filters = [];
    if (!isset($params['state']) || !$params['state']) {
      $filters[] = "ap.state != 'cancelled' ";
    }
    if (isset($params['start_time']) && isset($params['end_time'])) {
      $filters[] = "(
        (a.start_time >= '{$params['start_time']}' and a.start_time < '{$params['end_time']}') or 
        (a.end_time > '{$params['start_time']}' and a.end_time <= '{$params['end_time']}') or 
        (a.start_time < '{$params['start_time']}' and a.end_time > '{$params['end_time']}')
      )";
    }

    $query = "select a.*, ap.state, se.name as service_name 
    from " . $this->model . " a left join " . $this->tables->appointments . " ap on a.appointment_id = ap.id 
    left join {$this->tables->services} se on ap.service_id = se.id ";
    $query .= ($filters) ? ('where '. implode(' and ', $filters)) : '';
    $st = $this->connection->prepare($query);
    
    $st->execute();
    return $st->fetchAll();
  }

  /**
   * Edit appointment dialog
   */
  public function getGrouppedByType($params = [])
  {
    $appointment_providers = [];
    $appointment_id = $params['id'] ?? 0;

    if ($appointment_id) {
      $query = "select ap.*, se.service_type 
      from {$this->model} ap left join {$this->tables->services} se on ap.service_id = se.id 
      where ap.appointment_id = '{$appointment_id}' 
      order by ap.start_time ";

      $st = $this->connection->prepare($query);
      $st->execute();
      $rows = $st->fetchAll();

      foreach ($rows as $row) {
        $appointment_providers[$row['service_type']][] = $row;
      }
    }

    // fill with empty placeholders to edit dialog
    $placeholders = [
      'lesson' => 2,
      'tour' => 2,
      'cinema' => 1,
      'blockade' => 2
    ];

    foreach ($placeholders as $type => $type_count) {
      $services_count = (isset($appointment_providers[$type])) ? count($appointment_providers[$type]) : 0;

      if ($services_count < $type_count) {
        for ($i = 0; $i < $type_count - $services_count; $i++) {
          // fil params only for first row
          if ($services_count == 0 && $i == 0) {
            $appointment_providers[$type][] = $this->getNew([
              'appointment_id' => $appointment_id ?? 0,
              'provider_id' => $params['provider_id'] ?? 0,
              'start_time' => $params['start_time'] ?? ''
            ]);
          } else {
            $appointment_providers[$type][] = $this->getNew([
              'appointment_id' => $appointment_id ?? 0
            ]);
          }
        }
      }
    }

    return $appointment_providers;
  }

  /**
   * CRUD update appointment
   */
  public function updateAppointment($appointment_id, $data) 
  {
    if (is_array($data)) {
      $updated = [];

      foreach ($data as $item) {
        if ((isset($item['service_id']) && $item['service_id'] && isset($item['provider_id']) && $item['provider_id']) || (isset($item['notes']) && $item['notes'])) {
          $to_update_data = [
            'service_id' => $item['service_id'] ?? 0,
            'provider_id' => $item['provider_id'] ?? 0,
            'start_time' => (isset($item['start_time']) && $item['start_time']) ? $item['start_time'] : NULL,
            'end_time' => (isset($item['end_time']) && $item['end_time']) ? $item['end_time'] : NULL,
            'notes' => $item['notes'] ?? ''
          ];

          if (isset($item['id']) && $item['id'] > 0 ) {
            $this->where('id', $item['id'])->update($to_update_data);
            $updated[] = $item['id'];
          } else {
            $to_update_data['appointment_id'] = $appointment_id;
            $updated[] = $this->insert($to_update_data);
          }
        }
      }

      // delete not existing id in new dataset
      $this->where('appointment_id', $appointment_id)->where('id', 'NOT IN', $updated)->delete();
    }

    return true;
  }

  public function getNew($params = [])
  {
    return [
      'appointment_id' => $params['appointment_id'] ?? 0,
      'service_id' => 0,
      'provider_id' => $params['provider_id'] ?? 0,
      'start_time' => $params['start_time'] ?? '',
      'end_time' => ''
    ];
  }

  /**
   * Booking
   */


  /**
 * Zwraca listę dostępnych godzin dla danej lekcji pogrupowaną według każdego dnia w zadanym przedziale czasowym.
 *
 * @param string $appointmentDateStart Początek przedziału (format: 'Y-m-d' lub 'Y-m-d H:i:s').
 * @param string $appointmentDateEnd   Koniec przedziału (format: 'Y-m-d' lub 'Y-m-d H:i:s').
 * @param int    $lessonId             ID lekcji.
 * @return array<string, array<string>> Tablica w formacie: ['YYYY-MM-DD' => ['HH:MM', 'HH:MM', ...], ...]
 * @throws InvalidArgumentException|RuntimeException
 */
  function getAvailableLessonSlotsPerDay(
      string $appointmentDateStart,
      string $appointmentDateEnd,
      int $lessonId
  ): array {
    // 1. Walidacja i normalizacja zakresu dat
    try {
      $start = strlen($appointmentDateStart) === 10
        ? new \DateTimeImmutable($appointmentDateStart . ' 00:00:00')
        : new \DateTimeImmutable($appointmentDateStart);

      $end = strlen($appointmentDateEnd) === 10
        ? new \DateTimeImmutable($appointmentDateEnd . ' 23:59:59')
        : new \DateTimeImmutable($appointmentDateEnd);
    } catch (Exception $e) {
      throw new \InvalidArgumentException("Niepoprawny format daty: {$e->getMessage()}");
    }

    if ($start > $end) {
      throw new \InvalidArgumentException("Data początkowa nie może być późniejsza niż data końcowa.");
    }


    // 2. Pobranie czasu trwania lekcji
    $stmtLesson = $this->connection->prepare('SELECT duration FROM ' . $this->tables->services . ' WHERE id = :lesson_id');
    $stmtLesson->execute(['lesson_id' => $lessonId]);
    $lesson = $stmtLesson->fetch(PDO::FETCH_ASSOC);

    if (!$lesson) {
      throw new RuntimeException("Nie znaleziono lekcji o ID: {$lessonId}");
    }
    $durationMinutes = (int) $lesson['duration'];


    // 3. Pobranie wszystkich sal wymaganych do przeprowadzenia tej lekcji
    $stmtRooms = $this->connection->prepare('SELECT provider_id FROM ' . $this->tables->providers_services . ' WHERE service_id = :lesson_id');
    $stmtRooms->execute(['lesson_id' => $lessonId]);
    $requiredRoomIds = $stmtRooms->fetchAll(PDO::FETCH_COLUMN);

    if (empty($requiredRoomIds)) {
      // Jeśli lekcja nie ma przypisanych sal, nie może się odbyć (lub brak konfiguracji)
      return [];
    }


    // 4. Pobranie harmonogramu lekcji i pogrupowanie wg dnia tygodnia (0 = niedziela ... 6 = sobota)
    $stmtSchedule = $this->connection->prepare("
      SELECT day_of_week, DATE_FORMAT(start_time, '%H:%i') AS start_hour
      FROM " . $this->tables->service_schedule . "
      WHERE service_id = :lesson_id
      ORDER BY start_hour ASC
    ");
    $stmtSchedule->execute(['lesson_id' => $lessonId]);
    $schedulesRaw = $stmtSchedule->fetchAll(PDO::FETCH_ASSOC);

    $schedulesByDay = [];
    foreach ($schedulesRaw as $row) {
      $schedulesByDay[(int) $row['day_of_week']][] = $row['start_hour'];
    }


    // 5. Pobranie istniejących rezerwacji dla wymaganych sal w podanym przedziale
    $inPlaceholders = implode(',', array_fill(0, count($requiredRoomIds), '?'));
    $sqlAppointments = "
      SELECT provider_id, start_time, end_time
      FROM " . $this->tables->appointment_providers . "
      WHERE provider_id IN ({$inPlaceholders})
        AND end_time > ? 
        AND start_time < ?
    ";

    $stmtAppointments = $this->connection->prepare($sqlAppointments);
    $params = array_merge(
      $requiredRoomIds,
      [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]
    );
    $stmtAppointments->execute($params);
    $existingBookings = $stmtAppointments->fetchAll(PDO::FETCH_ASSOC);


    // 6. Iteracja dzień po dniu i wyznaczanie dostępnych godzin dla każdego dnia
    $result = [];
    $currentDay = $start->setTime(0, 0, 0);
    $lastDay = $end->setTime(0, 0, 0);

    while ($currentDay <= $lastDay) {
      $dateKey = $currentDay->format('Y-m-d');
      //$result[$dateKey] = []; // line moved down

      $dayOfWeek = (int) $currentDay->format('N'); // 'w' 0-sunday

      // Sprawdzamy harmonogram dla danego dnia tygodnia
      if (isset($schedulesByDay[$dayOfWeek])) {
        $result[$dateKey] = []; // moved here - dont show day without schedule

        foreach ($schedulesByDay[$dayOfWeek] as $timeStr) {
          [$hour, $minute] = explode(':', $timeStr);
          $slotStart = $currentDay->setTime((int) $hour, (int) $minute);
          $slotEnd = $slotStart->modify("+{$durationMinutes} minutes");

          // Slot musi w całości mieścić się w żądanym przedziale start/end
          if ($slotStart < $start || $slotEnd > $end) {
            continue;
          }

          $slotStartTs = $slotStart->getTimestamp();
          $slotEndTs   = $slotEnd->getTimestamp();

          $hasConflict = false;

          // Weryfikacja kolizji z zajętymi salami
          foreach ($existingBookings as $booking) {
            $bookingStartTs = strtotime($booking['start_time']);
            $bookingEndTs   = strtotime($booking['end_time']);

            // Kolizja występuje gdy przedziały nachodzą na siebie
            if ($slotStartTs < $bookingEndTs && $slotEndTs > $bookingStartTs) {
              $hasConflict = true;
              break;
            }
          }

          $result[$dateKey][$timeStr] = (!$hasConflict) ? 1 : 0;
          /*if (!$hasConflict) {
            $result[$dateKey][] = $timeStr;
          }*/
        }
      }

      $currentDay = $currentDay->modify('+1 day');
    }

    return $result;
  }

  /**
   * Spradza czy oprowadzanie jest dostępne o danej godzinie
   */
  public function getTripAvailability(string $appointmentDate, string $appointmentTime, $lessonId): bool
  {
    // 2. Pobranie czasu trwania lekcji
    $stmtLesson = $this->connection->prepare('SELECT duration FROM ' . $this->tables->services . ' WHERE id = :lesson_id');
    $stmtLesson->execute(['lesson_id' => $lessonId]);
    $lesson = $stmtLesson->fetch(PDO::FETCH_ASSOC);

    if (!$lesson) {
      throw new RuntimeException("Nie znaleziono lekcji o ID: {$lessonId}");
    }
    $durationMinutes = (int) $lesson['duration'];

    // 3. Pobranie wszystkich sal wymaganych do przeprowadzenia tej lekcji
    $stmtRooms = $this->connection->prepare('SELECT provider_id FROM ' . $this->tables->providers_services . ' WHERE service_id = :lesson_id');
    $stmtRooms->execute(['lesson_id' => $lessonId]);
    $requiredRoomIds = $stmtRooms->fetchAll(PDO::FETCH_COLUMN);

    if (empty($requiredRoomIds)) {
      // Jeśli lekcja nie ma przypisanych sal, nie może się odbyć (lub brak konfiguracji)
      return [];
    }

    // 4. Pobranie godzin rozpoczęcia z harmonogramu dla tego dnia tygodnia
    // start_time w bazie to DATETIME, więc pobieramy tylko godzinę i minutę
    // godzina 
    $potentialSlots = [$appointmentTime];

    // 5. Pobranie istniejących rezerwacji dla wymaganych sal w tym dniu
    // Sprawdzamy rezerwacje, które mogą nachodzić na ten dzień
    $dayStart = $appointmentDate . ' 00:00:00';
    $dayEnd   = $appointmentDate . ' 23:59:59';

    $inPlaceholders = implode(',', array_fill(0, count($requiredRoomIds), '?'));
    $sqlAppointments = "
        SELECT service_id, start_time, end_time
        FROM " . $this->tables->appointment_providers . "
        WHERE provider_id IN ({$inPlaceholders})
          AND end_time > ? 
          AND start_time <= DATE_ADD(?, INTERVAL 1 DAY)
    ";

    $stmtAppointments = $this->connection->prepare($sqlAppointments);
    $params = array_merge($requiredRoomIds, [$dayStart, $dayEnd]);
    $stmtAppointments->execute($params);
    $existingBookings = $stmtAppointments->fetchAll(PDO::FETCH_ASSOC);

    // 6. Weryfikacja dostępności każdego ze slotów
    $availableSlots = [];

    foreach ($potentialSlots as $timeStr) {
      $slotStart = \DateTimeImmutable::createFromFormat('Y-m-d H:i', "{$appointmentDate} {$timeStr}");
      if (!$slotStart) {
          continue;
      }
      $slotEnd = $slotStart->modify("+{$durationMinutes} minutes");

      $slotStartTs = $slotStart->getTimestamp();
      $slotEndTs   = $slotEnd->getTimestamp();

      $hasConflict = false;

      // Sprawdzamy, czy którakolwiek z wymaganych sal ma kolizję
      foreach ($existingBookings as $booking) {
        $bookingStartTs = strtotime($booking['start_time']);
        $bookingEndTs   = strtotime($booking['end_time']);

        // Kolizja zachodzi, gdy: (slotStart < bookingEnd) AND (slotEnd > bookingStart)
        if ($slotStartTs < $bookingEndTs && $slotEndTs > $bookingStartTs) {
            $hasConflict = true;
            break; // Znaleziono zajętą salę – ten slot odpada
        }
      }

      if (!$hasConflict) {
        $availableSlots[] = $timeStr;
      }
    }
    return false;
    return count($availableSlots) > 0;
  }


  /**
   * Zwraca listę dostępnych godzin rozpoczęcia lekcji dla danej daty.
   *
   * @param string $appointmentDate Data w formacie 'YYYY-MM-DD'.
   * @param int    $lessonId        ID lekcji.
   * @return array<string>         Tablica dostępnych godzin w formacie 'HH:MM'.
   * @throws InvalidArgumentException|RuntimeException
   */
  /*function getAvailableLessonSlots(string $appointmentDate, int $lessonId): array
  {
    // 1. Walidacja daty i wyznaczenie dnia tygodnia (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    $dateObj = \DateTimeImmutable::createFromFormat('Y-m-d', $appointmentDate);
    if (!$dateObj || $dateObj->format('Y-m-d') !== $appointmentDate) {
        throw new InvalidArgumentException("Niepoprawny format daty. Oczekiwano 'YYYY-MM-DD'.");
    }
    $dayOfWeek = (int) $dateObj->format('N'); // w 0-sunday

    
    // 2. Pobranie czasu trwania lekcji
    $stmtLesson = $this->connection->prepare('SELECT duration FROM ' . $this->tables->services . ' WHERE id = :lesson_id');
    $stmtLesson->execute(['lesson_id' => $lessonId]);
    $lesson = $stmtLesson->fetch(PDO::FETCH_ASSOC);

    if (!$lesson) {
      throw new RuntimeException("Nie znaleziono lekcji o ID: {$lessonId}");
    }
    $durationMinutes = (int) $lesson['duration'];


    // 3. Pobranie wszystkich sal wymaganych do przeprowadzenia tej lekcji
    $stmtRooms = $this->connection->prepare('SELECT provider_id FROM ' . $this->tables->providers_services . ' WHERE service_id = :lesson_id');
    $stmtRooms->execute(['lesson_id' => $lessonId]);
    $requiredRoomIds = $stmtRooms->fetchAll(PDO::FETCH_COLUMN);

    if (empty($requiredRoomIds)) {
      // Jeśli lekcja nie ma przypisanych sal, nie może się odbyć (lub brak konfiguracji)
      return [];
    }


    // 4. Pobranie godzin rozpoczęcia z harmonogramu dla tego dnia tygodnia
    // start_time w bazie to DATETIME, więc pobieramy tylko godzinę i minutę
    $stmtSchedule = $this->connection->prepare("
        SELECT DISTINCT DATE_FORMAT(start_time, '%H:%i') AS start_hour
        FROM " . $this->tables->service_schedule . "
        WHERE service_id = :lesson_id 
          AND day_of_week = :day_of_week
        ORDER BY start_hour ASC
    ");
    $stmtSchedule->execute([
        'lesson_id'   => $lessonId,
        'day_of_week' => $dayOfWeek,
    ]);
    $potentialSlots = $stmtSchedule->fetchAll(PDO::FETCH_COLUMN);

    if (empty($potentialSlots)) {
        return []; // Brak zaplanowanych lekcji w tym dniu tygodnia
    }


    // 5. Pobranie istniejących rezerwacji dla wymaganych sal w tym dniu
    // Sprawdzamy rezerwacje, które mogą nachodzić na ten dzień
    $dayStart = $appointmentDate . ' 00:00:00';
    $dayEnd   = $appointmentDate . ' 23:59:59';

    $inPlaceholders = implode(',', array_fill(0, count($requiredRoomIds), '?'));
    $sqlAppointments = "
        SELECT service_id, start_time, end_time
        FROM " . $this->tables->appointment_providers . "
        WHERE provider_id IN ({$inPlaceholders})
          AND end_time > ? 
          AND start_time <= DATE_ADD(?, INTERVAL 1 DAY)
    ";

    $stmtAppointments = $this->connection->prepare($sqlAppointments);
    $params = array_merge($requiredRoomIds, [$dayStart, $dayEnd]);
    $stmtAppointments->execute($params);
    $existingBookings = $stmtAppointments->fetchAll(PDO::FETCH_ASSOC);


    // 6. Weryfikacja dostępności każdego ze slotów
    $availableSlots = [];

    foreach ($potentialSlots as $timeStr) {
      $slotStart = \DateTimeImmutable::createFromFormat('Y-m-d H:i', "{$appointmentDate} {$timeStr}");
      if (!$slotStart) {
          continue;
      }
      $slotEnd = $slotStart->modify("+{$durationMinutes} minutes");

      $slotStartTs = $slotStart->getTimestamp();
      $slotEndTs   = $slotEnd->getTimestamp();

      $hasConflict = false;

      // Sprawdzamy, czy którakolwiek z wymaganych sal ma kolizję
      foreach ($existingBookings as $booking) {
        $bookingStartTs = strtotime($booking['start_time']);
        $bookingEndTs   = strtotime($booking['end_time']);

        // Kolizja zachodzi, gdy: (slotStart < bookingEnd) AND (slotEnd > bookingStart)
        if ($slotStartTs < $bookingEndTs && $slotEndTs > $bookingStartTs) {
            $hasConflict = true;
            break; // Znaleziono zajętą salę – ten slot odpada
        }
      }

      if (!$hasConflict) {
        $availableSlots[] = $timeStr;
      }
    }

    return $availableSlots;
  }*/


  /**
   * Get description for wniosek kultura_za_zl
   */
  public function getServicesWniosek($appointment_id)
  {
    $query = "select se.service_type, se.name 
    from {$this->model} ap left join {$this->tables->services} se on ap.service_id = se.id 
    where ap.appointment_id='" . $appointment_id . "'
    group by se.service_type, se.name";
    
    $st = $this->connection->prepare($query);
    $st->execute();
    return $st->fetchAll();
  }
}