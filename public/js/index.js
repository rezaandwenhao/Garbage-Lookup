var allObjects = new Array();   //all the objects from JSON file
var relatedObjects = new Array();   //related objects after keyword searching
var favouriteIds = new Array(); //the id of the object that is in fav list
var clickMap = new Map();   //when local storage not available, store the button color
let searchButton = document.getElementById('searchButton');

loadObjects();  // load data from JSON file

searchButton.addEventListener('click', () => {
    search();
});

/* for "x" clear button that clear the text at input, 
the list of results should also be cleared. */
$("#searchclear").click(function () {
    $("#textField").val('');
    document.getElementById('resultList').innerHTML = "";
    relatedObjects = new Array();  //empty the relatedObjects
});

$('#textField').keyup(function (e) {
    var keycode = e.keyCode || e.which;
    if (keycode == '13') {
        search();   // click "enter" to search
    } else if ((keycode == '8' || keycode == '46')
        && (document.getElementById('textField').value.trim() == "")) {
        /* when using backspace or delete key to clear the text at input, 
        the list of results should also be cleared. */
        document.getElementById('resultList').innerHTML = "";
        relatedObjects = new Array();  //empty the relatedObjects
    }
});

/** 
 * Initialize the local storage. 
 * If the local storage is not available for the browser,
 * initialize an all "buttonGrey" clickMap
*/
function initLocalStorage() {
    if (typeof (Storage) !== "undefined") {
        // restore the localStorage, if storage is empty, will init new one
        allObjects.forEach((item) => {
            if (getItem(clickMap, item.title) != "buttonGreen") {
                setItem(clickMap, item.title, "buttonGrey");
            }
        })
    } else {
        allObjects.forEach((item) => {
            setItem(clickMap, item.title, "buttonGrey");
        })
    }
}

/** 
 * Add an event listener to the button with name id
 * @param {string} id - the id of the button that is to be added a listener
*/
function addEventListenerToId(id) {
    document.getElementById(id)
        .addEventListener('click', (e) => {
            setItem(clickMap, e.target.id, "buttonGreen");
            e.target.outerHTML =
                "<span class=\"glyphicon glyphicon-star " + getItem(clickMap, e.target.id)
                + "\"" + " id=\"" + e.target.id + "\"" + " aria-hidden=\"true\"></span>";
            document.getElementById("favourites").innerHTML = insertFavourites(); // update the fav list
            addEventListenersToFav(); //re-enable the button in the favourite list
        });
}

/** 
 * Add an event listeners to the item buttons in the fav list
*/
function addEventListenersToFav() {
    favouriteIds.forEach((item) => {
        // get the button in the fav list, not in the results list
        document.getElementById(item + " Fav")
            .addEventListener('click', (e) => {
                var originalId = e.target.id.slice(0, -4);
                setItem(clickMap, originalId, "buttonGrey");
                // remove the item from favourites list
                document.getElementById("favourites").innerHTML = insertFavourites();
                /* When remove item A from fav list, 
                * add a listener to the A star that becomes grey if it's in the result list.
                * So it can be clicked again to add to fav list*/
                relatedObjects.forEach((item) => {
                    if (item.title === originalId) {
                        document.getElementById(originalId).outerHTML =
                            "<span class=\"glyphicon glyphicon-star buttonGrey\""
                            + " id=\"" + originalId + "\"" + " aria-hidden=\"true\"></span>";
                        addEventListenerToId(originalId);
                    }
                })
                addEventListenersToFav(); //re-enable the button in the favourite list
            });
    })
}

/** 
 * Load the JSON file to allObjects array
 * When finished, initialize the storage, display the fav list
 * and add button listeners to fav list
*/
function loadObjects() {
    $.getJSON('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000', function (data) {
        allObjects = data;
    }).error(function () {
        console.log('error: json not loaded');  // debug
    }).done(function () {
            console.log("JSON loaded!");  // debug
            initLocalStorage();
            $(document).ready(function () {
                document.getElementById("favourites").innerHTML = insertFavourites();
            }); // render the fav list
            addEventListenersToFav();
        });

}

/** 
 * Search the ojects based on keywords and title
*/
function searchObject(text) {
    allObjects.forEach((item) => {
        if (item.title.toLowerCase().includes(text)) {
            relatedObjects.push(item);
        } else if (item.keywords.toLowerCase().includes(text)) {
            relatedObjects.push(item);
        }
    })
}

/** 
 * Return the html codes that is going to be inserted to the results list
*/
function insertResults() {
    var res = "";
    for (n = 0; n < relatedObjects.length; n++) {
        // Here I use the object title as the button's id
        res = res + "<div class=\"column1\">"
            + "<button type=\"button\" class=\"button\">"
            + "<span class=\"glyphicon glyphicon-star " + getItem(clickMap, relatedObjects[n].title)
            + "\"" + " id=\"" + relatedObjects[n].title + "\"" + " aria-hidden=\"true\"></span>"
            + "</button>"
            + relatedObjects[n].title + "</div>";
        res = res + "<div class=\"column2\">" + restoreText(relatedObjects[n].body) + "</div>";
    }
    return res;
}

/** 
 * Return the html codes that is going to be inserted to the fav list
*/
function insertFavourites() {
    favouriteIds = new Array();
    var res = "";
    for (i = 0; i < getMapOrStorage().length; i++) {
        var key = getKey(i);
        if (getItem(clickMap, key) === "buttonGreen") {
            /* Here add " Fav" at the end of title to distinguish the id for buttons
            in the results list*/
            res = res + "<div class=\"column1\">"
                + "<button type=\"button\" class=\"button\">"
                + "<span class=\"glyphicon glyphicon-star " + "buttonGreen"
                + "\"" + " id=\"" + key + " Fav\"" + " aria-hidden=\"true\"></span>"
                + "</button>"
                + key + "</div>";
            // loop to find out the body according to favourite's title
            allObjects.forEach((item) => {
                if (item.title === key) {
                    res = res + "<div class=\"column2\">" + restoreText(item.body) + "</div>";
                }
            })
            favouriteIds.push(key);
        }
    }
    return res;
}

/**
 * fix the random chars in the body of each object of the JSON file
 */
function restoreText(text) {
    var txt = document.createElement("textarea");
    txt.innerHTML = text.replace(/\//g, "/");
    return txt.value;
}

/**
 * When search button or "enter" is clicked,
 * perform searchObject() to the content in the input and then 
 * insert the html codes generated by insertResults() 
 * and add button listeners to stars
 */
function search() {
    relatedObjects = new Array();   // clear the previous search
    // if nothing in the input, then do nothing
    if (document.getElementById('textField').value.trim() == "") {
        return;
    }
    searchObject(document.getElementById('textField').value.toLowerCase());
    document.getElementById('resultList').innerHTML = insertResults();
    // add event listeners to related results
    relatedObjects.forEach((item) => {
        addEventListenerToId(item.title);
    })
}

/**
 * The following 4 robust functions are used to set item, get item,
 * get storage and get key (according to index). If the browser does not
 * support local storage, it will instead perform the same function to clickMap
 */
function setItem(map, key, value) {
    if (typeof (Storage) !== "undefined") {
        window.localStorage.setItem(key, value);
    } else {
        // No web storage Support.
        map.setItem(key, value);
    }
}

function getItem(map, key) {
    if (typeof (Storage) !== "undefined") {
        return window.localStorage.getItem(key);
    } else {
        // No web storage Support.
        return map.getItem(key);
    }
}

function getMapOrStorage() {
    if (typeof (Storage) !== "undefined") {
        return window.localStorage;
    } else {
        // No web storage Support.
        return clickMap;
    }
}

function getKey(index) {
    if (typeof (Storage) !== "undefined") {
        return window.localStorage.key(index);
    } else {
        // No web storage Support.
        return Array.from(clickMap.keys())[index];
    }
}
