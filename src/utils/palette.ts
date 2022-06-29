/**
 * Generating a palette with numberofcolors
 * @param numberOfColors
 */
export function generatePalette(numberOfColors: number) {
  const palette = []; let rcnt; let gcnt; let bcnt
  if (numberOfColors < 8) {
    // Grayscale
    const graystep = Math.floor(255 / (numberOfColors - 1))
    for (let i = 0; i < numberOfColors; i++) palette.push({ r: i * graystep, g: i * graystep, b: i * graystep, a: 255 })
  }
  else {
    // RGB color cube
    const colorqnum = Math.floor(Math.pow(numberOfColors, 1 / 3)) // Number of points on each edge on the RGB color cube
    const colorstep = Math.floor(255 / (colorqnum - 1)) // distance between points
    const rndnum = numberOfColors - colorqnum * colorqnum * colorqnum // number of random colors

    for (rcnt = 0; rcnt < colorqnum; rcnt++) {
      for (gcnt = 0; gcnt < colorqnum; gcnt++) {
        for (bcnt = 0; bcnt < colorqnum; bcnt++)
          palette.push({ r: rcnt * colorstep, g: gcnt * colorstep, b: bcnt * colorstep, a: 255 })
        // End of blue loop
      }// End of green loop
    }// End of red loop

    // Rest is random
    for (rcnt = 0; rcnt < rndnum; rcnt++) palette.push({ r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255), a: Math.floor(Math.random() * 255) })
  }// End of numberOfColors check

  return palette
}

/**
 * Sampling a palette from imagedata
 * @param numberOfColors
 * @param imageData
 */
export function samplePalette(numberOfColors: number, imageData: ImageData) {
  let idx; const palette = []
  for (let i = 0; i < numberOfColors; i++) {
    idx = Math.floor(Math.random() * imageData.data.length / 4) * 4
    palette.push({ r: imageData.data[idx], g: imageData.data[idx + 1], b: imageData.data[idx + 2], a: imageData.data[idx + 3] })
  }
  return palette
}

/**
 * Deterministic sampling a palette from imagedata: rectangular grid
 * @param numberOfColors
 * @param imageData
 */
export function samplePaletteByGrid(numberOfColors: number, imageData: ImageData) {
  let idx; const palette = []; const ni = Math.ceil(Math.sqrt(numberOfColors)); const nj = Math.ceil(numberOfColors / ni)
  const vx = imageData.width / (ni + 1); const vy = imageData.height / (nj + 1)
  for (let j = 0; j < nj; j++) {
    for (let i = 0; i < ni; i++) {
      if (palette.length === numberOfColors) {
        break
      }
      else {
        idx = Math.floor(((j + 1) * vy) * imageData.width + ((i + 1) * vx)) * 4
        palette.push({ r: imageData.data[idx], g: imageData.data[idx + 1], b: imageData.data[idx + 2], a: imageData.data[idx + 3] })
      }
    }
  }
  return palette
}
