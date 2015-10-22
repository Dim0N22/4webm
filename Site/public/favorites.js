/*global utils */

var favorites = {
    init: function () {
        var store;
        try {
            store = JSON.parse(localStorage.getItem("store")); //json
        } catch (ex) {
            console.log(ex);
        }

        if (!store || !store.favorites) {
            document.getElementById('message').classList.remove('hidden');
            return;
        }
        this.loadVideos(store.favorites);
    },

    loadVideos: function (favorites) {
        $.ajax({
            type: "POST",
            url: '/api/favorites',
            traditional: true,
            data: {favorites: favorites},
            success: function (data) {
                var webmsGrid = document.getElementById('webmsGrid');
                webmsGrid.innerHTML = '';

                if (data.webms.length > 0) {
                    webmsGrid.appendChild(utils.generateWebmsGridHtml(data.webms, data.viewPath));
                } else {
                    document.getElementById('message').classList.remove('hidden');
                }
            }
        });
    }
};