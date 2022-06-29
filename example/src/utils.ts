import type { MaybeImageTracerOptions } from 'imagetracer'
import { imageTracer } from 'imagetracer'
export const getImageSrc = (file: File) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e: any) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

export const convertImage = ({ file, options }: { file: File; options: MaybeImageTracerOptions }) => {
  return new Promise((resolve) => {
    const objectURL = window.URL.createObjectURL(file)
    imageTracer.imageToSVG(
      objectURL,
      (data: string) => {
        resolve(data)
      },
      {
        ...options,
        viewbox: true,
      },
    )
  })
}

export const appendSvg = (id: string, svg: string) => {
  const container = document.querySelector(`#${id}`) as HTMLElement
  container.innerHTML = svg
}
