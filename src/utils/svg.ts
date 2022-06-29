/* eslint-disable no-prototype-builtins */
import { VERSION_NUMBER } from '../constants'
import { roundToDec } from './utils'

/**
 * Getting SVG path element string from a traced path
 * @param tracedata
 * @param lnum
 * @param pathnum
 * @param options
 */
export function svgPathString(tracedata: any, lnum: any, pathnum: any, options: any) {
  const layer = tracedata.layers[lnum]; const smp = layer[pathnum]; let str = ''; let pcnt

  // Line filter
  if (options.linefilter && (smp.segments.length < 3))
    return str

  // Starting path element, desc contains layer and path number
  str = `<path ${options.desc ? (`desc="l ${lnum} p ${pathnum}" `) : ''
    }${toSvgColorStr(tracedata.palette[lnum], options)
    }d="`

  // Creating non-hole path string
  if (options.roundcoords === -1) {
    str += `M ${smp.segments[0].x1 * options.scale} ${smp.segments[0].y1 * options.scale} `
    for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
      str += `${smp.segments[pcnt].type} ${smp.segments[pcnt].x2 * options.scale} ${smp.segments[pcnt].y2 * options.scale} `
      if (smp.segments[pcnt].hasOwnProperty('x3'))
        str += `${smp.segments[pcnt].x3 * options.scale} ${smp.segments[pcnt].y3 * options.scale} `
    }
    str += 'Z '
  }
  else {
    str += `M ${roundToDec(smp.segments[0].x1 * options.scale, options.roundcoords)} ${roundToDec(smp.segments[0].y1 * options.scale, options.roundcoords)} `
    for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
      str += `${smp.segments[pcnt].type} ${roundToDec(smp.segments[pcnt].x2 * options.scale, options.roundcoords)} ${roundToDec(smp.segments[pcnt].y2 * options.scale, options.roundcoords)} `
      if (smp.segments[pcnt].hasOwnProperty('x3'))
        str += `${roundToDec(smp.segments[pcnt].x3 * options.scale, options.roundcoords)} ${roundToDec(smp.segments[pcnt].y3 * options.scale, options.roundcoords)} `
    }
    str += 'Z '
  }// End of creating non-hole path string

  // Hole children
  for (let hcnt = 0; hcnt < smp.holechildren.length; hcnt++) {
    const hsmp = layer[smp.holechildren[hcnt]]
    // Creating hole path string
    if (options.roundcoords === -1) {
      if (hsmp.segments[hsmp.segments.length - 1].hasOwnProperty('x3'))
        str += `M ${hsmp.segments[hsmp.segments.length - 1].x3 * options.scale} ${hsmp.segments[hsmp.segments.length - 1].y3 * options.scale} `
      else
        str += `M ${hsmp.segments[hsmp.segments.length - 1].x2 * options.scale} ${hsmp.segments[hsmp.segments.length - 1].y2 * options.scale} `

      for (pcnt = hsmp.segments.length - 1; pcnt >= 0; pcnt--) {
        str += `${hsmp.segments[pcnt].type} `
        if (hsmp.segments[pcnt].hasOwnProperty('x3'))
          str += `${hsmp.segments[pcnt].x2 * options.scale} ${hsmp.segments[pcnt].y2 * options.scale} `

        str += `${hsmp.segments[pcnt].x1 * options.scale} ${hsmp.segments[pcnt].y1 * options.scale} `
      }
    }
    else {
      if (hsmp.segments[hsmp.segments.length - 1].hasOwnProperty('x3'))
        str += `M ${roundToDec(hsmp.segments[hsmp.segments.length - 1].x3 * options.scale)} ${roundToDec(hsmp.segments[hsmp.segments.length - 1].y3 * options.scale)} `
      else
        str += `M ${roundToDec(hsmp.segments[hsmp.segments.length - 1].x2 * options.scale)} ${roundToDec(hsmp.segments[hsmp.segments.length - 1].y2 * options.scale)} `

      for (pcnt = hsmp.segments.length - 1; pcnt >= 0; pcnt--) {
        str += `${hsmp.segments[pcnt].type} `
        if (hsmp.segments[pcnt].hasOwnProperty('x3'))
          str += `${roundToDec(hsmp.segments[pcnt].x2 * options.scale)} ${roundToDec(hsmp.segments[pcnt].y2 * options.scale)} `

        str += `${roundToDec(hsmp.segments[pcnt].x1 * options.scale)} ${roundToDec(hsmp.segments[pcnt].y1 * options.scale)} `
      }
    }// End of creating hole path string

    str += 'Z ' // Close path
  }// End of holepath check

  // Closing path element
  str += '" />'

  // Rendering control points
  if (options.lcpr || options.qcpr) {
    for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
      if (smp.segments[pcnt].hasOwnProperty('x3') && options.qcpr) {
        str += `<circle cx="${smp.segments[pcnt].x2 * options.scale}" cy="${smp.segments[pcnt].y2 * options.scale}" r="${options.qcpr}" fill="cyan" stroke-width="${options.qcpr * 0.2}" stroke="black" />`
        str += `<circle cx="${smp.segments[pcnt].x3 * options.scale}" cy="${smp.segments[pcnt].y3 * options.scale}" r="${options.qcpr}" fill="white" stroke-width="${options.qcpr * 0.2}" stroke="black" />`
        str += `<line x1="${smp.segments[pcnt].x1 * options.scale}" y1="${smp.segments[pcnt].y1 * options.scale}" x2="${smp.segments[pcnt].x2 * options.scale}" y2="${smp.segments[pcnt].y2 * options.scale}" stroke-width="${options.qcpr * 0.2}" stroke="cyan" />`
        str += `<line x1="${smp.segments[pcnt].x2 * options.scale}" y1="${smp.segments[pcnt].y2 * options.scale}" x2="${smp.segments[pcnt].x3 * options.scale}" y2="${smp.segments[pcnt].y3 * options.scale}" stroke-width="${options.qcpr * 0.2}" stroke="cyan" />`
      }
      if ((!smp.segments[pcnt].hasOwnProperty('x3')) && options.lcpr)
        str += `<circle cx="${smp.segments[pcnt].x2 * options.scale}" cy="${smp.segments[pcnt].y2 * options.scale}" r="${options.lcpr}" fill="white" stroke-width="${options.lcpr * 0.2}" stroke="black" />`
    }

    // Hole children control points
    for (let hcnt = 0; hcnt < smp.holechildren.length; hcnt++) {
      const hsmp = layer[smp.holechildren[hcnt]]
      for (pcnt = 0; pcnt < hsmp.segments.length; pcnt++) {
        if (hsmp.segments[pcnt].hasOwnProperty('x3') && options.qcpr) {
          str += `<circle cx="${hsmp.segments[pcnt].x2 * options.scale}" cy="${hsmp.segments[pcnt].y2 * options.scale}" r="${options.qcpr}" fill="cyan" stroke-width="${options.qcpr * 0.2}" stroke="black" />`
          str += `<circle cx="${hsmp.segments[pcnt].x3 * options.scale}" cy="${hsmp.segments[pcnt].y3 * options.scale}" r="${options.qcpr}" fill="white" stroke-width="${options.qcpr * 0.2}" stroke="black" />`
          str += `<line x1="${hsmp.segments[pcnt].x1 * options.scale}" y1="${hsmp.segments[pcnt].y1 * options.scale}" x2="${hsmp.segments[pcnt].x2 * options.scale}" y2="${hsmp.segments[pcnt].y2 * options.scale}" stroke-width="${options.qcpr * 0.2}" stroke="cyan" />`
          str += `<line x1="${hsmp.segments[pcnt].x2 * options.scale}" y1="${hsmp.segments[pcnt].y2 * options.scale}" x2="${hsmp.segments[pcnt].x3 * options.scale}" y2="${hsmp.segments[pcnt].y3 * options.scale}" stroke-width="${options.qcpr * 0.2}" stroke="cyan" />`
        }
        if ((!hsmp.segments[pcnt].hasOwnProperty('x3')) && options.lcpr)
          str += `<circle cx="${hsmp.segments[pcnt].x2 * options.scale}" cy="${hsmp.segments[pcnt].y2 * options.scale}" r="${options.lcpr}" fill="white" stroke-width="${options.lcpr * 0.2}" stroke="black" />`
      }
    }
  }// End of Rendering control points

  return str
}

/**
 * Convert color object to SVG color string
 * @param c
 * @param options
 * @returns
 */
export function toSvgColorStr(c: any, options: any) {
  return `fill="rgb(${c.r},${c.g},${c.b})" stroke="rgb(${c.r},${c.g},${c.b})" stroke-width="${options.strokewidth}" opacity="${c.a / 255.0}" `
}

/**
 * 5.2. - 5.6. recursively fitting a straight or quadratic line segment on this sequence of path nodes,
 * called from tracepath()
 * @param path
 * @param ltres
 * @param qtres
 * @param seqstart
 * @param seqend
 * @returns
 */
export function fitSeq(path: any, ltres: any, qtres: any, seqstart: any, seqend: any): any {
  // return if invalid seqend
  if ((seqend > path.points.length) || (seqend < 0))
    return []
  // letiables
  let errorpoint = seqstart; let errorval = 0; let curvepass = true; let px; let py; let dist2
  let tl = (seqend - seqstart); if (tl < 0)
    tl += path.points.length
  const vx = (path.points[seqend].x - path.points[seqstart].x) / tl
  const vy = (path.points[seqend].y - path.points[seqstart].y) / tl

  // 5.2. Fit a straight line on the sequence
  let pcnt = (seqstart + 1) % path.points.length; let pl
  while (pcnt !== seqend) {
    pl = pcnt - seqstart; if (pl < 0)
      pl += path.points.length
    px = path.points[seqstart].x + vx * pl; py = path.points[seqstart].y + vy * pl
    dist2 = (path.points[pcnt].x - px) * (path.points[pcnt].x - px) + (path.points[pcnt].y - py) * (path.points[pcnt].y - py)
    if (dist2 > ltres)
      curvepass = false
    if (dist2 > errorval) { errorpoint = pcnt; errorval = dist2 }
    pcnt = (pcnt + 1) % path.points.length
  }
  // return straight line if fits
  if (curvepass)
    return [{ type: 'L', x1: path.points[seqstart].x, y1: path.points[seqstart].y, x2: path.points[seqend].x, y2: path.points[seqend].y }]

  // 5.3. If the straight line fails (distance error>ltres), find the point with the biggest error
  const fitpoint = errorpoint; curvepass = true; errorval = 0

  // 5.4. Fit a quadratic spline through this point, measure errors on every point in the sequence
  // helpers and projecting to get control point
  let t = (fitpoint - seqstart) / tl; let t1 = (1 - t) * (1 - t); let t2 = 2 * (1 - t) * t; let t3 = t * t
  const cpx = (t1 * path.points[seqstart].x + t3 * path.points[seqend].x - path.points[fitpoint].x) / -t2
  const cpy = (t1 * path.points[seqstart].y + t3 * path.points[seqend].y - path.points[fitpoint].y) / -t2

  // Check every point
  pcnt = seqstart + 1
  while (pcnt !== seqend) {
    t = (pcnt - seqstart) / tl; t1 = (1 - t) * (1 - t); t2 = 2 * (1 - t) * t; t3 = t * t
    px = t1 * path.points[seqstart].x + t2 * cpx + t3 * path.points[seqend].x
    py = t1 * path.points[seqstart].y + t2 * cpy + t3 * path.points[seqend].y

    dist2 = (path.points[pcnt].x - px) * (path.points[pcnt].x - px) + (path.points[pcnt].y - py) * (path.points[pcnt].y - py)

    if (dist2 > qtres)
      curvepass = false
    if (dist2 > errorval) { errorpoint = pcnt; errorval = dist2 }
    pcnt = (pcnt + 1) % path.points.length
  }
  // return spline if fits
  if (curvepass)
    return [{ type: 'Q', x1: path.points[seqstart].x, y1: path.points[seqstart].y, x2: cpx, y2: cpy, x3: path.points[seqend].x, y3: path.points[seqend].y }]
  // 5.5. If the spline fails (distance error>qtres), find the point with the biggest error
  const splitpoint = fitpoint // Earlier: Math.floor((fitpoint + errorpoint)/2);

  // 5.6. Split sequence and recursively apply 5.2. - 5.6. to startpoint-splitpoint and splitpoint-endpoint sequences
  return fitSeq(path, ltres, qtres, seqstart, splitpoint).concat(
    fitSeq(path, ltres, qtres, splitpoint, seqend))
}

export function boundingBoxIncludes(parentbbox: number[], childbbox: number[]) {
  return ((parentbbox[0] < childbbox[0]) && (parentbbox[1] < childbbox[1]) && (parentbbox[2] > childbbox[2]) && (parentbbox[3] > childbbox[3]))
}

export function pointInPoly(p: { y: number; x: number }, pa: string | any[]) {
  let isin = false

  for (let i = 0, j = pa.length - 1; i < pa.length; j = i++) {
    isin
      = (((pa[i].y > p.y) !== (pa[j].y > p.y)) && (p.x < (pa[j].x - pa[i].x) * (p.y - pa[i].y) / (pa[j].y - pa[i].y) + pa[i].x))
        ? !isin
        : isin
  }

  return isin
}

/**
 * Converting tracedata to an SVG string
 * @param tracedata
 * @param options
 * @returns
 */
export function getSvgString(tracedata: any, options: any) {
  const w = tracedata.width * options.scale; const h = tracedata.height * options.scale

  // SVG start
  let svgstr = `<svg ${options.viewbox ? (`viewBox="0 0 ${w} ${h}" `) : (`width="${w}" height="${h}" `)
    }version="1.1" xmlns="http://www.w3.org/2000/svg" desc="Created with imagetracer.js version ${VERSION_NUMBER}" >`

  // Drawing: Layers and Paths loops
  for (let lcnt = 0; lcnt < tracedata.layers.length; lcnt++) {
    for (let pcnt = 0; pcnt < tracedata.layers[lcnt].length; pcnt++) {
      // Adding SVG <path> string
      if (!tracedata.layers[lcnt][pcnt].isholepath)
        svgstr += svgPathString(tracedata, lcnt, pcnt, options)
    }// End of paths loop
  }// End of layers loop

  // SVG End
  svgstr += '</svg>'

  return svgstr
}
