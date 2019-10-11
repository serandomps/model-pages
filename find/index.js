var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Page = require('../service');

dust.loadSource(dust.compile(require('./template.html'), 'pages-find'));

module.exports = function (ctx, container, options, done) {
    Page.find({}, function (err, data) {
        if (err) {
            return done(err);
        }
        var sandbox = container.sandbox;
        dust.render('pages-find', serand.pack({
            title: options.title,
            size: 6,
            pages: data
        }, container), function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            done(null, function () {
                $('.pages-find', sandbox).remove();
            });
        });
    });
};
