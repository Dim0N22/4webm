var utils = {
    generateWebmsGridHtml: function (webms, viewPath) {
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

                html += '<a href="' + viewPath + webms[i + j].seqid + '" class="thumbnail" title="' + webms[i + j].createDate + '">';
                html += '<div class="thumbnail inner-thumbnail" style="background-image: url(' + webms[i + j].previewSrc + ')"></div>';
                html += '</a>';
                html += '</div>';
            }
            div.innerHTML = html;
            docfrag.appendChild(div);
        }

        return docfrag;
    }
};