import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string'

import userAPI from '../Api/userAPI';
import Pagination from '../Shared/Pagination'
import Search from '../Shared/Search'
import ReactLoading from 'react-loading';


function UserCus(props) {
    const [filter, setFilter] = useState({
        permission: '6087dcb5f269113b3460fce4',
        page: '1',
        limit: '4',
        search: '',
        status: true
    })

    const [users, setUsers] = useState(null)
    const [totalPage, setTotalPage] = useState()


    useEffect(() => {
        const query = '?' + queryString.stringify(filter)

        const fetchAllData = async () => {
            const response = await userAPI.getAPI(query)
            setUsers(response.users)
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
            page: '1',
            search: value
        })
    }

    const handleDelete = async (value) => {
        const query = '?' + queryString.stringify({ id: value._id })

        const response = await userAPI.delete(query)

        if (response.msg === "Thanh Cong") {
            setFilter({
                ...filter,
                status: !filter.status
            })
        }
    }


    return (
        <div className="page-wrapper">

            <div className="container-fluid">

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                        {users==null?<div style={{display:'flex',justifyContent:'center',alignItems:'center'}}><ReactLoading type="bars" height={'20%'} width={'20%'} color="coral"/></div>:
                            <div className="card-body">
                                <h4 className="card-title">Users</h4>
                                <Search handlerSearch={handlerSearch} />

                                <Link to="/customer/create" className="btn btn-primary my-3">New create</Link>
                                
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered no-wrap">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Permission</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                users && users.map((value, index) => (
                                                    <tr key={index}>
                                                        <td>{value._id}</td>
                                                        <td>{value.fullname}</td>
                                                        <td>{value.email}</td>
                                                        <td>admin</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <Link to={"user/update/" + value._id} className="btn btn-success mr-1">Update</Link>

                                                                <button type="button" style={{ cursor: 'pointer', color: 'white' }} onClick={() => handleDelete(value)} className="btn btn-danger" >Delete</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    <Pagination filter={filter} onPageChange={onPageChange} totalPage={totalPage} />
                                </div>
                                
                            </div>}

                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}

export default UserCus;