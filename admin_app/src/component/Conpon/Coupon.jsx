import React, { useEffect, useState } from 'react';
import CouponAPI from '../Api/CouponAPI';
import Pagination from '../Shared/Pagination';
import Search from '../Shared/Search';
import queryString from 'query-string'
import { Link } from 'react-router-dom';

function Coupon(props) {

    const [filter, setFilter] = useState({
        page: '1',
        limit: '5',
        search: '',
        status: true
    })

    const [coupons, setCoupons] = useState([])
    const [totalPage, setTotalPage] = useState()


    useEffect(() => {
        const query = '?' + queryString.stringify(filter)

        const fetchAllData = async () => {
            const response = await CouponAPI.getCoupons(query)
            setCoupons(response.coupons)
            setTotalPage(response.totalPage)
        }
        fetchAllData()
    }, [filter])


    const onPageChange = (value) => {
        setFilter({
            ...filter,
            page: value
        })
    }

    const handlerSearch = (value) => {
        setFilter({
            ...filter,
            // page: '1',
            search: value
        })
    }

    const handleDelete = async (id) => {

        const response = await CouponAPI.deleteCoupons(id)

        setFilter({
            ...filter,
            status: !filter.status
        })

    }

    return (
        <div className="page-wrapper">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Coupons</h4>
                                <Search handlerSearch={handlerSearch} />

                                <Link to="/coupon/create" className="btn btn-primary my-3">New create</Link>

                                {/* <div className="table-responsive">
                                    <table className="table table-striped table-bordered no-wrap">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Code</th>
                                                <th>Count</th>
                                                <th>Promotion</th>
                                                <th>Describe</th>
                                                <th>Edit</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                coupons && coupons.map(value => (
                                                    <tr key={value._id}>
                                                        <td>{value._id}</td>
                                                        <td>{value.code}</td>
                                                        <td>{value.count}</td>
                                                        <td>{value.promotion}</td>
                                                        <td>{value.describe}</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <Link to={"/coupon/" + value._id} className="btn btn-success mr-1">Update</Link>

                                                                <button type="button" style={{ cursor: 'pointer', color: 'white' }} onClick={() => handleDelete(value._id)} className="btn btn-danger" >Delete</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }

                                        </tbody>
                                    </table>
                                    <Pagination filter={filter} onPageChange={onPageChange} totalPage={totalPage} />
                                </div> */}
                                 <div className="table-responsive">
                                    <table className="table table-striped table-bordered no-wrap">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Promotion</th>
                                                <th>Describe</th>
                                                <th>Start</th>
                                                <th>End</th>
                                                <th>Status</th>
                                                <th>Edit</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                coupons && coupons.map((value, index) => (
                                                    <tr key={index}>
                                                        <td className="name">{value.id_product?.name_product}</td>
                                                        <td className="name">{value.promotion}</td>
                                                        <td className="name">{value.describe}</td>
                                                        <td className="name">{value.start}</td>
                                                        <td className="name">{value.end}</td>
                                                        <td className="name">{value.status ? "Active" : "Disable"}</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <Link to={"/coupon/" + value._id} className="btn btn-success mr-1">Update</Link>
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
        </div>
    );
}

export default Coupon;