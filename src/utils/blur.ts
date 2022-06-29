import { GKS } from '../contants'

/**
 * Selective Gaussian blur for preprocessing
 * @param imageData
 * @param radius
 * @param delta
 * @returns
 */
export function blur(imageData: ImageData, radius: number, delta: number) {
  let i, j, k, d, idx, racc, gacc, bacc, aacc, wacc

  // new ImageData
  const imageData2: ImageData = new ImageData(imageData.width, imageData.height)

  // radius and delta limits, this kernel
  radius = Math.floor(radius); if (radius < 1)
    return imageData; if (radius > 5)
    radius = 5; delta = Math.abs(delta); if (delta > 1024)
    delta = 1024
  const thisgk = GKS[radius - 1]

  // loop through all pixels, horizontal blur
  for (j = 0; j < imageData.height; j++) {
    for (i = 0; i < imageData.width; i++) {
      racc = 0; gacc = 0; bacc = 0; aacc = 0; wacc = 0
      // gauss kernel loop
      for (k = -radius; k < radius + 1; k++) {
        // add weighted color values
        if ((i + k > 0) && (i + k < imageData.width)) {
          idx = (j * imageData.width + i + k) * 4
          racc += imageData.data[idx] * thisgk[k + radius]
          gacc += imageData.data[idx + 1] * thisgk[k + radius]
          bacc += imageData.data[idx + 2] * thisgk[k + radius]
          aacc += imageData.data[idx + 3] * thisgk[k + radius]
          wacc += thisgk[k + radius]
        }
      }
      // The new pixel
      idx = (j * imageData.width + i) * 4
      imageData2.data[idx] = Math.floor(racc / wacc)
      imageData2.data[idx + 1] = Math.floor(gacc / wacc)
      imageData2.data[idx + 2] = Math.floor(bacc / wacc)
      imageData2.data[idx + 3] = Math.floor(aacc / wacc)
    }// End of width loop
  }// End of horizontal blur

  // copying the half blurred imageData2
  const himageData = new Uint8ClampedArray(imageData2.data)

  // loop through all pixels, vertical blur
  for (j = 0; j < imageData.height; j++) {
    for (i = 0; i < imageData.width; i++) {
      racc = 0; gacc = 0; bacc = 0; aacc = 0; wacc = 0
      // gauss kernel loop
      for (k = -radius; k < radius + 1; k++) {
        // add weighted color values
        if ((j + k > 0) && (j + k < imageData.height)) {
          idx = ((j + k) * imageData.width + i) * 4
          racc += himageData[idx] * thisgk[k + radius]
          gacc += himageData[idx + 1] * thisgk[k + radius]
          bacc += himageData[idx + 2] * thisgk[k + radius]
          aacc += himageData[idx + 3] * thisgk[k + radius]
          wacc += thisgk[k + radius]
        }
      }
      // The new pixel
      idx = (j * imageData.width + i) * 4
      imageData2.data[idx] = Math.floor(racc / wacc)
      imageData2.data[idx + 1] = Math.floor(gacc / wacc)
      imageData2.data[idx + 2] = Math.floor(bacc / wacc)
      imageData2.data[idx + 3] = Math.floor(aacc / wacc)
    }// End of width loop
  }// End of vertical blur

  // Selective blur: loop through all pixels
  for (j = 0; j < imageData.height; j++) {
    for (i = 0; i < imageData.width; i++) {
      idx = (j * imageData.width + i) * 4
      // d is the difference between the blurred and the original pixel
      d = Math.abs(imageData2.data[idx] - imageData.data[idx]) + Math.abs(imageData2.data[idx + 1] - imageData.data[idx + 1])
        + Math.abs(imageData2.data[idx + 2] - imageData.data[idx + 2]) + Math.abs(imageData2.data[idx + 3] - imageData.data[idx + 3])
      // selective blur: if d>delta, put the original pixel back
      if (d > delta) {
        imageData2.data[idx] = imageData.data[idx]
        imageData2.data[idx + 1] = imageData.data[idx + 1]
        imageData2.data[idx + 2] = imageData.data[idx + 2]
        imageData2.data[idx + 3] = imageData.data[idx + 3]
      }
    }
  }// End of Selective blur

  return imageData2
}
