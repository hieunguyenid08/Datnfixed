const jwt = require('jsonwebtoken');

const auth = {
    // Verify Token
    verifyToken: (req, res, next) => {
        try {
            const token = req.header("Authorization")
            
            if (!token) return res.status(401).json({ msg: "Không có token, quyền truy cập bị từ chối" })

            // Xóa "Bearer " từ token string nếu có
            const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token

            // Verify token
            jwt.verify(tokenString, "abc", (err, user) => {
                if (err) return res.status(403).json({ msg: "Token không hợp lệ hoặc đã hết hạn" })
                req.user = user
                next()
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    // Generate Access Token
    generateAccessToken: (userId) => {
        return jwt.sign({ id: userId }, "abc", { expiresIn: '1h' })
    },

    // Generate Refresh Token
    generateRefreshToken: (userId) => {
        return jwt.sign({ id: userId }, "refresh_secret", { expiresIn: '7d' })
    },

    // Verify Refresh Token
    verifyRefreshToken: (req, res, next) => {
        const refreshToken = req.body.refreshToken
        if (!refreshToken) return res.status(401).json({ msg: "Không có refresh token" })

        try {
            jwt.verify(refreshToken, "refresh_secret", (err, user) => {
                if (err) return res.status(403).json({ msg: "Refresh token không hợp lệ" })
                req.user = user
                next()
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = auth;