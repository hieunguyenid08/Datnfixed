import React, { useEffect, useState } from 'react';
import './Event.css'
import queryString from 'query-string'
import CouponAPI from '../API/CouponAPI';
import Pagination from '../Shop/Component/Pagination';
import { Link } from 'react-router-dom';
import axiosClient from '../API/axiosClient.jsx'

function Event(props) {

    const [pagination, setPagination] = useState({
        page: '1',
        limit: '6',
        search: ''
    })

    const [coupons, setCoupons] = useState([])
    const [totalPage, setTotalPage] = useState()


    useEffect(() => {
        const query = '?' + queryString.stringify(pagination);
        const fetchAllData = async () => {
          const token = localStorage.getItem('jwt');  // Get token from localStorage
    
          if (!token) {
            console.error('No JWT token found');
            return;
          }
    
          try {
            const response = await CouponAPI.getCoupons(query, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });        // Update state with fetched data
            setCoupons(response);
            setTotalPage(response.totalPage);
          } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error (maybe show a message to the user)
          }
          
        };
    
        fetchAllData();
      }, [pagination]); 


    const handlerChangePage = (value) => {
        setPagination({
            ...pagination,
            page: value
        })
    }
    console.log(coupons)
    return (
        <div>
            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><a href="index.html">Trang chủ</a></li>
                            <li className="active">Sự kiện</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="container" style={{ marginTop: '3rem' }}>
                <div className="grid-container" style={{ padding: '2rem'}}>
                    {
                        coupons && coupons.map(value => (
                            <div className="bg_event animate__animated animate__zoomIn col_product">
                                <div>
                                    <div>
                                        <img style={{ width: '100%' }} src="https://cdn.tgdd.vn/hoi-dap/1321785/banner-la-gi-khac-gi-voi-poster-cach-de-thiet-ke-mot%20(2).jpg" alt="" />
                                    </div>
                                    <div style={{ padding: '1rem 1.2rem' }}>
                                        <h4 className="h4_event">{value.describe}</h4>
                                        <div style={{ marginTop: '2rem' }}>
                                            <a className="a_event">Khuyến mãi</a>
                                        </div>
                                        <div style={{ marginTop: '2rem' }}>
                                            <span style={{ fontSize: '1rem', color: 'gray' }}>Còn lại: <i style={{ color: '#fed700' }}>{value.count} lần</i></span>
                                        </div>
                                        <hr />
                                        <div style={{ marginTop: '.5rem' }}>
                                            <span style={{ fontSize: '1rem', color: 'gray' }}>
                                                Cơ hội nhận nhiều ưu đãi khi mua sản phẩm tại shop của chúng tôi
                                    </span>
                                        </div>
                                        <div style={{ marginTop: '1rem' }} className="d-flex justify-content-center">
                                            <Link to={`/event/${value._id}`} className="a_promotion">Xem Ngay</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="d-flex justify-content-center" style={{ padding: '2rem 0' }}>
                    <Pagination pagination={pagination} handlerChangePage={handlerChangePage} totalPage={totalPage} />
                </div>

            </div>
        </div>
    );
}

export default Event;