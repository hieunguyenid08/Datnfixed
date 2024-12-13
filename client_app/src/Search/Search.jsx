import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string'
import Product from '../API/Product';
import './Search.css'
import { Link } from 'react-router-dom';
import axios from "axios";
import SaleAPI from '../API/SaleAPI';
Search.propTypes = {
    products: PropTypes.array,
    sort: PropTypes.string
};
Search.defaultProps = {
    products: [],
    sort: ''
}

function Search(props) {

    const [products, set_products] = useState([])
    const [page, set_page] = useState(1)
    const { sort } = props
    const [show_load, set_show_load] = useState(true)

    useEffect(() => {

        setTimeout(() => {

            const fetchData = async () => {

                const params = {
                    page: page,
                    count: '6',
                    search: sessionStorage.getItem('search')
                }

                const query = '?' + queryString.stringify(params)

                const response = await Product.get_search_list(query)

                if (response.length < 1) {
                    set_show_load(false)
                }

                set_products(prev => [...prev, ...response])

            }

            fetchData()

        }, 2500)

    }, [page])
    const [file, setFile] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [products1, setProducts1] = useState(null);  // Thay đổi biến từ products thành products1
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };
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
    const handleUpload = async () => {
        if (!file) {
            alert('Please select an image');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            setError(null);

            // Gửi yêu cầu đến backend Flask API
            const response = await axios.post('http://localhost:5000/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Nhận kết quả từ API và cập nhật state
            const { predictions, products } = response.data;
            setPredictions(predictions);
            setProducts1(products);  // Sử dụng products1 thay cho products
            setLoading(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('An error occurred while uploading the image');
            setLoading(false);
        }
    };

    return (

        <div className="content-wraper pt-60 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">

                        <div className="shop-products-wrapper">
                            <div className="row">
                                <div className="col">
                                    <InfiniteScroll
                                        style={{ overflow: 'none' }}
                                        dataLength={products.length}
                                        next={() => set_page(page + 1)}
                                        hasMore={true}
                                        loader={show_load ? <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                                            : <h4 className="text-center" style={{ paddingTop: '3rem', color: '#FED700' }}>Sản phẩm đã hiện lên tất cả!</h4>}
                                    >
                                        {
                                            products && products.map(value => (
                                                <Link to={`/detail/${value._id}`}>
                                                    <div className="row product-layout-list" key={value._id}>
                                                        <div className="col-lg-3 col-md-5 ">
                                                            <div className="product-image">
                                                                <Link to={`/detail/${value._id}`}>
                                                                    <img src={value.image} alt="Li's Product Image" />
                                                                </Link>
                                                                <span className="sticker">Mới</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-5 col-md-7">
                                                            <div className="product_desc">
                                                                <div className="product_desc_info">
                                                                    <div className="product-review">
                                                                        <h5 className="manufacturer">
                                                                            <a href="product-details.html">{value.name_product}</a>
                                                                        </h5>
                                                                        <div className="rating-box">
                                                                            <ul className="rating">
                                                                                <li><i className="fa fa-star" /></li>
                                                                                <li><i className="fa fa-star" /></li>
                                                                                <li><i className="fa fa-star" /></li>
                                                                                <li><i className="fa fa-star" /></li>
                                                                                <li><i className="fa fa-star" /></li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                    <h4>{value.name_product}</h4>
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
                                                                   
                                                                    <p> {value.describe}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">

                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        }
                                    </InfiniteScroll>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Search;