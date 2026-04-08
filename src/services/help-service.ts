import _ from "lodash"
import type { IPlan, Node } from "@/interfaces"
import { NodeProp } from "@/enums"
import { nodePropTypes, PropType } from "@/enums"
import { t } from "@/i18n"

export class HelpService {
  public nodeId = 0

  public getNodeTypeDescription(nodeType: string) {
    return NODE_DESCRIPTIONS[nodeType.toUpperCase()]
  }

  public getHelpMessage(helpMessage: string) {
    return HELP_MESSAGES[helpMessage.toUpperCase()]
  }
}

interface INodeDescription {
  [key: string]: string
}

export const NODE_DESCRIPTIONS: INodeDescription = {
  LIMIT: t("help.limit"),
  SORT: t("help.sort"),
  "NESTED LOOP": t("help.nestedLoop"),
  "MERGE JOIN": t("help.mergeJoin"),
  HASH: t("help.hash"),
  "HASH JOIN": t("help.hashJoin"),
  AGGREGATE: t("help.aggregate"),
  HASHAGGREGATE: t("help.hashAggregate"),
  "SEQ SCAN": t("help.seqScan"),
  "INDEX SCAN": t("help.indexScan"),
  "INDEX ONLY SCAN": t("help.indexOnlyScan"),
  "BITMAP HEAP SCAN": t("help.bitmapHeapScan"),
  "BITMAP INDEX SCAN": t("help.bitmapIndexScan"),
  "CTE SCAN": t("help.cteScan"),
  MEMOIZE: t("help.memoize"),
  GATHER: t("help.gather"),
  "GATHER MERGE": t("help.gatherMerge"),
}

interface IHelpMessage {
  [key: string]: string
}

export const HELP_MESSAGES: IHelpMessage = {
  "MISSING EXECUTION TIME": t("help.missingExecutionTime"),
  "MISSING PLANNING TIME": t("help.missingPlanningTime"),
  "WORKERS PLANNED NOT LAUNCHED": t("help.workersPlannedNotLaunched"),
  "WORKERS DETAILED INFO MISSING": t("help.workersDetailedInfoMissing"),
  "FUZZY NEEDS VERBOSE": t("help.fuzzyNeedsVerbose"),
  "HINT TRACK_IO_TIMING": t("help.trackIoTiming"),
  "IO TIMINGS PARALLEL": t("help.ioTimingsParallel"),
}

interface EaseInOutQuadOptions {
  currentTime: number
  start: number
  change: number
  duration: number
}

export function scrollChildIntoParentView(
  parent: Element,
  child: Element,
  shouldCenter: boolean,
  done?: () => void,
) {
  if (!child) {
    return
  }
  // Where is the parent on page
  const parentRect = parent.getBoundingClientRect()
  // Where is the child
  const childRect = child.getBoundingClientRect()

  let scrollLeft = parent.scrollLeft // don't move
  const isChildViewableX =
    childRect.left >= parentRect.left &&
    childRect.left <= parentRect.right &&
    childRect.right <= parentRect.right

  let scrollTop = parent.scrollTop
  const isChildViewableY =
    childRect.top >= parentRect.top &&
    childRect.top <= parentRect.bottom &&
    childRect.bottom <= parentRect.bottom

  if (shouldCenter || !isChildViewableX || !isChildViewableY) {
    // scroll by offset relative to parent
    // try to put the child in the middle of parent horizontaly
    scrollLeft =
      childRect.left +
      parent.scrollLeft -
      parentRect.left -
      parentRect.width / 2 +
      childRect.width / 2
    scrollTop =
      childRect.top +
      parent.scrollTop -
      parentRect.top -
      parentRect.height / 2 +
      childRect.height / 2
    smoothScroll({
      element: parent,
      to: { scrollTop, scrollLeft },
      duration: 400,
      done,
    })
  } else if (done) {
    done()
  }
}

const easeInOutQuad = ({
  currentTime,
  start,
  change,
  duration,
}: EaseInOutQuadOptions) => {
  let newCurrentTime = currentTime
  newCurrentTime /= duration / 2

  if (newCurrentTime < 1) {
    return (change / 2) * newCurrentTime * newCurrentTime + start
  }

  newCurrentTime -= 1
  return (-change / 2) * (newCurrentTime * (newCurrentTime - 2) - 1) + start
}

interface SmoothScrollOptions {
  duration: number
  element: Element
  to: {
    scrollTop: number
    scrollLeft: number
  }
  done?: () => void
}

export function smoothScroll({
  duration,
  element,
  to,
  done,
}: SmoothScrollOptions) {
  const startX = element.scrollTop
  const startY = element.scrollLeft
  const changeX = to.scrollTop - startX
  const changeY = to.scrollLeft - startY
  const startDate = new Date().getTime()

  const animateScroll = () => {
    const currentDate = new Date().getTime()
    const currentTime = currentDate - startDate
    element.scrollTop = easeInOutQuad({
      currentTime,
      start: startX,
      change: changeX,
      duration,
    })
    element.scrollLeft = easeInOutQuad({
      currentTime,
      start: startY,
      change: changeY,
      duration,
    })

    if (currentTime < duration) {
      requestAnimationFrame(animateScroll)
    } else {
      element.scrollTop = to.scrollTop
      element.scrollLeft = to.scrollLeft
      if (done) {
        done()
      }
    }
  }
  animateScroll()
}

/*
 * Split a string, ensuring balanced parenthesis and balanced quotes.
 */
export function splitBalanced(input: string, split: string) {
  // Build the pattern from params with defaults:
  const pattern = "([\\s\\S]*?)(e)?(?:(o)|(c)|(t)|(sp)|$)"
    .replace("sp", split)
    .replace("o", "[\\(\\{\\[]")
    .replace("c", "[\\)\\}\\]]")
    .replace("t", "['\"]")
    .replace("e", "[\\\\]")
  const r = new RegExp(pattern, "gi")
  const stack: string[] = []
  let buffer: string[] = []
  const results: string[] = []
  input.replace(r, ($0, $1, $e, $o, $c, $t, $s) => {
    if ($e) {
      // Escape
      buffer.push($1, $s || $o || $c || $t)
      return ""
    } else if ($o) {
      // Open
      stack.push($o)
    } else if ($c) {
      // Close
      stack.pop()
    } else if ($t) {
      // Toggle
      if (stack[stack.length - 1] !== $t) {
        stack.push($t)
      } else {
        stack.pop()
      }
    } else {
      // Split (if no stack) or EOF
      if ($s ? !stack.length : !$1) {
        buffer.push($1)
        results.push(buffer.join(""))
        buffer = []
        return ""
      }
    }
    buffer.push($0)
    return ""
  })
  return results
}

export function findNodeById(plan: IPlan, id: number): Node | undefined {
  let o: Node | undefined = undefined
  const root = plan.content.Plan
  if (root.nodeId == id) {
    return root
  }
  if (root && root.Plans) {
    root.Plans.some(function iter(child: Node): boolean | undefined {
      if (child.nodeId === id) {
        o = child
        return true
      }
      return child.Plans && child.Plans.some(iter)
    })
    if (!o && plan.ctes) {
      _.each(plan.ctes, (cte) => {
        if (cte.nodeId == id) {
          o = cte
          return false
        } else if (cte.Plans) {
          cte.Plans.some(function iter(child: Node): boolean | undefined {
            if (child.nodeId === id) {
              o = child
              return true
            }
            return child.Plans && child.Plans.some(iter)
          })
          if (o) {
            return false
          }
        }
      })
    }
  }
  return o
}

export function findNodeBySubplanName(
  plan: IPlan,
  subplanName: string,
): Node | undefined {
  let o: Node | undefined = undefined
  if (plan.ctes) {
    _.each(plan.ctes, (cte) => {
      if (cte[NodeProp.SUBPLAN_NAME] == "CTE " + subplanName) {
        o = cte
        return false
      }
    })
  }
  return o
}

// Returns the list of properties that have already been displayed either in
// the main panel or in other detailed tabs.
const notMiscProperties: string[] = [
  NodeProp.NODE_TYPE,
  NodeProp.CTE_NAME,
  NodeProp.EXCLUSIVE_DURATION,
  NodeProp.EXCLUSIVE_COST,
  NodeProp.TOTAL_COST,
  NodeProp.PLAN_ROWS,
  NodeProp.ACTUAL_ROWS,
  NodeProp.ACTUAL_LOOPS,
  NodeProp.OUTPUT,
  NodeProp.WORKERS,
  NodeProp.WORKERS_PLANNED,
  NodeProp.WORKERS_LAUNCHED,
  NodeProp.READ_BLOCKS,
  NodeProp.WRITTEN_BLOCKS,
  NodeProp.EXCLUSIVE_SHARED_HIT_BLOCKS,
  NodeProp.EXCLUSIVE_SHARED_READ_BLOCKS,
  NodeProp.EXCLUSIVE_SHARED_DIRTIED_BLOCKS,
  NodeProp.EXCLUSIVE_SHARED_WRITTEN_BLOCKS,
  NodeProp.EXCLUSIVE_TEMP_READ_BLOCKS,
  NodeProp.EXCLUSIVE_TEMP_WRITTEN_BLOCKS,
  NodeProp.EXCLUSIVE_LOCAL_HIT_BLOCKS,
  NodeProp.EXCLUSIVE_LOCAL_READ_BLOCKS,
  NodeProp.EXCLUSIVE_LOCAL_DIRTIED_BLOCKS,
  NodeProp.EXCLUSIVE_LOCAL_WRITTEN_BLOCKS,
  NodeProp.EXCLUSIVE_READ_BLOCKS,
  NodeProp.EXCLUSIVE_WRITTEN_BLOCKS,
  NodeProp.SHARED_HIT_BLOCKS,
  NodeProp.SHARED_READ_BLOCKS,
  NodeProp.SHARED_DIRTIED_BLOCKS,
  NodeProp.SHARED_WRITTEN_BLOCKS,
  NodeProp.TEMP_READ_BLOCKS,
  NodeProp.TEMP_WRITTEN_BLOCKS,
  NodeProp.LOCAL_HIT_BLOCKS,
  NodeProp.LOCAL_READ_BLOCKS,
  NodeProp.LOCAL_DIRTIED_BLOCKS,
  NodeProp.LOCAL_WRITTEN_BLOCKS,
  NodeProp.PLANNER_ESTIMATE_FACTOR,
  NodeProp.PLANNER_ESTIMATE_DIRECTION,
  NodeProp.SUBPLAN_NAME,
  NodeProp.GROUP_KEY,
  NodeProp.HASH_CONDITION,
  NodeProp.JOIN_TYPE,
  NodeProp.INDEX_NAME,
  NodeProp.HASH_CONDITION,
  NodeProp.EXCLUSIVE_IO_READ_TIME,
  NodeProp.EXCLUSIVE_IO_WRITE_TIME,
  NodeProp.EXCLUSIVE_SHARED_IO_READ_TIME,
  NodeProp.EXCLUSIVE_SHARED_IO_WRITE_TIME,
  NodeProp.EXCLUSIVE_LOCAL_IO_READ_TIME,
  NodeProp.EXCLUSIVE_LOCAL_IO_WRITE_TIME,
  NodeProp.EXCLUSIVE_TEMP_IO_READ_TIME,
  NodeProp.EXCLUSIVE_TEMP_IO_WRITE_TIME,
  NodeProp.EXCLUSIVE_AVERAGE_IO_READ_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_IO_WRITE_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_SHARED_IO_READ_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_SHARED_IO_WRITE_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_LOCAL_IO_READ_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_LOCAL_IO_WRITE_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_TEMP_IO_READ_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_TEMP_IO_WRITE_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_IO_READ_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_IO_WRITE_SPEED,
  NodeProp.EXCLUSIVE_SUM_IO_READ_TIME,
  NodeProp.EXCLUSIVE_SUM_IO_WRITE_TIME,
  NodeProp.EXCLUSIVE_AVERAGE_SUM_IO_READ_SPEED,
  NodeProp.EXCLUSIVE_AVERAGE_SUM_IO_WRITE_SPEED,
  NodeProp.AVERAGE_IO_READ_SPEED,
  NodeProp.AVERAGE_IO_WRITE_SPEED,
  NodeProp.AVERAGE_SHARED_IO_READ_SPEED,
  NodeProp.AVERAGE_SHARED_IO_WRITE_SPEED,
  NodeProp.AVERAGE_LOCAL_IO_READ_SPEED,
  NodeProp.AVERAGE_LOCAL_IO_WRITE_SPEED,
  NodeProp.AVERAGE_TEMP_IO_READ_SPEED,
  NodeProp.AVERAGE_TEMP_IO_WRITE_SPEED,
  NodeProp.IO_READ_TIME,
  NodeProp.IO_WRITE_TIME,
  NodeProp.SHARED_IO_READ_TIME,
  NodeProp.SHARED_IO_WRITE_TIME,
  NodeProp.LOCAL_IO_READ_TIME,
  NodeProp.LOCAL_IO_WRITE_TIME,
  NodeProp.TEMP_IO_READ_TIME,
  NodeProp.TEMP_IO_WRITE_TIME,
  NodeProp.SUM_IO_READ_TIME,
  NodeProp.SUM_IO_WRITE_TIME,
  NodeProp.AVERAGE_SUM_IO_READ_SPEED,
  NodeProp.AVERAGE_SUM_IO_WRITE_SPEED,
  NodeProp.HEAP_FETCHES,
  NodeProp.WAL_RECORDS,
  NodeProp.WAL_BYTES,
  NodeProp.WAL_FPI,
  NodeProp.NODE_ID,
  NodeProp.ROWS_REMOVED_BY_FILTER,
  NodeProp.ROWS_REMOVED_BY_JOIN_FILTER,
  NodeProp.ROWS_REMOVED_BY_INDEX_RECHECK,
  NodeProp.ACTUAL_ROWS_REVISED,
  NodeProp.PLAN_ROWS_REVISED,
  NodeProp.ROWS_REMOVED_BY_FILTER_REVISED,
  NodeProp.ROWS_REMOVED_BY_JOIN_FILTER_REVISED,
  NodeProp.ROWS_REMOVED_BY_INDEX_RECHECK_REVISED,
  "size", // Manually added to use FlexTree
  NodeProp.RELATION_NAME,
  NodeProp.ALIAS,
  NodeProp.FUNCTION_NAME,
  NodeProp.STRATEGY,
  NodeProp.PARTIAL_MODE,
  NodeProp.SCAN_DIRECTION,
  NodeProp.ACTUAL_ROWS_FRACTIONAL,
]

export function shouldShowProp(key: string, value: unknown): boolean {
  return (
    (!!value ||
      nodePropTypes[key] === PropType.increment ||
      key === NodeProp.ACTUAL_ROWS) &&
    notMiscProperties.indexOf(key) === -1
  )
}
