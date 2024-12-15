import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string'

import permissionAPI from '../Api/permissionAPI';
import Pagination from '../Shared/Pagination'
import Search from '../Shared/Search'
import SaleAPI from '../Api/SaleAPI';
import LoadingOverlay from 'react-loading-overlay-ts';


function Sale(props) {
    const [filter, setFilter] = useState({
        page: '1',
        limit: '4',
        search: '',
        status: true
    })

    const [sale, setSale] = useState([])
    const [totalPage, setTotalPage] = useState()
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const query = '?' + queryString.stringify(filter);

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const ct = await SaleAPI.getAll(query);
                setTotalPage(ct.totalPage);
                setSale(ct.sale);
                console.log(ct.sale);
            } catch (err) {
                console.error(err.message || 'An error occurred');
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
                                <h4 className="card-title">Sale</h4>
                                <Search handlerSearch={handlerSearch} />

                                <Link to="/sale/create" className="btn btn-primary my-3">New create</Link>


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
                                                sale && sale.map((value, index) => (
                                                    <tr key={index}>
                                                        <td className="name">{value.id_product?.name_product}</td>
                                                        <td className="name">{value.promotion}</td>
                                                        <td className="name">{value.describe}</td>
                                                        <td className="name">{value.start}</td>
                                                        <td className="name">{value.end}</td>
                                                        <td className="name">{value.status ? "Active" : "Disable"}</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <Link to={"/sale/" + value._id} className="btn btn-success mr-1">Update</Link>
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

export default Sale;