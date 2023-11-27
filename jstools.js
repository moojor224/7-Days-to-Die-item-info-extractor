function waitForKeyElements(query, callback, stopAfterFound, element) {
    currentlyWorking = true;
    var o, r;

    (o = (void(0) === element) ? $(query) : $(element).contents().find(query)) && o.length > 0 ? (r = !0, o.each(function() {
            var e = $(this);
            e.data("alreadyFound") || false || (callback(e) ? r = false : e.data("alreadyFound", true))
        })) :
        r = false;
    var l = waitForKeyElements.controlObj || {},
        i = query.replace(/[^\w]/g, "_"),
        c = l[i];
    r && stopAfterFound && c ? (
        clearInterval(c),
        delete l[i]
    ) : c || (
        c = setInterval(
            function() {
                waitForKeyElements(query, callback, stopAfterFound, element);
            },
            1000
        ),
        l[i] = c
    );
    waitForKeyElements.controlObj = l;
} //wait for key elements

function createElement(tag = "span", data = {}) {
    tag = typeof(tag) === "string" ? document.createElement(tag) : tag;
    Object.keys(data).forEach(e => {
        if (typeof data[e] === "object") {
            createElement(tag[e] || (tag[e] = {}), data[e]);
        } else {
            tag[e] = data[e];
        }
    });
    return tag;
}

window.Element.prototype.add = function() {
    Array.from(arguments).forEach(elem => {
        this.append(elem);
    })
    return this;
}




function getCookie(str) {
    var map = new Map();
    document.cookie.split(";").forEach(e => {
        e = e.trim();
        map.set(e.substring(0, e.indexOf("=")), e.substring(e.indexOf("=") + 1));
        // console.log(e.substring(0,e.indexOf("=")));
    });
    return map.get(str);
} //get cookie





function checkForScriptUpdate() {
    var updateURL = GM_info.scriptMetaStr.split("@updateURL")[1].split("\n")[0].trim();
    GM_xmlhttpRequest({
        method: "GET",
        url: updateURL,
        onload: function(response) {
            var script = response.responseText.split('@version')[1].split('\r')[0].trim();
            if (script !== GM_info.script.version) {
                window.open(updateURL, '_blank');
            }
        }
    });
} //check for script update


function tabColor(color) {
    function isValidCSSColor(color2) {
        if (["unset", "initial", "inherit"].includes(color2)) {
            return false;
        }
        const s = new Option().style;
        s.color = color2;
        return s.color !== '';
    }
    if (!isValidCSSColor(color)) {
        return;
    }
    var c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    var zne = c.getContext("2d");
    zne.fillStyle = color;
    zne.fillRect(0, 0, 128, 128);
    var b = document.querySelector("link[rel=icon]") || createElement("link");
    b.href = c.toDataURL();
    b.rel = "icon";
    document.head.append(b);
} //set tab color