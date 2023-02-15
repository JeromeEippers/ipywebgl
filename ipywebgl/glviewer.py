from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Float, Int, Bool, validate, TraitError, Instance, List

import numpy as np

from ._frontend import module_name, module_version
from .arraybuffer import array_to_buffer
from .glresource import GLResourceWidget

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
        self._resources = []
        self._commands = []
        self._buffers = []


    def execute_commands(self, execute_once=False, clear_previous=True):
        """Send the commands buffer to the webgl frontend.

        When the commands buffer is sent, it will be cleared.
        You can then start to build a new commands buffer.

        By default the command buffers will stay in memory in the frontend, so it can be reexecuted everytime you need to redraw the scene (camera move for instance)
        If you set the execute_once to True, it will not be stored in the frontend.

        Args:
            execute_once (bool, optional): Do we execute this only once. Defaults to False.
            clear_previous (bool, optional): Do we replace the current commands or just append?. Defaults to False.
        """
        self.send({'commands':self._commands, 'only_once':execute_once, 'clear':clear_previous}, buffers=self._buffers)
        self.clear_commands()


    def clear_commands(self):
        """Clear the commands buffer without sending it to the frontend.
        """
        self._commands = []
        self._buffers  = []


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
        self._commands.append({'cmd':'enable', 
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
        self._commands.append({'cmd':'disable', 
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


    def clear_color(self, r:float, g:float, b:float, a:float):
        """Append a clearColor command to the commands buffer.

        Args:
            r (float): red [0, 1]
            g (float): green [0, 1]
            b (float): blue [0, 1]
            a (float): alpha [0, 1]
        """
        self._commands.append({
            'cmd':'clearColor', 
            'r':float(r), 
            'g':float(g), 
            'b':float(b), 
            'a':float(a)
        })


    def clear(self, color_bit_buffer=True, depth_buffer_bit=True, stencil_buffer_bit=False):
        """Append a clear command to the commands buffer.
        
        Args:
            color_bit_buffer (bool, optional): clear the depth buffer. Defaults to True.
            depth_buffer_bit (bool, optional): clear the color buffer. Defaults to True.
            stencil_buffer_bit (bool, optional): clear the stencil buffer.  Defaults to False.
        """
        self._commands.append({
            'cmd':'clear', 
            'depth':color_bit_buffer, 
            'color':depth_buffer_bit, 
            'stencil':stencil_buffer_bit
        })


    def cull_face(self, mode='BACK'):
        """Append a cullFace command to the commands buffer

        Polygon culling is disabled by default. To enable or disable culling, use the enable().

        Args:
            mode ({'FRONT', 'BACK', 'FRONT_AND_BACK'}, optional): specifying whether front- or back-facing polygons are candidates for culling. Defaults to 'BACK'.
        """
        if mode not in ['FRONT', 'BACK', 'FRONT_AND_BACK']:
            raise AttributeError('Invalid mode')
        self._commands.append({
            'cmd':'cullFace', 
            'mode':mode
        })


    def front_face(self, mode='CCW'):
        """Append a frontFace command to the commands buffer

        Args:
            mode ({'CW', 'CCW'}, optional): type winding orientation. Defaults to 'CCW'.
        """
        if mode not in ['CW', 'CCW']:
            raise AttributeError('Invalid mode')
        self.commands.append({
            'cmd':'frontFace', 
            'mode':mode
        })


    def depth_func(self, func='LESS'):
        """Append a depthFunc command to the commands buffer

         specifying the depth comparison function, which sets the conditions under which the pixel will be drawn.
        
        Args:
            func ({'NEVER', 'LESS', 'EQUAL', 'LEQUAL', 'GREATER', 'NOTEQUAL', 'GEQUAL', 'ALWAYS'}, optional): Defaults to 'LESS'.
        """
        if func not in ['NEVER', 'LESS', 'EQUAL', 'LEQUAL', 'GREATER', 'NOTEQUAL', 'GEQUAL', 'ALWAYS']:
            raise AttributeError("Invalid function")
        self._commands.append({
            'cmd':'depthFunc', 
            'func':func
        })

    def depth_mask(self, flag=True):
        """Append a depthMask command to the commands buffer.

        Args:
            flag (bool, optional): specifying whether or not writing into the depth buffer is enabled. Defaults to True.
        """
        self._commands.append({
            'cmd':'depthMask', 
            'flag':flag
        })

    def depth_range(self, z_near=0.0, z_far=1.0):
        """Append a depthRange command to the commands buffer.

        Args:
            z_near (float, optional): specifying the mapping of the near clipping plane to window or viewport coordinates. Clamped to the range 0 to 1 and must be less than or equal to z_far. Defaults to 0.0.
            z_far (float, optional): specifying the mapping of the far clipping plane to window or viewport coordinates. Clamped to the range 0 to 1. Defaults to 1.0.
        """
        self._commands.append({
            'cmd':'depthRange', 
            'z_near':z_near, 
            'z_far':z_far
        })

    def blend_color(self, r:float, g:float, b:float, a:float):
        """Append a blendColor command to the commands buffer.

        Args:
            r (float): red [0, 1]
            g (float): green [0, 1]
            b (float): blue [0, 1]
            a (float): alpha [0, 1]
        """
        self._commands.append({
            'cmd':'blendColor', 
            'r':float(r), 
            'g':float(g), 
            'b':float(b), 
            'a':float(a)
        })

    def blend_equation(self, mode:str):
        """Append a blendEquation to the command buffer.

        ['FUNC_ADD', 'FUNC_SUBTRACT', 'FUNC_REVERSE_SUBTRACT', 'MIN', 'MAX']

        Args:
            mode (str): how source and destination colors are combined
        """
        if mode not in ['FUNC_ADD', 'FUNC_SUBTRACT', 'FUNC_REVERSE_SUBTRACT', 'MIN', 'MAX']:
            raise AttributeError("Invalid mode")

        self._commands.append({
            'cmd':'blendEquation', 
            'mode' : mode
        })

    def blend_equation_separate(self, mode_rgb:str, mode_alpha:str):
        """Append a blendEquationSeparate to the command buffer

        ['FUNC_ADD', 'FUNC_SUBTRACT', 'FUNC_REVERSE_SUBTRACT', 'MIN', 'MAX']

        Args:
            mode_rgb (str):  how the red, green and blue components of source and destination colors are combined
            mode_alpha (str): how the alpha component (transparency) of source and destination colors are combined
        """
        if mode_rgb not in ['FUNC_ADD', 'FUNC_SUBTRACT', 'FUNC_REVERSE_SUBTRACT', 'MIN', 'MAX']:
            raise AttributeError("Invalid mode rgb")
        if mode_alpha not in ['FUNC_ADD', 'FUNC_SUBTRACT', 'FUNC_REVERSE_SUBTRACT', 'MIN', 'MAX']:
            raise AttributeError("Invalid mode alpha")
        self._commands.append({
            'cmd':'blendEquationSeparate', 
            'mode_rgb' : mode_rgb,
            'mode_alpha' : mode_alpha
        })

    def blend_func(self, s_factor:str, d_factor:str):
        """Append a blendFunc to the command buffer

        ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']

        Args:
            s_factor (str): a multiplier for the source blending factors
            d_factor (str): a multiplier for the destination blending factors

        Raises:
            AttributeError: s_factor
            AttributeError: d_factor
        """

        if s_factor not in ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']:
            raise AttributeError("Invalid s_factor")
        if d_factor not in ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']:
            raise AttributeError("Invalid d_factor")
        self._commands.append({
            'cmd':'blendFunc', 
            's_factor' : s_factor,
            'd_factor' : d_factor
        })

    def blend_func_separate(self, src_rgb:str, dst_rgb:str, src_alpha:str, dst_alpha:str):
        """Append a blendFuncSeparate to the command buffer

        ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']

        Args:
            src_rgb (str): a multiplier for the source blending factors
            dst_rgb (str): a multiplier for the destination blending factors
            src_alpha (str): a multiplier for the source blending factors
            dst_alpa (str): a multiplier for the destination blending factors
        """

        if src_rgb not in ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']:
            raise AttributeError("Invalid src_rgb")
        if dst_rgb not in ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']:
            raise AttributeError("Invalid dst_rgb")
        if src_alpha not in ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']:
            raise AttributeError("Invalid src_alpha")
        if dst_alpha not in ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'DST_COLOR', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'DST_ALPHA', 'ONE_MINUS_DST_ALPHA', 'CONSTANT_COLOR', 'ONE_MINUS_CONSTANT_COLOR', 'CONSTANT_ALPHA', 'ONE_MINUS_CONSTANT_ALPHA', 'SRC_ALPHA_SATURATE']:
            raise AttributeError("Invalid dst_alpha")
        self._commands.append({
            'cmd':'blendFuncSeparate', 
            'src_rgb' : src_rgb,
            'dst_rgb' : dst_rgb,
            'src_alpha':src_alpha,
            'dst_alpha':dst_alpha
        })


    def create_texture(self) -> GLResourceWidget:
        """Append a createTexture command to the command list

        Returns:
            GLResourceWidget: the resource that will hold the texture
        """
        uid = len(self._resources)
        resource = GLResourceWidget(_context=self, uid=uid)
        self._resources.append(resource)
        self._commands.append({
            'cmd':'createTexture', 
            'resource':uid
        })
        return resource


    def bind_texture(self, target:str, texture:GLResourceWidget):
        """Append a bindTexture command to the command list

        Args:
            target (str): the binding point ["TEXTURE_2D", "TEXTURE_CUBE_MAP", "TEXTURE_3D", "TEXTURE_2D_ARRAY"]
            texture (GLResourceWidget): the texture resource
        """
        if target not in ["TEXTURE_2D", "TEXTURE_CUBE_MAP", "TEXTURE_3D", "TEXTURE_2D_ARRAY"]:
            raise AttributeError("Invalid target")
        self._commands.append({
            'cmd':'bindTexture', 
            'texture':texture.uid, 
            'target':target
        })


    def active_texture(self, texture:int):
        """Append an activeTexture command

        Args:
            texture (int): The texture unit to make active. The value is a gl.TEXTURE0 + texture
        """
        self._commands.append({
            'cmd':'activeTexture', 
            'texture':texture, 
        })


    def generate_mipmap(self, target:str):
        """Append a generateMipmap command

        Args:
            target (str): the binding point ["TEXTURE_2D", "TEXTURE_CUBE_MAP", "TEXTURE_3D", "TEXTURE_2D_ARRAY"]
        """
        if target not in ["TEXTURE_2D", "TEXTURE_CUBE_MAP", "TEXTURE_3D", "TEXTURE_2D_ARRAY"]:
            raise AttributeError("Invalid target")
        self._commands.append({
            'cmd':'generateMipmap',  
            'target':target
        })


    def tex_image_2d(self, target:str, level:int, internal_format:str, width:int, height:int, border:int, format:str, data_type:str, pixel:np.array):
        """Append a texImage2D command

        target = ['TEXTURE_2D', 'TEXTURE_CUBE_MAP_POSITIVE_X', 'TEXTURE_CUBE_MAP_NEGATIVE_X', 'TEXTURE_CUBE_MAP_POSITIVE_Y', 'TEXTURE_CUBE_MAP_NEGATIVE_Y', 'TEXTURE_CUBE_MAP_POSITIVE_Z', 'TEXTURE_CUBE_MAP_NEGATIVE_Z']
        
        internal_format = ['RGBA', 'RGB', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA',
        'R8', 'R8_SNORM', 'RG8', 'RG8_SNORM', 'RGB8', 'RGB8_SNORM', 'RGB565', 'RGBA4', 'RGB5_A1', 'RGBA8', 'RGBA8_SNORM', 'RGB10_A2', 'RGB10_A2UI', 'SRGB8', 'SRGB8_ALPHA8',
        'R16F', 'RG16F', 'RGB16F', 'RGBA16F', 'R32F', 'RG32F', 'RGB32F', 'RGBA32F', 'R11F_G11F_B10F', 'RGB9_E5',
        'R8I', 'R8UI', 'R16I', 'R16UI', 'R32I', 'R32UI', 'RG8I', 'RG8UI', 'RG16I', 'RG16UI', 'RG32I', 'RG32UI', 
        'RGB8I', 'RGB8UI', 'RGB16I', 'RGB16UI', 'RGB32I', 'RGB32UI', 'RGBA8I', 'RGBA8UI', 'RGBA16I', 'RGBA16UI', 'RGBA32I', 'RGBA32UI']

        format = ['RGB', 'RGBA', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA', 'RED', 'RED_INTEGER', 'RG', 'RG_INTEGER', 'RGB', 'RGB_INTEGER', 'RGBA_INTEGER']

        data_type = ['UNSIGNED_BYTE', 'UNSIGNED_SHORT_5_6_5', 'UNSIGNED_SHORT_4_4_4_4', 'UNSIGNED_SHORT_5_5_5_1', 'BYTE', 'UNSIGNED_SHORT', 'SHORT', 'UNSIGNED_INT', 'INT', 'HALF_FLOAT', 'FLOAT', 'UNSIGNED_INT_2_10_10_10_REV', 'UNSIGNED_INT_10F_11F_11F_REV', 'UNSIGNED_INT_5_9_9_9_REV', 'UNSIGNED_INT_24_8', 'FLOAT_32_UNSIGNED_INT_24_8_REV']

        link between internal_format, format and type;
        https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE

        Args:
            target (str): the binding point (target) of the active texture
            level (int): the level of detail. Level 0 is the base image level and level n is the n-th mipmap reduction level.
            internal_format (str): the color components in the texture
            width (int): the width of the texture.
            height (int): the height of the texture.
            border (int): specifying the width of the border. Must be 0.
            format (str):  the format of the texel data
            data_type (str): the data type of the texel data
            pixel (np.array): the buffer
        """
        if target not in ['TEXTURE_2D', 'TEXTURE_CUBE_MAP_POSITIVE_X', 'TEXTURE_CUBE_MAP_NEGATIVE_X', 'TEXTURE_CUBE_MAP_POSITIVE_Y', 'TEXTURE_CUBE_MAP_NEGATIVE_Y', 'TEXTURE_CUBE_MAP_POSITIVE_Z', 'TEXTURE_CUBE_MAP_NEGATIVE_Z']:
            raise AttributeError("Invalid target")

        if internal_format not in [
            'RGBA', 'RGB', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA',
            'R8', 'R8_SNORM', 'RG8', 'RG8_SNORM', 'RGB8', 'RGB8_SNORM', 'RGB565', 'RGBA4', 'RGB5_A1', 'RGBA8', 'RGBA8_SNORM', 'RGB10_A2', 'RGB10_A2UI', 'SRGB8', 'SRGB8_ALPHA8',
            'R16F', 'RG16F', 'RGB16F', 'RGBA16F', 'R32F', 'RG32F', 'RGB32F', 'RGBA32F', 'R11F_G11F_B10F', 'RGB9_E5',
            'R8I', 'R8UI', 'R16I', 'R16UI', 'R32I', 'R32UI', 'RG8I', 'RG8UI', 'RG16I', 'RG16UI', 'RG32I', 'RG32UI', 
            'RGB8I', 'RGB8UI', 'RGB16I', 'RGB16UI', 'RGB32I', 'RGB32UI', 'RGBA8I', 'RGBA8UI', 'RGBA16I', 'RGBA16UI', 'RGBA32I', 'RGBA32UI']:
            raise AttributeError("Invalid internal_format")

        if format not in ['RGB', 'RGBA', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA', 'RED', 'RED_INTEGER', 'RG', 'RG_INTEGER', 'RGB', 'RGB_INTEGER', 'RGBA_INTEGER']:
            raise AttributeError("Invalid format")

        if data_type not in ['UNSIGNED_BYTE', 'UNSIGNED_SHORT_5_6_5', 'UNSIGNED_SHORT_4_4_4_4', 'UNSIGNED_SHORT_5_5_5_1', 'BYTE', 'UNSIGNED_SHORT', 'SHORT', 'UNSIGNED_INT', 'INT', 'HALF_FLOAT', 'FLOAT', 'UNSIGNED_INT_2_10_10_10_REV', 'UNSIGNED_INT_10F_11F_11F_REV', 'UNSIGNED_INT_5_9_9_9_REV', 'UNSIGNED_INT_24_8', 'FLOAT_32_UNSIGNED_INT_24_8_REV']:
            raise AttributeError("Invalid data_type")

        meta_data = {}
        buffer = []
        meta_data, buffer = array_to_buffer(pixel)
        meta_data['index'] = len(self._buffers)
        self._buffers.append(buffer)
        self._commands.append({
            'cmd':'texImage2D', 
            'target':target,
            'level': level,
            'internal_format':internal_format, 
            'width':width, 
            'height':height, 
            'border':border,
            'format':format,
            'data_type':data_type,
            'buffer_metadata':meta_data
        })

    def tex_image_3d(self, target:str, level:int, internal_format:str, width:int, height:int, depth:int, border:int, format:str, data_type:str, pixel:np.array):
        """Append a texImage3D command

        target = ['TEXTURE_3D', 'TEXTURE_2D_ARRAY']
        
        internal_format = ['RGBA', 'RGB', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA',
        'R8', 'R16F', 'R32F', 'R8UI', 'RG8', 'RG16F', 'RG32F', 'RGUI', 'RGB8', 'SRGB8', 'RGB565', 'R11F_G11F_B10F',
        'RGB9_E5', 'RGB16F', 'RGB32F', 'RGB8UI', 'RGBA8', 'SRGB8_ALPHA8', 'RGB5_A1', 'RGBA4444', 'RGBA16F', 'RGBA32F', 'RGBA8UI']

        format = ['RGB', 'RGBA', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA', 'RED', 'RED_INTEGER', 'RG', 'RG_INTEGER', 'RGB', 'RGB_INTEGER', 'RGBA_INTEGER']

        data_type = ['UNSIGNED_BYTE', 'UNSIGNED_SHORT_5_6_5', 'UNSIGNED_SHORT_4_4_4_4', 'UNSIGNED_SHORT_5_5_5_1', 'BYTE', 'UNSIGNED_SHORT', 'SHORT', 'UNSIGNED_INT', 'INT', 'HALF_FLOAT', 'FLOAT', 'UNSIGNED_INT_2_10_10_10_REV', 'UNSIGNED_INT_10F_11F_11F_REV', 'UNSIGNED_INT_5_9_9_9_REV', 'UNSIGNED_INT_24_8', 'FLOAT_32_UNSIGNED_INT_24_8_REV']

        link between internal_format, format and type;
        https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE

        Args:
            target (str): the binding point (target) of the active texture
            level (int): the level of detail. Level 0 is the base image level and level n is the n-th mipmap reduction level.
            internal_format (str): the color components in the texture
            width (int): the width of the texture.
            height (int): the height of the texture.
            depth (int): the depth of the texture.
            border (int): specifying the width of the border. Must be 0.
            format (str):  the format of the texel data
            data_type (str): the data type of the texel data
            pixel (np.array): the buffer
        """
        if target not in ['TEXTURE_3D', 'TEXTURE_2D_ARRAY']:
            raise AttributeError("Invalid target")

        if internal_format not in ['RGBA', 'RGB', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA',
            'R8', 'R16F', 'R32F', 'R8UI', 'RG8', 'RG16F', 'RG32F', 'RGUI', 'RGB8', 'SRGB8', 'RGB565', 'R11F_G11F_B10F',
            'RGB9_E5', 'RGB16F', 'RGB32F', 'RGB8UI', 'RGBA8', 'SRGB8_ALPHA8', 'RGB5_A1', 'RGBA4444', 'RGBA16F', 'RGBA32F', 'RGBA8UI']:
            raise AttributeError("Invalid internal_format")

        if format not in ['RGB', 'RGBA', 'LUMINANCE_ALPHA', 'LUMINANCE', 'ALPHA', 'RED', 'RED_INTEGER', 'RG', 'RG_INTEGER', 'RGB', 'RGB_INTEGER', 'RGBA_INTEGER']:
            raise AttributeError("Invalid format")

        if data_type not in ['UNSIGNED_BYTE', 'UNSIGNED_SHORT_5_6_5', 'UNSIGNED_SHORT_4_4_4_4', 'UNSIGNED_SHORT_5_5_5_1', 'BYTE', 'UNSIGNED_SHORT', 'SHORT', 'UNSIGNED_INT', 'INT', 'HALF_FLOAT', 'FLOAT', 'UNSIGNED_INT_2_10_10_10_REV', 'UNSIGNED_INT_10F_11F_11F_REV', 'UNSIGNED_INT_5_9_9_9_REV', 'UNSIGNED_INT_24_8', 'FLOAT_32_UNSIGNED_INT_24_8_REV']:
            raise AttributeError("Invalid data_type")

        meta_data = {}
        buffer = []
        meta_data, buffer = array_to_buffer(pixel)
        meta_data['index'] = len(self._buffers)
        self._buffers.append(buffer)
        self._commands.append({
            'cmd':'texImage3D', 
            'target':target,
            'level': level,
            'internal_format':internal_format, 
            'width':width, 
            'height':height, 
            'border':border,
            'depth':depth,
            'format':format,
            'data_type':data_type,
            'buffer_metadata':meta_data
        })


    def tex_parameter(self, target:str, pname:str, param):
        """Append a texParameteri or texParameterf to the command list

        pname = ["TEXTURE_MAG_FILTER", "TEXTURE_MIN_FILTER", "TEXTURE_WRAP_S", "TEXTURE_WRAP_T", 
            'TEXTURE_BASE_LEVEL', 'TEXTURE_COMPARE_FUNC', 'TEXTURE_COMPARE_MODE', 'TEXTURE_MAX_LEVEL', 'TEXTURE_MAX_LOD', 'TEXTURE_MIN_LOD', 'TEXTURE_WRAP_R']

        param = int or float or ['LINEAR', 'NEAREST', 'NEAREST_MIPMAP_NEAREST', 'LINEAR_MIPMAP_NEAREST', 'NEAREST_MIPMAP_LINEAR', 'LINEAR_MIPMAP_LINEAR',
            'REPEAT', 'CLAMP_TO_EDGE', 'MIRRORED_REPEAT', 
            'LEQUAL', 'GEQUAL', 'LESS', 'GREATER', 'EQUAL', 'NOTEQUAL', 'ALWAYS', 'NEVER',
            'NONE', 'COMPARE_REF_TO_TEXTURE']

        Args:
            target (str): the binding point ["TEXTURE_2D", "TEXTURE_CUBE_MAP", "TEXTURE_3D", "TEXTURE_2D_ARRAY"]
            pname(str): the texture parameter to set.
            param(str | int | float): the value for the specified parameter.
        """
        if target not in ["TEXTURE_2D", "TEXTURE_CUBE_MAP", "TEXTURE_3D", "TEXTURE_2D_ARRAY"]:
            raise AttributeError("Invalid target")
        
        if pname not in ["TEXTURE_MAG_FILTER", "TEXTURE_MIN_FILTER", "TEXTURE_WRAP_S", "TEXTURE_WRAP_T", 
            'TEXTURE_BASE_LEVEL', 'TEXTURE_COMPARE_FUNC', 'TEXTURE_COMPARE_MODE', 'TEXTURE_MAX_LEVEL', 'TEXTURE_MAX_LOD', 'TEXTURE_MIN_LOD', 'TEXTURE_WRAP_R']:
            raise AttributeError("Invalid pname")

        if isinstance(param, int):
            self._commands.append({
                'cmd':'texParameteri', 
                'target':target,
                'pname':pname,
                'param':param
            })
        elif isinstance(param, float):
            self._commands.append({
                'cmd':'texParameterf', 
                'target':target,
                'pname':pname,
                'param':param
            })
        else:
            if param not in ['LINEAR', 'NEAREST', 'NEAREST_MIPMAP_NEAREST', 'LINEAR_MIPMAP_NEAREST', 'NEAREST_MIPMAP_LINEAR', 'LINEAR_MIPMAP_LINEAR',
                'REPEAT', 'CLAMP_TO_EDGE', 'MIRRORED_REPEAT', 
                'LEQUAL', 'GEQUAL', 'LESS', 'GREATER', 'EQUAL', 'NOTEQUAL', 'ALWAYS', 'NEVER',
                'NONE', 'COMPARE_REF_TO_TEXTURE']:
                raise AttributeError("Invalid param")
            self._commands.append({
                'cmd':'texParameter_str', 
                'target':target,
                'pname':pname,
                'param':param
            })



    def create_shader(self, shadertype:str) -> GLResourceWidget:
        """Append a createShader command to the command list

        Args:
            shadertype (str): type of shader ["VERTEX_SHADER" or "FRAGMENT_SHADER"]

        Returns:
            GLResourceWidget: the resource that will hold the shader
        """
        if shadertype not in ["VERTEX_SHADER", "FRAGMENT_SHADER"]:
            raise AttributeError("Invalid type")

        uid = len(self._resources)
        resource = GLResourceWidget(_context=self, uid=uid)
        self._resources.append(resource)
        self._commands.append({
            'cmd':'createShader', 
            'type':shadertype, 
            'resource':uid
        })
        return resource


    def shader_source(self, shader:GLResourceWidget, source:str):
        """Append a shaderSource command to the buffer.
        Sets the source code for a shader object.

        Args:
            shader (GLResourceWidget): a resource with a shader.
            source (str): A string of GLSL code that defines the shader.
        """
        self._commands.append({
            'cmd':'shaderSource', 
            'shader':shader.uid, 
            'source':source
        })


    def compile_shader(self, shader:GLResourceWidget):
        """
        Append a compileShader command to the command buffer.
        
        Args:
            shader (GLResourceWidget): a resource with a shader.
        """
        self._commands.append({
            'cmd':'compileShader', 
            'shader':shader.uid
        })


    def create_program(self) -> GLResourceWidget:
        """Append a createProgram command to the command list

        Returns:
            GLResourceWidget: the resource that will hold the program
        """
        uid = len(self._resources)
        resource = GLResourceWidget(_context=self, uid=uid)
        self._resources.append(resource)
        self._commands.append({
            'cmd':'createProgram', 
            'resource':uid
        })
        return resource


    def create_program_ext(self, vertex_source:str, fargment_source:str, attribute_location:{}=None, auto_execute=True) -> GLResourceWidget:
        """Extended function to quickly create a program

            This will build the command buffer with all the needed commands for you.
            It creates the shaders, compiles them, creates the program, and links it.

            And if the auto_execute is on, it will send the command buffer to the frontend.

        Args:
            vertex_source (str): the vertex source code
            fargment_source (str): the shader source code
            attribute_location( {str:int, ..}): the force attribute location if we don't want to use the default location.
            auto_execute (bool): do we execute all the commands automatically?

        Returns:
            GLResourceWidget: the resource that hold the program
        """
        vertex_shader = self.create_shader('VERTEX_SHADER')
        self.shader_source(vertex_shader, vertex_source)
        self.compile_shader(vertex_shader)
        fragment_shader = self.create_shader('FRAGMENT_SHADER')
        self.shader_source(fragment_shader, fargment_source)
        self.compile_shader(fragment_shader)
        program = self.create_program()
        self.attach_shader(program, vertex_shader)
        self.attach_shader(program, fragment_shader)
        if attribute_location is not None:
            for key, value in attribute_location.items():
                self.bind_attrib_location(program, value, key)

        self.link_program(program)
        self.use_program(None)

        if auto_execute:
            self.execute_commands(execute_once=True)

        return program


    def attach_shader(self, program:GLResourceWidget, shader:GLResourceWidget):
        """Append a attachShader command to the command buffer

        Args:
            program (GLResourceWidget): the program
            shader (GLResourceWidget): the shader

        """
        self._commands.append({'cmd':'attachShader', 'program':program.uid, 'shader':shader.uid})


    def bind_attrib_location(self, program:GLResourceWidget, index, name):
        """Append a bindAttribLocation command to the command buffer.

        Args:
            program (int): The WebGL program object.
            index (int): The index of the attribute variable to assign to the bound location.
            name (str): The name of the attribute variable.
        """
        self._commands.append({
            'cmd':'bindAttribLocation', 
            'program':program.uid, 
            'index':index, 
            'name':name
        })


    def link_program(self, program:GLResourceWidget):
        """Append a linkProgram command to the command buffer

        Args:
            program (GLResourceWidget): the program to link
        """
        self._commands.append({'cmd':'linkProgram', 'program':program.uid})


    def use_program(self, program:GLResourceWidget=None):
        """Append a useProgram command to the commands buffer.

        Args:
            program (GLResourceWidget): the program to use. Default to None.
        """
        uid = -1
        if (program is not None) :
            uid = program.uid
        self._commands.append({
            'cmd':'useProgram', 
            'program':uid
        })


    def uniform(self, name:str, array:np.array):
        """Append a uniform command to the commands buffer.

        Args:
            name (str): the name of the uniform
            array (np.array): the numpy array with the data. Even if you send one value it must be an array.
        """
        meta_data, buffer = array_to_buffer(array)
        meta_data['index'] = len(self._buffers)
        self._buffers.append(buffer)
        self._commands.append({
            'cmd': 'uniform',
            'name': name,
            'buffer_metadata':meta_data
        })


    def uniform_matrix(self, name:str, array:np.array):
        """Append a uniformMatrix command to the commands buffer.

        Args:
            name (str): the name of the uniform
            array (np.array): the matrix(matrices) to send. It must be a np.array(dtype=np.float32)
        """
        meta_data, buffer = array_to_buffer(array)
        meta_data['index'] = len(self._buffers)
        self._buffers.append(buffer)
        self._commands.append({
            'cmd': 'uniformMatrix',
            'name': name,
            'buffer_metadata':meta_data
        })


    def create_buffer(self) -> GLResourceWidget:
        """Append a createBuffer command to the command list

        Returns:
            GLResourceWidget: a resource that (will) hold the buffer after you call 'execute'
        """
        uid = len(self._resources)
        resource = GLResourceWidget(_context=self, uid=uid)
        self._resources.append(resource)
        self._commands.append({
            'cmd':'createBuffer', 
            'resource':uid
        })
        return resource


    def create_buffer_ext(self, target='ARRAY_BUFFER', src_data=None, usage='STATIC_DRAW', auto_execute=True) -> GLResourceWidget:
        """Extended create buffer command

        This build the command list with the create, bind, and buffer_data.
        at the end it unbind the buffer.
        If autoexecute is set it will send the command buffer to the frontend.

        Args:
            target (str, optional): _description_. Defaults to 'ARRAY_BUFFER'.
            src_data (np.array, optional): the data to send. Defaults to None.
            usage (str, optional): _description_. Defaults to 'STATIC_DRAW'.
            auto_execute(bool, optional): do we execute the commands. Defaults to True

        Returns:
            GLResourceWidget: the resource for the buffer
        """
        buffer = self.create_buffer()
        self.bind_buffer(target, buffer)
        self.buffer_data(target, src_data, usage, update_info=True)
        self.bind_buffer(target, None)

        if auto_execute:
            self.execute_commands(execute_once=True)

        return buffer


    def bind_buffer(self, target: str="ARRAY_BUFFER", buffer: GLResourceWidget=None):
        """Append a bindBuffer command to the command list

            This function binds a given WebGLBuffer to a target. The target must be one of the following strings:

            "ARRAY_BUFFER"
            "ELEMENT_ARRAY_BUFFER"
            "COPY_READ_BUFFER"
            "COPY_WRITE_BUFFER"
            "PIXEL_PACK_BUFFER"
            "PIXEL_UNPACK_BUFFER"
            "TRANSFORM_FEEDBACK_BUFFER"
            "UNIFORM_BUFFER"

        Args:
            target (str): the target string. Defaults to "ARRAY_BUFFER"
            buffer (GLResourceWidget): resource that hold the buffer. Defaults to None

        Raises:
            AttributeError: string not matching the values
        """
        if target not in ["ARRAY_BUFFER", "ELEMENT_ARRAY_BUFFER", "COPY_READ_BUFFER", "COPY_WRITE_BUFFER", "PIXEL_PACK_BUFFER", "PIXEL_UNPACK_BUFFER", "TRANSFORM_FEEDBACK_BUFFER", "UNIFORM_BUFFER"]:
            raise AttributeError("Invalid target")

        uid = -1
        if (buffer is not None):
            uid = buffer.uid
        self._commands.append({
            'cmd':'bindBuffer', 
            'target':target, 
            'buffer':uid
        })


    def buffer_data(self, target='ARRAY_BUFFER', src_data=None, usage='STATIC_DRAW', update_info=False):
        """Append a bufferData command to the command list

        Args:
            target (str, optional): _description_. Defaults to 'ARRAY_BUFFER'.
            src_data (np.array, optional): the data to send. Defaults to None.
            usage (str, optional): _description_. Defaults to 'STATIC_DRAW'.
            update_info(bool, optional): do we update the buffer info that are displayed in the widget. Defaults to False

        Raises:
            AttributeError: _description_
            AttributeError: _description_
        """
        if target not in ["ARRAY_BUFFER", "ELEMENT_ARRAY_BUFFER", "COPY_READ_BUFFER", "COPY_WRITE_BUFFER", "TRANSFORM_FEEDBACK_BUFFER", "UNIFORM_BUFFER"]:
            raise AttributeError("Invalid target")
        if usage not in ["STATIC_DRAW", "DYNAMIC_DRAW", "STREAM_DRAW", "STATIC_READ", "DYNAMIC_READ", "STREAM_READ", "STATIC_COPY", "DYNAMIC_COPY", "STREAM_COPY"]:
            raise AttributeError("Invalid usage")

        meta_data = {}
        buffer = []
        if (src_data is not None):
            meta_data, buffer = array_to_buffer(src_data)
            meta_data['index'] = len(self._buffers)
            self._buffers.append(buffer)
            self._commands.append({
                'cmd':'bufferData', 
                'target':target, 
                'usage':usage, 
                'update_info':update_info, 
                'buffer_metadata':meta_data
            })
        else:
            self._commands.append({
                'cmd':'bufferData', 
                'target':target, 
                'usage':usage, 
                'update_info':update_info
            })

    def buffer_sub_data(self, target='ARRAY_BUFFER', dst_byte_offset=0, src_data=None, src_offset=0):
        """Append a BufferSubData to the command list

            target values : ["ARRAY_BUFFER", "ELEMENT_ARRAY_BUFFER", "COPY_READ_BUFFER", "COPY_WRITE_BUFFER", "TRANSFORM_FEEDBACK_BUFFER", "UNIFORM_BUFFER"]
        Args:
            target (str, optional): specifying the binding point (target). Defaults to 'ARRAY_BUFFER'.
            dst_byte_offset (int, optional): specifying an offset in bytes where the data replacement will start. Defaults to 0.
            src_data (np.array, optional): the array that will be copied into the data store. Defaults to None.
            src_offset (int, optional): specifying the element index offset where to start reading the buffer. Defaults to 0.

        Raises:
            AttributeError: _description_
        """
        if target not in ["ARRAY_BUFFER", "ELEMENT_ARRAY_BUFFER", "COPY_READ_BUFFER", "COPY_WRITE_BUFFER", "TRANSFORM_FEEDBACK_BUFFER", "UNIFORM_BUFFER"]:
            raise AttributeError("Invalid target")

        meta_data = {}
        buffer = []
        if (src_data is not None):
            meta_data, buffer = array_to_buffer(src_data)
            meta_data['index'] = len(self._buffers)
            self._buffers.append(buffer)
            self._commands.append({
                'cmd':'bufferSubData', 
                'target':target, 
                'dst_byte_offset':dst_byte_offset, 
                'src_offset':src_offset, 
                'buffer_metadata':meta_data
            })
        else:
            self._commands.append({
                'cmd':'bufferSubData', 
                'target':target, 
                'dst_byte_offset':dst_byte_offset, 
                'src_offset':src_offset, 
            })

    def create_vertex_array(self) -> GLResourceWidget:
        """Append a createVertexArray command to the command list

        Returns:
            GLResourceWidget: a resource that (will) hold the vao after you call 'execute'
        """
        uid = len(self._resources)
        resource = GLResourceWidget(_context=self, uid=uid)
        self._resources.append(resource)
        self._commands.append({
            'cmd':'createVertexArray', 
            'resource':uid
        })
        return resource


    def create_vertex_array_ext(self, program:GLResourceWidget, bindings, indices=None, auto_execute=True) -> GLResourceWidget:
        """extended vertex array function

        This creates the vertex array and link all the attributes using the bindings.
        
        The bindings are a list of tuples with
        * [(buffer, "3f32 3f32", "in_vertex", "in_normal"), ...]
        * the buffer is a buffer resource
        * supported type for buffer definitions : [1, 2, 3, 4][i8, i16, i32, u8, u16, u32, f16, f32]

        Args:
            program (GLResourceWidget): the program to use
            bindings (List of tuple): [(buffer, "3f32 3f32", "in_vertex", "in_normal"), ...]"
            indices (np.array(dtype=u8 or dtype=u16)): the indices buffer to create. Defaults to None.
            auto_execute (bool) : do we execute the commands ?. Defaults to True.
        """
        attributePointers = []
        stride = 0
        for binding in bindings:
            buffer = binding[0]
            descriptions = binding[1]

            pointer = {'buffer':buffer, 'pointers':[], 'stride':0}
            attributePointers.append(pointer)

            for desciption_index, description_string in enumerate(descriptions.split()):
                size = description_string[0]
                attribtype = description_string[1:]
                name = binding[2 + desciption_index]

                if size not in ['1', '2', '3', '4']:
                    raise AttributeError("Invalid attribute size")
                if attribtype not in ['i8', 'i16', 'i32', 'u8', 'u16', 'u32', 'f16', 'f32']:
                    raise AttributeError("Invalid attribute type")

                size = int(size)
                attribsize = {'i8':1, 'i16':2, 'i32':4, 'u8':1, 'u16':2, 'u32':4, 'f16':2, 'f32':4}[attribtype]
                attribtype = {'i8':'BYTE', 'i16':'SHORT', 'i32':'INT', 'u8':'UNSIGNED_BYTE', 'u16':'UNSIGNED_SHORT', 'u32':'UNSIGNED_INT', 'f16':'HALF_FLOAT', 'f32':'FLOAT'}[attribtype]
                pointer['pointers'].append((name, size, attribtype, stride))
                stride += attribsize * size
            pointer['stride'] = stride

        # create the vertex array
        vao = self.create_vertex_array()
        self.bind_vertex_array(vao)
        self.use_program(program)

        # bind the attributes
        for attrib in attributePointers:
            self.bind_buffer('ARRAY_BUFFER', attrib['buffer'])

            for pointer in attrib['pointers']:
                self.enable_vertex_attrib_array(pointer[0])
                self.vertex_attrib_pointer(pointer[0], pointer[1], pointer[2], False, attrib['stride'], pointer[3])
        self.bind_buffer('ARRAY_BUFFER', None)

        # check if we need to create indices buffer
        if indices is not None:
            buffer = self.create_buffer()
            self.bind_buffer('ELEMENT_ARRAY_BUFFER', buffer)
            self.buffer_data('ELEMENT_ARRAY_BUFFER', indices, 'STATIC_DRAW', update_info=True)

        self.bind_vertex_array(None)
        self.use_program(None)

        if auto_execute:
            self.execute_commands(execute_once=True)

        return vao
        
            


    def bind_vertex_array(self, vertex_array:GLResourceWidget=None):
        """Append a bindVertexArray command to the commands buffer.

        Args:
            vertex_array (GLResourceWidget): the vertex array to bind. Defaults to None.
        """
        uid = -1
        if vertex_array :
            uid = vertex_array.uid
        self._commands.append({
            'cmd':'bindVertexArray', 
            'vertex_array':uid
        })


    def vertex_attrib_pointer(self, index, size: int, attribtype: str, normalized: bool, stride: int, offset: int):
        """Append a vertexAttribPointer command to the command buffer.
        
        Args:
            index (int or str): The index of the generic vertex attribute to be modified or the name of the attribute to find in the shader.
            size (int): Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4.
            attribtype (str): Specifies the data type of each component in the array.
                Can be one of "BYTE", "UNSIGNED_BYTE", "SHORT", "UNSIGNED_SHORT", "FLOAT", "HALF_FLOAT", "INT", "UNSIGNED_INT".
            normalized (bool): Specifies whether integer data values should be normalized when being casted to a float.
            stride (int): Specifies the byte offset between consecutive generic vertex attributes.
            offset (int): Specifies a offset, in bytes, of the first component in the vertex attribute array.
        """
        if size < 1 or size > 4:
            raise AttributeError("Invalid size")
        if attribtype not in ["BYTE", "UNSIGNED_BYTE", "SHORT", "UNSIGNED_SHORT", "FLOAT", "HALF_FLOAT", "INT", "UNSIGNED_INT"]:
            raise AttributeError("Invalid attribtype")
        self._commands.append({
            'cmd': 'vertexAttribPointer', 
            'index': index, 
            'size': size, 
            'type': attribtype, 
            'normalized': normalized, 
            'stride': stride, 
            'offset': offset
        })


    def vertex_attrib_i_pointer(self, index, size: int, attribtype: str, stride: int, offset: int):
        """Append a vertexAttribIPointer command to the command buffer.
        
        Args:
            index (int or str): The index of the generic vertex attribute to be modified or the name of the attribute to find in the shader.
            size (int): Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4.
            attribtype (str): Specifies the data type of each component in the array.
                Can be one of "BYTE", "UNSIGNED_BYTE", "SHORT", "UNSIGNED_SHORT", "INT", "UNSIGNED_INT".
            stride (int): Specifies the byte offset between consecutive generic vertex attributes.
            offset (int): Specifies a offset, in bytes, of the first component in the vertex attribute array.
        """
        if attribtype not in ["BYTE", "UNSIGNED_BYTE", "SHORT", "UNSIGNED_SHORT", "INT", "UNSIGNED_INT"]:
            raise AttributeError("Invalid attribtype")
        self._commands.append({
            'cmd': 'vertexAttribIPointer', 
            'index': index, 
            'size': size, 
            'type': attribtype, 
            'stride': stride, 
            'offset': offset
        })


    def enable_vertex_attrib_array(self, index):
        """Append an enableVertexAttribArray command to the command buffer.

        Args:
            index (int or str): Specifies the index of the generic vertex attribute to be enabled or the name of the attribute to find in the shader.
        """
        self._commands.append({
            'cmd': 'enableVertexAttribArray',
            'index': index
        })


    def disable_vertex_attrib_array(self, index):
        """Append an disableVertexAttribArray command to the command buffer.

        Args:
            index (int or str): Specifies the index of the generic vertex attribute to be enabled or the name of the attribute to find in the shader.
        """
        self._commands.append({
            'cmd': 'disableVertexAttribArray',
            'index': index
        })

    
    def vertex_attrib_divisor(self, index, divisor: int):
        """Append an vertexAttribDivisor command to the command buffer.

            modifies the rate at which generic vertex attributes advance when rendering multiple instances of primitives with gl.drawArraysInstanced() and gl.drawElementsInstanced().
        Args:
            index (int or str): Specifies the index of the generic vertex attribute to be enabled or the name of the attribute to find in the shader.
            divisor(int): specifying the number of instances that will pass between updates of the generic attribute.
        """
        self._commands.append({
            'cmd': 'vertexAttribDivisor',
            'index': index,
            'divisor': divisor
        })


    def vertex_attrib_fv(self, index, value: np.array):
        """Append an vertexAttrib[1234]fv command to the command buffer.

            the type of vertexAttrib function to call will be decided from the shape of the array.
        Args:
            index (int or str): Specifies the index of the generic vertex attribute or the name of the attribute to find in the shader.
            value(np.array(dtype=np.float32)): values to push.
        """
        meta_data, buffer = array_to_buffer(value)
        meta_data['index'] = len(self._buffers)
        self._buffers.append(buffer)
        self._commands.append({
            'cmd': 'vertexAttrib[1234]fv',
            'index': index,
            'buffer_metadata':meta_data
        })


    def vertex_attrib_i4_fv(self, index, value: np.array):
        """Append an vertexAttribI4[u]iv command to the command buffer.

            the type of vertexAttrib function to call will be decided from the type of the array.
        Args:
            index (int or str): Specifies the index of the generic vertex attribute or the name of the attribute to find in the shader.
            value(np.array(dtype=np.uint32 or dtype=np.int32)): values to push.
        """
        meta_data, buffer = array_to_buffer(value)
        meta_data['index'] = len(self._buffers)
        self._buffers.append(buffer)
        self._commands.append({
            'cmd': 'vertexAttribI4[u]iv',
            'index': index,
            'buffer_metadata':meta_data
        })


    def draw_arrays(self, mode:str, first:int, count:int):
        """Append a drawArrays command to the commands buffer

        Args:
            mode ({'POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES'}): type of drawing operation.
            first (int): the starting index in the array of vector points.
            count (int): the number of indices to be rendered.
        """
        if mode not in ['POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES']:
            raise AttributeError("Invalid mode")
        self._commands.append({
            'cmd':'drawArrays', 
            'mode':mode, 
            'first':first, 
            'count':count
        })

    
    def draw_arrays_instanced(self, mode:str, first:int, count:int, instance_count:int):
        """Append a drawArraysInstanced command to the commands buffer

        Args:
            mode ({'POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES'}): type of drawing operation.
            first (int): the starting index in the array of vector points.
            count (int): the number of indices to be rendered.
            instance_count(int): the number of instances fo the range of elements to execute.
        """
        if mode not in ['POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES']:
            raise AttributeError("Invalid mode")
        self._commands.append({
            'cmd':'drawArraysInstanced', 
            'mode':mode, 
            'first':first, 
            'count':count,
            'instance_count':instance_count
        })


    def draw_elements(self, mode:str, count:int, bytetype:str, offset:int):
        """Append a drawElements command to the commands buffer

        Args:
            mode ({'POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES'}): type of drawing operation.
            count (int): specifying the number of elements of the bound element array buffer to be rendered.
            bytetype ({'UNSIGNED_BYTE', 'UNSIGNED_SHORT'}): type of data in the index buffer.
            offset (int): a byte offset in the element array buffer. Must be a valid multiple of the size of the given type.
        """
        if mode not in ['POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES']:
            raise AttributeError("Invalid mode")
        if bytetype not in ['UNSIGNED_BYTE', 'UNSIGNED_SHORT']:
            raise AttributeError("Invalid type")
        self._commands.append({
            'cmd':'drawElements', 
            'mode':mode, 
            'count':count, 
            'type':bytetype, 
            'offset':offset
        })

    
    def draw_elements_instanced(self, mode:str, count:int, bytetype:str, offset:int, instance_count:int):
        """Append a drawElementsInstanced command to the commands buffer

        Args:
            mode ({'POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES'}): type of drawing operation.
            count (int): specifying the number of elements of the bound element array buffer to be rendered.
            bytetype ({'UNSIGNED_BYTE', 'UNSIGNED_SHORT'}): type of data in the index buffer.
            offset (int): a byte offset in the element array buffer. Must be a valid multiple of the size of the given type.
            instance_count (int): the number of instances of the set of elements to execute.
        """
        if mode not in ['POINTS', 'LINE_STRIP', 'LINE_LOOP', 'LINES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN', 'TRIANGLES']:
            raise AttributeError("Invalid mode")
        if bytetype not in ['UNSIGNED_BYTE', 'UNSIGNED_SHORT']:
            raise AttributeError("Invalid type")
        self._commands.append({
            'cmd':'drawElementsInstanced', 
            'mode':mode, 
            'count':count, 
            'type':bytetype, 
            'offset':offset,
            'instance_count':instance_count
        })
            

    def create_framebuffer(self) -> GLResourceWidget:
        """Append a createFramebuffer command to the command list

        Returns:
            GLResourceWidget: the resource that will hold the framebuffer
        """
        uid = len(self._resources)
        resource = GLResourceWidget(_context=self, uid=uid)
        self._resources.append(resource)
        self._commands.append({
            'cmd':'createFramebuffer', 
            'resource':uid
        })
        return resource


    def bind_framebuffer(self, target:str, framebuffer:GLResourceWidget=None):
        """Append a bindFramebuffer command

        Args:
            target (str): the binding point (target) ["FRAMEBUFFER", "DRAW_FRAMEBUFFER", "READ_FRAMEBUFFER"]
            framebuffer (GLResourceWidget): the framebuffer
        """
        if target not in ["FRAMEBUFFER", "DRAW_FRAMEBUFFER", "READ_FRAMEBUFFER"]:
            raise AttributeError("Invalid target")
        uid = -1
        if framebuffer is not None:
            uid = framebuffer.uid
        self._commands.append({
            'cmd':'bindFramebuffer', 
            'target':target,
            'framebuffer':uid
        })


    def framebuffer_texture_2d(self, target:str, attachement:str, textarget:str, texture:GLResourceWidget, level:int):
        """Append a framebufferTexture2D command

        Args:
            target (str): the binding point (target). ["FRAMEBUFFER", "DRAW_FRAMEBUFFER", "READ_FRAMEBUFFER"]
            attachement (str):  the attachment point for the texture. ["COLOR_ATTACHMENT0", "DEPTH_ATTACHMENT", "STENCIL_ATTACHMENT", 'DEPTH_STENCIL_ATTACHMENT', 'COLOR_ATTACHMENT1', 'COLOR_ATTACHMENT2', 'COLOR_ATTACHMENT3', 'COLOR_ATTACHMENT4', 'COLOR_ATTACHMENT5', 'COLOR_ATTACHMENT6', 'COLOR_ATTACHMENT7', 'COLOR_ATTACHMENT8', 'COLOR_ATTACHMENT9', 'COLOR_ATTACHMENT10', 'COLOR_ATTACHMENT11', 'COLOR_ATTACHMENT12', 'COLOR_ATTACHMENT13', 'COLOR_ATTACHMENT14', 'COLOR_ATTACHMENT15']:
            textarget (str): the texture target. ['TEXTURE_2D', 'TEXTURE_CUBE_MAP_POSITIVE_X', 'TEXTURE_CUBE_MAP_NEGATIVE_X', 'TEXTURE_CUBE_MAP_POSITIVE_Y', 'TEXTURE_CUBE_MAP_NEGATIVE_Y', 'TEXTURE_CUBE_MAP_POSITIVE_Z', 'TEXTURE_CUBE_MAP_NEGATIVE_Z']
            texture (GLResourceWidget): the texture.
            level (int): the mipmap level of the texture image to be attached. Must be 0.
        """
        if target not in ["FRAMEBUFFER", "DRAW_FRAMEBUFFER", "READ_FRAMEBUFFER"]:
            raise AttributeError("Invalid target")

        if attachement not in ["COLOR_ATTACHMENT0", "DEPTH_ATTACHMENT", "STENCIL_ATTACHMENT", 
            'DEPTH_STENCIL_ATTACHMENT', 'COLOR_ATTACHMENT1', 'COLOR_ATTACHMENT2', 'COLOR_ATTACHMENT3', 'COLOR_ATTACHMENT4', 'COLOR_ATTACHMENT5', 'COLOR_ATTACHMENT6', 'COLOR_ATTACHMENT7', 'COLOR_ATTACHMENT8', 'COLOR_ATTACHMENT9', 'COLOR_ATTACHMENT10', 'COLOR_ATTACHMENT11', 'COLOR_ATTACHMENT12', 'COLOR_ATTACHMENT13', 'COLOR_ATTACHMENT14', 'COLOR_ATTACHMENT15']:
            raise AttributeError("Invalid attachement")

        if textarget not in ['TEXTURE_2D', 'TEXTURE_CUBE_MAP_POSITIVE_X', 'TEXTURE_CUBE_MAP_NEGATIVE_X', 'TEXTURE_CUBE_MAP_POSITIVE_Y', 'TEXTURE_CUBE_MAP_NEGATIVE_Y', 'TEXTURE_CUBE_MAP_POSITIVE_Z', 'TEXTURE_CUBE_MAP_NEGATIVE_Z']:
            raise AttributeError("Invalid textarget")

        self._commands.append({
            'cmd':'framebufferTexture2D', 
            'target':target,
            'attachement':attachement,
            'textarget':textarget,
            'texture':texture.uid,
            'level':level
        })