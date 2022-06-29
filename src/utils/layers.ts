import { batchTracePaths } from './path'
import { toRgbaStr } from './utils'

/**
 * Batch tracing layers
 * @param binternodes
 * @param ltres
 * @param qtres
 * @returns
 */
export function batchTraceLayers(binternodes: any[], ltres: any, qtres: any) {
  const btbis: any[] = []
  for (let k = 0; k < binternodes.length; k++)
    btbis[k] = batchTracePaths(binternodes[k], ltres, qtres)

  return btbis
}

/**
 *  Layer separation and edge detection
 * @param ii
 */
export function layering(ii: any) {
  // Creating layers for each indexed color in arr
  const layers: any[] = []; let val = 0; const ah = ii.array.length; const aw = ii.array[0].length; let n1
  let n2; let n3; let n4; let n5; let n6; let n7; let n8; let i; let j; let k

  // Create layers
  for (k = 0; k < ii.palette.length; k++) {
    layers[k] = []
    for (j = 0; j < ah; j++) {
      layers[k][j] = []
      for (i = 0; i < aw; i++)
        layers[k][j][i] = 0
    }
  }

  // Looping through all pixels and calculating edge node type
  for (j = 1; j < ah - 1; j++) {
    for (i = 1; i < aw - 1; i++) {
      // This pixel's indexed color
      val = ii.array[j][i]

      // Are neighbor pixel colors the same?
      n1 = ii.array[j - 1][i - 1] === val ? 1 : 0
      n2 = ii.array[j - 1][i] === val ? 1 : 0
      n3 = ii.array[j - 1][i + 1] === val ? 1 : 0
      n4 = ii.array[j][i - 1] === val ? 1 : 0
      n5 = ii.array[j][i + 1] === val ? 1 : 0
      n6 = ii.array[j + 1][i - 1] === val ? 1 : 0
      n7 = ii.array[j + 1][i] === val ? 1 : 0
      n8 = ii.array[j + 1][i + 1] === val ? 1 : 0

      // this pixel's type and looking back on previous pixels
      layers[val][j + 1][i + 1] = 1 + n5 * 2 + n8 * 4 + n7 * 8
      if (!n4)
        layers[val][j + 1][i] = 0 + 2 + n7 * 4 + n6 * 8
      if (!n2)
        layers[val][j][i + 1] = 0 + n3 * 2 + n5 * 4 + 8
      if (!n1)
        layers[val][j][i] = 0 + n2 * 2 + 4 + n4 * 8
    }// End of i loop
  }// End of j loop

  return layers
}

/**
 *  Layer separation and edge detection
 * @param ii
 * @param cnum
 */
export function layeringStep(ii: { array: string | any[] }, cnum: any) {
  // Creating layers for each indexed color in arr
  const layer: any = []; const ah = ii.array.length; const aw = ii.array[0].length
  let i; let j
  // Create layer
  for (j = 0; j < ah; j++) {
    layer[j] = []
    for (i = 0; i < aw; i++)
      layer[j][i] = 0
  }

  // Looping through all pixels and calculating edge node type
  for (j = 1; j < ah; j++) {
    for (i = 1; i < aw; i++) {
      layer[j][i]
        = (ii.array[j - 1][i - 1] === cnum ? 1 : 0)
        + (ii.array[j - 1][i] === cnum ? 2 : 0)
        + (ii.array[j][i - 1] === cnum ? 8 : 0)
        + (ii.array[j][i] === cnum ? 4 : 0)
    }// End of i loop
  }// End of j loop

  return layer
}

/**
 * Helper function: Drawing all edge node layers into a container
 * @param layers
 * @param palette
 * @param scale
 * @param parentid
 */
export function drawLayers(layers: any[], palette: string | any[], scale: number | undefined = 1, parentid: string) {
  let w, h, i, j
  // Preparing container
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

  // Layers loop
  for (const layer of layers) {
    // width, height
    w = layer[0].length; h = layer.length

    // Creating new canvas for every layer
    const canvas = document.createElement('canvas'); canvas.width = w * scale; canvas.height = h * scale
    const context = canvas.getContext('2d') as CanvasRenderingContext2D

    // Drawing
    for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++) {
        context.fillStyle = toRgbaStr(palette[layer[j][i] % palette.length])
        context.fillRect(i * scale, j * scale, scale, scale)
      }
    }

    // Appending canvas to container
    div.appendChild(canvas)
  }// End of Layers loop
}
