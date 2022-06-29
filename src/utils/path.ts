import { PATHSCAN_COMBINED_LOOKUP } from '../constants'
import { boundingBoxIncludes, fitSeq, pointInPoly } from './svg'

export function testRightAngle(path: any, idx1: any, idx2: any, idx3: any, idx4: any, idx5: any) {
  return (((path.points[idx3].x === path.points[idx1].x)
    && (path.points[idx3].x === path.points[idx2].x)
    && (path.points[idx3].y === path.points[idx4].y)
    && (path.points[idx3].y === path.points[idx5].y)
  )
    || ((path.points[idx3].y === path.points[idx1].y)
      && (path.points[idx3].y === path.points[idx2].y)
      && (path.points[idx3].x === path.points[idx4].x)
      && (path.points[idx3].x === path.points[idx5].x)
    )
  )
}

/**
 * Walking through an edge node array, discarding edge node types 0 and 15 and creating paths from the rest.
 * Walk directions (dir): 0 > ; 1 ^ ; 2 < ; 3 v
 * @param arr
 * @param pathomit
 */
export function pathScan(arr: any, pathomit: any) {
  const paths: any = []; let pacnt = 0; let pcnt = 0; let px = 0; let py = 0; const w = arr[0].length; const h = arr.length
  let dir = 0; let pathfinished = true; let holepath = false; let lookuprow

  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if ((arr[j][i] === 4) || (arr[j][i] === 11)) { // Other values are not valid
        // Init
        px = i; py = j
        paths[pacnt] = {}
        paths[pacnt].points = []
        paths[pacnt].boundingbox = [px, py, px, py]
        paths[pacnt].holechildren = []
        pathfinished = false
        pcnt = 0
        holepath = (arr[j][i] === 11)
        dir = 1

        // Path points loop
        while (!pathfinished) {
          // New path point
          paths[pacnt].points[pcnt] = {}
          paths[pacnt].points[pcnt].x = px - 1
          paths[pacnt].points[pcnt].y = py - 1
          paths[pacnt].points[pcnt].t = arr[py][px]

          // Bounding box
          if ((px - 1) < paths[pacnt].boundingbox[0])
            paths[pacnt].boundingbox[0] = px - 1
          if ((px - 1) > paths[pacnt].boundingbox[2])
            paths[pacnt].boundingbox[2] = px - 1
          if ((py - 1) < paths[pacnt].boundingbox[1])
            paths[pacnt].boundingbox[1] = py - 1
          if ((py - 1) > paths[pacnt].boundingbox[3])
            paths[pacnt].boundingbox[3] = py - 1

          // Next: look up the replacement, direction and coordinate changes = clear this cell, turn if required, walk forward
          lookuprow = PATHSCAN_COMBINED_LOOKUP[arr[py][px]][dir]
          arr[py][px] = lookuprow[0]; dir = lookuprow[1]; px += lookuprow[2]; py += lookuprow[3]

          // Close path
          if ((px - 1 === paths[pacnt].points[0].x) && (py - 1 === paths[pacnt].points[0].y)) {
            pathfinished = true

            // Discarding paths shorter than pathomit
            if (paths[pacnt].points.length < pathomit) {
              paths.pop()
            }
            else {
              paths[pacnt].isholepath = !!holepath

              // Finding the parent shape for this hole
              if (holepath) {
                let parentidx = 0; let parentbbox = [-1, -1, w + 1, h + 1]
                for (let parentcnt = 0; parentcnt < pacnt; parentcnt++) {
                  if ((!paths[parentcnt].isholepath)
                    && boundingBoxIncludes(paths[parentcnt].boundingbox, paths[pacnt].boundingbox)
                    && boundingBoxIncludes(parentbbox, paths[parentcnt].boundingbox)
                    && pointInPoly(paths[pacnt].points[0], paths[parentcnt].points)
                  ) {
                    parentidx = parentcnt
                    parentbbox = paths[parentcnt].boundingbox
                  }
                }

                paths[parentidx].holechildren.push(pacnt)
              }// End of holepath parent finding

              pacnt++
            }
          }// End of Close path

          pcnt++
        }// End of Path points loop
      }// End of Follow path
    }// End of i loop
  }// End of j loop

  return paths
}

/**
 * Batch pathscan
 * @param layers
 * @param pathomit
 */
export function batchPathScan(layers: any, pathomit: any) {
  const bpaths: any[] = []
  for (let k = 0; k < layers.length; k++)
    bpaths[k] = pathScan(layers[k], pathomit)
  return bpaths
}

/**
 * recursively trying to fit straight and quadratic spline segments on the 8 direction internode path
 * 1. Find sequences of points with only 2 segment types
 * 2. Fit a straight line on the sequence
 * 3. If the straight line fails (distance error > ltres), find the point with the biggest error
 * 4. Fit a quadratic spline through errorpoint (project this to get controlpoint), then measure errors on every point in the sequence
 * 5. If the spline fails (distance error > qtres), find the point with the biggest error, set splitpoint = fitting point
 * 6. Split sequence and recursively apply 2. - 6. to startpoint-splitpoint and splitpoint-endpoint sequences
 * @param path
 * @param ltres
 * @param qtres
 */
export function tracePath(path: any, ltres: any, qtres: any) {
  let pcnt = 0; let segtype1; let segtype2; let seqend; const smp = {
    segments: [],
    boundingbox: path.boundingbox,
    holechildren: path.holechildren,
    isholepath: path.isholepath,
  }
  // smp.segments = [];
  // smp.boundingbox = path.boundingbox;
  // smp.holechildren = path.holechildren;
  // smp.isholepath = path.isholepath;

  while (pcnt < path.points.length) {
    // 5.1. Find sequences of points with only 2 segment types
    segtype1 = path.points[pcnt].linesegment; segtype2 = -1; seqend = pcnt + 1
    while (
      ((path.points[seqend].linesegment === segtype1) || (path.points[seqend].linesegment === segtype2) || (segtype2 === -1))
      && (seqend < path.points.length - 1)) {
      if ((path.points[seqend].linesegment !== segtype1) && (segtype2 === -1))
        segtype2 = path.points[seqend].linesegment
      seqend++
    }
    if (seqend === path.points.length - 1)
      seqend = 0

    // 5.2. - 5.6. Split sequence and recursively apply 5.2. - 5.6. to startpoint-splitpoint and splitpoint-endpoint sequences
    smp.segments = smp.segments.concat(fitSeq(path, ltres, qtres, pcnt, seqend))

    // forward pcnt;
    if (seqend > 0)
      pcnt = seqend; else pcnt = path.points.length
  }// End of pcnt loop

  return smp
}

/**
 * Batch tracing paths
 * @param internodepaths
 * @param ltres
 * @param qtres
 * @returns
 */
export function batchTracePaths(internodepaths: any, ltres: any, qtres: any) {
  const btracedpaths = []
  for (let k = 0; k < internodepaths.length; k++)
    btracedpaths.push(tracePath(internodepaths[k], ltres, qtres))

  return btracedpaths
}
