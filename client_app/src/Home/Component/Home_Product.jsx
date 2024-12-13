import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Product from '../../API/Product';
import queryString from 'query-string'
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SaleAPI from '../../API/SaleAPI';

Home_Product.propTypes = {
    gender: PropTypes.string,
    category: PropTypes.string,
    GET_id_modal: PropTypes.func
};

Home_Product.defaultProps = {
    gender: '',
    category: '',
    GET_id_modal: null
}
function Home_Product(props) {
    const { gender, category, GET_id_modal } = props
    var settings = {
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };
    const [products, set_products] = useState([])
    const [product_category, set_product_category] = useState([])
    // Hàm này dùng gọi API trả lại dữ liệu product category
    useEffect(() => {
        const fetchData = async () => {
            const params = {
                id_category: category
            }
            const query = '?' + queryString.stringify(params)
            const response = await Product.Get_Category_Product(query)
            set_products(response.splice(0, 15))
        }
        fetchData()
    }, [])
    useEffect(() => {
        const fetchData = async () => {
            const response = await SaleAPI.getList()
            set_product_category(response)
        }
        fetchData()
    }, [])

    return (
        <section className="product-area li-laptop-product pt-60 pb-45">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="li-section-title">
                            <h2>
                                <span>{gender}</span>
                            </h2>
                        </div>
                        <Slider {...settings}>
                            {
                                products && products.map(value => (
                                    <div className="col-lg-12 col_product" style={{ zIndex: '999', height: '30rem', position: 'relative' }} key={value._id}>
                                        <div className="single-product-wrap">
                                            <div className="product-image">
                                                <Link to={`/detail/${value._id}`}>
                                                    <img style={{ height: 250, objectFit: 'contain' }} src={value.image} alt="Li's Product Image" />
                                                </Link>
                                                <span className="sticker">Mới</span>
                                            </div>
                                            <div className="product_desc">
                                                <div className="product_desc_info">
                                                    <div className="product-review" >
                                                        <h5 className="manufacturer" style={{ height: 40, display: 'flex', alignItems: 'center' }}>
                                                            <Link to={`/detail/${value._id}`}>{value.name_product}</Link>
                                                        </h5>
                                                    </div>
                                                    <div className="price-box">
                                                        {
                                                            (() => {
                                                                const index = product_category.findIndex(obj => {
                                                                    return Object.keys(obj.id_product).some(key => obj.id_product[key] === value._id);
                                                                });

                                                                if (index !== -1) {
                                                                    return (
                                                                        <>
                                                                            <del className="new-price">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product_category[index].id_product?.price_product) + ' VNĐ'}</del>
                                                                            <span className="new-price" style={{ color: 'red' }}>
                                                                                {new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' })
                                                                                    .format(parseInt(product_category[index].id_product?.price_product) - ((parseInt(product_category[index].id_product?.price_product) * parseInt(product_category[index].promotion)) / 100)) + ' VNĐ'}
                                                                            </span>
                                                                        </>
                                                                    );
                                                                } else {
                                                                    return <div className="new-price">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'}</div>;
                                                                }
                                                            })()
                                                        }
                                                    </div>
                                                    <ul className="rating" style={{ marginTop: 10 }}>
                                                        <li><i style={{ fontSize: 20 }} className="fa fa-star-o"></i></li>
                                                        <li><i style={{ fontSize: 20 }} className="fa fa-star-o"></i></li>
                                                        <li><i style={{ fontSize: 20 }} className="fa fa-star-o"></i></li>
                                                        <li><i style={{ fontSize: 20 }} className="fa fa-star-o"></i></li>
                                                        <li className="no-star"><i style={{ fontSize: 20 }} className="fa fa-star-o"></i></li>
                                                    </ul>
                                                </div>
                                                <div className="add_actions">
                                                    <ul className="add-actions-link">
                                                        <li><a href="#" title="quick view"
                                                            className="links-details"
                                                            data-toggle="modal"
                                                            data-target={`#${value._id}`}
                                                            onClick={() => GET_id_modal(`${value._id}`)}><i className="fa fa-eye"></i></a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </Slider>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Home_Product;