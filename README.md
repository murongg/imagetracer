# imagetracer

[![NPM version](https://img.shields.io/npm/v/imagetracer?color=a1b858&label=)](https://www.npmjs.com/package/imagetracer)

## 📎 Installation
```sh
$ npm install imagetracer
```
## 👽 Usage

```js
import { imageTracer } from 'imagetracer'
const svg = imageTracer.imageToSVG(imageUrl)
```



## API
| Function name              | Arguments                                              | Returns              | Run type                       |
| -------------------------- | ------------------------------------------------------ | -------------------- | ------------------------------ |
| ```imageToSVG```           | `url: string, options: ImageTracerOptionsParamers`     | `Promise<string> `   | Asynchronous, Browser only     |
| ```imageDataToSVG```       | `imgd: ImageData, options: ImageTracerOptionsParamers` | `string`             | Synchronous, Browser & Node.js |
| ```imageToTracedata```     | `url: string, options: ImageTracerOptionsParamers`     | `Promise<Tracedata>` | Asynchronous, Browser only     |
| ```imageDataToTracedata``` | `imgd: ImageData, options: ImageTracerOptionsParamers` | `Tracedata`          | Synchronous, Browser & Node.js |

```imagedata``` is standard [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) here, ```canvas``` is [canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas) .

### Helper Functions (Browser only)
| Function name         | Arguments                                       | Returns                                                                         | Run type                   |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------- |
| ```appendSVGString``` | `svgstr: string, parentid: string`              | Nothing, an SVG will be appended to the container DOM element with id=parentid. | Synchronous, Browser only  |
| ```loadImage```       | `url: string, options: MaybeImageTracerOptions` | `Promise<HTMLCanvasElement>`                                                    | Asynchronous, Browser only |
| ```getImgdata```      | `canvas: HTMLCanvasElement`                     | `ImageData`                                                                     | Synchronous, Browser only  |

There are more functions for advanced users, read the source if you are interested. :)

"Browser only" means that Node.js doesn't have built-in canvas and DOM support as of 2018, so loading an image to an ImageData object needs an external library. 

## Options
You can use an option preset name (string) or an [options object](https://github.com/murongg/imagetracer/blob/master/options.md) to control the tracing and rendering process.

![Option presets gallery](https://github.com/murongg/imagetracer/blob/main/assets/option_presets_small.jpg?raw=true)

These strings can be passed instead of the options object:
```'default'```
```'posterized1'```
```'posterized2'```
```'posterized3'```
```'curvy'```
```'sharp'```
```'detailed'```
```'smoothed'```
```'grayscale'```
```'fixedpalette'```
```'randomsampling1'```
```'randomsampling2'```
```'artistic1'```
```'artistic2'```
```'artistic3'```
```'artistic4'```

[Read more about options.](https://github.com/murongg/imagetracer/blob/master/options.md)

