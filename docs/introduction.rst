=============
Introduction
=============

.. image:: ..docs/images/logo_256.png
   :alt: a WebGL2 wrapper for jupyter lab
   :align: center

This module is exposing a part of the WebGL2 context.  Is is assumed that you are familiar with the concepts and commands.
You can find more information about it here : https://webgl2fundamentals.org/

There is some major differences still :

- All the WebGL2 commands are called on the GLViewer instead of a gl context.
- All the API is written in *snake_case* instead of *camelCase*, so for example ``gl.drawArrays(...)`` in JavaScript becomes ``widget.draw_arrays(...)`` in Python
- Masks parameters are replaced by positional attribute, so for example ``gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);`` in JavaScript becomes ``widget.clear(depth_buffer_bit=True, color_buffer_bit=True)`` in Python
- Enums are replaced by strings, so for example ``gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);`` in JavaScript becomes ``widget.buffer_data("ARRAY_BUFFER", data, "DYNAMIC_DRAW")`` in Python
- There is no delete functions, once something is created it stays created (we are in a prototype environment).
- You will find some 'Extended' methods that can simplify some calls like the ``create_vertex_array_ext`` that will create and link the programs and buffers all at once.

Not all the functions are exposed as of today.
If you need more, feel free to ask on github https://github.com/JeromeEippers/ipywebgl.

All the commands you call on the GLViewer are push to a commands buffer. That commands buffer is only flushed when you call the execute_commands() method.

Check the examples for more info.
