import axiosClient from './axiosClient'

const CommentAPI = {

    get_comment: (id) => {
        const url = `/Comment/${id}`
        return axiosClient.get(url)
    },
    getAllComments: () => {
        const url = `/Comment`
        return axiosClient.get(url)
    },
    confirmCheck: (query) => {
        const url = `/Comment/confirmCheck${query}`
        return axiosClient.patch(url)
    },create: (query) => {
        const url = `/admin/permission/create${query}`
        return axiosClient.post(url)
    },

 

}

export default CommentAPI