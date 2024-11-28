let itemArr = [],
    itemList = {};
let local = [];
let items = "",
    blocks = "",
    materials = "",
    item_modifiers;
let translate = [];

document.getElementById('LocalizationInput').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload = () => {
        local = CSVToArray(reader.result);
        // console.log(local);
        run();
    }
    reader.readAsText(this.files[0]);
});

document.getElementById('itemsxmlinput').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload = () => {
        items = reader.result;
        // console.log(txt);
        run();
    }
    reader.readAsText(this.files[0]);
});
document.getElementById('itemmodifierssxmlinput').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload = () => {
        item_modifiers = reader.result;
        // console.log(txt);
        run();
    }
    reader.readAsText(this.files[0]);
});

document.getElementById('blocksxmlinput').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload = () => {
        blocks = reader.result;
        // console.log(txt);
        run();
    }
    reader.readAsText(this.files[0]);
});

document.getElementById('materialsxmlinput').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload = () => {
        materials = reader.result;
        // console.log(txt);
        run();
    }
    reader.readAsText(this.files[0]);
});

function extend(defaults, data) {
    Object.keys(data).forEach(e => {
        if (data[e].constructor?.name == "Object") {
            if (defaults[e].constructor?.name != "Object") {
                defaults[e] = {};
            }
            extend(defaults[e], data[e]);
        } else {
            defaults[e] = data[e];
        }
    });
    return defaults;
}
let langArr = ["english", "german", "spanish", "french", "italian", "japanese", "koreana", "polish", "brazilian", "russian", "turkish", "schinese", "tchinese"];
function run() {
    let keys = local[0];
    itemArr = [];
    local.slice(1).forEach(e => {
        langArr.forEach(l => {
            if (!translate[e[0]]) {
                translate[e[0]] = {};
            }
            translate[e[0]][l] = e[keys.indexOf(l)];
        });
    });

    [
        [items, "item"],
        [blocks, "block"],
        [materials, "material", "id"],
        [item_modifiers, "item_modifier"],
    ].forEach(e => {
        parse(...e);
    });
    itemArr = itemArr.filter(function (item) {
        return !!item.english;
    })
    // console.log(itemArr);

    while (document.getElementById("output").firstChild) {
        document.getElementById("output").firstChild.remove();
    }

    render("", "");
    // document.getElementById("output").innerHTML = "";
    // document.getElementById("output").add(...doc.children);
}
/**
 * 
 * @param {string} str
 * @param {string[]} matcher
 */
function matches(str, matcher) {
    str = str.trim();
    matcher = matcher.trim();

    let match = parseCSV(matcher, " ").flatMap(e => e);

    match = match.map(function (m) {
        if (m[0] == "-") {
            if (m.length > 1) return !str.includes(m.substring(1).trim());
            return true;
        }
        return str.includes(m);
    });
    return !match.includes(false);
}

function render(name, id) {
    document.getElementById("output").innerHTML = "";

    itemArr.filter(function (item) {
        return matches(item.english.toLowerCase(), name.toLowerCase()) && matches(item.name.toLowerCase(), id.toLowerCase());
    }).sort(function (a, b) {
        return a.english > b.english ? 1 : a.english < b.english ? -1 : 0;
    }).forEach(e => {
        document.getElementById("output").add(
            createElement("tr").add(
                createElement("td", {
                    innerHTML: e.english
                }),
                createElement("td", {
                    innerHTML: e.name
                })
            )
        );
    });
}

function parse(txt, tag, opt = "name") {
    let parser = new DOMParser();
    let doc = parser.parseFromString(txt, "text/xml");
    let arr = [...doc.querySelectorAll(tag)].map(e => {
        let r = {};
        r.name = e.getAttribute(opt);
        r.properties = map(e);
        langArr.forEach(l => {
            r[l] = (translate[r.name] || (() => {
                let a = {};
                a[l] = undefined;
                return a;
            })())[l] || undefined
        })
        delete r.properties["null"];
        itemList[r.name] = r;
        itemArr.push(r);
    });
    return arr;
}

function map(el) {
    let a = {};
    [...el.children].forEach(e => {
        if (e.tagName === "property") {
            a[e.getAttribute("name")] = e.getAttribute("value");
        }
    });
    return a;
}

function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    let objPattern = new RegExp("(\\" + strDelimiter + "|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");

    let arrData = [[]];
    let arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {
        let strMatchedDelimiter = arrMatches[1];

        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
            arrData.push([]);
        }

        let strMatchedValue;

        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
        } else {
            strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return (arrData);
}

function parseCSV(str, delimiter = ",") {
    const arr = [];
    let quote = false;
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        if (cc == '"') { quote = !quote; continue; }

        if (cc == delimiter && !quote) { ++col; continue; }

        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    return arr;
}