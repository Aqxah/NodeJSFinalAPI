const express = require('express');
const router = express.Router();
const verifyStates = require('../../middleware/verifyStates');
const statesController = require('../../controllers/statesController');

// GET endpoints
router.get('/', statesController.getAllStates);
router.get('/:state', statesController.getStateByCode);
router.get('/:state/funfact', statesController.getRandomFunFact);
router.get('/:state/capital', statesController.getStateCapital);
router.get('/:state/nickname', statesController.getStateNickname);
router.get('/:state/population', statesController.getStatePopulation);
router.get('/:state/admission', statesController.getStateAdmission);

// POST endpoint for adding fun facts
router.post('/:state/funfact', statesController.addFunfacts);

// PATCH endpoint for updating fun facts
router.patch('/:state/funfact', statesController.updateFunFact);

// DELETE endpoint for removing fun facts
router.delete('/:state/funfact', statesController.deleteFunFact);

module.exports = router;