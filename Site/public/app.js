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
Mousetrap.bind('space', startStopVideo)

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