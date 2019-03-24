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
  
  function drawGrid(canvas) {
    // const ctx = canvas.getContext('2d')
    // const w = canvas.clientWidth
    // const h = canvas.clientHeight
  
    // // Draw grid
    // ctx.beginPath()
    // ctx.strokeStyle = '#DDD'
    // for (let x = - w / 2; x <= w / 2; x += 100) {
    //   for (let y = - w / 2; y <= h / 2; y += 100) {
    //     ctx.moveTo(x, 0 - canvas.positionY);
    //     ctx.lineTo(x, h - canvas.positionY);
    //     ctx.stroke();
    //     ctx.moveTo(0, y);
    //     ctx.lineTo(w, y);
    //     ctx.stroke();
    //   }
    // }
  }
  
  function drawGridSVG(canvas) {
    if (!canvas.gridInitialized) {
      console.log('loading img')
      canvas.gridInitialized = true
      canvas.gridImg = null
      var data = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"> \
          <defs> \
              <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse"> \
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="gray" stroke-width="0.5" /> \
              </pattern> \
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"> \
                  <rect width="80" height="80" fill="url(#smallGrid)" /> \
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="gray" stroke-width="1" /> \
              </pattern> \
          </defs> \
          <rect width="100%" height="100%" fill="url(#smallGrid)" /> \
      </svg>';
  
      var DOMURL = window.URL || window.webkitURL || window;
  
      var img = new Image();
      var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      var url = DOMURL.createObjectURL(svg);
  
      img.onload = function () {
        console.log('loaded img')
        canvas.gridImg = img
        DOMURL.revokeObjectURL(url);
      }
    }
  
    if (!canvas.gridImg) {
      return
    }
  
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0);
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