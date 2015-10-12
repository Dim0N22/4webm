function double(isDouble, id, el) {
    $.ajax({
        url: '/api/doubles/' + id,
        type: 'PUT',
        data: {
            value: isDouble
        }
    }).done(function () {
        if (!isDouble) {
            el.parentElement.children[0].classList.remove('hidden');
            el.parentElement.children[1].classList.add('hidden');}
        else {
            el.parentElement.children[0].classList.add('hidden');
            el.parentElement.children[1].classList.remove('hidden');
        }
    });
}