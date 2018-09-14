

document.body.addEventListener('keydown', ev => {
    if (document.activeElement !== elementGoogleSearch) {
        elementGoogleSearch.focus()
    } else {
        if (ev.key === 'Enter') {
            if (currentlySelected) {
                currentlySelected.target = currentlySelected ? '_blank' : '_self'
                currentlySelected.click()
            } else {
                location.href = `https://google.se/search?q=${elementGoogleSearch.value}`
            }
        } else if (ev.key === 'Escape') {
            elementGoogleSearch.value = ''
            elementGoogleCompleteSearch.innerHTML = ''
        } else if (ev.key === 'ArrowUp') {
            ev.preventDefault()
            navigateUp()
        } else if (ev.key === 'ArrowDown') {
            ev.preventDefault()
            navigateDown()
        }
    }

    if (realTyped) {
        elementGoogleSearch.value = realTyped
        realTyped = null
    }
})






// TIME DISPLAY

const elementClock = document.getElementById('clock')
const elementDate = document.getElementById('date')
const elementWeek = document.getElementById('week')

const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag']
const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']

function update() {
    let date = new Date()
    let day = days[date.getDay()-1]
    let month = months[date.getMonth()]
    let firstDayOfTheYear = new Date(date.getFullYear(),0,1);
    let week = Math.ceil((((date - firstDayOfTheYear) / 86400000) + firstDayOfTheYear.getDay()+1)/7);
    elementClock.innerText = date.toLocaleTimeString()
    elementDate.innerText = `${day}, ${date.getDate()} ${month}, ${date.getFullYear()}`
    elementWeek.innerText = `Vecka ${week}`
}

update()





// GOOGLE SEARCH

const elementGoogleSearch = document.getElementById('googleSearch')
const elementGoogleCompleteSearch = document.getElementById('googleCompleteSearch')

var lastGoogleSearch = 0
var currentHints = []
var currentlySelected
var realTyped = ''
elementGoogleSearch.addEventListener('input', () => {
    let query = elementGoogleSearch.value

    if (Date.now() - lastGoogleSearch < 500)
        return
    
    elementGoogleCompleteSearch.innerHTML = ''
    
    if (query.length === 0)
        return
    
    lastGoogleSearch = Date.now()
    googleCompleteSearch(query, data => {
        currentHints = []
        data[1].forEach((hint, index) => {
            if (index >= 8)
                return
            
            let a = document.createElement('a')
            a.href = `https://google.se/search?q=${hint}`
            a.innerHTML = `<li>${hint}</li>`
            a.setAttribute('index', index)
            a.onmouseenter = handleMouseEnter
            a.onmouseleave = handleMouseLeave
            elementGoogleCompleteSearch.appendChild(a)
            currentHints.push(a)
        })
    })
})

function handleMouseEnter(ev) {
    if (currentlySelected) {
        if (currentlySelected === ev.target)
            return
        currentlySelected.classList.remove('selected')
    }
    currentlySelected = ev.target
    currentlySelected.classList.add('selected')
}

function handleMouseLeave(ev) {
    ev.target.classList.remove('selected')
    if (currentlySelected === ev.target)
            currentlySelected = null
}

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
    if (currentHints.length === 0) {
        return
    }

    let index = -1
    if (currentlySelected) {
        index = parseInt(currentlySelected.getAttribute('index'))
    }

    if (index---1 >= 0) {
        if (currentlySelected)
            currentlySelected.classList.remove('selected')
        currentlySelected = currentHints[index]
        currentlySelected.classList.add('selected')
        if (!realTyped)
            realTyped = elementGoogleSearch.value
        elementGoogleSearch.value = currentlySelected.value
    } else {
        // CANT GO ANY FURTHER
    }
}

function navigateDown() {
    if (currentHints.length === 0) {
        return
    }

    let index = -1
    if (currentlySelected) {
        index = parseInt(currentlySelected.getAttribute('index'))
    }

    if (index+++1 <= currentHints.length) {
        if (currentlySelected)
            currentlySelected.classList.remove('selected')
        currentlySelected = currentHints[index]
        currentlySelected.classList.add('selected')
        if (!realTyped)
            realTyped = elementGoogleSearch.value
        elementGoogleSearch.value = currentlySelected.value
    } else {
        // CANT GO ANY FURTHER
    }
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