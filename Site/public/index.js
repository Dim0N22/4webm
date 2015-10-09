var loading = false;
var loadedSeqIdSet = new Set();
var prevSeqid = lastSeqid; // prevSeqid use in onscroll event and lastSeqid at this time can be changed (if new page loaded but page/number not yet changed)

function clickTag(tag) {
    var tagName = tag.id;

    if (tag.classList.contains("btn-default")) {
        // add tag

        selectedTags.push(tagName);
    } else {
        // remove tag

        var ind = selectedTags.indexOf(tagName);
        if (ind > -1) {
            selectedTags.splice(ind, 1);
        }
    }

    Cookies.set('tags', selectedTags, {expires: 365});
    refreshVideos();
}

function generateWebmsGridHtml(webms, authorized) {
    if (!webms) {
        return '';
    }

    var html = '';
    for (var i = 0; i < webms.length; i = i + 4) {
        html += '<div class="row">';
        for (var j = 0; j < 4 && i + j < webms.length; j++) {
            html += '<div class="col-xs-12 col-sm-6 col-md-3" id="div' + webms[i + j].seqid + '">';
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

function generateTagsHtml(tags) {
    if (!tags) {
        return '';
    }

    var html = '';
    for (var i = 0; i < tags.length; i++) {
        html += '<a id="' + tags[i]._id + '" class="btn ';

        if (selectedTags.indexOf(tags[i]._id) !== -1) {
            html += ' btn-success ';
        } else {
            html += ' btn-default ';
        }

        html += ' btn-xs tag-radius" type="button" style="margin-top: 3px; margin-bottom: 3px;" onclick="clickTag(this);">';
        html += tags[i]._id.toString() + ' <span class="badge">' + tags[i].count + '</span></a> ';
    }
    return html;
}

function getWebmsFromServer(params, done) {
    if (loading) {
        return;
    }

    loading = true;
    $.get('/api/webm', params).done(done).always(function () {
        loading = false;
    });
}

function moarWebms() {
    getWebmsFromServer({lastSeqid: lastSeqid}, function (data) {
        if (data) {
            document.getElementById('webmsGrid').innerHTML += generateWebmsGridHtml(data.webms, data.authorized);
            lastSeqid = data.lastSeqid;
        }
    });
}

function refreshVideos() {
    getWebmsFromServer(null, function (data) {
        document.getElementById('tags').innerHTML = generateTagsHtml(data.tags);
        document.getElementById('webmsGrid').innerHTML = generateWebmsGridHtml(data.webms, data.authorized);
        lastSeqid = data.lastSeqid;
    });
}

window.onscroll = function () {
    // automate moar button
    var totalHeight = document.body.scrollHeight - document.documentElement.clientHeight;
    var currentHeight = window.pageYOffset;
    if ((totalHeight - currentHeight) < 300) {
        moarWebms(); // TODO throttling
    }


    // set page number to window.history
    // change page number when video with lastSeqid becomes visible
    if (loadedSeqIdSet.has(Number(prevSeqid))) { // page change once for one seqid
        return;
    }

    var el = document.getElementById('div' + prevSeqid);

    var docViewTop = window.pageYOffset; // current scroll top
    var docViewBottom = docViewTop + document.documentElement.clientHeight /* visible height*/;

    var elemTop = el.offsetTop; //$elem.offset().top;
    var elemBottom = elemTop + el.offsetHeight;
    if ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)) {

        var page = (Number(window.location.pathname.slice(6)) || 1) + 1;
        window.history.pushState(null, null, '/page/' + page);
        loadedSeqIdSet.add(Number(prevSeqid));
        prevSeqid = lastSeqid;
    }
};


var selectedTags;

document.addEventListener("DOMContentLoaded", function () {
    document.body.scrollTop = 0;

    if (!lastSeqid) {

    }

    selectedTags = Cookies.getJSON('tags') || [];

    for (var i = 0; i < selectedTags.length; i++) {
        var el = document.getElementById(selectedTags[i]);
        el.classList.add("btn-success");
        el.classList.remove("btn-default");
    }
});