const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
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
                assert.deepPropertyVal(resjson, "issue_title", "some title");
                assert.deepPropertyVal(resjson, "issue_text", "some text");
                assert.deepPropertyVal(resjson, "created_by", "some user");
                assert.deepPropertyVal(resjson, "assigned_to", "someone");
                assert.deepPropertyVal(resjson, "status_text", "some status text");
                assert.deepPropertyVal(resjson, "open", true);
                assert.property(resjson, "created_on", res.text);
                assert.property(resjson, "updated_on");
                assert.property(resjson, "_id");
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
                assert.deepPropertyVal(resjson, "issue_title", "some title");
                assert.deepPropertyVal(resjson, "issue_text", "some text");
                assert.deepPropertyVal(resjson, "created_by", "some user");
                assert.deepPropertyVal(resjson, "assigned_to", "");
                assert.deepPropertyVal(resjson, "status_text", "");
                assert.deepPropertyVal(resjson, "open", true);
                assert.property(resjson, "created_on", res.text);
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
                assert.property(resjson, "error");
                assert.propertyVal(resjson, "error", "required field(s) missing");
                done();
            });
    });
});
