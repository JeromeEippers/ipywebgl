import {
    DOMWidgetModel,
    DOMWidgetView,
    ISerializers,
    unpack_models
  } from '@jupyter-widgets/base';
  
import { MODULE_NAME, MODULE_VERSION } from './version';

import { buffer_to_array } from './arraybuffer';

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

    handle_custom_messages(msg: any) {
        switch (msg.type) {
            case 'update':
              const gl:WebGL2RenderingContext = this.get('_glmodel').ctx;
              this.update_buffer(gl, msg.is_dynamic, buffer_to_array(msg.data));
              break;
        }
      }
    
    update_buffer(gl:WebGL2RenderingContext, is_dynamic:boolean, data:any){
      gl.bindBuffer(gl.ARRAY_BUFFER, this.get('_buffer'));
      gl.bufferData(gl.ARRAY_BUFFER, data, (is_dynamic) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    }
}
  
export class GLBufferView extends DOMWidgetView {

    render() {
        let maindiv = document.createElement('div');
        maindiv.appendChild(document.createTextNode("buffer uid : "+ String(this.model.get('uid'))));

      this.el.appendChild(maindiv);
    }
  }
  