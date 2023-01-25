from ipywidgets import DOMWidget, Widget, register, widget_serialization
from traitlets import Unicode, Int, Bool, validate, TraitError, Instance, List

import numpy as np

from ._frontend import module_name, module_version
from .arraybuffer import array_to_buffer

@register
class GLVertexArrayWidget(DOMWidget):
    _model_name = Unicode('GLVertexArray').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('GLVertexArrayView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)
      
    _glmodel = Instance(DOMWidget).tag(sync=True, **widget_serialization)
    uid = Int(-1).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def bind(self, program, buffer_definitions):
        """bind a program, one or more buffer array and link the attributes.

        supported type for buffer definitions : [1, 2, 3, 4][i8, i16, i32, u8, u16, u32, f16, f32]

        Args:
            program (GLProgramWidget): the program to use
            buffer_definitions (List of tuple): [(buffer, "3f32 3f32", "in_vertex", "in_normal"), ...]", the buffer is a GLBufferWidget
        """
        buffers = []
        for buf_def in buffer_definitions:
            buffer_index = buf_def[0].uid
            attributes = []
            for def_index, def_string in enumerate(buf_def[1].split()):
                for value in ['i8', 'i16', 'i32', 'u8', 'u16', 'u32', 'f16', 'f32']:
                    if value in def_string:
                        attributes.append({'type': value, 'count':int(def_string.replace(value,'')), 'attrib':buf_def[def_index+2]})
            buffers.append({'buffer':buffer_index, 'attributes':attributes})
            
        self.send({'type':'bind', 'program':program.uid, 'buffers':buffers})

    def create_index_buffer(self, src_data:np.array):
        """create and bind an index buffer to the current vertex array

        Args:
            src_data (np.array(dtype=uint8 or uint16)) : the indices of this buffer

        Returns:
            GLBufferWidget: the buffer widget with the index array
        """
        index_buffer = self._glmodel.create_buffer()
        self.send({'type':'bindIndex', 'buffer':index_buffer.uid, 'srcData':array_to_buffer(src_data)})
        return index_buffer


