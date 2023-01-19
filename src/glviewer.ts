import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

import { GLProgram } from './glprogram';
import { GLBuffer } from './glbuffer';
import { GLVertexArray } from './glvertexarray';
import { m4dot, m4inverse, m4ProjectionMatrix, m4Translation } from './matrix';
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
      width:700,
      height:500,
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

  run_commands(){
    this.view_proj_matrix = m4dot(this.projection_matrix, this.view_matrix);
    const view_proj_f32 = new Float32Array(this.view_proj_matrix);
    this.commands.forEach((command:any)=>{
        switch (command.cmd) {
          case 'clearColor':
            if (this.ctx) this.ctx.clearColor(command.r, command.g, command.b, command.a);
            break;
          case 'clear':
            if (this.ctx) this.ctx.clear(this.ctx.DEPTH_BUFFER_BIT | this.ctx.COLOR_BUFFER_BIT);
            break;
          case 'useProgram':
            if (this.ctx){
              this.bound_program = this.get_program(command.program);
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
          case 'bindVertexArray':
            if (this.ctx){
              this.bound_vao = this.get_vao(command.vao);
              if (this.bound_vao)
              {
                this.ctx.bindVertexArray(this.bound_vao.get('_vao'));
              }
              else{
                this.ctx.bindVertexArray(null);
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
  }

  private resizeCanvas() {
    this.el.setAttribute('width', this.model.get('width'));
    this.el.setAttribute('height', this.model.get('height'));
    this.model.resizeCanvas();
  }

  private onMouseMove(event: MouseEvent) {
    this.model.send({ event: 'mouse_move', ...this.getCoordinates(event) }, {});
  }

  private onMouseDown(event: MouseEvent) {
    console.log('mouse_down');
    // Bring focus to this element, so keyboard events can be triggered
    this.el.focus();
    this.model.send({ event: 'mouse_down', ...this.getCoordinates(event) }, {});
    
    //test
    //console.log({ event: 'mouse_down', ...this.getCoordinates(event) });
    //this.model.handle_custom_messages([{cmd:'clear'}]);
  }

  private onMouseUp(event: MouseEvent) {
    this.model.send({ event: 'mouse_up', ...this.getCoordinates(event) }, {});
  }

  private onMouseOut(event: MouseEvent) {
    this.model.send({ event: 'mouse_out', ...this.getCoordinates(event) }, {});
  }

  protected getCoordinates(event: MouseEvent | Touch) {
    const rect = this.el.getBoundingClientRect();

    const x = (this.model.get('width') * (event.clientX - rect.left)) / rect.width;
    const y = (this.model.get('height') * (event.clientY - rect.top)) / rect.height;

    return { x, y };
  }

  model : GLModel;
}
