require('dotenv').config();
const { Schema, model } = require('mongoose');

const projectsSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    issues: [{
        type: Schema.Types.ObjectId,
        ref: "Issue"
    }]
}, {
    collection: 'projects',
    toJSON: {
        versionKey: false
    },
    toObject: {
        versionKey: false
    }
});

module.exports = model('Project', projectsSchema);