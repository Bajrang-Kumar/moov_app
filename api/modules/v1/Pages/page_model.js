const commonFunction = require('../../../config/common');

const page_model = {

    aboutUsInfo: function (callback) {
        commonFunction.common_Singleselect(`SELECT id, CONVERT(content USING utf8) as content FROM tbl_cms_pages WHERE page_name = 'aboutus' AND is_active = '1' AND is_deleted = '0'`, (aboutusdata) => {
            callback(aboutusdata);
        });
    },


    termsAndCondition: function (callback) {
        commonFunction.common_Singleselect(`SELECT id, CONVERT(content USING utf8) as content FROM tbl_cms_pages WHERE page_name = 'terms_condition' AND is_active = '1' AND is_deleted = '0'`, (termsconditiondata) => {
            callback(termsconditiondata);
        });
    },


    privacyPolicy: function (callback) {
        commonFunction.common_Singleselect(`SELECT id, CONVERT(content USING utf8) as content FROM tbl_cms_pages WHERE page_name = 'privacy_policy' AND is_active = '1' AND is_deleted = '0'`, (privacypolicydata) => {
            callback(privacypolicydata);
        });
    },


    FAQs: function (callback) {
        commonFunction.common_Multipleselect(`SELECT id, CONVERT(question USING utf8) as question, CONVERT(answer USING utf8) as answer FROM tbl_faq WHERE is_active = '1' AND is_deleted = '0'`, (faqdata) => {
            callback(faqdata);
        });
    }


}

module.exports = page_model;
