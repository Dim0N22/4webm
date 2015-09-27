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
            html += '<div class="thumbnail inner-thumbnail" style="background-image: url(' + webms[i + j].previewSrc  + ')"></div>';
            html += '</a>';
            html += '</div>';
        }
        html += '</div>';
    }

    return html;
}

function getWebmsFromServer(params, done) {
    $.get('/api/webm', params).done(done);
}

function moarWebms() {
    getWebmsFromServer({lastSeqid: lastSeqid}, function (data) {
        if (!data) {
            return;
        }

        document.getElementById('webmsGrid').innerHTML += generateHtml(data.webms);
        lastSeqid = data.lastSeqid;
    });
}

function refreshVideos() {
    getWebmsFromServer(null, function (data) {
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