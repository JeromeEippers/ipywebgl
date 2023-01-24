import {
    DOMWidgetModel,
    DOMWidgetView,
    ISerializers,
    unpack_models
  } from '@jupyter-widgets/base';
  
import { MODULE_NAME, MODULE_VERSION } from './version';

import { GLProgram } from './glprogram';
import { GLBuffer } from './glbuffer';

export class GLVertexArray extends DOMWidgetModel{
    defaults() {
      return {
        ...super.defaults(),
        _model_name: 'GLVertexArray',
        _model_module: MODULE_NAME,
        _model_module_version: MODULE_VERSION,
        _view_name: 'GLVertexArrayView',
        _view_module: MODULE_NAME,
        _view_module_version: MODULE_VERSION,
  
        _glmodel: null,
        _vao: null,
  
        uid: 0,
        message: '',
        attributes: [],
      };
    }

    static serializers: ISerializers = {
        ...DOMWidgetModel.serializers,
        _glmodel: { deserialize: unpack_models },
      };
    
    initialize(attributes: any, options: any) {
        super.initialize(attributes, options);

        this.get('_glmodel').register_vao(this);
        this.on('msg:custom', this.handle_custom_messages, this);

        const gl:WebGL2RenderingContext = this.get('_glmodel').ctx;
        let vao = gl.createVertexArray();
        if (vao == null){
          console.error('could not create a vertex array');
        }
        else{
          this.set('_vao', vao);
          this.save_changes();
        }
    }

    handle_custom_messages(msg: any) {
        switch (msg.type) {
            case 'bind':
              this.bind_buffer(msg.program, msg.buffers);
              break;
        }
    }
    
    bind_buffer(program_id:number, buffer_definitions:any){
      let ctx:WebGL2RenderingContext = this.get('_glmodel').ctx;
      ctx.bindVertexArray(this.get('_vao'));

      let program:GLProgram = this.get('_glmodel').get_program(program_id);
      let complete_attributes:any[] = [];

      buffer_definitions.forEach((definition:any)=>{
        let buffer:GLBuffer = this.get('_glmodel').get_buffer(definition.buffer);
        ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer.get('_buffer'));

        let attributes:any[] = [];
        let stride = 0;
        definition.attributes.forEach((element:any) => {
            let gltype = ctx.FLOAT;
            let comp_size = 4;
            switch(element.type){
                case 'i8':
                    gltype =ctx.BYTE;
                    comp_size = 1;
                break;
                case 'i16':
                    gltype =ctx.SHORT;
                    comp_size = 2;
                break;
                case 'i32':
                    gltype =ctx.INT;
                    comp_size = 4;
                break;
                case 'u8':
                    gltype =ctx.UNSIGNED_BYTE;
                    comp_size = 1;
                break;
                case 'u16':
                    gltype =ctx.UNSIGNED_SHORT;
                    comp_size = 2;
                break;
                case 'u32':
                    gltype =ctx.UNSIGNED_INT;
                    comp_size = 4;
                break;
                case 'f16':
                    gltype =ctx.HALF_FLOAT;
                    comp_size = 2;
                break;
                case 'f32':
                    gltype =ctx.FLOAT;
                    comp_size = 4;
                break;
                default:
                    console.error('un supported buffer type');
                    this.set("message", "unsupported type of buffer : "+element.type);
                    this.save_changes();
                    console.error("unsupported type of buffer : "+element.type);
                    ctx.bindVertexArray(null);
                    ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
                    return false;
            }
            attributes.push({name:element.attrib, gltype:gltype, type_name:element.type, count:element.count, offset:stride});
            stride += comp_size * element.count;
            
        });

        attributes.forEach((element:any)=>{
            const location = ctx.getAttribLocation(program.get("_program"), element.name);
            if (location==null || location<0){
                this.set("message", "unknown attribute in program : " + element.name);
                this.save_changes();
                console.error("unknown attribute in program : " + element.name);
                ctx.bindVertexArray(null);
                ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
                return false;
            }
            ctx.vertexAttribPointer(location, element.count, element.gltype, false, stride, element.offset);
            ctx.enableVertexAttribArray(location);
        });

        complete_attributes.push({buffer_id:definition.buffer, stride:stride, attributes:attributes});
      });
      this.set('message', 'linked to program id :'+String(program_id));
      this.set('attributes', complete_attributes);
      this.save_changes();

      ctx.bindVertexArray(null);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
      return true;
    }
}
  
export class GLVertexArrayView extends DOMWidgetView {

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
      typecell.appendChild(document.createTextNode("vertex array id : "));
      let valuecell = row.insertCell();
      valuecell.classList.add('ipwebgl-td');
      valuecell.appendChild(document.createTextNode(String(this.model.get('uid'))));

      row = tbody.insertRow();
      row.classList.add('ipwebgl-tr');
      typecell = row.insertCell();
      typecell.classList.add('ipwebgl-td');
      typecell.classList.add('ipwebgl-td-small');
      typecell.appendChild(document.createTextNode("message : "));
      valuecell = row.insertCell();
      valuecell.classList.add('ipwebgl-td');
      valuecell.appendChild(document.createTextNode(String(this.model.get('message'))));



      if(this.model.get('attributes').length > 0){

        div = document.createElement('div');
        content.appendChild(div);
        table = document.createElement('table');
        table.classList.add('ipwebgl-table');
        div.appendChild(table);

        row = table.createTHead().insertRow();
        row.classList.add('ipwebgl-th');
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode('Buffer id'));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode('Attribute'));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode('Size'));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode('Type'));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode('Stride'));
        valuecell = row.insertCell();
        valuecell.classList.add('ipwebgl-td');
        valuecell.appendChild(document.createTextNode('Offset'));

        tbody = table.createTBody();
        this.model.get('attributes').forEach((buffer:any)=>{
          buffer.attributes.forEach((attribute:any)=>{
            row = tbody.insertRow();
            row.classList.add('ipwebgl-tr');
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            valuecell.appendChild(document.createTextNode(buffer.buffer_id));
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            valuecell.appendChild(document.createTextNode(attribute.name));
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            valuecell.appendChild(document.createTextNode(attribute.count));
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            valuecell.appendChild(document.createTextNode(attribute.type_name));
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            valuecell.appendChild(document.createTextNode(buffer.stride));
            valuecell = row.insertCell();
            valuecell.classList.add('ipwebgl-td');
            valuecell.appendChild(document.createTextNode(attribute.offset));
            
          });
        });
      }

      this.el.appendChild(content);
    }
  }
  