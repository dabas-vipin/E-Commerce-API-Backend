const {  getAllUsers,
     getSingleUser,
     showCurrentUser,
     updateUser,
     updateUserPassword,
} = require('../controllers/userController')

// authentication middleware
const {
     authenticateUser,
     authorizePermissons
}= require('../middleware/authentication')

const express  = require('express')
const router = express.Router()

router.route('/').get(authenticateUser,authorizePermissons('admin','owner','qa'),getAllUsers)

router.route('/updateUser').patch(authenticateUser,updateUser)
router.route('/updateUserPassword').patch(authenticateUser,updateUserPassword)
router.route('/showMe').get(authenticateUser,showCurrentUser)

router.route('/:id').get(authenticateUser,getSingleUser)

module.exports = router
