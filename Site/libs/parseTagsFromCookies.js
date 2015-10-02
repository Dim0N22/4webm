/**
 * middleware set req.tags by req.cookies.tags
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports = function (req, res, next) {
    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                req.tags = tags;
            }
        } catch (e) {
            res.clearCookie('tags');
        }
    }

    return next();
};