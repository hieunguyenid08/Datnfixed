var express = require('express')

var router = express.Router()

const userController = require('../Controller/user.controller')
const auth = require('../MiddleWare')

router.get('/', auth.verifyToken,userController.index)

router.get('/:id',auth.verifyToken,userController.user)

router.put('/', userController.update_user)

router.get('/detail/login', userController.detail)

router.post('/', userController.post_user)

// Route refresh token
router.post('/refresh-token', auth.verifyRefreshToken, userController.refreshToken)

// Route logout
router.post('/logout', auth.verifyToken, userController.logout)

module.exports = router