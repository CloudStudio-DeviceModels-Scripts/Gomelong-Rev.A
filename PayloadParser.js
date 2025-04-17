function parseUplink(device, payload) {
    var data = payload.asBytes();
    env.log('Data cruda en bytes: ', data);
    var decoded = milesight(data);
    env.log('Data Decodificada: ', decoded);
    
    //Corriente A
    var e = device.endpoints.byAddress("1");
    if (e != null) {
      e.updateCurrentSensorStatus(decoded.modbus_chn_1);
    }
    //Corriente B
    var e = device.endpoints.byAddress("2");
    if (e != null) {
      e.updateCurrentSensorStatus(decoded.modbus_chn_2);
    }
    //Corriente C
    var e = device.endpoints.byAddress("3");
    if (e != null) {
      e.updateCurrentSensorStatus(decoded.modbus_chn_3);
    }
    //Voltaje A
    var e = device.endpoints.byAddress("4");
    if (e != null) {
      e.updateVoltageSensorStatus(decoded.modbus_chn_4);
    }
    //Voltaje B
    var e = device.endpoints.byAddress("5");
    if (e != null) {
      e.updateVoltageSensorStatus(decoded.modbus_chn_5);
    }
    //Voltaje C
    var e = device.endpoints.byAddress("6");
    if (e != null) {
      e.updateVoltageSensorStatus(decoded.modbus_chn_6);
    }
    //PF A
    var e = device.endpoints.byAddress("7");
    if (e != null) {
      e.updateCosPhiSensorStatus(decoded.modbus_chn_7);
    }
    //PF B
    var e = device.endpoints.byAddress("8");
    if (e != null) {
      e.updateCosPhiSensorStatus(decoded.modbus_chn_8);
    }
    //PF C
     var e = device.endpoints.byAddress("9");
    if (e != null) {
      e.updateCosPhiSensorStatus(decoded.modbus_chn_9);
    }
    //Potencia Activa Total
    var e = device.endpoints.byAddress("10");
    if (e != null) {
      e.updateActivePowerSensorStatus(decoded.modbus_chn_10);
    }
    //Potencia Reactiva Total
    var e = device.endpoints.byAddress("11");
    if (e != null) {
      e.updateReactivePowerSensorStatus(decoded.modbus_chn_11);
    }
    //Potencia Aparente Total
      var e = device.endpoints.byAddress("12");
    if (e != null) {
      e.updateApparentPowerSensorStatus(decoded.modbus_chn_12);
    }
    //Frecuencia A
    var e = device.endpoints.byAddress("13");
    if (e != null) {
      e.updateFrequencySensorStatus(decoded.modbus_chn_13);
    }
    //Frecuencia B
    var e = device.endpoints.byAddress("14");
    if (e != null) {
      e.updateFrequencySensorStatus(decoded.modbus_chn_14);
    }
    //Frecuencia C    
    var e = device.endpoints.byAddress("15");
    if (e != null) {
      e.updateFrequencySensorStatus(decoded.modbus_chn_15);
    }
    //Energia Activa Total
    var e = device.endpoints.byAddress("16");
    if (e != null) {
      e.updateGenericSensorStatus(decoded.modbus_chn_16);
    }
    //Energia Total
    var e = device.endpoints.byAddress("17");
    if (e != null) {
      e.updateEnergySensorValueSummation(decoded.modbus_chn_16,0);
    }

}

function milesight(bytes) {
    var decoded = {};
    for (i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // POWER
        if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.power = "on";
            i += 1;
        }
        // IPSO VERSION
        else if (channel_id === 0xff && channel_type === 0x01) {
            decoded.protocol_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // MODBUS
        else if (channel_id === 0xff && channel_type === 0x19) {
            var modbus_chn_id = bytes[i++] + 1;
            var data_length = bytes[i++];
            var data_type = bytes[i++];
            var sign = (data_type >>> 7) & 0x01;
            var type = data_type & 0x7f; // 0b01111111
            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;
            switch (type) {
                case 0:
                    decoded[chn] = bytes[i] ? "on" : "off";
                    i += 1;
                    break;
                case 1:
                    decoded[chn] = bytes[i];
                    i += 1;
                    break;
                case 2:
                case 3:
                    decoded[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 2;
                    break;
                case 4:
                case 6:
                case 8:
                case 9:
                case 10:
                case 11:
                    decoded[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
                case 5:
                case 7:
                    decoded[modbus_chn_name] = readFloatLE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
            }
        }
        // MODBUS READ ERROR
        else if (channel_id === 0xff && channel_type === 0x15) {
            var modbus_chn_id = bytes[i] + 1;
            var channel_name = "modbus_chn_" + modbus_chn_id + "_alarm";
            decoded[channel_name] = "read error";
            i += 1;
        } else {
            break;
        }
    }
    return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readFloatLE(bytes) {
    // JavaScript bitwise operators yield a 32 bits integer, not a float.
    // Assume LSB (least significant byte first).
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}