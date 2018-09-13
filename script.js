

document.body.addEventListener('keydown', ev => {
    if (document.activeElement !== elementGoogleSearch) {
        elementGoogleSearch.focus()
    } else {
        if (ev.key === 'Enter') {
            location.href = `https://google.se/search?q=${elementGoogleSearch.value}`
        } else if (ev.key === 'Escape') {
            elementGoogleSearch.value = ''
            elementGoogleCompleteSearch.innerHTML = ''
        } else if (ev.key === 'ArrowUp') {
            navigateUp()
        } else if (ev.key === 'ArrowDown') {
            navigateDown()
        }
    }
})







// GOOGLE SEARCH

const elementGoogleSearch = document.getElementById('googleSearch')
const elementGoogleCompleteSearch = document.getElementById('googleCompleteSearch')

var lastGoogleSearch = 0
var currentHints = []
var currentlySelected = -1
var currentlySelectedElement
elementGoogleSearch.addEventListener('input', () => {
    let query = elementGoogleSearch.value
    if (query.length > 0) {
        if (Date.now() - lastGoogleSearch > 500) {
            lastGoogleSearch = Date.now()
            googleCompleteSearch(query, data => {
                let html = ''
                currentHints = []
                currentlySelected = 0
                data[1].forEach(el => {
                    currentHints.push(el)
                    html += `<a href="https://google.se/search?q=${el}"><li>${el}</li></a>`
                })
                elementGoogleCompleteSearch.innerHTML = html
            })
        }
    } else {
        elementGoogleCompleteSearch.innerHTML = ''
    }
})

var completeSearchCallbacks = []
function googleCompleteSearchCallback(data) {
    console.log('running callback')
    if (completeSearchCallbacks.length > 0) {
        completeSearchCallbacks.splice(0, 1)[0](data)
    } else {
        throw 'No callbacks'
    }
}

function googleCompleteSearch(query, callback) {
    if (query.length > 0) {
        let sc = document.createElement('script')
        sc.src = `https://www.google.com/complete/search?client=chrome&q=${query}&xhr=t&callback=googleCompleteSearchCallback`
        completeSearchCallbacks.push(callback)
        document.body.appendChild(sc)
        setTimeout(() => sc.remove(), 50)
    }
}

function navigateUp() {
    if (-1 < currentlySelected) {
        currentlySelectedElement.classList.remove('selected')
        if (currentlySelected === 0) {
            // No one is selected anymore
        } else {
            if (currentlySelected < currentHints.length-1) {
                currentlySelected--
                document.querySelector(`li:nth-child(${currentlySelected+1})`)
            }
        }
    }
}

function navigateDown() {

}










// CLUSTER LINK POSITIONS

function populate(numLinks, linkDistance=120, linkRotationWidth=35) {
    let totalWidth = linkRotationWidth * (numLinks-1)
    let startRotation = 270 - totalWidth/2
    let positions = []
    for (let i = 0; i < numLinks; i++) {
        let rotation = startRotation + linkRotationWidth*i
        let rad = Math.PI/180*rotation
        positions.push({
            left: Math.cos(rad) * linkDistance,
            top: -Math.sin(rad) * linkDistance,
            rotation: -(i-(numLinks-1)/2)*linkRotationWidth
        })
    }
    return positions
}

;([...document.querySelectorAll('.links')]).forEach(el => {
    let positions = populate(el.children.length)
    for (let i = 0; i < el.children.length; i++) {
        el.children[i].style.transform = `translate(-50%, -50%) rotate(${positions[i].rotation}deg)`
        el.children[i].style.left = positions[i].left + 'px'
        el.children[i].style.top = positions[i].top + 'px'
    }
})