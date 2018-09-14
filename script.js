/* ELEMENT CONSTANTS */
const elClock    = document.getElementById('clock')
const elDate     = document.getElementById('date')
const elWeek     = document.getElementById('week')
const elSearch   = document.getElementById('googleSearch')
const elComplete = document.getElementById('googleCompleteSearch')


/* CONSTANTS */
const DAYS   = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag']
const MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']
const MAX_COMPLETE_STRINGS = 8
const GOOGLE_SEARCH_COOLDOWN = 250
const LINK_DISTANCE = 120
const LINK_ROTATION_WIDTH = 35
const LINK_ROTATION_CENTER = 270


/* VARIABLES */
let lastSearch       = 0
let clockHourOffset  = 0
let completeCount    = 0
let completeElements = []
let searchCallback
let originalText
let selected


/* INITIALIZATION */
Number.prototype.pad = function(size) {
    let s = String(this)
    while (s.length < (size || 2)) { s = '0' + s }
    return s
}

function initClock() {
    let activeDate

    let updateDateText = () => {
        let date = new Date()
        let day = DAYS[date.getDay()-1]
        let month = MONTHS[date.getMonth()]
        let firstDayOfTheYear = new Date(date.getFullYear(),0,1);
        let week = Math.ceil((((date - firstDayOfTheYear) / 86400000) + firstDayOfTheYear.getDay()+1)/7);
        activeDate = date.getDate()
        elDate.innerText = `${day}, ${activeDate} ${month}, ${date.getFullYear()}`
        elWeek.innerText = `Vecka ${week}`
    }

    let updateTimeText = () => {
        let date = new Date()

        if (clockHourOffset !== 0) {
            date.setHours(date.getHours() + clockHourOffset)
        }

        if (date.getDate() !== activeDate) {
            updateDateText()
        }

        elClock.innerText = `${date.getHours().pad(2)}:${date.getMinutes().pad(2)}:${date.getSeconds().pad(2)}`
        let ms = Date.now() % 1000
        setTimeout(updateTimeText, 1000-ms)
    }
    updateDateText()
    updateTimeText()
}

function initLocalStorage() {
    clockHourOffset = parseInt(localStorage.getItem('clockHourOffset')) || 0
}

function initComplete() {
    for (let i = 0; i < MAX_COMPLETE_STRINGS; i++) {
        let a = document.createElement('a')
        a.setAttribute('index', i)
        a.setAttribute('hidden', true)
        elComplete.appendChild(a)
        completeElements[i] = a
    }
}

function initWheelLinks() {
    let calculatePositions = numLinks => {
        let totalWidth = (numLinks - 1) * LINK_ROTATION_WIDTH
        let startRotation = LINK_ROTATION_CENTER - totalWidth / 2
        let positions = []
        for (let i = 0; i < numLinks; i++) {
            let rotation = startRotation + LINK_ROTATION_WIDTH * i
            let rad = Math.PI / 180 * rotation
            positions.push({
                left: Math.cos(rad) * LINK_DISTANCE,
                top: -Math.sin(rad) * LINK_DISTANCE,
                rotation: -(i - (numLinks - 1) / 2) * LINK_ROTATION_WIDTH
            })
        }
        return positions
    }

    let queens = document.querySelectorAll('.links')
    queens.forEach(queen => {
        let positions = calculatePositions(queen.children.length)
        for (let i = 0; i < queen.children.length; i++) {
            queen.children[i].style.transform = `translate(-50%, -50%) rotate(${positions[i].rotation}deg)`
            queen.children[i].style.left = positions[i].left + 'px'
            queen.children[i].style.top = positions[i].top + 'px'
        }
    })
}

function initEventListeners() {
    document.body.addEventListener('keydown', ev => {
        if (document.activeElement !== elSearch) {
            elSearch.focus()
        }
        
        if (ev.key === 'Escape') {
            deselect()
            elSearch.value = ''
            completeCount = 0
            for (let i = 0; i < MAX_COMPLETE_STRINGS; i++) {
                completeElements[i].setAttribute('hidden', true)
            }
        } else if (ev.key === 'Enter') {
            if (selected) {
                currentlySelected.target = currentlySelected ? '_blank' : '_self'
                currentlySelected.click()
            } else {
                if (ev.ctrlKey) {
                    window.open(`https://google.se/search?q=${elSearch.value}`, '_blank').focus()
                } else {
                    location.href = `https://google.se/search?q=${elSearch.value}`
                }
            }
        } else if (ev.key === 'ArrowUp') {
            ev.preventDefault()
            selectOffset(-1)
        } else if (ev.key === 'ArrowDown') {
            ev.preventDefault()
            selectOffset(1)
        }
    })

    elSearch.addEventListener('input', () => {
        let query = elSearch.value
    
        if (Date.now() - lastSearch <= GOOGLE_SEARCH_COOLDOWN
                || query.length === 0) {
            return
        }

        // TODO: deselect complete selection
        
        lastSearch = Date.now()
        googleCompleteSearch(query, strings => {
            deselect(false)
            completeCount = strings.length
            for (let i = 0; i < MAX_COMPLETE_STRINGS; i++) {
                let string = strings[i]
                let element = completeElements[i]
                if (string) {
                    element.innerHTML = `<li>${string}</li>`
                    element.href = `https://google.se/search?q=${string}`
                    element.removeAttribute('hidden')
                } else {
                    element.setAttribute('hidden', true)
                }
            }
        })
    })
}

initClock()
initLocalStorage()
initComplete()
initWheelLinks()
initEventListeners()





/* FUNCTIONS */
function deselect(reset=true) {
    if (selected) {
        selected.classList.remove('selected')
        selected = null
    }
    
    if (originalText && reset) {
        elSearch.value = originalText
        originalText = null
    }
}

function select(element) {
    if (selected) {
        if (selected === element) {
            return
        } else {
            selected.classList.remove('selected')
        }
    }

    if (!originalText) {
        originalText = elSearch.value
    }

    element.classList.add('selected')

    elSearch.value = element.innerText
    elSearch.focus()

    selected = element
}

function selectOffset(offset) {
    let index = -1
    if (selected) {
        index = parseInt(selected.getAttribute('index'))
    }

    let nextIndex = index + offset

    if (nextIndex === -1) {
        deselect()
    } else if (0 <= nextIndex && nextIndex < completeCount) {
        select(completeElements[nextIndex])
    }
}

function googleCompleteSearch(query, callback) {
    if (!searchCallback && query.length > 0) {
        let sc = document.createElement('script')
        sc.src = `https://www.google.com/complete/search?client=chrome&q=${query}&xhr=t&callback=googleCompleteSearchCallback`
        searchCallback = callback
        document.body.appendChild(sc)
        setTimeout(() => sc.remove(), 50)
    }
}

function googleCompleteSearchCallback(data) {
    if (searchCallback) {
        searchCallback(data[1])
        searchCallback = null
    } else {
        throw 'Callback doesn\'t exist'
    }
}