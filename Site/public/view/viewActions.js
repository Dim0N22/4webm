/*global viewHotkeysNextPrev */

var viewActions = {
    webmId: null,

    init: function (webmId) {
        this.webmId = webmId;

        this.bindUIActions();

        // ------------------------------------------------------------------------------
        // DOMContentLoaded

        document.getElementById('webm').volume = localStorage.volume || 1;

        if (window.history.length > 1 && document.referrer === window.location.origin + '/') {
            document.getElementById('webm').play();
        }

        var navigation = localStorage.getItem("navigation");

        if (navigation === 'autoNext' || navigation === 'autoPrev') {
            document.getElementById('webm').play();
        }

        if (navigation) {
            console.log(navigation, typeof navigation);
            document.getElementById(navigation).classList.add('enabled');
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
    },

    /**
     * Save property in localStorage and send to server
     * @param item
     * @param property
     * @param url
     * @param opposite
     * @returns {Boolean|undefined} - if undefined property is set return undefined
     */
    addToStore: function (item, property, url, opposite) {
        var self = this;

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

        if (opposite && store[opposite] && store[opposite].indexOf(self.webmId) !== -1) { // for like/dislike
            return;
        }

        var add;
        var indexItem = store[property].indexOf(self.webmId);
        if (indexItem === -1) {
            add = true;
        } else {
            add = false;
        }


        if (add) {
            store[property].push(self.webmId);
            item.classList.add('enabled');
        } else {
            store[property].splice(indexItem, 1);
            item.classList.remove('enabled');
        }

        localStorage.store = JSON.stringify(store);

        $.ajax({
            url: '/api/webm/' + self.webmId + '/' + url,
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
    },

    bindUIActions: function () {
        var self = this;
        var webmElement = document.getElementById('webm');

        // ------------------------------------------------------------------------------
        // likeGroup events

        document.getElementById('favorite').addEventListener('click', function (event) {
            self.addToStore(this, 'favorites', 'favoriteCount');
        });

        document.getElementById('like').addEventListener('click', function (event) {
            self.addToStore(this, 'likes', 'likeCount', 'dislikes');
        });

        document.getElementById('dislike').addEventListener('click', function (event) {
            self.addToStore(this, 'dislikes', 'dislikeCount', 'likes');
        });


        // ------------------------------------------------------------------------------
        // navigation events and manage volume

        document.getElementById('navigation').addEventListener('click', function (event) {
            var navigation = event.target.dataset.navigation || event.target.parentNode.dataset.navigation;
            if (!navigation) {
                return;
            }


            var el = document.getElementById(navigation);
            if (el.classList.contains('enabled')) {
                // click on enable button means disable function
                localStorage.removeItem('navigation');
                el.classList.remove('enabled');
                return;
            }

            // set function
            localStorage.navigation = navigation;

            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].dataset.navigation === navigation) {
                    this.children[i].classList.add('enabled');
                } else {
                    this.children[i].classList.remove('enabled');
                }
            }
        });


        // ------------------------------------------------------------------------------
        // manage volume
        webmElement.addEventListener('volumechange', function () {
            localStorage.volume = this.volume;
        });


        // ------------------------------------------------------------------------------
        // action after video end
        webmElement.addEventListener('ended', function () {
            var navigation = localStorage.getItem("navigation");

            switch (navigation) {
                case 'autoPrev':
                    viewHotkeysNextPrev.prev();
                    break;
                case 'autoNext':
                    viewHotkeysNextPrev.next();
                    break;
                case 'autoCycle':
                    this.currentTime = 0;
                    this.play();
                    break;
            }
        });


        // ------------------------------------------------------------------------------
        // play by click
        webmElement.addEventListener('click', function (e) {
            // check control section
            var clickY = (e.pageY - this.getBoundingClientRect().top);
            var height = parseFloat(this.clientHeight);

            // avoids interference with controls
            if (clickY > 0.82 * height) {
                return;
            }


            if (this.paused === false) {
                this.pause();
            } else {
                this.play();
            }

            return false;
        });

        var timeTracker = (function (webmElement) {
            var timePlayed = 0;
            var lastTime = 0;

            return {
                tick: function () {
                    var delta = Math.abs(webmElement.currentTime - lastTime);
                    if (delta < 1) {
                        timePlayed += delta;
                    }
                    lastTime = webmElement.currentTime;
                },
                getPlayingTime: function () {
                    return timePlayed;
                },
                getPlayingPercent: function () {
                    return timePlayed / webmElement.duration;
                }
            };
        })(webmElement);

        webmElement.addEventListener('timeupdate', function (e) {
            timeTracker.tick();
        });

        window.addEventListener('beforeunload', function (e) {
            if (timeTracker.getPlayingTime() > 0) {
                $.ajax({
                    url: '/api/webm/' + self.webmId + '/view',
                    type: 'PUT',
                    data: {
                        secondsViewed: timeTracker.getPlayingTime(),
                        percentViewed: timeTracker.getPlayingPercent()
                    }
                });
            }
        });
    }
};