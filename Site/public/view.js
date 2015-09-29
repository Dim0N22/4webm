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
        url: '/api/webm/' + webmId,
        type: 'PUT',
        data: {
            property: 'tags',
            action: action,
            value: tag.dataset.tag
        }
    });
}


document.getElementById('webm').addEventListener('volumechange', function () {
    localStorage.volume = this.volume;
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

    var navigation = localStorage.getItem("navigation");

    if (navigation === 'autoNext' || navigation === 'autoPrev') {
        document.getElementById('webm').play();
    }

    if (navigation) {
        document.getElementById(navigation).classList.add('enabled');
    } else {
        document.getElementById('likeABoss').classList.add('enabled');
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
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
        if (xDiff > 0) {
            /* left swipe */
            document.getElementById('next').click();
        } else {
            /* right swipe */
            document.getElementById('prev').click();
        }
    } else {
        if (yDiff > 0) {
            /* up swipe */
        } else {
            /* down swipe */
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
}