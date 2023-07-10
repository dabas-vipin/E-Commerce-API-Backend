
const express = require('express')
const router = express.Router()

const {
     login,
     logout,
     register,
} = require('../controllers/authController')


router.post('/register',register)
router.route('/login').post(login)
router.route('/logout').get(logout)

module.exports = router