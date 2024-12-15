import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router';
import CouponAPI from '../Api/CouponAPI';

const defaultValues = {
    code: '',
    count: '',
    promotion: '',
    describe: ''
};

function UpdateCoupon(props) {

    const [showMessage, setShowMessage] = useState('')

    const { id } = useParams()

    const [code, setCode] = useState('')
    const [count, setCount] = useState('')
    const [promotion, setPromotion] = useState('')
    const [describe, setDescribe] = useState('')
    const [status, setStatus] = useState('true')
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues });
    const onSubmit = async (data) => {

        const body = {
            code: code,
            count: count,
            promotion: promotion,
            describe: describe,
            start: start,
            end: end,
            status: status,

        }
        if (!validateDates()) {
            return;
        }
        const response = await CouponAPI.updateCoupon(id, body)

        setShowMessage(response.msg)

    };

    useEffect(() => {

        const fetchData = async () => {
            const response = await CouponAPI.getCoupon(id)
            setCode(response.code)
            setCount(response.count)
            setPromotion(response.promotion)
            setDescribe(response.describe)
            // Format the dates for datetime-local input
            setStatus(response.status.toString());
            if (response.start) {
                setStart(new Date(response.start).toISOString().slice(0, 16));
            }
            if (response.end) {
                setEnd(new Date(response.end).toISOString().slice(0, 16));
            }
        }

        fetchData()

    }, [])

    const validateDates = () => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const now = new Date();

        if (endDate < now) {
            alert('Ngày kết thúc phải lớn hơn ngày hiện tại');
            return false;
        }

        if (endDate <= startDate) {
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
                                    showMessage === "Bạn đã cập nhật thành công" ?
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
                                        <input type="text" className="form-control" id="code"
                                            {...register('code')}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)} />
                                        {errors.code && errors.code.type === "required" && <p className="form-text text-danger">Mã Code không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="price">Số lượng</label>
                                        <input type="text" className="form-control" id="count"
                                            {...register('count')}
                                            value={count}
                                            onChange={(e) => setCount(e.target.value)} />
                                        {errors.count && errors.count.type === "required" && <p className="form-text text-danger">Số lượng không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Khuyến Mãi</label>
                                        <input type="text" className="form-control" id="promotion"
                                            {...register('promotion')}
                                            value={promotion}
                                            onChange={(e) => setPromotion(e.target.value)} />
                                        {errors.promotion && errors.promotion.type === "required" && <p className="form-text text-danger">Khuyến mãi không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Mô tả</label>
                                        <input type="text" className="form-control" id="describe"
                                            {...register('describe')}
                                            value={describe}
                                            onChange={(e) => setDescribe(e.target.value)} />
                                        {errors.describe && errors.describe.type === "required" && <p className="form-text text-danger">Mô tả không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Trạng thái:
                                        </label>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios1" value="true" onClick={(e) => setStatus(e.target.value)} />
                                            <label class="form-check-label" for="gridRadios1">
                                                Hoạt Động
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="false" onClick={(e) => setStatus(e.target.value)} />
                                            <label class="form-check-label" for="gridRadios2">
                                                Ngưng Hoạt Động
                                            </label>

                                        </div>

                                    </div>

                                    <button type="submit" className="btn btn-primary">Update Coupon</button>
                                </form> */}
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group w-50">
                                        <label htmlFor="name">Mã Code</label>
                                        <input type="text" className="form-control" id="code"
                                            {...register('code')}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)} />
                                        {errors.code && errors.code.type === "required" && <p className="form-text text-danger">Mã Code không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="price">Số lượng</label>
                                        <input type="text" className="form-control" id="count"
                                            {...register('count')}
                                            value={count}
                                            onChange={(e) => setCount(e.target.value)} />
                                        {errors.count && errors.count.type === "required" && <p className="form-text text-danger">Số lượng không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Khuyến Mãi</label>
                                        <input type="text" className="form-control" id="promotion"
                                            {...register('promotion')}
                                            value={promotion}
                                            onChange={(e) => setPromotion(e.target.value)} />
                                        {errors.promotion && errors.promotion.type === "required" && <p className="form-text text-danger">Khuyến mãi không được để trống</p>}
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="description">Mô tả</label>
                                        <input type="text" className="form-control" id="describe"
                                            {...register('describe')}
                                            value={describe}
                                            onChange={(e) => setDescribe(e.target.value)} />
                                        {errors.describe && errors.describe.type === "required" && <p className="form-text text-danger">Mô tả không được để trống</p>}
                                    </div>

                                    {/* Add End Date */}
                                    <div className="form-group w-50">
                                        <label htmlFor="end">Ngày kết thúc</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="end"
                                            {...register('end')}
                                            value={end}
                                            onChange={(e) => setEnd(e.target.value)}
                                        />
                                        {errors.end && errors.end.type === "required" &&
                                            <p className="form-text text-danger">Ngày kết thúc không được để trống</p>
                                        }
                                    </div>

                                    <div className="form-group w-50">
                                        <label htmlFor="description">Trạng thái:</label>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="gridRadios"
                                                id="gridRadios1"
                                                value="true"
                                                checked={status === "true"}
                                                onClick={(e) => setStatus(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="gridRadios1">
                                                Hoạt Động
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="gridRadios"
                                                id="gridRadios2"
                                                value="false"
                                                checked={status === "false"}
                                                onClick={(e) => setStatus(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="gridRadios2">
                                                Ngưng Hoạt Động
                                            </label>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary">Update Coupon</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateCoupon;