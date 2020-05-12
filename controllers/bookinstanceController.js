var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var async = require('async');
const validator = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
    BookInstance.find()
        .populate('book')
        .exec(function(err, list_bookinstances) {
            res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances});
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, bookinstance) {
            if (err) return next(err);
            if (bookinstance == null) {
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            res.render('bookinstance_detail', {title: 'Copy of' + bookinstance.book.title, bookinstance: bookinstance});
        });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
        .exec(function(err, books) {
            if (err) return next(err);
            res.render('bookinstance_form', {title: 'Create Book Instance', book_list: books});
        });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    validator.body('book', 'Book must be specified').trim().isLength({min: 1}),
    validator.body('imprint', 'Imprint must be specified').trim().isLength({min: 1}),
    validator.body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    validator.sanitizeBody('body').escape(),
    validator.sanitizeBody('imprint').escape(),
    validator.sanitizeBody('status').trim().escape(),
    validator.sanitizeBody('due_back').toDate(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).exec(callback)
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.bookinstance == null) {
            res.redirect('/catalog/bookinstances');
            return;
        }
        else {
            res.render('bookinstance_delete', {title: 'Delete Copy', copy: results.bookinstance});
        }
    });
}

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.body.copyid).exec(callback)
        }
    }, function(err, results) {
        if (err) return next(err);
        BookInstance.findByIdAndRemove(req.body.copyid, function(err) {
            if (err) return next(err);
            res.redirect('/catalog/bookinstances');
        })
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).exec(callback);
        },
        books: function(callback) {
            Book.find({}, 'title').exec(callback)
        }
    }, function(err, results) {
        if (err) next(err);
        res.render('bookinstance_form', {title: 'Update BookInstance', bookinstance: results.bookinstance, book_list: results.books});
    });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    validator.body('book', 'Book must be specified').trim().isLength({min: 1}),
    validator.body('imprint', 'Imprint must be specified').trim().isLength({min: 1}),
    validator.body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    validator.sanitizeBody('body').escape(),
    validator.sanitizeBody('imprint').escape(),
    validator.sanitizeBody('status').trim().escape(),
    validator.sanitizeBody('due_back').toDate(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err, theinstance) {
                if (err) return next(err);
                res.redirect(theinstance.url);
            })
        }
    }
]