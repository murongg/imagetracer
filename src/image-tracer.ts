import { SPECPALETTE, VERSION_NUMBER } from './constants'
import { OPTION_PRESETS } from './presets'
import type { ImageTracerOptionsParamers, MaybeImageTracerOptions, Tracedata } from './types'
import { batchInterNodes, batchPathScan, batchTraceLayers, batchTracePaths, colorQuantization, drawLayers, getSvgString, interNodes, layering, layeringStep, pathScan } from './utils'

export type OptionsString = 'default' | ''

export class ImageTracer {
  versionnumber = VERSION_NUMBER
  optionpresets = OPTION_PRESETS

  /**
   * creating options object, setting defaults for missing values
   * @param options
   */
  checkOptions(options: ImageTracerOptionsParamers): MaybeImageTracerOptions {
    let result: MaybeImageTracerOptions = { ...this.optionpresets.default }
    // Option preset
    if (typeof options === 'string') {
      const presetName = options
      const preset = this.optionpresets[presetName]
      result = preset || {}
    }

    if (typeof options === 'object') {
      // Defaults
      result = { ...options }
    }
    // options.pal is not defined here, the custom palette should be added externally: options.pal = [ { 'r':0, 'g':0, 'b':0, 'a':255 }, {...}, ... ];
    // options.layercontainerid is not defined here, can be added externally: options.layercontainerid = 'mydiv'; ... <div id="mydiv"></div>
    return result
  }

  /**
   * Loading an image from a URL, tracing when loaded,
   * then executing callback with the scaled svg string as argument
   * @param url
   * @param callback
   * @param options
   */
  async imageToSVG(url: string, options: ImageTracerOptionsParamers) {
    options = this.checkOptions(options)
    // loading image, tracing and callback
    const canvas = await this.loadImage(url, options)
    return this.imageDataToSVG(this.getImgdata(canvas), options)
  }

  getImgdata(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    return context.getImageData(0, 0, canvas.width, canvas.height)
  }

  /**
   * Helper function: getting ImageData from a canvas
   * @param url
   * @param callback
   * @param options
   */
  loadImage(url: string, options: MaybeImageTracerOptions): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
      const img = new Image()
      if (options && options.corsenabled)
        img.crossOrigin = 'Anonymous'
      img.src = url
      img.onload = function () {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const context = canvas.getContext('2d')
        context?.drawImage(img, 0, 0)
        resolve(canvas)
      }
    })
  }

  /**
   * Tracing imagedata, then returning the scaled svg string
   * @param imgd
   * @param options
   */
  imageDataToSVG(imgd: ImageData, options: ImageTracerOptionsParamers) {
    options = this.checkOptions(options)
    // tracing imagedata
    const td = this.imageDataToTracedata(imgd, options)
    // returning SVG string
    return getSvgString(td, options)
  }

  /**
   * Loading an image from a URL, tracing when loaded,
   * then executing callback with tracedata as argument
   * @param url
   * @param callback
   * @param options
   */
  async imageToTracedata(url: string, options: ImageTracerOptionsParamers) {
    options = this.checkOptions(options)
    // loading image, tracing and callback
    const canvas = await this.loadImage(url, options)
    return this.imageDataToTracedata(this.getImgdata(canvas), options)
  }

  /**
   * Tracing imagedata, then returning tracedata (layers with paths, palette, image size)
   * @param imgd
   * @param options
   */
  imageDataToTracedata(imgd: ImageData, options: ImageTracerOptionsParamers): Tracedata {
    options = this.checkOptions(options)
    let tracedata: Tracedata
    // 1. Color quantization
    const ii = colorQuantization(imgd, options)

    if (options.layering === 0) { // Sequential layering
      // create tracedata object
      tracedata = {
        layers: [],
        palette: ii.palette,
        width: ii.array[0].length - 2,
        height: ii.array.length - 2,
      }

      // Loop to trace each color layer
      for (let colornum = 0; colornum < ii.palette.length; colornum++) {
        // layeringstep -> pathscan -> internodes -> batchtracepaths
        const tracedlayer
          = batchTracePaths(
            interNodes(
              pathScan(
                layeringStep(ii, colornum),
                options.pathomit,
              ),
              options,
            ),
            options.ltres,
            options.qtres,
          )

        // adding traced layer
        tracedata.layers.push(tracedlayer)
      }// End of color loop
    }
    else { // Parallel layering
      // 2. Layer separation and edge detection
      const ls = layering(ii)

      // Optional edge node visualization
      if (options.layercontainerid)
        drawLayers(ls, SPECPALETTE, options.scale, options.layercontainerid)

      // 3. Batch pathscan
      const bps = batchPathScan(ls, options.pathomit)

      // 4. Batch interpollation
      const bis = batchInterNodes(bps, options)

      // 5. Batch tracing and creating tracedata object
      tracedata = {
        layers: batchTraceLayers(bis, options.ltres, options.qtres),
        palette: ii.palette,
        width: imgd.width,
        height: imgd.height,
      }
    }// End of parallel layering

    // return tracedata
    return tracedata
  }

  /**
   * Helper function: Appending an <svg> element to a container from an svgstring
   * @param svgstr
   * @param parentid
   */
  appendSVGString(svgstr: string, parentid: string) {
    let div
    if (parentid) {
      div = document.getElementById(parentid)
      if (!div) {
        div = document.createElement('div')
        div.id = parentid
        document.body.appendChild(div)
      }
    }
    else {
      div = document.createElement('div')
      document.body.appendChild(div)
    }
    div.innerHTML += svgstr
  }
}

export const imageTracer = new ImageTracer()
