'use strict';
const { Error } = require('mongoose');
const Issue = require('../datastore/issueSchema');
const Project = require('../datastore/projectSchema');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      Project.findOne({ name: project })
        .populate({ path: 'issues', match: req.query })
        .exec((err, proj) => {
          if (err)
            res.send({ error: err + '' });
          else if (!proj)
            res.json([]);
          else
            res.json(proj.issues);
        });
    })

    .post(function (req, res) {
      let project = req.params.project;

      const sendError =
        (message) => res.json({ error: message + '' });

      const insertIssue = (project, issue) => {
        project.issues.unshift(issue._id);
        project.save((err, doc) => {
          if (err && err instanceof Error.VersionError)
            findProject(0, issue);
          else if (err)
            sendError(err);
          else
            res.json(issue);
        });
      }

      const createIssue = (project) => new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || ''
      }).save((err, issue) => {
        if (err && err instanceof Error.ValidationError)
          sendError('required field(s) missing');
        else if (err)
          sendError(err);
        else
          insertIssue(project, issue);
      });

      const findProject = (count = 0, issue = false) => Project.findOne({ name: project },
        (err, proj) => {
          if (err)
            sendError(err)
          else if (!proj)
            new Project({
              name: project
            }).save((err1, newProj) => {
              if (err1 &&
                (err1 instanceof Error.VersionError
                  || err1.code == 11000) && count < 5)
                setTimeout(() => findProject(++count, issue), 50);
              else if (err1)
                sendError(err1);
              else if (issue)
                insertIssue(newProj, issue)
              else
                createIssue(newProj);
            });
          else if (issue)
            insertIssue(proj, issue)
          else
            createIssue(proj);
        });

      findProject();
    })

    .put(function (req, res) {
      const failedToUpdate = {
        error: 'could not update',
        _id: req.body._id
      };

      const noFields = {
        error: 'no update field(s) sent',
        _id: req.body._id
      };

      // check if _id is available
      if (!req.body._id || req.body._id == '')
        res.json({ error: 'missing _id' });
      else
        Project.findOne({
          name: req.params.project,
          issues: req.body._id
        }, (fpEr, project) => {
          if (fpEr || !project)
            res.json(failedToUpdate);
          else
            Issue.findById(req.body._id,
              (err, issue) => {
                if (err || !issue || !issue.open) {
                  res.json(failedToUpdate);
                }
                else {
                  for (let prop in req.body)
                    if (!(prop in ['_id', 'created_on', 'updated_on'])
                      && (
                        (typeof req.body[prop] == 'string' && req.body[prop] != ''
                          && prop in issue && req.body[prop] != issue[prop])
                        || (prop == 'open' && typeof req.body.open == 'boolean'
                          && req.body.open != issue.open)
                      ))
                      issue[prop] = req.body[prop];
                  if (!issue.isModified())
                    res.json(noFields);
                  else
                    issue.save(saveErr => {
                      if (saveErr)
                        res.json(failedToUpdate);
                      else
                        res.json({
                          result: 'successfully updated',
                          _id: req.body._id
                        });
                    });
                }
              });
        });


    })

    .delete(function (req, res) {
      if (!req.body._id || req.body._id == '')
        res.json({ error: 'missing _id' });
      else
        Project.findOneAndUpdate({
          name: req.params.project,
          issues: req.body._id
        }, {
          $pull: { issues: req.body._id }
        }, (upErr, proj) => {
          if (upErr || !proj)
            res.json({
              error: 'could not delete',
              _id: req.body._id
            });
          else
            Issue.deleteOne({
              _id: req.body._id
            }, (delErr) => {
              if (delErr)
                res.json({
                  error: 'could not delete',
                  _id: req.body._id
                });
              else
                res.json({
                  result: 'successfully deleted',
                  _id: req.body._id
                });

            })
        });
    });
};