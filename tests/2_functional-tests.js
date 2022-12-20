const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
        chai.request(server)
            .post('/api/issues/someproject', {
                issue_title: "some title",
                issue_text: "Some text",
                created_by: "some user",
                assigned_to: "someone",
                status_text: "some status text"
            }).end(function (err, res) {
                assert.equal(res.status, 200);
                let resjson;
                assert.doesNotThrow(() => resjson = JSON.parse(res.text));
                assert.deepPropertyVal(resjson, "issue_title", "some title");
                assert.deepPropertyVal(resjson, "issue_text", "some text");
                assert.deepPropertyVal(resjson, "issue_user", "some user");
                assert.deepPropertyVal(resjson, "assign_to", "someone");
                assert.deepPropertyVal(resjson, "status_text", "some status text");
                assert.deepPropertyVal(resjson, "open", true);
                assert.deepPropertyVal(resjson, "created_on");
                assert.deepPropertyVal(resjson, "updated_on");
                assert.deepProperty(resjson, "_id");
                done();
            });
    });
});
