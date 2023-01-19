from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Int, Bool, validate, TraitError, Instance, List

from ._frontend import module_name, module_version
from .arraybuffer import array_to_buffer
from .glprogram import GLProgramWidget
from .glbuffer import GLBufferWidget
from .glvertexarray import GLVertexArrayWidget

@register
class GLViewer(DOMWidget):
    """TODO: Add docstring here
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
        self.last_program += 1
        prog = GLProgramWidget(_glmodel=self, uid=self.last_program)
        return prog

    def create_buffer(self):
        self.last_buffer += 1
        buf = GLBufferWidget(_glmodel=self, uid=self.last_buffer)
        return buf

    def create_vao(self):
        self.last_vao += 1
        vao = GLVertexArrayWidget(_glmodel=self, uid=self.last_vao)
        return vao

    def render(self):
        self.send(self.commands)
        self.commands=[]

    #gl commands
    def clear_color(self, r,g,b,a):
        self.commands.append({'cmd':'clearColor', 'r':float(r), 'g':float(g), 'b':float(b), 'a':float(a)})

    def clear(self):
        self.commands.append({'cmd':'clear'})

    def use_program(self, program):
        self.commands.append({'cmd':'useProgram', 'program':program.uid})

    def bind_vao(self, vao):
        self.commands.append({'cmd':'bindVertexArray', 'vao':vao.uid})

    def set_uniform(self, name, array):
        self.commands.append({'cmd':'uniform', 'name':name, 'buffer':array_to_buffer(array)})

    def set_uniform_matrix(self, name, array):
        self.commands.append({'cmd':'uniformMatrix', 'name':name, 'buffer':array_to_buffer(array)})

    def draw_arrays(self, draw_type, first, count):
        self.commands.append({'cmd':'drawArrays', 'type':draw_type, 'first':first, 'count':count})
    
