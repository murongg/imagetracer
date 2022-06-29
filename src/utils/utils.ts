import { generatePalette, samplePalette, samplePaletteByGrid } from './palette'
import { blur } from './blur'
export function getDirection(x1: number, y1: number, x2: number, y2: number) {
  let result = 8
  if (x1 < x2) {
    if (y1 < y2)
      result = 1 // SouthEast
    else if (y1 > y2)
      result = 7 // NE
    else result = 0 // E
  }
  else if (x1 > x2) {
    if (y1 < y2)
      result = 3 // SW
    else if (y1 > y2)
      result = 5 // NW
    else result = 4 // W
  }
  else {
    if (y1 < y2)
      result = 2 // S
    else if (y1 > y2)
      result = 6 // N
    else result = 8 // center, this should not happen
  }
  return result
}

/**
 * Rounding to given decimals https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
 * @param val
 * @param places
 * @returns
 */
export const roundToDec = (val: any, places: any = undefined) => +val.toFixed(places)

/**
 * Color quantization
 * @param imageData
 * @param options
 * @returns
 */
export function colorQuantization(imageData: ImageData, options: any) {
  const arr: any[] = []; let idx = 0; let cd; let cdl; let ci; const paletteacc = []; const pixelnum = imageData.width * imageData.height; let i; let j; let k; let cnt; let palette

  let imageDataCache = imageData.data

  // imageDataCache must be RGBA, not just RGB
  if (imageDataCache.length < pixelnum * 4) {
    const newImageData = new Uint8ClampedArray(pixelnum * 4)
    for (let pxcnt = 0; pxcnt < pixelnum; pxcnt++) {
      newImageData[pxcnt * 4] = imageDataCache[pxcnt * 3]
      newImageData[pxcnt * 4 + 1] = imageDataCache[pxcnt * 3 + 1]
      newImageData[pxcnt * 4 + 2] = imageDataCache[pxcnt * 3 + 2]
      newImageData[pxcnt * 4 + 3] = 255
    }
    imageDataCache = newImageData
  }// End of RGBA imageDataCache check

  // Filling arr (color index array) with -1
  for (j = 0; j < imageData.height + 2; j++) { arr[j] = []; for (i = 0; i < imageData.width + 2; i++) arr[j][i] = -1 }

  // Use custom palette if pal is defined or sample / generate custom length palette
  if (options.pal)
    palette = options.pal
  else if (options.colorsampling === 0)
    palette = generatePalette(options.numberofcolors)
  else if (options.colorsampling === 1)
    palette = samplePalette(options.numberofcolors, imageData)
  else
    palette = samplePaletteByGrid(options.numberofcolors, imageData)

  // Selective Gaussian blur preprocessing
  if (options.blurradius > 0)
    imageData = blur(imageData, options.blurradius, options.blurdelta)

  // Repeat clustering step options.colorquantcycles times
  for (cnt = 0; cnt < options.colorquantcycles; cnt++) {
    // Average colors from the second iteration
    if (cnt > 0) {
      // averaging paletteacc for palette
      for (k = 0; k < palette.length; k++) {
        // averaging
        if (paletteacc[k].n > 0) {
          palette[k] = {
            r: Math.floor(paletteacc[k].r / paletteacc[k].n),
            g: Math.floor(paletteacc[k].g / paletteacc[k].n),
            b: Math.floor(paletteacc[k].b / paletteacc[k].n),
            a: Math.floor(paletteacc[k].a / paletteacc[k].n),
          }
        }

        // Randomizing a color, if there are too few pixels and there will be a new cycle
        if ((paletteacc[k].n / pixelnum < options.mincolorratio) && (cnt < options.colorquantcycles - 1)) {
          palette[k] = {
            r: Math.floor(Math.random() * 255),
            g: Math.floor(Math.random() * 255),
            b: Math.floor(Math.random() * 255),
            a: Math.floor(Math.random() * 255),
          }
        }
      }// End of palette loop
    }// End of Average colors from the second iteration

    // Reseting palette accumulator for averaging
    for (i = 0; i < palette.length; i++) paletteacc[i] = { r: 0, g: 0, b: 0, a: 0, n: 0 }

    // loop through all pixels
    for (j = 0; j < imageData.height; j++) {
      for (i = 0; i < imageData.width; i++) {
        // pixel index
        idx = (j * imageData.width + i) * 4

        // find closest color from palette by measuring (rectilinear) color distance between this pixel and all palette colors
        ci = 0; cdl = 1024 // 4 * 256 is the maximum RGBA distance
        for (k = 0; k < palette.length; k++) {
          // In my experience, https://en.wikipedia.org/wiki/Rectilinear_distance works better than https://en.wikipedia.org/wiki/Euclidean_distance
          cd
            = (palette[k].r > imageDataCache[idx] ? palette[k].r - imageDataCache[idx] : imageDataCache[idx] - palette[k].r)
            + (palette[k].g > imageDataCache[idx + 1] ? palette[k].g - imageDataCache[idx + 1] : imageDataCache[idx + 1] - palette[k].g)
            + (palette[k].b > imageDataCache[idx + 2] ? palette[k].b - imageDataCache[idx + 2] : imageDataCache[idx + 2] - palette[k].b)
            + (palette[k].a > imageDataCache[idx + 3] ? palette[k].a - imageDataCache[idx + 3] : imageDataCache[idx + 3] - palette[k].a)

          // Remember this color if this is the closest yet
          if (cd < cdl) { cdl = cd; ci = k }
        }// End of palette loop

        // add to palettacc
        paletteacc[ci].r += imageDataCache[idx]
        paletteacc[ci].g += imageDataCache[idx + 1]
        paletteacc[ci].b += imageDataCache[idx + 2]
        paletteacc[ci].a += imageDataCache[idx + 3]
        paletteacc[ci].n++

        // update the indexed color array
        arr[j + 1][i + 1] = ci
      }// End of i loop
    }// End of j loop
  }// End of Repeat clustering step options.colorquantcycles times
  return { array: arr, palette }
}

/**
 * Convert color object to rgba string
 * @param c
 */
export const toRgbaStr = (c: any) => `rgba(${c.r},${c.g},${c.b},${c.a})`
