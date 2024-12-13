const Category = require('../../../Models/category')
const Product = require('../../../Models/product')

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await Category.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;

    const categories = await Category.find();


    if (!keyWordSearch) {
        res.json({
            categories: categories.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = categories.filter(value => {
            return value.category.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            categories: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.create = async (req, res, next) => {
    try {
        const { name } = req.query;

        // Kiểm tra nếu `name` không tồn tại hoặc rỗng
        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, message: "Tên loại không được để trống." });
        }

        // Lấy danh sách các loại từ cơ sở dữ liệu
        const categories = await Category.find();

        // Kiểm tra loại đã tồn tại hay chưa
        const categoryExists = categories.some(
            (c) => c.category.toUpperCase() === name.toUpperCase().trim()
        );

        if (categoryExists) {
            return res.status(400).json({ success: false, message: "Loại đã tồn tại." });
        }

        // Tạo một loại mới
        const newCategory = new Category();
        newCategory.category = name
            .toLowerCase()
            .replace(/^.|\s\S/g, (a) => a.toUpperCase());

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Bạn đã thêm thành công loại mới.",
            data: newCategory,
        });
    } catch (error) {
        next(error); // Gửi lỗi sang middleware xử lý lỗi
    }
};


module.exports.delete = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, message: "Thiếu ID cần xóa." });
        }

        const result = await Category.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục cần xóa." });
        }

        res.json({ success: true, message: "Xóa danh mục thành công." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
    }
};



module.exports.detailProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.limit) || 8;
        const keyWordSearch = req.query.search || "";

        const category = await Category.findOne({ category: req.params.id });

        if (!category) {
            return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
        }

        const products = await Product.find({ id_category: category._id }).populate('id_category');

        const filteredProducts = keyWordSearch
            ? products.filter((product) =>
                  product.name_product.toUpperCase().includes(keyWordSearch.toUpperCase()) ||
                  product.price_product.toString().includes(keyWordSearch)
              )
            : products;

        const totalPage = Math.ceil(filteredProducts.length / perPage);
        const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

        res.json({
            success: true,
            products: paginatedProducts,
            totalPage: totalPage,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
    }
};


module.exports.update = async (req, res) => {
    try {
        const { id, name } = req.query;

        if (!id || !name) {
            return res.status(400).json({ success: false, message: "Thiếu ID hoặc tên danh mục cần cập nhật." });
        }

        const categoryExists = await Category.findOne({
            category: new RegExp(`^${name.trim()}$`, "i"),
            _id: { $ne: id },
        });

        if (categoryExists) {
            return res.status(400).json({ success: false, message: "Tên danh mục đã tồn tại." });
        }

        const updatedCategory = await Category.updateOne(
            { _id: id },
            { category: name.toLowerCase().replace(/^.|\s\S/g, (char) => char.toUpperCase()) }
        );

        if (updatedCategory.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
        }

        res.json({ success: true, message: "Cập nhật danh mục thành công." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
    }
};


module.exports.detail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Thiếu ID danh mục." });
        }

        const category = await Category.findOne({ _id: id });

        if (!category) {
            return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
        }

        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
    }
};


// module.exports.getCategoryItemCount = async (req, res) => {
//     try {
//         const categories = await Category.find();
//         const categoryIds = categories.map(category => category._id);

//         const categoryItemCount = await Product.aggregate([
//             {
//                 $match: {
//                     id_category: { $in: categoryIds }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$id_category",
//                     itemCount: { $sum: 1 }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "category"
//                 }
//             },
//             {
//                 $unwind: "$category"
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     category: "$category.category",
//                     itemCount: 1
//                 }
//             }
//         ]);

//         res.json(categoryItemCount);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ msg: 'Có lỗi xảy ra trong quá trình lấy số lượng sản phẩm theo loại', error: err });
//     }
// };