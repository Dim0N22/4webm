function double(isDouble, id, el) {
    $.ajax({
        url: '/api/doubles/' + id,
        type: 'PUT',
        data: {
            value: isDouble
        }
    }).done(function () {
        if (!isDouble) {
            el.parentElement.children[0].classList.remove('active');
            el.parentElement.children[1].classList.add('active');}
        else {
            el.parentElement.children[0].classList.add('active');
            el.parentElement.children[1].classList.remove('active');
        }
    });
}


// ------------------------------------------------------------------------------
// hotkeys
Mousetrap.bind('right', next);
Mousetrap.bind('left', prev);

function next() {
    document.getElementById('next').click();
}

function prev() {
    document.getElementById('prev').click();
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