import {
    DOMWidgetModel,
    DOMWidgetView,
    ISerializers,
    unpack_models
  } from '@jupyter-widgets/base';
  
import { MODULE_NAME, MODULE_VERSION } from './version';

export class GLProgram extends DOMWidgetModel{
    defaults() {
      return {
        ...super.defaults(),
        _model_name: 'GLProgram',
        _model_module: MODULE_NAME,
        _model_module_version: MODULE_VERSION,
        _view_name: 'GLProgramView',
        _view_module: MODULE_NAME,
        _view_module_version: MODULE_VERSION,
  
        _glmodel: null,
        _program: null,
        _uniforms: [],
  
        uid: 0,
        vertex_shader_message: "",
        pixel_shader_message: "",
        program_message:"",
        ready: false,
      };
    }

    static serializers: ISerializers = {
        ...DOMWidgetModel.serializers,
        _glmodel: { deserialize: unpack_models },
      };
    
    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);

        this.get('_glmodel').register_program(this);
        this.on('msg:custom', this.handle_custom_messages, this);
    }

    handle_custom_messages(msg: any) {
        switch (msg.type) {
            case 'compile':
              const gl = this.get('_glmodel').ctx;
              this.createProgram(gl, msg.vertex_code, msg.fragment_code);
              break;
        }
      }
  
    private createShader(gl:WebGL2RenderingContext, sourceCode:string, type:number, output_message:string):WebGLShader|null {
      // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
      let shader = gl.createShader( type );
      if (shader == null)
      {
        console.error('could not create shader');
      }
      else{
        gl.shaderSource( shader, sourceCode );
        gl.compileShader( shader );
    
        if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
          let info = gl.getShaderInfoLog( shader );
          this.set(output_message, info);
          shader = null;
        }
        else{
            this.set(output_message, 'ok');
        }
      }
      return shader;
    }
  
    createProgram(gl:WebGL2RenderingContext, vertexCode:string, fragCode:string){
      this.set('ready', false);
      
      if (this.get('_program') != null){
        gl.deleteProgram(this.get('_program'));
      }
      this.set('_program', null);
      this.set('_uniforms', []);
  
      let program = gl.createProgram();
      if (program == null){
        console.error('could not create program');
      }
      else
      {
        const vertexShader = this.createShader(gl, vertexCode, gl.VERTEX_SHADER, 'vertex_shader_message');
        const fragmentShader = this.createShader(gl, fragCode, gl.FRAGMENT_SHADER, 'pixel_shader_message');
        if (vertexShader != null && fragmentShader != null)
        {
            // link
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
              let info = gl.getProgramInfoLog(program);
              this.set('program_message', info);
            }
            else{
              this.set('ready', true);
              this.set('_program', program);
              this.set('program_message', 'ok');
            }
        }
        if(vertexShader != null) gl.deleteShader(vertexShader);
        if(fragmentShader != null) gl.deleteShader(fragmentShader);
      }
      this.save_changes();
    }

    requestUniformLocation(gl:WebGL2RenderingContext, uniform_name:string)
    {
      let uniforms = this.get("_uniforms");
      uniforms.forEach((element:any) => {
        if(element.name == uniform_name){
          return element.location;
        }
      });
      let loc = gl.getUniformLocation(this.get('_program'), uniform_name)
      uniforms.push({name:uniform_name, location:loc});
      this.set("_uniforms", uniforms);
      this.save_changes();
      return loc;
    }

    setUniform(gl:WebGL2RenderingContext, uniform_name:string, array_dtype:string, array_shape:any, array:any)
    {
      let loc = this.requestUniformLocation(gl, uniform_name);
      if (loc != null){
        let shape = array_shape[array_shape.length-1];
        if (array_dtype == 'int32'){
          let bufarray:Int32Array = array as Int32Array;
          if (shape == 1){
            gl.uniform1iv(loc, bufarray);
          }
          else if(shape == 2){
            gl.uniform2iv(loc, bufarray);
          }
          else if(shape == 3){
            gl.uniform3iv(loc, bufarray);
          }
          else if(shape == 4){
            gl.uniform4iv(loc, bufarray);
          }
        }
        else if (array_dtype == 'uint32'){
          let bufarray:Uint32Array = array as Uint32Array;
          if (shape == 1){
            gl.uniform1uiv(loc, bufarray);
          }
          else if(shape == 2){
            gl.uniform2uiv(loc, bufarray);
          }
          else if(shape == 3){
            gl.uniform3uiv(loc, bufarray);
          }
          else if(shape == 4){
            gl.uniform4uiv(loc, bufarray);
          }
        }
        else if (array_dtype == 'float32'){
          let bufarray:Float32Array = array as Float32Array;
          if (shape == 1){
            gl.uniform1fv(loc, bufarray);
          }
          else if(shape == 2){
            gl.uniform2fv(loc, bufarray);
          }
          else if(shape == 3){
            gl.uniform3fv(loc, bufarray);
          }
          else if(shape == 4){
            gl.uniform4fv(loc, bufarray);
          }
        }
      }
    }
    
    setUniformMatrix(gl:WebGL2RenderingContext, uniform_name:string, array_shape:any, array:any)
    {
      let loc = this.requestUniformLocation(gl, uniform_name);
      if (loc != null){
        let a = array_shape[array_shape.length-2];
        let b = array_shape[array_shape.length-1];
        let bufarray:Float32Array = array as Float32Array;
        if (a==2)
        {
          if (b==2){
            gl.uniformMatrix2fv(loc, false, bufarray);
          }
          else if (b==3){
            gl.uniformMatrix2x3fv(loc, false, bufarray);
          }
          else if (b==4){
            gl.uniformMatrix2x4fv(loc, false, bufarray);
          }
        }
        else if (a==3)
        {
          if (b==2){
            gl.uniformMatrix3x2fv(loc, false, bufarray);
          }
          else if (b==3){
            gl.uniformMatrix3fv(loc, false, bufarray);
          }
          else if (b==4){
            gl.uniformMatrix3x4fv(loc, false, bufarray);
          }
        }
        else if (a==4)
        {
          if (b==2){
            gl.uniformMatrix4x2fv(loc, false, bufarray);
          }
          else if (b==3){
            gl.uniformMatrix4x3fv(loc, false, bufarray);
          }
          else if (b==4){
            gl.uniformMatrix4fv(loc, false, bufarray);
          }
        }
      }
    }
  }
  
export class GLProgramView extends DOMWidgetView {

    render() {
        let content = document.createElement('div');
        let div = document.createElement('div');
        content.appendChild(div);

        let table:HTMLTableElement = document.createElement('table');
        table.classList.add('ipwebgl-table');
        div.appendChild(table);
        
        let tbody = table.createTBody();

        let row = tbody.insertRow();
        row.classList.add('ipwebgl-tr');
        let typecell = row.insertCell();
        typecell.classList.add('ipwebgl-td');
        typecell.classList.add('ipwebgl-td-small');
        typecell.appendChild(document.createTextNode("program id : "));
        let valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode(String(this.model.get('uid'))));

        row = tbody.insertRow();
        row.classList.add('ipwebgl-tr');
        typecell = row.insertCell();
        typecell.classList.add('ipwebgl-td');
        typecell.classList.add('ipwebgl-td-small');
        typecell.appendChild(document.createTextNode("ready : "));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode(String(this.model.get('ready'))));

        row = tbody.insertRow();
        row.classList.add('ipwebgl-tr');
        typecell = row.insertCell();
        typecell.classList.add('ipwebgl-td');
        typecell.classList.add('ipwebgl-td-small');
        typecell.appendChild(document.createTextNode("program message : "));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode(String(this.model.get('program_message'))));

        row = tbody.insertRow();
        row.classList.add('ipwebgl-tr');
        typecell = row.insertCell();
        typecell.classList.add('ipwebgl-td');
        typecell.classList.add('ipwebgl-td-small');
        typecell.appendChild(document.createTextNode("vertex shader : "));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode(String(this.model.get('vertex_shader_message'))));

        row = tbody.insertRow();
        row.classList.add('ipwebgl-tr');
        typecell = row.insertCell();
        typecell.classList.add('ipwebgl-td');
        typecell.classList.add('ipwebgl-td-small');
        typecell.appendChild(document.createTextNode("fragment shader : "));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode(String(this.model.get('pixel_shader_message'))));


        if(this.model.get('_uniforms').length > 0){

          div = document.createElement('div');
          content.appendChild(div);
          table = document.createElement('table');
          table.classList.add('ipwebgl-table');
          div.appendChild(table);

          row = table.createTHead().insertRow();
          row.classList.add('ipwebgl-th');
          valuecell = row.insertCell();
          valuecell.classList.add('ipwebgl-td');
          valuecell.appendChild(document.createTextNode('Uniform'));
          valuecell = row.insertCell();
          valuecell.classList.add('ipwebgl-td');
          valuecell.appendChild(document.createTextNode('Location'));

          tbody = table.createTBody();
          this.model.get('_uniforms').forEach((element:any)=>{
            row = tbody.insertRow();
            row.classList.add('ipwebgl-tr');
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            valuecell.appendChild(document.createTextNode(element.name));
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            if (element.location){
              valuecell.appendChild(document.createTextNode('found'));
            }
            else{
              valuecell.appendChild(document.createTextNode('not used'));
            }
            
          });
        }

        this.el.appendChild(content);
    }
  }
  