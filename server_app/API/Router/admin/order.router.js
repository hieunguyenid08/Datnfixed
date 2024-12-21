var express = require('express')

var router = express.Router()

const Order = require('../../Controller/admin/order.controller')

router.get('/', Order.index)

router.get('/detail/:id', Order.details)

router.get('/detailorder/:id', Order.detailOrder)

router.patch('/confirmorder', Order.confirmOrder)
router.patch('/cancelorder', Order.cancelOrder)
router.patch('/delivery', Order.delivery)
router.patch('/confirmdelivery', Order.confirmDelivery)
router.patch('/confirmreturndelivery', Order.confirmReturnOrder)
router.patch('/returnorder', Order.returnOrder)
router.patch('/paymentreturn', Order.paymentreturn)
router.patch('/paymentreturndate', Order.paymentreturndate)
router.get('/completeOrder', Order.completeOrder)
router.patch('/complete', Order.completeO)
module.exports = router