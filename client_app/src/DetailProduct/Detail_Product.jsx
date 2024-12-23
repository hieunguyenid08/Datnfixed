import React, { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import { useParams } from 'react-router';
import Product from '../API/Product';
import { useDispatch, useSelector } from 'react-redux';
import { changeCount } from '../Redux/Action/ActionCount';
import { Link } from 'react-router-dom';
import CommentAPI from '../API/CommentAPI';
import CartsLocal from '../Share/CartsLocal';
import SaleAPI from '../API/SaleAPI';

function Detail_Product() {
    const { id } = useParams()
    const [product, set_product] = useState({})
    const [Loading, set_Loading] = useState(false);
    const dispatch = useDispatch()
    let totalCartCount = 0;
    //id_user được lấy từ redux
    // Get count từ redux khi user chưa đăng nhập
    const count_change = useSelector(state => state.Count.isLoad)
    const [sale, setSale] = useState()
    const [showWarning, setShowWarning] = useState(false);
    // Hàm này dùng để gọi API hiển thị sản phẩm
    useEffect(() => {
        const fetchData = async () => {
            set_Loading(true)
            set_product({})
            const response = await Product.Get_Detail_Product(id)
            set_Loading(false)
            set_product(response)
            const resDetail = await SaleAPI.checkSale(id)
            if (resDetail.msg === "Thanh Cong") {
                setSale(resDetail.sale)
            }
        }
        fetchData()
    }, [id])

    const [count, set_count] = useState(1)
    const [show_success, set_show_success] = useState(false)
    const [existingCartCount, setExistingCartCount] = useState(0)
    // Hàm này dùng để thêm vào giỏ hàng
    const handler_addcart = (e) => {
        const cart1 = JSON.parse(localStorage.getItem('carts'))


        e.preventDefault()
        //const cart1 = JSON.parse(localStorage.getItem('carts'))

        let existingCount = 0

        const data = {
            id_cart: Math.random().toString(),
            id_product: id,
            name_product: product.name_product,
            price_product: sale ? parseInt(sale.id_product.price_product) - ((parseInt(sale.id_product.price_product) * parseInt(sale.promotion)) / 100) : product.price_product,
            count: count,
            image: product.image,
            size: 'S',
        }
        console.log(cart1)
        if (cart1) {
            const existingProduct = cart1.find(item => item.id_product === id)
            if (existingProduct) {
                existingCount = existingProduct.count

            }
        }
        setExistingCartCount(existingCount)
        if (existingCount + data.count > product.depository) {
            setShowWarning(true)
            setTimeout(() => {
                setShowWarning(false)
            }, 7000)
            return
        }

        CartsLocal.addProduct(data)
        const action_count_change = changeCount(count_change)
        dispatch(action_count_change)
        set_show_success(true)
        setTimeout(() => {
            set_show_success(false)
        }, 1000)
    }

    // Hàm này dùng để giảm số lượng
    const downCount = () => {
        if (count === 1) {
            return
        }
        set_count(count - 1)
    }
    const upCount = () => {
        if (count < product.depository) {
            set_count(count + 1)
        }
    }

    const handleCountChange = (e) => {
        const value = parseInt(e.target.value)
        if (isNaN(value) || value < 1) {
            set_count(1)
            setShowWarning(false)
        } else if (value > product.depository) {
            set_count(product.depository)
            setShowWarning(true)
            // Tự động ẩn thông báo sau 7 giây
            setTimeout(() => {
                setShowWarning(false)
            }, 7000)
        } else {
            set_count(value)
            setShowWarning(false)
        }
    }

    // State dùng để mở modal
    const [modal, set_modal] = useState(false)
    // State thông báo lỗi comment
    const [error_comment, set_error_comment] = useState(false)
    const [star, set_star] = useState(1)
    const [comment, set_comment] = useState('')
    const [validation_comment, set_validation_comment] = useState(false)
    // state load comment
    const [load_comment, set_load_comment] = useState(true)
    // State list_comment
    const [list_comment, set_list_comment] = useState([])
    const [showPendingNotification, setShowPendingNotification] = useState(false);
    // Hàm này dùng để gọi API post comment sản phẩm của user
    const handler_Comment = () => {

        if (!sessionStorage.getItem('id_user')) { // Khi khách hàng chưa đăng nhập
            set_error_comment(true)
        } else { // Khi khách hàng đã đăng nhập
            if (!comment) {
                set_validation_comment(true)
                return
            }
            const data = {
                id_user: sessionStorage.getItem('id_user'),
                content: comment,
                star: star,
                status: "1"
            }
            const post_data = async () => {
                const response = await CommentAPI.post_comment(data, id)
                console.log(response)
                set_load_comment(true)
                set_comment('')
                set_modal(false)
                setShowPendingNotification(true);
            }
            post_data()
        }
        setTimeout(() => {
            setShowPendingNotification(false);
        }, 2000);
        setTimeout(() => {

            set_error_comment(false)
        }, 1500)
    }
    // Hàm này dùng để GET API load ra những comment của sản phẩm
    useEffect(() => {
        if (load_comment) {
            const fetchData = async () => {
                const response = await CommentAPI.get_comment(id)
                console.log(response)
                set_list_comment(response)
                console.log(response)
            }
            fetchData()
            const intervalId = setInterval(() => {
                fetchData()
            }, 3000) // 
            // Cleanup function để clear interval khi component unmount
            return () => {
                clearInterval(intervalId)
            }
            set_load_comment(false)
        }
    }, [load_comment])

    // Thêm state để lưu số sao trung bình
    const [averageRating, setAverageRating] = useState(0)

    // Thêm hàm tính số sao trung bình vào trước return
    useEffect(() => {
        if (list_comment && list_comment.length > 0) {
            const totalStars = list_comment.reduce((sum, comment) => sum + comment.star, 0)
            const average = totalStars / list_comment.length
            setAverageRating(average)
        }
    }, [list_comment])

    return (
        <div>
            {Loading && <div className="sk-cube-grid">
                <div className="sk-cube sk-cube1"></div>
                <div className="sk-cube sk-cube2"></div>
                <div className="sk-cube sk-cube3"></div>
                <div className="sk-cube sk-cube4"></div>
                <div className="sk-cube sk-cube5"></div>
                <div className="sk-cube sk-cube6"></div>
                <div className="sk-cube sk-cube7"></div>
                <div className="sk-cube sk-cube8"></div>
                <div className="sk-cube sk-cube9"></div>
            </div>}
            {showPendingNotification &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-check fix_icon_bell" style={{ fontSize: '40px', color: '#fff' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Bình luận của bạn đang được duyệt!</h4>
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
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Bạn Đã Thêm Hàng Thành Công!</h4>
                    </div>
                </div>
            }
            {
                error_comment &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff', backgroundColor: '#f84545' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Vui Lòng Kiểm Tra Lại Đăng Nhập!</h4>
                    </div>
                </div>
            }
            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="active">{product.name_product}</li>

                        </ul>
                    </div>
                </div>
            </div>

            <div className="content-wraper">
                <div className="container">
                    <div className="row single-product-area">
                        <div className="col-lg-5 col-md-6">
                            <div className="product-details-left">
                                <div className="product-details-images slider-navigation-1">
                                    <div className="lg-image">
                                        <img src={product.image} alt="product image" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7 col-md-6">
                            <div className="product-details-view-content pt-60">
                                <div className="product-info">
                                    <h2>{product.name_product}</h2>
                                    <div style={{ display: 'inline-block' }}>
                                        {product.depository === 0 ? (
                                            <span style={{ color: 'red' }}>Hết hàng</span>
                                        ) : (
                                            <>
                                                <label style={{ display: 'inline-block', marginRight: '10px' }}>Kho:</label>
                                                <div className="active" style={{ display: 'inline-block' }}>
                                                    {product.depository}
                                                </div>
                                            </>
                                        )}
                                    </div>


                                    <div className="price-box pt-20">
                                        {
                                            sale ? (<del className="new-price new-price-2" style={{ color: '#525252' }}>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product.price_product) + ' VNĐ'}</del>) :
                                                <span className="new-price new-price-2">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product.price_product) + ' VNĐ'}</span>
                                        }
                                        <br />
                                        {
                                            sale && (
                                                <span className="new-price new-price-2">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' })
                                                    .format(parseInt(sale.id_product.price_product) - ((parseInt(sale.id_product.price_product) * parseInt(sale.promotion)) / 100)) + ' VNĐ'}</span>
                                            )
                                        }
                                    </div>
                                    <div className="product-desc">
                                        {product.describe}
                                    </div>

                                    <div className="average-rating mb-15">
                                        <span style={{ marginRight: '10px' }}>Đánh giá trung bình: </span>
                                        <div style={{ display: 'inline-block' }}>
                                            <ul className="rating d-inline-block">
                                                <li><i className={averageRating >= 1 ? 'fa fa-star' : averageRating >= 0.5 ? 'fa fa-star-half-o' : 'fa fa-star-o'}></i></li>
                                                <li><i className={averageRating >= 2 ? 'fa fa-star' : averageRating >= 1.5 ? 'fa fa-star-half-o' : 'fa fa-star-o'}></i></li>
                                                <li><i className={averageRating >= 3 ? 'fa fa-star' : averageRating >= 2.5 ? 'fa fa-star-half-o' : 'fa fa-star-o'}></i></li>
                                                <li><i className={averageRating >= 4 ? 'fa fa-star' : averageRating >= 3.5 ? 'fa fa-star-half-o' : 'fa fa-star-o'}></i></li>
                                                <li><i className={averageRating >= 5 ? 'fa fa-star' : averageRating >= 4.5 ? 'fa fa-star-half-o' : 'fa fa-star-o'}></i></li>
                                            </ul>
                                            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                                                {averageRating.toFixed(1)}/5
                                            </span>
                                            <span style={{ marginLeft: '10px' }}>
                                                ({list_comment.length} đánh giá)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="single-add-to-cart">
                                        <form action="#" className="cart-quantity">
                                            {product.depository !== 0 && (
                                                <>
                                                    <div className="quantity">
                                                        <label>Số lượng:</label>
                                                        {existingCartCount > 0 && (
                                                            <div style={{
                                                                color: '#666',
                                                                fontSize: '14px',
                                                                marginBottom: '5px'
                                                            }}>
                                                                Bạn đã có {existingCartCount} sản phẩm trong giỏ hàng
                                                            </div>
                                                        )}
                                                        <div className="cart-plus-minus">
                                                            <input
                                                                className="cart-plus-minus-box"
                                                                value={count}
                                                                type="text"
                                                                onChange={handleCountChange}
                                                            />
                                                            <div className="dec qtybutton" onClick={downCount}>
                                                                <i className="fa fa-angle-down"></i>
                                                            </div>
                                                            <div className="inc qtybutton" onClick={upCount}>
                                                                <i className="fa fa-angle-up"></i>
                                                            </div>
                                                        </div>
                                                        {showWarning && (
                                                            <div style={{
                                                                color: 'red',
                                                                fontSize: '14px',
                                                                marginTop: '5px'
                                                            }}>
                                                                Số lượng bạn mua đã vượt quá số lượng trong kho
                                                            </div>
                                                        )}
                                                    </div>
                                                    <a
                                                        href="#"
                                                        className="add-to-cart"
                                                        type="submit"
                                                        onClick={handler_addcart}
                                                    >
                                                        Thêm vào giỏ hàng
                                                    </a>
                                                </>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="product-area pt-35">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="li-product-tab">
                                <ul className="nav li-product-menu">
                                    <li><a className="active" data-toggle="tab" href="#description"><span>Mô tả</span></a></li>
                                    <li><a data-toggle="tab" href="#reviews"><span>Đánh giá</span></a></li>


                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="tab-content">
                        <div id="description" className="tab-pane active show" role="tabpanel">
                            <div className="product-description">
                                <ul className='list-disc'>
                                    {product?.describe}
                                </ul>

                            </div>
                        </div>
                        <div id="reviews" className="tab-pane" role="tabpanel">
                            <div className="product-reviews">
                                <div className="product-details-comment-block">
                                    <div style={{ overflow: 'auto', height: '10rem' }}>
                                        {
                                            list_comment && list_comment.map(value => (
                                                value.status !== '1' && (<div className="comment-author-infos pt-25" key={value._id}>
                                                    <span>{value.id_user.fullname} <div style={{ fontWeight: '400' }}>{value.content}</div></span>
                                                    <ul className="rating">
                                                        <li><i className={value.star > 0 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 1 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 2 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 3 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 4 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                    </ul>
                                                </div>
                                                )
                                            ))
                                        }
                                    </div>

                                    <div className="review-btn" style={{ marginTop: '2rem' }}>
                                        <a className="review-links" style={{ cursor: 'pointer', color: '#fff' }} onClick={() => set_modal(true)}>Viết đánh giá của bạn!</a>
                                    </div>
                                    <Modal onHide={() => set_modal(false)} show={modal} className="modal fade modal-wrapper">
                                        <div className="modal-dialog modal-dialog-centered" role="document">
                                            <div className="modal-content">
                                                <div className="modal-body">
                                                    <h3 className="review-page-title">Viết đánh giá</h3>
                                                    <div className="modal-inner-area row">
                                                        <div className="col-lg-6">
                                                            <div className="li-review-product">
                                                                <img src={product.image} alt="Li's Product" style={{ width: '20rem' }} />
                                                                <div className="li-review-product-desc">
                                                                    <p className="li-product-name">{product.name_product}</p>
                                                                    <p>
                                                                        <span>{product.describe}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <div className="li-review-content">
                                                                <div className="feedback-area">
                                                                    <div className="feedback">
                                                                        <h3 className="feedback-title">Phản hồi</h3>
                                                                        <form action="#">
                                                                            <p className="your-opinion">
                                                                                <label>Đánh giá</label>
                                                                                <span>
                                                                                    <select className="star-rating" onChange={(e) => set_star(e.target.value)}>
                                                                                        <option value="1">1</option>
                                                                                        <option value="2">2</option>
                                                                                        <option value="3">3</option>
                                                                                        <option value="4">4</option>
                                                                                        <option value="5">5</option>
                                                                                    </select>
                                                                                </span>
                                                                            </p>
                                                                            <p className="feedback-form">
                                                                                <label htmlFor="feedback">Đánh giá của bạn</label>
                                                                                <textarea id="feedback" name="comment" cols="45" rows="8" aria-required="true" onChange={(e) => set_comment(e.target.value)}></textarea>
                                                                                {
                                                                                    validation_comment && <span style={{ color: 'red' }}>* Vui lòng nhập đánh giá!</span>
                                                                                }
                                                                            </p>
                                                                            <div className="feedback-input">
                                                                                <div className="feedback-btn pb-15">
                                                                                    <a className="close" onClick={() => set_modal(false)}>Đóng</a>
                                                                                    <a style={{ cursor: 'pointer' }} onClick={handler_Comment}>Gửi</a>
                                                                                </div>
                                                                            </div>
                                                                        </form>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Modal>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Detail_Product;