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

Mousetrap.bind('right', next);
Mousetrap.bind('left', prev);
Mousetrap.bind('space', startStopVideo);
Mousetrap.bind('up', upVolume);
Mousetrap.bind('down', downVolume);
Mousetrap.bind('ctrl+right', rewindForward);
Mousetrap.bind('ctrl+left', rewindBack);

document.getElementById('autoNext').addEventListener('click', function () {
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));

    this.classList.toggle('enabled');
    var autoCycle = document.getElementById('autoCycle');
    if (autoCycle.classList.contains('enabled')) {
        autoCycle.classList.remove('enabled');
    }

    var likeABoss = document.getElementById('likeABoss');
    if (!autoNextEnabled && likeABoss.classList.contains('enabled-boss')) {
        likeABoss.classList.remove('enabled-boss');
    } else {
        likeABoss.classList.add('enabled-boss');
    }

    localStorage.autoNext = !autoNextEnabled;
    localStorage.autoCycle = false;
});

document.getElementById('autoCycle').addEventListener('click', function () {
    var autoCycleEnabled = JSON.parse(localStorage.getItem("autoCycle"));

    this.classList.toggle('enabled');

    var autoNext = document.getElementById('autoNext');
    if (autoNext.classList.contains('enabled')) {
        autoNext.classList.remove('enabled');
    }

    var likeABoss = document.getElementById('likeABoss');
    if (!autoCycleEnabled && likeABoss.classList.contains('enabled-boss')) {
        likeABoss.classList.remove('enabled-boss');
    } else {
        likeABoss.classList.add('enabled-boss');
    }

    localStorage.autoCycle = !autoCycleEnabled;
    localStorage.autoNext = false;
});

document.getElementById('likeABoss').addEventListener('click', function () {
    this.classList.toggle('enabled-boss');
    document.getElementById('autoNext').classList.remove('enabled');
    document.getElementById('autoCycle').classList.remove('enabled');
    localStorage.autoNext = false;
    localStorage.autoCycle = false;
});

document.getElementById('webm').addEventListener('ended', function () {
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));
    var autoCycleEnabled = JSON.parse(localStorage.getItem("autoCycle"));

    if (autoNextEnabled) {
        next();
    } else if (autoCycleEnabled) {
        var video = document.getElementById('webm');
        video.currentTime = 0;
        video.play();
    }
});

document.getElementById('webm').addEventListener('volumechange', function () {
    localStorage.volume = this.volume;
});

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

document.addEventListener("DOMContentLoaded", function () {
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));
    var autoCycleEnabled = JSON.parse(localStorage.getItem("autoCycle"));
    document.getElementById('webm').volume = localStorage.volume || 1;

    if (autoNextEnabled) {
        document.getElementById('autoNext').classList.add('enabled');
        document.getElementById('webm').play();
    } else if (autoCycleEnabled) {
        document.getElementById('autoCycle').classList.add('enabled');
    } else {
        document.getElementById('likeABoss').classList.add('enabled-boss');
    }
});


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