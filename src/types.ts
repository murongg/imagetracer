export interface ImageTracerOptions {
  // Tracing Start
  // Enable or disable CORS Image loading https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
  corsenabled: boolean
  // Error treshold for straight lines.
  ltres: number
  // Error treshold for quadratic splines.
  qtres: number
  // Edge node paths shorter than this will be discarded for noise reduction.
  pathomit: number
  // Enhance right angle corners.
  rightangleenhance: boolean
  // Tracing End

  // Color quantization Start
  // 0: disabled, generating a palette; 1: random sampling; 2: deterministic sampling
  colorsampling: Colorsampling
  // Number of colors to use on palette if pal object is not defined.
  numberofcolors: number
  // Color quantization will randomize a color if fewer pixels than (total pixels*mincolorratio) has it.
  mincolorratio: number
  // Color quantization will be repeated this many times.
  colorquantcycles: number
  // Color quantization End

  // Layering Start
  layering: number
  // Layering End

  // SVG rendering Start
  // SVG stroke-width https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width
  strokewidth: number
  // Enable or disable line filter for noise reduction.
  linefilter: boolean
  // Every coordinate will be multiplied with this, to scale the SVG.
  scale: number
  // rounding coordinates to a given decimal place. 1 means rounded to 1 decimal place like 7.3 ; 3 means rounded to 3 places, like 7.356
  roundcoords: number
  // Enable or disable SVG viewBox.
  viewbox: boolean
  // Enable or disable SVG descriptions.
  desc: boolean
  // SVG rendering End

  // Blur preprocessing Start
  // Set this to 1..5 for selective Gaussian blur preprocessing.
  blurradius: number
  // RGBA delta treshold for selective Gaussian blur preprocessing.
  blurdelta: number
  // Blur preprocessing End

  // Debug Start
  // Edge node layers can be visualized if a container div's id is defined.
  layercontainerid?: string
  // Straight line control point radius, if this is greater than zero, small circles will be drawn in the SVG. Do not use this for big/complex images.
  lcpr: number
  // Quadratic spline control point radius, if this is greater than zero, small circles and lines will be drawn in the SVG. Do not use this for big/complex images.
  qcpr: number
  // Debug End

  // Initial palette Start
  // Custom palette, an array of color objects: [ {r:0,g:0,b:0,a:255}, ... ]
  pal?: ColorObject[]
  // Initial palette End
}

export type MaybeImageTracerOptions<T = ImageTracerOptions> = {
  [K in keyof T]?: T[K]
}

export type ImageTracerOptionsPresetKeys = 'default' | 'posterized1' | 'posterized2' | 'curvy' | 'sharp' | 'detailed' | 'smoothed' | 'grayscale' | 'fixedpalette' | 'randomsampling1' | 'randomsampling2' | 'artistic1' | 'artistic2' | 'artistic3' | 'artistic4' | 'posterized3'

export type ImageTracerOptionsPresets = {
  [K in ImageTracerOptionsPresetKeys]: K extends 'default' ? ImageTracerOptions : MaybeImageTracerOptions
}

export interface ColorObject {
  r: number
  g: number
  b: number
  a: number
}

export enum Colorsampling {
  DISABLED, // 0: disabled, generating a palette
  RANDOM_SAMPLING, // 1: random sampling
  DETERMINISTIC_SAMPLING, // 2: deterministic sampling
}

export type ImageTracerOptionsParamers = MaybeImageTracerOptions | ImageTracerOptionsPresetKeys

export interface Tracedata {
  layers: any[]
  palette: any
  width: number
  height: number
}
