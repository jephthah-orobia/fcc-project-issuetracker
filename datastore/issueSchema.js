const { Schema, model } = require('mongoose');

const issueSchema = new Schema({
    issue_title: {
        type: String,
        required: true
    },
    issue_text: {
        type: String,
        required: true
    },
    created_by: {
        type: String,
        required: true
    },
    open: {
        type: Boolean,
        default: true
    },
    assigned_to: String,
    status_text: String,
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'issues'
});

issueSchema.pre('save', function (next) {
    this.updated_on = new Date();
    next();
});

issueSchema.pre('update', function (next) {
    this.updated_on = new Date();
    next();
});

module.exports = model('Issue', issueSchema);