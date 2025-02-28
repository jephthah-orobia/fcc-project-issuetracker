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
    assigned_to: {
        type: String,
        default: ""
    },
    status_text: {
        type: String,
        default: ""
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'issues',
    toJSON: {
        versionKey: false
    },
    toObject: {
        versionKey: false
    }
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