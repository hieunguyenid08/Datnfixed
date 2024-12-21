const Product = require('../../../Models/product')
const Detail_Order = require('../../../Models/detail_order')

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;
    const brandFilter = req.query.brand;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await Product.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;

    let products = await Product.find().populate('id_category');

    if (brandFilter) {
        products = products.filter(product => product.brand === brandFilter);
    }

    if (!keyWordSearch) {
        res.json({
            products: products.slice(start, end),
            totalPage: Math.ceil(products.length / perPage)
        })
    } else {
        var newData = products.filter(value => {
            return value.name_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.price_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                (value.brand && value.brand.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1)
        })

        res.json({
            products: newData.slice(start, end),
            totalPage: Math.ceil(newData.length / perPage)
        })
    }
}

module.exports.create = async (req, res) => {
    try {
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
        newProduct.brand = req.body.brand;
        await newProduct.save();
        res.json({ msg: "Bạn đã thêm thành công" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Có lỗi xảy ra", error: error.message });
    }
};

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
    try {
        // Lấy sản phẩm hiện tại
        const currentProduct = await Product.findById(req.body._id);
        if (!currentProduct) {
            return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
        }

        // Tạo object chứa các trường cần update
        const updateFields = {};
        
        // Chỉ cập nhật các trường có trong request
        if (req.body.name_product) updateFields.name_product = req.body.name_product;
        if (req.body.price_product) updateFields.price_product = req.body.price_product;
        if (req.body.category) updateFields.id_category = req.body.category;
        if (req.body.image) updateFields.image = req.body.image;
        if (req.body.description) updateFields.describe = req.body.description;
        if (req.body.gender) updateFields.gender = req.body.gender;
        if (req.body.depository) updateFields.depository = req.body.depository;
        if (req.body.brand) updateFields.brand = req.body.brand;

        // Thực hiện update với các trường đã được thay đổi
        await Product.updateOne(
            { _id: req.body._id }, 
            { $set: updateFields }
        );

        res.json({ msg: "Bạn đã update thành công" });
    } catch (error) {
        res.status(500).json({ msg: "Có lỗi xảy ra", error: error.message });
    }
};

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

        // Tính toán gi�� trị `depository` mới
        const newDepository = product.depository - totalCountToSubtract;

        // Bước 4: Cập nhật lại `depository` của sản phẩm
        await Product.updateOne({ _id: req.body._id }, { depository: newDepository });

        res.json({ msg: "Đã cập nhật thành công số lượng trong kho" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Có lỗi xảy ra khi cập nhật số lượng kho", error: error.message });
    }
};
module.exports.updateDepository1 = async (req, res) => {
    try {
        
        const { _id, count } = req.body; // Get both _id and count from request body
        // Bước 1: Lấy tất cả dữ liệu từ collection `Detail_Order` dựa trên `id_product`
        const detailOrders = await Detail_Order.find({ id_product: _id });

        if (!detailOrders || detailOrders.length === 0) {
            return res.status(404).json({ msg: "Không tìm thấy chi tiết đơn hàng cho sản phẩm này" });
        }

        

        // Bước 3: Lấy sản phẩm từ collection `Product` dựa trên `id_product`
        const product = await Product.findOne({ _id: _id });

        if (!product) {
            return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
        }

        // Tính toán gi�� trị `depository` mới
        const newDepository = product.depository + count;
        console.log("Điện thoại: ",product.name_product,"Số lượng mới: ",newDepository)
        // Bước 4: Cập nhật lại `depository` của sản phẩm
        await Product.updateOne({ _id: _id }, { depository: newDepository });

        res.json({ msg: "Đã cập nhật thành công số lượng trong kho" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Có lỗi xảy ra khi cập nhật số lượng kho", error: error.message });
    }
};



