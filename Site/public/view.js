function clickTag(tag) {
    var action;
    if (tag.classList.contains("btn-default")) {
        // add tag

        action = 'add';
        tag.classList.remove("btn-default");

        if (tag.dataset.tag === 'danger') {
            tag.classList.add("btn-danger");
        } else {
            tag.classList.add("btn-success");
        }
    } else {
        // remove tag

        action = 'remove';
        tag.classList.add("btn-default");

        if (tag.dataset.tag === 'danger') {
            tag.classList.remove("btn-danger");
        } else {
            tag.classList.remove("btn-success");
        }
    }

    $.ajax({
        url: '/api/webm/' + webmId + '/tags',
        type: 'PUT',
        data: {
            action: action,
            value: tag.dataset.tag
        }
    });
}


function addNewTag() {
    var inputNewTag = document.getElementById('newTag');
    var tag = inputNewTag.value.trim();
    if (tag === '') {
        inputNewTag.value = ''; // remove spaces
        return;
    }

    $.post('/api/tags/' + encodeURIComponent(tag));

    var tagHtml = '';
    tagHtml += ' <a type="button"';
    tagHtml += 'class="btn btn-xs tag-radius btn-success" style="margin-top: 5px"';
    tagHtml += 'data-tag="' + tag + '"';
    tagHtml += 'onclick="clickTag(this);">' + tag + '</a>';
    document.getElementById('tags').innerHTML += tagHtml;

    $.ajax({
        url: '/api/webm/' + webmId + '/tags',
        type: 'PUT',
        data: {
            action: 'add',
            value: tag
        }
    });

    inputNewTag.value = '';
}


document.getElementById('webm').addEventListener('volumechange', function () {
    localStorage.volume = this.volume;
});


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

    return add;
}

document.getElementById('favorite').addEventListener('click', function (event) {
    addToStore(this, 'favorites', 'favoriteCount');
});

document.getElementById('like').addEventListener('click', function (event) {
    var add = addToStore(this, 'likes', 'likeCount', 'dislikes');
    if (add === undefined) {
        return;
    }

    var el = document.getElementById('likeCount');
    el.innerHTML = Number(el.innerHTML) + (add ? 1 : -1);
});

document.getElementById('dislike').addEventListener('click', function (event) {
    var add = addToStore(this, 'dislikes', 'dislikeCount', 'likes');
    if (add === undefined) {
        return;
    }

    var el = document.getElementById('dislikeCount');
    el.innerHTML = Number(el.innerHTML) + (add ? 1 : -1);
});

// ------------------------------------------------------------------------------
// navigation events

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
            prev();
            break;
        case 'autoNext':
            next();
            break;
        case 'autoCycle':
            var video = document.getElementById('webm');
            video.currentTime = 0;
            video.play();
            break;
    }
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


// ------------------------------------------------------------------------------
// hotkeys
Mousetrap.bind('right', next);
Mousetrap.bind('left', prev);
Mousetrap.bind('space', startStopVideo);
Mousetrap.bind('up', upVolume);
Mousetrap.bind('down', downVolume);
Mousetrap.bind('ctrl+right', rewindForward);
Mousetrap.bind('ctrl+left', rewindBack);

function next() {
    document.getElementById('next').click();
}

function prev() {
    document.getElementById('prev').click();
}

function startStopVideo() {
    var video = document.getElementById('webm');
    video.paused ? video.play() : video.pause();
}

function upVolume() {
    var video = document.getElementById('webm');
    video.volume += 0.1;
}

function downVolume() {
    var video = document.getElementById('webm');
    video.volume -= 0.1;
}

function rewindForward() {
    var video = document.getElementById('webm');
    video.currentTime += 5;
}

function rewindBack() {
    var video = document.getElementById('webm');
    video.currentTime -= 5;
}


// ------------------------------------------------------------------------------
// swipe
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

var xDown = null;
var yDown = null;
var threshold = 150; //required min distance traveled to be considered swipe
var restraint = 100; // maximum distance allowed at the same time in perpendicular direction
var allowedTime = 400; // maximum time allowed to travel that distance
var startTime;
var elapsedTime;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
    startTime = new Date().getTime(); // record time when finger first makes contact with surface
}

function handleTouchEnd(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.changedTouches[0].clientX;
    var yUp = evt.changedTouches[0].clientY;

    elapsedTime = new Date().getTime() - startTime;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (elapsedTime <= allowedTime) {
        if (Math.abs(xDiff) >= threshold && Math.abs(yDiff) <= restraint) {
            if (xDiff > 0) {
                /* left swipe */
                document.getElementById('next').click();
            } else {
                /* right swipe */
                document.getElementById('prev').click();
            }
        }
    }

    xDown = null;
    yDown = null;
}