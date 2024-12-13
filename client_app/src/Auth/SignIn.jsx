import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect} from 'react-router-dom';
import queryString from 'query-string'
import User from '../API/User';
import { useDispatch, useSelector } from 'react-redux';
import { addSession } from '../Redux/Action/ActionSession';
import Cart from '../API/CartAPI';
import { changeCount } from '../Redux/Action/ActionCount';

SignIn.propTypes = {
    
};

function SignIn(props) {

    const dispatch = useDispatch()

    const [username, set_username] = useState('')
    const [password, set_password] = useState('')

    const [error_username, set_error_username] = useState(false)
    const [error_password, set_error_password] = useState(false)

    const [redirect, set_redirect] = useState(false)
    // Get carts từ redux khi user chưa đăng nhập
    const carts = useSelector(state => state.Cart.listCart)

    // Get isLoad từ redux để load lại phần header
    const count_change = useSelector(state => state.Count.isLoad)

    const handler_signin = (e) => {

        e.preventDefault()

        const fetchData = async () => {

            const params = {
                username,
                password
            }

            const query = '?' + queryString.stringify(params)

            const response = await User.Get_Detail_User(query)

            if (response === "Khong Tìm Thấy User"){
                set_error_username(true)
            }else{
                if (response === "Sai Mat Khau"){
                    set_error_username(false)
                    set_error_password(true)
                }else{

                   console.log(response)

                    const action = addSession(response._id)
                    dispatch(action)

                    sessionStorage.setItem('id_user', response._id)
                    localStorage.setItem('jwt', response.jwt)
                    
                    const action_count_change = changeCount(count_change)
                    dispatch(action_count_change)

                    set_redirect(true)

                }
            }

        }

        fetchData()

    }


    return (
        <div>
            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">TRANG CHỦ</Link></li>
                            <li className="active">ĐĂNG NHẬP</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="page-section mb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xs-12 col-lg-6 mb-30 mr_signin">
                            <form action="#" >
                                <div className="login-form">
                                    <h4 className="login-title">ĐĂNG NHẬP</h4>
                                    <div className="row">
                                        <div className="col-md-12 col-12 mb-20">
                                            <label>Tài Khoản *</label>
                                            <input className="mb-0" type="text" placeholder="Tài Khoản" value={username} onChange={(e) => set_username(e.target.value)} />
                                            {
                                                error_username && <span style={{ color: 'red' }}>* Sai Tài Khoản!</span>
                                            }
                                        </div>
                                        <div className="col-12 mb-20">
                                            <label>Mật Khẩu</label>
                                            <input className="mb-0" type="password" placeholder="Mật Khẩu" value={password} onChange={(e) => set_password(e.target.value)} />
                                            {
                                                error_password && <span style={{ color: 'red' }}>* Sai Mật Khẩu!</span>
                                            }
                                        </div>
                                        <div className="col-md-8">
                                            <div className="check-box d-inline-block ml-0 ml-md-2 mt-10">
                                                <Link to="/signup">Bạn đã có tài khoản chưa?</Link>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mt-10 mb-20 text-left text-md-right">
                                            <a href="#"> Quên mật khẩu?</a>
                                        </div>
                                        <div className="col-md-12">
                                            {
                                                redirect && <Redirect to={localStorage.getItem('history')}/>
                                            }
                                            <button className="register-button mt-0" style={{ cursor: 'pointer'}} onClick={handler_signin}>Đăng nhập</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;