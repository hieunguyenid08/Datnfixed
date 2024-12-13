const Product = require('../../../Models/product')
const Detail_Order = require('../../../Models/detail_order')

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await Product.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;

    const products = await Product.find().populate('id_category');


    if (!keyWordSearch) {
        res.json({
            products: products.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = products.filter(value => {
            return value.name_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.price_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
            // value.id_category.category.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            products: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.create = async (req, res) => {
    try {
        // const products = await Product.find();

        const newProduct = new Product();
        req.body.name_product = req.body.name_product
            .toLowerCase()
            .replace(/^.|\s\S/g, a => a.toUpperCase());

        newProduct.name_product = req.body.name_product;
        newProduct.price_product = req.body.price_product;
        newProduct.id_category = req.body.category;
        newProduct.describe = req.body.description;
        newProduct.gender = req.body.gender;
        newProduct.image = req.body.image;
        newProduct.depository = req.body.depository;
        await newProduct.save();
        res.json({ msg: "Bạn đã thêm thành công" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Có lỗi xảy ra", error: error.message });
    }
};
// }

module.exports.delete = async (req, res) => {
    const id = req.query.id;

    await Product.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })
    
}

module.exports.details = async (req, res, next) => {
    try {
        // Kiểm tra nếu `id` là ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ." });
        }

        // Tìm sản phẩm theo ID
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm." });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error); // Chuyển lỗi sang middleware xử lý lỗi
    }
};

module.exports.update = async (req, res) => {
    console.log(req.body);
    // const product = await Product.find();

    // const productFilter = product.filter((c) => {
    //     return c.name_product.toUpperCase() === req.body.name_product.toUpperCase().trim() && c.id !== req.body.id
    // });

    // if (productFilter.length > 0) {
    //     res.json({ msg: 'Sản phẩm đã tồn tại' })
    // } else {
        req.body.name_product = req.body.name_product.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })


        // if (req.files) {
        //     var fileImage = req.files.file;

        //     var fileName = fileImage.name


        //     var fileProduct = "/img/" + fileName

        //     await Product.updateOne({ _id: req.body._id }, {
        //         name_product: req.body.name_product,
        //         price_product: req.body.price_product,
        //         id_category: req.body.id_category,
        //         // number: req.body.number,
        //         describe: req.body.description,
        //         gender: req.body.gender,
        //         image: fileProduct
        //     }, function (err, res) {
        //         if (err) return res.json({ msg: err });
        //     });
        //     res.json({ msg: "Bạn đã update thành công" })

        //     fileImage.mv('./public/img/' + fileName)
        // }
        // else {
            await Product.updateOne({ _id: req.body._id }, {
                name_product: req.body.name_product,
                price_product: req.body.price_product,
                id_category: req.body.category,
                image: req.body.image,
                // number: req.body.number,
                describe: req.body.description,
                gender: req.body.gender,
                depository:req.body.depository,
            }, function (err, res) {
                if (err) return res.json({ msg: err });
            });
            res.json({ msg: "Bạn đã update thành công" })
        }


    // }
// }


module.exports.updateDepository = async (req, res) => {
    try {
        // Bước 1: Lấy tất cả dữ liệu từ collection `Detail_Order` dựa trên `id_product`
        const detailOrders = await Detail_Order.find({ id_product: req.body._id });

        if (!detailOrders || detailOrders.length === 0) {
            return res.status(404).json({ msg: "Không tìm thấy chi tiết đơn hàng cho sản phẩm này" });
        }

        // Bước 2: Duyệt qua tất cả các đơn hàng từ cuối đến đầu để tính tổng `count` cần trừ
        let totalCountToSubtract = 0;

        // Duyệt ngược mảng với vòng lặp for
            totalCountToSubtract += detailOrders[detailOrders.length-1].count;

        console.log("Tổng số lượng cần trừ: ", totalCountToSubtract);

        // Bước 3: Lấy sản phẩm từ collection `Product` dựa trên `id_product`
        const product = await Product.findOne({ _id: req.body._id });

        if (!product) {
            return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
        }

        // Tính toán giá trị `depository` mới
        const newDepository = product.depository - totalCountToSubtract;

        // Bước 4: Cập nhật lại `depository` của sản phẩm
        await Product.updateOne({ _id: req.body._id }, { depository: newDepository });

        res.json({ msg: "Đã cập nhật thành công số lượng trong kho" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Có lỗi xảy ra khi cập nhật số lượng kho", error: error.message });
    }
};


