const Products = require('../../Models/product')
const Category = require('../../Models/category')
const Comment = require('../../Models/comment')
const Sale = require('../../Models/sale')


module.exports.index = async (req, res) => {

    const products = await Products.find().populate('id_category')

    res.json(products)
}


module.exports.gender = async (req, res) => {

    const gender = req.body.gender

    const category = await Category.find({ gender: gender })

    res.json(category)

}

//TH: Hàm này dùng để phân loại sản phẩm
module.exports.category = async (req, res) => {

    const id_category = req.query.id_category

    let products_category

    if (id_category === 'all'){
        products_category = await Products.find()
    }else{
        products_category = await Products.find({ id_category: id_category })
    }
    
    res.json(products_category)
}

//TH: Chi Tiết Sản Phẩm
module.exports.detail = async (req, res) => {

    const id = req.params.id

    const product = await Products.findOne({ _id: id })

    res.json(product)

}


// QT: Tìm kiếm phân loại và phân trang sản phẩm
module.exports.pagination = async (req, res) => {

    const page = parseInt(req.query.page) || 1
    const numberProduct = parseInt(req.query.count) || 1
    const keyWordSearch = req.query.search
    const category = req.query.category
    const sort = req.query.sort
    const brandFilter = req.query.brand

    var start = (page - 1) * numberProduct
    var end = page * numberProduct

    var products

    if (category === 'all'){
        products = await Products.find()
    } else {
        products = await Products.find({ id_category: category })
    }

    if (brandFilter) {
        products = products.filter(product => product.brand === brandFilter)
    }

    // Lấy tất cả khuyến mãi đang active
    const activeSales = await Sale.find({ status: true })

    // Lấy rating và tính giá sau khuyến mãi cho mỗi sản phẩm
    const productsWithRatingsAndPrice = await Promise.all(products.map(async (product) => {
        // Lấy rating
        const comments = await Comment.find({ id_product: product._id })
        const rating = comments.length > 0 
            ? comments.reduce((sum, comment) => sum + comment.star, 0) / comments.length 
            : 0

        // Tìm khuyến mãi cho sản phẩm
        const sale = activeSales.find(s => s.id_product.toString() === product._id.toString())
        
        // Tính giá sau khuyến mãi
        const finalPrice = sale 
            ? product.price_product - (product.price_product * sale.promotion / 100)
            : product.price_product

        return {
            ...product._doc,
            rating,
            finalPrice
        }
    }))

    // Sắp xếp sản phẩm theo tiêu chí
    switch(sort) {
        case 'rating':
            productsWithRatingsAndPrice.sort((a, b) => b.rating - a.rating)
            break
        case 'price_asc':
            productsWithRatingsAndPrice.sort((a, b) => a.finalPrice - b.finalPrice)
            break
        case 'price_desc':
            productsWithRatingsAndPrice.sort((a, b) => b.finalPrice - a.finalPrice)
            break
    }

    var paginationProducts = productsWithRatingsAndPrice.slice(start, end)

    if (!keyWordSearch){
        res.json(paginationProducts)
    } else {
        var newData = paginationProducts.filter(value => {
            return value.name_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
            value.finalPrice.toString().toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
            (value.brand && value.brand.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1)
        })
        res.json(newData)
    }

}

// Hàm này dùng để hiện những sản phẩm search theo scoll ở component tìm kiếm bên client
module.exports.scoll = async (req, res) => {

    const page = req.query.page
    
    const count = req.query.count

    const search = req.query.search

    //Lấy sản phẩm đầu và sẩn phẩm cuối
    const start = (page - 1) * count
    const end = page * count   

    const products = await Products.find().populate('id_category')

    // const newData = products.filter(value => {
    //     return value.name_product.toUpperCase().indexOf(search.toUpperCase()) !== -1
    // })
    const new_data = products.filter(value => {
        // const nameMatch = value?.name_product?.toUpperCase().indexOf(keyword_search.toUpperCase()) !== -1;
        // const categoryMatch = value?.id_category?.category?.toUpperCase().indexOf(keyword_search.toUpperCase()) !== -1;

        // Get product name and search term, handling null/undefined cases
        const productName = (value?.name_product || '').toUpperCase();
        const productCategory = (value?.id_category?.category || '').toUpperCase();
        const searchTerms = search.toUpperCase().trim().split(/\s+/);
         // Check if ALL search terms are found in either the product name OR category
        return searchTerms.every(term => 
            productName.includes(term) || productCategory.includes(term)
        );
    })

    const paginationProducts = new_data.slice(start, end)

    res.json(paginationProducts)

}
