function clickTag(tag) {
    var action;
    if ($(tag).hasClass("btn-default")) {
        // add tag

        action = 'add';
        $(tag).removeClass("btn-default");
        $(tag).addClass("btn-success");
    } else {
        // remove tag

        action = 'remove';
        $(tag).addClass("btn-default");
        $(tag).removeClass("btn-success");
    }

    $.ajax({
        url: '/api/webm/' + webmId,
        type: 'PUT',
        data: {
            property: 'tags',
            action: action,
            value: tag.innerHTML
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

$('#autoNext').click(function () {
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));

    $(this).toggleClass('enabled');
    var autoCycle = $('#autoCycle');
    if (autoCycle.hasClass('enabled')) {
        autoCycle.removeClass('enabled');
    }

    var likeABoss = $('#likeABoss');
    if (!autoNextEnabled && likeABoss.hasClass('enabled-boss')) {
        likeABoss.removeClass('enabled-boss');
    } else {
        likeABoss.addClass('enabled-boss');
    }

    localStorage.autoNext = !autoNextEnabled;
    localStorage.autoCycle = false;
});

$('#autoCycle').click(function () {
    var autoCycleEnabled = JSON.parse(localStorage.getItem("autoCycle"));

    $(this).toggleClass('enabled');
    var autoNext = $('#autoNext');
    if (autoNext.hasClass('enabled')) {
        autoNext.removeClass('enabled');
    }

    var likeABoss = $('#likeABoss');
    if (!autoCycleEnabled && likeABoss.hasClass('enabled-boss')) {
        likeABoss.removeClass('enabled-boss');
    } else {
        likeABoss.addClass('enabled-boss');
    }

    localStorage.autoCycle = !autoCycleEnabled;
    localStorage.autoNext = false;
});

$('#likeABoss').click(function () {
    $(this).toggleClass('enabled-boss');
    $('#autoNext').removeClass('enabled');
    $('#autoCycle').removeClass('enabled');
    localStorage.autoNext = false;
    localStorage.autoCycle = false;
});

$('video').on('ended', function () {
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));
    var autoCycleEnabled = JSON.parse(localStorage.getItem("autoCycle"));

    if (autoNextEnabled) {
        next();
    } else if (autoCycleEnabled) {
        var video = $('video').get(0);
        video.currentTime = 0;
        video.play();
    }
});

$('video').on('volumechange', function () {
    localStorage.volume = this.volume;
});

function next() {
    $('a#next').get(0).click();
}

function prev() {
    $('a#prev').get(0).click();
}

function startStopVideo() {
    var video = $('video').get(0);
    video.paused ? video.play() : video.pause();
}

function upVolume() {
    var video = $('video').get(0);
    video.volume += 0.1;
}

function downVolume() {
    var video = $('video').get(0);
    video.volume -= 0.1;
}

function rewindForward() {
    var video = $('video').get(0);
    video.currentTime += 5;
}

function rewindBack() {
    var video = $('video').get(0);
    video.currentTime -= 5;
}

$(function () {
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));
    var autoCycleEnabled = JSON.parse(localStorage.getItem("autoCycle"));
    $('video').prop("volume", localStorage.volume || 1);

    if (autoNextEnabled) {
        $('#autoNext').addClass('enabled');
        $('video').get(0).play();
    } else if (autoCycleEnabled) {
        $('#autoCycle').addClass('enabled');
    } else {
        $('#likeABoss').addClass('enabled-boss');
    }
});