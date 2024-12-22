import React, { useState, useEffect } from 'react';
import crypto from 'crypto'
import { useDispatch, useSelector } from 'react-redux';
import { changeCount } from '../Redux/Action/ActionCount';
import CouponAPI from '../API/CouponAPI';
import NoteAPI from '../API/NoteAPI';
import OrderAPI from '../API/OrderAPI';
import Detail_OrderAPI from '../API/Detail_OrderAPI';
import queryString from 'query-string';
import io from "socket.io-client";
import axios from 'axios';
const socket = io('https://datnfixed.onrender.com', {
    transports: ['websocket'], jsonp: false
});
socket.connect();

function OrderMomo(props) {
    const { search } = window.location;
    const id_order = window.location.pathname.split('/')[2]; // Extract id_order from URL path

    const [note, setNote] = useState('')
    const [order, set_order] = useState({})
    const count_change = useSelector(state => state.Count.isLoad)
    const [detail_order, set_detail_order] = useState([])
    const dispatch = useDispatch()

    useEffect(() => {


        const fetchData = async () => {

            const serectkey = "S6rRbLSPkRXef39MVB0huuqNOPXVBW8c"
            const accessKey = new URLSearchParams(search).get('accessKey')
            const amount = new URLSearchParams(search).get('amount')
            const extraData = new URLSearchParams(search).get('extraData')
            const errorCode = new URLSearchParams(search).get('errorCode')
            const localMessage = new URLSearchParams(search).get('localMessage')
            const message = new URLSearchParams(search).get('message')
            const orderId = new URLSearchParams(search).get('orderId')
            const orderInfo = new URLSearchParams(search).get('orderInfo')
            const orderType = new URLSearchParams(search).get('orderType')
            const partnerCode = new URLSearchParams(search).get('partnerCode')
            const payType = new URLSearchParams(search).get('payType')
            const requestId = new URLSearchParams(search).get('requestId')
            const responseTime = new URLSearchParams(search).get('responseTime')
            const transId = new URLSearchParams(search).get('transId')

            let param = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&message=${message}&localMessage=${localMessage}&responseTime=${responseTime}&errorCode=${errorCode}&payType=${payType}&extraData=${extraData}`

            var signature = crypto.createHmac('sha256', serectkey)
                .update(param)
                .digest('hex');

            if (new URLSearchParams(search).get('signature') !== signature) {
                setNote("Information Request Invalid")
                return;
            }
            if (errorCode == 0) {

                const response = await OrderAPI.get_detail(id_order)
           
                set_order(response)

                const response_detail_order = await Detail_OrderAPI.get_detail_order(id_order)
              
                set_detail_order(response_detail_order)


                if (localStorage.getItem('data') === null) {

                    const data_order = id_order


                    const params = {
                        id: data_order
                    }
                    const query = '?' + queryString.stringify(params)
                    try {
                        // Xứ lý API Order
                        const response_order = await OrderAPI.paymentreturn(query)
                        const response_order_date = await OrderAPI.paymentreturndate(query)

                        //   Xử lý API Detail_Order
                        const data_carts = response_detail_order
                      
                        const detail_orders = [];
                        // Xử lý API Detail_Order
                        for (let i = 0; i < data_carts.length; i++) {

                            const data_detail_order = {
                                id_cart: Math.random().toString(),
                                id_order: response._id,
                                id_product: data_carts[i].id_product._id,
                                name_product: data_carts[i].id_product.name_product,
                                price_product: data_carts[i].id_product.price_product,
                                image: data_carts[i].id_product.image,
                                count: data_carts[i].count,
                                size: data_carts[i].size
                            }
                          
                            detail_orders.push(data_detail_order);
                            const response = await axios.patch('https://datnfixed.onrender.com/api/admin/product/updateDepository', {
                                _id: data_detail_order.id_product,
                              
                            });


                        }
                        

                        const data_email = {
                            id_order: response._id,
                            total: response.total,
                            fullname: response.id_user.fullname,
                            phone: response.id_note.phone,
                            feeship: response.feeship,
                            address: response.address,
                            email: response.id_user.email,
                            subtotal: response.total - response.feeship,
                            data_carts: detail_orders,
                        }
                      
                        // Gửi socket lên server
                        socket.emit('send_order', "Có người vừa đặt hàng");
                   
                        // Xử lý API Send Mail
                        const send_mail = await OrderAPI.post_email(data_email)
                        console.log(send_mail)
                    } catch (error) {
                        console.error("Error processing order:", error);
                        setNote(error.response?.status === 404
                            ? "Payment service is currently unavailable. Please try again later."
                            : "Error processing your order. Please try again.");
                        return;
                    }






                    // Hàm này dùng để load lại phần header bằng Redux
                    const action_count_change = changeCount(count_change)
                    dispatch(action_count_change)

                    setTimeout(() => {
                        window.location.href = '/history'
                    }, 2500)

                    setNote("You Have Ordered Successfully")

                }
                else {
                    const updatepayment = typeof localStorage.getItem('data') === 'string'
                        ? JSON.parse(localStorage.getItem('data'))
                        : localStorage.getItem('data');

                


                    const data_order = updatepayment.id_order
                    
                    if (data_order !== id_order) {
                        const data_order = id_order


                        const params = {
                            id: data_order
                        }
                        const query = '?' + queryString.stringify(params)
                        try {
                            // Xứ lý API Order
                            const response_order = await OrderAPI.paymentreturn(query)
                            const response_order_date = await OrderAPI.paymentreturndate(query)
                          
                            //   Xử lý API Detail_Order
                            const data_carts = response_detail_order
                        
                            const detail_orders = [];
                            // Xử lý API Detail_Order
                            for (let i = 0; i < data_carts.length; i++) {

                                const data_detail_order = {
                                    id_cart: Math.random().toString(),
                                    id_order: response._id,
                                    id_product: data_carts[i].id_product._id,
                                    name_product: data_carts[i].id_product.name_product,
                                    price_product: data_carts[i].id_product.price_product,
                                    image: data_carts[i].id_product.image,
                                    count: data_carts[i].count,
                                    size: data_carts[i].size
                                }
                              
                                detail_orders.push(data_detail_order);
                                const response = await axios.patch('https://datnfixed.onrender.com/api/admin/product/updateDepository', {
                                    _id: data_detail_order.id_product,
                                  
                                });
            

                            }
                          

                            const data_email = {
                                id_order: response._id,
                                total: response.total,
                                fullname: response.id_user.fullname,
                                phone: response.id_note.phone,
                                feeship: response.feeship,
                                address: response.address,
                                email: response.id_user.email,
                                subtotal: response.total - response.feeship,
                                data_carts: detail_orders,
                            }
                         
                            // Gửi socket lên server
                            socket.emit('send_order', "Có người vừa đặt hàng");
                           
                            // Xử lý API Send Mail
                            const send_mail = await OrderAPI.post_email(data_email)
                            console.log(send_mail)
                        } catch (error) {
                            console.error("Error processing order:", error);
                            setNote(error.response?.status === 404
                                ? "Payment service is currently unavailable. Please try again later."
                                : "Error processing your order. Please try again.");
                            return;
                        }






                        // Hàm này dùng để load lại phần header bằng Redux
                        const action_count_change = changeCount(count_change)
                        dispatch(action_count_change)

                        setTimeout(() => {
                            window.location.href = '/history'
                        }, 2500)

                        setNote("You Have Ordered Successfully")
                    } else {
                        const params = {
                            id: data_order
                        }
                        const query = '?' + queryString.stringify(params)


                        // Xứ lý API Order
                        try {
                            // Xứ lý API Order
                            const response_order = await OrderAPI.paymentreturn(query)
                            const response_order_date = await OrderAPI.paymentreturndate(query)
                            //   Xử lý API Detail_Order
                            const data_email = {
                                id_order: updatepayment.id_order,
                                total: updatepayment.total,
                                fullname: updatepayment.fullname,
                                phone: updatepayment.phone,
                                feeship: updatepayment.subtotal,
                                address: updatepayment.address,
                                email: updatepayment.email,
                                subtotal: updatepayment.total - updatepayment.subtotal,
                                data_carts: updatepayment.data_carts,
                            }
                            // Gửi socket lên server
                            socket.emit('send_order', "Có người vừa đặt hàng");
                           
                            // Xử lý API Send Mail
                            const send_mail = await OrderAPI.post_email(data_email)
                            console.log(send_mail)
                        } catch (error) {
                            console.error("Error processing order:", error);
                            setNote(error.response?.status === 404
                                ? "Payment service is currently unavailable. Please try again later."
                                : "Error processing your order. Please try again.");
                            return;
                        }


                        localStorage.removeItem('data')



                        // Hàm này dùng để load lại phần header bằng Redux
                        const action_count_change = changeCount(count_change)
                        dispatch(action_count_change)

                        setTimeout(() => {
                            window.location.href = '/history'
                        }, 2500)

                        setNote("You Have Ordered Successfully")
                    }


                }


            } else {
                const data_order = id_order


                const params = {
                    id: data_order
                }
                const query = '?' + queryString.stringify(params)
               
                const response_order_date = await OrderAPI.paymentreturndate(query)
               
                setNote("You Have Ordered Fail")
                setTimeout(() => {
                    window.location.href = '/history'
                }, 2500)
            }

        }
        fetchData()

    }, [])


    return (
        <div className="container fix_order">
            <h1>{note}</h1>
            <span style={{ fontSize: '1.2rem' }}>Please Checking Information Again!</span>\

        </div>
    );
}

export default OrderMomo;