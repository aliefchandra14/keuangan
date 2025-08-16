const express = require('express');
const router = express.Router();
const { createGoal, deleteGoal, createRecord, deleteRecord, deleteOutcome, createOutcome, getAll, getGoals, getRecords, getOutcomes } = require('../controllers/DashboardControllers');


router.route('/').get(getAll);
router.route('/goal').get(getGoals).post(createGoal).delete(deleteGoal);
router.route('/goal/:id').delete(deleteGoal);
router.route('/record').get(getRecords).post(createRecord).delete(deleteRecord);
router.route('/record/:id').delete(deleteRecord);
router.route('/outcome').get(getOutcomes).post(createOutcome).delete(deleteOutcome);
router.route('/outcome/:id').delete(deleteOutcome);

module.exports = router;