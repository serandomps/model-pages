var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Page = require('../service');

dust.loadSource(dust.compile(require('./template'), 'pages-remove'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Page.findOne({id: options.id}, function (err, page) {
        if (err) return done(err);
        dust.render('pages-remove', serand.pack(page, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var el = sandbox.append(out);
            $('.remove', el).on('click', function () {
                Page.remove(page, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    serand.redirect('/pages');
                });
            });
            done(null, function () {
                $('.pages-remove', sandbox).remove();
            });
        });
    });
};
