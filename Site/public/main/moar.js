/*global utils, mainTags */

var moar = {
    lastSeqid: null,
    loading: false,
    loadedSeqIdSet: new Set(),
    prevSeqid: this.lastSeqid, // prevSeqid use in onscroll event and lastSeqid at this time can be changed (if new page loaded but page/number not yet changed)
    apiMoarUrl: null,
    pagePrefixInUrl: '',

    init: function (lastSeqid, apiMoarUrl, pagePrefixInUrl) {
        this.lastSeqid = lastSeqid;
        this.apiMoarUrl = apiMoarUrl;

        if (pagePrefixInUrl) {
            this.pagePrefixInUrl = pagePrefixInUrl;
        }

        document.body.scrollTop = 0;
        this.bindUIActions();
    },

    bindUIActions: function () {
        window.onscroll = this.onScroll.bind(this);
    },

    updatePageIndexInUrl: function () {
        var page = (Number(window.location.pathname.slice(6)) || 1) + 1;
        window.history.pushState(null, null, this.pagePrefixInUrl + '/page/' + page + mainTags.getRawParamTags());
    },

    moarWebms: function () {
        var self = this;
        if (self.loading) {
            return;
        }

        self.loading = true;

        $.get(this.apiMoarUrl, {lastSeqid: self.lastSeqid, tags: mainTags.getParamTags()}).done(function (data) {
            if (data) {
                document.getElementById('webmsGrid').appendChild(utils.generateWebmsGridHtml(data.webms, data.viewPath, data.tagsQuery));
                self.lastSeqid = data.lastSeqid;
                self.updatePageIndexInUrl();
            }
        }).always(function () {
            self.loading = false;
        });
    },

    onScroll: function () {
        // automate moar button
        var totalHeight = document.body.scrollHeight - document.documentElement.clientHeight;
        var currentHeight = window.pageYOffset;
        if ((totalHeight - currentHeight) < 300) {
            this.moarWebms();
        }

        // TODO find solution for correct changing page index
        //// set page number to window.history
        //// change page number when video with lastSeqid becomes visible
        //if (this.loadedSeqIdSet.has(String(this.lastSeqid))) { // page change once for one seqid
        //    return;
        //}
        //
        //var el = document.getElementById('div' + this.prevSeqid);
        //
        //var docViewTop = window.pageYOffset; // current scroll top
        //var docViewBottom = docViewTop + document.documentElement.clientHeight /* visible height*/;
        //
        //if (!el.offsetTop) {
        //    return;
        //}
        //var elemTop = el.offsetTop;
        //var elemBottom = elemTop + el.offsetHeight;
        //if ((elemTop <= docViewBottom) /*&& (elemTop >= docViewTop)*/) {
        //    this.updatePageIndexInUrl();
        //    this.loadedSeqIdSet.add(String(this.lastSeqid));
        //    this.prevSeqid = this.lastSeqid;
        //}
    }
};