const express = require('express');
const router = express.Router();

const {Grade} = require('../models');


router.get('/:id', (req, res) => Grade.findById(req.params.id)
    .then(grade => res.json(grade.apiRepr()))
);

router.post('/', (req, res) => {
    const requiredFields = ['grade', 'restaurantId'];
    for(let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }

        return Grade
            .create({
                restaurant_id: req.body.restaurantId,
                grade: req.body.grade,
                score: req.body.score,
                inspectionDate: Date.now()
                
            })
            .then(grade => res.status(201).json(grade.apiRepr()))
            .catch(err => res.status(500).send({message: err.message}));
    }
});

router.put('/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
        const message = (
            `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);
            console.error(message);
            res.status(400).json({message});
         }

         const toUpdate = {};
         const updateableFields = ['score', 'grade', 'inspectionDate', 'restaurantId'];

         updateableFields.forEach(field => {
             if (field in req.body) {
                 toUpdate[field] = req.body[field];
             }
         });

         return Grade
            .update(toUpdate, {
                where: {
                    id: req.params.id
                }
            })
            .then(() => res.status(204).end())
            .catch(err => res.status(500).json({message: 'Internal server error'}));

    });


    router.delete('/:id', (req, res) => {
        return Grade
            .destroy({
                where: {
                    id: req.params.id
                }
            })
            .then(grade => res.status(204).end())
            .catch(err => res.status(500).json({message: 'Internal server error'}));
    });

module.exports = router;