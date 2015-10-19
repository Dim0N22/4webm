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

function loadVideos(favorites) {
    $.ajax({
        type: "POST",
        url: '/api/favorites',
        traditional: true,
        data: {favorites: favorites},
        success: function (data) {
            var webmsGrid = document.getElementById('webmsGrid');
            webmsGrid.innerHTML = '';

            if (data.webms.length > 0) {
                webmsGrid.appendChild(generateWebmsGridHtml(data.webms, data.viewPath));
            } else {
                document.getElementById('message').classList.remove('hidden');
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var store;
    try {
        store = JSON.parse(localStorage.getItem("store")); //json
    } catch (ex) {
    }

    if (!store || !store.favorites) {
        document.getElementById('message').classList.remove('hidden');
        return;
    }
    loadVideos(store.favorites);
});