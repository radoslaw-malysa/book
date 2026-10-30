function addMinutesToDateTime(dateStr, minutesToAdd) {
  // 1. Convert "Y-m-d H:i:s" to ISO 8601 UTC ("Y-m-dTH:i:sZ")
  const date = new Date(dateStr.replace(' ', 'T') + 'Z');

  // 2. Add the minutes (JavaScript automatically handles hour/day/month rollovers)
  date.setUTCMinutes(date.getUTCMinutes() + minutesToAdd);

  // 3. Convert back: "YYYY-MM-DDTHH:mm:ss.sssZ" -> "YYYY-MM-DD HH:mm:ss"
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

const applyCalculation = (state, updatePrices = false) => {
  const newCalculation = {lesson: null, tour: null, total_price: 0, sell_price: 0};

  if (state.lesson == 1 && state.appointment_providers.lesson[0].service_id) {
    const selectedLesson = state.services.lesson.find((el) => el.id === parseInt(state.appointment_providers.lesson[0].service_id));
    if (selectedLesson) {
      newCalculation.lesson = {
        name: selectedLesson.name,
        price: selectedLesson.price,
        qty: state.pax
      }
      newCalculation.total_price = selectedLesson.price * state.pax;
    }
  }

  if (state.tour == 1 && state.appointment_providers.tour[0].service_id) {
    const selectedTour = state.services.tour.find((el) => el.id === parseInt(state.appointment_providers.tour[0].service_id));
    if (selectedTour) {
      newCalculation.tour = {
        name: selectedTour.name,
        price: selectedTour.price,
        qty: state.pax
      }
      newCalculation.total_price += selectedTour.price * state.pax;
    }
  }

  newCalculation.sell_price = (state.kulturalna_szkola == 1 && newCalculation.total_price > 0) ? (state.pax * 1) : newCalculation.total_price;

  if (updatePrices) {
    return {
      ...state,
      calculation: newCalculation,
      total_price: newCalculation.total_price,
      sell_price: newCalculation.sell_price
    }
  }

  return {
    ...state,
    calculation: newCalculation
  }
}

const appointmentReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_DATA': {
      return applyCalculation(action.data, false)
    }
    
    case 'UPDATE_FIELD': {
      const newValue = (typeof action.value === 'boolean') ? (action.value ? 1 : 0 ) : action.value;

      if (action.field == 'pax' || action.field == 'lesson' || action.field == 'tour') {
        return applyCalculation({
          ...state,
          [action.field]: newValue
        }, true);
      }

      return {
        ...state,
        [action.field]: newValue
      }
    }

    case 'UPDATE_CUSTOMER': {
      if (state.customer) {
        const newState = state.customer;
        newState[action.key] = action.value;
        return {
          ...state,
          customer: newState
        }
      }
      return state
    }

    case 'UPDATE_APP_PROVIDER': {
      if (state.appointment_providers) {
        const newState = state.appointment_providers;

        if (action.key === 'start_time_h') {
          const dateStart = newState[action.serviceType][0].start_time.split(' ');
          newState[action.serviceType][0].start_time = `${dateStart[0]} ${action.value}`;
          //newState[action.serviceType][1].start_time = `${dateStart[0]} ${value}`;
        } else if (action.key === 'end_time_h') {
          const dateStart = newState[action.serviceType][0].start_time.split(' ');
          newState[action.serviceType][0].end_time = `${dateStart[0]} ${action.value}`;
          //newState[action.serviceType][1].end_time = `${dateStart[0]} ${action.value}`;
        } else if (action.key === 'start_time_y') {
          const timeStart = newState[action.serviceType][0].start_time.split(' ');
          const timeEnd = newState[action.serviceType][0].end_time.split(' ');
          newState[action.serviceType][0].start_time = `${action.value} ${timeStart[1]}`;
          newState[action.serviceType][0].end_time = `${action.value} ${timeEnd[1]}`;
        } else if (action.key === 'provider_id') {
          newState[action.serviceType][action.index][action.key] = action.value
        } else {
          newState[action.serviceType][0][action.key] = action.value;
          //newState[action.serviceType][1][action.field] = action.value;
        }

        return {
          ...state,
          appointment_providers: newState
        }
      }
      return state
    }

    case 'CHANGE_SERVICE': {
      const newState = state.appointment_providers[action.serviceType];
      newState[0].service_id = action.serviceId;

      // first provider
      if (action.providers[0] !== undefined && action.providers[0].provider_id) {
        newState[0].provider_id = action.providers[0].provider_id;
        const serviceIdInt = parseInt(action.serviceId);
        const selectedService = state.services[action.serviceType].find((el) => el.id === serviceIdInt);
        
        if (newState[0].start_time) {
          const end = addMinutesToDateTime(newState[0].start_time, selectedService.duration);
          if (end) {
            newState[0].end_time = end;
          }
        }
      } else {
        newState[0].provider_id = '';
      }

      // second provider
      if (action.providers[1] !== undefined && action.providers[1].provider_id) {
        newState[1].provider_id = action.providers[1].provider_id;
      } else {
        newState[1].provider_id = '';
      }

      const newAppointmentProviders = {
        ...state.appointment_providers,
        [action.serviceType]: newState
      }

      return applyCalculation({
        ...state,
        appointment_providers: newAppointmentProviders
      }, true);
    }

    default:
      return state;
  }
}

export default appointmentReducer;