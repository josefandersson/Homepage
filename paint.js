const elCanvas  = document.querySelector('div.drawArea > canvas')
const elClear = document.querySelector('div.clear')
const ctx  = elCanvas.getContext('2d')

const COLOR = '#98804d'
const WIDTH = 3

let drawing = false
let lastLocation

document.addEventListener('mousedown', (ev) => {
    if (ev.target.classList.contains('paint')) {
        ev.preventDefault()
        elClear.classList.add('showing')
        drawing = true
        lastLocation = null
    }
})

document.addEventListener('mousemove', (ev) => {
    if (drawing) {
        let location = { x:ev.clientX, y:ev.clientY }

        if (lastLocation) {
            ctx.beginPath()
            ctx.moveTo(lastLocation.x, lastLocation.y)
            ctx.lineTo(location.x, location.y)
            ctx.stroke()
        }

        lastLocation = location
    }
})

document.addEventListener('mouseup', (ev) => {
    ev.preventDefault()
    drawing = false
})

elClear.addEventListener('click', () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    elClear.classList.remove('showing')
})

function resize() {
    elCanvas.height = window.innerHeight
    elCanvas.width = window.innerWidth
    ctx.strokeStyle = COLOR
    ctx.lineWidth = WIDTH
    elClear.classList.remove('showing')
}
window.addEventListener('resize', resize)
resize()