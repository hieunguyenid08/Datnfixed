import React, { useState } from 'react';
import { useForm } from 'react-hook-form'
import CouponAPI from '../Api/CouponAPI';
import DatePicker from "react-datepicker";
const defaultValues = {
    code: '',
    count: '',
    promotion: '',
    describe: '',
    start: '',
    end: '',
};

function CreateCoupon(props) {

    const [showMessage, setShowMessage] = useState('')
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date())
    const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues });
    const onSubmit = async (data) => {

        const body = {
            code: data.code,
            count: data.count,
            promotion: data.promotion,
            describe: data.describe,
            start: startDate,
            end: endDate,
            status: true,
        }
        if (!validateDates()) {
            return;
        }
        const response = await CouponAPI.postCoupons(body)

        setShowMessage(response.msg)

        reset({ defaultValues })

    };
    const validateDates = () => {
        const startDate1 = new Date(startDate);
        const endDate1 = new Date(endDate);
        const now = new Date();

        if (startDate1 < now) {
            alert('Ngày bắt đầu phải lớn hơn ngày hiện tại');
            return false;
        }

        if (endDate1 <= startDate1) {
            alert('Ngày kết thúc phải lớn hơn ngày bắt đầu');
            return false;
        }

        return true;
    };


    return (
        <div className="page-wrapper">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Create Product</h4>
                                {
                                    showMessage === "Bạn đã thêm thành công" ?
                                        (
                                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                                {showMessage}
                                                <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                                    <span aria-hidden="true">×</span>
                                                </button>
                                            </div>
                                        ) :
                                        (
                                            <p className="form-text text-danger">{showMessage}</p>
                                        )
                                }


                                {/* <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group w-50">
                                        <label htmlFor="name">Mã Code</label>
                                        <input type="text" className="form-control" id="code" {...register('code', { required: true })} />
                                        {errors.code && errors.code.type === "required" && <p className="form-text text-danger">Mã Code không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="price">Số lượng</label>
                                        <input type="text" className="form-control" id="count" {...register('count', { required: true })} />
                                        {errors.count && errors.count.type === "required" && <p className="form-text text-danger">Số lượng không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Khuyến Mãi</label>
                                        <input type="text" className="form-control" id="promotion" {...register('promotion', { required: true })} />
                                        {errors.promotion && errors.promotion.type === "required" && <p className="form-text text-danger">Khuyến mãi không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Mô tả</label>
                                        <input type="text" className="form-control" id="describe" {...register('describe', { required: true })} />
                                        {errors.describe && errors.describe.type === "required" && <p className="form-text text-danger">Mô tả không được để trống</p>}
                                    </div>
                                    <button type="submit" className="btn btn-primary">Create Coupon</button>
                                </form> */}
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group w-50">
                                        <label htmlFor="name">Mã Code</label>
                                        <input type="text" className="form-control" id="code" {...register('code', { required: true })} />
                                        {errors.code && errors.code.type === "required" && <p className="form-text text-danger">Mã Code không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="price">Số lượng</label>
                                        <input type="text" className="form-control" id="count" {...register('count', { required: true })} />
                                        {errors.count && errors.count.type === "required" && <p className="form-text text-danger">Số lượng không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Khuyến Mãi</label>
                                        <input type="text" className="form-control" id="promotion" {...register('promotion', { required: true })} />
                                        {errors.promotion && errors.promotion.type === "required" && <p className="form-text text-danger">Khuyến mãi không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Mô tả</label>
                                        <input type="text" className="form-control" id="describe" {...register('describe', { required: true })} />
                                        {errors.describe && errors.describe.type === "required" && <p className="form-text text-danger">Mô tả không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="start">Ngày bắt đầu</label>
                                        <input type="datetime-local" className="form-control" id="start" {...register('start', { required: true })} />
                                        {errors.start && errors.start.type === "required" && <p className="form-text text-danger">Ngày bắt đầu không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="end">Ngày kết thúc</label>
                                        <input type="datetime-local" className="form-control" id="end" {...register('end', { required: true })} />
                                        {errors.end && errors.end.type === "required" && <p className="form-text text-danger">Ngày kết thúc không được để trống</p>}
                                    </div>
                                    {/* <div className="form-group w-50">
                                        <label htmlFor="description">Ngày bắt đầu</label><br />
                                        <DatePicker className="form-control" selected={startDate} onChange={(date) => setStartDate(date)} />
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Ngày kết thúc</label>
                                        <br />
                                        <DatePicker className="form-control" selected={endDate} onChange={(date) => setEndDate(date)} />
                                    </div> */}
                                    <div className="form-group w-50">
                                        <label htmlFor="status">Trạng thái</label>
                                        <select className="form-control" id="status" {...register('status', { required: true })}>
                                            <option value="true">Kích hoạt</option>
                                            <option value="false">Không kích hoạt</option>
                                        </select>
                                        {errors.status && errors.status.type === "required" && <p className="form-text text-danger">Trạng thái không được để trống</p>}
                                    </div>
                                    <button type="submit" className="btn btn-primary">Create Coupon</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateCoupon;