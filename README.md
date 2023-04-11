
# ipywebgl

<center>
<img src='logo_256.png'><br>
A WebGL2 widget for Jupyter Lab
</center>

## Introduction

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

## Installation

You can install using `pip`:

```bash
pip install ipywebgl
```

## Development Installation

Create a dev environment:
```bash
conda create -n ipywebgl-dev -c conda-forge nodejs yarn python jupyterlab
conda activate ipywebgl-dev
```

Install the python. This will also build the TS package.
```bash
pip install -e .
```

When developing your extensions, you need to manually enable your extensions with the
notebook / lab frontend. For lab, this is done by the command:

```
jupyter labextension develop --overwrite .
yarn run build
```

For classic notebook, you need to run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py ipywebgl
jupyter nbextension enable --sys-prefix --py ipywebgl
```

Note that the `--symlink` flag doesn't work on Windows, so you will here have to run
the `install` command every time that you rebuild your extension. For certain installations
you might also need another flag instead of `--sys-prefix`, but we won't cover the meaning
of those flags here.

### How to see your changes
#### Typescript:
If you use JupyterLab to develop then you can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the widget.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
yarn run watch
# Run JupyterLab in another terminal
jupyter lab
```

After a change wait for the build to finish and then refresh your browser and the changes should take effect.

#### Python:
If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.

## Updating the version

To update the version, install tbump and use it to bump the version.
By default it will also create a tag.

```bash
pip install tbump
tbump <new-version>
```

