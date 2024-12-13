import React, { useEffect, useState } from 'react';
import io from "socket.io-client";

import './Checkout.css'
import OrderAPI from '../API/OrderAPI';
import Paypal from './Paypal';
import { useForm } from "react-hook-form";
import { Redirect } from 'react-router-dom';
import { changeCount } from '../Redux/Action/ActionCount';
import { useDispatch, useSelector } from 'react-redux';
import NoteAPI from '../API/NoteAPI';
import Detail_OrderAPI from '../API/Detail_OrderAPI';
import CouponAPI from '../API/CouponAPI';
import MoMo from './MoMo.jsx'
import LogoMomo from './momo-png/momo_icon_square_pinkbg_RGB.png'
import Modal_Image from '../Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

const socket = io('https://dacn-231-t581.onrender.com', {
    transports: ['websocket'], jsonp: false
});
socket.connect();


function Checkout() {

    const [orderID, setOrderID] = useState('')

    const [carts, set_carts] = useState([])

    const [total_price, set_total_price] = useState(0)

    const [discount, set_discount] = useState(0)

    // state load_map
    const [load_map, set_load_map] = useState(true)

    // state load_order
    const [load_order_status, set_load_order_status] = useState(false)

    const [check_action, set_check_action] = useState(false)

    const [modalShow, setModalShow] = React.useState(false);

    useEffect(() => {

        if (check_action) {

            set_carts(JSON.parse(localStorage.getItem('carts')))
            set_carts(JSON.parse(localStorage.getItem('carts')))

            Sum_Price(JSON.parse(localStorage.getItem('carts')), 0)

            set_check_action(false)
        }

    }, [check_action])

    // Hàm này dùng để tính tổng tiền
    const [productId, setProductId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmitt = async (id) => {
        //e.preventDefault();
        setLoading(true);
        setMessage(''); // Reset message before the request

        try {
            // Gửi request đến API cập nhật kho
            const response = await axios.patch('http://localhost:8000/api/admin/product/updateDepository', {
                _id: id,
            });
            console.log(response);

            setMessage(response.data.msg); // Set message to show success
        } catch (error) {
            setMessage(error.response?.data?.msg || 'Có lỗi xảy ra'); // Show error message if any
        } finally {
            setLoading(false);
        }
    };
    function Sum_Price(carts, sum_price) {

        carts.map(value => {
            return sum_price += Number(value.count) * Number(value.price_product)
        })

        const total = Number(sum_price)

        if (localStorage.getItem('coupon')) {
            // GET localStorage
            const coupon = JSON.parse(localStorage.getItem('coupon'))

            set_discount((total * parseInt(coupon.promotion)) / 100)

            const newTotal = total - ((total * parseInt(coupon.promotion)) / 100) + Number(price)

            localStorage.setItem("total_price", newTotal)

            set_total_price(newTotal)
        } else {

            localStorage.setItem("total_price", total + Number(price))

            set_total_price(total + Number(price))

        }

    }

    const [show_error, set_show_error] = useState(false)

    const [information, set_information] = useState({
        fullname: '',
        phone: '',
        address: '',
        email: '',
    })

    const onChangeFullname = (e) => {
        set_information({
            fullname: e.target.value,
            phone: information.phone,
            address: information.address,
            email: information.email
        })
    }
    const onChangePhone = (e) => {
        set_information({
            fullname: information.fullname,
            phone: e.target.value,
            address: information.address,
            email: information.email
        })
    }

    const onChangeAddress = (e) => {
        set_information({
            fullname: information.fullname,
            phone: information.phone,
            address: e.target.value,
            email: information.email
        })
    }
    const onChangeEmail = (e) => {
        set_information({
            fullname: information.fullname,
            phone: information.phone,
            address: information.address,
            email: e.target.value
        })
    }

    // Hàm này dùng để check validation cho paypal
    useEffect(() => {

        checkValidation()

    }, [information])

    // Kiểm tra Paypal
    function checkValidation() {
        if (information.fullname === '') {
            set_show_error(true)
        } else {
            if (information.phone === '') {
                set_show_error(true)
            } else {
                if (information.email === '') {

                    set_show_error(true)
                } else {
                    localStorage.setItem('information', JSON.stringify(information))
                    set_show_error(false)
                }
            }
        }
    }


    const { register, handleSubmit, errors } = useForm();

    const [redirect, set_redirect] = useState(false)
    const [hide, set_Hide] = useState(false)


    const [load_order, set_load_order] = useState(false)

    const count_change = useSelector(state => state.Count.isLoad)

    const dispatch = useDispatch()

    // Hàm này dùng để thanh toán offline
    const handler_Checkout = async (data) => {     
        
        // set_load_order(true)

        if (localStorage.getItem("id_coupon")) {

            const responseUpdate = await CouponAPI.updateCoupon(localStorage.getItem("id_coupon"))
            console.log(responseUpdate)

        }

        // data Delivery
        const data_delivery = {
            // id_delivery:  Math.random.toString(),
            fullname: information.fullname,
            phone: information.phone,
        }

        // Xứ lý API Delivery
        const response_delivery = await NoteAPI.post_note(data_delivery)

        // data Order
        const data_order = {
            id_user: sessionStorage.getItem('id_user'),
            address: information.address,
            total: total_price,
            status: "1",
            pay: false,
            id_payment: '65a29a55c177c63bbf8109d2',
            id_note: response_delivery._id,
            feeship: price,
            id_coupon: localStorage.getItem('id_coupon') ? localStorage.getItem('id_coupon') : '',
            create_time: `${new Date().getDate()}/${parseInt(new Date().getMonth()) + 1}/${new Date().getFullYear()}`
        }

        // Xứ lý API Order
        const response_order = await OrderAPI.post_order(data_order)

        // data carts
        const data_carts = JSON.parse(localStorage.getItem('carts'))

        // Xử lý API Detail_Order
        for (let i = 0; i < data_carts.length; i++) {

            const data_detail_order = {
                id_order: response_order._id,
                id_product: data_carts[i].id_product,
                name_product: data_carts[i].name_product,
                price_product: data_carts[i].price_product,
                count: data_carts[i].count,
                size: data_carts[i].size
            }
            await Detail_OrderAPI.post_detail_order(data_detail_order)
            await handleSubmitt(data_carts[i].id_product);
        }

        // data email
        const data_email = {
            id_order: response_order._id,
            total: total_price,
            fullname: information.fullname,
            phone: information.phone,
            feeship: price,
            address: information.address,
            email: information.email,
            subtotal: total_price - price,
            data_carts: data_carts,
        }

        // Gửi socket lên server
        socket.emit('send_order', "Có người vừa đặt hàng");
        // Xử lý API Send Mail

        const send_mail = await OrderAPI.post_email(data_email)
        console.log(send_mail)



        localStorage.removeItem('information')
        localStorage.removeItem('total_price')
        localStorage.removeItem('price')
        localStorage.removeItem('id_coupon')
        localStorage.removeItem('coupon')
        localStorage.setItem('carts', JSON.stringify([]))

        set_redirect(true)


        // Hàm này dùng để load lại phần header bằng Redux
        const action_count_change = changeCount(count_change)
        dispatch(action_count_change)

    }


    const Change_Load_Order = (value) => {

        set_load_order(value)

    }



    //--------------- Xử lý Google API ------------------//



    const [error_address, set_error_address] = useState(false)

    const [from, set_from] = useState('268 Lý Thường Kiệt, Phường 14, District 10, Ho Chi Minh City, Vietnam')

    // Khoảng cách
    const [distance, set_distance] = useState('')

    // Thời gian đi trong bn phút
    const [duration, set_duration] = useState('')

    // Giá tiền
    const [price, set_price] = useState('')


    // Kiểm tra xem khách hàng đã nhập chỉ nhận hàng hay chưa
    const handler_Next = () => {

        // if (!information.address) {
        //     set_error_address(true)
        //     return
        // }

        // Sau khi mà đổ dữ liệu ở bên Jquery xong
        // thì qua bên này mình sẽ lấy những giá trị vừa xử lý

        const kilo = document.getElementById('in_kilo').innerHTML
        const duration_text = document.getElementById('duration_text').innerHTML
        const price_shipping = document.getElementById('price_shipping').innerHTML
        const to_places = document.getElementById('to_places').value

        console.log(kilo)
        console.log(duration_text)
        console.log(price_shipping)
        set_load_order_status(true)

        // set_distance(kilo)
        set_distance(1)
        // set_duration(duration_text)
        set_duration(1)

        // localStorage.setItem('price', price_shipping)
        localStorage.setItem('price', price_shipping)
        // set_price(price_shipping)
        set_price(price_shipping)

        set_information({
            fullname: information.fullname,
            phone: information.phone,
            address: to_places,
            email: information.email
        })
        if (kilo) {
            set_load_map(false)
            set_load_order_status(true) // Hiển thị phần checkout
            set_check_action(true)

        }

    }

    const handlerMomo = () => {

        setOrderID(Math.random().toString())
        console.log("Momo Thanh Cong")

    }

    return (
        <div>

            {
                load_order && (
                    <div className="wrapper_loader">
                        <div className="loader"></div>
                    </div>
                )
            }

            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><a href="index.html">Trang chủ</a></li>
                            <li className="active">Thanh toán</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>

                {
                    load_map && (
                        <div className="row">
                            <div className="col-lg-6 col-12 pb-5">
                                <div className="checkbox-form">
                                    <h3>THÔNG TIN GIAO HÀNG</h3>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="checkout-form-list">
                                                <label>Từ <span className="required">*</span></label>
                                                <input type="text" name="from"
                                                    id="from_places"
                                                    disabled="true"
                                                    value={from} />
                                                <input id="origin" name="origin" required="" type="hidden"
                                                    value={from} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="checkout-form-list">
                                                <label>Đến <span className="required">*</span></label>
                                                <input type="text"
                                                    id="to_places"
                                                    placeholder="Nhập địa chỉ"
                                                    value={information.address}
                                                    onChange={onChangeAddress} />
                                                {error_address && <span style={{ color: 'red' }}>* Address is required</span>}
                                                <input id="destination" name="destination" required="" type="hidden" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="checkout-form-list">
                                                <div className="form-group">
                                                    <label>
                                                        Phương thức vận chuyển
                                                    </label>
                                                    <select id="travel_mode" name="travel_mode">
                                                        <option value="Tiết kiệm ">
                                                            Tiết kiệm
                                                        </option>
                                                        <option value="Hỏa tốc">
                                                            Hỏa tốc
                                                        </option>
                                                        <option value="Tiêu chuẩn">
                                                            Tiêu chuẩn
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            {hide&&<div id="result" >
                                                <div>
                                                    <label htmlFor="Kilometers">Khoảng cách:</label>&nbsp;
                                                        <label id="in_kilo">5 km</label>
                                                </div>
                                                <div>
                                                    <label htmlFor="Duration">Thời gian: </label>&nbsp;
                                                        <label id="duration_text">15 phút</label>
                                                </div>
                                                <div>
                                                    <label htmlFor="Price">Phí giao hàng: </label>&nbsp;
                                                        <label id="price_shipping">30.000</label>
                                                        &nbsp;<label>VNĐ</label>
                                                </div>
                                            </div>}
                                        </div>
                                        <div className="col-md-12">
                                            <div className="order-button-payment">
                                                <input value="KIỂM TRA" style={{textAlign:'center'}} onClick={()=>set_Hide(true)} id="distance_form" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="d-flex justify-content-end">
                                                <div className="order-button-payment">
                                                    <input value="Tiếp theo" onClick={handler_Next} id="distance_next" type="submit" style={{ padding: '.4rem 1.6rem' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <MapIframeComponent/> */}
                            <div className="col-lg-6 col-12">
                                <div id="map" style={{ height: '700px', width: '700px' }}>
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d346.4392710449575!2d106.65763344142754!3d10.771971600261708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ec3c161a3fb%3A0xef77cd47a1cc691e!2sHo%20Chi%20Minh%20City%20University%20of%20Technology%20(HCMUT)!5e0!3m2!1sen!2sus!4v1699190219273!5m2!1sen!2sus" width="700" height="700" style={{ border: '0' }} allowfullscreen="" loading="lazy"></iframe>
                                </div>
                                {/* <iframe src="https://storage.googleapis.com/maps-solutions-2qm1w3hy9s/commutes/qop2/commutes.html"
  width="100%" height="100%"
  loading="lazy">
</iframe> */}



                            </div>


                        </div>
                    )

                }
                {
                    load_order_status && (
                        (
                            <div className="row">
                                <div className="col-lg-6 col-12 pb-5">
                                    <form onSubmit={handleSubmit(handler_Checkout)}>
                                        <div className="checkbox-form">
                                            <h3>Thông tin đơn hàng</h3>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="checkout-form-list">
                                                        <label>Họ và tên <span className="required">*</span></label>
                                                        <input placeholder="Ví dụ: Nguyễn Văn A" type="text" name="fullname"
                                                            ref={register({ required: true })}
                                                            value={information.fullname}
                                                            onChange={onChangeFullname} />
                                                        {errors.fullname && errors.fullname.type === "required" && <span style={{ color: 'red' }}>* Fullname is required</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="checkout-form-list">
                                                        <label>Số điện thoại <span className="required">*</span></label>
                                                        <input placeholder="123456..." type="text" name="phone"
                                                            ref={register({ required: true })}
                                                            value={information.phone}
                                                            onChange={onChangePhone} />
                                                        {errors.phone && errors.phone.type === "required" && <span style={{ color: 'red' }}>* Phone Number is required</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="checkout-form-list">
                                                        <label>Địa chỉ <span className="required">*</span></label>
                                                        <input placeholder="Quận 10, Thành phố Hồ Chí Minh" type="text" name="address"
                                                            ref={register({ required: true })}
                                                            value={information.address}
                                                            onChange={onChangeAddress}
                                                            disabled
                                                        />
                                                        {errors.address && errors.address.type === "required" && <span style={{ color: 'red' }}>* Address is required</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="checkout-form-list">
                                                        <label>Email <span className="required">*</span></label>
                                                        <input placeholder="sample@gmail.com" type="email" name="email"
                                                            ref={register({ required: true })}
                                                            value={information.email}
                                                            onChange={onChangeEmail} />
                                                        {errors.email && errors.email.type === "required" && <span style={{ color: 'red' }}>* Email is required</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="order-button-payment">
                                                        {
                                                            redirect && <Redirect to="/success" />
                                                        }
                                                        <input value="Tiền mặt" type="submit" />                                                       
                                                    </div>                                                   
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-lg-6 col-12">
                                    <div className="your-order">
                                        <h3>Đơn hàng</h3>
                                        <div className="your-order-table table-responsive">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th className="cart-product-name">Sản phẩm</th>
                                                        <th className="cart-product-total">Tổng cộng</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        carts && carts.map(value => (
                                                            <tr className="cart_item" key={value._id}>
                                                                <td className="cart-product-name">{value.name_product}<strong className="product-quantity"> × {value.count}</strong></td>
                                                                <td className="cart-product-total"><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(parseInt(value.price_product) * parseInt(value.count)) + ' VNĐ'}</span></td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                                <tfoot>
                                                    <tr className="cart-subtotal">
                                                        <th>Phí giao hàng</th>
                                                        <td><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(price) + ' VNĐ'}</span></td>
                                                    </tr>
                                                    <tr className="cart-subtotal">
                                                        <th>Giảm giá</th>
                                                        <td><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(discount) + ' VNĐ'}</span></td>
                                                    </tr>
                                                    <tr className="order-total">
                                                        <th>Tổng hóa đơn</th>
                                                        <td><strong><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(total_price) + ' VNĐ'}</span></strong></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <div className="payment-method">
                                            <div className="payment-accordion">
                                                <div id="accordion">
                                                    <div className="card">
                                                        <div className="card-header" id="#payment-3">
                                                            <h5 className="panel-title">
                                                                <a className="collapsed" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                                                    PayPal
                                                                </a>
                                                            </h5>
                                                        </div>
                                                        <div>
                                                            <div className="card-body">
                                                                {
                                                                    show_error ? 'Vui lòng kiểm tra thông tin!' :
                                                                        <Paypal
                                                                            information={information}
                                                                            total={total_price}
                                                                            Change_Load_Order={Change_Load_Order}
                                                                            from={from}
                                                                            distance={distance}
                                                                            duration={duration}
                                                                            price={price}
                                                                        />
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="card">
                                                        <div className="card-header" id="#payment-3">
                                                            <h5 className="panel-title">
                                                                <a className="collapsed" data-toggle="collapse" data-target="#collapseMomo" aria-expanded="true" aria-controls="collapseMomo">
                                                                    MoMo
                                                                </a>
                                                            </h5>
                                                        </div>
                                                        <div>
                                                            <div className="card-body">
                                                                {
                                                                    show_error ? 'Vui lòng kiểm tra thông tin!' :
                                                                        <div>
                                                                            <img src={LogoMomo} width="100" onClick={handlerMomo}
                                                                                style={{ cursor: 'pointer' }} />
                                                                            <MoMo
                                                                                orderID={orderID}
                                                                                total={total_price}
                                                                            />
                                                                        </div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>


                                                    {/* <div className="card" style={{ marginTop: 10 }}>
                                                        <div className="card-header" id="#payment-3">
                                                            <h5 className="panel-title">
                                                                <a className="collapsed" data-toggle="collapse" data-target="#collapseMomo" aria-expanded="true" aria-controls="collapseMomo">
                                                                    QR
                                                                </a>
                                                            </h5>
                                                        </div>
                                                        <div>
                                                            <div className="card-body">
                                                                {
                                                                    show_error ? 'Vui lòng kiểm tra thông tin!' :
                                                                        <div onClick={() => Modal_Image}>
                                                                            { <img src={LogoQR} width="100" onClick={handlerMomo}
                                                                    style={{ cursor: 'pointer' }} />
                                                                    <MoMo 
                                                                        orderID={orderID}
                                                                        total={total_price}
                                                                        />}

                                                                            <Button variant="primary" onClick={() => setModalShow(true)}>
                                                                                Thanh toán QR
                                                                            </Button>

                                                                            <Modal_Image
                                                                                show={modalShow}
                                                                                onHide={() => setModalShow(false)}
                                                                            />

                                                                        </div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                    {/* 
                                                <div className="card">                
                                                <div className="card-header" id="#payment-3">
                                                        <h5 className="panel-title">
                                                            <a className="collapsed" data-toggle="collapse" data-target="#collapseMomo" aria-expanded="false" aria-controls="collapseMomo">
                                                                MoMo
                                                        </a>
                                                        </h5>
                                                    </div>
                                                    <div id="collapseMomo" className="collapse">
                                                        <div className="card-body">
                                                            {
                                                                show_error ? 'Please Checking Information!' :
                                                                <div>
                                                                    <img src={LogoMomo} width="100" onClick={handlerMomo}
                                                                    style={{ cursor: 'pointer' }} />
                                                                    <MoMo 
                                                                        orderID={orderID}
                                                                        total={total_price}
                                                                        />
                                                                </div>  
                                                            }
                                                        </div>
                                                    </div>
                                                </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )
                }
            </div>
        </div>

    );
}

export default Checkout;