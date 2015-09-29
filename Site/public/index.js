function clickTag(tag) {
    var tagName = tag.id;
    var tags = Cookies.getJSON('tags') || [];

    if (tag.classList.contains("btn-default")) {
        // add tag

        tags.push(tagName);

        tag.classList.remove("btn-default");
        tag.classList.add("btn-success");
    } else {
        // remove tag

        var ind = tags.indexOf(tagName);
        if (ind > -1) {
            tags.splice(ind, 1);
        }

        tag.classList.add("btn-default");
        tag.classList.remove("btn-success");
    }

    Cookies.set('tags', tags);

    refreshVideos();
}

function generateHtml(webms, authorized) {
    if (!webms) {
        return '';
    }

    var html = '';
    for (var i = 0; i < webms.length; i = i + 4) {
        html += '<div class="row">';
        for (var j = 0; j < 4 && i + j < webms.length; j++) {
            html += '<div class="col-xs-12 col-sm-6 col-md-3">';
            html += '#' + webms[i + j].seqid;
            if (authorized) {
                html += '<a href="/edit/' + webms[i + j].seqid + '" type="button" class="btn btn-link btn-xs" title="Редактировать"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>';
            }
            html += '<a href="/' + webms[i + j].seqid + '" class="thumbnail">';
            html += '<div class="thumbnail inner-thumbnail" style="background-image: url(' + webms[i + j].previewSrc + ')"></div>';
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

window.onscroll = function () {
    var totalHeight = $(document).height() - $(window).height();
    var currentHeight = $(window).scrollTop();
    if ((totalHeight - currentHeight) < 300) {
        moarWebms(); // TODO throttling
    }
};

function moarWebms() {
    getWebmsFromServer({lastSeqid: lastSeqid}, function (data) {
        document.getElementById('webmsGrid').innerHTML += generateHtml(data.webms, data.authorized);
        lastSeqid = data.lastSeqid;
    });
}

function refreshVideos() {
    getWebmsFromServer(null, function (data) {
        document.getElementById('webmsGrid').innerHTML = generateHtml(data.webms, data.authorized);
        lastSeqid = data.lastSeqid;
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var tags = Cookies.getJSON('tags') || [];

    for (var i in tags) {
        if (tags.hasOwnProperty(i)) {
            var el = document.getElementById(tags[i]);
            el.classList.add("btn-success");
            el.classList.remove("btn-default");
        }
    }
});