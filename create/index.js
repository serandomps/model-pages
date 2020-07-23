var dust = require('dust')();
var form = require('form');
var utils = require('utils');
var serand = require('serand');
var Page = require('../service');

dust.loadSource(dust.compile(require('./template.html'), 'model-pages-create'));

var configs = {
    title: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please specify a title for your page.');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    body: {
        find: function (context, source, done) {
            done(null, $('textarea', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please specify the body of your page.');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.body', vform.elem);
            serand.blocks('textarea', 'create', el, {
                value: value
            }, done);
        }
    }
};

var create = function (pagesForm, page, done) {
    pagesForm.find(function (err, data) {
        if (err) {
            return done(err);
        }
        pagesForm.validate(data, function (err, errors, data) {
            if (err) {
                return done(err);
            }
            pagesForm.update(errors, data, function (err) {
                if (err) {
                    return done(err);
                }
                if (errors) {
                    return done(null, errors);
                }
                var o = {};
                if (page) {
                    o.id = page.id;
                }
                Object.keys(data).forEach(function (key) {
                    var value = data[key];
                    if (Array.isArray(value)) {
                        if (!value.length) {
                            return;
                        }
                        o[key] = data[key];
                        return;
                    }
                    if (value) {
                        o[key] = value;
                    }
                });
                utils.create('pages', Page.create, page, o, function () {
                    return true
                }, function (err, page) {
                    done(err, null, page);
                });
            });
        });
    });
};

var render = function (ctx, container, options, page, done) {
    var id = page && page.id;
    var sandbox = container.sandbox;
    var cont = _.cloneDeep(page || {});
    cont._ = {
        parent: container.parent
    };
    dust.render('model-pages-create', serand.pack(cont, container), function (err, out) {
        if (err) {
            return done(err);
        }
        var elem = sandbox.append(out);
        var pagesForm = form.create(container.id, elem, configs);
        ctx.form = pagesForm;
        pagesForm.render(ctx, page, function (err) {
            if (err) {
                return done(err);
            }
            if (container.parent) {
                done(null, {
                    create: function (created) {
                        create(pagesForm, page, function (err, data) {
                            if (err) {
                                return created(err);
                            }
                            created(null, null, data);
                        });
                    },
                    form: pagesForm,
                    clean: function () {
                        $('.model-pages-create', sandbox).remove();
                    }
                });
                return;
            }
            sandbox.on('click', '.create', function (e) {
                utils.loading();
                create(pagesForm, page, function (err, errors) {
                    utils.loaded();
                    if (err) {
                        return console.error(err);
                    }
                    if (errors) {
                        return;
                    }
                    serand.redirect(options.location || '/pages');
                });
            });
            sandbox.on('click', '.cancel', function (e) {
                serand.redirect(options.location || '/pages');
            });
            done(null, {
                form: pagesForm,
                clean: function () {
                    $('.model-pages-create', sandbox).remove();
                }
            });
        });
    });
};

module.exports = function (ctx, container, options, done) {
    options = options || {};
    var id = options.id;
    if (!id) {
        return render(ctx, container, options, null, done);
    }
    Page.findOne(options, function (err, page) {
        if (err) {
            return done(err);
        }
        render(ctx, container, options, page, done);
    });
};



