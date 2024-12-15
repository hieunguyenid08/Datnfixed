import axiosClient from './axiosClient'

const SaleAPI = {

    getAll: (query) => {
        const url = `/admin/sale/${query}`
        return axiosClient.get(url)
    },

    postSale: (data) => {
        const url = `/admin/sale`
        return axiosClient.post(url, data)
    },

    detailSale: (id) => {
        const url = `/admin/sale/${id}`
        return axiosClient.get(url)
    },

    updateSale: (id, data) => {
        const url = `/admin/sale/${id}`
        return axiosClient.put(url, data)
    }, showProductSale: (id) => {
        const url = `/admin/sale/list/product${id}`
        return axiosClient.get(url)
    },showSaleList: (id) => {
        const url = `/admin/sale/list${id}`
        return axiosClient.get(url)
    },

}

export default SaleAPI