/// <reference path="jquery-3.6.0.js"/>
const globalList = []
let lastInputOverCheck = ""

$(function () {
    $("#save").click(saveModal)
})

async function getBitcion() {
    try {
        const data = await getJSON("https://api.coingecko.com/api/v3/coins/list")
        addCard(data)
    } catch (err) {
        alert(err)

    }

}

function addCard(data) {
    const table = $(".table-abd")

    for (let i = 200; i < 300; i++) {
        let card = data[i]
        table.append(
            `<div  class="singla-currency card">
            <div class="toggle-button">
                <label class="switch">
                    <input id="${card.id}_input" type="checkbox">
                    <span class="slider round"></span>
                </label>
            </div>

            <div class="info">
                <span id="${card.id}_symbol">${card.symbol}</span>
                <br>
                <span id="${card.id}_name">${card.name}</span>
                <br>
                <button class="btn btn-primary" id="${card.id}"> More info</button>
                <div class="coll">
                </div>


            </div>

        </div>`
        )
        addEventLisnerToMoreInfo(card.id)
    }

    addEventLisnerToToggleButton()

}
getBitcion()

function fixHegith(T) {
    if (T.clientHeight === 148)
        T.style.height = "250px"
    else
        T.style.height = "150px"
}

function addEventLisnerToMoreInfo(id) {
    $("#" + id).click(getMoreinfo)
}

function getMoreinfo() {
    const id = this.id
    const cuurentColl = "#" + id + "+ div"
    remove_spiner(cuurentColl)
    $(cuurentColl).toggle()
    fixHegith(this.parentElement.parentElement)
    add_spiner(cuurentColl)
    
    if (getDataFormLocalStorge(id) === false)
        getdataFromSrever(id)

}


async function getdataFromSrever(id) {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/${id}`
        const data = await getJSON(url)
        addDatatoUi(data, id)
        remove_spiner("#" + id + "+ div")
        setWithExpiry(id, data, 120000)
    } catch (err) {
        alert(err)
    }
}

function addDatatoUi(data, id) {
    const cuurentColl = "#" + id + "+ div"
    remove_spiner(cuurentColl)
    $(cuurentColl).empty()
    $(cuurentColl).append(`
                    <img src="${data.image.thumb}">
                    <br>
                    <span>${data.market_data.current_price['usd']}$</span>
                    <br>
                    <span>${data.market_data.current_price['ils']}₪</span>
                    <br>
                    <span>${data.market_data.current_price['eur']}€</span>
                   
    `)


}


function remove_spiner(id) {
    const spiner = id + ">" + ".spinner-border"
    $(spiner).remove()
}

function add_spiner(id) {
    $(id).append(`<div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
    </div>`)
}


function addEventLisnerToToggleButton() {
    $(".switch > input").click(toggleButtonFollow)
}

function toggleButtonFollow() {
    const inputId = this.id
    const id = inputId.split("_")[0]
    const check = document.getElementById(inputId).checked
    const symbol = $(`#${id}_symbol`).text()
    const name = $(`#${id}_name`).text()
    if (check === true) {
        if (globalList.length < 5) {
            globalList.push({
                'id': id,
                'symbol': symbol,
                'name': name
            })
        } else {
            document.getElementById(inputId).checked = false;
            lastInputOverCheck = inputId
            callModal()
        }
    } else {
        document.getElementById(inputId).checked = false;
        removeFormGolbalList(id)
        printobj()


    }

}

function callModal() {
    $(".modal-body").empty()
    let body = ""
    for (let i = 0; i < 5; i++) {
        let item = globalList[i]
        body += `
            <input type="radio" id="${item.id}_moadl" name="modal" >
            <label for="${item.id}_moadl">${item.name}</label><br>
      `
    }
    $(".modal-body").append(body)
    $("#mybtn").click()
}

function saveModal() {
    const id = $(".modal-body >input:checked").attr("id").split("_")[0]
    const toggleInput = id + "_input"
    document.getElementById(toggleInput).checked = false
    removeFormGolbalList(id)
    $("#" + lastInputOverCheck).click()
    $("#closebtn").click()

}


function removeFormGolbalList(itemId) {
    for (let i = 0; i < globalList.length; i++) {
        const id = globalList[i].id
        if (id === itemId) {
            globalList.splice(i, 1);
            break
        }



    }


}

function printobj() {
    for (item of globalList)
        console.log("id:", item.id, "name:", item.name)
}

function setWithExpiry(key, value, ttl) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
}


function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key)
    // if the item doesn't exist, return null
    if (!itemStr) {
        return null
    }
    const item = JSON.parse(itemStr)
    const now = new Date()
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        localStorage.removeItem(key)
        return null
    }
    return item.value
}

function getDataFormLocalStorge(key) {
    const data = getWithExpiry(key)
    console.log("data:",data)
    if (data === null) {
        console.log("inside")

        return false
    }
    console.log("outside")

    addDatatoUi(data)
    remove_spiner("#" + key + "+ div")
    return true


}