const express = require('express');
const router = express.Router();
const page_model = require('../Pages/page_model');


router.get('/aboutusinfo', (req, res) => {
    page_model.aboutUsInfo((data) => {
        res.render('aboutusinfo.html', { data: data });
    });
});


router.get('/termsandcondition', (req, res) => {
    page_model.termsAndCondition((data) => {
        res.render('termscondition.html', { data: data });
    });
});


router.get('/privacypolicy', (req, res) => {
    page_model.privacyPolicy((data) => {
        res.render('privacypolicy.html', { data: data });
    });
});


router.get('/faq', (req, res) => {
    page_model.FAQs((data) => {
        res.render('faq.html', { data: data });
    });
});


module.exports = router;
