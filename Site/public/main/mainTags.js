/*global generateWebmsGridHtml */

var mainTags = {
    lastSeqid: null,
    prevSeqid: this.lastSeqid, // prevSeqid use in onscroll event and lastSeqid at this time can be changed (if new page loaded but page/number not yet changed)
    selectedTags: null,
    loading: false,


    init: function (lastSeqid) {
        this.lastSeqid = lastSeqid;

        this.selectedTags = Cookies.getJSON('tags') || [];

        for (var i = 0; i < this.selectedTags.length; i++) {
            var el = document.getElementById(this.selectedTags[i]);
            el.classList.add("btn-success");
            el.classList.remove("btn-default");
        }
    },


    clickTag: function (tag) {
        var tagName = tag.id;

        if (tag.classList.contains("btn-default")) {
            // add tag

            this.selectedTags.push(tagName);
        } else {
            // remove tag

            var ind = this.selectedTags.indexOf(tagName);
            if (ind > -1) {
                this.selectedTags.splice(ind, 1);
            }
        }

        Cookies.set('tags', this.selectedTags);
        this.refreshVideos();
    },

    generateTagsHtml: function (tags) {
        if (!tags) {
            return '';
        }

        var html = '<div class="index-tags hidden-print" data-spy="affix" role="complementary" data-offset-top="0">';
        for (var i = 0; i < tags.length; i++) {
            html += '<a id="' + tags[i]._id + '" class="btn ';

            if (this.selectedTags.indexOf(tags[i]._id) !== -1) {
                html += ' btn-success ';
            } else {
                html += ' btn-default ';
            }

            html += ' btn-xs tag-radius" type="button" onclick="clickTag(this);" title="' + tags[i]._id.toString() + '">';

            html += '<span class="tag-name pull-left">' + tags[i]._id.toString() + '</span>';
            html += '<span class="badge pull-right" style="margin: 2px">' + tags[i].count + '</span>';

            html += '</a><div class="visible-md-block visible-lg-block"></div>';
        }
        html += '</div>';
        return html;
    },

    refreshVideos: function () {
        var self = this;

        if (self.loading) {
            return;
        }

        self.loading = true;

        $.get('/api/webm').done(function (data) {
            document.getElementById('tags').innerHTML = self.generateTagsHtml(data.tags);
            var webmsGrid = document.getElementById('webmsGrid');
            webmsGrid.innerHTML = '';
            webmsGrid.appendChild(generateWebmsGridHtml(data.webms, data.viewPath));
            self.lastSeqid = data.lastSeqid;

            // paging
            self.prevSeqid = self.lastSeqid;
            window.history.pushState(null, null, '/');
        }).always(function () {
            self.loading = false;
        });
    }
};