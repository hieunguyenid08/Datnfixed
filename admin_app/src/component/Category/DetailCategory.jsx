import React, { useState, useEffect } from 'react';
import queryString from 'query-string'
import { Link } from 'react-router-dom'

import categoryAPI from '../Api/categoryAPI';
import productAPI from '../Api/productAPI';
import Pagination from '../Shared/Pagination'
import Search from '../Shared/Search'
import LoadingOverlay from 'react-loading-overlay-ts';

function DetailCategory(props) {
    const [category] = useState(props.match.params.id)
    const [filter, setFilter] = useState({
        page: '1',
        limit: '5',
        search: '',
        status: true,
    })

    const [products, setProducts] = useState([])
    const [totalPage, setTotalPage] = useState()
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const query = '?' + queryString.stringify(filter);

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const response = await categoryAPI.detailProduct(category, query);
                setProducts(response.products);
                setTotalPage(response.totalPage);
            } catch (err) {
                console.error(err.message || 'An error occurred');
            }
            setLoading(false);
        };

        fetchAllData();
    }, [filter, category]);

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
                                <h4 className="card-title">{category}</h4>
                                <Search handlerSearch={handlerSearch} />

                                <div className="table-responsive my-3">
                                    <table className="table table-striped table-bordered no-wrap">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Price</th>
                                                <th>Image</th>
                                                <th>Edit</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                products && products.map((value, index) => (
                                                    <tr key={index}>
                                                        <td className="name">{value._id}</td>
                                                        <td className="name">{value.name_product}</td>
                                                        <td>{value.price_product}</td>
                                                        <td><img src={value.image} alt="" style={{ width: '70px' }} /></td>
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

export default DetailCategory;