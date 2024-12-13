import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import User from '../API/User';
import logo from '../Image/logo_ecommerce_website_806.jpg'
import { changeCount } from '../Redux/Action/ActionCount';
import { addSession, deleteSession } from '../Redux/Action/ActionSession';
import queryString from 'query-string'
import Product from '../API/Product';
import { addSearch } from '../Redux/Action/ActionSearch';
import CartsLocal from './CartsLocal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { isMobile } from 'react-device-detect';
import './styles.css';
import SaleAPI from '../API/SaleAPI';
import axios from "axios";
import { jwtDecode } from 'jwt-decode'

function Header(props) {
    // State count of cart
    const [count_cart, set_count_cart] = useState(0)
    const [total_price, set_total_price] = useState(0)
    const [promotion, set_promotion] = useState(0)
    const [carts_mini, set_carts_mini] = useState([])

    // Hàm này để khởi tạo localStorage dùng để lưu trữ giỏ hàng
    // Và nó sẽ chạy lần đầu
    useEffect(() => {
        if (localStorage.getItem('carts') !== null) {
            set_carts_mini(JSON.parse(localStorage.getItem('carts')));
        } else {
            localStorage.setItem('carts', JSON.stringify([]))
        }
    }, [])

    // Xử lý thanh navigation
    const [header_navbar, set_header_navbar] = useState('header-bottom header-sticky')
    window.addEventListener('scroll', () => {
        if (window.pageYOffset < 200) {
            set_header_navbar('header-bottom header-sticky')
        } else {
            set_header_navbar('header-bottom header-sticky offset_navigation animate__animated animate__fadeInUp')
        }
    })
    const dispatch = useDispatch()

    //Sau khi F5 nó sẽ kiểm tra nếu phiên làm việc của Session vẫn còn thì nó sẽ tiếp tục
    // đưa dữ liệu vào Redux
    if (sessionStorage.getItem('id_user')) {
        const action = addSession(sessionStorage.getItem('id_user'))
        dispatch(action)
    }
    //Get IdUser từ redux khi user đã đăng nhập
    // Get carts từ redux khi user chưa đăng nhập
    // const carts = useSelector(state => state.Cart.listCart)

    const [active_user, set_active_user] = useState(false)

    const [user, set_user] = useState({})

    // Hàm này dùng để hiện thị
    useEffect(() => {// user đã đăng nhâp
        let mounted = true;

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('jwt')
                const decoded = jwtDecode(token);
                const response = await User.Get_User(decoded.id)
                if (mounted) {
                    set_user(response)
                    if(response){
                        set_active_user(true)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchData()

        // Cleanup function
        return () => {
            mounted = false;
        }
    }, [])
    // Hàm này dùng để xử lý phần log out
    const handler_logout = () => {
        const action = deleteSession('')
        dispatch(action)
        sessionStorage.clear()
        localStorage.clear('jwt')
    }
    // Get trạng thái từ redux khi user chưa đăng nhập
    const count = useSelector(state => state.Count.isLoad)
    // Hàm này dùng để load lại dữ liệu giỏ hàng ở phần header khi có bất kì thay đổi nào
    // Phụ thuộc vào thằng redux count
    useEffect(() => {
        if (count) {
            showData(JSON.parse(localStorage.getItem('carts')), 0, 0)
            const action = changeCount(count)
            dispatch(action)
        }
    }, [count])

    // Hàm này là hàm con chia ra để xử lý
    function showData(carts, sum, price) {
        carts.map(value => {
            sum += value.count
            price += parseInt(value.price_product) * parseInt(value.count)
        })
        set_count_cart(sum)
        set_total_price(price)
        set_carts_mini(carts)
    }


    // Hàm này dùng để xóa carts_mini
    const handler_delete_mini = (id_cart) => {
        CartsLocal.deleteProduct(id_cart)
        const action_change_count = changeCount(count)
        dispatch(action_change_count)
    }
    // state keyword search
    const [keyword_search, set_keyword_search] = useState('')
    const [products, set_products] = useState([])
    const [product_category, set_product_category] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            const response = await Product.Get_All_Product()
            set_products(response)
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


    // Hàm này trả ra list product mà khách hàng tìm kiếm
    // sử dụng useMemo để performance hơn vì nếu mà dữ liệu mới giống với dữ liệu cũ thì nó sẽ lấy cái
    // Không cần gọi API để tạo mới data
    const search_header = useMemo(() => {
        const new_data = products.filter(value => {
            return value?.name_product?.toUpperCase().indexOf(keyword_search.toUpperCase()) !== -1
        })
        return new_data
    }, [keyword_search])
    const handler_search = (e) => {
        e.preventDefault()
        // Đưa vào redux để qua bên trang search lấy query tìm kiếm
        const action = addSearch(keyword_search)
        dispatch(action)
        // set cho nó cái session
        sessionStorage.setItem('search', keyword_search)
        window.location.replace('/search')
    }
    const [isCartVisible, setCartVisible] = useState(false);
    const [isUserVisible, setUserVisible] = useState(false);
    const [isSearchVisible, setSearchVisible] = useState(false);
    const cartRef = useRef(null);
    const userRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                // Clicked outside the mini cart
                setCartVisible(false);
            }
            if (userRef.current && !userRef.current.contains(event.target)) {
                // Clicked outside the mini cart
                setUserVisible(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                // Clicked outside the mini cart
                setSearchVisible(false);
            }
        };
        if (isCartVisible || isUserVisible || isSearchVisible) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isCartVisible, isUserVisible, isSearchVisible]);

    const toggleCartVisibility = () => {
        setCartVisible(!isCartVisible);
    };
    const toggleUserVisibility = () => {
        if (active_user === true)
            setUserVisible(!isUserVisible);
    };
    const history = useHistory();
    const handleSignInClick = () => {
        // Use history.push to navigate to the "/signin" route
        localStorage.setItem('history', history.location.pathname)
        history.push('/signin');
    }
    const [file, setFile] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [products1, setProducts1] = useState(null);  // Thay đổi biến từ products thành products1
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

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
        <header>
            <div className="header-middle pl-sm-0 pr-sm-0 pl-xs-0 pr-xs-0 ">
                <div className="container pb_header">
                    <div className="row">
                        <div className="col-lg-3">
                            <div className="logo pb-sm-30 pb-xs-30">
                                <Link to="/">
                                    <img src={logo} style={{ width: '5rem' }} />
                                </Link>
                            </div>
                        </div>
                        {!isMobile && <div className="col-lg-9 pl-0 ml-sm-15 ml-xs-15 d-flex justify-content-between align-items-center">
                            <form action="/search" className="hm-searchbox" style={{ width: "50px" }} onSubmit={handler_search}>
                                <input type="text" placeholder="Tìm kiếm ..." value={keyword_search} onChange={(e) => { set_keyword_search(e.target.value); setSearchVisible(true) }} />
                                <button className="li-btn" type="submit"><i className="fa fa-search"></i></button>
                            
                                {isSearchVisible &&
                                    keyword_search && <div className="show_search_product" ref={searchRef}>
                                        {
                                            search_header && search_header.map(value => (
                                                <>
                                                <Link to={`/detail/${value._id}`} onClick={() => setSearchVisible(false)} style={{ padding: '.8rem' }}>
                                                    <div className="hover_box_search d-flex" key={value._id}>
                                                        <img className="img_list_search" src={value.image} alt="" />
                                                        <div className="group_title_search" style={{ marginTop: '2.7rem' }}>
                                                            <h6 className="title_product_search">{value.name_product}</h6>
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
                                                                        return <span className="price_product_search">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'}</span>;
                                                                    }
                                                                })()
                                                            }

                                                        </div>
                                                    </div>

                                                </Link>
                                              
                                                </>
                                            ))
                                        }
                                    </div>
                                }
                            </form>
                            <div  className="hm-searchbox1"  onSubmit={handler_search}>
                             
                            <Link to={`/imgSearch`}  ><button className="li-btn" type="submit"><i className="fa fa-camera"></i></button>/</Link>
                            
                               
                            </div>
                           
                            <div className="ml-15 header-middle-right d-flex justify-content-between align-items-center" onClick={toggleCartVisibility}>
                                <ul className="hm-menu d-flex justify-content-between align-items-center">
                                    <li className="hm-wishlist d-flex justify-content-between align-items-center">
                                        <li className="hm-minicart d-flex">
                                            <div className="hm-minicart-trigger"
                                                data-toggle="collapse"
                                                data-target="#collapse_carts"
                                                aria-expanded="false"
                                                aria-controls="collapse_carts">
                                                <span className="item-icon"></span>
                                                <span className="item-text">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(total_price) + ' VNĐ'}
                                                    <span className="cart-item-count">{count_cart}</span>
                                                </span>
                                            </div>
                                            <span></span>

                                            {isCartVisible && (
                                                <div className="minicart" ref={cartRef}>
                                                    <ul className="minicart-product-list">
                                                        {
                                                            carts_mini && carts_mini.map((value, index) => (
                                                                <li key={index}>
                                                                    <Link to={`/detail/${value.id_product}`} className="minicart-product-image">
                                                                        <img src={value.image} alt="cart products" />
                                                                    </Link>
                                                                    <div className="minicart-product-details">
                                                                        <h6><Link to={`/detail/${value.id_product}`}>{value.name_product}</Link></h6>
                                                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'} x {value.count}</span>
                                                                    </div>
                                                                    <a className="close" onClick={() => handler_delete_mini(value.id_cart)}>
                                                                        <i className="fa fa-close"></i>
                                                                    </a>
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                    <p className="minicart-total">TỔNG CỘNG: <span>{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(total_price) + ' VNĐ'}</span></p>
                                                    <div className="minicart-button">
                                                        <Link to="/cart" className="li-button li-button-fullwidth li-button-dark">
                                                            <span>Xem toàn bộ giỏ hàng</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    </li>
                                </ul>
                            </div>
                        </div>}
                    </div>
                </div>
                
                <div className={header_navbar}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="hb-menu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <nav>
                                        <ul>

                                            <li className="dropdown-holder"><Link to="/">TRANG CHỦ</Link></li>
                                            <li className="megamenu-holder"><Link to="/shop/all">DANH MỤC</Link>
                                            </li>
                                            <li><Link to="/event">SỰ KIỆN</Link></li>
                                            <li><Link to="/contact">LIÊN HỆ</Link></li>
                                        </ul>
                                    </nav>
                                    <div >
                                        <div className="d-flex justify-content-end username" onClick={toggleUserVisibility} style={{ position: 'relative', cursor: 'pointer' }}>
                                            <div>
                                                {
                                                    active_user ? (
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <FontAwesomeIcon icon={faUser} fontSize={20} style={{ marginRight: 10 }} />{user.fullname}</div>) : (
                                                        <div className="hb-menu">
                                                            <nav>
                                                                <ul>
                                                                    <li onClick={() => handleSignInClick()}>ĐĂNG NHẬP</li>
                                                                </ul>
                                                            </nav>
                                                        </div>
                                                    )
                                                }
                                            </div>

                                            {isUserVisible && active_user &&
                                                (
                                                    <div className="ul_setting" ref={userRef}>
                                                        <ul style={{ width: 100 }} className='dropdown' >
                                                            <li className="li_setting"><Link to={`/profile/${user._id}`} className="li_setting">Trang cá nhân</Link></li>
                                                            <li className="li_setting"><Link to="/history" className="li_setting">Tinh trạng đặt hàng</Link></li>
                                                            <li className="li_setting"><a onClick={handler_logout}>Đăng xuất</a></li>
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
export default Header;