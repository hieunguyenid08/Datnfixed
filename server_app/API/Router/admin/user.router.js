var express = require('express')

var router = express.Router()

const User = require('../../Controller/admin/user.controller')
const MiddleWare = require('../../MiddleWare')

router.get('/', User.index)
router.get('/:id', MiddleWare.verifyToken, User.details)

router.post('/create', User.create)

router.post('/login', User.login)

router.patch('/update', User.update)

router.delete('/delete', User.delete)

router.post('/refreshToken', User.refreshToken)
module.exports = router