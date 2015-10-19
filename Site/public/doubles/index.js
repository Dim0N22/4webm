var loading = false;
var loadedSeqIdSet = new Set();
var prevSeqid = lastSeqid; // prevSeqid use in onscroll event and lastSeqid at this time can be changed (if new page loaded but page/number not yet changed)
var selectedTags;

function generateWebmsGridHtml(webms, viewPath) {
    if (!webms) {
        return '';
    }
    var docfrag = document.createDocumentFragment();
    for (var i = 0; i < webms.length; i = i + 4) {
        var div = document.createElement("div");
        div.className = "row";
        var html = '';
        for (var j = 0; j < 4 && i + j < webms.length; j++) {
            html += '<div class="col-xs-12 col-sm-6 col-md-3" id="div' + webms[i + j].seqid + '">';
            html += '<em>#' + webms[i + j].seqid + '</em>';

            html += '<a href="' + viewPath + webms[i + j].seqid + '" class="thumbnail">';
            html += '<div class="thumbnail inner-thumbnail" style="background-image: url(' + webms[i + j].previewSrc + ')"></div>';
            html += '</a>';
            html += '</div>';
        }
        div.innerHTML = html;
        docfrag.appendChild(div);
    }

    return docfrag;
}

function moarWebms() {
    if (loading) {
        return;
    }

    loading = true;

    $.get('/api/doubles/moar', {lastSeqid: lastSeqid}).done(function (data) {
        if (data) {
            document.getElementById('webmsGrid').appendChild(generateWebmsGridHtml(data.webms, data.viewPath));
            lastSeqid = data.lastSeqid;
        }
    }).always(function () {
        loading = false;
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
    if (loadedSeqIdSet.has(String(lastSeqid))) { // page change once for one seqid
        return;
    }

    var el = document.getElementById('div' + prevSeqid);

    var docViewTop = window.pageYOffset; // current scroll top
    var docViewBottom = docViewTop + document.documentElement.clientHeight /* visible height*/;

    var elemTop = el.offsetTop;
    var elemBottom = elemTop + el.offsetHeight;
    if ((elemTop <= docViewBottom) /*&& (elemTop >= docViewTop)*/) {
        var page = (Number(window.location.pathname.slice(14)) || 1) + 1;
        window.history.pushState(null, null, '/doubles/page/' + page);
        loadedSeqIdSet.add(String(lastSeqid));
        prevSeqid = lastSeqid;
    }
};


document.addEventListener("DOMContentLoaded", function () {
    document.body.scrollTop = 0;
});