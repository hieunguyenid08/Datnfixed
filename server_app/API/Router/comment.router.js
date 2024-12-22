var express = require('express')

var router = express.Router()

const Comment = require('../Controller/comment.controller')

router.get('/:id', Comment.index)

router.post('/:id', Comment.post_comment)
router.get('/', Comment.detail)
router.patch('/confirmCheck', Comment.confirmCheck)

module.exports = router