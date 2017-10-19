const router = require('express').Router();
const controller = require('./controllers');

router.get('/generate', controller.recs.get);

module.exports = router;
