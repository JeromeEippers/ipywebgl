from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Float, Int, Bool, validate, TraitError, Instance, List

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
    For the camera to work, by default the viewer will update the uniform mat4 ViewProjection if you have defined it in your shader code.

    All OpenGL commands are sent through this widget.

    All the commands you call will be stacked on a commands buffer that will be sent only when you call the render method.

    Attributes:
        width (int): the width of the canvas. Defaults to 640.
        height (int): the height of the canvas. Defaults to 480.
        camera_pos ([float, float, float]): the camera position in the scene. Defaults to [0,50,200].
        camera_yaw (float): the camera yaw angle in degree. Defaults to 0.
        camera_pitch (float): the camera pitch angle in degree. Defaults to 0.
        mouse_speed (float): mouse speed (camera rotation speed). Defaults to 1.
        move_speed (float): move speed (camera translation speed). Defaults to 1.
        move_keys (str): the move keys as a string. Forward, Left, Back, Right. Defaults to 'wasd'.
        shader_matrix_major (str): the type of matrix (for the ViewProjection for instance) to send to the shader {'row_major' or 'column_major'}. Defaults to 'row_major'.
    """
    _model_name = Unicode('GLModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('GLViewer').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    width = Int(640).tag(sync=True)
    height = Int(480).tag(sync=True)
    camera_pos = List([0,50,200]).tag(sync=True)
    camera_yaw = Float(0).tag(sync=True)
    camera_pitch = Float(0).tag(sync=True)
    mouse_speed = Float(1).tag(sync=True)
    move_speed = Float(1).tag(sync=True)
    move_keys = Unicode('wasd').tag(sync=True)
    shader_matrix_major = Unicode('row_major').tag(sync=True)

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

    def cull_face(self, mode='back'):
        """Append a cullFace command to the commands buffer

        Polygon culling is disabled by default. To enable or disable culling, use the enable().

        Args:
            mode ({'front', 'back', 'front_and_back'}, optional): specifying whether front- or back-facing polygons are candidates for culling. Defaults to 'back'.
        """
        self.commands.append({'cmd':'cullFace', 'mode':mode})

    def depth_func(self, func='less'):
        """Append a depthFunc command to the commands buffer

         specifying the depth comparison function, which sets the conditions under which the pixel will be drawn.
        
        Args:
            mode ({'never', 'less', 'equal', 'lequal', 'greater', 'notequal', 'gequal', 'always'}, optional): Defaults to 'less'.
        """
        self.commands.append({'cmd':'depthFunc', 'func':func})

    def depth_mask(self, flag=True):
        """Append a depthMask command to the commands buffer.

        Args:
            flag (bool, optional): specifying whether or not writing into the depth buffer is enabled. Defaults to True.
        """
        self.commands.append({'cmd':'depthMask', 'flag':flag})

    def depth_range(self, z_near=0.0, z_far=1.0):
        """Append a depthRange command to the commands buffer.

        Args:
            z_near (float, optional): specifying the mapping of the near clipping plane to window or viewport coordinates. Clamped to the range 0 to 1 and must be less than or equal to z_far. Defaults to 0.0.
            z_far (float, optional): specifying the mapping of the far clipping plane to window or viewport coordinates. Clamped to the range 0 to 1. Defaults to 1.0.
        """
        self.commands.append({'cmd':'depthRange', 'z_near':z_near, 'z_far':z_far})

    def disable(self, blend=False, cull_face=False, depth_test=False, dither=False, polygon_offset_fill=False, sample_alpha_to_coverage=False, sample_coverage=False, scissor_test=False, stencil_test=False, rasterizer_discard=False):
        """Append a disable command to the commands buffer

        Args:
            blend (bool, optional): Deactivates  blending of the computed fragment color values. Defaults to False.
            cull_face (bool, optional): Deactivates  culling of polygons. Defaults to False.
            depth_test (bool, optional): Deactivates  depth comparisons and updates to the depth buffer. Defaults to False.
            dither (bool, optional): Deactivates  dithering of color components before they get written to the color buffer. Defaults to False.
            polygon_offset_fill (bool, optional): Deactivates  adding an offset to depth values of polygon's fragments. Defaults to False.
            sample_alpha_to_coverage (bool, optional): Deactivates  ates the computation of a temporary coverage value determined by the alpha value. Defaults to False.
            sample_coverage (bool, optional): Deactivates  ANDing the fragment's coverage with the temporary coverage value. Defaults to False.
            scissor_test (bool, optional): Deactivates  the scissor test that discards fragments that are outside of the scissor rectangle. Defaults to False.
            stencil_test (bool, optional): Deactivates  stencil testing and updates to the stencil buffer. Defaults to False.
            rasterizer_discard (bool, optional): Deactivates that primitives are discarded immediately before the rasterization stage, but after the optional transform feedback stage. Defaults to False.
        """
        self.commands.append({'cmd':'disable', 
        'blend':blend,
        'cull_face':cull_face,
        'depth_test':depth_test,
        'dither':dither,
        'polygon_offset_fill':polygon_offset_fill,
        'sample_alpha_to_coverage':sample_alpha_to_coverage,
        'sample_coverage':sample_coverage,
        'scissor_test':scissor_test,
        'stencil_test':stencil_test,
        'rasterizer_discard':rasterizer_discard
        })

    def draw_arrays(self, draw_type:str, first:int, count:int):
        """Append a drawArrays command to the commands buffer

        Args:
            draw_type ({'triangles', 'triangle_fan', 'triangle_strip', 'points', 'lines', 'line_strip', 'line_loop'}): type of drawing operation.
            first (int): the starting index in the array of vector points.
            count (int): the number of indices to be rendered.
        """
        self.commands.append({'cmd':'drawArrays', 'type':draw_type, 'first':first, 'count':count})

    def draw_elements(self, mode:str, count:int, type:str, offset:int):
        """Append a drawElements command to the commands buffer

        Args:
            mode ({'triangles', 'triangle_fan', 'triangle_strip', 'points', 'lines', 'line_strip', 'line_loop'}): type of drawing operation.
            count (int): specifying the number of elements of the bound element array buffer to be rendered.
            type ({'uint8', 'uint16'}): type of data in the index buffer.
            offset (int): a byte offset in the element array buffer. Must be a valid multiple of the size of the given type.
        """
        self.commands.append({'cmd':'drawElements', 'mode':mode, 'count':count, 'type':type, 'offset':offset})

    def enable(self, blend=False, cull_face=False, depth_test=False, dither=False, polygon_offset_fill=False, sample_alpha_to_coverage=False, sample_coverage=False, scissor_test=False, stencil_test=False, rasterizer_discard=False):
        """Append a enable command to the commands buffer

        Args:
            blend (bool, optional): Activates blending of the computed fragment color values. Defaults to False.
            cull_face (bool, optional): Activates culling of polygons. Defaults to False.
            depth_test (bool, optional): Activates depth comparisons and updates to the depth buffer. Defaults to False.
            dither (bool, optional): Activates dithering of color components before they get written to the color buffer. Defaults to False.
            polygon_offset_fill (bool, optional): Activates adding an offset to depth values of polygon's fragments. Defaults to False.
            sample_alpha_to_coverage (bool, optional): Activates the computation of a temporary coverage value determined by the alpha value. Defaults to False.
            sample_coverage (bool, optional): Activates ANDing the fragment's coverage with the temporary coverage value. Defaults to False.
            scissor_test (bool, optional): Activates the scissor test that discards fragments that are outside of the scissor rectangle. Defaults to False.
            stencil_test (bool, optional): Activates stencil testing and updates to the stencil buffer. Defaults to False.
            rasterizer_discard (bool, optional): Primitives are discarded immediately before the rasterization stage, but after the optional transform feedback stage. Defaults to False.
        """
        self.commands.append({'cmd':'enable', 
        'blend':blend,
        'cull_face':cull_face,
        'depth_test':depth_test,
        'dither':dither,
        'polygon_offset_fill':polygon_offset_fill,
        'sample_alpha_to_coverage':sample_alpha_to_coverage,
        'sample_coverage':sample_coverage,
        'scissor_test':scissor_test,
        'stencil_test':stencil_test,
        'rasterizer_discard':rasterizer_discard
        })

    def front_face(self, mode='ccw'):
        """Append a frontFace command to the commands buffer

        Args:
            mode ({'cw', 'ccw'}, optional): type winding orientation. Defaults to 'ccw'.
        """
        self.commands.append({'cmd':'frontFace', 'mode':mode})

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

    
    
