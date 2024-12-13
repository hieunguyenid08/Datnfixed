const Users = require('../../Models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../MiddleWare')

module.exports = {
    index: async (req, res) => {
        try {
            const users = await Users.find().select('-password')
            res.json(users)
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    user: async (req, res) => {
        try {
            const user = await Users.findById(req.params.id).select('-password')
            if (!user) return res.status(404).json({ msg: "User không tồn tại" })
            res.json(user)
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    update_user: async (req, res) => {
        try {
            const { password, ...updateFields } = req.body
            if (password) {
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)
                updateFields.password = hashedPassword
            }
            await Users.findOneAndUpdate(
                { _id: req.body._id },
                updateFields
            )
            res.json({ msg: "Cập nhật thành công" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    detail: async (req, res) => {
        try {
            const { username, password } = req.query
            const user = await Users.findOne({ username })
            if (!user) return res.json("Khong Tìm Thấy User")

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.json("Sai Mat Khau")

            const accessToken = auth.generateAccessToken(user._id)
            const refreshToken = auth.generateRefreshToken(user._id)

            user.refreshToken = refreshToken
            await user.save()

            res.json({
                msg: "Đăng nhập thành công",
                _id: user._id,
                jwt: accessToken,
                refreshToken: refreshToken
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    refreshToken: async (req, res) => {
        try {
            const userId = req.user.id

            const accessToken = auth.generateAccessToken(userId)

            res.json({
                jwt: accessToken
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    logout: async (req, res) => {
        try {
            const userId = req.user.id
            
            await Users.findByIdAndUpdate(userId, { refreshToken: null })

            res.json({ msg: "Đăng xuất thành công" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    post_user: async (req, res) => {
        try {
            const { username, password, ...otherFields } = req.body
            const user = await Users.findOne({ username })
            if (user) return res.status(400).json({ msg: "Username đã tồn tại" })

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            const newUser = new Users({
                username,
                password: hashedPassword,
                ...otherFields
            })

            await newUser.save()
            res.json({ msg: "Đăng ký thành công" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}