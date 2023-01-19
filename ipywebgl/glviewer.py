from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Int, Bool, validate, TraitError, Instance, List

from ._frontend import module_name, module_version
from .arraybuffer import array_to_buffer
from .glprogram import GLProgramWidget
from .glbuffer import GLBufferWidget
from .glvertexarray import GLVertexArrayWidget

@register
class GLViewer(DOMWidget):
    """The web gl viewer of the library.
    
    All the opengl commands you set on your instance will be cached in a buffer until you call the render method.
    When a render is called, the command buffer is sent to the frontend and it will be stored there.
    Everytime the view needs to be re-rendered (because of a camera move for instance) it re-excute the entire command buffer.

    If you have to execute a bunch of commands before starting to really draw, don't forget to call the render method to send those commands.

    Returns:
        ipywidget
    """
    _model_name = Unicode('GLModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('GLViewer').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    width = Int(700).tag(sync=True)
    height = Int(500).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.last_program = -1
        self.last_buffer = -1
        self.last_vao = -1
        self.commands = []

    def create_program(self):
        """creates a GL Program.
        You will have to call the compile method on that instance to actually compile some glsl code.

        Returns:
            GLProgramWidget: a widget that will store your program and allows for simple debug view in the notebook
        """
        self.last_program += 1
        prog = GLProgramWidget(_glmodel=self, uid=self.last_program)
        return prog

    def create_buffer(self, is_dynamic=False):
        """create a buffer
        You can call the update method on that buffer to set some data in.

        Args:
            is_dynamic (bool): do you intend to use this buffer as a dynamic one (default is False)

        Returns:
            GLBufferWidget: a widget that will store your buffer and allows for a simple debug view in the notebook
        """
        self.last_buffer += 1
        buf = GLBufferWidget(is_dynamic, _glmodel=self, uid=self.last_buffer)
        return buf

    def create_vao(self):
        """Create a vertex array object
        You have to call the bind method on that vao to bind the program and the buffers to it

        Returns:
            GLVerteArrayWidget : a widget that will store your vao and allows for a simple debug view in the notebook
        """
        self.last_vao += 1
        vao = GLVertexArrayWidget(_glmodel=self, uid=self.last_vao)
        return vao

    def clear_commands(self):
        """clear the command list without sending it for render
        """
        self.commands=[]

    def render(self):
        """send the commands to the frontend.
        This will send all the accumulated commands to the frontend to be rendered.
        And then it clears the command buffer
        """
        self.send(self.commands)
        self.clear_commands()

    #gl commands
    def clear_color(self, r,g,b,a):
        """set the clear color.
        [append to the commands to be send when rendering]

        Args:
            r (float): red [0, 1]
            g (float): green [0, 1]
            b (float): blue [0, 1]
            a (float): alpha [0, 1]
        """
        self.commands.append({'cmd':'clearColor', 'r':float(r), 'g':float(g), 'b':float(b), 'a':float(a)})

    def clear(self, depth=True, color=True):
        """clear the color and or depth buffer
        [append to the commands to be send when rendering]

        Args:
            depth (bool, optional): clear the depth buffer. Defaults to True.
            color (bool, optional): clear the color buffer. Defaults to True.
        """
        self.commands.append({'cmd':'clear', 'depth':depth, 'color':color})

    def use_program(self, program):
        """activate a program
        [append to the commands to be send when rendering]

        Args:
            program (GLProgramWidget): the program to use in webgl
        """
        self.commands.append({'cmd':'useProgram', 'program':program.uid})

    def bind_vao(self, vao):
        """bind a vertex array object
        [append to the commands to be send when rendering]

        Args:
            vao (GLVertexArrayWidget): the vertex array object to bind to webgl
        """
        self.commands.append({'cmd':'bindVertexArray', 'vao':vao.uid})

    def set_uniform(self, name, array):
        """set a uniform.
        [append to the commands to be send when rendering]

        Args:
            name (string): the name of the uniform in the program
            array (np.array): the array of value to set on the uniform. Must be an array even if it is one single value.
        """
        self.commands.append({'cmd':'uniform', 'name':name, 'buffer':array_to_buffer(array)})

    def set_uniform_matrix(self, name, array):
        """set a uniform matrix.
        [append to the commands to be send when rendering]

        Args:
            name (string): the name of the uniform in the program
            array (np.array): the array of value to set on the uniform. Must be a dtype=np.float32.
        """
        self.commands.append({'cmd':'uniformMatrix', 'name':name, 'buffer':array_to_buffer(array)})

    def draw_arrays(self, draw_type, first, count):
        """draw a vao
        [append to the commands to be send when rendering]

        Args:
            draw_type (string): type of drawing ['triangles', 'triangle_fan', 'triangle_strip', 'points', 'lines', 'line_strip', 'line_loop']
            first (int): offset of the first vertex in the vao
            count (int): number of vertices that will be drawn
        """
        self.commands.append({'cmd':'drawArrays', 'type':draw_type, 'first':first, 'count':count})
    
