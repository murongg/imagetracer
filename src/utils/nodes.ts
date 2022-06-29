import { testRightAngle } from './path'
import { getDirection } from './utils'

/**
 * Batch interpollation
 * @param bpaths
 * @param options
 */
export function batchInterNodes(bpaths: any[], options: any) {
  const binternodes: any[] = []
  for (let k = 0; k < bpaths.length; k++)
    binternodes[k] = interNodes(bpaths[k], options)

  return binternodes
}

/**
 * interpollating between path points for nodes with 8 directions ( East, SouthEast, S, SW, W, NW, N, NE )
 * @param paths
 * @param options
 */
export function interNodes(paths: any, options: any) {
  const ins: any = []; let palen = 0; let nextidx = 0; let nextidx2 = 0; let previdx = 0; let previdx2 = 0; let pacnt; let pcnt

  // paths loop
  for (pacnt = 0; pacnt < paths.length; pacnt++) {
    ins[pacnt] = {}
    ins[pacnt].points = []
    ins[pacnt].boundingbox = paths[pacnt].boundingbox
    ins[pacnt].holechildren = paths[pacnt].holechildren
    ins[pacnt].isholepath = paths[pacnt].isholepath
    palen = paths[pacnt].points.length

    // pathpoints loop
    for (pcnt = 0; pcnt < palen; pcnt++) {
      // next and previous point indexes
      nextidx = (pcnt + 1) % palen; nextidx2 = (pcnt + 2) % palen; previdx = (pcnt - 1 + palen) % palen; previdx2 = (pcnt - 2 + palen) % palen

      // right angle enhance
      if (options.rightangleenhance && testRightAngle(paths[pacnt], previdx2, previdx, pcnt, nextidx, nextidx2)) {
        // Fix previous direction
        if (ins[pacnt].points.length > 0) {
          ins[pacnt].points[ins[pacnt].points.length - 1].linesegment = getDirection(
            ins[pacnt].points[ins[pacnt].points.length - 1].x,
            ins[pacnt].points[ins[pacnt].points.length - 1].y,
            paths[pacnt].points[pcnt].x,
            paths[pacnt].points[pcnt].y,
          )
        }

        // This corner point
        ins[pacnt].points.push({
          x: paths[pacnt].points[pcnt].x,
          y: paths[pacnt].points[pcnt].y,
          linesegment: getDirection(
            paths[pacnt].points[pcnt].x,
            paths[pacnt].points[pcnt].y,
            ((paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x) / 2),
            ((paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y) / 2),
          ),
        })
      }// End of right angle enhance

      // interpolate between two path points
      ins[pacnt].points.push({
        x: ((paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x) / 2),
        y: ((paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y) / 2),
        linesegment: getDirection(
          ((paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x) / 2),
          ((paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y) / 2),
          ((paths[pacnt].points[nextidx].x + paths[pacnt].points[nextidx2].x) / 2),
          ((paths[pacnt].points[nextidx].y + paths[pacnt].points[nextidx2].y) / 2),
        ),
      })
    }// End of pathpoints loop
  }// End of paths loop

  return ins
}
