
const mailer = require('../../mailer')
const crypto = require('crypto')

const Order = require('../../Models/order')
const Detail_Order = require('../../Models/detail_order')
const Note = require('../../Models/note')

// Đặt hàng
module.exports.post_order = async (req, res) => {

    const order = await Order.create(req.body)

    res.json(order)

}

module.exports.send_mail = async (req, res) => {

    // const carts = await Detail_Order.find({ id_order: req.body.id_order }).populate('id_product')

    //B3: Bắt đầu gửi Mail xác nhận đơn hàng
    // const htmlHead = '<table style="width:50%">' +
    //     '<tr style="border: 1px solid black;"><th style="border: 1px solid black;">Tên Sản Phẩm</th><th style="border: 1px solid black;">Hình Ảnh</th><th style="border: 1px solid black;">Giá</th><th style="border: 1px solid black;">Số Lượng</th><th style="border: 1px solid black;">Size</th><th style="border: 1px solid black;">Thành Tiền</th>'

    // let htmlContent = ""

    // for (let i = 0; i < carts.length; i++) {
    //     htmlContent += '<tr>' +
    //         '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].id_product.name_product + '</td>' +
    //         '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;"><img src="' + carts[i].id_product.image + '" width="80" height="80"></td>' +
    //         '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].id_product.price_product + '$</td>' +
    //         '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].count + '</td>' +
    //         '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].size + '</td>' +
    //         '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + (parseInt(carts[i].id_product.price_product) * parseInt(carts[i].count)) + '$</td>' +
    //         '<tr>'
    // }

    // const htmlResult = '<h1>Xin Chào ' + req.body.fullname + '</h1>' + '<h3>Phone: ' + req.body.phone + '</h3>' + '<h3>Address:' + req.body.address + '</h3>' +
    //     htmlHead + htmlContent + '<h1>Phí Vận Chuyển: ' + req.body.price + '$</h1></br>' + '<h1>Tổng Thanh Toán: ' + req.body.total + '$</h1></br>' + '<p>Cảm ơn bạn!</p>'

    const baseURL = 'http://localhost:3000'
    const htmlResult = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            img {
                max-width: 50px;
                max-height: 50px;
            }
        </style>
    </head>
    <body>
        <h2>Order Invoice</h2>
    
        <!-- Customer Information -->
        <p>Customer Name: ${req.body.fullname}</p>
        <p>Phone Number: ${req.body.phone}</p>
        <p>Order ID: ${req.body.id_order}</p>
        <p>Thank you for your order! Below is the invoice for your recent purchase:</p>
    
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>

            ${req.body.data_carts.map((data) => `
            <tr>
                <td><a href="${baseURL}/detail/${data.id_product}">${data.name_product}</a></td>
                <td><img src="${data.image}" alt="${data.name_product}"></td>
                <td>${new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(data.price_product) + ' VNĐ'}</td>
                <td>${data.count}</td>
                <td>${new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(parseInt(data.price_product) * parseInt(data.count)) + ' VNĐ'}</td>
            </tr>
        `).join('')}
        
                
                <!-- Subtotal -->
                <tr>
                    <td colspan="4" style="text-align: right;">Subtotal</td>
                    <td>${new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(req.body.subtotal) + ' VNĐ'}</td>
                </tr>
    
                <!-- Shipping Fee -->
                <tr>
                    <td colspan="4" style="text-align: right;">Shipping Fee</td>
                    <td>${new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(req.body.feeship) + ' VNĐ'}</td>
                </tr>
    
                <!-- Total Amount -->
                <tr>
                    <td colspan="4" style="text-align: right; font-weight: bold;">Total Amount</td>
                    <td style="font-weight: bold;">${new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(req.body.total) + ' VNĐ'}</td>
                </tr>
            </tbody>
        </table>
        <p>View order details: <a href="${baseURL}/history/${req.body.id_order}">Here</a></p>
    
        <p>Thank you for choosing our products. If you have any questions, please contact us.</p>
        <ul style="list-style:none;margin:0px;padding:0px">
        <li>
            <span>Phone: </span>
            <a href="tel:0366889853">0366889853</a>
        </li>
        <li>
            <span>Email: </span>
            <a href="mailto://huy.phamkhmtjapan@hcmut.edu.vn">huy.phamkhmtjapan@hcmut.edu.vn</a>
        </li>
    </ul>
    </body>
    </html>
    
    `
    // Thực hiện gửi email (to, subject, htmlContent)
    await mailer.sendMail(req.body.email, 'Hóa Đơn Đặt Hàng', htmlResult)

    res.send("Gui Email Thanh Cong")

}

module.exports.get_order = async (req, res) => {

    const id_user = req.params.id

    const order = await Order.find({ id_user }).populate(['id_user', 'id_note'])

    res.json(order)

}

module.exports.get_detail = async (req, res) => {

    const id_order = req.params.id

    const order = await Order.findOne({ _id: id_order }).populate(['id_user', 'id_note', 'id_payment'])

    res.json(order)

}

module.exports.post_momo = async (req, res) => {

    const serectkey = "uLb683H8g9dWuiyipZbLHgO6zjSDlVm5"
    const accessKey = req.body.accessKey
    const amount = req.body.amount
    const extraData = req.body.extraData
    const errorCode = req.body.errorCode
    const localMessage = req.body.localMessage
    const message = req.body.message
    const orderId = req.body.orderId
    const orderInfo = req.body.orderInfo
    const orderType = req.body.orderType
    const partnerCode = req.body.partnerCode
    const payType = req.body.payType
    const requestId = req.body.requestId
    const responseTime = req.body.responseTime
    const transId = req.body.transId

    let param = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&message=${message}&localMessage=${localMessage}&responseTime=${responseTime}&errorCode=${errorCode}&payType=${payType}&extraData=${extraData}`

    var signature = crypto.createHmac('sha256', serectkey)
        .update(param)
        .digest('hex');

    if (req.body.signature !== signature) {
        res.send("Thông tin request không hợp lệ")
        return;
    }
    if (errorCode == 0) {
        res.send("Thanh Cong")
    } else {
        res.send("Thanh toán thất bại")
    }

}













































// module.exports.post_paypal = async (req, res) => {

//     var create_payment_json = {
//         "intent": "authorize",
//         "payer": {
//             "payment_method": "paypal"
//         },
//         "redirect_urls": {
//             "return_url": "http://localhost:3000/success",
//             "cancel_url": "http://localhost:3000/fail"
//         },
//         "transactions": [{
//             "item_list": {
//                 "items": [{
//                     "name": "item", // Tên sản phẩm
//                     "sku": "item", // mã sản phẩm
//                     "price": "1.00", // giá tiền
//                     "currency": "USD",
//                     "quantity": 1 // số lượng
//                 }]
//             },
//             "amount": {
//                 "currency": "USD",
//                 "total": "1.00" // tổng số tiền phụ thuộc vào mình code
//             },
//             "description": "This is the payment description."
//         }]
//     };

//     paypal.payment.create(create_payment_json, function (error, payment) {
//         if (error) {
//             console.log(error.response);
//             throw error;
//         } else {
//             for (var index = 0; index < payment.links.length; index++) {
//             //Redirect user to this endpoint for redirect url
//                 if (payment.links[index].rel === 'approval_url') {
//                     console.log(payment.links[index].href);
//                 }
//             }
//             console.log(payment);
//         }
//     });

//     res.send("Thanh Cong")

// }