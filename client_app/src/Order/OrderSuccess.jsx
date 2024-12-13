import React from 'react';
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types';

OrderSuccess.propTypes = {

};

function OrderSuccess(props) {

    return (
        <div className="container fix_order">
            <h1>You Have Ordered Successfully</h1>
            <span style={{ fontSize: '1.2rem' }}>Please Checking Email!</span>
            <div>
                <button class="button-1" role="button" ><Link style={{color:'black'}} to='/'>RETURN TO HOME</Link></button>
                <button class="button-1" role="button" style={{marginLeft:10}}><Link style={{color:'black'}} to='/history'>REVIEW YOUR ORDER</Link></button>
            </div>
        </div>
        
    );
}

export default OrderSuccess;