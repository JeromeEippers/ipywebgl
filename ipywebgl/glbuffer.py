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

    def update(self, target='array_buffer', src_data=None, usage='static_draw'):
        """update the buffer data

        This call will also bind the buffer before calling bufferData.
        So be carrefull if you do an 'element_array_buffer' manually, you will need to have a vertex array bound first. (and that might be tricky to unsure when using this update method)

        If you need to update a buffer during rendering, use the buffer_data method on the GLViewer.

        Args:
            target ({'array_buffer', 'element_array_buffer', 'copy_read_buffer', 'copy_write_buffer', 'transform_feedback_buffer', 'uniform_buffer', 'pixel_pack_buffer', 'pixel_unpack_buffer'}, optional): the binding point (target). Defaults to 'array_buffer'.
            srcData (np.array, optional): a np.array that will be copied into the data store. If null, a data store is still created, but the content is uninitialized and undefined.. Defaults to None.
            usage ({'static_draw', 'dynamic_draw', 'stream_draw', 'static_read', 'dynamic_read', 'stream_read', 'static_copy', 'dynamic_copy', 'stream_copy'}, optional):  the intended usage pattern of the data store for optimization purposes. Defaults to 'static_draw'.
        """
        self.send({'cmd':'update', 'target':target, 'srcData':array_to_buffer(src_data), 'usage':usage})

