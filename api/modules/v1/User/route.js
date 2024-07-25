const path = require("path");
const multer = require("multer")
var express = require("express");
var middleware = require("../../../middleware/validation");
var user_module = require("./user_module");
var router = express.Router();


// File Upload Using Multer
const storageuploads = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "uploads/users/")
    },
    filename: (req, file, callback) => {
        //get extention
        const extention = path.extname(file.originalname);
        //generate radom file path
        const uuid = Date.now() + "-" + Math.round(Math.random() * 1e6);
        const fileName = uuid + extention;
        // req.body.image = fileName
        callback(null, fileName);
        // console.log(fileName);
    }
});

const uploadFile = multer({ storage: storageuploads });

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.AUTHENTICATION-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// Signup
router.post("/signup", (req, res) => {
    middleware.decryption(req.body, function (request) {

        let passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        let rules = {
            first_name: 'required',
            last_name: 'required',
            email: 'required|email',
            country_code: 'required',
            phone: 'required|size:10',
            password: 'required|regex:' + passRegex,
            is_checked: 'required',

            device_type: 'required',
            device_token: 'required',
        }

        let message = {
            required: req.language.required,
            email: req.language.email,
            regex: req.language.regex,
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.signup(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data);
            })
        }

    })
});

// OTP Verify
router.post('/otp_verify', (req, res) => {
    middleware.decryption(req.body, function (request) {

        request.user_id = req.user_id

        let rules = {
            otp: 'required',
        }

        let message = {
            required: req.language.language
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.otpVerify(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Resend OTP
router.post('/resend_otp', (req, res) => {
    middleware.decryption(req.body, function (request) {

        request.user_id = req.user_id

        user_module.resendOtp(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Login
router.post('/login', (req, res) => {
    middleware.decryption(req.body, function (request) {

        let passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        let rules = {
            country_code: 'required',
            phone: 'required|size:10',
            password: 'required|regex:' + passRegex,

            device_type: 'required',
            device_token: 'required',
        }

        let message = {
            required: req.language.required,
            regex: req.language.regex,
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.login(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Logout 
router.post('/logout', (req, res) => {
    middleware.decryption(req.body, function (request) {

        request.user_id = req.user_id

        user_module.logout(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Delete Profile
router.post('/delete_profile', (req, res) => {
    middleware.decryption(req.body, function (request) {

        request.user_id = req.user_id

        user_module.delete_profile(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Profile
router.post('/profile', (req, res) => {
    middleware.decryption(req.body, function (request) {

        request.user_id = req.user_id

        user_module.user_profile(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Change Password 
router.post('/change_password', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        let rules = {
            old_password: 'required|regex:' + passRegex,
            new_password: 'required|regex:' + passRegex,
            confirm_password: 'required|regex:' + passRegex
        }

        let message = {
            required: req.language.required,
            regex: req.language.regex,
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.changePassword(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Update Profile
router.post('/update_profile', (req, res) => {
    middleware.decryption(req.body, function (request) {

        request.user_id = req.user_id

        user_module.update_profile(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Forgot Password
router.post('/forgot_password', (req, res) => {
    middleware.decryption(req.body, (request) => {

        let rules = {
            country_code: 'required',
            phone: 'required'
        }

        let message = {
            required: req.language.required,
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.forgotPassword(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Verify OTP for Forget Password
router.post('/verify_otp', (req, res) => {
    middleware.decryption(req.body, (request) => {

        let rules = {
            otp: 'required',
            user_id: 'required'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.verifyOTP(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Resend OTP for Forgot Password
router.post('/resend_forgot_otp', (req, res) => {
    middleware.decryption(req.body, function (request) {

        let rules = {
            country_code: 'required',
            phone: 'required'
        }

        let message = {
            required: req.language.required,
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.forgotPassword(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Reset Password
router.post('/reset_password', (req, res) => {
    middleware.decryption(req.body, (request) => {

        let rules = {
            new_password: 'required',
            confirm_password: 'required',
            user_id: 'required'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.resetPassword(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.PERSONAL INFORMATION-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// User Address
router.post('/get_address', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        user_module.userAddress(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Manage Address 
router.post('/add_update_delete_address', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            type: 'required|in:add,update,delete',
            address_id: 'required_unless:type,add',
            address_type: 'required_if:type,add',
            house_name: 'required_if:type,add',
            address: 'required_if:type,add',
            street: 'required_if:type,add',
            city: 'required_if:type,add',
            state: 'required_if:type,add',
            country: 'required_if:type,add',
            zip_code: 'required_if:type,add',
            latitude: 'required_if:type,add',
            longitude: 'required_if:type,add'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.manageAddress(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Contact Us
router.post('/contact_us', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            first_name: 'required',
            last_name: 'required',
            email: 'required|email',
            subject: 'required',
            description: 'required'
        }

        let message = {
            required: req.language.required,
            email: req.language.email
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.contactUs(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Notifications
router.post('/notifications', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        user_module.userNotification(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Clear | Delete Notificaion
router.post('/clear_notification', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        user_module.clearNotification(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.WISHLIST & RATINGS-REVIEWS-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// Wishlist
router.post('/user_wishlist', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        user_module.userWishlist(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Add & Remove Wishlist
router.post('/add_remove_wishlist', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            product_id: 'required'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.addRemoveWishlist(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Rate & Review of User
router.post('/add_rate_review', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            shop_id: 'required',
            rating: 'required|integer',
            review: 'required'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.rate_Review_ShopByUser(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.PAYMENT-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// User Wallet Details
router.post('/wallet_details', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        user_module.walletAmount(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Add Payment Method
router.post('/add_payment', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            holder_name: 'required',
            card_number: 'required|integer|digits:16',
            expired_month: 'required',
            cvv_number: 'required|integer|digits:3'
        }

        let message = {
            required: req.language.required,
            integer: req.language.integer,
            digits: req.language.size,
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.addCard(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.CART & ORDER-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//

// Add & Update to Cart 
router.post('/add_update_to_cart', (req, res) => {
    middleware.decryption(req.body, (request) => {
        // let request = req.body
        request.user_id = req.user_id

        let rules = {
            shop_id: 'required',
            product_id: 'required',
            quantity: 'required|integer'
        }

        let message = {
            required: req.language.required,
            integer: req.language.integer
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.addToCart(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Cart Details
router.post('/cart_detail', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        user_module.cartDetail(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Delete Cart
router.post('/delete_cart', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            cart_id: 'required'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.deleteCart(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Place Order
router.post('/place_order', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            cart_items: 'required', // Array of Object [{}, {}]
            delivery_address_id: 'required',
            is_shipping_address: 'required'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.placeOrder(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data);
            });
        }
    });
})

// Cancel Order
router.post('/cancel_order', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        let rules = {
            order_id: 'required',
            reason: 'required'
        }

        let message = {
            required: req.language.required
        }

        if (middleware.checkValidationRules(res, request, rules, message)) {
            user_module.cancelOrder(request, (code, message, data) => {
                middleware.send_response(req, res, code, message, data)
            })
        }
    })
})

// Order Details 
router.post('/order_detail', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        user_module.orderDetail(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.//




module.exports = router