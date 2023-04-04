define("ipywebgl",["@jupyter-widgets/base"],(e=>(()=>{var t={889:(e,t,r)=>{(t=r(352)(!1)).push([e.id,".ipywebgl-json-display {\r\n  padding: 10px;\r\n  font-family: sans-serif;\r\n  background-color: #f2f2f2;\r\n  margin-left: 20px;\r\n}\r\n\r\n.ipywebgl-json-key {\r\n  font-weight: bold;\r\n  color: #333;\r\n}\r\n\r\n.ipywebgl-json-value {\r\n  color: #555;\r\n}",""]),e.exports=t},352:e=>{"use strict";e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var r=function(e,t){var r,a,i,n=e[1]||"",s=e[3];if(!s)return n;if(t&&"function"==typeof btoa){var o=(r=s,a=btoa(unescape(encodeURIComponent(JSON.stringify(r)))),i="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(a),"/*# ".concat(i," */")),c=s.sources.map((function(e){return"/*# sourceURL=".concat(s.sourceRoot||"").concat(e," */")}));return[n].concat(c).concat([o]).join("\n")}return[n].join("\n")}(t,e);return t[2]?"@media ".concat(t[2]," {").concat(r,"}"):r})).join("")},t.i=function(e,r,a){"string"==typeof e&&(e=[[null,e,""]]);var i={};if(a)for(var n=0;n<this.length;n++){var s=this[n][0];null!=s&&(i[s]=!0)}for(var o=0;o<e.length;o++){var c=[].concat(e[o]);a&&i[c[0]]||(r&&(c[2]?c[2]="".concat(r," and ").concat(c[2]):c[2]=r),t.push(c))}},t}},204:(e,t,r)=>{var a=r(379),i=r(889);"string"==typeof(i=i.__esModule?i.default:i)&&(i=[[e.id,i,""]]);a(i,{insert:"head",singleton:!1}),e.exports=i.locals||{}},379:(e,t,r)=>{"use strict";var a,i=function(){var e={};return function(t){if(void 0===e[t]){var r=document.querySelector(t);if(window.HTMLIFrameElement&&r instanceof window.HTMLIFrameElement)try{r=r.contentDocument.head}catch(e){r=null}e[t]=r}return e[t]}}(),n=[];function s(e){for(var t=-1,r=0;r<n.length;r++)if(n[r].identifier===e){t=r;break}return t}function o(e,t){for(var r={},a=[],i=0;i<e.length;i++){var o=e[i],c=t.base?o[0]+t.base:o[0],u=r[c]||0,l="".concat(c," ").concat(u);r[c]=u+1;var d=s(l),f={css:o[1],media:o[2],sourceMap:o[3]};-1!==d?(n[d].references++,n[d].updater(f)):n.push({identifier:l,updater:h(f,t),references:1}),a.push(l)}return a}function c(e){var t=document.createElement("style"),a=e.attributes||{};if(void 0===a.nonce){var n=r.nc;n&&(a.nonce=n)}if(Object.keys(a).forEach((function(e){t.setAttribute(e,a[e])})),"function"==typeof e.insert)e.insert(t);else{var s=i(e.insert||"head");if(!s)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");s.appendChild(t)}return t}var u,l=(u=[],function(e,t){return u[e]=t,u.filter(Boolean).join("\n")});function d(e,t,r,a){var i=r?"":a.media?"@media ".concat(a.media," {").concat(a.css,"}"):a.css;if(e.styleSheet)e.styleSheet.cssText=l(t,i);else{var n=document.createTextNode(i),s=e.childNodes;s[t]&&e.removeChild(s[t]),s.length?e.insertBefore(n,s[t]):e.appendChild(n)}}function f(e,t,r){var a=r.css,i=r.media,n=r.sourceMap;if(i?e.setAttribute("media",i):e.removeAttribute("media"),n&&"undefined"!=typeof btoa&&(a+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(n))))," */")),e.styleSheet)e.styleSheet.cssText=a;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(a))}}var m=null,_=0;function h(e,t){var r,a,i;if(t.singleton){var n=_++;r=m||(m=c(t)),a=d.bind(null,r,n,!1),i=d.bind(null,r,n,!0)}else r=c(t),a=f.bind(null,r,t),i=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(r)};return a(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;a(e=t)}else i()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=(void 0===a&&(a=Boolean(window&&document&&document.all&&!window.atob)),a));var r=o(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var a=0;a<r.length;a++){var i=s(r[a]);n[i].references--}for(var c=o(e,t),u=0;u<r.length;u++){var l=s(r[u]);0===n[l].references&&(n[l].updater(),n.splice(l,1))}r=c}}}},210:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.buffer_to_array=void 0,t.buffer_to_array=function(e,t){switch(e){case"int8":return new Int8Array(t);case"uint8":return new Uint8Array(t);case"int16":return new Int16Array(t);case"uint16":return new Uint16Array(t);case"int32":return new Int32Array(t);case"uint32":return new Uint32Array(t);case"float32":return new Float32Array(t);case"float64":return new Float64Array(t);default:throw"Unknown dtype "+e}}},498:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.GLResourceView=t.GLResource=void 0;const a=r(146),i=r(412);r(204);class n extends a.DOMWidgetModel{defaults(){return Object.assign(Object.assign({},super.defaults()),{_model_name:"GLResource",_model_module:i.MODULE_NAME,_model_module_version:i.MODULE_VERSION,_view_name:"GLResourceView",_view_module:i.MODULE_NAME,_view_module_version:i.MODULE_VERSION,_context:null,_gl_ptr:null,_info:{type:"not set"},uid:0})}initialize(e,t){super.initialize(e,t),this.get("_context").register_resource(this)}}t.GLResource=n,n.serializers=Object.assign(Object.assign({},a.DOMWidgetModel.serializers),{_context:{deserialize:a.unpack_models}});class s extends a.DOMWidgetView{render(){const e=this.el,t=document.createElement("div");t.classList.add("ipywebgl-json-display");const r=document.createElement("div");r.classList.add("ipywebgl-json-key"),r.textContent="uid:";const a=document.createElement("div");a.classList.add("ipywebgl-json-value"),a.textContent=this.model.get("uid"),t.appendChild(r),t.appendChild(a),this.displayJson(this.model.get("_info"),t),e.appendChild(t)}displayJson(e,t){for(const r in e){const a=document.createElement("div");a.classList.add("ipywebgl-json-key"),a.textContent=`${r}:`;const i=document.createElement("div");if(i.classList.add("ipywebgl-json-value"),"object"==typeof e[r]){const t=document.createElement("div");t.classList.add("ipywebgl-json-display"),this.displayJson(e[r],t),i.appendChild(t)}else i.textContent=e[r];t.appendChild(a),t.appendChild(i)}}}t.GLResourceView=s},625:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.GLViewer=t.GLModel=void 0;const a=r(146),i=r(412),n=r(799),s=r(210);class o extends a.DOMWidgetModel{constructor(){super(...arguments),this.resources=[],this.bound_buffers={},this.commands=[],this.buffers=[]}defaults(){return Object.assign(Object.assign({},super.defaults()),{_model_name:"GLModel",_model_module:i.MODULE_NAME,_model_module_version:i.MODULE_VERSION,_view_name:"GLViewer",_view_module:i.MODULE_NAME,_view_module_version:i.MODULE_VERSION,shader_matrix_major:"row_major",width:700,height:500,camera_pos:[0,50,200],camera_yaw:0,camera_pitch:0,mouse_speed:1,move_speed:1,move_keys:"wasd"})}initialize(e,t){if(super.initialize(e,t),this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("webgl2",{preserveDrawingBuffer:!0}),null==this.ctx)console.error("could not create a webgl2 context, this is not supported in your browser");else{const e=this.ctx;this.view_block=e.createBuffer(),e.bindBuffer(e.UNIFORM_BUFFER,this.view_block),e.bufferData(e.UNIFORM_BUFFER,256,e.DYNAMIC_DRAW),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,0,this.view_block),e.getExtension("EXT_color_buffer_float")}this.resizeCanvas(),this.on_some_change(["width","height"],this.resizeCanvas,this),this.on_some_change(["camera_pos","camera_yaw","camera_pitch"],this.run_commands,this),this.on("msg:custom",this.handle_custom_messages,this),this.camera_matrix=n.m4Translation(0,50,200),this.view_matrix=n.m4inverse(this.camera_matrix)}resizeCanvas(){this.canvas.setAttribute("width",this.get("width")),this.canvas.setAttribute("height",this.get("height")),null!=this.ctx&&this.ctx.viewport(0,0,this.ctx.canvas.width,this.ctx.canvas.height),this.projection_matrix=n.m4ProjectionMatrix(50,this.get("width")/this.get("height"),1,5e3)}handle_custom_messages(e,t){1==e.clear&&(this.commands=[],this.buffers=[]);let r=e.commands,a=[];if(r.forEach((e=>{if(e.hasOwnProperty("buffer_metadata")){const r=s.buffer_to_array(e.buffer_metadata.dtype,t[e.buffer_metadata.index].buffer);a.push(r)}})),1==e.only_once)this.execute_commands(r,a);else{let e=this.buffers.length;this.buffers=this.buffers.concat(a),r.forEach((t=>{t.hasOwnProperty("buffer_metadata")&&(t.buffer_metadata.index+=e)})),this.commands=this.commands.concat(r)}this.run_commands()}update_camera(){let e=this.get("camera_pos"),t=this.get("camera_yaw")*Math.PI/180,r=this.get("camera_pitch")*Math.PI/180;this.camera_matrix=n.m4Translation(e[0],e[1],e[2]),this.camera_matrix=n.m4dot(this.camera_matrix,n.m4Yrotation(t)),this.camera_matrix=n.m4dot(this.camera_matrix,n.m4Xrotation(r)),this.view_matrix=n.m4inverse(this.camera_matrix),this.view_proj_matrix=n.m4dot(this.projection_matrix,this.view_matrix)}run_commands(){this.execute_commands(this.commands,this.buffers)}execute_commands(e,t){if(null==this.ctx)return;const r=this.ctx;this.update_camera();let a="row_major"==this.get("shader_matrix_major")?n.m4Transpose(this.camera_matrix):this.camera_matrix;const i=new Float32Array(a);let s="row_major"==this.get("shader_matrix_major")?n.m4Transpose(this.view_matrix):this.view_matrix;const o=new Float32Array(s);let c="row_major"==this.get("shader_matrix_major")?n.m4Transpose(this.projection_matrix):this.projection_matrix;const u=new Float32Array(c);let l="row_major"==this.get("shader_matrix_major")?n.m4Transpose(this.view_proj_matrix):this.view_proj_matrix;const d=new Float32Array(l);r.bindBuffer(r.UNIFORM_BUFFER,this.view_block),r.bufferSubData(r.UNIFORM_BUFFER,0,i,0),r.bufferSubData(r.UNIFORM_BUFFER,64,o,0),r.bufferSubData(r.UNIFORM_BUFFER,128,u,0),r.bufferSubData(r.UNIFORM_BUFFER,192,d,0),r.bindBuffer(r.UNIFORM_BUFFER,null),e.forEach((e=>{this.execute_command(r,e,t)}))}glEnumToString(e,t){const r=[];for(const a in e)e[a]===t&&r.push(a);return r.length?r.join(" | "):`0x${t.toString(16)}`}execute_command(e,t,r){switch(t.cmd){case"viewport":e.viewport(t.x,t.y,t.width,t.height);break;case"enable":case"disable":{let r=0;t.blend&&(r|=e.BLEND),t.depth_test&&(r|=e.DEPTH_TEST),t.dither&&(r|=e.DITHER),t.polygon_offset_fill&&(r|=e.POLYGON_OFFSET_FILL),t.sample_alpha_to_coverage&&(r|=e.SAMPLE_ALPHA_TO_COVERAGE),t.sample_coverage&&(r|=e.SAMPLE_COVERAGE),t.scissor_test&&(r|=e.SCISSOR_TEST),t.stencil_test&&(r|=e.STENCIL_TEST),t.rasterizer_discard&&(r|=e.RASTERIZER_DISCARD),t.cull_face&&(r|=e.CULL_FACE),"enable"==t.cmd?e.enable(r):e.disable(r)}break;case"clearColor":e.clearColor(t.r,t.g,t.b,t.a);break;case"clear":{let r=0;t.depth&&(r|=e.DEPTH_BUFFER_BIT),t.color&&(r|=e.COLOR_BUFFER_BIT),t.stencil&&(r|=e.STENCIL_BUFFER_BIT),e.clear(r)}break;case"frontFace":e.frontFace(e[t.mode]);break;case"cullFace":e.cullFace(e[t.mode]);break;case"depthFunc":e.depthFunc(e[t.func]);break;case"depthMask":e.depthMask(t.flag);break;case"depthRange":e.depthRange(t.z_near,t.z_far);break;case"blendColor":e.blendColor(t.r,t.g,t.b,t.a);break;case"blendEquation":e.blendEquation(e[t.mode]);break;case"blendEquationSeparate":e.blendEquationSeparate(e[t.mode_rgb],e[t.mode_alpha]);break;case"blendFunc":e.blendFunc(e[t.s_factor],e[t.d_factor]);break;case"blend_func_separate":e.blendFuncSeparate(e[t.src_rgb],e[t.dst_rgb],e[t.src_alpha],e[t.dst_alpha]);break;case"createTexture":{let r=this.get_resource(t.resource);const a=e.createTexture();r.set("_gl_ptr",a),r.set("_info",{type:"texture"}),r.save_changes()}break;case"bindTexture":if(t.texture>-1){const r=this.get_resource(t.texture).get("_gl_ptr");e.bindTexture(e[t.target],r)}else e.bindTexture(e[t.target],null);break;case"activeTexture":e.activeTexture(e.TEXTURE0+t.texture);break;case"generateMipmap":e.generateMipmap(e[t.target]);break;case"texImage2D":t.hasOwnProperty("buffer_metadata")?e.texImage2D(e[t.target],t.level,e[t.internal_format],t.width,t.height,t.border,e[t.format],e[t.data_type],r[t.buffer_metadata.index]):e.texImage2D(e[t.target],t.level,e[t.internal_format],t.width,t.height,t.border,e[t.format],e[t.data_type],null);break;case"texStorage2D":e.texStorage2D(e[t.target],t.levels,e[t.internal_format],t.width,t.height);break;case"texImage3D":t.hasOwnProperty("buffer_metadata")?e.texImage3D(e[t.target],t.level,e[t.internal_format],t.width,t.height,t.depth,t.border,e[t.format],e[t.data_type],r[t.buffer_metadata.index]):e.texImage3D(e[t.target],t.level,e[t.internal_format],t.width,t.height,t.depth,t.border,e[t.format],e[t.data_type],null);break;case"texStorage3D":e.texStorage3D(e[t.target],t.levels,e[t.internal_format],t.width,t.height,t.depth);break;case"texParameteri":e.texParameteri(e[t.target],e[t.pname],t.param);break;case"texParameterf":e.texParameterf(e[t.target],e[t.pname],t.param);break;case"texParameter_str":e.texParameteri(e[t.target],e[t.pname],e[t.param]);break;case"pixelStorei":"UNPACK_COLORSPACE_CONVERSION_WEBGL"==t.pname?e.pixelStorei(e[t.pname],e[t.param]):e.pixelStorei(e[t.pname],t.param);break;case"createShader":{let r=this.get_resource(t.resource);const a=e.createShader(e[t.type]);r.set("_gl_ptr",a),r.set("_info",{type:t.type}),r.save_changes()}break;case"shaderSource":{const r=this.get_resource(t.shader).get("_gl_ptr");e.shaderSource(r,t.source)}break;case"compileShader":{const r=this.get_resource(t.shader),a=r.get("_gl_ptr");e.compileShader(a);let i=r.get("_info");if(e.getShaderParameter(a,e.COMPILE_STATUS))i.message="compiled";else{let t=e.getShaderInfoLog(a);i.message=t}r.set("_info",i),r.save_changes()}break;case"createProgram":{let r=this.get_resource(t.resource);const a=e.createProgram();r.set("_gl_ptr",a),r.set("_info",{type:"Program"}),r.save_changes()}break;case"attachShader":{const r=this.get_resource(t.program).get("_gl_ptr"),a=this.get_resource(t.shader).get("_gl_ptr");e.attachShader(r,a)}break;case"bindAttribLocation":{const r=this.get_resource(t.program).get("_gl_ptr");e.bindAttribLocation(r,t.index,t.name)}break;case"linkProgram":{let r=this.get_resource(t.program);const a=r.get("_gl_ptr");e.linkProgram(a),e.validateProgram(a);let i=r.get("_info");if(e.getProgramParameter(a,e.LINK_STATUS)){let t=e.getUniformBlockIndex(a,"ViewBlock");t<4294967295&&e.uniformBlockBinding(a,t,0),i.message="linked",i.uniforms_blocks=[],i.uniforms=[];const r=e.getProgramParameter(a,e.ACTIVE_UNIFORMS),n=[...Array(r).keys()],s=e.getActiveUniforms(a,n,e.UNIFORM_BLOCK_INDEX),o=e.getActiveUniforms(a,n,e.UNIFORM_OFFSET);for(let t=0;t<r;++t){const r=e.getActiveUniform(a,t);if(r)if(s[t]>-1){let n=i.uniforms_blocks.find((e=>e.index==s[t]));null==n&&(n={index:s[t],name:e.getActiveUniformBlockName(a,s[t]),size:e.getActiveUniformBlockParameter(a,s[t],e.UNIFORM_BLOCK_DATA_SIZE),uniforms:[]},i.uniforms_blocks.push(n)),n.uniforms.push({name:r.name,type:this.glEnumToString(e,r.type),size:r.size,offset:o[t]})}else i.uniforms.push({name:r.name,type:this.glEnumToString(e,r.type),size:r.size,location:e.getUniformLocation(a,r.name)})}i.attributes=[];const c=e.getProgramParameter(a,e.ACTIVE_ATTRIBUTES);for(let t=0;t<c;++t){const r=e.getActiveAttrib(a,t);r&&i.attributes.push({name:r.name,type:this.glEnumToString(e,r.type),size:r.size,location:e.getAttribLocation(a,r.name)})}}else{let t=e.getShaderInfoLog(a);i.message=t}r.set("_info",i),r.save_changes()}break;case"useProgram":if(t.program>=0){const r=this.get_resource(t.program),a=r.get("_gl_ptr");e.useProgram(a),this.bound_program=r}else e.useProgram(null),this.bound_program=null;break;case"uniform":case"uniformMatrix":if(null!=this.bound_program){const a=this.bound_program.get("_info").uniforms.find((e=>e.name==t.name));if(null!=a){const i=a.location;if("uniform"==t.cmd){let a=t.buffer_metadata.shape[t.buffer_metadata.shape.length-1];if("int32"==t.buffer_metadata.dtype){let n=r[t.buffer_metadata.index];1==a?e.uniform1iv(i,n):2==a?e.uniform2iv(i,n):3==a?e.uniform3iv(i,n):4==a&&e.uniform4iv(i,n)}else if("uint32"==t.buffer_metadata.dtype){let n=r[t.buffer_metadata.index];1==a?e.uniform1uiv(i,n):2==a?e.uniform2uiv(i,n):3==a?e.uniform3uiv(i,n):4==a&&e.uniform4uiv(i,n)}else if("float32"==t.buffer_metadata.dtype){let n=r[t.buffer_metadata.index];1==a?e.uniform1fv(i,n):2==a?e.uniform2fv(i,n):3==a?e.uniform3fv(i,n):4==a&&e.uniform4fv(i,n)}}else{let a=t.buffer_metadata.shape[t.buffer_metadata.shape.length-2],n=t.buffer_metadata.shape[t.buffer_metadata.shape.length-1],s=r[t.buffer_metadata.index];2==a?2==n?e.uniformMatrix2fv(i,!1,s):3==n?e.uniformMatrix2x3fv(i,!1,s):4==n&&e.uniformMatrix2x4fv(i,!1,s):3==a?2==n?e.uniformMatrix3x2fv(i,!1,s):3==n?e.uniformMatrix3fv(i,!1,s):4==n&&e.uniformMatrix3x4fv(i,!1,s):4==a&&(2==n?e.uniformMatrix4x2fv(i,!1,s):3==n?e.uniformMatrix4x3fv(i,!1,s):4==n&&e.uniformMatrix4fv(i,!1,s))}}}break;case"uniformBlockBinding":{let r=this.get_resource(t.program);const a=r.get("_gl_ptr"),i=r.get("_info").uniforms_blocks.find((e=>e.name==t.uniform_block_name));null!=i&&e.uniformBlockBinding(a,i.index,t.uniform_block_binding)}break;case"createBuffer":{let r=this.get_resource(t.resource);const a=e.createBuffer();r.set("_gl_ptr",a),r.set("_info",{type:"Buffer"}),r.save_changes()}break;case"bindBuffer":{const r=t.target;if(t.buffer>=0){const a=this.get_resource(t.buffer),i=a.get("_gl_ptr");e.bindBuffer(e[r],i),this.bound_buffers[r]=a}else e.bindBuffer(e[r],null),this.bound_buffers[r]=null}break;case"bindBufferBase":{const r=t.target;if(t.buffer>=0){const a=this.get_resource(t.buffer).get("_gl_ptr");e.bindBufferBase(e[r],t.index,a)}else e.bindBufferBase(e[r],t.index,null)}break;case"bufferData":{const a=t.target,i=t.usage;if(t.hasOwnProperty("buffer_metadata")){e.bufferData(e[a],r[t.buffer_metadata.index],e[i]);let n=this.bound_buffers[a];if(t.update_info&&null!=n){const t=e.getBufferParameter(e[a],e.BUFFER_SIZE);n.set("_info",{type:"Buffer",size:t,target:a}),n.save_changes()}}else{let r=this.bound_buffers[a];e.bufferData(e[a],null,e[i]),t.update_info&&null!=r&&(r.set("_info",{type:"Buffer",size:"Undefined",target:a}),r.save_changes())}}break;case"createUniformBuffer":{let r=this.get_resource(t.buffer);const a=e.createBuffer();let i={type:"Buffer"};const n=this.get_resource(t.program).get("_info").uniforms_blocks.find((e=>e.name==t.block_name));null!=n&&(e.bindBuffer(e.UNIFORM_BUFFER,a),e.bufferData(e.UNIFORM_BUFFER,n.size,e[t.usage]),e.bindBuffer(e.UNIFORM_BUFFER,null),this.bound_buffers.UNIFORM_BUFFER=null,i.size=n.size,i.target="UNIFORM_BUFFER",i.uniformblock=n),r.set("_gl_ptr",a),r.set("_info",i),r.save_changes()}break;case"bufferSubData":case"bufferSubDataStr":{const a=t.target;let i=t.dst_byte_offset;if("bufferSubDataStr"==t.cmd){i=0;let e=this.bound_buffers[a];if(null!=e){const r=e.get("_info").uniformblock.uniforms.find((e=>e.name==t.dst_byte_offset));null!=r&&(i=r.offset)}}t.hasOwnProperty("buffer_metadata")?e.bufferSubData(e[a],i,r[t.buffer_metadata.index],t.src_offset):e.bufferSubData(e[a],i,t.src_offset)}break;case"createVertexArray":{let r=this.get_resource(t.resource);const a=e.createVertexArray();r.set("_gl_ptr",a),r.set("_info",{type:"Vertex Array Object",bindings:[]}),r.save_changes()}break;case"bindVertexArray":if(t.vertex_array>=0){const r=this.get_resource(t.vertex_array),a=r.get("_gl_ptr");e.bindVertexArray(a),this.bound_vao=r}else e.bindVertexArray(null),this.bound_vao=null;break;case"vertexAttribPointer":case"vertexAttribIPointer":case"enableVertexAttribArray":case"disableVertexAttribArray":case"vertexAttrib[1234]fv":case"vertexAttribI4[u]iv":{let a=-1;if("number"==typeof t.index)a=t.index;else if(null!=this.bound_program){const e=this.bound_program.get("_info").attributes.find((e=>e.name==t.index));null!=e&&(a=e.location)}else console.error("a program must be bound to find the attribute");let i=this.bound_buffers.ARRAY_BUFFER;if(a>=0)if("vertexAttribIPointer"==t.cmd){if(e.vertexAttribIPointer(a,t.size,e[t.type],t.stride,t.offset),null!=this.bound_vao&&null!=i){let e=this.bound_vao.get("_info");const r=i.get("uid");let n=e.bindings.find((e=>e.buffer_uid==r));null==n&&(n={buffer_uid:r,attributes:[]},e.bindings.push(n)),n.attributes.push({pointer:"vertexAttribIPointer",index:a,size:t.size,type:t.type,stride:t.stride,offset:t.offset}),this.bound_vao.set("_info",e),this.bound_vao.save_changes()}}else if("vertexAttribPointer"==t.cmd){if(e.vertexAttribPointer(a,t.size,e[t.type],t.normalized,t.stride,t.offset),null!=this.bound_vao&&null!=i){let e=this.bound_vao.get("_info");const r=i.get("uid");let n=e.bindings.find((e=>e.buffer_uid==r));null==n&&(n={buffer_uid:r,attributes:[]},e.bindings.push(n)),n.attributes.push({pointer:"vertexAttribPointer",index:a,size:t.size,type:t.type,normalized:t.normalized,stride:t.stride,offset:t.offset}),this.bound_vao.set("_info",e),this.bound_vao.save_changes()}}else"enableVertexAttribArray"==t.cmd?e.enableVertexAttribArray(a):"disableVertexAttribArray"==t.cmd?e.disableVertexAttribArray(a):"vertexAttrib[1234]fv"==t.cmd?(1==t.buffer_metadata.shape[0]?e.vertexAttrib1fv(a,r[t.buffer_metadata.index]):2==t.buffer_metadata.shape[0]&&e.vertexAttrib2fv(a,r[t.buffer_metadata.index]),3==t.buffer_metadata.shape[0]&&e.vertexAttrib3fv(a,r[t.buffer_metadata.index]),4==t.buffer_metadata.shape[0]&&e.vertexAttrib4fv(a,r[t.buffer_metadata.index])):"vertexAttribI4[u]iv"==t.cmd&&("uint32"==t.buffer_metadata.dtype?e.vertexAttribI4uiv(a,r[t.buffer_metadata.index]):"int32"==t.buffer_metadata.dtype&&e.vertexAttribI4iv(a,r[t.buffer_metadata.index]));else console.error(`attribute ${t.index} location not found`)}break;case"drawArrays":e.drawArrays(e[t.mode],t.first,t.count);break;case"drawArraysInstanced":e.drawArraysInstanced(e[t.mode],t.first,t.count,t.instance_count);break;case"drawElements":e.drawElements(e[t.mode],t.count,e[t.type],t.offset);break;case"drawElementsInstanced":e.drawElementsInstanced(e[t.mode],t.count,e[t.type],t.offset,t.instance_count);break;case"createFramebuffer":{let r=this.get_resource(t.resource);const a=e.createFramebuffer();r.set("_gl_ptr",a),r.set("_info",{type:"Framebuffer"}),r.save_changes()}break;case"bindFramebuffer":if(t.framebuffer>=0){let r=this.get_resource(t.framebuffer);e.bindFramebuffer(e[t.target],r.get("_gl_ptr"))}else e.bindFramebuffer(e[t.target],null);break;case"framebufferTexture2D":{let r=this.get_resource(t.texture);e.framebufferTexture2D(e[t.target],e[t.attachement],e[t.textarget],r.get("_gl_ptr"),t.level)}break;case"drawBuffers":{const r=t.buffers.map((t=>e[t]));e.drawBuffers(r)}}}register_resource(e){e.get("uid")!=this.resources.length&&console.error("uid not matching what we have internally"),this.resources.push(e)}get_resource(e){return this.resources[e]}}t.GLModel=o,o.serializers=Object.assign({},a.DOMWidgetModel.serializers);class c extends a.DOMWidgetView{constructor(){super(...arguments),this.is_mouse_down=!1,this.move_direction=[!1,!1,!1,!1],this.will_redraw=!1}render(){this.el.appendChild(this.model.canvas),this.resizeCanvas(),this.model.on_some_change(["width","height"],this.resizeCanvas,this),this.el.addEventListener("mousemove",{handleEvent:this.onMouseMove.bind(this)}),this.el.addEventListener("mousedown",{handleEvent:this.onMouseDown.bind(this)}),this.el.addEventListener("mouseup",{handleEvent:this.onMouseUp.bind(this)}),this.el.addEventListener("mouseout",{handleEvent:this.onMouseOut.bind(this)}),this.el.addEventListener("keydown",{handleEvent:this.onKeyDown.bind(this)}),this.el.addEventListener("keyup",{handleEvent:this.onKeyUp.bind(this)}),this.el.setAttribute("tabindex","0")}resizeCanvas(){this.el.setAttribute("width",this.model.get("width")),this.el.setAttribute("height",this.model.get("height")),this.model.resizeCanvas()}redraw(){if(this.will_redraw=!1,this.move_direction[0]||this.move_direction[1]||this.move_direction[2]||this.move_direction[3]){let e=this.model.get("move_speed"),t=n.m4getColumnK(this.model.camera_matrix),r=n.m4getColumnI(this.model.camera_matrix),a=this.model.get("camera_pos");this.move_direction[0]&&(a=n.vec3Add(a,n.vec3Scale(t,-e))),this.move_direction[2]&&(a=n.vec3Add(a,n.vec3Scale(t,e))),this.move_direction[1]&&(a=n.vec3Add(a,n.vec3Scale(r,-e))),this.move_direction[3]&&(a=n.vec3Add(a,n.vec3Scale(r,e))),this.model.set("camera_pos",a),this.touch(),this.requestRedraw()}this.model.run_commands()}requestRedraw(){0==this.will_redraw&&(this.will_redraw=!0,requestAnimationFrame(this.redraw.bind(this)))}onMouseMove(e){if(this.is_mouse_down){let t=this.model.get("mouse_speed");this.model.set("camera_yaw",this.model.get("camera_yaw")-.2*e.movementX*t),this.model.set("camera_pitch",this.model.get("camera_pitch")-.2*e.movementY*t),this.touch(),this.requestRedraw()}}onMouseDown(e){this.is_mouse_down=!0,this.model.canvas.focus()}onMouseUp(e){this.is_mouse_down=!1}onMouseOut(e){this.is_mouse_down=!1,this.move_direction=[!1,!1,!1,!1]}onKeyDown(e){e.preventDefault(),e.stopPropagation();let t=this.model.get("move_keys");0==e.repeat&&(e.key==t[0]?(this.move_direction[0]=!0,this.requestRedraw()):e.key==t[1]?(this.move_direction[1]=!0,this.requestRedraw()):e.key==t[2]?(this.move_direction[2]=!0,this.requestRedraw()):e.key==t[3]&&(this.move_direction[3]=!0,this.requestRedraw()))}onKeyUp(e){e.preventDefault(),e.stopPropagation();let t=this.model.get("move_keys");e.key==t[0]?this.move_direction[0]=!1:e.key==t[1]?this.move_direction[1]=!1:e.key==t[2]?this.move_direction[2]=!1:e.key==t[3]&&(this.move_direction[3]=!1)}getCoordinates(e){const t=this.el.getBoundingClientRect();return{x:this.model.get("width")*(e.clientX-t.left)/t.width,y:this.model.get("height")*(e.clientY-t.top)/t.height}}}t.GLViewer=c},607:function(e,t,r){"use strict";var a=this&&this.__createBinding||(Object.create?function(e,t,r,a){void 0===a&&(a=r),Object.defineProperty(e,a,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,a){void 0===a&&(a=r),e[a]=t[r]}),i=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||a(t,e,r)};Object.defineProperty(t,"__esModule",{value:!0}),i(r(412),t),i(r(360),t)},799:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.m4inverse=t.m4dot=t.m4Scale=t.m4Zrotation=t.m4Yrotation=t.m4Xrotation=t.m4Translation=t.vec3Scale=t.vec3Add=t.m4getColumnK=t.m4getColumnJ=t.m4getColumnI=t.m4getTranslation=t.m4Transpose=t.m4OrthographicProjectionMatrix=t.m4ProjectionMatrix=void 0,t.m4ProjectionMatrix=function(e,t,r,a){const i=r*Math.tan(e*Math.PI/360),n=i*t;return function(e,t,r,a,i,n){return[2*i/(t-e),0,(t+e)/(t-e),0,0,2*i/(a-r),(a+r)/(a-r),0,0,0,-(n+i)/(n-i),-2*n*i/(n-i),0,0,-1,0]}(-n,n,-i,i,r,a)},t.m4OrthographicProjectionMatrix=function(e,t,r,a){return[1/e,0,0,0,0,1/t,0,0,0,0,-2/(a-r),-(a+r)/(a-r),0,0,0,1]},t.m4Transpose=function(e){return[e[0],e[4],e[8],e[12],e[1],e[5],e[9],e[13],e[2],e[6],e[10],e[14],e[3],e[7],e[11],e[15]]},t.m4getTranslation=function(e){return[e[3],e[7],e[11]]},t.m4getColumnI=function(e){return[e[0],e[4],e[8]]},t.m4getColumnJ=function(e){return[e[1],e[5],e[9]]},t.m4getColumnK=function(e){return[e[2],e[6],e[10]]},t.vec3Add=function(e,t){return[e[0]+t[0],e[1]+t[1],e[2]+t[2]]},t.vec3Scale=function(e,t){return[e[0]*t,e[1]*t,e[2]*t]},t.m4Translation=function(e,t,r){return[1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1]},t.m4Xrotation=function(e){var t=Math.cos(e),r=Math.sin(e);return[1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1]},t.m4Yrotation=function(e){var t=Math.cos(e),r=Math.sin(e);return[t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1]},t.m4Zrotation=function(e){var t=Math.cos(e),r=Math.sin(e);return[t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1]},t.m4Scale=function(e,t,r){return[e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1]},t.m4dot=function(e,t){return[e[0]*t[0]+e[1]*t[4]+e[2]*t[8]+e[3]*t[12],e[0]*t[1]+e[1]*t[5]+e[2]*t[9]+e[3]*t[13],e[0]*t[2]+e[1]*t[6]+e[2]*t[10]+e[3]*t[14],e[0]*t[3]+e[1]*t[7]+e[2]*t[11]+e[3]*t[15],e[4]*t[0]+e[5]*t[4]+e[6]*t[8]+e[7]*t[12],e[4]*t[1]+e[5]*t[5]+e[6]*t[9]+e[7]*t[13],e[4]*t[2]+e[5]*t[6]+e[6]*t[10]+e[7]*t[14],e[4]*t[3]+e[5]*t[7]+e[6]*t[11]+e[7]*t[15],e[8]*t[0]+e[9]*t[4]+e[10]*t[8]+e[11]*t[12],e[8]*t[1]+e[9]*t[5]+e[10]*t[9]+e[11]*t[13],e[8]*t[2]+e[9]*t[6]+e[10]*t[10]+e[11]*t[14],e[8]*t[3]+e[9]*t[7]+e[10]*t[11]+e[11]*t[15],e[12]*t[0]+e[13]*t[4]+e[14]*t[8]+e[15]*t[12],e[12]*t[1]+e[13]*t[5]+e[14]*t[9]+e[15]*t[13],e[12]*t[2]+e[13]*t[6]+e[14]*t[10]+e[15]*t[14],e[12]*t[3]+e[13]*t[7]+e[14]*t[11]+e[15]*t[15]]},t.m4inverse=function(e){var t=e[10]*e[15],r=e[14]*e[11],a=e[6]*e[15],i=e[14]*e[7],n=e[6]*e[11],s=e[10]*e[7],o=e[2]*e[15],c=e[14]*e[3],u=e[2]*e[11],l=e[10]*e[3],d=e[2]*e[7],f=e[6]*e[3],m=e[8]*e[13],_=e[12]*e[9],h=e[4]*e[13],b=e[12]*e[5],p=e[4]*e[9],g=e[8]*e[5],v=e[0]*e[13],x=e[12]*e[1],y=e[0]*e[9],w=e[8]*e[1],E=e[0]*e[5],k=e[4]*e[1],M=t*e[5]+i*e[9]+n*e[13]-(r*e[5]+a*e[9]+s*e[13]),A=r*e[1]+o*e[9]+l*e[13]-(t*e[1]+c*e[9]+u*e[13]),O=a*e[1]+c*e[5]+d*e[13]-(i*e[1]+o*e[5]+f*e[13]),F=s*e[1]+u*e[5]+f*e[9]-(n*e[1]+l*e[5]+d*e[9]),S=1/(e[0]*M+e[4]*A+e[8]*O+e[12]*F);return[S*M,S*A,S*O,S*F,S*(r*e[4]+a*e[8]+s*e[12]-(t*e[4]+i*e[8]+n*e[12])),S*(t*e[0]+c*e[8]+u*e[12]-(r*e[0]+o*e[8]+l*e[12])),S*(i*e[0]+o*e[4]+f*e[12]-(a*e[0]+c*e[4]+d*e[12])),S*(n*e[0]+l*e[4]+d*e[8]-(s*e[0]+u*e[4]+f*e[8])),S*(m*e[7]+b*e[11]+p*e[15]-(_*e[7]+h*e[11]+g*e[15])),S*(_*e[3]+v*e[11]+w*e[15]-(m*e[3]+x*e[11]+y*e[15])),S*(h*e[3]+x*e[7]+E*e[15]-(b*e[3]+v*e[7]+k*e[15])),S*(g*e[3]+y*e[7]+k*e[11]-(p*e[3]+w*e[7]+E*e[11])),S*(h*e[10]+g*e[14]+_*e[6]-(p*e[14]+m*e[6]+b*e[10])),S*(y*e[14]+m*e[2]+x*e[10]-(v*e[10]+w*e[14]+_*e[2])),S*(v*e[6]+k*e[14]+b*e[2]-(E*e[14]+h*e[2]+x*e[6])),S*(E*e[10]+p*e[2]+w*e[6]-(y*e[6]+k*e[10]+g*e[2]))]}},412:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.MODULE_NAME=t.MODULE_VERSION=void 0;const a=r(147);t.MODULE_VERSION=a.version,t.MODULE_NAME=a.name},360:function(e,t,r){"use strict";var a=this&&this.__createBinding||(Object.create?function(e,t,r,a){void 0===a&&(a=r),Object.defineProperty(e,a,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,a){void 0===a&&(a=r),e[a]=t[r]}),i=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||a(t,e,r)};Object.defineProperty(t,"__esModule",{value:!0}),i(r(625),t),i(r(498),t)},146:t=>{"use strict";t.exports=e},147:e=>{"use strict";e.exports=JSON.parse('{"name":"ipywebgl","version":"0.1.0","description":"A Custom Jupyter Widget Library","keywords":["jupyter","jupyterlab","jupyterlab-extension","widgets"],"files":["lib/**/*.js","dist/*.js","css/*.css"],"homepage":"https://github.com/JeromeEippers/ipywebgl","bugs":{"url":"https://github.com/JeromeEippers/ipywebgl/issues"},"license":"BSD-3-Clause","author":{"name":"Jerome Eippers","email":"jerome@eippers.be"},"main":"lib/index.js","types":"./lib/index.d.ts","repository":{"type":"git","url":"https://github.com/JeromeEippers/ipywebgl"},"scripts":{"build":"yarn run build:lib && yarn run build:nbextension && yarn run build:labextension:dev","build:prod":"yarn run build:lib && yarn run build:nbextension && yarn run build:labextension","build:labextension":"jupyter labextension build .","build:labextension:dev":"jupyter labextension build --development True .","build:lib":"tsc","build:nbextension":"webpack","clean":"yarn run clean:lib && yarn run clean:nbextension && yarn run clean:labextension","clean:lib":"rimraf lib","clean:labextension":"rimraf ipywebgl/labextension","clean:nbextension":"rimraf ipywebgl/nbextension/static/index.js","lint":"eslint . --ext .ts,.tsx --fix","lint:check":"eslint . --ext .ts,.tsx","prepack":"yarn run build:lib","watch":"npm-run-all -p watch:*","watch:lib":"tsc -w","watch:nbextension":"webpack --watch --mode=development","watch:labextension":"jupyter labextension watch ."},"dependencies":{"@jupyter-widgets/base":"^1.1.10 || ^2 || ^3 || ^4 || ^5 || ^6"},"devDependencies":{"@babel/core":"^7.5.0","@babel/preset-env":"^7.5.0","@jupyter-widgets/base-manager":"^1.0.2","@jupyterlab/builder":"^3.0.0","@lumino/application":"^1.6.0","@lumino/widgets":"^1.6.0","@types/jest":"^26.0.0","@types/webpack-env":"^1.13.6","@typescript-eslint/eslint-plugin":"^3.6.0","@typescript-eslint/parser":"^3.6.0","acorn":"^7.2.0","css-loader":"^3.2.0","eslint":"^7.4.0","eslint-config-prettier":"^6.11.0","eslint-plugin-prettier":"^3.1.4","fs-extra":"^7.0.0","identity-obj-proxy":"^3.0.0","jest":"^26.0.0","mkdirp":"^0.5.1","npm-run-all":"^4.1.3","prettier":"^2.0.5","rimraf":"^2.6.2","source-map-loader":"^1.1.3","style-loader":"^1.0.0","ts-jest":"^26.0.0","ts-loader":"^8.0.0","typescript":"~4.1.3","webpack":"^5.61.0","webpack-cli":"^4.0.0"},"jupyterlab":{"extension":"lib/plugin","outputDir":"ipywebgl/labextension/","sharedPackages":{"@jupyter-widgets/base":{"bundled":false,"singleton":true}}}}')}},r={};function a(e){var i=r[e];if(void 0!==i)return i.exports;var n=r[e]={id:e,exports:{}};return t[e].call(n.exports,n,n.exports,a),n.exports}return a.nc=void 0,a(607)})()));
//# sourceMappingURL=embed-bundle.js.map