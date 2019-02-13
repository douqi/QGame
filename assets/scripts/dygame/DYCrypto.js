 /**
 * ============================
 * @FileName: DYCrypto.js
 * @Desc:     加密
 * @Author:   Chen
 * @DateTime: 2018-05-18
 * ============================
 */
function xor(str) { 
    var monyer = 0;
    for (var i = 0; i < str.length; i++) { 
        monyer += str.charCodeAt(i)^0x12;
    } 
    return monyer; 
}

// BASE64
function Base64() {
    // private property
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
 
    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }
 
    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }
 
    // private method for UTF-8 encoding
    var _utf8_encode = function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
        return utftext;
    }
 
    // private method for UTF-8 decoding
    var _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

// MD5
var MD5_CORE = function(data) {

    // convert number to (unsigned) 32 bit hex, zero filled string
    function to_zerofilled_hex(n) {     
        var t1 = (n >>> 0).toString(16);
        return "00000000".substr(0, 8 - t1.length) + t1;
    }

    // convert array of chars to array of bytes 
    function chars_to_bytes(ac) {
        var retval = [];
        for (var i = 0; i < ac.length; i++) {
            retval = retval.concat(str_to_bytes(ac[i]));
        }
        return retval;
    }


    // convert a 64 bit unsigned number to array of bytes. Little endian
    function int64_to_bytes(num) {
        var retval = [];
        for (var i = 0; i < 8; i++) {
            retval.push(num & 0xFF);
            num = num >>> 8;
        }
        return retval;
    }

    //  32 bit left-rotation
    function rol(num, places) {
        return ((num << places) & 0xFFFFFFFF) | (num >>> (32 - places));
    }

    // The 4 MD5 functions
    function fF(b, c, d) {
        return (b & c) | (~b & d);
    }

    function fG(b, c, d) {
        return (d & b) | (~d & c);
    }

    function fH(b, c, d) {
        return b ^ c ^ d;
    }

    function fI(b, c, d) {
        return c ^ (b | ~d);
    }

    // pick 4 bytes at specified offset. Little-endian is assumed
    function bytes_to_int32(arr, off) {
        return (arr[off + 3] << 24) | (arr[off + 2] << 16) | (arr[off + 1] << 8) | (arr[off]);
    }

    /*
    Conver string to array of bytes in UTF-8 encoding
    See: 
    http://www.dangrossman.info/2007/05/25/handling-utf-8-in-javascript-php-and-non-utf8-databases/
    http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
    How about a String.getBytes(<ENCODING>) for Javascript!? Isn't it time to add it?
    */
    function str_to_bytes(str) {
        var retval = [ ];
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) <= 0x7F) {
                retval.push(str.charCodeAt(i));
            } else {
                var tmp = encodeURIComponent(str.charAt(i)).substr(1).split("%");
                for (var j = 0; j < tmp.length; j++) {
                    retval.push(parseInt(tmp[j], 0x10));
                }
            }
        }
        return retval;
    }

    // convert the 4 32-bit buffers to a 128 bit hex string. (Little-endian is assumed)
    function int128le_to_hex(a, b, c, d) {
        var ra = "";
        var t = 0;
        var ta = 0;
        for (var i = 3; i >= 0; i--) {
            ta = arguments[i];
            t = (ta & 0xFF);
            ta = ta >>> 8;
            t = t << 8;
            t = t | (ta & 0xFF);
            ta = ta >>> 8;
            t = t << 8;
            t = t | (ta & 0xFF);
            ta = ta >>> 8;
            t = t << 8;
            t = t | ta;
            ra = ra + to_zerofilled_hex(t);
        }
        return ra;
    }

    // conversion from typed byte array to plain javascript array 
    function typed_to_plain(tarr) {
        var retval = new Array(tarr.length);
        for (var i = 0; i < tarr.length; i++) {
            retval[i] = tarr[i];
        }
        return retval;
    }

    // check input data type and perform conversions if needed
    var databytes = null;
    
    function cloneArray(inpArr) {
        return inpArr.slice();
    }
    
    // String
    var type_mismatch = null;
    if (typeof data == "string") {
        // convert string to array bytes
        databytes = str_to_bytes(data);
    } else if (data.constructor == Array) {
        if (data.length === 0) {
            // if it's empty, just assume array of bytes
            databytes = cloneArray(data);
        } else if (typeof data[0] == "string") {
            databytes = chars_to_bytes(data);
        } else if (typeof data[0] == "number") {
            databytes = cloneArray(data);
        } else {
            type_mismatch = typeof data[0];
        }
    } else if (typeof ArrayBuffer != "undefined") {
        if (data instanceof ArrayBuffer) {
            databytes = typed_to_plain(new Uint8Array(data));
        } else if ((data instanceof Uint8Array) || (data instanceof Int8Array)) {
            databytes = typed_to_plain(data);
        } else if ((data instanceof Uint32Array) || (data instanceof Int32Array) || 
                (data instanceof Uint16Array) || (data instanceof Int16Array) || 
                (data instanceof Float32Array) || (data instanceof Float64Array)) {
             databytes = typed_to_plain(new Uint8Array(data.buffer));
        } else {
            type_mismatch = typeof data;
        }   
    } else {
        type_mismatch = typeof data;
    }

    if (type_mismatch) {
        alert("MD5 type mismatch, cannot process " + type_mismatch);
    }

    function _add(n1, n2) {
        return 0x0FFFFFFFF & (n1 + n2);
    }

    return do_digest();

    function do_digest() {

        // function update partial state for each run
        function updateRun(nf, sin32, dw32, b32) {
            var temp = d;
            d = c;
            c = b;
            //b = b + rol(a + (nf + (sin32 + dw32)), b32)
            b = _add(b, 
                rol( 
                    _add(a, 
                        _add(nf, _add(sin32, dw32))
                    ), b32
                )
            );
            a = temp;
        }

        // save original length
        var org_len = databytes.length;

        // first append the "1" + 7x "0"
        databytes.push(0x80);

        // determine required amount of padding
        var tail = databytes.length % 64;
        // no room for msg length?
        if (tail > 56) {
            // pad to next 512 bit block
            for (var i = 0; i < (64 - tail); i++) {
                databytes.push(0x0);
            }
            tail = databytes.length % 64;
        }
        for (i = 0; i < (56 - tail); i++) {
            databytes.push(0x0);
        }
        // message length in bits mod 512 should now be 448
        // append 64 bit, little-endian original msg length (in *bits*!)
        databytes = databytes.concat(int64_to_bytes(org_len * 8));

        // initialize 4x32 bit state
        var h0 = 0x67452301;
        var h1 = 0xEFCDAB89;
        var h2 = 0x98BADCFE;
        var h3 = 0x10325476;

        // temp buffers
        var a = 0, b = 0, c = 0, d = 0;

        // Digest message
        for (i = 0; i < databytes.length / 64; i++) {
            // initialize run
            a = h0;
            b = h1;
            c = h2;
            d = h3;

            var ptr = i * 64;

            // do 64 runs
            updateRun(fF(b, c, d), 0xd76aa478, bytes_to_int32(databytes, ptr), 7);
            updateRun(fF(b, c, d), 0xe8c7b756, bytes_to_int32(databytes, ptr + 4), 12);
            updateRun(fF(b, c, d), 0x242070db, bytes_to_int32(databytes, ptr + 8), 17);
            updateRun(fF(b, c, d), 0xc1bdceee, bytes_to_int32(databytes, ptr + 12), 22);
            updateRun(fF(b, c, d), 0xf57c0faf, bytes_to_int32(databytes, ptr + 16), 7);
            updateRun(fF(b, c, d), 0x4787c62a, bytes_to_int32(databytes, ptr + 20), 12);
            updateRun(fF(b, c, d), 0xa8304613, bytes_to_int32(databytes, ptr + 24), 17);
            updateRun(fF(b, c, d), 0xfd469501, bytes_to_int32(databytes, ptr + 28), 22);
            updateRun(fF(b, c, d), 0x698098d8, bytes_to_int32(databytes, ptr + 32), 7);
            updateRun(fF(b, c, d), 0x8b44f7af, bytes_to_int32(databytes, ptr + 36), 12);
            updateRun(fF(b, c, d), 0xffff5bb1, bytes_to_int32(databytes, ptr + 40), 17);
            updateRun(fF(b, c, d), 0x895cd7be, bytes_to_int32(databytes, ptr + 44), 22);
            updateRun(fF(b, c, d), 0x6b901122, bytes_to_int32(databytes, ptr + 48), 7);
            updateRun(fF(b, c, d), 0xfd987193, bytes_to_int32(databytes, ptr + 52), 12);
            updateRun(fF(b, c, d), 0xa679438e, bytes_to_int32(databytes, ptr + 56), 17);
            updateRun(fF(b, c, d), 0x49b40821, bytes_to_int32(databytes, ptr + 60), 22);
            updateRun(fG(b, c, d), 0xf61e2562, bytes_to_int32(databytes, ptr + 4), 5);
            updateRun(fG(b, c, d), 0xc040b340, bytes_to_int32(databytes, ptr + 24), 9);
            updateRun(fG(b, c, d), 0x265e5a51, bytes_to_int32(databytes, ptr + 44), 14);
            updateRun(fG(b, c, d), 0xe9b6c7aa, bytes_to_int32(databytes, ptr), 20);
            updateRun(fG(b, c, d), 0xd62f105d, bytes_to_int32(databytes, ptr + 20), 5);
            updateRun(fG(b, c, d), 0x2441453, bytes_to_int32(databytes, ptr + 40), 9);
            updateRun(fG(b, c, d), 0xd8a1e681, bytes_to_int32(databytes, ptr + 60), 14);
            updateRun(fG(b, c, d), 0xe7d3fbc8, bytes_to_int32(databytes, ptr + 16), 20);
            updateRun(fG(b, c, d), 0x21e1cde6, bytes_to_int32(databytes, ptr + 36), 5);
            updateRun(fG(b, c, d), 0xc33707d6, bytes_to_int32(databytes, ptr + 56), 9);
            updateRun(fG(b, c, d), 0xf4d50d87, bytes_to_int32(databytes, ptr + 12), 14);
            updateRun(fG(b, c, d), 0x455a14ed, bytes_to_int32(databytes, ptr + 32), 20);
            updateRun(fG(b, c, d), 0xa9e3e905, bytes_to_int32(databytes, ptr + 52), 5);
            updateRun(fG(b, c, d), 0xfcefa3f8, bytes_to_int32(databytes, ptr + 8), 9);
            updateRun(fG(b, c, d), 0x676f02d9, bytes_to_int32(databytes, ptr + 28), 14);
            updateRun(fG(b, c, d), 0x8d2a4c8a, bytes_to_int32(databytes, ptr + 48), 20);
            updateRun(fH(b, c, d), 0xfffa3942, bytes_to_int32(databytes, ptr + 20), 4);
            updateRun(fH(b, c, d), 0x8771f681, bytes_to_int32(databytes, ptr + 32), 11);
            updateRun(fH(b, c, d), 0x6d9d6122, bytes_to_int32(databytes, ptr + 44), 16);
            updateRun(fH(b, c, d), 0xfde5380c, bytes_to_int32(databytes, ptr + 56), 23);
            updateRun(fH(b, c, d), 0xa4beea44, bytes_to_int32(databytes, ptr + 4), 4);
            updateRun(fH(b, c, d), 0x4bdecfa9, bytes_to_int32(databytes, ptr + 16), 11);
            updateRun(fH(b, c, d), 0xf6bb4b60, bytes_to_int32(databytes, ptr + 28), 16);
            updateRun(fH(b, c, d), 0xbebfbc70, bytes_to_int32(databytes, ptr + 40), 23);
            updateRun(fH(b, c, d), 0x289b7ec6, bytes_to_int32(databytes, ptr + 52), 4);
            updateRun(fH(b, c, d), 0xeaa127fa, bytes_to_int32(databytes, ptr), 11);
            updateRun(fH(b, c, d), 0xd4ef3085, bytes_to_int32(databytes, ptr + 12), 16);
            updateRun(fH(b, c, d), 0x4881d05, bytes_to_int32(databytes, ptr + 24), 23);
            updateRun(fH(b, c, d), 0xd9d4d039, bytes_to_int32(databytes, ptr + 36), 4);
            updateRun(fH(b, c, d), 0xe6db99e5, bytes_to_int32(databytes, ptr + 48), 11);
            updateRun(fH(b, c, d), 0x1fa27cf8, bytes_to_int32(databytes, ptr + 60), 16);
            updateRun(fH(b, c, d), 0xc4ac5665, bytes_to_int32(databytes, ptr + 8), 23);
            updateRun(fI(b, c, d), 0xf4292244, bytes_to_int32(databytes, ptr), 6);
            updateRun(fI(b, c, d), 0x432aff97, bytes_to_int32(databytes, ptr + 28), 10);
            updateRun(fI(b, c, d), 0xab9423a7, bytes_to_int32(databytes, ptr + 56), 15);
            updateRun(fI(b, c, d), 0xfc93a039, bytes_to_int32(databytes, ptr + 20), 21);
            updateRun(fI(b, c, d), 0x655b59c3, bytes_to_int32(databytes, ptr + 48), 6);
            updateRun(fI(b, c, d), 0x8f0ccc92, bytes_to_int32(databytes, ptr + 12), 10);
            updateRun(fI(b, c, d), 0xffeff47d, bytes_to_int32(databytes, ptr + 40), 15);
            updateRun(fI(b, c, d), 0x85845dd1, bytes_to_int32(databytes, ptr + 4), 21);
            updateRun(fI(b, c, d), 0x6fa87e4f, bytes_to_int32(databytes, ptr + 32), 6);
            updateRun(fI(b, c, d), 0xfe2ce6e0, bytes_to_int32(databytes, ptr + 60), 10);
            updateRun(fI(b, c, d), 0xa3014314, bytes_to_int32(databytes, ptr + 24), 15);
            updateRun(fI(b, c, d), 0x4e0811a1, bytes_to_int32(databytes, ptr + 52), 21);
            updateRun(fI(b, c, d), 0xf7537e82, bytes_to_int32(databytes, ptr + 16), 6);
            updateRun(fI(b, c, d), 0xbd3af235, bytes_to_int32(databytes, ptr + 44), 10);
            updateRun(fI(b, c, d), 0x2ad7d2bb, bytes_to_int32(databytes, ptr + 8), 15);
            updateRun(fI(b, c, d), 0xeb86d391, bytes_to_int32(databytes, ptr + 36), 21);

            // update buffers
            h0 = _add(h0, a);
            h1 = _add(h1, b);
            h2 = _add(h2, c);
            h3 = _add(h3, d);
        }
        // Done! Convert buffers to 128 bit (LE)
        return int128le_to_hex(h3, h2, h1, h0);
    }
};

function MD5() {
    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for more info.
     */

    /*
     * Configurable variables. You may need to tweak these to be compatible with
     * the server-side, but the defaults work in most cases.
     */
    var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
    var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
    var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

    /*
     * These are the functions you'll usually want to call
     * They take string arguments and return either hex or base-64 encoded strings
     */
    this.hex_md5 = function(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
    this.b64_md5 = function(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
    this.str_md5 = function(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
    this.hex_hmac_md5 = function(key, data) { return binl2hex(core_hmac_md5(key, data)); }
    this.b64_hmac_md5 = function(key, data) { return binl2b64(core_hmac_md5(key, data)); }
    this.str_hmac_md5 = function(key, data) { return binl2str(core_hmac_md5(key, data)); }

    this.hex_md5_for_uint8arr = function(s){ return MD5_CORE(s);}
    /*
     * Perform a simple self-test to see if the VM is working
     */
    this.md5_vm_test = function() {
      return this.hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
    }

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length
     */
    var core_md5 = function(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;

        for(var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
    }

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    var md5_cmn = function(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
    }
    var md5_ff = function(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    var md5_gg = function(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    var md5_hh = function(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    var md5_ii = function(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Calculate the HMAC-MD5, of a key and some data
     */
    var core_hmac_md5 = function(key, data)
    {
        var bkey = str2binl(key);
        if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

        var ipad = Array(16), opad = Array(16);
        for(var i = 0; i < 16; i++) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
        return core_md5(opad.concat(hash), 512 + 128);
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    var safe_add = function(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    var bit_rol = function(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * Convert a string to an array of little-endian words
     * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
     */
    var str2binl = function(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
        }
        return bin;
    }

    /*
     * Convert an array of little-endian words to a string
     */
    var binl2str = function(bin)
    {
        var str = "";
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < bin.length * 32; i += chrsz) {
            str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
        }
        return str;
    }

    /*
     * Convert an array of little-endian words to a hex string.
     */
    var binl2hex = function(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
        }
        return str;
    }

    /*
     * Convert an array of little-endian words to a base-64 string
     */
    var binl2b64 = function(binarray) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i += 3) {
            var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                    | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                    |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
            for(var j = 0; j < 4; j++) {
                if(i * 8 + j * 6 > binarray.length * 32) {
                    str += b64pad;
                } else {
                    str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
                } 
            }
        }
        return str;
    }
};

// SHA_1
function SHA_1() {
    /*   
     *   A   JavaScript   implementation   of   the   Secure   Hash   Algorithm,   SHA-1,   as   defined   
     *   in   FIPS   PUB   180-1   
     *   Version   2.1-BETA   Copyright   Paul   Johnston   2000   -   2002.   
     *   Other   contributors:   Greg   Holt,   Andrew   Kepert,   Ydnar,   Lostinet   
     *   Distributed   under   the   BSD   License   
     *   See   http://pajhome.org.uk/crypt/md5   for   details.   
     */
    /*   
     *   Configurable   variables.   You   may   need   to   tweak   these   to   be   compatible   with   
     *   the   server-side,   but   the   defaults   work   in   most   cases.   
     */
    var hexcase = 0; /*   hex   output   format.   0   -   lowercase;   1   -   uppercase                 */
    var b64pad = ""; /*   base-64   pad   character.   "="   for   strict   RFC   compliance       */
    var chrsz = 8; /*   bits   per   input   character.   8   -   ASCII;   16   -   Unicode             */

    /*
     * These are the functions you'll usually want to call
     * They take string arguments and return either hex or base-64 encoded strings
     */
    this.hex_sha1 = function(s) {return binb2hex(core_sha1(str2binb(s), s.length * chrsz));}
    this.b64_sha1 = function(s) {return binb2b64(core_sha1(str2binb(s), s.length * chrsz));}
    this.str_sha1 = function(s) {return binb2str(core_sha1(str2binb(s), s.length * chrsz));}
    this.hex_hmac_sha1 = function(key, data) {return binb2hex(core_hmac_sha1(key, data));}
    this.b64_hmac_sha1 = function(key, data) {return binb2b64(core_hmac_sha1(key, data));}
    this.str_hmac_sha1 = function(key, data) {return binb2str(core_hmac_sha1(key, data));}

    /*   
     *   Perform   a   simple   self-test   to   see   if   the   VM   is   working   
     */
    this.sha1_vm_test = function() {
        return this.hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
    }

    /*   
     *   Calculate   the   SHA-1   of   an   array   of   big-endian   words,   and   a   bit   length   
     */
    var core_sha1 = function(x, len) {
        /*   append   padding   */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;

            for (var j = 0; j < 80; j++) {
                if (j < 16) w[j] = x[i + j];
                else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = rol(b, 30);
                b = a;
                a = t;
            }

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);
    }

    /*   
     *   Perform   the   appropriate   triplet   combination   function   for   the   current   
     *   iteration   
     */
    var sha1_ft = function(t, b, c, d) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }

    /*   
     *   Determine   the   appropriate   additive   constant   for   the   current   iteration   
     */
    var sha1_kt = function(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
    }

    /*   
     *   Calculate   the   HMAC-SHA1   of   a   key   and   some   data   
     */
    var core_hmac_sha1 = function(key, data) {
        var bkey = str2binb(key);
        if (bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

        var ipad = Array(16),
            opad = Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
        return core_sha1(opad.concat(hash), 512 + 160);
    }

    /*   
     *   Add   integers,   wrapping   at   2^32.   This   uses   16-bit   operations   internally   
     *   to   work   around   bugs   in   some   JS   interpreters.   
     */
    var safe_add = function(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*   
     *   Bitwise   rotate   a   32-bit   number   to   the   left.   
     */
    var rol = function(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*   
     *   Convert   an   8-bit   or   16-bit   string   to   an   array   of   big-endian   words   
     *   In   8-bit   function,   characters   >255   have   their   hi-byte   silently   ignored.   
     */
    var str2binb = function(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        }
        return bin;
    }

    /*   
     *   Convert   an   array   of   big-endian   words   to   a   string   
     */
    var binb2str = function(bin) {
        var str = "";
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < bin.length * 32; i += chrsz) {
            str += String.fromCharCode((bin[i >> 5] >>> (24 - i % 32)) & mask);
        }
        return str;
    }

    /*   
     *   Convert   an   array   of   big-endian   words   to   a   hex   string.   
     */
    var binb2hex = function(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    }

    /*   
     *   Convert   an   array   of   big-endian   words   to   a   base-64   string   
     */
    var binb2b64 = function(binarray) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i += 3) {
            var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) 
                | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) 
                | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
            for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 > binarray.length * 32) {
                    str += b64pad;
                } else {
                    str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
                }
            }
        }
        return str;
    }
};

module.exports = {
    base64 : new Base64(),
    md5 : new MD5(),
    sha1 : new SHA_1(),
    xor : xor
};