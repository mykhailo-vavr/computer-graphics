const theme = {
  colors: {
    lightGrey: [165, 177, 194],
    darkGrey: [75, 101, 132],
    yellow: [247, 183, 49],
    violet: [136, 84, 208]
  },
  strokeWidth: 3,
  canvasWidth: 700,
  canvasHeight: 700,
  cellSize: 10
}

const settings = {
  speed: 0.001
}

const state = {
  points: [],
  tempPoints: [],
  isTest: false,
  isHidden: false
}

const factorial = (n) => (n === 0 ? 1 : n * factorial(n - 1))

const combinations = (n, k) => factorial(n) / (factorial(k) * factorial(n - k))

const normalizeCoordinate = (coordinate, type) => {
  const clientRect = document.querySelector('canvas').getBoundingClientRect()

  return coordinate - clientRect[type]
}

class Point {
  constructor(x, y, number) {
    this.x = x
    this.y = y
    this.number = number
  }
}

const setupCanvas = () => {
  background(...theme.colors.lightGrey)
}

const resetArea = () => {
  state.points.forEach((p) => {
    p.div.remove()
  })
  state.points = []
  state.isTest = false
}

const encapsulateShape =
  (func) =>
  (...args) => {
    push()
    func(...args)
    pop()
  }

const testBezier = encapsulateShape(() => {
  const pointsForBezier = []

  stroke(theme.colors.violet)
  strokeWeight(theme.strokeWidth * 3)
  noFill()

  state.points.forEach(({ x, y }) => {
    pointsForBezier.push(x, y)
  })

  bezier(...pointsForBezier)
})

const togglePoints = () => {
  state.points.forEach((p) =>
    p.div.style('display', state.isHidden ? 'block' : 'none')
  )

  state.isHidden = !state.isHidden
}

const drawGrid = encapsulateShape(() => {
  const {
    canvasWidth,
    canvasHeight,
    cellSize,
    colors: { darkGrey }
  } = theme

  const colsCount = canvasWidth / cellSize
  const rowsCount = canvasHeight / cellSize

  stroke(...darkGrey)

  for (let i = 0; i < colsCount; i++) {
    line(i * cellSize, 0, i * cellSize, canvasHeight)
  }

  for (let i = 0; i < rowsCount; i++) {
    line(0, i * cellSize, canvasWidth, i * cellSize)
  }
})

const drawPoints = encapsulateShape(() => {
  state.isHidden ? noStroke() : stroke(theme.colors.violet)
  strokeWeight(theme.strokeWidth * 4)

  state.points = state.points.map((p) => {
    const div =
      p.div == undefined
        ? createDiv(p.number).position(
            p.x + theme.canvasWidth / 2,
            p.y + +theme.canvasHeight / 12
          )
        : null

    state.isHidden ? div?.style('display', 'none') : null
    point(p.x, p.y)

    if (p.div == undefined) {
      return { ...p, div }
    }

    return p
  })
})

const drawBezier = encapsulateShape((points) => {
  stroke(...theme.colors.yellow)
  strokeWeight(theme.strokeWidth)
  const n = points.length - 1

  for (let t = 0; t < 1; t += settings.speed) {
    let x = (y = 0)

    const getCoordinateValue = (coordinate, i) =>
      coordinate * combinations(n, i) * t ** i * (1 - t) ** (n - i)

    for (let i = 0; i < points.length; i++) {
      x += getCoordinateValue(points[i].x, i)
      y += getCoordinateValue(points[i].y, i)
    }

    point(x, y)
  }
})

const onClick = ({ x, y }) => {
  const { strokeWidth } = theme

  const pointX = normalizeCoordinate(x, 'x')
  const pointY = normalizeCoordinate(y, 'y')

  const pointIndex = state.points.findIndex(
    (point) =>
      (point.x - pointX) ** 2 + (point.y - pointY) ** 2 <= strokeWidth * 5 ** 2
  )

  if (pointIndex !== -1) {
    state.points[pointIndex].div.remove()
    state.points.splice(pointIndex, 1)
    state.points = state.points.map(({ div, ...rest }, i) => {
      div.html(i)

      return {
        div,
        ...rest
      }
    })
    return
  }

  state.points.push(new Point(pointX, pointY, state.points.length))
}

function setup() {
  createCanvas(theme.canvasWidth, theme.canvasHeight, P2D).mouseClicked(onClick)
}

function draw() {
  frameRate(30)
  setupCanvas()

  drawGrid()
  drawPoints()
  drawBezier(state.points)

  if (state.isTest) {
    testBezier()
  }
}

function keyTyped() {
  const keyTypedActions = {
    r: resetArea,
    t: () => (state.isTest = !state.isTest),
    h: togglePoints,
    default: () => {}
  }

  const keyTypedAction = keyTypedActions[key] || keyTypedActions.default
  keyTypedAction()
}
