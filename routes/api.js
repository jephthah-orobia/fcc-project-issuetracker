'use strict';
const { Error } = require('mongoose');
const Issue = require('../datastore/issueSchema');
const Project = require('../datastore/projectSchema');
const { logPropsOf } = require('../log-utils');
const { hasPropsExcept } = require('../obj-utils');

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

      const success = {
        result: 'successfully updated',
        _id: req.body._id
      };

      const send = (result) => {
        logPropsOf('<< result: ', result);
        res.json(result);
      }

      // check if _id is available
      if (!req.body._id || req.body._id == '')
        send({ error: 'missing _id' });
      else if (!hasPropsExcept(req.body, ['_id']))
        send(noFields);
      else
        Project.findOne({
          name: req.params.project,
          issues: req.body._id
        }, (fpEr, project) => {
          if (fpEr || !project)
            send(failedToUpdate);
          else
            Issue.findById(req.body._id,
              (err, issue) => {
                if (err || !issue || !issue.open) {
                  send(failedToUpdate);
                }
                else {
                  for (let prop in req.body)
                    if (!(prop in { '_id': 1, 'created_on': 1, 'updated_on': 1 })
                      && (
                        (typeof req.body[prop] == 'string' && req.body[prop] != ''
                          && prop in issue && req.body[prop] != issue[prop])
                        || (prop == 'open' && typeof req.body.open == 'boolean'
                          && req.body.open != issue.open)
                      ))
                      issue[prop] = req.body[prop];
                  if (!issue.isModified())
                    send(noFields);
                  else
                    issue.save(saveErr => {
                      if (saveErr)
                        send(failedToUpdate);
                      else
                        send(success);
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