import React, { useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SaleAPI from '../../API/SaleAPI';
Products.propTypes = {
    products: PropTypes.array,
    sort: PropTypes.string
};

Products.defaultProps = {
    products: [],
    sort: ''
}

function Products(props) {

    const { products, sort } = props
    const [product_category, set_product_category] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            const response = await SaleAPI.getList()
            set_product_category(response)
        }
        fetchData()
    }, [])
    if (sort === 'DownToUp') {
        products.sort((a, b) => {
            return a.price_product - b.price_product
        });
    }
    else if (sort === 'UpToDown') {
        products.sort((a, b) => {
            return b.price_product - a.price_product
        });
    }

    return (
        <div className="row">
            {
                products && products.map(value => (
                    <div className="col-lg-4 col-md-4 col-sm-6 mt-40 animate__animated animate__zoomIn col_product" key={value._id}>
                        <div className="single-product-wrap">
                            <div className="product-image">
                                <Link to={`/detail/${value._id}`}>
                                    <img style={{height:250,objectFit: 'contain'}}src={value.image} alt="Li's Product Image" />
                                </Link>
                                {/* <span className="sticker">New</span> */}
                                {
                                                                (() => {
                                                                    const index = product_category.findIndex(obj => {
                                                                        return Object.keys(obj.id_product).some(key => obj.id_product[key] === value._id);
                                                                    });

                                                                    if (index !== -1) {
                                                                        return (
                                                                            <>
                                                                               
                                                                               <span className="sticker">-{product_category[index].promotion}%</span>
                                                                            </>
                                                                        );
                                                                    } else {
                                                                        return <span className="sticker">Mới</span>;
                                                                    }
                                                                })()
                                                            }
                            </div>
                            <div className="product_desc">
                                <div className="product_desc_info">
                                    <div className="product-review">
                                        <h5 className="manufacturer">
                                            {/* <a href="product-details.html">{value.gender}</a> */}
                                        </h5>
                                        <div className="rating-box">
                                            <ul className="rating">
                                                <li><i className="fa fa-star-o"></i></li>
                                                <li><i className="fa fa-star-o"></i></li>
                                                <li><i className="fa fa-star-o"></i></li>
                                                <li><i className="fa fa-star-o"></i></li>
                                                <li className="no-star"><i className="fa fa-star-o"></i></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <Link to={`/detail/${value._id}`}><h4 style={{height:40,display:'flex',alignItems:'center'}}className='product_name'>{value.name_product}</h4></Link>
                                    <div className="price-box">
                                        {/* <span className="new-price">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.price_product)+ ' VNĐ'}</span> */}
                                        {
                                                                (() => {
                                                                    const index = product_category.findIndex(obj => {
                                                                        return Object.keys(obj.id_product).some(key => obj.id_product[key] === value._id);
                                                                    });

                                                                    if (index !== -1) {
                                                                        return (
                                                                            <>
                                                                                <del className="new-price">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product_category[index].id_product?.price_product) + ' VNĐ'}</del>
                                                                                <br />
                                                                                <span className="new-price" style={{ color: 'red' }}>
                                                                                    {new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' })
                                                                                        .format(parseInt(product_category[index].id_product?.price_product) - ((parseInt(product_category[index].id_product?.price_product) * parseInt(product_category[index].promotion)) / 100)) + ' VNĐ'}
                                                                                </span>
                                                                               
                                                                            </>
                                                                        );
                                                                    } else {
                                                                        return <span className="price_product_search" style={{ color: 'black' }}>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'}</span>;
                                                                    }
                                                                })()
                                                            }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}

export default Products;