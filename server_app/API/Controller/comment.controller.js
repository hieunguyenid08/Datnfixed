const Comment = require('../../Models/comment')
const Users = require('../../Models/user')

// Gọi API hiện thị list comment của sản phẩm 
// Phương thức GET
module.exports.index = async (req, res) => {

    const id_product = req.params.id

    const comment_product = await Comment.find({ id_product: id_product }).populate('id_user').populate('id_product') // thêm populate cho id_product

    res.json(comment_product)

}

// Gửi comment
// Phương Thức Post
module.exports.post_comment = async (req, res) => {

    const id_product = req.params.id


    const data = {
        id_product: id_product,
        id_user: req.body.id_user,
        content: req.body.content,
        star: req.body.star,
        status: req.body.status
    }

    await Comment.create(data)

    res.send('Thanh Cong')

}
module.exports.detail = async (req, res) => {

    const id = req.params.id

    const product = await Comment.find({ }).populate('id_user')



    res.json(product)

}
module.exports.post_order = async (req, res) => {

    const order = await Order.create(req.body)

    res.json(order)

}
module.exports.confirmCheck = async (req, res) => {
    try {
        await Comment.updateOne(
            { _id: req.query.id}, 
            { status: "2" }
        );
        res.json({ msg: "Thanh Cong" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}