var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Page = require('../service');

dust.loadSource(dust.compile(require('./template'), 'model-pages-review'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Page.findOne({id: options.id}, function (err, page) {
        if (err) {
            return done(err);
        }
        page = serand.pack(page, container);
        dust.render('model-pages-review', page, function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            $('.model-page-ok', sandbox).on('click', function () {
                var thiz = $(this);
                utils.loading();
                utils.publish('pages', page, function (err) {
                    utils.loaded();
                    if (err) {
                        return console.error(err);
                    }
                    thiz.removeClass('text-primary').addClass('text-success')
                        .siblings('.model-page-bad').addClass('hidden');

                    setTimeout(function () {
                        serand.redirect(options.location || '/pages');
                    }, 500);
                });
            });

            $('.model-page-bad', sandbox).on('click', function () {
                serand.redirect(options.location || '/pages');
            });
            done(null, function () {
                $('.model-pages-review', sandbox).remove();
            });
        });
    });
};
