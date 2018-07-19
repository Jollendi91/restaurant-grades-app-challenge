const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const should = chai.should();

const app = require('../app');
const {Restaurant, Grade} = require('../models');

chai.use(chaiHttp);


function generateGradeData(includeDates=false, restaurantId=null) {
    const grades = ['A', 'B', 'C', 'D', 'F'];
    let grade = grades[Math.floor(Math.random() * grades.length)];
    const result = {
        inspectionDate: faker.date.past(),
        grade: grade
    }

    if (includeDates) {
        const date = faker.date.recent();
        result.createdAt = date;
        result.updatedAt = date;
    }

    if (restaurantId) {
        result.restaurant_id = restaurantId;
    }

    return result;
}

function seedData(seedNum=1) {
    return seedRestaurantData()
        .then(restaurant => {
            const promises = [];
            for (let i=1; i<=seedNum; i++) {
                promises.push(Grade.create(generateGradeData(true, restaurant.id)));
            }
        
            return Promise.all(promises);

        });
}

function seedRestaurantData() {
    const date = faker.date.recent();

    return Restaurant.create({
        name: faker.company.companyName(),
        borough: "Bronx",
        cuisine: 'Italian',
        addressBuildingNumber: faker.address.streetAddress(),
        addressStreet: faker.address.streetName(),
        addressZipcode: faker.address.zipCode(),
        createdAt: date,
        updatedAt: date
    });
}


describe('Grades API resource', function() {

    beforeEach(function() {
        return Grade
            .truncate({cascade: true})
            .then(() => seedData());
    });

    describe('GET endpoint', function() {
        it('should return a single grade by id', function() {
            let grade;
            return Grade
                .findOne()
                .then(_grade => {
                    grade = _grade;

                    return chai.request(app)
                        .get(`/grades/${grade.id}`)
                        .then(res => {
                            res.should.have.status(200);
                            res.body.should.include.keys('id', 'inspectionDate', 'grade', 'score');
                            res.body.id.should.equal(grade.id);
                            res.body.grade.should.equal(grade.grade);
                        });
                });
        });
    });

    describe('POST endpoint', function() {
        it('should add a new grade', function() {
            const newGradeData = generateGradeData();

            let restaurant;

            return Restaurant
                .findOne()
                .then(_restaurant => {
                    restaurant = _restaurant;
                    newGradeData.restaurantId = restaurant.id;

                    return chai.request(app)
                        .post('/grades')
                        .send(newGradeData)
                })
                .then(res => {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.an('object');
                    res.body.should.include.keys('id', 'grade', 'score', 'inspectionDate');
                    res.body.grade.should.equal(newGradeData.grade);

                    return Grade
                        .findById(res.body.id)
                })
                .then(grade => {
                    grade.grade.should.equal(newGradeData.grade);
                    grade.restaurant_id.should.equal(restaurant.id);
                });
        });
    });

    describe('PUT endpoint', function() {
        it('should update a grade', function() {
            
            const updateData = {
                grade: 'Z',
                score: 3000
            };

            return Grade
                .findOne()
                .then(grade => {
                    updateData.id = grade.id;
                    
                    return chai.request(app)
                        .put(`/grades/${grade.id}`)
                        .send(updateData)
                })
                .then(res => {
                    res.should.have.status(204);
                    
                    return Grade.findById(updateData.id)
                })
                .then(grade => {
                    grade.grade.should.equal(updateData.grade);
                    grade.score.should.equal(updateData.score);
                });
        });
    });

    describe("DELETE endpoint", function() {
        it('should delete grade', function() {
            let grade;

            return Grade.findOne()
                .then(_grade => {
                    grade = _grade;

                    return chai.request(app)
                        .delete(`/grades/${grade.id}`);
                })
                .then(res => {
                    res.should.have.status(204);

                    return Grade.findById(grade.id);
                })
                .then(grade => {
                    should.not.exist(grade);
                });
        });
    });
});