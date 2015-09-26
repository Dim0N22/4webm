function clickTag(tag) {
    var action;
    var tagName = tag.id;
    var tags = Cookies.getJSON('tags') || [];

    if ($(tag).hasClass("btn-default")) {
        // add tag

        tags.push(tagName);

        action = 'add';
        $(tag).removeClass("btn-default");
        $(tag).addClass("btn-success");
    } else {
        // remove tag

        var ind = tags.indexOf(tagName);
        if (ind > -1) {
            tags.splice(ind, 1);
        }

        action = 'remove';
        $(tag).addClass("btn-default");
        $(tag).removeClass("btn-success");
    }

    Cookies.set('tags', tags);

    // TODO refresh videos
}

function addMoarWebms() {
    //
}

function changeMainPage() {
    //
}

$(function () {
    var tags = Cookies.getJSON('tags') || [];

    for (var i in tags) {
        if (tags.hasOwnProperty(i)) {
            var el = document.getElementById(tags[i]);
            el.classList.add("btn-success");
            el.classList.remove("btn-default");
        }
    }
});