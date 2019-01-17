let button = document.getElementById('button');

button.addEventListener('click', () => {
    relatedObjects = new Array();   // clear the previous search

    if (document.getElementById('textField').value.trim() == "") {
        return;
    }
    searchObject(document.getElementById('textField').value);
    console.log(relatedObjects);    // debug
    document.getElementById('resultList').innerHTML = insertResults();
});

var allObjects = new Array();
var relatedObjects = new Array();
    
function loadObjects() {
    $.getJSON('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000', function (data) {
        allObjects = data;
    }).error(function(){
        console.log('error: json not loaded');  // debug
    })
    .done(function() {
        console.log( "JSON loaded!" );  // debug
    });

}

function searchObject(text) {
    var i;
    for (i = 0; i < allObjects.length; i++) {
        if (allObjects[i].title.includes(text)) {
            relatedObjects.push(allObjects[i]);
        } else if (allObjects[i].keywords.includes(text)) {
            relatedObjects.push(allObjects[i]);
        }
    }
}

function insertResults() {
    var res = "";
    for(n=0;n<relatedObjects.length;n++){
        res = res + "<div class=\"column1\">" + relatedObjects[n].title + "</div>";
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

loadObjects();
