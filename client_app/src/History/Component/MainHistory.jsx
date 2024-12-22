import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import queryString from 'query-string'
import OrderAPI from '../../API/OrderAPI';
import axios from 'axios';
import Detail_OrderAPI from '../../API/Detail_OrderAPI';
MainHistory.propTypes = {

};

function MainHistory(props) {

    const [history, set_history] = useState([])

    const [isLoad, setIsLoad] = useState(true)
    const [detail_order, set_detail_order] = useState([])
    useEffect(() => {

        const fetchData = async () => {

            try {
                const response = await OrderAPI.get_order(sessionStorage.getItem('id_user'))
                console.log(response)
                // Xử lý các đơn hàng cũ một cách tuần tự
             
                for (const order of response) {
                 
                    const [day, month, year] = order.create_time.split('/');
                   const orderDate = new Date(year, month - 1, day); // month is 0-based in JS
                   const currentDate = new Date();
              
                   // Reset time portions to midnight
                   orderDate.setHours(0, 0, 0, 0);
                   currentDate.setHours(0, 0, 0, 0);
                   
                   const diffTime = Math.abs(currentDate - orderDate);
                   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 
                    if (diffDays > 1 && order.status === '1' && !order.pay&&order.id_payment.pay_name === "Momo") {
                        await deleteOrder(order._id, order.pay);
                    }
                //     if (order.status === '5') {
                //     const response_detail_order = await Detail_OrderAPI.get_detail_order(order._id)
                //     if (response_detail_order && response_detail_order.length > 0) {
                //         for (const detail of [...response_detail_order].reverse()) {
                //             console.log(detail)
                //             if (detail.id_product) {
                //                 await handleSubmittupdatekho(detail.id_product);
                //             }
                //         }
                //     }
                //     set_detail_order(response_detail_order)
                // }
                   
                }
                 set_history(response)

                 
                
            } catch (error) {
                console.error("Error fetching or processing orders:", error);
            }

        }

        fetchData()
        const intervalId = setInterval(() => {
            fetchData()
        }, 3000) // 
         // Cleanup function để clear interval khi component unmount
        return () => {
            clearInterval(intervalId)
        }

    }, [isLoad])
    const [productId, setProductId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmittupdatekho = async (id,count) => {
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

    const deleteOrder = async (id, pay) => {

        if (pay === true) {
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
            const response_detail_order = await Detail_OrderAPI.get_detail_order(params.id)
            for (const detail of response_detail_order) {
                if (detail.id_product) {
                    await handleSubmittupdatekho(detail.id_product, detail.count);
                }
            }
          
            const query = '?' + queryString.stringify(params)
           
            const response = await OrderAPI.cancel_order(query)
           

            console.log(response)
            // if (response.msg === "Thanh Cong") {
            //     handleSubmittupdatekho();
            //   }
              

            setIsLoad(!isLoad)
        }
    }

    return (
        <div>

            {
                show_error &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff', backgroundColor: '#f84545' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Không Thể Hủy Vì Đơn Hàng Đã Được Thanh Toán!</h4>
                    </div>
                </div>
            }

            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ </Link></li>
                            <li className="active">Lịch sử</li>
                        </ul>
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
                                                <th className="li-product-remove">ID</th>
                                                <th className="li-product-thumbnail">Họ và tên</th>
                                                <th className="cart-product-name">SĐT</th>
                                                <th className="li-product-price">Địa chỉ</th>
                                                <th className="li-product-quantity">Tổng</th>
                                                <th className="li-product-subtotal">Thanh Toán</th>
                                                <th className="li-product-subtotal">Phương thức thanh toán</th>
                                                <th className="li-product-subtotal">tình trang đơn hàng</th>
                                                <th className="li-product-subtotal">Hủy</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                history && history.map(value => (
                                                    <tr key={value._id}>
                                                        <td className="li-product-price"><span className="amount"><Link to={`/history/${value._id}`}>View</Link></span></td>
                                                        <td className="li-product-price"><span className="amount">{value.id_note.fullname}</span></td>
                                                        <td className="li-product-price"><span className="amount">{value.id_note.phone}</span></td>
                                                     
                                                        <td className="li-product-price"><span className="amount">{value.address}</span></td>

                                                        <td className="li-product-price"><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.total) + ' VNĐ'}</span></td>
                                                        <td className="li-product-price"><span className="amount" style={value.pay ? { color: 'green' } : { color: 'red' }}>{value.pay ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></td>
                                                        <td className="li-product-price"><span className="amount">  {(() => {
                                                                
                                                                        if (value.id_payment?.pay_name === "Cash ") {
                                                                            return <span >Tiền mặt</span>
                                                                        } if (value.id_payment?.pay_name === "Momo") {
                                                                            return <span >Momo</span>
                                                                        } 
                                                                      
                                                               
                                                            })()}</span></td>
                                                        <td className="li-product-price"><span className="amount" >
                                                            {(() => {
                                                                switch (value.status) {
                                                                    case '1' :
                                                                        if (value.id_payment?.pay_name === "Cash ") {
                                                                            return <span >Đơn hàng đang duyệt</span>
                                                                        } if (value.id_payment?.pay_name === "Momo" && value.pay === true) {
                                                                            return <span >Đơn hàng đang duyệt</span>
                                                                        } else {
                                                                            return <>
                                                                                <span >Vui lòng thanh toán đơn hàng</span><br></br >
                                                                               
                                                                            </>
                                                                        };
                                                                    case '2':
                                                                        return <span style={{ color: 'green' }} >Đã xác nhận đơn hàng</span>
                                                                    case '3':
                                                                        return <span style={{ color: 'green' }}>Đã nhận hàng</span>
                                                                    case '4':
                                                                        return <span style={{ color: 'red' }}>Trả hàng</span>
                                                                    case '5':
                                                                        return <span style={{ color: 'red' }}>Đã hủy hàng</span>
                                                                    case '6':
                                                                        return <span style={{ color: 'red' }}>Đang duyệt trả hàng</span>
                                                                    case '7':
                                                                            return <span style={{ color: 'green' }}>Trả hàng thành công</span>
                                                                    default:
                                                                        return <i className="fa fa-check text-success" style={{ fontSize: '25px' }}></i>
                                                                }
                                                            })()}
                                                        </span>
                                                        </td>
                                                        <td className="li-product-price">
                                                            {(() => {
                                                                switch (value.status) {
                                                                    case '1' || '2':
                                                                        return <span onClick={() => deleteOrder(value._id, value.pay)} className="btn btn-outline-danger" style={{ cursor: 'pointer' }}>Hủy đơn hàng</span>
                                                                    case '2':
                                                                        return <span onClick={() => deleteOrder(value._id, value.pay)} className="btn btn-outline-danger" style={{ cursor: 'pointer' }}>Hủy đơn hàng</span>
                                                                    case '5':
                                                                        return <i className="fa fa-check text-success" style={{ fontSize: '25px' }}></i>
                                                                  
                                                                    default:
                                                                        return <span className="text-danger"></span>
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

export default MainHistory;