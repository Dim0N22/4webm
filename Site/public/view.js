/*global viewHotkeysNextPrev */




// ------------------------------------------------------------------------------
// likeGroup events

/**
 * Save property in localStorage and send to server
 * @param item
 * @param property
 * @param url
 * @param opposite
 * @returns {Boolean|undefined} - if undefined property is set return undefined
 */
function addToStore(item, property, url, opposite) {
    var store;
    try {
        store = JSON.parse(localStorage.getItem("store")); //json
    } catch (ex) {
    }

    if (!store) {
        store = {};
    }
    if (!store[property]) {
        store[property] = [];
    }

    if (opposite && store[opposite] && store[opposite].indexOf(webmId) !== -1) { // for like/dislike
        return;
    }

    var add;
    var indexItem = store[property].indexOf(webmId);
    if (indexItem === -1) {
        add = true;
    } else {
        add = false;
    }


    if (add) {
        store[property].push(webmId);
        item.classList.add('enabled');
    } else {
        store[property].splice(indexItem, 1);
        item.classList.remove('enabled');
    }

    localStorage.store = JSON.stringify(store);

    $.ajax({
        url: '/api/webm/' + webmId + '/' + url,
        type: 'PUT',
        data: {
            increment: add
        }
    });

    if (add === undefined) {
        return;
    }

    var el = document.getElementById(url);
    el.innerHTML = Number(el.innerHTML) + (add ? 1 : -1);
}

document.getElementById('favorite').addEventListener('click', function (event) {
    addToStore(this, 'favorites', 'favoriteCount');
});

document.getElementById('like').addEventListener('click', function (event) {
    addToStore(this, 'likes', 'likeCount', 'dislikes');
});

document.getElementById('dislike').addEventListener('click', function (event) {
    addToStore(this, 'dislikes', 'dislikeCount', 'likes');
});

// ------------------------------------------------------------------------------
// navigation events and manage volume

document.getElementById('navigation').addEventListener('click', function (event) {
    var navigation = event.target.dataset.navigation || event.target.parentNode.dataset.navigation;
    if (!navigation) {
        return;
    }

    localStorage.navigation = navigation;

    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].dataset.navigation === navigation) {
            this.children[i].classList.add('enabled');
        } else {
            this.children[i].classList.remove('enabled');
        }
    }
});


document.getElementById('webm').addEventListener('ended', function () {
    var navigation = localStorage.getItem("navigation");

    switch (navigation) {
        case 'autoPrev':
            viewHotkeysNextPrev.prev();
            break;
        case 'autoNext':
            viewHotkeysNextPrev.next();
            break;
        case 'autoCycle':
            var video = document.getElementById('webm');
            video.currentTime = 0;
            video.play();
            break;
    }
});

document.getElementById('webm').addEventListener('volumechange', function () {
    localStorage.volume = this.volume;
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('webm').volume = localStorage.volume || 1;

    if (window.history.length > 1 && document.referrer === window.location.origin + '/') {
        document.getElementById('webm').play();
    }

    var navigation = localStorage.getItem("navigation");

    if (navigation === 'autoNext' || navigation === 'autoPrev') {
        document.getElementById('webm').play();
    }

    if (navigation) {
        document.getElementById(navigation).classList.add('enabled');
    } else {
        document.getElementById('likeABoss').classList.add('enabled');
    }


    // set favorite from localStorage
    var store = {};
    try {
        store = JSON.parse(localStorage.getItem("store")); //json
    } catch (ex) {
        return;
    }

    if (store && store.favorites && store.favorites.indexOf(webmId) !== -1) {
        document.getElementById("favorite").classList.add('enabled');
    }

    if (store && store.likes && store.likes.indexOf(webmId) !== -1) {
        document.getElementById("like").classList.add('enabled');
    }

    if (store && store.dislikes && store.dislikes.indexOf(webmId) !== -1) {
        document.getElementById("dislike").classList.add('enabled');
    }
});