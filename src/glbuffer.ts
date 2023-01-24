import {
    DOMWidgetModel,
    DOMWidgetView,
    ISerializers,
    unpack_models
  } from '@jupyter-widgets/base';
  
import { MODULE_NAME, MODULE_VERSION } from './version';

import { buffer_to_array } from './arraybuffer';
import { convert_buffer_target, convert_usage } from './glbufferhelper';

// Import the CSS
import '../css/widget.css';

export class GLBuffer extends DOMWidgetModel{
    defaults() {
      return {
        ...super.defaults(),
        _model_name: 'GLBuffer',
        _model_module: MODULE_NAME,
        _model_module_version: MODULE_VERSION,
        _view_name: 'GLBufferView',
        _view_module: MODULE_NAME,
        _view_module_version: MODULE_VERSION,
  
        _glmodel: null,
        _buffer: null,
  
        uid: 0,
      };
    }

    static serializers: ISerializers = {
        ...DOMWidgetModel.serializers,
        _glmodel: { deserialize: unpack_models },
      };
    
    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);

        this.get('_glmodel').register_buffer(this);
        this.on('msg:custom', this.handle_custom_messages, this);

        const gl:WebGL2RenderingContext = this.get('_glmodel').ctx;
        let buffer = gl.createBuffer();
        if (buffer == null){
          console.error('could not create a buffer');
        }
        else{
          this.set('_buffer', buffer);
          this.save_changes();
        }
    }

    handle_custom_messages(command: any) {
        switch (command.cmd) {
            case 'update':
              const gl:WebGL2RenderingContext = this.get('_glmodel').ctx;
              let buf = this.get('_buffer');
              let target = convert_buffer_target(gl, command.target);
              gl.bindBuffer(target, buf);
              let usage = convert_usage(gl, command.usage);
              if (command.srcData)
              {
                gl.bufferData(target, buffer_to_array(command.srcData), usage);
              }
              else{
                gl.bufferData(target, null, usage);
              }
              break;
        }
      }
    
    update_buffer(gl:WebGL2RenderingContext, command:any){
      let target = convert_buffer_target(gl, command.target);
      let usage = convert_usage(gl, command.usage);
      if (command.srcData)
      {
        gl.bufferData(target, buffer_to_array(command.srcData), usage);
      }
      else{
        gl.bufferData(target, null, usage);
      }
    }
}
  
export class GLBufferView extends DOMWidgetView {

    render() {
        let content = document.createElement('div');

        let table:HTMLTableElement = document.createElement('table');
        table.classList.add('ipwebgl-table');
        content.appendChild(table);
        
        let tbody = table.createTBody();
        let row = tbody.insertRow();

        row.classList.add('ipwebgl-tr');
        let typecell = row.insertCell();
        typecell.classList.add('ipwebgl-td');
        typecell.classList.add('ipwebgl-td-small');
        typecell.appendChild(document.createTextNode("buffer id : "));

        let valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode(String(this.model.get('uid'))));

        this.el.appendChild(content);
    }
  }
  