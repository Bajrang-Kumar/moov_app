var GLOBALS = require('../config/constant');
var common = require('../config/common');
let conn = require('./database');

var exports = module.exports = {};

// Verify Phone mail template - Done
exports.otp_sent = function (result, callback) {
  // console.log(result);
  const template = ` <h2>Dear User</h2>
                   <p>Your OTP :- ${result}</p> `;
  callback(template);
}

//   Account Deleted mail template - Done
exports.deleted_account = function (result, callback) {
  const template = `<h1>User</h1>
                    <p>Your Account has been Deleted Successfully..!!</p>`;
  callback(template);
}

// forgot password mail template - Done.......................Phone Number Flow......//
exports.forgotPassword = function (result, callback) {
  let otp = common.genOtp(4);
  // console.log("user: ", result);
  conn.query("update tbl_user set otp = '" + otp + "' where user_id = '" + result[0].user_id + "' and is_active = 1 and is_deleted = 0", (err, updated) => {
    if (!err) {
      if (updated) {
        const template = ` <h1>Your OTP: ` + otp + ` </h1> `;
        callback(template);
      }
      else {
        callback([]);
      }
    }
    else {
      callback(err);
    }
  });
}


// forgot password mail template - Done......................Email Flow................//
exports.forgot_password = function (result, callback) {
  const resultant = result[0]
  // console.log("result in email.//././././", result)


  const imageUrl = `${GLOBALS.PORT_BASE_URL}${GLOBALS.LOGO}`

  // console.log("image url =-=-=-=-", imageUrl)

  // const template2 =
  //     ` <p>Click this 👉 <a href = "http://localhost/moov_app/admin_resetPassword.php?token=` + resultant.token + `"> Link </a> to Reset your Password </p>`;

  const template =
    `<!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Forgot Password</title>
    
            <style type="text/css">
                @media only screen and (max-width: 480px) {
                body,
                table,
                td,
                p,
                a,
                li,
                blockquote {
                    -webkit-text-size-adjust: none !important
                }
                body {
                    width: 100% !important;
                    min-width: 100% !important
                }
                td[id=bodyCell] {
                    padding: 10px !important
                }
                table.kmMobileHide {
                    display: none !important
                }
                table[class=kmTextContentContainer] {
                    width: 100% !important
                }
                table[class=kmBoxedTextContentContainer] {
                    width: 100% !important
                }
                td[class=kmImageContent] {
                    padding-left: 0 !important;
                    padding-right: 0 !important
                }
                img[class=kmImage],
                img.kmImage {
                    width: 100% !important
                }
                td.kmMobileStretch {
                    padding-left: 0 !important;
                    padding-right: 0 !important
                }
                table[class=kmSplitContentLeftContentContainer],
                table.kmSplitContentLeftContentContainer,
                table[class=kmSplitContentRightContentContainer],
                table.kmSplitContentRightContentContainer,
                table[class=kmColumnContainer],
                td[class=kmVerticalButtonBarContentOuter] table[class=kmButtonBarContent],
                td[class=kmVerticalButtonCollectionContentOuter] table[class=kmButtonCollectionContent],
                table[class=kmVerticalButton],
                table[class=kmVerticalButtonContent] {
                    width: 100% !important
                }
                td[class=kmButtonCollectionInner] {
                    padding-left: 9px !important;
                    padding-right: 9px !important;
                    padding-top: 9px !important;
                    padding-bottom: 0 !important;
                    background-color: transparent !important
                }
                td[class=kmVerticalButtonIconContent],
                td[class=kmVerticalButtonTextContent],
                td[class=kmVerticalButtonContentOuter] {
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    padding-bottom: 9px !important
                }
                table[class=kmSplitContentLeftContentContainer] td[class=kmTextContent],
                table[class=kmSplitContentRightContentContainer] td[class=kmTextContent],
                table[class=kmColumnContainer] td[class=kmTextContent],
                table[class=kmSplitContentLeftContentContainer] td[class=kmImageContent],
                table[class=kmSplitContentRightContentContainer] td[class=kmImageContent],
                table.kmSplitContentLeftContentContainer td.kmImageContent,
                table.kmSplitContentRightContentContainer td.kmImageContent {
                    padding-top: 9px !important
                }
                td[class="rowContainer kmFloatLeft"],
                td.rowContainer.kmFloatLeft,
                td[class="rowContainer kmFloatLeft firstColumn"],
                td.rowContainer.kmFloatLeft.firstColumn,
                td[class="rowContainer kmFloatLeft lastColumn"],
                td.rowContainer.kmFloatLeft.lastColumn {
                    float: left;
                    clear: both;
                    width: 100% !important
                }
                table[class=templateContainer],
                table[class="templateContainer brandingContainer"],
                div[class=templateContainer],
                div[class="templateContainer brandingContainer"],
                table[class=templateRow] {
                    max-width: 600px !important;
                    width: 100% !important
                }
                h1 {
                    font-size: 24px !important;
                    line-height: 130% !important
                }
                h2 {
                    font-size: 20px !important;
                    line-height: 130% !important
                }
                h3 {
                    font-size: 18px !important;
                    line-height: 130% !important
                }
                h4 {
                    font-size: 16px !important;
                    line-height: 130% !important
                }
                td[class=kmTextContent] {
                    font-size: 14px !important;
                    line-height: 130% !important
                }
                td[class=kmTextBlockInner] td[class=kmTextContent] {
                    padding-right: 18px !important;
                    padding-left: 18px !important
                }
                table[class="kmTableBlock kmTableMobile"] td[class=kmTableBlockInner] {
                    padding-left: 9px !important;
                    padding-right: 9px !important
                }
                table[class="kmTableBlock kmTableMobile"] td[class=kmTableBlockInner] [class=kmTextContent] {
                    font-size: 14px !important;
                    line-height: 130% !important;
                    padding-left: 4px !important;
                    padding-right: 4px !important
                }
                }
                .btn {
                  display: inline-block;
                  padding: 6px 12px;
                  margin-bottom: 0;
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 1.42857143;
                  text-align: center !important;
                  white-space: nowrap;
                  vertical-align: middle;
                  -ms-touch-action: manipulation;
                  touch-action: manipulation;
                  cursor: pointer;
                  -webkit-user-select: none;
                  -moz-user-select: none;
                  -ms-user-select: none;
                  user-select: none;
                  background-image: none;
                  border: 1px solid transparent;
                  border-radius: 4px;
                }
                .btn-default, .btn-default:hover, .btn-default:focus, .btn-default:active, .btn-default.active, .btn-default.focus, .btn-default:active, .btn-default:focus, .btn-default:hover, .open > .dropdown-toggle.btn-default {
                    background: #cf3246 !important;
                    border: 1px solid #cf3246 !important;
                    color: white !important;
                    text-decoration: none !important;
                }
            </style>
            <!--[if mso]>
            <style>
              
              .templateContainer {
                border: 1px none #aaaaaa;
                background-color: #FFFFFF;
                
              }
              #brandingContainer {
                background-color: transparent !important;
                border: 0;
              }
              
              
              .templateContainerInner {
                padding: 0px;
              }
              
            </style>
            <![endif]-->
        </head>
          <body style="margin:0;padding:0;background-color:#FFF">
            <center>
              <table align="center" border="0" cellpadding="0" cellspacing="0" id="bodyTable" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;padding:0;background-color:#FFF;height:100%;margin:0;width:100%">
                <tbody>
                  <tr>
                    <td align="center" id="bodyCell" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;padding-top:50px;padding-left:20px;padding-bottom:20px;padding-right:20px;border-top:0;height:100%;margin:0;width:100%">
                      <!--[if !mso]><!-->
                      <div class="templateContainer" style="border:1px none #aaa;border-radius:45px 0px 45px 0px;background: linear-gradient(to right, #fff 0%, #fff 100%);display: table; width:600px">
                        <div class="templateContainerInner" style="padding:0">
                          <!--<![endif]-->
                    <!--[if mso]>
                      <table border="0" cellpadding="0" cellspacing="0" class="templateContainer"  width="600" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
                      <tbody>
                        <tr>
                          <td class="templateContainerInner" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
                            <![endif]-->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                              <tr>
                                <td align="center" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                                  <table border="0" cellpadding="0" cellspacing="0" class="templateRow" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                                    <tbody>
                                      <tr>
                                        <td class="rowContainer kmFloatLeft" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                                          <table border="0" cellpadding="0" cellspacing="0" class="kmTextBlock" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                                            <tbody class="kmTextBlockOuter">
                                              <tr>
                                                <td class="kmTextBlockInner" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
                                                  <table align="left" border="0" cellpadding="0" cellspacing="0" class="kmTextContentContainer" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                                                    <tbody>
                                                      <tr>
                                                        <td class="kmTextContent" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;color:#000;font-family:Helvetica, Arial;font-size:14px;line-height:150%;text-align:left;padding-top:9px;padding-bottom:9px;padding-left:18px;padding-right:18px;">
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <table border="0" cellpadding="0" cellspacing="0" class="kmImageBlock" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;min-width:100%">
                                            <tbody class="kmImageBlockOuter">
                                              <tr>
                                                <td class="kmImageBlockInner" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;padding:9px;" valign="top">
                                                  <table align="left" border="0" cellpadding="0" cellspacing="0" class="kmImageContentContainer" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;min-width:100%">
                                                    <tbody>
                                                      <tr>
                                                        <td class="kmImageContent" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;padding:0;padding-top:0px;padding-bottom:0;padding-left:9px;padding-right:9px;text-align: center;
                                                        background: linear-gradient(to right, #fff 0%, #fff 100%) !important;">
                                                          <!-- Your Logo -->
    
                                                          <img align="center" alt="Logo" class="kmImage" src="${imageUrl}" width="100" style="border:0;height:auto;line-height:100%;outline:none;text-decoration:none;padding-bottom:0;display:inline;vertical-align:bottom;max-width:199px;" />
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <table border="0" cellpadding="0" cellspacing="0" class="kmTextBlock" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                                            <tbody class="kmTextBlockOuter">
                                              <tr>
                                                <td class="kmTextBlockInner" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
                                                  <table align="left" border="0" cellpadding="0" cellspacing="0" class="kmTextContentContainer" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">
                                                    <tbody>
                                                      <tr>
                                                        <td class="kmTextContent" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;color:#000;font-family:Helvetica, Arial;font-size:14px;line-height:150%;text-align:left;padding-top:9px;padding-bottom:9px;padding-left:18px;padding-right:18px;">
                                                          <span style="color:#000000;"></span>
                                                          <!-- Your Content As below -->
                                                          <p style="margin:0;padding-bottom:1em;text-align: justify;"><span style="font-size:16px;"><span style="color: rgb(0, 0, 0);"><span style="font-family: arial,helvetica,sans-serif;"></span></span></span></p>
                                                          <p style="margin:0;padding-bottom:1em"><span style="font-family:arial,helvetica,sans-serif;"><span style="font-size: 16px;">Hi <strong>${resultant.first_name + ' ' + resultant.last_name}</strong>,</span></span></p>
                                                          <p style="margin:0;padding-bottom:1em">It seems you have forgotten your password.</p>
                                                          <p style="margin:0;padding-bottom:1em">Please click on the link below and follow the steps to change your password: </p>
                                                        
                                                          <p style="text-align: center;margin:0;padding-bottom:1em">
                                                            <span style="font-family:arial,helvetica,sans-serif;">
                                                              <span style="font-size: 16px;">
                                                                <a href="${result.url}" target="_blank" class="btn btn-default" style="word-wrap:break-word;color:darkturquoise;font-weight:normal;text-decoration:underline;margin-right:100px;">Reset Password</a>
                                                              </span>
                                                            </span>
                                                          </p>

                                                          <p style="margin:0;padding-bottom:1em"> If you did not request this change, please let us know by replying to this email.</p>

                                                          <p style="margin:0;padding-bottom:1em"> </p>
                                                          <p style="margin:0;padding-bottom:1em"><span style="font-family:arial,helvetica,sans-serif;"><span style="font-size: 16px;">Kind Regards,</span></span></p>
                                                          <p style="margin:0;padding-bottom:0"><span style="font-family:arial,helvetica,sans-serif;"><span style="font-size: 16px;">${GLOBALS.APP_NAME}</span></span>
                                                          </p>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!--[if !mso]><!-->
                          </div>
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </center>
          </body>
      </html>`

  callback(template);
}