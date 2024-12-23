import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { deleteCart, updateCart } from '../Redux/Action/ActionCart';
import { changeCount } from '../Redux/Action/ActionCount';
import CartAPI from '../API/CartAPI'
import queryString from 'query-string'
import CartsLocal from '../Share/CartsLocal';
import CouponAPI from '../API/CouponAPI';
import './Cart.css'




Cart.propTypes = {

};

function Cart(props) {

    const dispatch = useDispatch()
    const [coupons, setCoupons] = useState([]);
    const [list_carts, set_list_carts] = useState([])
    const [errorMessage, setErrorMessage] = useState('');
    // state get from redux
    const count_change = useSelector(state => state.Count.isLoad)
    const [showPendingNotification, setShowPendingNotification] = useState(false);   
    const [total_price, set_total_price] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Hàm này dùng để hiện thị danh sách sản phẩm đã thêm vào giỏ hàng
    // và tính tổng tiền
    useEffect(() => {
        const params = {
            id_user: sessionStorage.getItem('id_user'),
            code: coupon
        }
        const query = '?' + queryString.stringify(params)

        const fetchAllData = async () => {
            const response = await CouponAPI.getCoupons(query)
            setCoupons(
                Array.isArray(response.coupons)
                    ? response.coupons.sort((a, b) => b.promotion - a.promotion)
                    : []
            );
            console.log(response.coupons)

        }

        set_list_carts(JSON.parse(localStorage.getItem('carts')))

        Sum_Price(JSON.parse(localStorage.getItem('carts')), 0)
        fetchAllData()
    }, [count_change])



    // Hàm này dùng để tính tổng tiền
    function Sum_Price(carts, sum_price) {
        carts.map(value => {
            return sum_price += parseInt(value.count) * parseInt(value.price_product)
        })

        set_total_price(sum_price)
        set_new_price(sum_price)
    }

    // Hàm này dùng để tăng số lượng
    const upCount = (count, id_cart) => {

        const data = {
            id_cart: id_cart,
            count: parseInt(count) + 1
        }

        console.log(data)
        


        CartsLocal.updateProduct(data)

        const action_change_count = changeCount(count_change)
        dispatch(action_change_count)

    }

    // Hàm này dùng để giảm số lượng
    const downCount = (count, id_cart) => {

        if (parseInt(count) === 1) {
            return
        }

        const data = {
            id_cart: id_cart,
            count: parseInt(count) - 1
        }

        console.log(data)

        CartsLocal.updateProduct(data)

        const action_change_count = changeCount(count_change)
        dispatch(action_change_count)

    }

    // Hàm này dùng để xóa giỏ hàng
    const handler_delete_carts = (id_cart) => {

        CartsLocal.deleteProduct(id_cart)

        // Thay đổi trạng thái trong redux để load lại cart ở phần header
        const action_change_count = changeCount(count_change)
        dispatch(action_change_count)

    }


    // Hàm này này dùng để kiểm tra đăng nhập checkout
    const [show_error, set_show_error] = useState(false)

    const [show_null_cart, set_show_null_cart] = useState(false)

    const handler_checkout = () => {

        if (sessionStorage.getItem('id_user')) {
            if (list_carts.length < 1) {
                set_show_null_cart(true)
            } else {
                window.location.replace('/checkout')
            }
        } else {

            window.location.replace('/signin')

        }

        setTimeout(() => {
            set_show_error(false)
            set_show_null_cart(false)
        }, 1500)

    }


    // Hàm này dùng để kiểm tra coupon
    const [coupon, set_coupon] = useState('')

    const [discount, setDiscount] = useState(0)

    const [new_price, set_new_price] = useState(0)

    const [show_success, set_show_success] = useState(false)

    const [errorCode, setErrorCode] = useState(false)

    const handlerCoupon = async (e) => {
        e.preventDefault();

        if (!sessionStorage.getItem('id_user')) {
            set_show_error(true);
        } else {
            try {
                // First check the specific coupon
                const params = {
                    id_user: sessionStorage.getItem('id_user'),
                    code: coupon
                }
                const query = '?' + queryString.stringify(params);
                const response = await CouponAPI.checkCoupon(query);
               
                // Handle specific coupon response
                if (response.msg === 'Mã giảm giá không tồn tại' || response.msg === 'Bạn đã sử dụng mã này rồi' || response.msg === 'Mã giảm giá đã hết hạn') {
                    setErrorCode(true);
                    setErrorMessage(response.msg);
                   
                } else {
                    localStorage.setItem('id_coupon', response.coupon._id);
                    localStorage.setItem('coupon', JSON.stringify(response.coupon));
                    setDiscount((total_price * response.coupon.promotion) / 100);
                    set_new_price(total_price - ((total_price * response.coupon.promotion) / 100));
                    set_show_success(true);
                }

                // Fetch all available coupons
                const couponsResponse = await CouponAPI.getCoupons(query);
                setCoupons(
                    Array.isArray(couponsResponse.coupons)
                        ? couponsResponse.coupons.sort((a, b) => b.promotion - a.promotion)
                        : []
                );

            } catch (error) {
                console.log('Failed to fetch coupons:', error);
                setCoupons([]); // Set empty array in case of error
            }
        }

        setTimeout(() => {
            set_show_error(false);
            set_show_null_cart(false);
            set_show_success(false);
            setErrorCode(false);
        }, 1500);
    }

    return (
        <div>
            {
                errorCode &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff', backgroundColor: '#f84545' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>{errorMessage}</h4>
                    </div>
                </div>
            }
            {
                show_success &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Áp Dụng Mã Code Thành Công!</h4>
                    </div>
                </div>
            }
            {
                show_error &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff', backgroundColor: '#f84545' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Vui Lòng Kiểm Tra Tình Trạng Đăng Nhập!</h4>
                    </div>
                </div>
            }
            {
                show_null_cart &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff', backgroundColor: '#f84545' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Vui Lòng Kiểm Tra Lại Giỏ Hàng!</h4>
                    </div>
                </div>
            }

            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="active">Giỏ hàng</li>
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
                                                <th className="li-product-remove">Xóa</th>
                                                <th className="li-product-thumbnail">Ảnh</th>
                                                <th className="cart-product-name">Sản phẩm</th>
                                                <th className="li-product-price">Giá</th>
                                                <th className="li-product-quantity">Số lượng</th>
                                                <th className="li-product-subtotal">Tổng cộng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                list_carts && list_carts.map((value, index) => (
                                                    <tr key={index}>
                                                        <td className="li-product-remove" onClick={() => handler_delete_carts(value.id_cart)}>
                                                            <a style={{ cursor: 'pointer' }}><i className="fa fa-times"></i></a>
                                                        </td>
                                                        <td className="li-product-thumbnail"><Link to={`/detail/${value.id_product}`}><img src={value.image} style={{ width: '5rem' }} alt="Li's Product Image" /></Link></td>
                                                        <td className="li-product-name"><a href="#">{value.name_product}</a></td>
                                                        <td className="li-product-price"><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'}</span></td>
                                                        <td className="quantity">
                                                            <label>Số lượng</label>
                                                            <div className="cart-plus-minus">
                                                                <input className="cart-plus-minus-box" value={value.count} type="text" />
                                                                <div className="dec qtybutton" onClick={() => downCount(value.count, value.id_cart)}><i className="fa fa-angle-down"></i></div>
                                                                <div className="inc qtybutton" onClick={() => upCount(value.count, value.id_cart)}><i className="fa fa-angle-up"></i></div>
                                                            </div>
                                                        </td>
                                                        <td className="product-subtotal"><span className="amount">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(parseInt(value.price_product) * parseInt(value.count)) + ' VNĐ'}</span></td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <div class="coupon-all">
                                            <div class="coupon">
                                                <input id="coupon_code" class="input-text" onChange={(e) => set_coupon(e.target.value)} value={coupon} placeholder="Mã giảm giá" type="text" /> &nbsp;
                                                {/* <input class="button" value=" Áp dụng" type="submit" data-toggle="modal" data-target="#exampleModal" /> */}
                                                {/* onClick={handlerCoupon} */}

                                                <button type="button" class="btn btn-info" data-toggle="modal" data-target="#exampleModal">
                                                    Xem mã giảm giá
                                                </button>

                                                <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                    <div class="modal-dialog" role="document">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h5 class="modal-title" id="exampleModalLabel">Danh sách mã giảm giá</h5>
                                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                    <span aria-hidden="true">&times;</span>
                                                                </button>
                                                            </div>
                                                            <div class="modal-body">
                                                                <div className="coupon-list">
                                                                    {coupons && coupons
                                                                    .filter(coupon => {
                                                                        // Only show coupons that haven't expired
                                                                      
                                                                        return  coupon.status === false||new Date(coupon.end) > new Date();
                                                                    })
                                                                    .map((coupon, index) => (
                                                                        <div key={index} className="coupon-item" style={{
                                                                            border: '1px solid #ddd',
                                                                            padding: '10px',
                                                                            marginBottom: '10px',
                                                                            borderRadius: '5px',
                                                                            display: 'flex',
                                                                            alignItems: 'center'
                                                                        }}>
                                                                            <input
                                                                                type="radio"
                                                                                name="selectedCoupon"
                                                                                value={coupon.code}
                                                                                onChange={() => {
                                                                                    set_coupon(coupon.code);
                                                                                    const newDiscount = (total_price * coupon.promotion) / 100;
                                                                                    setDiscount(newDiscount);
                                                                                    set_new_price(total_price - newDiscount);
                                                                                }}
                                                                                style={{ marginRight: '10px' }}
                                                                            />
                                                                            <div>
                                                                                <div className="coupon-description">
                                                                                    {coupon.describe}
                                                                                </div>
                                                                                <div className="coupon-code" style={{ fontWeight: 'bold' }}>
                                                                                    Mã: {coupon.code}
                                                                                </div>
                                                                                <div className="coupon-discount">
                                                                                    Giảm giá: {coupon.promotion}%
                                                                                </div>

                                                                                <div className="price-preview" style={{ color: 'green' }}>
                                                                                    Giá sau khi áp dụng: {new Intl.NumberFormat('vi-VN', {
                                                                                        style: 'decimal',
                                                                                        decimal: 'VND'
                                                                                    }).format(total_price - ((total_price * coupon.promotion) / 100)) + ' VNĐ'}
                                                                                </div>
                                                                                <div className="coupon-expiration" style={{ color: '#ff6b6b' }}>
                                                                                {coupon.end && (
                                                                                    <>Hạn sử dụng: {new Date(coupon.end).toLocaleDateString('vi-VN')} ({
                                                                                        Math.ceil((new Date(coupon.end) - new Date()) / (1000 * 60 * 60 * 24))
                                                                                    } ngày còn lại)</>
                                                                                )}
                                                                            </div>
                                                                            </div>
                                                                           
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div class="modal-footer">
                                                                <button
                                                                    type="button"
                                                                    class="btn btn-primary"
                                                                    onClick={handlerCoupon}
                                                                    data-dismiss="modal"
                                                                >
                                                                    Áp dụng mã
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="btn btn-secondary"
                                                                    data-dismiss="modal"
                                                                >
                                                                    Đóng
                                                                </button>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-5 ml-auto">
                                        <div className="cart-page-total">
                                            <h2>Tổng cộng</h2>
                                            <ul>
                                                <li>Tổng sản phẩm <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(total_price) + ' VNĐ'}</span></li>
                                                <li>Giảm giá <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(discount) + ' VNĐ'}</span></li>
                                                <li>Tổng <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(new_price) + ' VNĐ'}</span></li>
                                            </ul>
                                            <a style={{ color: '#fff', cursor: 'pointer', fontWeight: '600' }} onClick={handler_checkout}>Tiếp theo</a>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;