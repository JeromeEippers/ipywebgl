export function buffer_to_array(buffer: any) {
    switch (buffer.dtype) {
      case 'int8':
        return new Int8Array(buffer.buffer);
        break;
      case 'uint8':
        return new Uint8Array(buffer.buffer);
        break;
      case 'int16':
        return new Int16Array(buffer.buffer);
        break;
      case 'uint16':
        return new Uint16Array(buffer.buffer);
        break;
      case 'int32':
        return new Int32Array(buffer.buffer);
        break;
      case 'uint32':
        return new Uint32Array(buffer.buffer);
        break;
      case 'float32':
        return new Float32Array(buffer.buffer);
        break;
      case 'float64':
        return new Float64Array(buffer.buffer);
        break;
      default:
        throw 'Unknown dtype ' + buffer.dtype;
        break;
    }
  }