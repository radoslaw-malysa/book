## db
Propose a database structure (MySQL) for an appointment booking system for a service salon: hairdressing, beauty salon, etc. The salon employs several employees, and each employee can perform different services. I'd like the system to be relatively universal and usable across multiple industries.

## app structure
You are a professional React / Typescript developer.
You are building Administrator Dashboard for this Appointment booking system. 
Give me structure and key building blocks for frontend React + React Router Application that working with external php rest API and offers the following features:
- User authentication
- Authenticated user can see list of appointments
- Authenticated user can edit appointments
- Authenticated user can add appointment
- Authenticated user can add Services
- Authenticated user can add Employees

Dont generate any code, just givem e the key building block and structure.

https://www.youtube.com/watch?v=ZxGEJMSrmdE

https://www.shadcn.io/blocks/calendar-weekly-planner


public function get_table_custom(Request $request, Response $response, $args)
        {
            if (!$_SESSION['cms_user']) {
                return $response->withStatus(301)->withHeader('Location', '/adm'); //wywal jesli nie zalogowany - da sie w konstruktorze?
                die;
            }
            
            //$table = $args['table'];
            $table = 'reservations';
            $object_name = "\Model\\".ucfirst($table);
            
            $query_params = $request->getQueryParams();
            
            //  || !$query_params['id_division']
            if (!isset($query_params['id_division'])) {
                $query_params['id_division'] = $_SESSION['id_division'] ?? null;
            }

            if (!isset($query_params['visit_date']) || !$query_params['visit_date']) {
                $query_params['visit_date'] = date("Y-m-d");
            }
            
            if (isset($query_params['view_scope']) && $query_params['view_scope'] == 'day') {
                $template = '_cms/table_reservations_day.phtml';
                
                $datetime_day = \DateTime::createFromFormat('Y-m-d', $query_params['visit_date']);
                $datetime_date_od = clone $datetime_day;
                $datetime_date_do = clone $datetime_day;
                $datetime_date_do->modify('+1 day');
                
            } else {
                $query_params['view_scope'] = 'week';
                $template = '_cms/table_reservations_week.phtml';
                
                $datetime_day = \DateTime::createFromFormat('Y-m-d', $query_params['visit_date']);
                $datetime_date_od = clone $datetime_day;
                $datetime_date_od->modify('Monday this week'); //modify(('Sunday' == $datetime_day->format('l')) ? 'Monday last week' : 'Monday this week');
                $datetime_date_do = clone $datetime_day;
                $datetime_date_do->modify('Sunday this week')->modify('+1 day');
            }
            
            if (isset($query_params['mode']) && $query_params['mode'] == 'new') {
                $template = '_cms/table_reservations_week_new.phtml';
            }
            
            $day_period = new \DatePeriod(
                $datetime_date_od,
                new \DateInterval('P1D'),
                $datetime_date_do
            );
            
            $hour_open = \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_START);
            $hour_period = new \DatePeriod(
                $hour_open,
                new \DateInterval('PT1H'),
                \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_END) 
            );
            
            // wrong reservtions
            $wrong_reservations = [];
            $wrong = $object_name::getWrongReservations([
              'visit_date_start' => $datetime_date_od->format('Y-m-d'),
              'visit_date_stop' => $datetime_date_do->format('Y-m-d')
            ]);
            
            if (is_array($wrong) && $wrong) {
              foreach ($wrong as $res) {
                $wrong_reservations[$res['visit_date']][] = $res;
              }
            }
            
            //wersja wielodniowa
            $query_params['visit_date'] = null;
            $query_params['limit'] = 999;
            $i = 0;
            
            foreach ($day_period as $day) {
                $day_index = $day->format('Y-m-d');
                $query_params['visit_date_od'] = $day_index;
                $query_params['visit_date_do'] = $day_index;
                
                $data = $object_name::getSelected(array_merge($query_params, ['select_mode' => 'full']));
                $data_only_quide[$day->format('Y-m-d')] = $object_name::getGuideReservations($query_params);
                
                foreach($data as $row) {
                    //odleglosc od godziny otwarcia w minutach
                    if ($day_index == $row->visit_date) {
                        $offset = \DateTime::createFromFormat('H:i:s', $row->visit_time)->diff($hour_open);
                        $row->offset = ($offset->h * 60) + $offset->i;
                    } else {
                        $row->offset = (int)0;
                        $row->cut_start = 1;
                    }
                    
                    //dlugosc w minutach
                    if ($day_index == $row->visit_date && $day_index == $row->departure_date) {
                        $duration = \DateTime::createFromFormat('H:i:s', $row->departure_time)->diff(\DateTime::createFromFormat('H:i:s', $row->visit_time));
                        $row->duration = ($duration->h * 60) + $duration->i;
                    } else if ($day_index == $row->departure_date) {
                        $duration = \DateTime::createFromFormat('H:i:s', $row->departure_time)->diff(\DateTime::createFromFormat('H:i:s', RESERVATION_TIME_START));
                        $row->duration = ($duration->h * 60) + $duration->i;
                    } else if ($day_index == $row->visit_date) {
                        $duration = \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_END)->diff(\DateTime::createFromFormat('H:i:s', $row->visit_time));
                        $row->duration = ($duration->h * 60) + $duration->i;
                        $row->cut_end = 1;
                    } else {
                        $duration = \DateTime::createFromFormat('H:i:s', RESERVATION_TIME_END)->diff(\DateTime::createFromFormat('H:i:s', RESERVATION_TIME_START));
                        $row->duration = ($duration->h * 60) + $duration->i;
                        $row->cut_end = 1;
                    }
                    
                    // nakladanie sie kafelkow
                    if (!isset($minutes_occupancy[$day_index][$row->id_room])) {
                      $minutes_occupancy[$day_index][$row->id_room] = array_fill(0, 420, 0);
                    }
                    
                    $fill_start = $row->offset;
                    $fill_stop = $row->offset + $row->duration;
                    $layer = 0;
                    for ($j = $fill_start; $j < $fill_stop; $j++) {
                      $minutes_occupancy[$day_index][$row->id_room][$j] += 1;
                      $layer = max($layer, $minutes_occupancy[$day_index][$row->id_room][$j]);
                    }
                    $row->layer = $layer;
                    
                    
                    $data_mod[$day_index][$i] = $row;
                    $i++;
                }
                
            }
            $data = $data_mod ?? [];
            //koniec wersja wielodniowa
            
            
            /*
            //wersja jednodniowa
            //DANE
            $query_params['visit_date_od'] = $datetime_date_od->format('Y-m-d');
            $query_params['visit_date_do'] = $datetime_date_do->format('Y-m-d');
            $query_params['visit_date'] = null;
            $query_params['limit'] = 999;
            
            $data = $object_name::getSelected(array_merge($query_params, ['select_mode' => 'full']));
            $data_mod = [];
            $i = 0;
            
            foreach($data as $row) {
                
                //odleglosc od godziny otwarcia w minutach
                $offset = \DateTime::createFromFormat('H:i:s', $row->visit_time)->diff($hour_open);
                $row->offset = ($offset->h * 60) + $offset->i;
                
                //dlugosc w minutach
                $duration = \DateTime::createFromFormat('H:i:s', $row->departure_time)->diff(\DateTime::createFromFormat('H:i:s', $row->visit_time));
                $row->duration = ($duration->h * 60) + $duration->i;
                
                $data_mod[$row->visit_date][$i] = $row;
                $i++;
            }
            $data = $data_mod;
            //koniec wersja jednodniowa
            */
            
            if ($request->isXhr()) {
                return $this->view->render($response, $template, [
                    'data' => $data,
                    'data_only_quide' => $data_only_quide ?? [],
                    'paginator' => '',
                    'query_params' => $query_params,
                    'day_period' => $day_period,
                    'hour_period' => $hour_period,
                    'rooms' => \Model\Reservations::get_rooms($query_params['id_division']),
                    'day' => $datetime_day,
                    'wrong_reservations' => $wrong_reservations ?? []
                ]);
            } else {
                return $this->view->render($response, '_cms/cms_layout_spartan.phtml', [
                    'content' => $this->view->fetch($template,[
                        'data' => $data,
                        'data_only_quide' => $data_only_quide ?? [],
                        'paginator' => '',
                        'query_params' => $query_params,
                        'day_period' => $day_period,
                        'hour_period' => $hour_period,
                        'rooms' => \Model\Reservations::get_rooms($query_params['id_division']),
                        'day' => $datetime_day,
                        'wrong_reservations' => $wrong_reservations ?? []
                    ]),
                    'args' => $args
                ]);
            }
        }