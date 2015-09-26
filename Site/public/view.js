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
Mousetrap.bind('ctrl+up', upVolume);
Mousetrap.bind('ctrl+down', downVolume);
Mousetrap.bind('ctrl+right', rewindForward);
Mousetrap.bind('ctrl+left', rewindBack);

$('#autoNext').click(function(){
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));

    $(this).toggleClass('enabled');
    localStorage.autoNext = !autoNextEnabled;
});

$('video').on('ended',function(){
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));

    if (autoNextEnabled) {
        next();
    }
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

$(function(){
    var autoNextEnabled = JSON.parse(localStorage.getItem("autoNext"));
    if (autoNextEnabled){
        $('#autoNext').addClass('enabled');
    }
});