export function buffer_to_array(dtype:String, buffer: any) {
    switch (dtype) {
      case 'int8':
        return new Int8Array(buffer);
        break;
      case 'uint8':
        return new Uint8Array(buffer);
        break;
      case 'int16':
        return new Int16Array(buffer);
        break;
      case 'uint16':
        return new Uint16Array(buffer);
        break;
      case 'int32':
        return new Int32Array(buffer);
        break;
      case 'uint32':
        return new Uint32Array(buffer);
        break;
      case 'float32':
        return new Float32Array(buffer);
        break;
      case 'float64':
        return new Float64Array(buffer);
        break;
      default:
        throw 'Unknown dtype ' + dtype;
        break;
    }
  }