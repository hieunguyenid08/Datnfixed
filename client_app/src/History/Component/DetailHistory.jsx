import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
// import HistoryAPI from '../../API/HistoryAPI';
import './History.css'
import OrderAPI from '../../API/OrderAPI';
import Detail_OrderAPI from '../../API/Detail_OrderAPI';
import NoteAPI from '../../API/NoteAPI';
import MoMo from './MoMo.jsx'
import LogoMomo from './momo-png/momo_icon_square_pinkbg_RGB.png'
import axios from 'axios';

import queryString from 'query-string'






function DetailHistory(props) {

    const { id } = useParams()
    const [orderID, setOrderID] = useState('')
    const [order, set_order] = useState({})
  
    const [detail_order, set_detail_order] = useState([])
    const [total_price, set_total_price] = useState(0)
    const [note, set_note] = useState({})
    const baseURL = 'https://shop.huytehuy.online';

    useEffect(() => {

        const fetchData = async () => {

            const response = await OrderAPI.get_detail(id)
            console.log(response)

            const [day, month, year] = response.create_time.split('/');
            const orderDate = new Date(year, month - 1, day); // month is 0-based in JS
            const currentDate = new Date();

            // Reset time portions to midnight
            orderDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(currentDate - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1 && response.status === '1' && !response.pay && response.id_payment.pay_name === "Momo") {
                await deleteOrder(response._id, response.pay);

            }
            if (diffDays > 15 && response.status === '4') {
                await updateOrder(response._id);

            }
            set_order(response)

            const response_detail_order = await Detail_OrderAPI.get_detail_order(id)
            console.log(response_detail_order)
            set_detail_order(response_detail_order)


        }

        fetchData()
        const intervalId = setInterval(() => {
            fetchData()
        }, 2000) // 
        // Cleanup function để clear interval khi component unmount
        return () => {
            clearInterval(intervalId)
        }

    }, [])
    const handlerMomo = () => {

        setOrderID(Math.random().toString())
        console.log("Momo Thanh Cong")

    }
    const handleConfirm = async (id) => {

        console.log('order._id:', id)

        const params = {
            id: id
        }
        console.log('parrams:', params)
        const query = '?' + queryString.stringify(params)

        const response = await OrderAPI.delivery(query)

        console.log(response)
        if (response.msg === "Thanh Cong") {
            window.location.reload();
        }


    }
    const [productId, setProductId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmittupdatekho = async (id, count) => {
        //e.preventDefault();
        setLoading(true);
        setMessage(''); // Reset message before the request

        try {
            // Gửi request đến API cập nhật kho
            const response = await axios.patch('https://datnfixed.onrender.com/api/admin/product/updateDepository1', {
                _id: id,
                count: count
            });
            console.log(response);

            setMessage(response.data.msg); // Set message to show success
        } catch (error) {
            setMessage(error.response?.data?.msg || 'Có lỗi xảy ra'); // Show error message if any
        } finally {
            setLoading(false);
        }
    };
    const [show_error, set_show_error] = useState(false)
    const deleteOrder = async (id, pay, idpay) => {

        if (pay === true && idpay === "Momo") {
            set_show_error(true)

            setTimeout(() => {
                set_show_error(false)
            }, 2000)
            return
        }

        if (!show_error) {
            const params = {
                id: id
            }

            const query = '?' + queryString.stringify(params)

            const response = await OrderAPI.cancel_order(query)





        }
    }
    const updateOrder = async (id) => {


        if (!show_error) {
            const params = {
                id: id
            }

            const query = '?' + queryString.stringify(params)

            const response = await OrderAPI.completeO(query)





        }
    }

    const handleReturnConfirm = async (id) => {

        console.log('order._id:', id)

        const params = {
            id: id
        }
        console.log('parrams:', params)
        const query = '?' + queryString.stringify(params)

        const response = await OrderAPI.confirmreturn(query)

        console.log(response)
        if (response.msg === "Thanh Cong") {
            window.location.reload();
        }


    }

    return (
        <div>
            <div className="container" style={{ paddingTop: '3rem' }}>
                <h1>Order Details</h1>
                <ul>
                    <li style={{ fontSize: '1.1rem' }}>ID: <span>{order._id}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>SĐT: <span>{order.id_note && order.id_note.phone}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Họ và tên: <span>{order.id_note && order.id_note.fullname}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Tổng: <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(order.total) + ' VNĐ'}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Phí vận chuyển: <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(order.feeship) + ' VNĐ'}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Phương thức thanh toán: <span>{order.id_payment && order.id_payment.pay_name}</span></li>
                </ul>
                <div className="group_box_status" style={{ marginTop: '3rem' }}>
                    <div className="d-flex justify-content-center">
                        <div className="group_status_delivery d-flex justify-content-around">
                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 0 && 'bg_status_delivery_active'}></div>
                                </div>
                                <a className="a_status_delivery">Đang xử lý</a>
                            </div>

                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 1 ? 'bg_status_delivery_active' : 'bg_status_delivery'}></div>
                                </div>
                                <a className="a_status_delivery">Đã xác nhận</a>
                            </div>

                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 2 ? 'bg_status_delivery_active' : 'bg_status_delivery'}></div>
                                </div>
                                <a className="a_status_delivery">Đang vận chuyển</a>
                            </div>

                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 3 ? 'bg_status_delivery_active' : 'bg_status_delivery'}></div>
                                </div>
                                <a className="a_status_delivery">Hoàn Thành</a>
                            </div>
                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) === 7 ? 'bg_status_delivery_active' : 'bg_status_delivery'}></div>
                                </div>
                                <a className="a_status_delivery">Trả hàng</a>
                            </div>
                        </div>
                    </div>
                    <div className="test_status d-flex justify-content-center">
                        <div className="hr_status_delivery"></div>
                    </div>
                </div>
            </div>

            <div className="Shopping-cart-area pt-60 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <form action="#">
                                <div className="table-content table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="li-product-remove">Ảnh</th>
                                                <th className="li-product-thumbnail">Tên sản phẩm</th>
                                                <th className="cart-product-name">Giá</th>
                                                <th className="li-product-price">Số lượng</th>
                                                <th className="li-product-price">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                detail_order && detail_order.map((value,index) => (
                                                    <tr key={value._id}>
                                                        <td className="li-product-thumbnail"><img src={value.id_product.image} style={{ width: '5rem' }} alt="Li's Product Image" /></td>
                                                        <td className="li-product-name"><a href={`${baseURL}/detail/${value.id_product._id}`}>{value.name_product}</a></td>
                                                        <td className="li-product-price"><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'}</span></td>
                                                        <td className="li-product-price"><span className="amount">{value.count}</span></td>
                                                        {index === 0 && (
                                                        <th rowSpan={detail_order.length}> 
                                                            {(() => {

                                                                    
                                                                    switch (order.status) {
                                                                        case "1": if (order.id_payment.pay_name === "Cash ") {
                                                                            return <span >Đơn hàng đang duyệt </span>
                                                                        } if (order.id_payment.pay_name === "Momo" && order.pay === true) {
                                                                            return <span >Đơn hàng đang duyệt</span>
                                                                        } else {
                                                                                return <>
                                                                                    <span >Vui lòng thanh toán đơn hàng</span><br></br >
                                                                                    <div>
                                                                                        <img src={LogoMomo} width="100" onClick={handlerMomo}
                                                                                            style={{ cursor: 'pointer' }} />
                                                                                        <MoMo
                                                                                            orderID={orderID}
                                                                                            total={order.total}
                                                                                            id_order={order._id}
                                                                                        />
                                                                                    </div>
                                                                                </>
                                                                            };
                                                                        case "2": return <>

                                                                            <button onClick={() => handleConfirm(order._id)} className="btn btn-success">Đã nhận được hàng</button>

                                                                        </>
                                                                        case "3": return <span style={{ color: 'green' }}>Đã nhận hàng thành công</span>;
                                                                        case "4": return <>

                                                                            <button onClick={() => handleReturnConfirm(order._id)} className="btn btn-success">Trả hàng</button>
                                                                        </>
                                                                        case "5": return "Đơn bị hủy";
                                                                        case "6": return "Đã nhận yêu cầu trả hàng";
                                                                        case "7": return <span style={{ color: 'green' }}>Trả hàng thành công</span>;
                                                                        default: return <i className="fa fa-check text-success" style={{ fontSize: '25px' }}></i>;
                                                                    }
                                                                 
                                                                

                                                            })()}
                                                        </th>
                                                            )}
                                                    </tr>
                                                ))
                                            }

                                        </tbody>

                                    </table>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailHistory;