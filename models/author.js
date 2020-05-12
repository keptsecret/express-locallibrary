var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moment = require('moment');

var AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date},
    }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function() {
    // handles exceptions where author doesn't have either first or family name
    var fullname = '';
    if (this.first_name && this.family_name) {
        fullname = this.family_name + ', ' + this.first_name;
    }
    if (!this.first_name || !this.family_name) {
        fullname = '';
    }

    return fullname;
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function() {
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

AuthorSchema
.virtual('url')
.get(function() {
    return '/catalog/author/' + this._id;
})

AuthorSchema
.virtual('dob_formatted')
.get(function() {
    return this.date_of_birth ? moment(this.date_of_birth).format('MMMM Do, YYYY') : '';
});

AuthorSchema
.virtual('dod_formatted')
.get(function() {
    return this.date_of_death ? moment(this.date_of_death).format('MMMM Do, YYYY') : '';
});

AuthorSchema
.virtual('dob_altformat')
.get(function() {
    return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
});

AuthorSchema
.virtual('dod_altformat')
.get(function() {
    return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
});

// Export
module.exports = mongoose.model('Author', AuthorSchema);