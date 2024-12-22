import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import queryString from 'query-string'

import orderAPI from '../Api/orderAPI';
import Pagination from '../Shared/Pagination'
import Search from '../Shared/Search'
import CommentAPI from '../Api/CommentAPI';
import productAPI from '../Api/productAPI';
function CheckComments(props) {
  

    const [comments, setComments] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [commentsPerPage] = useState(10) // You can adjust this number

    // Tính toán số trang và comments hiện tại
    const indexOfLastComment = currentPage * commentsPerPage
    const indexOfFirstComment = indexOfLastComment - commentsPerPage
    const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment)
    const totalPages = Math.ceil(comments.length / commentsPerPage)

    // Xử lý khi chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    useEffect(() => {
      

        const fetchAllData = async () => {
           
          
          
            const products = await productAPI.getAll()
           
            const allComments = []
           for (const product of products) {
               const productComments = await CommentAPI.get_comment(product._id)
               if(productComments.length > 0){
                const pendingComments = productComments.filter(comment => comment.status === "1")
               allComments.push(...pendingComments)
               
               }
           }
           setComments(allComments)
           console.log(comments)
           
          
        }

        fetchAllData()
    }, [])

   

    const handleConfirm = async (value) => {
       
        const query = '?' + queryString.stringify({ id: value._id })
        const response = await CommentAPI.confirmCheck(query)

        if (response.msg === "Thanh Cong") {
         
          setComments(prevComments => prevComments.filter(comment => 
            comment._id !== value._id
            
        ))
        alert("Duyệt thành công")
        }
    }

    const handleCancel = async (value) => {
        const query = '?' + queryString.stringify({ id: value._id })

        const response = await orderAPI.cancelOrder(query)

        if (response.msg === "Thanh Cong") {
           
        }
    }

    return (
        <div className="page-wrapper">

            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Check Comments</h4>

                                <div className="table-responsive mt-3">
                                <table className="table table-striped table-bordered no-wrap">
                                   <thead>
                                       <tr>
                                           <th>Action</th>
                                           <th>Product Name</th>
                                           <th>User Name</th>
                                           <th>Status</th>
                                           <th>Content</th>
                                           <th>Rating</th>
                                       </tr>
                                   </thead>
                                    <tbody>
                                       {
                                           currentComments && currentComments.map((value, index) => (
                                               
                                               <tr key={index}>
                                                    <td>
                                                            <div className="d-flex">
                                                              

                                                                <button type="button" style={{ cursor: 'pointer', color: 'white' }} onClick={() => handleConfirm(value)} className="btn btn-success mr-1" >Duyệt</button>

                                                                {
                                                                    !value.pay && <button type="button" style={{ cursor: 'pointer', color: 'white' }} onClick={() => handleCancel(value)} className="btn btn-danger" >Hủy bỏ</button>
                                                                }  
                                                            </div>
                                                        </td>
                                                   <td>{value.id_product.name_product}</td>
                                                   <td>{value.id_user.fullname}</td>
                                                   <td>
                                                            {(() => {
                                                                switch (value.status) {
                                                                    case "1": return "Đang xử lý";
                                                                    case "2": return "Đã xác nhận";
                                                                    
                                                                }
                                                            })()}
                                                        </td>
                                                   <td>{value.content}</td>
                                                   <td>{value.star} / 5</td>
                                               </tr>
                                           ))
                                       }
                                   </tbody>
                               </table>
                                <div className="d-flex justify-content-center mt-3">
                                    <nav>
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Trước
                                                </button>
                                            </li>
                                            
                                            {[...Array(totalPages)].map((_, index) => (
                                                <li 
                                                    key={index + 1} 
                                                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                >
                                                    <button 
                                                        className="page-link" 
                                                        onClick={() => handlePageChange(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            ))}

                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Sau
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckComments;