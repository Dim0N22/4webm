var doubleView = {
    init: function () {
        this.bindUIActions();
    },

    bindUIActions: function () {
        //hotkeys
        Mousetrap.bind('right', this.next);
        Mousetrap.bind('left', this.prev);
    },

    double: function (isDouble, id, el) {
        $.ajax({
            url: '/api/doubles/' + id,
            type: 'PUT',
            data: {
                value: isDouble
            }
        }).done(function () {
            if (!isDouble) {
                el.parentElement.children[0].classList.remove('active');
                el.parentElement.children[1].classList.add('active');
            }
            else {
                el.parentElement.children[0].classList.add('active');
                el.parentElement.children[1].classList.remove('active');
            }
        });
    },

    next: function () {
        document.getElementById('next').click();
    },

    prev: function () {
        document.getElementById('prev').click();
    }

};