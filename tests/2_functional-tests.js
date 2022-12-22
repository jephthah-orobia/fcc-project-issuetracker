const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    suite('FCC required test', function () {
        let _id;
        test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
            this.timeout(4000);
            chai.request(server)
                .post('/api/issues/someproject')
                .send({
                    issue_title: "some title",
                    issue_text: "some text",
                    created_by: "some user",
                    assigned_to: "someone",
                    status_text: "some status text"
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, "issue_title", "some title");
                    assert.propertyVal(resjson, "issue_text", "some text");
                    assert.propertyVal(resjson, "created_by", "some user");
                    assert.propertyVal(resjson, "assigned_to", "someone");
                    assert.propertyVal(resjson, "status_text", "some status text");
                    assert.propertyVal(resjson, "open", true);
                    assert.property(resjson, "created_on");
                    assert.property(resjson, "updated_on");
                    assert.property(resjson, "_id");
                    _id = resjson._id;
                    done();
                });
        });

        test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
            chai.request(server)
                .post('/api/issues/someproject')
                .send({
                    issue_title: "some title",
                    issue_text: "some text",
                    created_by: "some user"
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, "issue_title", "some title");
                    assert.propertyVal(resjson, "issue_text", "some text");
                    assert.propertyVal(resjson, "created_by", "some user");
                    assert.propertyVal(resjson, "assigned_to", "");
                    assert.propertyVal(resjson, "status_text", "");
                    assert.propertyVal(resjson, "open", true);
                    assert.property(resjson, "created_on");
                    assert.property(resjson, "updated_on");
                    assert.property(resjson, "_id");
                    done();
                });
        });

        test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
            chai.request(server)
                .post('/api/issues/someproject')
                .send({
                    issue_title: "some title",
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, "error", "required field(s) missing");
                    done();
                });
        });

        test('View issues on a project: GET request to /api/issues/{project}', function (done) {
            chai.request(server)
                .get('/api/issues/someject')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.isArray(resjson);
                    assert.isAtLeast(resjson.length, 0);
                    if (resjson.length > 0) {
                        assert.deepProperty('_id');
                        assert.deepPropertyVal(resjson, "issue_title", "some title");
                        assert.deepPropertyVal(resjson, "issue_text", "some text");
                        assert.deepPropertyVal(resjson, "created_by", "some user");
                        assert.deepPropertyVal(resjson, "assigned_to", "");
                        assert.deepPropertyVal(resjson, "status_text", "");
                        assert.deepPropertyVal(resjson, "open", true);
                        assert.deepProperty(resjson, "created_on");
                        assert.deepProperty(resjson, "updated_on");
                    }
                    done();
                });
        });

        test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
            chai.request(server)
                .get('/api/issues/someject')
                .send({ open: false })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.isArray(resjson);
                    assert.isAtLeast(resjson.length, 0);
                    if (resjson.length > 0) {
                        assert.deepProperty('_id');
                        assert.deepPropertyVal(resjson, "issue_title", "some title");
                        assert.deepPropertyVal(resjson, "issue_text", "some text");
                        assert.deepPropertyVal(resjson, "created_by", "some user");
                        assert.deepPropertyVal(resjson, "assigned_to", "");
                        assert.deepPropertyVal(resjson, "status_text", "");
                        assert.deepPropertyVal(resjson, "open", true);
                        assert.deepProperty(resjson, "created_on");
                        assert.deepProperty(resjson, "updated_on");
                    }
                    done();
                });
        });

        test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
            chai.request(server)
                .get('/api/issues/someject')
                .send({ open: true, created_by: "some user" })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.isArray(resjson);
                    assert.isAtLeast(resjson.length, 0);
                    if (resjson.length > 0) {
                        assert.deepProperty('_id');
                        assert.deepPropertyVal(resjson, "issue_title", "some title");
                        assert.deepPropertyVal(resjson, "issue_text", "some text");
                        assert.deepPropertyVal(resjson, "created_by", "some user");
                        assert.deepPropertyVal(resjson, "assigned_to", "");
                        assert.deepPropertyVal(resjson, "status_text", "");
                        assert.deepPropertyVal(resjson, "open", true);
                        assert.deepProperty(resjson, "created_on");
                        assert.deepProperty(resjson, "updated_on");
                    }
                    done();
                });
        });


        test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
            chai.request(server)
                .put('/api/issues/someproject')
                .send({
                    _id: _id,
                    created_by: 'some one else'
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, "result", "successfully updated");
                    assert.propertyVal(resjson, "_id", _id);
                    done();
                });
        });

        test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
            chai.request(server)
                .put('/api/issues/someproject')
                .send({
                    _id: _id,
                    open: true,
                    status_text: "there was some changes and needs to be reopened"
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, "result", "successfully updated");
                    assert.propertyVal(resjson, "_id", _id);
                    done();
                });
        });

        test('Update an issue with missing _id: PUT requrest to /api/issues/{project}', function (done) {
            chai.request(server)
                .put('/api/issues/someproject')
                .send({
                    open: false
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'missing _id');
                    assert.notProperty(resjson, "_id");
                    done();
                });
        });

        test('Update an issue with no fields to update: PUT requrest to /api/issues/{project}', function (done) {
            chai.request(server)
                .put('/api/issues/someproject')
                .send({
                    _id: _id,
                    issue_title: '',
                    issue_text: '',
                    created_by: '',
                    assigned_to: '',
                    open: true,
                    status_text: "there was some changes and needs to be reopened"
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'no update field(s) sent');
                    assert.propertyVal(resjson, "_id", _id);
                    done();
                });
        });

        test('Update an issue with an invalid _id: PUT requrest to /api/issues/{project}', function (done) {
            chai.request(server)
                .put('/api/issues/someproject')
                .send({
                    _id: 'abc',
                    open: false,
                    status_text: 'some changes'
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'could not update');
                    assert.propertyVal(resjson, "_id", 'abc');
                    done();
                });
        });

        test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
            chai.request(server)
                .delete('/api/issues/someproject')
                .send({
                    _id: _id,
                    issue_title: "some title"
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'result', 'successfully deleted');
                    assert.propertyVal(resjson, "_id", _id);
                    done();
                });

        });

        test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
            chai.request(server)
                .delete('/api/issues/someproject')
                .send({
                    _id: '02139s3a'
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'could not delete');
                    assert.propertyVal(resjson, "_id", '02139s3a');
                    done();
                });
        });

        test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project} (2)', function (done) {
            chai.request(server)
                .delete('/api/issues/someproject')
                .send({
                    _id: ' --'
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'could not delete');
                    done();
                });
        });

        test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
            chai.request(server)
                .delete('/api/issues/someproject')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'missing _id');
                    done();
                });
        });

        test('Delete an issue with missing _id: DELETE request to /api/issues/{project} (2)', function (done) {
            chai.request(server)
                .delete('/api/issues/someproject')
                .send({
                    _id: ''
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'missing _id');
                    done();
                });
        });
        test('Delete an issue with missing _id: DELETE request to /api/issues/{project} (3)', function (done) {
            chai.request(server)
                .delete('/api/issues/someproject')
                .send({
                    open: true
                }).end(function (err, res) {
                    assert.equal(res.status, 200);
                    let resjson;
                    assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                    assert.propertyVal(resjson, 'error', 'missing _id');
                    done()
                });
        });
    });

    /* Additional Test */

    suite('Additional Test - Sequential Test', function () {
        const seed = () => Math.round(Math.random() * 4);

        const project1 = 'seqtest' + seed();

        const project1_issues = [];

        const project2 = 'seqtes' + seed();
        const project2_issues = [];

        const issue1 = {
            issue_title: 'There was a problem 1',
            issue_text: 'Do not change this',
            created_by: 'john cruz',
            assigned_to: 'fred smith',
            status_text: 'ongoing'
        };

        const issue2 = {
            issue_title: 'Required Only',
            issue_text: 'try to update status text of this',
            created_by: 'grace wan'
        };

        const issue3 = {
            issue_title: 'Incomplete',
            issue_text: 'This issue is lacking creator'
        };

        const issue4 = {
            issue_title: 'No text, but with optional field',
            assigned_to: 'not you'
        };

        const issue5 = {
            issue_title: 'To Be Updated',
            issue_text: 'try to make some chanages to this',
            created_by: 'you of course'
        }

        const expected_issue_keys = [
            '_id',
            'issue_title',
            'issue_text',
            'created_by',
            'open',
            'assigned_to',
            'status_text',
            'created_on',
            'updated_on'
        ];

        test('Check project1, must be empty', function (done) {
            chai.request(server)
                .get('/api/issues/' + project1)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    let issues;
                    assert.doesNotThrow(() => issues = JSON.parse(res.text));
                    assert.isArray(issues);
                    assert.isEmpty(issues);
                    done();
                });
        });

        test('Create an issue on project1 with every field', function (done) {
            chai.request(server)
                .post('/api/issues/' + project1)
                .send(issue1).end((err, res) => {
                    assert.equal(res.status, 200);
                    let iss;
                    assert.doesNotThrow(() => iss = JSON.parse(res.text));
                    assert.isNotArray(iss);
                    assert.hasAllKeys(iss, expected_issue_keys);
                    assert.propertyVal(iss, 'issue_title', issue1.issue_title);
                    assert.propertyVal(iss, 'issue_text', issue1.issue_text);
                    assert.propertyVal(iss, 'created_by', issue1.created_by);
                    assert.propertyVal(iss, 'open', true);
                    assert.propertyVal(iss, 'assigned_to', issue1.assigned_to);
                    assert.propertyVal(iss, 'status_text', issue1.status_text);
                    assert.approximately((new Date(iss.created_on)).getTime(), Date.now(), 2000);
                    assert.approximately((new Date(iss.updated_on)).getTime(), Date.now(), 2000);
                    issue1._id = iss._id;
                    done();
                });
        });

        test('Create an issue2 on project1 with required field only', function (done) {
            chai.request(server)
                .post('/api/issues/' + project1)
                .send(issue2).end((err, res) => {
                    assert.equal(res.status, 200);
                    let iss;
                    assert.doesNotThrow(() => iss = JSON.parse(res.text));
                    assert.isNotArray(iss);
                    assert.hasAllKeys(iss, expected_issue_keys);
                    assert.propertyVal(iss, 'issue_title', issue2.issue_title);
                    assert.propertyVal(iss, 'issue_text', issue2.issue_text);
                    assert.propertyVal(iss, 'created_by', issue2.created_by);
                    assert.propertyVal(iss, 'open', true);
                    assert.propertyVal(iss, 'assigned_to', '');
                    assert.propertyVal(iss, 'status_text', '');
                    assert.approximately((new Date(iss.created_on)).getTime(), Date.now(), 2000);
                    assert.approximately((new Date(iss.updated_on)).getTime(), Date.now(), 2000);
                    issue2._id = iss._id;
                    done();
                });
        });

        test('Create an issue5 on project2 with required field only', function (done) {
            chai.request(server)
                .post('/api/issues/' + project2)
                .send(issue5).end((err, res) => {
                    assert.equal(res.status, 200);
                    let iss;
                    assert.doesNotThrow(() => iss = JSON.parse(res.text));
                    assert.isNotArray(iss);
                    assert.hasAllKeys(iss, expected_issue_keys);
                    assert.propertyVal(iss, 'issue_title', issue5.issue_title);
                    assert.propertyVal(iss, 'issue_text', issue5.issue_text);
                    assert.propertyVal(iss, 'created_by', issue5.created_by);
                    assert.propertyVal(iss, 'open', true);
                    assert.propertyVal(iss, 'assigned_to', '');
                    assert.propertyVal(iss, 'status_text', '');
                    assert.approximately((new Date(iss.created_on)).getTime(), Date.now(), 2000);
                    assert.approximately((new Date(iss.updated_on)).getTime(), Date.now(), 2000);
                    issue5._id = iss._id;
                    issue5.created_on = iss.created_on;
                    done();
                });
        });

        test('Create an issue3 on project1 with missing required fields', function (done) {
            chai.request(server)
                .post('/api/issues/' + project1)
                .send(issue3).end((err, res) => {
                    assert.equal(res.status, 200);
                    let iss;
                    assert.doesNotThrow(() => iss = JSON.parse(res.text));
                    assert.hasAllKeys(iss, ['error']);
                    assert.propertyVal(iss, 'error', 'required field(s) missing');
                    done();
                });
        });
        test('Create an issue4 on project1 with missing required fields', function (done) {
            chai.request(server)
                .post('/api/issues/' + project1)
                .send(issue3).end((err, res) => {
                    assert.equal(res.status, 200);
                    let iss;
                    assert.doesNotThrow(() => iss = JSON.parse(res.text));
                    assert.hasAllKeys(iss, ['error']);
                    assert.propertyVal(iss, 'error', 'required field(s) missing');
                    done();
                });
        });

        test('Check project1 issues, there must be only be 2 issues', function (done) {
            chai.request(server)
                .get('/api/issues/' + project1)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    let issues;
                    assert.doesNotThrow(() => issues = JSON.parse(res.text));
                    assert.isArray(issues);
                    assert.isNotEmpty(issues);
                    assert.equal(issues.length, 2);
                    for (let iss of issues) {
                        assert.hasAllKeys(iss, expected_issue_keys);
                        assert.isTrue(iss.open, true);
                        project1_issues.push(iss);
                    }
                    assert.propertyVal(issues[0], '_id', issue1._id);
                    assert.propertyVal(issues[1], '_id', issue2._id);
                    done();
                });
        });

        test('update issue5, add the optional assigned to', function (done) {
            chai.request(server).put('/api/issues/' + project2)
                .send({ _id: issue5._id, assigned_to: 'new guy' })
                .end(function (err, res) {
                    issue5.possible_updated_on = new Date();
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['_id', 'result']);
                    assert.propertyVal(result, 'result', 'successfully updated');
                    assert.propertyVal(result, '_id', issue5._id);
                    done();
                });
        });

        test('Delete issue1 in project1', function (done) {
            chai.request(server).delete('/api/issues/' + project1)
                .send({ _id: issue1._id })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['_id', 'result']);
                    assert.equal(result.result, 'successfully deleted');
                    assert.propertyVal(result, '_id', issue1._id);
                    done();
                });
        });

        test('Delete issue2 in project1', function (done) {
            chai.request(server).delete('/api/issues/' + project1)
                .send({ _id: issue2._id })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['_id', 'result']);
                    assert.equal(result.result, 'successfully deleted');
                    assert.propertyVal(result, '_id', issue2._id);
                    done();
                });
        });

        test('Check project1, must be empty', function (done) {
            chai.request(server)
                .get('/api/issues/' + project1)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    let issues;
                    assert.doesNotThrow(() => issues = JSON.parse(res.text));
                    assert.isArray(issues);
                    assert.isEmpty(issues);
                    done();
                });
        });

        test('Try to update a non existing issue', function (done) {
            chai.request(server).put('/api/issues/' + project1)
                .send({ _id: issue5._id, assigned_to: 'new guy' })
                .end(function (err, res) {
                    issue5.possible_updated_on = new Date();
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['_id', 'error']);
                    assert.propertyVal(result, 'error', 'could not update');
                    assert.propertyVal(result, '_id', issue5._id);
                    done();
                });
        });

        test('Try to update without providing _id', function (done) {
            chai.request(server).put('/api/issues/' + project2)
                .send({ assigned_to: 'new guy' })
                .end(function (err, res) {
                    issue5.possible_updated_on = new Date();
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['error']);
                    assert.propertyVal(result, 'error', 'missing _id');
                    done();
                });
        });

        test('Delete non existing issue in project1', function (done) {
            chai.request(server).delete('/api/issues/' + project1)
                .send({ _id: issue2._id })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['_id', 'error']);
                    assert.propertyVal(result, 'error', 'could not delete');
                    assert.propertyVal(result, '_id', issue2._id);
                    done();
                });
        });

        test('Delete non existing issue in project2', function (done) {
            chai.request(server).delete('/api/issues/' + project2)
                .send({ _id: issue2._id })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['_id', 'error']);
                    assert.propertyVal(result, 'error', 'could not delete');
                    assert.propertyVal(result, '_id', issue2._id);
                    done();
                });
        });

        test('Delete an issue without _id in project2', function (done) {
            chai.request(server).delete('/api/issues/' + project2)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, ['error']);
                    assert.propertyVal(result, 'error', 'missing _id');
                    done();
                });
        });

        test('Check project2, must be Not Empty, with issue5', function (done) {
            chai.request(server)
                .get('/api/issues/' + project2)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    let issues;
                    assert.doesNotThrow(() => issues = JSON.parse(res.text));
                    assert.isArray(issues);
                    assert.isNotEmpty(issues);
                    assert.equal(issues.length, 1);
                    assert.hasAllKeys(issues[0], expected_issue_keys);
                    assert.equal(issues[0].created_on, issue5.created_on);
                    assert.approximately((new Date(issues[0].updated_on)).getTime(), issue5.possible_updated_on.getTime(), 2000);
                    done();
                });
        });
    });
});