var viewHotkeys = {
    init: function () {
        this.bindUIActions();
    },

    bindUIActions: function () {
        Mousetrap.bind('space', this.startStopVideo);
        Mousetrap.bind('up', this.upVolume);
        Mousetrap.bind('down', this.downVolume);
        Mousetrap.bind('ctrl+right', this.rewindForward);
        Mousetrap.bind('ctrl+left', this.rewindBack);
    },

    startStopVideo: function () {
        var video = document.getElementById('webm');
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
        return false;
    },

    upVolume: function () {
        var video = document.getElementById('webm');
        if (video.volume < 1) {
            video.volume += 0.1;
        }
        return false;
    },

    downVolume: function () {
        var video = document.getElementById('webm');
        if (video.volume >= 0.1) {
            video.volume -= 0.1;
        }
        return false;
    },

    rewindForward: function () {
        var video = document.getElementById('webm');
        video.currentTime += 5;
    },

    rewindBack: function () {
        var video = document.getElementById('webm');
        video.currentTime -= 5;
    }
};