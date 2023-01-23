import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

import { GLProgram } from './glprogram';
import { GLBuffer } from './glbuffer';
import { GLVertexArray } from './glvertexarray';
import { m4dot, m4getColumnI, m4getColumnK, m4inverse, m4ProjectionMatrix, m4Translation, m4Transpose, m4Xrotation, m4Yrotation, vec3Add, vec3Scale } from './matrix';
import { buffer_to_array } from './arraybuffer';
import { convert_buffer_target } from './glbufferhelper';


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

  handle_custom_messages(commands: any) {
    this.commands = commands;
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
  }

  run_commands(){
    this.update_camera();
    this.view_proj_matrix = m4dot(this.projection_matrix, this.view_matrix);
    let vp = (this.get('shader_matrix_major')=='row_major')? m4Transpose(this.view_proj_matrix): this.view_proj_matrix;
    const view_proj_f32 = new Float32Array(vp);
    this.commands.forEach((command:any)=>{
        switch (command.cmd) {
          case 'bindBuffer':
            if (this.ctx){
              let buf = (command.buffer>=0)? this.get_buffer(command.buffer):null;
              let target = convert_buffer_target(this.ctx, command.target);
              if (buf)
              {
                this.ctx.bindBuffer(target, buf.get('_buffer'));
              }
              else{
                this.ctx.bindBuffer(target, null);
              }
            } 
            break;
          case 'bindVertexArray':
            if (this.ctx){
              this.bound_vao = (command.vao>=0)? this.get_vao(command.vao):null;
              if (this.bound_vao)
              {
                this.ctx.bindVertexArray(this.bound_vao.get('_vao'));
              }
              else{
                this.ctx.bindVertexArray(null);
              }
            } 
            break;
          case 'bufferData':
            if (this.ctx){
              let buf = (command.buffer>=0)? this.get_buffer(command.buffer):null;
              if (buf){
                buf.update_buffer(this.ctx, command);
              }
            }
            break
          case 'clearColor':
            if (this.ctx) this.ctx.clearColor(command.r, command.g, command.b, command.a);
            break;
          case 'clear':
            if (this.ctx) 
            {
              let bits = 0;
              if (command.depth) bits |= this.ctx.DEPTH_BUFFER_BIT;
              if (command.color) bits |= this.ctx.COLOR_BUFFER_BIT;
              if (command.stencil) bits |= this.ctx.STENCIL_BUFFER_BIT;
              this.ctx.clear(bits);
            }
            break;
          case 'useProgram':
            if (this.ctx){
              this.bound_program = (command.program>=0)? this.get_program(command.program) : null;
              if(this.bound_program)
              {
                this.ctx.useProgram(this.bound_program.get('_program'));
                this.bound_program.setUniformMatrix(this.ctx, 'ViewProjection', [4,4], view_proj_f32);
              }
              else{
                this.ctx.useProgram(null);
              }
            }
            break;
          case 'uniform':
            if (this.ctx && this.bound_program){
              this.bound_program.setUniform(this.ctx, command.name, command.buffer.dtype, command.buffer.shape, buffer_to_array(command.buffer));
            }
            break;
          case 'uniformMatrix':
            if (this.ctx && this.bound_program){
              this.bound_program.setUniformMatrix(this.ctx, command.name, command.buffer.shape, buffer_to_array(command.buffer));
            }
            break;
          case 'drawArrays':
            if (this.ctx){
            let gltype = this.ctx.TRIANGLES;
            switch (command.type){
              case 'triangles':
                gltype = this.ctx.TRIANGLES; break;
              case 'triangle_fan':
                gltype = this.ctx.TRIANGLE_FAN; break;
              case 'triangle_strip':
                gltype = this.ctx.TRIANGLE_STRIP; break;
              case 'points':
                gltype = this.ctx.POINTS; break;
              case 'lines':
                gltype = this.ctx.LINES; break;
              case 'line_strip':
                gltype = this.ctx.LINE_STRIP; break;
              case 'line_loop':
                gltype = this.ctx.LINE_LOOP; break;
            }
            this.ctx.drawArrays(gltype, command.first, command.count);
          }
          break;
        }
    });
  }

  register_program(program:GLProgram){
    if(program.get('uid') != this.programs.length){
      throw new Error('uid should match the list index');
    }
    this.programs.push(program);
  }

  get_program(index:number){
    return this.programs[index];
  }

  register_buffer(buffer:GLBuffer){
    if(buffer.get('uid') != this.buffers.length){
      throw new Error('uid should match the list index');
    }
    this.buffers.push(buffer);
  }

  get_buffer(index:number){
    return this.buffers[index];
  }

  register_vao(vao:GLVertexArray){
    if(vao.get('uid') != this.vertexarrays.length){
      throw new Error('uid should match the list index');
    }
    this.vertexarrays.push(vao);
  }

  get_vao(index:number){
    return this.vertexarrays[index];
  }

  canvas: HTMLCanvasElement;
  ctx: WebGL2RenderingContext | null;
  programs : GLProgram[] = [];
  buffers : GLBuffer[] = [];
  vertexarrays : GLVertexArray[] = [];
  commands : any[] = [];

  projection_matrix:number[];
  camera_matrix:number[];
  view_matrix:number[];
  view_proj_matrix:number[];

  bound_program : GLProgram | null;
  bound_vao : GLVertexArray | null;
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
