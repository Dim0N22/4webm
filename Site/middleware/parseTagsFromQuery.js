/**
 * middleware set req.tags by req.cookies.tags
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports = function (req, res, next) {
    if (req.cookies.tags) { // TODO remove in next release
        res.clearCookie('tags');
    }

    req.tagsQuery = '';
    if (req.query.tags) {
        var tags = req.query.tags.split(';');

        if (tags && tags.length > 0) {
            req.tags = tags;
            req.tagsQuery = req.query.tags ? '?tags=' + encodeURIComponent(req.query.tags) : '';
        }
    }

    return next();
};