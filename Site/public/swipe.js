var swipe = {
    xDown: null,
    yDown: null,
    threshold: 150, //required min distance traveled to be considered swipe
    restraint: 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime: 400, // maximum time allowed to travel that distance
    startTime: null,
    elapsedTime: null,

    init: function () {
        this.bindUIActions();
    },

    bindUIActions: function () {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
    },

    handleTouchStart: function (evt) {
        this.xDown = evt.touches[0].clientX;
        this.yDown = evt.touches[0].clientY;
        this.startTime = new Date().getTime(); // record time when finger first makes contact with surface
    },

    handleTouchEnd: function (evt) {
        if (!this.xDown || !this.yDown) {
            return;
        }

        var xUp = evt.changedTouches[0].clientX;
        var yUp = evt.changedTouches[0].clientY;

        this.elapsedTime = new Date().getTime() - this.startTime;

        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;
        if (this.elapsedTime <= this.allowedTime) {
            if (Math.abs(xDiff) >= this.threshold && Math.abs(yDiff) <= this.restraint) {
                if (xDiff > 0) {
                    /* left swipe */
                    document.getElementById('next').click();
                } else {
                    /* right swipe */
                    document.getElementById('prev').click();
                }
            }
        }

        this.xDown = null;
        this.yDown = null;
    }
};