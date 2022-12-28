const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const fcctesting = require('../routes/fcctesting');

chai.use(chaiHttp);

suite("Functional Testing", function () {

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

    const expected_successful_operation_keys = ['result', '_id'];

    const faux_issue1 = {
        issue_title: "Faux Issue Title 2",
        issue_text: "Functional Test - Every field filled in",
        created_by: "fCC",
        assigned_to: "Chai and Mocha",
        status_text: "User completed all fields",
        onIdSet: [],
        _id: null,
        get id() {
            return this._id;
        },
        set id(newId) {
            this._id = newId;
            const runAll = async () => {
                for (let cb of this.onIdSet)
                    await cb();
            }
            runAll();
        }
    }

    const faux_issue2 = {
        issue_title: "Field To Be Updated and Deleted",
        issue_text: "Functional Test - Required Fields Only",
        created_by: "Aba",
        onIdSet: [],
        _id: null,
        get id() {
            return this._id;
        },
        set id(newId) {
            this._id = newId;
            const runAll = async () => {
                for (let cb of this.onIdSet)
                    await cb();
            }
            runAll();
        }
    }

    const faux_issue3 = {
        created_by: 'fCC'
    }

    const expected_failed_post = { error: 'required field(s) missing' };
    const expected_failed_operation_keys = ['error', '_id'];
    const expected_missing_id_keys = ['error'];

    const new_issue_text = 'New Issue Text';

    suite('ROUTE test for POST:/api/issues/{project}', function () {
        test("#1 Create an issue with every field",
            function (done) {
                let test_issue = faux_issue1;
                chai.request(server).post('/api/issues/test-project')
                    .send({
                        issue_title: "Faux Issue Title 2",
                        issue_text: "Functional Test - Every field filled in",
                        created_by: "fCC",
                        assigned_to: "Chai and Mocha",
                        status_text: "User completed all fields",
                    }).end((err, res) => {
                        assert.propertyVal(res, 'status', 200);
                        assert.isObject(res.body);
                        assert.hasAllKeys(res.body, expected_issue_keys);
                        assert.equal(res.body.issue_title, test_issue.issue_title);
                        assert.equal(res.body.issue_text, test_issue.issue_text);
                        assert.equal(res.body.created_by, test_issue.created_by);
                        assert.equal(res.body.assigned_to, test_issue.assigned_to);
                        assert.equal(res.body.status_text, test_issue.status_text);
                        assert.approximately(new Date(res.body.created_on).getTime(),
                            Date.now(), 1000);
                        assert.approximately(new Date(res.body.updated_on).getTime(),
                            Date.now(), 1000);
                        assert.approximately(new Date(res.body.created_on).getTime(),
                            new Date(res.body.updated_on).getTime(), 50);
                        assert.isNotEmpty(res.body._id);
                        faux_issue1.id = res.body._id;
                        done();
                    });
            });

        test("#2 Create an issue with required fields only",
            function (done) {
                let test_issue = faux_issue2;
                chai.request(server).post('/api/issues/test-project')
                    .send({
                        issue_title: "Field To Be Updated and Deleted",
                        issue_text: "Functional Test - Required Fields Only",
                        created_by: "Aba",
                    }).end((err, res) => {
                        assert.propertyVal(res, 'status', 200);
                        assert.isObject(res.body);
                        assert.hasAllKeys(res.body, expected_issue_keys);
                        assert.equal(res.body.issue_title, test_issue.issue_title);
                        assert.equal(res.body.issue_text, test_issue.issue_text);
                        assert.equal(res.body.created_by, test_issue.created_by);
                        assert.isEmpty(res.body.assigned_to);
                        assert.isEmpty(res.body.status_text);
                        assert.approximately(new Date(res.body.created_on).getTime(),
                            Date.now(), 600);
                        assert.approximately(new Date(res.body.updated_on).getTime(),
                            Date.now(), 600);
                        assert.approximately(new Date(res.body.created_on).getTime(),
                            new Date(res.body.updated_on).getTime(), 50);
                        assert.isNotEmpty(res.body._id);
                        faux_issue2.id = res.body._id;
                        done();
                    });
            });

        test("#3 Create an issue with missing required fields",
            function (done) {
                let test_issue = faux_issue3;
                chai.request(server).post('/api/issues/test-project')
                    .send(test_issue)
                    .end((err, res) => {
                        assert.propertyVal(res, 'status', 200);
                        assert.property(res, 'text');
                        let result;
                        assert.doesNotThrow(() => result = JSON.parse(res.text));
                        assert.propertyVal(result, 'error', expected_failed_post.error);
                        done();
                    });
            });
    })

    suite('ROUTE GET:/api/issues/{project} test', function () {
        test('#4 check project get_test',
            function (done) {
                chai.request(server).get('/api/issues/test-project')
                    .end((err, res) => {
                        assert.propertyVal(res, 'status', 200);
                        assert.property(res, 'text');
                        let result;
                        assert.doesNotThrow(() => result = JSON.parse(res.text));
                        assert.isArray(result);
                        assert.isNotEmpty(result);
                        assert.isAtLeast(result.length, 2, res.text);
                        done();
                    });
            });

        test('#5 View issues on a project with one filter',
            function (done) {
                const runTest = () =>
                    chai.request(server).get('/api/issues/test-project?created_by=Aba')
                        .end((err, res) => {
                            assert.equal(res.status, 200);
                            assert.isArray(res.body);
                            assert.isNotEmpty(res.body);
                            assert.isAtLeast(res.body.length, 1);
                            for (let issue of res.body) {
                                assert.equal(issue.created_by, 'Aba');
                            }
                            done();
                        });

                if (faux_issue2.id)
                    runTest();
                else
                    faux_issue2.onIdSet.push(runTest);
            });

        test('#6 View issues on a project with multipler filter',
            function (done) {
                const runTest = () =>
                    chai.request(server).get('/api/issues/test-project?' + new URLSearchParams({ created_by: 'fCC', issue_title: 'Faux Issue Title 2' }))
                        .end((err, res) => {
                            assert.equal(res.status, 200);
                            assert.isArray(res.body);
                            assert.isNotEmpty(res.body);
                            assert.isAtLeast(res.body.length, 1);
                            for (let issue of res.body) {
                                assert.equal(issue.issue_title, 'Faux Issue Title 2');
                                assert.equal(issue.created_by, 'fCC');
                            }
                            done();
                        });
                if (faux_issue1.id)
                    runTest();
                else
                    faux_issue1.onIdSet.push(runTest);
            });
    });



    suite('ROUTE PUT /api/issues/{project} test', function () {
        test('#7 Update one field on an issue', function (done) {
            const runTest = () => chai.request(server)
                .put('/api/issues/test-project')
                .send({
                    _id: faux_issue2.id,
                    issue_text: new_issue_text
                }).then(res => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.hasAllKeys(res.body, expected_successful_operation_keys);
                    assert.equal(res.body._id, faux_issue2.id);
                    assert.equal(res.body.result, 'successfully updated');
                    chai.request(server)
                        .get('/api/issues/test-project?' + new URLSearchParams({ _id: faux_issue2.id }))
                        .then(data => {
                            let issues = data.body;
                            assert.equal(issues[0]._id, faux_issue2.id);
                            assert.equal(issues[0].issue_text, new_issue_text);
                            assert.notEqual(issues[0].issue_text, faux_issue2.issue_text)
                            done();
                        })
                        .catch(e => {
                            assert.fail(e);
                            done();
                        });
                }).catch(e => {
                    assert.fail(e);
                    done();
                });

            if (faux_issue2.id)
                runTest();
            else
                faux_issue2.onIdSet.push(runTest);
        });

        const new_issue_title = 'Issue to be Deleted';
        const new_issue_text2 = 'Functional Test - Delete target';

        test("#8 Update multiple fields on an issue", function (done) {
            const runTest = () =>
                chai.request(server)
                    .put('/api/issues/test-project')
                    .send({
                        _id: faux_issue2.id,
                        issue_title: new_issue_title,
                        issue_text: new_issue_text2,
                    }).then(res => {
                        assert.equal(res.status, 200);
                        assert.isObject(res.body);
                        assert.hasAllKeys(res.body, expected_successful_operation_keys);
                        assert.equal(res.body._id, faux_issue2.id);
                        assert.equal(res.body.result, 'successfully updated');
                        chai.request(server)
                            .get('/api/issues/test-project?' + new URLSearchParams({ _id: faux_issue2.id }))
                            .then(data => {
                                let issues = data.body;
                                assert.equal(issues[0]._id, faux_issue2.id);
                                assert.equal(issues[0].issue_text, new_issue_text2);
                                assert.notEqual(issues[0].issue_text, new_issue_text)
                                assert.equal(issues[0].issue_title, new_issue_title);
                                assert.notEqual(issues[0].issue_text, faux_issue2.issue_text)
                                done();
                            })
                            .catch(e => {
                                assert.fail(e);
                                done();
                            });
                    }).catch(e => {
                        assert.fail(e);
                        done();
                    });
            if (faux_issue2.id)
                runTest();
            else
                faux_issue2.onIdSet.push(runTest);
        });

        test("#9 Update an issue with missing _id", function (done) {
            chai.request(server)
                .put('/api/issues/test-project')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.hasAllKeys(res.body, expected_missing_id_keys);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                })
        });

        test("#10 Update an issue with no fields to update", function (done) {
            const runTest = () =>
                chai.request(server)
                    .put('/api/issues/test-project')
                    .send({ _id: faux_issue2.id })
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.isObject(res.body);
                        assert.hasAllKeys(res.body, expected_failed_operation_keys);
                        assert.equal(res.body.error, 'no update field(s) sent');
                        assert.equal(res.body._id, faux_issue2.id);
                        done();
                    });
            if (faux_issue2.id)
                runTest();
            else
                faux_issue2.onIdSet.push(runTest);
        });

        test("#11 Update an issue with an invalid _id", function (done) {
            chai.request(server)
                .put('/api/issues/test-project')
                .send({ _id: "556213", status_text: "some new new" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.hasAllKeys(res.body, expected_failed_operation_keys);
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, "556213");
                    done();
                })
        });

    });

    suite('ROUTE DELETE /api/issues/{project} tests', function () {

        test("#12 Delete an issue", function (done) {
            const runTest = () =>
                chai.request(server)
                    .delete('/api/issues/test-project')
                    .send({ _id: faux_issue2.id })
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.isObject(res.body);
                        assert.hasAllKeys(res.body, expected_successful_operation_keys);
                        assert.equal(res.body.result, 'successfully deleted');
                        assert.equal(res.body._id, faux_issue2.id);
                        chai.request(server)
                            .get('/api/issues/test-project?' + new URLSearchParams({ _id: faux_issue2.id }))
                            .end((err1, res1) => {
                                assert.equal(res1.status, 200);
                                assert.isArray(res1.body);
                                assert.isEmpty(res1.body);
                                done();
                            });
                    });
            if (faux_issue2.id)
                runTest();
            else
                faux_issue2.onIdSet.push(runTest);
        });

        test("#13 Delete an issue with an invalid", function (done) {
            chai.request(server)
                .delete('/api/issues/test-project')
                .send({ _id: '5f665eb46e296f6b9b6a504d', issue_text: 'New Issue Text' })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.hasAllKeys(res.body, expected_failed_operation_keys);
                    assert.equal(res.body.error, 'could not delete');
                    assert.equal(res.body._id, '5f665eb46e296f6b9b6a504d');
                    done();
                })
        });

        test("#14 Delete an issue with missing _id", function (done) {
            chai.request(server)
                .delete('/api/issues/test-project')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.hasAllKeys(res.body, expected_missing_id_keys);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                })
        });

    });
});