import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import categoryAPI from '../Api/categoryAPI';
import isEmpty from 'validator/lib/isEmpty'
import productAPI from '../Api/productAPI';
import LoadingOverlay from 'react-loading-overlay-ts';

function UpdateProduct(props) {
    const [id] = useState(props.match.params.id)
    const [category, setCategory] = useState([])
    const [gender] = useState(["Unisex", "Male", "Female"])
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [number, setNumber] = useState('');
    const [categoryChoose, setCategoryChoose] = useState('');
    const [depository, setDepository] = useState('');
    const [genderChoose, setGenderChoose] = useState('Unisex');
    const [file, setFile] = useState();
    const [image, setImage] = useState();
    const [fileName, setFileName] = useState("");
    const [validationMsg, setValidationMsg] = useState('');
    const { handleSubmit } = useForm();
    const [loading, setLoading] = useState(true);
    const [newImage, setNewImage] = useState();
    const [brand, setBrand] = useState('');
    const [rs, setRs] = useState(null);


    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const ct = await categoryAPI.getAPI();
                const response = await productAPI.details(id);
                setRs(response);
                
                if (response && response.data) {
                    setName(response.data.name_product || '');
                    setPrice(response.data.price_product || '');
                    setDescription(response.data.describe || '');
                    setCategoryChoose(response.data.id_category || '');
                    setImage(response.data.image || '');
                    setDepository(response.data.depository || '');
                    setBrand(response.data.brand || '');
                }
                setCategory(ct);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
            setLoading(false);
        };

        fetchAllData();
    }, [id]);

    const saveFile = (e) => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0].name);
    };

    const onChangeNumber = (e) => {

        const value = e.target.value
        if (!Number.isNaN(value) && Number(value) >= 0) {
            setNumber(value)
        }
    }


    const onChangePrice = (e) => {
        const value = e.target.value
        if (!Number.isNaN(value) && Number(value) > 0) {
            setPrice(value)
        }
    }

    const validateAll = () => {
        let msg = {}
        if (rs) {
            if (name !== rs.data.name_product && isEmpty(name)) {
                msg.name = "Tên không được để trống"
            }
            if (price !== rs.data.price_product && isEmpty(price)) {
                msg.price = "Giá không được để trống"
            }
            if (description !== rs.data.describe && isEmpty(description)) {
                msg.description = "Mô tả không được để trống"
            }
            if (categoryChoose !== rs.data.id_category && isEmpty(categoryChoose)) {
                msg.category = "Vui lòng chọn loại"
            }
            if (brand !== rs.data.brand && isEmpty(brand)) {
                msg.brand = "Thương hiệu không được để trống"
            }
        }

        setValidationMsg(msg)
        if (Object.keys(msg).length > 0) return false;
        return true;
    }

    const handleCreate = () => {
        setLoading(true);
        const isValid = validateAll();
        if (!isValid) return
        console.log(file)
        addProduct();
    }

    const addProduct = async () => {
        const formData = new FormData();
        formData.append("_id", id);

        if (rs) {
            if (name !== rs.data.name_product) formData.append("name_product", name);
            if (price !== rs.data.price_product) formData.append("price_product", price);
            if (categoryChoose !== rs.data.id_category) formData.append("category", categoryChoose);
            if (newImage) formData.append("image", newImage);
            if (description !== rs.data.describe) formData.append("description", description);
            if (genderChoose !== rs.data.gender) formData.append("gender", genderChoose);
            if (depository !== rs.data.depository) formData.append("depository", depository);
            if (brand !== rs.data.brand) formData.append("brand", brand);
        } else {
            if (name) formData.append("name_product", name);
            if (price) formData.append("price_product", price);
            if (categoryChoose) formData.append("category", categoryChoose);
            if (newImage) formData.append("image", newImage);
            if (description) formData.append("description", description);
            if (genderChoose) formData.append("gender", genderChoose);
            if (depository) formData.append("depository", depository);
            if (brand) formData.append("brand", brand);
        }

        const response = await productAPI.update(formData);

        if (response.msg === "Bạn đã update thành công") {
            window.scrollTo(0, 0);
            setLoading(false);
        }
        setValidationMsg({ api: response.msg });
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
                                <h4 className="card-title">Update Product</h4>
                                {
                                    validationMsg.api === "Bạn đã thêm thành công" ?
                                        (
                                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                                {validationMsg.api}
                                                <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                                    <span aria-hidden="true">×</span>
                                                </button>
                                            </div>
                                        ) :
                                        (
                                            <p className="form-text text-danger">{validationMsg.api}</p>
                                        )
                                }


                                <form onSubmit={handleSubmit(handleCreate)}>
                                    <div className="form-group w-50">
                                        <label htmlFor="name">Tên Sản Phẩm</label>
                                        <input type="text" className="form-control" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                                        <p className="form-text text-danger">{validationMsg.name}</p>
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="price">Giá Sản Phẩm</label>
                                        <input type="text" className="form-control" id="price" name="price" value={price} onChange={(e) => onChangePrice(e)} />
                                        <p className="form-text text-danger">{validationMsg.price}</p>
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Mô tả</label>
                                        <input type="text" className="form-control" id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                                        <p className="form-text text-danger">{validationMsg.description}</p>
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Link ảnh mới</label>
                                        <input type="text" className="form-control" id="newImage" name="newImage" value={newImage} onChange={(e) => setNewImage(e.target.value)}/>
                                        <p className="form-text text-danger">{validationMsg.image}</p>
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Số lượng mới</label>
                                        <input type="text" className="form-control" id="depository" name="depository" value={depository} onChange={(e) => setDepository(e.target.value)}/>
                                        <p className="form-text text-danger">{validationMsg.depository}</p>
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="brand">Thương Hiệu</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="brand" 
                                            name="brand" 
                                            value={brand} 
                                            onChange={(e) => setBrand(e.target.value)} 
                                        />
                                        <p className="form-text text-danger">{validationMsg.brand}</p>
                                    </div>
                                    <div className="form-group w-50">
                                        {/* <label htmlFor="categories" className="mr-2">Chọn loại:</label> */}
                                        <label htmlFor="categories" className="mr-2">Chọn nhà sản xuất:</label>
                                        <select name="categories" id="categories" value={categoryChoose} onChange={(e) => setCategoryChoose(e.target.value)}>
                                            <option >Chọn loại</option>
                                            {
                                                category && category.map((item, index) => (
                                                    <option value={item._id} key={index} >{item.category}</option>
                                                ))
                                            }

                                        </select>
                                        <p className="form-text text-danger">{validationMsg.category}</p>
                                    </div>

                                    {/* <div className="form-group w-50">
                                        <label htmlFor="gender" className="mr-2">Chọn giới tính:</label>
                                        <select name="gender" id="gender" value={genderChoose} onChange={(e) => setGenderChoose(e.target.value)}>
                                            {
                                                gender && gender.map((item, index) => (
                                                    <option value={item} key={index}>{item}</option>
                                                ))
                                            }

                                        </select>
                                    </div> */}

                                    {/* <div className="form-group w-50">
                                        <label>Hình Ảnh</label>
                                        <input type="file" className="form-control-file" name="file" onChange={saveFile} />
                                    </div> */}

                                    <div className="form-group w-50">
                                        <label>Hình Ảnh Cũ</label>
                                        <img src={image} alt="" style={{ width: '70px' }} />
                                    </div>


                                    <button type="submit" className="btn btn-primary">Update Product</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </LoadingOverlay>
        </div>
    );
}

export default UpdateProduct;