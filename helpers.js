const BACKGROUND_COLOR = '#3E3E3E';


function initCanvas() {
    const canvas = document.querySelector('#canvas')
    canvas.zoom = 1
    canvas.positionX = 0
    canvas.positionY = 0
  
    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
  
    canvas.addEventListener('mousemove', function (evt) {
      if (!canvas.dragging) {
        return
      }
      canvas.positionX = (canvas.positionX || 0) + evt.movementX
      canvas.positionY = (canvas.positionY || 0) + evt.movementY
    })
  
    canvas.addEventListener('mousedown', function drag() {
      canvas.dragging = true
    })
  
    canvas.addEventListener('mouseup', function () {
      canvas.dragging = false
    })
  
    canvas.addEventListener('wheel', function (evt) {
      canvas.zoom += canvas.zoom * (evt.deltaY / 100)
    })
  
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
  
    return canvas
  }
  
  function updateCanvas(canvas) {
    const ctx = canvas.getContext('2d')
    
    const zoom = canvas.zoom
    const w = canvas.width
    const h = canvas.height
    const x = canvas.positionX || 0
    const y = canvas.positionY || 0
    
    ctx.resetTransform()
    ctx.fillStyle = BACKGROUND_COLOR
    // ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // ctx.translate(canvas.clientWidth / 2 + x, canvas.clientHeight / 2 + y)
    ctx.translate(0 + x, 0 + y)
    ctx.scale(zoom, zoom)
  }
  
  function colorForTrace(mag, magE = 500) {
    const magS = 0
    const colorAtMax = [230, 255, 230, 0.9]
    const colorAtMin = [255, 255, 255, 0.05]
  
    return interpolateColorStyleMapping(mag, magS, magE, colorAtMin, colorAtMax)
  }
  
  function interpolateColorStyleMapping(mag, magS, magE, colorAtMin, colorAtMax) {
    let int = (mag - magS) / (magE - magS)
    return interpolateColorStyle(int, colorAtMin, colorAtMax)
  }
  
  function interpolateColorStyle(int, s, e) {
    int = Math.max(int, 0)
    intI = 1 - int
    return `rgba(${s[0] * intI + e[0] * int}, ${s[1] * intI + e[1] * int}, ${s[2] * intI + e[2] * int}, ${s[3] * intI + e[3] * int})`
  }