from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Int, Bool, validate, TraitError, Instance, List

import numpy as np

from ._frontend import module_name, module_version


@register
class GLProgramWidget(DOMWidget):
    _model_name = Unicode('GLProgram').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('GLProgramView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
      
    _glmodel = Instance(DOMWidget).tag(sync=True, **widget_serialization)
    uid = Int(-1).tag(sync=True)
    vertex_shader_message = Unicode('').tag(sync=True)
    pixel_shader_message = Unicode('').tag(sync=True)
    program_message = Unicode('').tag(sync=True)
    ready = Bool(False).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def compile(self, vertex_code:str, fragment_code:str):
        """Compile the vertex and fragment shader code and link them to the program.

        Args:
            vertex_code (str): the vertex shader code
            fragment_code (str): the fragment shader code
        """
        self.send({'type':'compile', 'vertex_code':vertex_code, 'fragment_code':fragment_code})
