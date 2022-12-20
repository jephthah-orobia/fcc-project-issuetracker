const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let _id;
    test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
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
            .send({ open: false, created_by: "some user" })
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
                open: false
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
                _id: _id
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
                _id: _id
            }).end(function (err, res) {
                assert.equal(res.status, 200);
                let resjson;
                assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                assert.propertyVal(resjson, 'result', 'successfully deleted');
                assert.propertyVal(resjson, "_id", _id);
                done()
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
                done()
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
                done()
            });
    });
});
