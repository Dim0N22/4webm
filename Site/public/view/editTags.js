var editTags = {
    webmId: null,

    init: function (webmId) {
        this.webmId = webmId;
    },

    clickTag: function (tag) {
        var self = this;

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
            url: '/api/webm/' + self.webmId + '/tags',
            type: 'PUT',
            data: {
                action: action,
                value: tag.dataset.tag
            }
        });
    },


    addNewTag: function () {
        var self = this;

        var inputNewTag = document.getElementById('newTag');
        var tag = inputNewTag.value.trim();
        if (tag === '') {
            inputNewTag.value = ''; // remove spaces
            return;
        }

        $.post('/api/tags/' + encodeURIComponent(tag));

        var tagHtml = '';
        tagHtml += ' <a type="button"';
        tagHtml += 'class="btn btn-xs tag-radius btn-success" style="margin-top: 5px"';
        tagHtml += 'data-tag="' + tag + '"';
        tagHtml += 'onclick="editTags.clickTag(this);">' + tag + '</a>';
        document.getElementById('tags').innerHTML += tagHtml;

        $.ajax({
            url: '/api/webm/' + self.webmId + '/tags',
            type: 'PUT',
            data: {
                action: 'add',
                value: tag
            }
        });

        inputNewTag.value = '';
    }
};