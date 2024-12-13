// api/axiosClient.js
import axios from 'axios';
import queryString from 'query-string';
// Set up default config for http requests here
// Please have a look at here `https://github.com/axios/axios#requestconfig` for the full list of configs
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000',
    // baseURL: 'https://dacn-231-t581.onrender.com',
    headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
    paramsSerializer: params => queryString.stringify(params),
});

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu response là 401 và chưa thử refresh token
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh thì thêm request vào queue
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosClient(originalRequest);
                })
                .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            // Lấy refresh token từ localStorage
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                // Nếu không có refresh token, chuyển về trang login
                window.location.href = '/signin';
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token
                const response = await axiosClient.post('/api/User/refresh-token', {
                    refreshToken: refreshToken
                });

                const { jwt: newAccessToken } = response;
                
                // Lưu token mới
                localStorage.setItem('jwt', newAccessToken);
                
                // Cập nhật token cho request hiện tại và các request trong queue
                axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                
                processQueue(null, newAccessToken);
                
                return axiosClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // Nếu refresh token cũng hết hạn, xóa hết token và chuyển về trang login
                localStorage.removeItem('jwt');
                localStorage.removeItem('refreshToken');
                window.location.href = '/signin';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;