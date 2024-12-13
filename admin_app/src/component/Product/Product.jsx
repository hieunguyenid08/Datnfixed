import React, { useEffect, useState, Suspense} from 'react';
import { Link, Redirect } from 'react-router-dom';
import queryString from 'query-string'

import productAPI from '../Api/productAPI';
import Pagination from '../Shared/Pagination'
import Search from '../Shared/Search'
import LoadingOverlay from 'react-loading-overlay-ts';

function Product(props) {

    const [filter, setFilter] = useState({
        page: '1',
        limit: '5',
        search: '',
        status: true
    })

    const [products, setProducts] = useState([])
    const [totalPage, setTotalPage] = useState()
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const query = '?' + queryString.stringify(filter);

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const response = await productAPI.getAPI(query);
                setProducts(response.products);
                setTotalPage(response.totalPage);
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
            setLoading(false);
        };

        fetchAllData();
    }, [filter]);


    const onPageChange = (value) => {
        setFilter({
            ...filter,
            page: value
        })
    }

    const handlerSearch = (value) => {
        setFilter({
            ...filter,
            page: '1',
            search: value
        })
    }

    const handleDelete = async (value) => {

        const data = {
            id: value
        }
        const query = '?' + queryString.stringify(data)

        const response = await productAPI.delete(query)

        if (response.msg === "Thanh Cong") {
            setFilter({
                ...filter,
                status: !filter.status
            })
        }
    }

    return (
        <div className="page-wrapper">
    <LoadingOverlay
      active={loading}
      spinner
      text='Loading data ...'
    >
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                        
                            <div className="card-body">
                                <h4 className="card-title">Products</h4>
                                <Search handlerSearch={handlerSearch} />

                                <Link to="/product/create" className="btn btn-primary my-3">New create</Link>
                                <div className="table-responsive">
                                {/* {loading?(<div style={{display:'flex',justifyContent:'center',alignItems:'center'}}><ReactLoading type="bars" height={'20%'} width={'20%'} color="coral"/></div>): */}
                                    <table className="table table-striped table-bordered no-wrap">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Price</th>
                                                <th>Image</th>
                                                <th>Describe</th>
                                                {/* <th>Producer</th> */}
                                                <th>Category</th>
                                                <th>Edit</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {
                                                products && products.map((value, index) => (
                                                    <tr key={index}>
                                                        <td className="name">{value._id}</td>
                                                        <td className="name">{value.name_product}</td>
                                                        <td>{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.price_product)+ ' VNĐ'}</td>
                                                        <td><img src={value.image} alt="" style={{ width: '70px' }} /></td>
                                                        <td className="name" style={{ width: '40px' }}>{value.describe}</td>
                                                        <td>{value.id_category ? value.id_category.category : ""}</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <Link to={"/product/update/" + value._id} className="btn btn-success mr-1">Update</Link>

                                                                <button type="button" style={{ cursor: 'pointer', color: 'white' }} onClick={() => handleDelete(value._id)} className="btn btn-danger" >Delete</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    <Pagination filter={filter} onPageChange={onPageChange} totalPage={totalPage} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </LoadingOverlay>
        </div>
    );
}

export default Product;