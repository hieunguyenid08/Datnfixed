import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import LogoQR from '../Image/qr_mb.jpg'

function Modal_Image(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
        Transaction information
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div style={{textAlign:'center'}}>
            <img src={LogoQR} height={500}/>
            <h1 style={{color:'red'}}>Transaction content: [Your Username]</h1>
            <h1 style={{color:'red'}}>Example: Huytehuy</h1>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

export default Modal_Image;