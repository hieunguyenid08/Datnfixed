const Coupon = require('../../../Models/coupon');
const Order = require('../../../Models/order');

module.exports.index = async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await Coupon.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;

    const coupon = await Coupon.find();
    console.log(coupon);
    if (!keyWordSearch) {
        res.json({
            coupons: coupon.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = coupon.filter(value => {
            return value.code.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.promotion.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            coupons: newData.slice(start, end),
            totalPage: totalPage
        })
    }

}

module.exports.create = async (req, res) => {

    await Coupon.create(req.body)

    res.json({ msg: "Bạn đã thêm thành công"})

}

module.exports.update = async (req, res) => {

    const id = req.params.id

    const coupon = await Coupon.findOne({ _id: id })

    coupon.code = req.body.code
    coupon.count = req.body.count
    coupon.promotion = req.body.promotion
    coupon.describe = req.body.describe
    coupon.start = req.body.start
    coupon.end = req.body.end
    coupon.status = req.body.status


    coupon.save()

    res.json({ msg: "Bạn đã cập nhật thành công"})

}

module.exports.delete = async (req, res) => {

    const id = req.params.id

    await Coupon.deleteOne({ _id: id })

    res.json("Thanh Cong")

}

module.exports.detail = async (req, res) => {

    const id = req.params.id

    const coupon = await Coupon.findOne({ _id: id })

    res.json(coupon)

}

module.exports.checking = async (req, res) => {

    const code = req.query.code

    const id_user = req.query.id_user

    const coupon = await Coupon.findOne({ code })

    if (!coupon){
        res.json({ msg: "Không tìm thấy" })
    }

    const checkCoupon = await Order.findOne({ id_user: id_user, id_coupon: coupon._id })

    if (checkCoupon){
        res.json({ msg: "Bạn đã sử dụng mã này rồi"})
    }

    res.json({ msg: "Thành công", coupon: coupon })

}

module.exports.createCoupon = async (req, res) => {

    const id = req.params.id

    const coupon = await Coupon.findOne({ _id: id })

    coupon.count = parseInt(coupon.count) - 1

    coupon.save()

    res.json("Thanh Cong")

}



// Coupon fxied
// const Coupons = require('../../../Models/coupon')

// module.exports = {
//     index: async (req, res) => {
//         try {
//             const coupons = await Coupons.find()
//             res.json(coupons)
//         } catch (err) {
//             return res.status(500).json({ msg: err.message })
//         }
//     },

//     detail: async (req, res) => {
//         try {
//             const coupon = await Coupons.findById(req.params.id)
//             if (!coupon) return res.status(404).json({ msg: "Không tìm thấy coupon" })
//             res.json(coupon)
//         } catch (err) {
//             return res.status(500).json({ msg: err.message })
//         }
//     },

//     create: async (req, res) => {
//         try {
//             const newCoupon = new Coupons(req.body)
//             await newCoupon.save()
//             res.json({ msg: "Tạo coupon thành công" })
//         } catch (err) {
//             return res.status(500).json({ msg: err.message })
//         }
//     },

//     update: async (req, res) => {
//         try {
//             await Coupons.findByIdAndUpdate(req.params.id, req.body)
//             res.json({ msg: "Cập nhật coupon thành công" })
//         } catch (err) {
//             return res.status(500).json({ msg: err.message })
//         }
//     },

//     delete: async (req, res) => {
//         try {
//             await Coupons.findByIdAndDelete(req.params.id)
//             res.json({ msg: "Xóa coupon thành công" })
//         } catch (err) {
//             return res.status(500).json({ msg: err.message })
//         }
//     },

//     checking: async (req, res) => {
//         try {
//             const coupon = await Coupons.findOne({ code: req.query.code })
//             if (!coupon) return res.status(404).json({ msg: "Mã không hợp lệ" })
//             res.json(coupon)
//         } catch (err) {
//             return res.status(500).json({ msg: err.message })
//         }
//     },

//     createCoupon: async (req, res) => {
//         try {
//             const coupon = await Coupons.findById(req.params.id)
//             if (!coupon) return res.status(404).json({ msg: "Không tìm thấy coupon" })

//             coupon.count += 1
//             await coupon.save()

//             res.json({ msg: "Sử dụng coupon thành công" })
//         } catch (err) {
//             return res.status(500).json({ msg: err.message })
//         }
//     }}