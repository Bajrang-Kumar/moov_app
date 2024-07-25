
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
    <title>Welcome to Moov App </title>

    <style type="text/css">

        ::selection { background-color: #E13300; color: white; }
        ::-moz-selection { background-color: #E13300; color: white; }

        body {
            background-color: #fff;
            margin: 40px;
            font: 13px/20px normal Helvetica, Arial, sans-serif;
            color: #4F5155;
        }

        a {
            color: #003399;
            background-color: transparent;
            font-weight: normal;
        }

        h1 {
            color: #444;
            background-color: transparent;
            border-bottom: 1px solid #D0D0D0;
            font-size: 19px;
            font-weight: normal;
            margin: 0 0 14px 0;
            padding: 14px 15px 10px 15px;
        }

        code {
            font-family: Consolas, Monaco, Courier New, Courier, monospace;
            font-size: 12px;
            background-color: #f9f9f9;
            border: 1px solid #D0D0D0;
            color: #002166;
            display: block;
            margin: 14px 0 14px 0;
            padding: 12px 10px 12px 10px;
        }

        #body {
            margin: 0 15px 0 15px;
        }

        p.footer {
            text-align: right;
            font-size: 11px;
            border-top: 1px solid #D0D0D0;
            line-height: 32px;
            padding: 0 10px 0 10px;
            margin: 20px 0 0 0;
        }

        #container {
            margin: 10px;
            border: 1px solid #D0D0D0;
            box-shadow: 0 0 8px #D0D0D0;
        }
    </style>
</head>
<body>

<div id="container">
    <h1>Moov App Encryption & Decryption</h1>

    <div id="body">
        <form class='form-horizontal' role='form' id = 'poster_add' name= 'poster_add' enctype='multipart/form-data' action="enc_dec.php" method="POST">
            <label><b>Text or Encryption </b></label><br>
            <textarea name="data" id="data" required="" cols="90" rows="10"></textarea>
            <br>
            <br>
             <input type="submit" name="type" value="Encrypt">
             <input type="submit" name="type" value="Decrypt"> 
             <input type="reset" name="reset" value="Clear"> 
            <br><br>
        </form>
    </div>
</div>

</body>
<script type="text/javascript">
    function CopyToClipboard(containerid) {
        if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(document.getElementById(containerid));
            range.select().createTextRange();
            document.execCommand("Copy");

        } else if (window.getSelection) {
            var range = document.createRange();
            document.getElementById(containerid).style.display = "block";
            range.selectNode(document.getElementById(containerid));
            window.getSelection().addRange(range);
            document.execCommand("Copy");
        }
    }
    function clearContents(containerid) {
        document.getElementById(containerid).value="";
    }
</script>
</html>

<?php

$encryptionMethod = 'AES-256-CBC';
$secret = hash('sha256', 'YuDRVd9BVOqmsVHBDSJtcZlwsUr2Q91S');
$iv = 'YuDRVd9BVOqmsVHB';
if (isset($_REQUEST['type']) && isset($_REQUEST['data']) && $_REQUEST['data'] != '') {
    if ($_REQUEST['type'] == 'Encrypt') {
        $plaintext = trim($_REQUEST['data']);
        $decrypt_value = $_REQUEST['data'];
        $encrypt_value = openssl_encrypt($plaintext, $encryptionMethod, $secret, 0, $iv);
        echo "<div id='container'><div id='body'><h2 onclick=CopyToClipboard('p1') style='cursor: pointer;'>COPY HASH</h2>
        <p id='p1'>".$encrypt_value."</p><h2 onclick=CopyToClipboard('p2') style='cursor: pointer;'>COPY ORIGINAL</h2>
        <p id='p2'>".$decrypt_value."</p><h2 style='cursor: pointer;'>JSON</h2></div></div>";
        die();
    } else {
        $enc = $_REQUEST['data'];
        $decrypt_value = openssl_decrypt($enc, $encryptionMethod, $secret, 0, $iv);
        $encrypt_value = $_REQUEST['data'];
        echo "<div id='container'><div id='body'><h2 onclick=CopyToClipboard('p1') style='cursor: pointer;'>COPY HASH</h2>
        <p id='p1'>".$encrypt_value."</p><h2 onclick=CopyToClipboard('p2') style='cursor: pointer;'>COPY ORIGINAL</h2>
        <p id='p2'>".$decrypt_value."</p><h2 style='cursor: pointer;'>JSON</h2>";
        echo "<pre>";
        print_r(json_decode($decrypt_value));"</div></div>";
    }
}

?>