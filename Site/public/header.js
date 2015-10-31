var header = {
    init: function () {
        this.bindUIActions();
    },

    bindUIActions: function () {
        document.getElementById('random').addEventListener('click', this.random);
    },
    
    random: function () {
        location.href = '/random' + location.search;
    }
};