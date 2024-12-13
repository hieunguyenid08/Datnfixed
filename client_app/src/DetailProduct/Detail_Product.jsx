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

    //id_user được lấy từ redux
    // Get count từ redux khi user chưa đăng nhập
    const count_change = useSelector(state => state.Count.isLoad)
    const [sale, setSale] = useState()
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
    // Hàm này dùng để thêm vào giỏ hàng
    const handler_addcart = (e) => {
        e.preventDefault()
        const data = {
            id_cart: Math.random().toString(),
            id_product: id,
            name_product: product.name_product,
            price_product: sale ? parseInt(sale.id_product.price_product) - ((parseInt(sale.id_product.price_product) * parseInt(sale.promotion)) / 100) : product.price_product,
            count: count,
            image: product.image,
            size: 'S',
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
        set_count(count + 1)
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
                star: star
            }
            const post_data = async () => {
                const response = await CommentAPI.post_comment(data, id)
                console.log(response)
                set_load_comment(true)
                set_comment('')
                set_modal(false)
            }
            post_data()
        }
        setTimeout(() => {
            set_error_comment(false)
        }, 1500)
    }
    // Hàm này dùng để GET API load ra những comment của sản phẩm
    useEffect(() => {
        if (load_comment) {
            const fetchData = async () => {
                const response = await CommentAPI.get_comment(id)
                set_list_comment(response)
            }
            fetchData()
            set_load_comment(false)
        }
    }, [load_comment])

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

                                    <div className="single-add-to-cart">
                                        <form action="#" className="cart-quantity">
                                            {product.depository !== 0 && (
                                                <>
                                                    <div className="quantity">
                                                        <label>Số lượng:</label>
                                                        <div className="cart-plus-minus">
                                                            <input
                                                                className="cart-plus-minus-box"
                                                                value={count}
                                                                type="text"
                                                                onChange={(e) => set_count(e.target.value)}
                                                            />
                                                            <div className="dec qtybutton" onClick={downCount}>
                                                                <i className="fa fa-angle-down"></i>
                                                            </div>
                                                            <div className="inc qtybutton" onClick={upCount}>
                                                                <i className="fa fa-angle-up"></i>
                                                            </div>
                                                        </div>
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
                                                <div className="comment-author-infos pt-25" key={value._id}>
                                                    <span>{value.id_user.fullname} <div style={{ fontWeight: '400' }}>{value.content}</div></span>
                                                    <ul className="rating">
                                                        <li><i className={value.star > 0 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 1 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 2 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 3 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                        <li><i className={value.star > 4 ? 'fa fa-star' : 'fa fa-star-o'}></i></li>
                                                    </ul>
                                                </div>

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