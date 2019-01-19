var allObjects = new Array();
var relatedObjects = new Array();
var clickMap = new Map();
var currentTitle = "";
let searchButton = document.getElementById('searchButton');

searchButton.addEventListener('click', () => {
    search();
});

// for "x" clear button that clear the text at input, the list of results should also be cleared. 
$("#searchclear").click(function(){
    $("#textField").val('');
    document.getElementById('resultList').innerHTML = "";
}); 

$('#textField').keyup(function(e) {
    var keycode = e.keyCode || e.which;
    if(keycode == '13') {
        search();
    } else if ((keycode == '8' || keycode == '46') 
    && (document.getElementById('textField').value.trim() == "") ) {
        document.getElementById('resultList').innerHTML = "";
    }
});

loadObjects();

function initLocalStorage() {
        if (typeof(Storage) !== "undefined") {
        // restore the localStorage, if storage is empty, will init new one
            for (i = 0; i < allObjects.length; i++) {
                if (getItem(clickMap, allObjects[i].title) != "buttonGreen") {
                    setItem(clickMap, allObjects[i].title, "buttonGrey");
                }
            }
        } else {
            for (i = 0; i < allObjects.length; i++) {
                setItem(clickMap, allObjects[i].title, "buttonGrey");
            }
        }
}

function addEventListeners() {
    for (i = 0; i < relatedObjects.length; i++) {
            document.getElementById(relatedObjects[i].title)
            .addEventListener('click', (e) => {
                setItem(clickMap, e.target.id, "buttonGreen");
                e.target.outerHTML = 
                "<span class=\"glyphicon glyphicon-star " + getItem(clickMap, e.target.id) 
                + " id=\""+ e.target.id +"\"" + " aria-hidden=\"true\"></span>";
            });
    }
}
    
function loadObjects() {
    $.getJSON('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000', function (data) {
        allObjects = data;
    }).error(function(){
        console.log('error: json not loaded');  // debug
    })
    .done(function() {
        console.log( "JSON loaded!" );  // debug
        initLocalStorage();
    });

}

function searchObject(text) {
    for (i = 0; i < allObjects.length; i++) {
        if (allObjects[i].title.toLowerCase().includes(text)) {
            relatedObjects.push(allObjects[i]);
        } else if (allObjects[i].keywords.toLowerCase().includes(text)) {
            relatedObjects.push(allObjects[i]);
        }
    }
}

function insertResults() {
    var res = "";
    for(n=0;n<relatedObjects.length;n++){
        res = res + "<div class=\"column1\">" 
        + "<button type=\"button\" class=\"button\">"
        + "<span class=\"glyphicon glyphicon-star " + getItem(clickMap, relatedObjects[n].title) 
        + "\"" + " id=\""+ relatedObjects[n].title +"\"" + " aria-hidden=\"true\"></span>"
        + "</button>"
        + relatedObjects[n].title + "</div>";
        res = res + "<div class=\"column2\">" + restoreText(relatedObjects[n].body) + "</div>";
    }
    return res;
}

//fix the random chars in the body of each object of the JSON file
function restoreText(text) {   
    var txt = document.createElement("textarea");
    txt.innerHTML = text.replace(/\//g, "/");
    return txt.value;
}

function search() {
    relatedObjects = new Array();   // clear the previous search

    if (document.getElementById('textField').value.trim() == "") {
        return;
    }
    searchObject(document.getElementById('textField').value.toLowerCase());
    document.getElementById('resultList').innerHTML = insertResults();
    addEventListeners();
}

function setItem(map, key, value) {
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage
        window.localStorage.setItem(key, value);
    } else {
        // No web storage Support.
        map.setItem(key, value);
    }
}

function getItem(map, key) {
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage
        return window.localStorage.getItem(key);
    } else {
        // No web storage Support.
        return map.getItem(key);
    }
}


