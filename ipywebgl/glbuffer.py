from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Int, Bool, validate, TraitError, Instance, List

from ._frontend import module_name, module_version
from .arraybuffer import array_to_buffer

@register
class GLBufferWidget(DOMWidget):
    _model_name = Unicode('GLBuffer').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('GLBufferView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
      
    _glmodel = Instance(DOMWidget).tag(sync=True, **widget_serialization)
    uid = Int(-1).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def update(self, data):
        self.send({'type':'update', 'data':array_to_buffer(data)})

