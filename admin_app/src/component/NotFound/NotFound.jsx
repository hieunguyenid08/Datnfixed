import React from 'react';
import PropTypes from 'prop-types';

NotFound.propTypes = {

};

function NotFound(props) {
    return (
        <div className="page-wrapper">
            <div className="container-fluid">
                <h1 style={{ fontWeight: 'bolder', color: "black" }}>Error 404!</h1>
            </div>
        </div >
    );
}

export default NotFound;