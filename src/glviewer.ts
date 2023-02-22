import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

import { m4dot, m4getColumnI, m4getColumnK, m4inverse, m4ProjectionMatrix, m4Translation, m4Transpose, m4Xrotation, m4Yrotation, vec3Add, vec3Scale } from './matrix';
import { GLResource } from './glresource';
import { buffer_to_array } from './arraybuffer';


export class GLModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: 'GLModel',
      _model_module: MODULE_NAME,
      _model_module_version: MODULE_VERSION,
      _view_name: 'GLViewer',
      _view_module: MODULE_NAME,
      _view_module_version: MODULE_VERSION,
      shader_matrix_major:'row_major',
      width:700,
      height:500,
      camera_pos:[0,50,200],
      camera_yaw:0,
      camera_pitch:0,
      mouse_speed:1,
      move_speed:1,
      move_keys:'wasd',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
  };

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext("webgl2", {preserveDrawingBuffer: true});
    if (this.ctx == null){
      console.error('could not create a webgl2 context, this is not supported in your browser');
    }
    else{
      const gl:WebGL2RenderingContext = this.ctx;
      this.view_block = gl.createBuffer();
      gl.bindBuffer(gl.UNIFORM_BUFFER, this.view_block);
      gl.bufferData(gl.UNIFORM_BUFFER, 256, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
      gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.view_block);
    }

    this.resizeCanvas();
    this.on_some_change(['width', 'height'], this.resizeCanvas, this);
    this.on_some_change(['camera_pos', 'camera_yaw', 'camera_pitch'], this.run_commands, this);

    this.on('msg:custom', this.handle_custom_messages, this);

    this.camera_matrix = m4Translation(0,50,200);
    this.view_matrix = m4inverse(this.camera_matrix);
  }

  resizeCanvas() {
    this.canvas.setAttribute('width', this.get('width'));
    this.canvas.setAttribute('height', this.get('height'));
    if (this.ctx != null){
      this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    this.projection_matrix = m4ProjectionMatrix(50.0, this.get('width')/this.get('height'), 1.0, 5000.0);
  }

  handle_custom_messages(command: any, buffers:any) {
    if(command.clear == true){
      this.commands = [];
      this.buffers = [];
    }
    let commands = command.commands;
    let converted_buffers:any[] = [];
    commands.forEach((element:any)=>{
      if (element.hasOwnProperty('buffer_metadata')) {
        const converted = buffer_to_array(element.buffer_metadata.dtype, buffers[element.buffer_metadata.index].buffer);
        converted_buffers.push(converted);
      }
    });

    if(command.only_once == true){
      this.execute_commands(commands, converted_buffers);
    }
    else{
      let buffer_id_offset = this.buffers.length;
      this.buffers = this.buffers.concat(converted_buffers);
      commands.forEach((element:any)=>{
        if (element.hasOwnProperty('buffer_metadata')) {
          element.buffer_metadata.index += buffer_id_offset;
        }
      });
      this.commands = this.commands.concat(commands);
    }

    this.run_commands();
  }

  private update_camera(){
    let pos = this.get('camera_pos');
    let yaw = this.get('camera_yaw') * Math.PI / 180.0;
    let pitch = this.get('camera_pitch') * Math.PI / 180.0;
    this.camera_matrix = m4Translation(pos[0], pos[1], pos[2]);
    this.camera_matrix = m4dot(this.camera_matrix, m4Yrotation(yaw));
    this.camera_matrix = m4dot(this.camera_matrix, m4Xrotation(pitch));
    this.view_matrix = m4inverse(this.camera_matrix);
    this.view_proj_matrix = m4dot(this.projection_matrix, this.view_matrix);
  }

  run_commands(){
    this.execute_commands(this.commands, this.buffers);
  }

  execute_commands(commands:any[], converted_buffers:any[]){
    if (this.ctx == null) return;
    const gl:WebGL2RenderingContext = this.ctx;

    this.update_camera();

    // update the uniform Block
    let cm = (this.get('shader_matrix_major')=='row_major')? m4Transpose(this.camera_matrix): this.camera_matrix;
    const cm_f32 = new Float32Array(cm);
    let vm = (this.get('shader_matrix_major')=='row_major')? m4Transpose(this.view_matrix): this.view_matrix;
    const vm_f32 = new Float32Array(vm);
    let pm = (this.get('shader_matrix_major')=='row_major')? m4Transpose(this.projection_matrix): this.projection_matrix;
    const pm_f32 = new Float32Array(pm);
    let vpm = (this.get('shader_matrix_major')=='row_major')? m4Transpose(this.view_proj_matrix): this.view_proj_matrix;
    const vpm_f32 = new Float32Array(vpm);

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.view_block);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, cm_f32, 0);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 64, vm_f32, 0);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 128, pm_f32, 0);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 192, vpm_f32, 0);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    commands.forEach((command:any)=>{
      this.execute_command(gl, command, converted_buffers);
    });
  }

  glEnumToString(gl:WebGL2RenderingContext, value:any) {
    const keys = [];
    for (const key in gl) {
      if ((gl as any)[key] === value) {
        keys.push(key);
      }
    }
    return keys.length ? keys.join(' | ') : `0x${value.toString(16)}`;
  }

  execute_command(gl:WebGL2RenderingContext, command:any, converted_buffers:any[]){
    //console.log(command);
    //console.log(this.bound_buffers);
    switch(command.cmd){
      case 'viewport':
          gl.viewport(command.x, command.y, command.width, command.height);
        break;
      case 'enable':
      case 'disable':
        {
          let cap = 0;
          if (command.blend) cap |= gl.BLEND;
          if (command.depth_test) cap |= gl.DEPTH_TEST;
          if (command.dither) cap |= gl.DITHER;
          if (command.polygon_offset_fill) cap |= gl.POLYGON_OFFSET_FILL;
          if (command.sample_alpha_to_coverage) cap |= gl.SAMPLE_ALPHA_TO_COVERAGE;
          if (command.sample_coverage) cap |= gl.SAMPLE_COVERAGE;
          if (command.scissor_test) cap |= gl.SCISSOR_TEST;
          if (command.stencil_test) cap |= gl.STENCIL_TEST;
          if (command.rasterizer_discard) cap |= gl.RASTERIZER_DISCARD;
          if (command.cull_face) cap |= gl.CULL_FACE;
          if (command.cmd == 'enable'){
            gl.enable(cap);
          } else{
            gl.disable(cap);
          }
        }
        break;
      case 'clearColor':
          gl.clearColor(command.r, command.g, command.b, command.a);
        break;
      case 'clear':{
        let bits = 0;
        if (command.depth) bits |= gl.DEPTH_BUFFER_BIT;
        if (command.color) bits |= gl.COLOR_BUFFER_BIT;
        if (command.stencil) bits |= gl.STENCIL_BUFFER_BIT;
        gl.clear(bits);
      }
      break;
      case 'frontFace':{
        gl.frontFace((gl as any)[command.mode]);
      }
      break;
      case 'cullFace':{
        gl.cullFace((gl as any)[command.mode]);
      }
      break;

      // ------------------------------- DEPTH --------------------------------------
      case 'depthFunc':{
        gl.depthFunc((gl as any)[command.func]);
      }
      break;
      case 'depthMask':{
        gl.depthMask(command.flag);
      }
      break;
      case 'depthRange':{
        gl.depthRange(command.z_near, command.z_far);
      }
      break;

      // ------------------------------- COLOR --------------------------------------
      case 'blendColor':
          gl.blendColor(command.r, command.g, command.b, command.a);
        break;
      case 'blendEquation':
        gl.blendEquation((gl as any)[command.mode]);
        break;
      case 'blendEquationSeparate':
          gl.blendEquationSeparate((gl as any)[command.mode_rgb], (gl as any)[command.mode_alpha]);
          break;
      case 'blendFunc':
          gl.blendFunc((gl as any)[command.s_factor], (gl as any)[command.d_factor])
      break;
      case 'blend_func_separate':
         gl.blendFuncSeparate((gl as any)[command.src_rgb], (gl as any)[command.dst_rgb], (gl as any)[command.src_alpha], (gl as any)[command.dst_alpha])
        break;
        
      // ------------------------------- TEXTURE --------------------------------------
      case 'createTexture':{
        let res = this.get_resource(command.resource);
        const ptr = gl.createTexture();
        res.set('_gl_ptr', ptr);
        res.set('_info', {type:'texture'});
        res.save_changes();
      }
      break;
      case 'bindTexture':{
        const texture = this.get_resource(command.texture).get('_gl_ptr');
        gl.bindTexture((gl as any)[command.target], texture);
      }
      break;
      case 'activeTexture':
        gl.activeTexture(gl.TEXTURE0 + command.texture);
      break;
      case 'generateMipmap':
        gl.generateMipmap((gl as any)[command.target]);
      break;
      case 'texImage2D':
        if (command.hasOwnProperty('buffer_metadata')){
          gl.texImage2D(
            (gl as any)[command.target],
            command.level,
            (gl as any)[command.internal_format],
            command.width,
            command.height,
            command.border,
            (gl as any)[command.format],
            (gl as any)[command.data_type],
            converted_buffers[command.buffer_metadata.index]
          )
        }
        else{
          gl.texImage2D(
            (gl as any)[command.target],
            command.level,
            (gl as any)[command.internal_format],
            command.width,
            command.height,
            command.border,
            (gl as any)[command.format],
            (gl as any)[command.data_type],
            null
          )
        }
      break;
      case 'texStorage2D':{
        gl.texStorage2D(
          (gl as any)[command.target],
          command.levels,
          (gl as any)[command.internal_format],
          command.width,
          command.height
        );
      }
      break;
      case 'texImage3D':
        if (command.hasOwnProperty('buffer_metadata')){
          gl.texImage3D(
            (gl as any)[command.target],
            command.level,
            (gl as any)[command.internal_format],
            command.width,
            command.height,
            command.depth,
            command.border,
            (gl as any)[command.format],
            (gl as any)[command.data_type],
            converted_buffers[command.buffer_metadata.index]
          )
        }else{
          gl.texImage3D(
            (gl as any)[command.target],
            command.level,
            (gl as any)[command.internal_format],
            command.width,
            command.height,
            command.depth,
            command.border,
            (gl as any)[command.format],
            (gl as any)[command.data_type],
            null
          )
        }
      break;
      case 'texStorage3D':{
        gl.texStorage3D(
          (gl as any)[command.target],
          command.levels,
          (gl as any)[command.internal_format],
          command.width,
          command.height,
          command.depth
        );
      }
      break;
      case 'texParameteri':
        gl.texParameteri((gl as any)[command.target], (gl as any)[command.pname], command.param);
      break;
      case 'texParameterf':
        gl.texParameterf((gl as any)[command.target], (gl as any)[command.pname], command.param);
      break;
      case 'texParameter_str':
        gl.texParameteri((gl as any)[command.target], (gl as any)[command.pname], (gl as any)[command.param]);
      break;
      case 'pixelStorei':{
        if (command.pname == 'UNPACK_COLORSPACE_CONVERSION_WEBGL'){
          gl.pixelStorei((gl as any)[command.pname], (gl as any)[command.param]);
        }
        else{
          gl.pixelStorei((gl as any)[command.pname], command.param);
        }
      }
      break;
      // ------------------------------- SHADERS --------------------------------------
      case 'createShader':{
        let res = this.get_resource(command.resource);
        const ptr = gl.createShader((gl as any)[command.type]);
        res.set('_gl_ptr', ptr);
        res.set('_info', {type:command.type});
        res.save_changes();
      }
      break;
      case 'shaderSource':{
        const res = this.get_resource(command.shader);
          const ptr = res.get('_gl_ptr');
          gl.shaderSource(ptr, command.source);
        }
        break;
      case 'compileShader':{
          const res = this.get_resource(command.shader);
          const ptr = res.get('_gl_ptr');
          gl.compileShader(ptr);
          let resinfo = res.get('_info');

          if ( !gl.getShaderParameter(ptr, gl.COMPILE_STATUS) ) {
            let info = gl.getShaderInfoLog( ptr );
            resinfo.message = info;
          }
          else{
            resinfo.message = 'compiled';
          }
          res.set('_info', resinfo);
          res.save_changes();
        }
        break;
      // ------------------------------- PROGRAMS --------------------------------------
      case 'createProgram':{
          let res = this.get_resource(command.resource);
          const ptr = gl.createProgram();
          res.set('_gl_ptr', ptr);
          res.set('_info', {type:'Program'});
          res.save_changes();
        }
        break;
      case 'attachShader':{
          const prog = this.get_resource(command.program).get('_gl_ptr');
          const shader = this.get_resource(command.shader).get('_gl_ptr');
          gl.attachShader(prog, shader);
        }
        break;
      case 'bindAttribLocation':{
          let res = this.get_resource(command.program);
          const ptr = res.get('_gl_ptr');
          gl.bindAttribLocation(ptr, command.index, command.name);
        }
        break;
      case 'linkProgram':{
          let res = this.get_resource(command.program);
          const ptr = res.get('_gl_ptr');
          gl.linkProgram(ptr);
          gl.validateProgram(ptr);
          let resinfo = res.get('_info');

          if ( !gl.getProgramParameter( ptr, gl.LINK_STATUS) ) {
            let info = gl.getShaderInfoLog( ptr );
            resinfo.message = info;
          }
          else{
            //bind our viewBlock
            let viewBlockIndex = gl.getUniformBlockIndex(ptr, 'ViewBlock');
            if (viewBlockIndex>-1){
              gl.uniformBlockBinding(ptr, viewBlockIndex, 0);
            }
            resinfo.message = 'linked';
            resinfo.uniforms_blocks = [];
            resinfo.uniforms = [];
            const numUniforms = gl.getProgramParameter(ptr, gl.ACTIVE_UNIFORMS);
            const indices = [...Array(numUniforms).keys()];
            const blockIndices = gl.getActiveUniforms(ptr, indices, gl.UNIFORM_BLOCK_INDEX);
            const offsets = gl.getActiveUniforms(ptr, indices, gl.UNIFORM_OFFSET);
            for (let i = 0; i < numUniforms; ++i) {
              const info = gl.getActiveUniform(ptr, i);
              if (info){
                // regroup the blocks
                if (blockIndices[i]>-1){
                  let uniform_block = resinfo.uniforms_blocks.find((element:any)=>{return element.index == blockIndices[i]});
                  if (uniform_block == undefined){
                    uniform_block = {
                      index:blockIndices[i], 
                      name:gl.getActiveUniformBlockName(ptr, blockIndices[i]), 
                      size:gl.getActiveUniformBlockParameter(ptr, blockIndices[i], gl.UNIFORM_BLOCK_DATA_SIZE),
                      uniforms:[]};
                    resinfo.uniforms_blocks.push(uniform_block);
                  }
                  uniform_block.uniforms.push(
                    {name:info.name, type:this.glEnumToString(gl, info.type), size:info.size, offset:offsets[i]}
                  )
                }
                else{
                  resinfo.uniforms.push({name:info.name, type:this.glEnumToString(gl, info.type), size:info.size, location:gl.getUniformLocation(ptr, info.name)});
                }
              }
            }
            resinfo.attributes = [];
            const numAttribute = gl.getProgramParameter(ptr, gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < numAttribute; ++i) {
              const info = gl.getActiveAttrib(ptr, i);
              if (info)
                resinfo.attributes.push({name:info.name, type:this.glEnumToString(gl, info.type), size:info.size, location:gl.getAttribLocation(ptr, info.name)});
            }
          }
          res.set('_info', resinfo);
          res.save_changes();
        }
        break;
      case 'useProgram':{
          if(command.program >= 0){
            const res = this.get_resource(command.program);
            const ptr = res.get('_gl_ptr');
            gl.useProgram(ptr);
            this.bound_program = res;
          } else {
            gl.useProgram(null);
            this.bound_program = null;
          }
        }
        break;
      case 'uniform':
      case 'uniformMatrix':
        {
          if(this.bound_program != null){
            let resinfo = this.bound_program.get('_info');
            const uniform = resinfo.uniforms.find((element:any)=>{return element.name == command.name});
            if (uniform != undefined){
              const location = uniform.location;

              if (command.cmd == 'uniform'){
                let shape = command.buffer_metadata.shape[command.buffer_metadata.shape.length-1];
                if (command.buffer_metadata.dtype == 'int32'){
                  let bufarray:Int32Array = converted_buffers[command.buffer_metadata.index] as Int32Array;
                  if (shape == 1) gl.uniform1iv(location, bufarray);
                  else if (shape == 2) gl.uniform2iv(location, bufarray);
                  else if (shape == 3) gl.uniform3iv(location, bufarray);
                  else if (shape == 4) gl.uniform4iv(location, bufarray);
                }
                else if (command.buffer_metadata.dtype == 'uint32'){
                  let bufarray:Uint32Array = converted_buffers[command.buffer_metadata.index] as Uint32Array;
                  if (shape == 1) gl.uniform1uiv(location, bufarray);
                  else if (shape == 2) gl.uniform2uiv(location, bufarray);
                  else if (shape == 3) gl.uniform3uiv(location, bufarray);
                  else if (shape == 4) gl.uniform4uiv(location, bufarray);
                }
                else if (command.buffer_metadata.dtype == 'float32'){
                  let bufarray:Float32Array = converted_buffers[command.buffer_metadata.index] as Float32Array;
                  if (shape == 1) gl.uniform1fv(location, bufarray);
                  else if (shape == 2) gl.uniform2fv(location, bufarray);
                  else if (shape == 3) gl.uniform3fv(location, bufarray);
                  else if (shape == 4) gl.uniform4fv(location, bufarray);
                }
              }

              else {
                let a = command.buffer_metadata.shape[command.buffer_metadata.shape.length-2];
                let b = command.buffer_metadata.shape[command.buffer_metadata.shape.length-1];
                let bufarray:Float32Array = converted_buffers[command.buffer_metadata.index] as Float32Array;
                if (a==2)
                {
                  if (b==2) gl.uniformMatrix2fv(location, false, bufarray);
                  else if (b==3) gl.uniformMatrix2x3fv(location, false, bufarray);
                  else if (b==4)gl.uniformMatrix2x4fv(location, false, bufarray);
                }
                else if (a==3)
                {
                  if (b==2) gl.uniformMatrix3x2fv(location, false, bufarray);
                  else if (b==3) gl.uniformMatrix3fv(location, false, bufarray);
                  else if (b==4)gl.uniformMatrix3x4fv(location, false, bufarray);
                }
                else if (a==4)
                {
                  if (b==2) gl.uniformMatrix4x2fv(location, false, bufarray);
                  else if (b==3) gl.uniformMatrix4x3fv(location, false, bufarray);
                  else if (b==4)gl.uniformMatrix4fv(location, false, bufarray);
                }
              }
            }
          }
        }
      break;
      case 'uniformBlockBinding':{
        let res = this.get_resource(command.program);
        const ptr = res.get('_gl_ptr');
        const uniformblock = res.get('_info').uniforms_blocks.find((element:any)=>{return element.name == command.uniform_block_name});
        if (uniformblock != undefined){
          gl.uniformBlockBinding(ptr, uniformblock.index, command.uniform_block_binding);
        }
      }
      break;
      // ------------------------------- BUFFERS --------------------------------------
      case 'createBuffer':{
          let res = this.get_resource(command.resource);
          const ptr = gl.createBuffer();
          res.set('_gl_ptr', ptr);
          res.set('_info', {type:'Buffer'});
          res.save_changes();
        }
        break;
      case 'bindBuffer':{
          const target:string = command.target;
          if(command.buffer >= 0){
            const res = this.get_resource(command.buffer);
            const ptr = res.get('_gl_ptr');
            gl.bindBuffer((gl as any)[target], ptr);
            (this.bound_buffers as any)[target] = res;
          } else {
            gl.bindBuffer((gl as any)[target], null);
            (this.bound_buffers as any)[target]  = null;
          }
        }
        break;
      case 'bindBufferBase':{
          const target:string = command.target;
          if(command.buffer >= 0){
            const res = this.get_resource(command.buffer);
            const ptr = res.get('_gl_ptr');
            gl.bindBufferBase((gl as any)[target], command.index, ptr);
          } else {
            gl.bindBufferBase((gl as any)[target], command.index, null);
          }
        }
        break;
      case 'bufferData':{
          const target:string = command.target;
          const usage:string = command.usage;

          if (command.hasOwnProperty('buffer_metadata')){
            gl.bufferData((gl as any)[target], converted_buffers[command.buffer_metadata.index], (gl as any)[usage]);

            let buf = (this.bound_buffers as any)[target];
            if (command.update_info && buf != null){
              const size = gl.getBufferParameter((gl as any)[target], gl.BUFFER_SIZE);
              buf.set('_info', {type:"Buffer", size:size, target:target});
              buf.save_changes();
            }
          }
          else{
            let buf = (this.bound_buffers as any)[target];
            gl.bufferData((gl as any)[target], null, (gl as any)[usage]);
            if (command.update_info && buf != null){
              buf.set('_info', {type:"Buffer", size:'Undefined', target:target});
              buf.save_changes();
            }
          }
        }
        break;
      case 'createUniformBuffer':{
          let res = this.get_resource(command.buffer);
          const ptr = gl.createBuffer();

          let info = {type:'Buffer'};
          const prog = this.get_resource(command.program);
          const uniformblock = prog.get('_info').uniforms_blocks.find((element:any)=>{return element.name == command.block_name});
          if (uniformblock != undefined){
            gl.bindBuffer(gl.UNIFORM_BUFFER, ptr);
            gl.bufferData(gl.UNIFORM_BUFFER, uniformblock.size, (gl as any)[command.usage]);
            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
            (this.bound_buffers as any)["UNIFORM_BUFFER"] = null;
            (info as any)["size"] = uniformblock.size;
            (info as any)["target"] = "UNIFORM_BUFFER";
            (info as any)["uniformblock"] = uniformblock;
          }
          res.set('_gl_ptr', ptr);
          res.set('_info', info);
          res.save_changes();
        }
        break;
      case 'bufferSubData':
      case 'bufferSubDataStr':{
          const target:string = command.target;
          let offset = command.dst_byte_offset;
          if (command.cmd == 'bufferSubDataStr'){
            offset = 0;
            let buf = (this.bound_buffers as any)[target];
            if (buf != null){
              const uniformblock = buf.get('_info').uniformblock;
              const uniform = uniformblock.uniforms.find((element:any)=>{return element.name == command.dst_byte_offset});
              if (uniform != undefined){
                offset = uniform.offset;
              }
            }
          }
          if (command.hasOwnProperty('buffer_metadata')){
            gl.bufferSubData((gl as any)[target], offset, converted_buffers[command.buffer_metadata.index], command.src_offset);

          }
          else{
            gl.bufferSubData((gl as any)[target], offset, command.src_offset);
          }
        }
        break;
      // ------------------------------- VERTEX ARRAYS --------------------------------------
      case 'createVertexArray':{
          let res = this.get_resource(command.resource);
          const ptr = gl.createVertexArray();
          res.set('_gl_ptr', ptr);
          res.set('_info', {type:'Vertex Array Object', bindings:[]});
          res.save_changes();
        }
        break;
      case 'bindVertexArray':{
          if(command.vertex_array >= 0){
            const res = this.get_resource(command.vertex_array);
            const ptr = res.get('_gl_ptr');
            gl.bindVertexArray(ptr);
            this.bound_vao = res;
          } else {
            gl.bindVertexArray(null);
            this.bound_vao = null;
          }
        }
        break;
      case 'vertexAttribPointer':
      case 'vertexAttribIPointer':
      case 'enableVertexAttribArray':
      case 'disableVertexAttribArray':
      case 'vertexAttrib[1234]fv':
      case 'vertexAttribI4[u]iv':
        {
          let index = -1;
          if (typeof command.index === 'number'){
            index = command.index;
          }
          else{
            if (this.bound_program != null){
              const attr = this.bound_program.get('_info').attributes.find((element:any)=>{return element.name == command.index});
              if (attr != undefined){
                index = attr.location;
              }
            }else{
              console.error("a program must be bound to find the attribute");
            }
          }
          let buf = (this.bound_buffers as any)['ARRAY_BUFFER'];
          if (index >= 0){
            if (command.cmd == "vertexAttribIPointer"){
              gl.vertexAttribIPointer(index, command.size, (gl as any)[command.type], command.stride, command.offset);
              if (this.bound_vao != null && buf != null){
                let vao_info = this.bound_vao.get('_info');
                const buffer_uid = buf.get('uid');
                let binding_info = vao_info.bindings.find((element:any)=>{return element.buffer_uid == buffer_uid});
                if (binding_info == undefined){
                  binding_info = {buffer_uid : buffer_uid, attributes : []};
                  vao_info.bindings.push(binding_info);
                }
                binding_info.attributes.push({pointer:"vertexAttribIPointer", index:index, size:command.size, type:command.type, stride:command.stride, offset:command.offset})
                this.bound_vao.set('_info', vao_info);
                this.bound_vao.save_changes();
              }
            }
            else if (command.cmd == "vertexAttribPointer"){
              gl.vertexAttribPointer(index, command.size, (gl as any)[command.type], command.normalized, command.stride, command.offset);
              if (this.bound_vao != null && buf != null){
                let vao_info = this.bound_vao.get('_info');
                const buffer_uid = buf.get('uid');
                let binding_info = vao_info.bindings.find((element:any)=>{return element.buffer_uid == buffer_uid});
                if (binding_info == undefined){
                  binding_info = {buffer_uid : buffer_uid, attributes : []};
                  vao_info.bindings.push(binding_info);
                }
                binding_info.attributes.push({pointer:"vertexAttribPointer", index:index, size:command.size, type:command.type, normalized:command.normalized, stride:command.stride, offset:command.offset})
                this.bound_vao.set('_info', vao_info);
                this.bound_vao.save_changes();
              }
            }
            else if (command.cmd == "enableVertexAttribArray"){
              gl.enableVertexAttribArray(index);
            }
            else if (command.cmd == "disableVertexAttribArray"){
              gl.disableVertexAttribArray(index);
            }
            else if (command.cmd == "vertexAttrib[1234]fv"){
              if (command.buffer_metadata.shape[0] == 1){
                gl.vertexAttrib1fv(index, converted_buffers[command.buffer_metadata.index]);
              } else if (command.buffer_metadata.shape[0] == 2){
                gl.vertexAttrib2fv(index, converted_buffers[command.buffer_metadata.index]);
              } if (command.buffer_metadata.shape[0] == 3){
                gl.vertexAttrib3fv(index, converted_buffers[command.buffer_metadata.index]);
              }if (command.buffer_metadata.shape[0] == 4){
                gl.vertexAttrib4fv(index, converted_buffers[command.buffer_metadata.index]);
              }
            }
            else if (command.cmd == "vertexAttribI4[u]iv"){
              if(command.buffer_metadata.dtype == "uint32"){
                gl.vertexAttribI4uiv(index, converted_buffers[command.buffer_metadata.index]);
              } else if(command.buffer_metadata.dtype == "int32"){
                gl.vertexAttribI4iv(index, converted_buffers[command.buffer_metadata.index]);
              }
            }
          }
          else{
            console.error(`attribute ${command.index} location not found`);
          }
        }
        break;

        // ------------------------------- RENDER --------------------------------------
        case 'drawArrays':{
          gl.drawArrays((gl as any)[command.mode], command.first, command.count);
        }
        break;
        case 'drawArraysInstanced':{
          gl.drawArraysInstanced((gl as any)[command.mode], command.first, command.count, command.instance_count);
        }
        break;
        case 'drawElements':{
          gl.drawElements((gl as any)[command.mode], command.count, (gl as any)[command.type], command.offset);
        }
        break;
        case 'drawElementsInstanced':{
          gl.drawElementsInstanced((gl as any)[command.mode], command.count, (gl as any)[command.type], command.offset, command.instance_count);
        }
        break;

        // ------------------------------- FRAMEBUFFER --------------------------------------
        case 'createFramebuffer':{
          let res = this.get_resource(command.resource);
          const ptr = gl.createFramebuffer();
          res.set('_gl_ptr', ptr);
          res.set('_info', {type:'Framebuffer'});
          res.save_changes();
        }
        break;
        case 'bindFramebuffer':{
          if (command.framebuffer >= 0){
            let res = this.get_resource(command.framebuffer);
            gl.bindFramebuffer((gl as any)[command.target], res.get('_gl_ptr'));
          }
          else{
            gl.bindFramebuffer((gl as any)[command.target], null);
          }
        }
        break;
        case 'framebufferTexture2D':{
          let res = this.get_resource(command.texture);
          gl.framebufferTexture2D((gl as any)[command.target], (gl as any)[command.attachement], (gl as any)[command.textarget], res.get('_gl_ptr'), command.level);
        }
        break;
        case 'drawBuffers' :{
          const buffers = command.buffers.map((element:any)=>{return (gl as any)[element]; });
          gl.drawBuffers(buffers);
        }
        break;
        
    }
  }

  register_resource(resource:GLResource){
    if(resource.get('uid') != this.resources.length){
      console.error('uid not matching what we have internally');
    }
    this.resources.push(resource);
  }

  get_resource(index:number){
    return this.resources[index];
  }

  canvas: HTMLCanvasElement;
  ctx: WebGL2RenderingContext | null;
  view_block: WebGLBuffer | null;

  resources : GLResource[] = [];
  bound_program: GLResource | null;
  bound_buffers = {};
  bound_vao: GLResource | null;
  commands : any[] = [];
  buffers : any[] = [];

  projection_matrix:number[];
  camera_matrix:number[];
  view_matrix:number[];
  view_proj_matrix:number[];
}

export class GLViewer extends DOMWidgetView {

  render() {
    this.el.appendChild(this.model.canvas);

    this.resizeCanvas();
    this.model.on_some_change(['width', 'height'], this.resizeCanvas, this);

    this.el.addEventListener('mousemove', {
      handleEvent: this.onMouseMove.bind(this)
    });
    this.el.addEventListener('mousedown', {
      handleEvent: this.onMouseDown.bind(this)
    });
    this.el.addEventListener('mouseup', {
      handleEvent: this.onMouseUp.bind(this)
    });
    this.el.addEventListener('mouseout', {
      handleEvent: this.onMouseOut.bind(this)
    });
    this.el.addEventListener('keydown', {
      handleEvent: this.onKeyDown.bind(this)
    });
    this.el.addEventListener('keyup', {
      handleEvent: this.onKeyUp.bind(this)
    });
    this.el.setAttribute('tabindex', '0');
  }
 
  private resizeCanvas() {
    this.el.setAttribute('width', this.model.get('width'));
    this.el.setAttribute('height', this.model.get('height'));
    this.model.resizeCanvas();
  }

  private redraw(){
    this.will_redraw = false;

    // update movement if needed
    if (this.move_direction[0] || this.move_direction[1] || this.move_direction[2] || this.move_direction[3])
    {
      let speed = this.model.get('move_speed');
      let forward_axis = m4getColumnK(this.model.camera_matrix);
      let side_axis = m4getColumnI(this.model.camera_matrix);
      let camera_pos = this.model.get('camera_pos');
      if (this.move_direction[0]){
        camera_pos = vec3Add(camera_pos, vec3Scale(forward_axis, -speed));
      }
      if (this.move_direction[2]){
        camera_pos = vec3Add(camera_pos, vec3Scale(forward_axis, speed));
      }
      if (this.move_direction[1]){
        camera_pos = vec3Add(camera_pos, vec3Scale(side_axis, -speed));
      }
      if (this.move_direction[3]){
        camera_pos = vec3Add(camera_pos, vec3Scale(side_axis, speed));
      }
      this.model.set('camera_pos', camera_pos);
      this.touch();
      // request a new frame if we are moving
      this.requestRedraw();
    }

    // re draw
    this.model.run_commands();
  }

  private requestRedraw(){
    if (this.will_redraw == false){
      this.will_redraw = true;
      requestAnimationFrame(this.redraw.bind(this));
    }
  }

  private onMouseMove(event: MouseEvent) {
    //this.model.send({ event: 'mouse_move', ...this.getCoordinates(event) }, {});
    if(this.is_mouse_down){
      let speed = this.model.get('mouse_speed');
      this.model.set('camera_yaw', this.model.get('camera_yaw')-(event.movementX)*0.2*speed);
      this.model.set('camera_pitch', this.model.get('camera_pitch')-(event.movementY)*0.2*speed);
      this.touch();
      this.requestRedraw();
    }
  }

  private onMouseDown(event: MouseEvent) {
    this.is_mouse_down = true;
    this.model.canvas.focus();
  }

  private onMouseUp(event: MouseEvent) {
    this.is_mouse_down = false;
  }

  private onMouseOut(event: MouseEvent) {
    this.is_mouse_down = false;
    this.move_direction = [false, false, false, false];
  }

  private onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    let keys = this.model.get('move_keys');

    if(event.repeat == false){
      if(event.key == keys[0]){
        this.move_direction[0] = true;
        this.requestRedraw();
      }
      else if(event.key == keys[1]){
        this.move_direction[1] = true;
        this.requestRedraw();
      }
      else if(event.key == keys[2]){
        this.move_direction[2] = true;
        this.requestRedraw();
      }
      else if(event.key == keys[3]){
        this.move_direction[3] = true;
        this.requestRedraw();
      }
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    let keys = this.model.get('move_keys');

    if(event.key == keys[0]){
      this.move_direction[0] = false;
    }
    else if(event.key == keys[1]){
      this.move_direction[1] = false;
    }
    else if(event.key == keys[2]){
      this.move_direction[2] = false;
    }
    else if(event.key == keys[3]){
      this.move_direction[3] = false;
    }
  }

  protected getCoordinates(event: MouseEvent | Touch) {
    const rect = this.el.getBoundingClientRect();

    const x = (this.model.get('width') * (event.clientX - rect.left)) / rect.width;
    const y = (this.model.get('height') * (event.clientY - rect.top)) / rect.height;

    return { x, y };
  }

  model : GLModel;
  is_mouse_down : boolean = false;
  move_direction : boolean[] = [false, false, false, false];
  will_redraw = false;
}
