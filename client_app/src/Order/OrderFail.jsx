import React from 'react';
import PropTypes from 'prop-types';

OrderFail.propTypes = {
    
};

function OrderFail(props) {
    return (
        <div className="container fix_order">
            <h1>You Have Ordered Fail</h1>
            <span style={{ fontSize: '1.2rem' }}>Please Checking Information!!</span>
        </div>
    );
}

export default OrderFail;