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

    refreshVideos();
}

function generateHtml(webms) {
    var html = '';
    for (var i = 0; i < webms.length; i = i + 4) {
        html += '<div class="row">';
        for (var j = 0; j < 4 && i + j < webms.length; j++) {
            html += '<div class="col-xs-12 col-sm-6 col-md-3">';
            html += '#' + webms[i + j].seqid;
            html += '<a href="/' + webms[i + j].seqid + '" class="thumbnail">';
            html += '<img alt="#' + webms[i + j].seqid + '" src="' + webms[i + j].previewSrc + '" data-holder-rendered="true" style="width: 300px; height: 100%; display: block;">';
            html += '</a>';
            html += '</div>';
        }
        html += '</div>';
    }

    return html;
}

function getWebmsFromServer(done) {
    $.get('/api/webm', {lastSeqid: lastSeqid}).done(done);
}

function moarWebms() {
    getWebmsFromServer(function (data) {
        if (!data) {
            return;
        }

        document.getElementById('webmsGrid').innerHTML += generateHtml(data.webms);
        lastSeqid = data.lastSeqid;
    });
}

function refreshVideos() {
    getWebmsFromServer(function (data) {
        if (!data) {
            return;
        }

        document.getElementById('webmsGrid').innerHTML = generateHtml(data.webms);
        lastSeqid = data.lastSeqid;
    });
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