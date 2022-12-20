'use strict';
const Issue = require('../datastore/issueSchema');
const Project = require('../datastore/projectSchema');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;
      Project.findOne({ name: project })
        .populate('issues')
        .exec((err, proj) => {
          if (err)
            res.send(err);
          else if (!proj)
            res.json([]);
          else
            res.json(proj.issues);
        });
    })

    .post(function (req, res) {
      let project = req.params.project;
      new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || ''
      }).save((err, issue) => {
        if (err)
          res.send(err);
        else
          Project.findOne({ name: project }, (err1, proj) => {
            if (err1)
              res.send(err1);
            else if (!proj)
              new Project({
                name: project,
                issues: issue._id
              }).save((err2, newProj) => {
                if (err2)
                  res.send(err2)
                else
                  res.json(issue);
              });
            else {
              proj.issues.push(issue._id);
              proj.save((err3, doc) => {
                if (err3)
                  res.send(err3);
                else
                  res.json(issue);

              });
            }
          });
      });
    })

    .put(function (req, res) {
      let project = req.params.project;

    })

    .delete(function (req, res) {
      let project = req.params.project;

    });

};
