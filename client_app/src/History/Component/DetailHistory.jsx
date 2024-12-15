import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
// import HistoryAPI from '../../API/HistoryAPI';
import './History.css'
import OrderAPI from '../../API/OrderAPI';
import Detail_OrderAPI from '../../API/Detail_OrderAPI';
import NoteAPI from '../../API/NoteAPI';



import queryString from 'query-string'





function DetailHistory(props) {

    const { id } = useParams()

    const [order, set_order] = useState({})

    const [detail_order, set_detail_order] = useState([])

    const [note, set_note] = useState({})
    const baseURL = 'http://localhost:3000/';

    useEffect(() => {

        const fetchData = async () => {

            const response = await OrderAPI.get_detail(id)
            console.log(response)

            set_order(response)

            const response_detail_order = await Detail_OrderAPI.get_detail_order(id)

            set_detail_order(response_detail_order)

        }

        fetchData()

    }, [])

    const handleConfirm = async (id) => {



        const params = {
            id: id
        }

        const query = '?' + queryString.stringify(params)

        const response = await OrderAPI.delivery(query)

        console.log(response)
        if (response.msg === "Thanh Cong") {
            window.location.reload();
        }


    }
    const handleReturnConfirm = async (id) => {



        const params = {
            id: id
        }

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
                    <li style={{ fontSize: '1.1rem' }}>ID Invoice: <span>{order._id}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Phone: <span>{order.id_note && order.id_note.phone}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Fullname: <span>{order.id_note && order.id_note.fullname}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Total: <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(order.total) + ' VNĐ'}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Feeship: <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(order.feeship) + ' VNĐ'}</span></li>
                    <li style={{ fontSize: '1.1rem' }}>Payment: <span>{order.id_payment && order.id_payment.pay_name}</span></li>
                </ul>
                <div className="group_box_status" style={{ marginTop: '3rem' }}>
                    <div className="d-flex justify-content-center">
                        <div className="group_status_delivery d-flex justify-content-around">
                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 0 && 'bg_status_delivery_active'}></div>
                                </div>
                                <a className="a_status_delivery">Processing</a>
                            </div>

                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 1 ? 'bg_status_delivery_active' : 'bg_status_delivery'}></div>
                                </div>
                                <a className="a_status_delivery">Confirmed</a>
                            </div>

                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 2 ? 'bg_status_delivery_active' : 'bg_status_delivery'}></div>
                                </div>
                                <a className="a_status_delivery">Shipping</a>
                            </div>

                            <div className="detail_status_delivery">
                                <div className="w-100 d-flex justify-content-center">
                                    <div className={parseInt(order.status) > 3 ? 'bg_status_delivery_active' : 'bg_status_delivery'}></div>
                                </div>
                                <a className="a_status_delivery">Finished</a>
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
                                                <th className="li-product-remove">Image</th>
                                                <th className="li-product-thumbnail">Name Product</th>
                                                <th className="cart-product-name">Price</th>
                                                <th className="li-product-price">Count</th>
                                                <th className="li-product-price">Process</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                detail_order && detail_order.map(value => (
                                                    <tr key={value._id}>
                                                        <td className="li-product-thumbnail"><img src={value.id_product.image} style={{ width: '5rem' }} alt="Li's Product Image" /></td>
                                                        <td className="li-product-name"><a href={`${baseURL}/detail/${value.id_product._id}`}>{value.name_product}</a></td>
                                                        <td className="li-product-price"><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'}</span></td>
                                                        <td className="li-product-price"><span className="amount">{value.count}</span></td>
                                                        <td>
                                                            {(() => {
                                                                switch (order.status) {
                                                                    case "1": return "Đơn hàng đang duyệt";
                                                                    case "2": return <>

                                                                        <button onClick={() => handleConfirm(order._id)} className="btn btn-success">Đã nhận được hàng</button>
                                                                    </>
                                                                    case "3": return <span style={{ color: 'green' }}>Đã nhận hàng thành công</span>;
                                                                    case "4": return <>

                                                                        <button onClick={() => handleReturnConfirm(order._id)} className="btn btn-success">Trả hàng</button>
                                                                    </>
                                                                    case "5": return "Đơn bị hủy";
                                                                    case "6": return "Đã nhận yêu cầu trả hàng";

                                                                    default: return <span style={{ color: 'green' }}>Trả hàng thành công</span>;
                                                                }
                                                            })()}
                                                        </td>

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