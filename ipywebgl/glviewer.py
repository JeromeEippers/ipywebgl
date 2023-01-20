from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Int, Bool, validate, TraitError, Instance, List

import numpy as np

from ._frontend import module_name, module_version
from .arraybuffer import array_to_buffer
from .glprogram import GLProgramWidget
from .glbuffer import GLBufferWidget
from .glvertexarray import GLVertexArrayWidget

@register
class GLViewer(DOMWidget):
    """The main widget of the module.

    This widget is in charge of creating the canvas, the webgl context and all the opengl resources you will need.

    It also manage the mouse and keyboard interaction with the widget to move the camera around.
    For the camera to work, by default the viewer will update the uniform mat4 ViewProjection if you have defined it in your shader code. (warning : all matrices are column major even in the shaders.)

    All OpenGL commands are sent through this widget.

    All the commands you call will be stacked on a commands buffer that will be sent only when you call the render method.

    Attributes:
        width (int): the width of the canvas. Defaults to 640.
        height (int): the height of the canvas. Defaults to 480.
    """
    _model_name = Unicode('GLModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('GLViewer').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    width = Int(640).tag(sync=True)
    height = Int(480).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.last_program = -1
        self.last_buffer = -1
        self.last_vao = -1
        self.commands = []


    def render(self):
        """Send the commands buffer to the webgl frontend.

        When the commands buffer is sent, it will be cleared.
        You can then start to build a new commands buffer.
        """
        self.send(self.commands)
        self.clear_commands()


    def clear_commands(self):
        """Clear the commands buffer without sending it to the frontend.
        """
        self.commands=[]


    def create_buffer(self) -> GLBufferWidget:
        """Create a GLBufferWidget and register it in the GLViewer

        This will create an empty buffer, you will have to call the update method on the widget to set some data in.
        
        Alternativelly if you have a dynamic buffer and you need to set new data on the buffer it is safer to use the
        update_buffer method from the GLViewer. This way you are sure that your data is pushed at the right time on the buffer.

        Returns:
            GLBufferWidget: the buffer widget
        """
        self.last_buffer += 1
        buf = GLBufferWidget(_glmodel=self, uid=self.last_buffer)
        return buf


    def create_program(self) -> GLProgramWidget:
        """Create a GLProgramWidget and register it in the GLViewer

        This will create an empty program, you will have to call the compile method on the widget to compile shaders.

        Returns:
            GLProgramWidget: the program widget
        """
        self.last_program += 1
        prog = GLProgramWidget(_glmodel=self, uid=self.last_program)
        return prog


    def create_vertex_array(self) -> GLVertexArrayWidget:
        """Create a GLVertexArrayWidget and register it in the GLViewer

        This will create an empty vertex array object, you will have to call the bind method on the widget to bind it to one program and one(or more) buffer(s).

        Returns:
            GLVertexArrayWidget: the vertex array buffer
        """
        self.last_vao += 1
        vao = GLVertexArrayWidget(_glmodel=self, uid=self.last_vao)
        return vao

    
    #gl commands
    def bind_buffer(self, target='array_buffer', buffer:GLBufferWidget=None):
        """Append a bindBuffer command to the commands buffer.

        Args:
            target ({'array_buffer', 'element_array_buffer', 'copy_read_buffer', 'copy_write_buffer', 'transform_feedback_buffer', 'uniform_buffer', 'pixel_pack_buffer', 'pixel_unpack_buffer'}, optional): the binding point (target). Defaults to 'array_buffer'.
            buffer (GLBufferWidget, optional): _description_. Defaults to None.
        """
        id = -1
        if buffer :
            id = buffer.uid
        self.commands.append({'cmd':'bindBuffer', 'target':target, 'buffer':id})


    def bind_vertex_array(self, vao:GLVertexArrayWidget=None):
        """Append a bindVertexArray command to the commands buffer.

        Args:
            vao (GLVertexArrayWidget): the vertex array to use. Defaults to None.
        """
        id = -1
        if vao :
            id = vao.uid
        self.commands.append({'cmd':'bindVertexArray', 'vao':id})


    def buffer_data(self, target='array_buffer', src_data=None, usage='static_draw'):
        """update the buffer data

        This works as the webgl version and will use the bound buffer.

        Args:
            target ({'array_buffer', 'element_array_buffer', 'copy_read_buffer', 'copy_write_buffer', 'transform_feedback_buffer', 'uniform_buffer', 'pixel_pack_buffer', 'pixel_unpack_buffer'}, optional): the binding point (target). Defaults to 'array_buffer'.
            srcData (np.array, optional): a np.array that will be copied into the data store. If null, a data store is still created, but the content is uninitialized and undefined.. Defaults to None.
            usage ({'static_draw', 'dynamic_draw', 'stream_draw', 'static_read', 'dynamic_read', 'stream_read', 'static_copy', 'dynamic_copy', 'stream_copy'}, optional):  the intended usage pattern of the data store for optimization purposes. Defaults to 'static_draw'.
        """
        self.commands.append({'type':'bufferData', 'target':target, 'srcData':array_to_buffer(src_data), 'usage':usage})


    def clear_color(self, r:float, g:float, b:float, a:float):
        """Append a clearColor command to the commands buffer.

        Args:
            r (float): red [0, 1]
            g (float): green [0, 1]
            b (float): blue [0, 1]
            a (float): alpha [0, 1]
        """
        self.commands.append({'cmd':'clearColor', 'r':float(r), 'g':float(g), 'b':float(b), 'a':float(a)})


    def clear(self, color_bit_buffer=True, depth_buffer_bit=True, stencil_buffer_bit=False):
        """Append a clear command to the commands buffer.
        
        Args:
            color_bit_buffer (bool, optional): clear the depth buffer. Defaults to True.
            depth_buffer_bit (bool, optional): clear the color buffer. Defaults to True.
            stencil_buffer_bit (bool, optional): clear the stencil buffer.  Defaults to False.
        """
        self.commands.append({'cmd':'clear', 'depth':color_bit_buffer, 'color':depth_buffer_bit, 'stencil':stencil_buffer_bit})


    def draw_arrays(self, draw_type:str, first:int, count:int):
        """Append a drawArrays command to the commands buffer

        Args:
            draw_type ({'triangles', 'triangle_fan', 'triangle_strip', 'points', 'lines', 'line_strip', 'line_loop'}): type of drawing operation.
            first (int): the starting index in the array of vector points.
            count (int): the number of indices to be rendered.
        """
        self.commands.append({'cmd':'drawArrays', 'type':draw_type, 'first':first, 'count':count})


    def use_program(self, program:GLProgramWidget=None):
        """Append a useProgram command to the commands buffer.

        Args:
            program (GLProgramWidget): the program to use. Default to None.
        """
        id = -1
        if program :
            id = program.uid
        self.commands.append({'cmd':'useProgram', 'program':id})

    
    def set_uniform(self, name:str, array:np.array):
        """Append a uniform command to the commands buffer.

        Args:
            name (str): the name of the uniform
            array (np.array): the numpy array with the data. Even if you send one value it must be an array.
        """
        self.commands.append({'cmd':'uniform', 'name':name, 'buffer':array_to_buffer(array)})


    def set_uniform_matrix(self, name:str, array:np.array):
        """Append a uniformMatrix command to the commands buffer.

        Args:
            name (str): the name of the uniform
            array (np.array): the matrix(matrices) to send. It must be a np.array(dtype=np.float32)
        """
        self.commands.append({'cmd':'uniformMatrix', 'name':name, 'buffer':array_to_buffer(array)})

    
    
