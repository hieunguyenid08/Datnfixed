const User = require('../../../Models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await User.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;
    let users;
    if (req.query.permission) {
        users = await User.find({ id_permission: req.query.permission }).populate('id_permission')
    } else {
        users = await User.find({}).populate('id_permission')
    }


    if (!keyWordSearch) {
        res.json({
            users: users.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = users.filter(value => {
            return value.fullname.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            users: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.create = async (req, res) => {
    const user = await User.find();

    const userFilter = user.filter((c) => {
        return c.email === req.query.email.trim() || c.username === req.query.username.trim()
    });

    if (userFilter.length > 0) {
        res.json({ msg: 'Email hoặc username đã tồn tại' })
    } else {
        var newUser = new User()
        const salt = await bcrypt.genSalt();
        newUser.password = await bcrypt.hash(req.query.password, salt);
        req.query.name = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
        newUser.fullname = req.query.name
        newUser.username = req.query.username
        if (req.query.permission) {
            newUser.id_permission = "6087dcb5f269113b3460fce4"
        } else newUser.id_permission = req.query.permission
        newUser.email = req.query.email

        newUser.save();
        res.json({ msg: "Bạn đã thêm thành công" })
    }
}

module.exports.delete = async (req, res) => {
    const id = req.query.id;

    await User.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })

}

module.exports.details = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });

    res.json(user)
}

module.exports.update = async (req, res) => {
    const user = await User.findOne({ _id: req.query.id });
    if (req.query.email && req.query.email !== user.email) {
        req.query.email = user.email
    }
    if (req.query.username && req.query.username !== user.username) {
        req.query.username = user.username
    }
    if (!req.query.password) {
        req.query.password = user.password;
    } else {
        const salt = await bcrypt.genSalt();
        req.query.password = await bcrypt.hash(req.query.password, salt);
    }

    req.query.name = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
    await User.updateOne({ _id: req.query.id }, {
        fullname: req.query.name,
        password: req.query.password,
        id_permission: req.query.permission
    }, function (err, res) {
        if (err) return res.json({ msg: err });
    });
    res.json({ msg: "Bạn đã update thành công" })
}

// Hàm login với Access Token và Refresh Token
module.exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log("abc",password);

        // Tìm user theo email và populate quyền
        const user = await User.findOne({ email }).populate('id_permission');

        if (!user) {
            return res.status(404).json({ msg: "Không Tìm Thấy User" });
        }

        // Kiểm tra mật khẩu với bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password); // So sánh mật khẩu đã hash

        if (isPasswordValid) {
            // Xóa mật khẩu trước khi trả về thông tin người dùng
            user.password = undefined;

            // Tạo Access Token với thời gian sống ngắn (1 giờ)
            const accessToken = jwt.sign(
                { id: user._id },
                'your_jwt_secret',
                { expiresIn: '1h' }
            );

            // Tạo Refresh Token với thời gian sống dài hơn (7 ngày)
            const refreshToken = jwt.sign(
                { id: user._id },
                'your_refresh_jwt_secret',
                { expiresIn: '7d' }
            );

            // Gửi token và thông tin người dùng
            return res.json({
                msg: "Đăng nhập thành công",
                user,
                accessToken,  // Trả về access token
                refreshToken  // Trả về refresh token
            });
        } else {
            return res.status(401).json({ msg: "Sai mật khẩu" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

// Hàm để tạo access token mới từ refresh token
module.exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ msg: "Refresh Token không có" });
        }

        // Kiểm tra và giải mã refresh token
        jwt.verify(refreshToken, 'your_refresh_jwt_secret', async (err, user) => {
            if (err) {
                return res.status(403).json({ msg: "Refresh Token không hợp lệ" });
            }

            // Tạo lại access token từ refresh token
            const accessToken = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

            return res.json({ accessToken });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
};
