function addZero(n) {
    return n < 10 ? '0' + n : '' + n;
}

module.exports = function (d) {
    return addZero(d.getMonth() + 1) + "." + addZero(d.getDate()) + "." + d.getFullYear() + " " +
        addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getMinutes());
};