var viewHotkeysNextPrev = {
    init: function () {
        this.bindUIActions();
    },

    bindUIActions: function () {
        Mousetrap.bind('right', this.next);
        Mousetrap.bind('left', this.prev);
    },

    next: function () {
        document.getElementById('next').click();
    },

    prev: function () {
        document.getElementById('prev').click();
    }
};