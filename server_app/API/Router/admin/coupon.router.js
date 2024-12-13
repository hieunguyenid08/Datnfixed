var express = require('express')

var router = express.Router()

const Coupon = require('../../Controller/admin/coupon.controller')
const MiddleWare = require('../../MiddleWare');
router.get('/', MiddleWare.verifyToken, Coupon.index)

router.get('/:id', Coupon.detail)

router.post('/', Coupon.create)

router.patch('/:id', Coupon.update)


router.delete('/:id', Coupon.delete)

router.get('/promotion/checking', Coupon.checking) //done

router.patch('/promotion/:id', Coupon.createCoupon)

module.exports = router