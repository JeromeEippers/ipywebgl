export function convert_buffer_target(gl:WebGL2RenderingContext, target:string){
    let result = gl.ARRAY_BUFFER;
    switch(target){
      case "array_buffer": result=gl.ARRAY_BUFFER; break;
      case "element_array_buffer": result=gl.ELEMENT_ARRAY_BUFFER; break;
      case "copy_read_buffer": result=gl.COPY_READ_BUFFER; break;
      case "copy_write_buffer": result=gl.COPY_WRITE_BUFFER; break;
      case "transform_feedback_buffer": result=gl.TRANSFORM_FEEDBACK_BUFFER; break;
      case "uniform_buffer": result=gl.UNIFORM_BUFFER; break;
      case "pixel_pack_buffer": result=gl.PIXEL_PACK_BUFFER; break;
      case "pixel_unpack_buffer": result=gl.PIXEL_UNPACK_BUFFER; break;
      default: console.error("unknown buffer target " + target);
    }
    return result;
  };
  
  export function convert_usage(gl:WebGL2RenderingContext, usage:string){
    let result = gl.STATIC_DRAW;
    switch(usage){
      case "static_draw": result=gl.STATIC_DRAW; break;
      case "dynamic_draw": result=gl.DYNAMIC_DRAW; break;
      case "stream_draw": result=gl.STREAM_DRAW; break;
      case "static_read": result=gl.STATIC_READ; break;
      case "dynamic_read": result=gl.DYNAMIC_READ; break;
      case "stream_read": result=gl.STREAM_READ; break;
      case "static_copy": result=gl.STATIC_COPY; break;
      case "dynamic_copy": result=gl.DYNAMIC_COPY; break;
      case "stream_copy": result=gl.STREAM_COPY; break;
      default: console.error("unknown buffer usage " + usage);
    }
    return result;
  };