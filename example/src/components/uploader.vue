<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import { imageTracer } from 'imagetracer'
import { appendSvg, convertImage, getImageSrc } from '../utils'
const image = ref('')
const file = shallowRef<HTMLInputElement | null>(null)
const selectFile = () => {
  if (file.value)
    file.value?.dispatchEvent(new MouseEvent('click'))
}

const uploadChange = async (event: Event) => {
  const files = (event.target as any).files as File[]
  const file = files[0]
  const imageSource = await getImageSrc(files[0]) as string
  image.value = imageSource
  const options = {
    ...imageTracer.optionpresets.default,
    viewbox: true,
  }
  const svgString = await convertImage({
    file,
    options,
  }) as string
  appendSvg('svg-content', svgString)
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="w-2xl h-sm border-dashed border-gray border-width-6px rounded-md hover:border-dark cursor-pointer flex items-center justify-center"
      @click="selectFile"
    >
      <input ref="file" type="file" style="display: none" @change="uploadChange">
      <h2>Upload file</h2>
    </div>

    <div class="flex w-full ">
      <div style="width: 50%;" class="flex flex-col justify-start items-center">
        <h3>Source Image</h3>
        <img :src="image" class="w-28">
      </div>
      <div style="width: 50%;" class="flex flex-col justify-start items-center">
        <h3>Svg Image</h3>
        <div id="svg-content" class="w-28" />
      </div>
    </div>
  </div>
</template>
