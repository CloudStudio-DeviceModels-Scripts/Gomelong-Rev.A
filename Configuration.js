function getConfiguration(config) {
  config.addressLabel = { en: "DevEUI", es: "DevEUI" };
}

function getEndpoints(deviceAddress, endpoints) {
  
 endpoints.addEndpoint("1", "Corriente A", endpointType.currentSensor);

  endpoints.addEndpoint("2", "Corriente B", endpointType.currentSensor );

  endpoints.addEndpoint("3", "Corriente C", endpointType.currentSensor );
  
  endpoints.addEndpoint("4", "Voltaje A", endpointType.voltageSensor);

  endpoints.addEndpoint("5", "Voltaje B", endpointType.voltageSensor);
  
  endpoints.addEndpoint("6", "Voltaje C", endpointType.voltageSensor);

  endpoints.addEndpoint("7", "PF A", endpointType.cosPhiSensor);
  
  endpoints.addEndpoint("8", "PF B", endpointType.cosPhiSensor);

  endpoints.addEndpoint("9", "PF C", endpointType.cosPhiSensor);
  
  endpoints.addEndpoint("10", "Potencia Activa Tot", endpointType.activePowerSensor );

  endpoints.addEndpoint("11", "Potencia Reactiva Tot", endpointType.reactivePowerSensor );

  endpoints.addEndpoint("12", "Potencia Aparente Tot", endpointType.apparentPowerSensor  );

  endpoints.addEndpoint("13", "Frecuencia A", endpointType.frequencyMeter  );

  endpoints.addEndpoint("14", "Frecuencia B", endpointType.frequencyMeter  );

  endpoints.addEndpoint("15", "Frecuencia C", endpointType.frequencyMeter  );

  var e = endpoints.addEndpoint("16", "Energia Activa Tot", endpointType.genericSensor );
  e.variableTypeId = 1031;

  endpoints.addEndpoint("17", "Energia Total", endpointType.energyMeter);

  var e = endpoints.addEndpoint("daily_energy", "Energia Diaria", endpointType.genericSensor);
  e.variableTypeId = 1031;

}

function validateDeviceAddress(address, result) {
  address = address.toLowerCase();
  result.ok = true;
  var validchars = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];
  for (var i = 0; i < address.length; i++) {
    if (!validchars.includes(address.charAt(i))) {
      result.ok = false;
      break;
    }
  }
  if (!result.ok)
    result.errorMessage = {
      en: "The address must only have hexadecimal characters",
      es: "La dirección debe tener sólo caracteres hexadecimales",
    };
}

function updateDeviceUIRules(device, rules) {
  rules.canCreateEndpoints = true;
  //No fueron especificadas reglas para los dispositivos
}

function updateEndpointUIRules(endpoint, rules) {
  rules.canDelete = true;
  //No fueron especificadas reglas para los endpoints
}
