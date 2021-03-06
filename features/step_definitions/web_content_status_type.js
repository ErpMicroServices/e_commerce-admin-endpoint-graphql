var {
    defineSupportCode
} = require('cucumber');

defineSupportCode(function({
    Given,
    When,
    Then
}) {

    Given('I have provided a web content status type called {stringInDoubleQuotes}', function(web_content_status_type, callback) {
        this.web_content_status_type = web_content_status_type;
        callback();
    });

    Given('a web content status type exists called {stringInDoubleQuotes}', function(web_content_status_type) {
        return this.db.one("insert into web_content_status_type (description) values ($1) returning id", [web_content_status_type])
            .then((data) => this.exisiting_web_preference_id = data.id);
    });

    When('I save the web content status type', function() {
        return this.axios
            .post("/", {
                "query": "mutation create_web_content_status_type($description : String!){  create_web_content_status_type( description : $description){ id }}",
                "variables": {
                    "description": this.web_content_status_type
                },
                "operationName": "create_web_content_status_type"
            })
            .then((response) => this.result = response);
    });

    When('I retrieve a list of web content status types', function() {
        return this.axios
            .post("/", {
                "query": "{ web_content_status_types {id,description}}",
                "variables": null,
                "operationName": null
            })
            .then((response) => this.result = response);
    });

    When('I update the web content status type to {stringInDoubleQuotes},', function(web_preference) {
        return this.axios.post("/", {
                "query": "mutation update_web_content_status_type($id: ID!, $description : String!){  update_web_content_status_type( id: $id, description : $description){id description} }",
                "variables": {
                    "id": this.exisiting_web_preference_id,
                    "description": web_preference
                },
                "operationName": "update_web_content_status_type"
            })
            .then((response) => this.result = response);
    });

    When('I delete a web content status type', function() {
        return this.axios.post("/", {
                "query": "mutation delete_web_content_status_type($id: ID!){  delete_web_content_status_type( id: $id){id}}",
                "variables": {
                    "id": this.exisiting_web_preference_id,
                },
                "operationName": "delete_web_content_status_type"
            })
            .then((response) => this.result = response);
    });

    Then('the web content status type is in the database', function() {
        expect(this.result.status).to.be.equal(200);
        expect(this.result.data.errors).to.be.falsy;
        expect(this.result.data.data).to.exist;
        if (this.result.data.data.update_web_content_status_type) {
            expect(this.result.data.data.update_web_content_status_type.web_preference).to.exist;
            expect(this.result.data.data.update_web_content_status_type.errors).to.not.exist;
        } else {
            expect(this.result.data.data.create_web_content_status_type.id).to.exist;
            expect(this.result.data.data.create_web_content_status_type.errors).to.not.exist;
        }
        return this.db.one("select id, description from web_content_status_type where id = $1", [this.result.data.data.create_web_content_status_type.id])
            .then((data) => expect(data.description).to.be.equal(this.web_content_status_type))
    });

    Then('the web content status type list contains {stringInDoubleQuotes}', function(web_content_status_type, callback) {
        expect(this.result.status).to.be.equal(200);
        expect(this.result.data.errors).to.be.falsy;
        expect(this.result.data.data).to.exist;
        expect(this.result.data.data.web_content_status_types.map((d) => d.description)).to.include(web_content_status_type)
        callback();
    });

    Then('the web content status type value in the database is {stringInDoubleQuotes}', function(web_preference_value) {
        expect(this.result.status).to.be.equal(200);
        expect(this.result.data.errors).to.be.falsy;
        expect(this.result.data.data).to.exist;
        return this.db.one("select id, description from web_content_status_type where id = $1", [this.exisiting_web_preference_id])
            .then((data) => {
                expect(data.description).to.be.equal(web_preference_value);
            });
    });

    Then('the web content status type called {stringInDoubleQuotes} does not exist', function(web_content_status_type) {
        expect(this.result.status).to.be.equal(200);
        expect(this.result.data.errors).to.be.falsy;
        expect(this.result.data.data).to.exist;
        return this.db.one("select id, description from web_content_status_type where id = $1", [this.exisiting_web_preference_id])
            .then((data) => {
                expect(data).to.not.be.ok;
            })
            .catch((error) => {
                expect(error.message).to.be.equal("No data returned from the query.");
            })
    });
});
