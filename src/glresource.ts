import {
    DOMWidgetModel,
    DOMWidgetView,
    ISerializers,
    unpack_models
  } from '@jupyter-widgets/base';
  
import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';

export class GLResource extends DOMWidgetModel{
    defaults() {
      return {
        ...super.defaults(),
        _model_name: 'GLResource',
        _model_module: MODULE_NAME,
        _model_module_version: MODULE_VERSION,
        _view_name: 'GLResourceView',
        _view_module: MODULE_NAME,
        _view_module_version: MODULE_VERSION,
  
        _context: null,
        _gl_ptr:null,
        _info: {type:'not set'},
  
        uid: 0,
      };
    }

    static serializers: ISerializers = {
        ...DOMWidgetModel.serializers,
        _context: { deserialize: unpack_models },
      };
    
    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
        this.get('_context').register_resource(this);
    }
}
  
export class GLResourceView extends DOMWidgetView {

    render() {

      const root = this.el;
      const jsonDisplay = document.createElement("div");
      jsonDisplay.classList.add("ipywebgl-json-display");
  
      const jsonKey = document.createElement("div");
      jsonKey.classList.add("ipywebgl-json-key");
      jsonKey.textContent = "uid:";

      const jsonValue = document.createElement("div");
      jsonValue.classList.add("ipywebgl-json-value");
      jsonValue.textContent = this.model.get('uid');
      jsonDisplay.appendChild(jsonKey);
      jsonDisplay.appendChild(jsonValue);

      this.displayJson(this.model.get('_info'), jsonDisplay);
      root.appendChild(jsonDisplay);
    }

    displayJson(json:any, parent:any) {
      for (const key in json) {
        const jsonKey = document.createElement("div");
        jsonKey.classList.add("ipywebgl-json-key");
        jsonKey.textContent = `${key}:`;

        const jsonValue = document.createElement("div");
        jsonValue.classList.add("ipywebgl-json-value");

        if (typeof json[key] === "object") {
          const nestedJsonDisplay = document.createElement("div");
          nestedJsonDisplay.classList.add("ipywebgl-json-display");

          this.displayJson(json[key], nestedJsonDisplay);
          jsonValue.appendChild(nestedJsonDisplay);
        } else {
          jsonValue.textContent = json[key];
        }

        parent.appendChild(jsonKey);
        parent.appendChild(jsonValue);
      }
    }

    
}

  