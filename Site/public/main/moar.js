/*global generateWebmsGridHtml */

var moar = {
    lastSeqid: null,
    loading: false,
    loadedSeqIdSet: new Set(),
    prevSeqid: this.lastSeqid, // prevSeqid use in onscroll event and lastSeqid at this time can be changed (if new page loaded but page/number not yet changed)
    apiMoarUrl: null,

    init: function (lastSeqid, apiMoarUrl) {
        this.lastSeqid = lastSeqid;
        this.apiMoarUrl = apiMoarUrl;

        document.body.scrollTop = 0;
        this.bindUIActions();
    },

    bindUIActions: function () {
        window.onscroll = this.onScroll.bind(this);
    },

    moarWebms: function () {
        var self = this;
        if (self.loading) {
            return;
        }

        self.loading = true;

        $.get(this.apiMoarUrl, {lastSeqid: self.lastSeqid}).done(function (data) {
            if (data) {
                document.getElementById('webmsGrid').appendChild(generateWebmsGridHtml(data.webms, data.viewPath));
                self.lastSeqid = data.lastSeqid;
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
            this.moarWebms(); // TODO throttling
        }


        // set page number to window.history
        // change page number when video with lastSeqid becomes visible
        if (this.loadedSeqIdSet.has(String(this.lastSeqid))) { // page change once for one seqid
            return;
        }

        var el = document.getElementById('div' + this.prevSeqid);

        var docViewTop = window.pageYOffset; // current scroll top
        var docViewBottom = docViewTop + document.documentElement.clientHeight /* visible height*/;

        var elemTop = el.offsetTop;
        var elemBottom = elemTop + el.offsetHeight;
        if ((elemTop <= docViewBottom) /*&& (elemTop >= docViewTop)*/) {
            var page = (Number(window.location.pathname.slice(14)) || 1) + 1;
            window.history.pushState(null, null, '/doubles/page/' + page);
            this.loadedSeqIdSet.add(String(this.lastSeqid));
            this.prevSeqid = this.lastSeqid;
        }
    }
};