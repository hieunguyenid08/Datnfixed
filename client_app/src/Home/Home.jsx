import React, { useEffect, useState } from 'react';
import Home_Category from './Component/Home_Category';
import Home_Product from './Component/Home_Product';
import Product from '../API/Product';
import { changeCount } from '../Redux/Action/ActionCount';
import { useDispatch, useSelector } from 'react-redux';
import CartsLocal from '../Share/CartsLocal';
import SaleAPI from '../API/SaleAPI';
function Home() {
    // state dùng để thay đổi và hiển thị modal
    const [id_modal, set_id_modal] = useState('')
    const [count, set_count] = useState(1)
    const [show_success, set_show_success] = useState(false)
    const [product_detail, set_product_detail] = useState([])
    const [product, set_product] = useState([])
    const dispatch = useDispatch()
    const [priceSale, setPriceSale] = useState(0)
    const GET_id_modal = (value, price) => {
        set_id_modal(value)
        setPriceSale(price)
    }
    const [sale, setSale] = useState([])
    const productTemp = [];
    useEffect(() => {
        if (id_modal !== '') {
            const fetchData = async () => {
                const response = await Product.Get_Detail_Product(id_modal);
                set_product_detail(response);
                const resDetail = await SaleAPI.checkSale(id_modal)
                console.log(resDetail)
                if (resDetail.msg === "Thanh Cong") {
                    setSale(resDetail.sale)
                }
                else {
                    setSale(null);
                }
            }
            fetchData();
        }

    }, [id_modal])

    useEffect(() => {
        const fetchData = async () => {
            const response = await Product.Get_All_Product();
            set_product(response);
        }
        fetchData();
    }, [])
    // Get count từ redux khi user chưa đăng nhập
    const count_change = useSelector(state => state.Count.isLoad)

    // Hàm này dùng để thêm vào giỏ hàng
    const handler_addcart = (e) => {
        e.preventDefault()
        const data = {
            id_cart: Math.random().toString(),
            id_product: id_modal,
            name_product: product_detail.name_product,
            price_product: sale ? parseInt(product_detail.price_product) - ((parseInt(product_detail.price_product) * parseInt(sale?.promotion)) / 100) : product_detail?.price_product,
            count: count,
            image: product_detail.image,
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

    function SetArray(product) {
        product && product.map((index) => { productTemp.push(index.gender) })
    }
    SetArray(product);
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
    return (
        <div className="container" >
            {
                show_success &&
                <div className="modal_success" style={{ position: 'fixed', right: 0, top: 0 }}>
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Bạn Đã Thêm Hàng Thành Công!</h4>
                    </div>
                </div>
            }
            <div className="slider-with-banner">
                <div className="row" >
                    <div className="col-lg-12 col-md-12">
                        <div>
                            <div className="carousel-inner">
                                <div className="single-slide align-center-left animation-style-01 bg-1"
                                    style={{ backgroundImage: `url(https://intphcm.com/data/upload/banner-la-gi.jpg` }}>
                                    <div className="slider-progress"></div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Home_Category GET_id_modal={GET_id_modal} />
            <div className="li-static-banner">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-4 text-center">
                            <div className="single-banner">
                               
                                    <img  src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/gian-hang-samsung-home.png" alt="Li's Static Banner" />
                               
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 text-center pt-xs-30">
                            <div className="single-banner">
                               
                                    <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/apple-chinh-hang-home.jpg" alt="Li's Static Banner" />
                               
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 text-center pt-xs-30">
                            <div className="single-banner">
                               
                                    <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/SIS%20asus.png" alt="Li's Static Banner" />
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Sửa Nhà bếp thành Điện Thoại */}
            <Home_Product gender={`Điện Thoại`} category={'655a1c5423f28980f81145c7'} GET_id_modal={GET_id_modal} />
            <Home_Product gender={`Tủ Lạnh`} category={'65a2232ac177c63bbf7896c9'} GET_id_modal={GET_id_modal} />
            <Home_Product gender={`TV`} category={'65a2238ec177c63bbf794e27'} GET_id_modal={GET_id_modal} />
            <Home_Product gender={`Máy Giặt`} category={'65a223ebc177c63bbf7a11bc'} GET_id_modal={GET_id_modal} />

            <div className="modal fade modal-wrapper" id={id_modal} >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-body">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <div className="modal-inner-area row">
                                <div className="col-lg-5 col-md-6 col-sm-6" >
                                    <div className="product-details-left" style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                                        <div className="product-details-images slider-navigation-1">
                                            <div className="lg-image" >
                                                <img style={{ height: 450, objectFit: 'contain' }} src={product_detail.image} alt="product image" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-7 col-md-6 col-sm-6">
                                    <div className="product-details-view-content pt-60">
                                        <div className="product-info">
                                            <h2>{product_detail?.name_product}</h2>
                                            <div className="rating-box pt-20">
                                                <ul className="rating rating-with-review-item">
                                                    <li><i className="fa fa-star-o"></i></li>
                                                    <li><i className="fa fa-star-o"></i></li>
                                                    <li><i className="fa fa-star-o"></i></li>
                                                    <li><i className="fa fa-star-o"></i></li>
                                                    <li className="no-star"><i className="fa fa-star-o"></i></li>
                                                </ul>
                                            </div>
                                            <div className="price-box pt-20">
                                                {

                                                    priceSale ? (<del className="new-price new-price-2" style={{ color: '#525252' }}>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product_detail?.price_product) + ' VNĐ'}</del>) :
                                                        <span className="new-price new-price-2">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product_detail?.price_product) + ' VNĐ'}</span>
                                                }
                                                <br />
                                                {
                                                    priceSale && <span className="new-price new-price-2">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(priceSale) + ' VNĐ'}</span>
                                                }
                                            </div>
                                            <div className="product-desc">
                                                {product_detail.describe}
                                            </div>
                                            <div className="single-add-to-cart">
                                                <form onSubmit={handler_addcart} className="cart-quantity">
                                                    <div className="quantity">
                                                        <label>Quantity</label>
                                                        <div className="cart-plus-minus">
                                                            <input className="cart-plus-minus-box" value={count} type="text" onChange={(e) => set_count(e.target.value)} />
                                                            <div className="dec qtybutton" onClick={downCount}><i className="fa fa-angle-down"></i></div>
                                                            <div className="inc qtybutton" onClick={upCount}><i className="fa fa-angle-up"></i></div>
                                                        </div>
                                                    </div>
                                                    <button className="add-to-cart" type="submit">Add to cart</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Home;