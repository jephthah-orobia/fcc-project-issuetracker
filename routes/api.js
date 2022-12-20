'use strict';
const { Error } = require('mongoose');
const Issue = require('../datastore/issueSchema');
const Project = require('../datastore/projectSchema');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;
      Project.findOne({ name: project })
        .populate({ path: 'issues', match: req.query })
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
        if (err && err instanceof Error.ValidationError)
          res.json({ error: 'required field(s) missing' });
        else if (err)
          res.json({ error: '' + err });
        else
          Project.findOne({ name: project }, (err1, proj) => {
            if (err1)
              res.json({ error: err1 + '' });
            else if (!proj)
              new Project({
                name: project,
                issues: issue._id
              }).save((err2, newProj) => {
                if (err2)
                  res.json({ error: err2 + '' })
                else
                  res.json(issue);
              });
            else {
              proj.issues.push(issue._id);
              proj.save((err3, doc) => {
                if (err3)
                  res.json({ error: err3 + '' });
                else
                  res.json(issue);

              });
            }
          });
      });
    })

    .put(function (req, res) {
      if (!req.body._id) {
        res.json({ error: 'missing _id' });
        return;
      }
      Issue.findOne(
        { _id: req.body._id },
        (err, issue) => {
          if (err)
            res.json({
              error: 'could not update',
              _id: req.body._id,
              message: err + ''
            });
          else {
            let delta = 0;
            for (let prop in req.body)
              if (prop !== '_id' && req.body[prop] && req.body[prop] != issue[prop]) {
                issue[prop] = req.body[prop];
                delta++;
              }
            if (delta == 0)
              res.json({
                error: 'no update field(s) sent',
                _id: req.body._id
              });
            else
              issue.save({
                validateModifiedOnly: true
              }, saveErr => {
                if (saveErr)
                  res.json({
                    error: 'could not update',
                    _id: req.body._id,
                    message: saveErr + ''
                  });
                else
                  res.json({
                    result: 'successfully updated',
                    _id: req.body._id
                  });
              });
          }
        });
    })

    .delete(function (req, res) {
      if (!req.body._id)
        res.json({ error: 'missing _id' });
      else
        Issue.deleteOne({ _id: req.body._id }, (err) => {
          if (err)
            res.json({
              error: 'could not delete',
              _id: req.body._id
            });
          else
            res.json({
              result: 'successfully deleted',
              _id: req.body._id
            });
        });
    });

};
