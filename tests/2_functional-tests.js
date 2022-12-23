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
        status_text: "User completed all fields"
    }

    test("#1 Create an issue with every field",
        function (done) {
            let test_issue = faux_issue1;
            chai.request(server).post('/api/issues/fcc-project')
                .send(test_issue)
                .end((err, res) => {
                    assert.propertyVal(res, 'status', 200);
                    assert.property(res, 'text');
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, expected_issue_keys);
                    assert.equal(result.issue_title, test_issue.issue_title);
                    assert.equal(result.issue_text, test_issue.issue_text);
                    assert.equal(result.created_by, test_issue.created_by);
                    assert.equal(result.assigned_to, test_issue.assigned_to);
                    assert.equal(result.status_text, test_issue.status_text);
                    assert.approximately(new Date(result.created_on).getTime(),
                        Date.now(), 1000);
                    assert.approximately(new Date(result.updated_on).getTime(),
                        Date.now(), 1000);
                    assert.approximately(new Date(result.created_on).getTime(),
                        new Date(result.updated_on).getTime(), 50);
                    assert.isNotEmpty(result._id);
                    done();
                });
        });

    const faux_issue2 = {
        issue_title: "Faux Issue Title",
        issue_text: "Functional Test - Required Fields Only",
        created_by: "fCC",
    }

    test("#2 Create an issue with required fields only",
        function (done) {
            let test_issue = faux_issue2;
            chai.request(server).post('/api/issues/fcc-project')
                .send(test_issue)
                .end((err, res) => {
                    assert.propertyVal(res, 'status', 200);
                    assert.property(res, 'text');
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.hasAllKeys(result, expected_issue_keys);
                    assert.equal(result.issue_title, test_issue.issue_title);
                    assert.equal(result.issue_text, test_issue.issue_text);
                    assert.equal(result.created_by, test_issue.created_by);
                    assert.isEmpty(result.assigned_to);
                    assert.isEmpty(result.status_text);
                    assert.approximately(new Date(result.created_on).getTime(),
                        Date.now(), 600);
                    assert.approximately(new Date(result.updated_on).getTime(),
                        Date.now(), 600);
                    assert.approximately(new Date(result.created_on).getTime(),
                        new Date(result.updated_on).getTime(), 50);
                    assert.isNotEmpty(result._id);
                    done();
                });
        });

    const faux_issue3 = {
        created_by: 'fCC'
    }

    const expected_failed_post = { error: 'required field(s) missing' };
    const expected_failed_operation_keys = ['error', '_id'];
    const expected_missing_id_keys = ['error'];

    test("#3 Create an issue with missing required fields",
        function (done) {
            let test_issue = faux_issue3;
            chai.request(server).post('/api/issues/fcc-project')
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


    const post_issue = (issue, project) => new Promise((res, rej) =>
        chai.request(server)
            .post('/api/issues/' + project)
            .send(issue)
            .then(d => res(d))
            .catch(e => rej(e)));

    test('#4 check project get_test',
        function (done) {
            chai.request(server).get('/api/issues/fcc-project')
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


    const issues_to_be_filtered = [{
        issue_title: 'To be Filtered',
        issue_text: 'Filter Issues Test',
        created_by: 'Alice',
        assigned_to: 'Bob',
    }, {
        issue_title: 'To be Filtered',
        issue_text: 'Filter Issues Test',
        created_by: 'Alice',
        assigned_to: 'Bob',
    }, {
        issue_title: 'To be Filtered',
        issue_text: 'Filter Issues Test',
        created_by: 'Alice',
        assigned_to: 'Eric',
    }, {
        issue_title: 'To be Filtered',
        issue_text: 'Filter Issues Test',
        created_by: 'Carol',
        assigned_to: 'Eric',
    }];

    const get_one_filter = { created_by: 'Alice' };
    const get_multifilter = { created_by: 'Alice', assigned_to: 'Bob' };

    const filter_test = 'filter_test_' + Math.random();
    test('#5 View issues on a project with one filter',
        function (done) {
            Promise.all(issues_to_be_filtered.map(is => post_issue(is, filter_test)))
                .then(() =>
                    chai.request(server).get('/api/issues/' + filter_test + '?' + new URLSearchParams(get_one_filter).toString())
                        .then(res => {
                            assert.equal(res.status, 200);
                            let result;
                            assert.doesNotThrow(() => result = JSON.parse(res.text));
                            assert.isArray(result);
                            assert.isNotEmpty(result);
                            assert.equal(result.length, 3);
                            for (let issue of result) {
                                for (let prop in get_one_filter)
                                    assert.equal(issue[prop], get_multifilter[prop]);
                            }
                            done();
                        }).catch(e => {
                            assert.fail(e + '');
                            done();
                        })
                ).catch(e => {
                    assert.fail(e + '');
                    done();
                });
        });

    test('#6 View issues on a project with multiple filter',
        function (done) {
            chai.request(server)
                .get('/api/issues/' + filter_test + '?' + new URLSearchParams(get_multifilter).toString())
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    let result;
                    assert.doesNotThrow(() => result = JSON.parse(res.text));
                    assert.isArray(result);
                    assert.isNotEmpty(result);
                    assert.equal(result.length, 2);
                    for (let issue of result) {
                        for (let prop in get_multifilter)
                            assert.equal(issue[prop], get_multifilter[prop]);
                    }
                    done();
                });
        });

    const issue_to_be_update = {
        issue_title: 'Issue to be Updated',
        issue_text: 'Functional Test - Put Target',
        created_by: 'fCC'
    }
    const new_issue_text = 'New Issue Text';

    test('#7 Update one field on an issue', function (done) {
        post_issue(issue_to_be_update, 'fcc-project')
            .then((get_res) => {
                let issue = JSON.parse(get_res.text);
                chai.request(server)
                    .put('/api/issues/fcc-project')
                    .send({
                        _id: issue._id,
                        issue_text: new_issue_text
                    }).then(res => {
                        assert.equal(res.status, 200);
                        let result;
                        assert.doesNotThrow(() => result = JSON.parse(res.text));
                        assert.hasAllKeys(result, expected_successful_operation_keys);
                        assert.equal(result._id, issue._id);
                        assert.equal(result.result, 'successfully updated');
                        chai.request(server)
                            .get('/api/issues/fcc-project?' + new URLSearchParams({ _id: issue._id }))
                            .then(data => {
                                let issues = JSON.parse(data.text);
                                assert.equal(issues[0]._id, issue._id);
                                assert.equal(issues[0].issue_text, new_issue_text);
                                assert.notEqual(issues[0].issue_text, issue_to_be_update.issue_text)
                                issue_to_be_update._id = issue._id;
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
            }).catch(e => {
                assert.fail(e);
                done();
            });
    });

    const new_issue_title = 'Issue to be Deleted';
    const new_issue_text2 = 'Functional Test - Delete target';

    test("#8 Update multiple fields on an issue", function (done) {
        chai.request(server)
            .put('/api/issues/fcc-project')
            .send({
                _id: issue_to_be_update._id,
                issue_title: new_issue_title,
                issue_text: new_issue_text2,
            }).then(res => {
                assert.equal(res.status, 200);
                let result;
                assert.doesNotThrow(() => result = JSON.parse(res.text));
                assert.hasAllKeys(result, expected_successful_operation_keys);
                assert.equal(result._id, issue_to_be_update._id);
                assert.equal(result.result, 'successfully updated');
                chai.request(server)
                    .get('/api/issues/fcc-project?' + new URLSearchParams({ _id: issue_to_be_update._id }))
                    .then(data => {
                        let issues = JSON.parse(data.text);
                        assert.equal(issues[0]._id, issue_to_be_update._id);
                        assert.equal(issues[0].issue_text, new_issue_text2);
                        assert.equal(issues[0].issue_title, new_issue_title);
                        assert.notEqual(issues[0].issue_text, issue_to_be_update.issue_text)
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
    });

    test("#9 Update an issue with missing _id", function (done) {
        chai.request(server)
            .put('/api/issues/fcc-project')
            .end((err, res) => {
                assert.equal(res.status, 200);
                let result;
                assert.doesNotThrow(() => result = JSON.parse(res.text));
                assert.hasAllKeys(result, expected_missing_id_keys);
                assert.equal(result.error, 'missing _id');
                done();
            })
    });

    test("#10 Update an issue with no fields to update", function (done) {
        chai.request(server)
            .put('/api/issues/fcc-project')
            .send({ _id: issue_to_be_update._id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                let result;
                assert.doesNotThrow(() => result = JSON.parse(res.text));
                assert.hasAllKeys(result, expected_failed_operation_keys);
                assert.equal(result.error, 'no update field(s) sent');
                assert.equal(result._id, issue_to_be_update._id);
                done();
            })
    });

    test("#11 Update an issue with an invalid _id", function (done) {
        chai.request(server)
            .put('/api/issues/fcc-project')
            .send({ _id: "556213" })
            .end((err, res) => {
                assert.equal(res.status, 200);
                let result;
                assert.doesNotThrow(() => result = JSON.parse(res.text));
                assert.hasAllKeys(result, expected_failed_operation_keys);
                assert.equal(result.error, 'could not update');
                assert.equal(result._id, "556213");
                done();
            })
    });

    test("#12 Delete an issue", function (done) {
        chai.request(server)
            .delete('/api/issues/fcc-project')
            .send({ _id: issue_to_be_update._id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                let result;
                assert.doesNotThrow(() => result = JSON.parse(res.text));
                assert.hasAllKeys(result, expected_successful_operation_keys);
                assert.equal(result.result, 'successfully deleted');
                assert.equal(result._id, issue_to_be_update._id);
                chai.request(server)
                    .get('/api/issues/fcc-project?' + new URLSearchParams({ _id: issue_to_be_update._id }))
                    .end((err1, res1) => {
                        assert.equal(res1.status, 200);
                        let result = JSON.parse(res1.text);
                        assert.isArray(result);
                        assert.isEmpty(result);
                        done();
                    });
            })
    });

    test("#13 Delete an issue with an invalid", function (done) {
        chai.request(server)
            .delete('/api/issues/fcc-project')
            .send({ _id: '5f665eb46e296f6b9b6a504d', issue_text: 'New Issue Text' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                let result;
                assert.doesNotThrow(() => result = JSON.parse(res.text));
                assert.hasAllKeys(result, expected_failed_operation_keys);
                assert.equal(result.error, 'could not delete');
                assert.equal(result._id, '5f665eb46e296f6b9b6a504d');
                done();
            })
    });

    test("#14 Delete an issue with missing _id", function (done) {
        chai.request(server)
            .delete('/api/issues/fcc-project')
            .end((err, res) => {
                assert.equal(res.status, 200);
                let result;
                assert.doesNotThrow(() => result = JSON.parse(res.text));
                assert.hasAllKeys(result, expected_missing_id_keys);
                assert.equal(result.error, 'missing _id');
                done();
            })
    });
});