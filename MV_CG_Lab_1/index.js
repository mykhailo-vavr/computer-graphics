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
  dashGap: 10,
  cubeSize: 100
}

const state = {
  cube: {
    x: 0,
    y: 0,
    z: 0,
    deltaX: 0,
    deltaY: 0,
    deltaZ: 0
  },
  axe: {
    x: 0,
    y: 0,
    z: 0,
    deltaX: 0,
    deltaY: 0,
    deltaZ: 0
  },
  rotating: {
    limit: 15,
    delta: 0.1,
    k: 7,
    x: 15,
    speed: 0.2
  }
}

const setupCanvas = () => {
  background(...theme.colors.lightGrey)
}

const encapsulateShape =
  (func) =>
  (...args) => {
    push()
    func(...args)
    pop()
  }

const drawCartesianGrid = () => {
  const {
    colors: { yellow, lightGrey },
    strokeWidth,
    dashGap,
    canvasHeight,
    canvasWidth
  } = theme

  stroke(...yellow)
  strokeWeight(strokeWidth)

  encapsulateShape(() => {
    let check = true

    for (let i = 0; i < canvasWidth / dashGap; i++) {
      if (check) {
        stroke(...yellow)
        line(-width / 2 + dashGap * i, 0, 0, 0, 0, 0)
        check = false
      } else {
        stroke(...lightGrey)
        line(-width / 2 + dashGap * i, 0, 0, 0, 0, 0)
        check = true
      }
    }
  })()

  line(0, 0, 0, width / 2, 0, 0)

  encapsulateShape(() => {
    let check = true

    for (let i = 0; i < canvasHeight / dashGap; i++) {
      if (check) {
        stroke(...yellow)
        line(0, dashGap * i, 0, 0, height / 2, 0)
        check = false
      } else {
        stroke(...lightGrey)
        line(0, dashGap * i, 0, 0, height / 2, 0)
        check = true
      }
    }
  })()

  line(0, -height / 2, 0, 0, 0, 0)

  encapsulateShape(() => {
    let check = true

    for (let i = 0; i < canvasHeight / dashGap; i++) {
      if (check) {
        stroke(...yellow)
        line(dashGap * i, -dashGap * i, 0, width / 2, -height / 2, -width)
        check = false
      } else {
        stroke(...lightGrey)
        line(dashGap * i, -dashGap * i, 0, width / 2, -height / 2, -width)
        check = true
      }
    }
  })()

  line(0, 0, 0, -width / 2, height / 2, width)
}

const drawCube = () => {
  const rotatingAngle = frameCount * 0.01

  stroke(...theme.colors.darkGrey)
  strokeWeight(theme.strokeWidth)
  noFill()

  translate(state.cube.x, state.cube.y, state.cube.z)

  rotateX(rotatingAngle)
  // rotateY(rotatingAngle)
  // rotateZ(rotatingAngle)

  beginShape()
  vertex(100, -100, -100)
  vertex(0, 0, 100)
  vertex(100, 100, -100)

  vertex(-100, 100, -100)
  vertex(0, 0, 100)

  vertex(100, -100, -100)
  vertex(100, 100, -100)

  vertex(100, -100, -100)
  vertex(-100, 100, -100)

  endShape()
}

const drawAxe = () => {
  stroke(...theme.colors.violet)
  strokeWeight(theme.strokeWidth)

  translate(state.axe.x, state.axe.y, state.axe.z)

  line(width / 4, 0, 0, -width / 4, 0, 0)
}

const rotateShapes = () => {
  const { axe, cube, rotating } = state

  const { sqrt } = Math

  if (rotating.x >= rotating.limit) {
    rotating.delta = -0.1
  } else if (rotating.x <= -rotating.limit) {
    rotating.delta = 0.1
  }

  if (rotating.x == rotating.limit || rotating.x == -rotating.limit) {
    rotating.k *= -1
  }

  rotating.x += rotating.delta

  axe.x = cube.x = rotating.x
  axe.y = cube.y =
    rotating.k * sqrt((225 * axe.x ** 2 - axe.x ** 4) / axe.x ** 2 + 1)
  axe.z = cube.z = rotating.x

  axe.x += axe.deltaX
  cube.x += cube.deltaX
  axe.y += axe.deltaY
  cube.y += cube.deltaY
  axe.z += axe.deltaZ
  cube.z += cube.deltaZ
}

function setup() {
  createCanvas(theme.canvasWidth, theme.canvasHeight, WEBGL)
}

function draw() {
  setupCanvas()
  encapsulateShape(drawCartesianGrid)()
  encapsulateShape(drawAxe)()
  encapsulateShape(drawCube)()
  rotateShapes()
}

function keyTyped() {
  const { axe, cube } = state

  const keyTypedActions = {
    a: () => {
      axe.deltaX -= 10
      cube.deltaX -= 10
    },
    d: () => {
      axe.deltaX += 10
      cube.deltaX += 10
    },
    w: () => {
      axe.deltaY -= 10
      cube.deltaY -= 10
    },
    s: () => {
      axe.deltaY += 10
      cube.deltaY += 10
    },
    q: () => {
      axe.deltaZ += 10
      cube.deltaZ += 10
    },
    e: () => {
      axe.deltaZ -= 10
      cube.deltaZ -= 10
    },
    r: () => {
      axe.deltaX =
        cube.deltaX =
        axe.deltaY =
        cube.deltaY =
        axe.deltaZ =
        cube.deltaZ =
          0
    },
    default: () => {}
  }

  const keyTypedAction = keyTypedActions[key] || keyTypedActions.default
  keyTypedAction()
}
