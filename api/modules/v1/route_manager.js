const express = require('express')
const router = express.Router()
const middleware = require('../../middleware/validation')

const service = require('./Service/route')
const user = require('./User/route')
const picker = require('./Picker/route')
const driver = require('./Driver/route')


// AUTHENTICATION
router.use('/', middleware.extHeaderLang);
router.use('/', middleware.validateApikey);
router.use('/', middleware.validateHeaderToken);

// MAIN ROUTES
router.use('/api/v1/service', service)
router.use('/api/v1/user', user)
router.use('/api/v1/picker', picker)
router.use('/api/v1/driver', driver)


module.exports = router