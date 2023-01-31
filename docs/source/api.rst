API Reference
=============

This module is exposing a part of the WebGL2 context.  Is is assumed that you are familiar with the concepts and commands.
You can find more information about it here : https://webgl2fundamentals.org/

There is some major differences still :

- All the WebGL2 commands are called on the GLViewer instead of a gl context.
- All the API is written in *snake_case* instead of *camelCase*, so for example ``gl.drawArrays(...)`` in JavaScript becomes ``widget.draw_arrays(...)`` in Python
- Masks parameters are replace by positional attribute, so for example ``gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);`` in JavaScript becomes ``widget.clear(depth_buffer_bit=True, color_buffer_bit=True)`` in Python
- Enums are replaced by strings, so for example ``gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);`` in JavaScript becomes ``widget.buffer_data("array_buffer", data, "dynamic_draw")`` in Python


.. automodule:: ipywebgl.glviewer
   :members:

.. automodule:: ipywebgl.glresource
   :members:
