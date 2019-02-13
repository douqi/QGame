var S_MAX_LEN = 1024 * 1024;
var DYCoder = {
    encode(plain){
        var len = plain.length;
        if(len > S_MAX_LEN){
            return "";
        }

        var tCypher = "";
        var tPart = Math.ceil(len / 5);  
        
        plain = plain + this._genRandomStr(tPart * 5 - len);
        for(let i = 0; i < 5; ++i){
            var ti = (i + 1) % 5;
            var tb = ti * tPart;
            var te = tb + tPart;
            if(te <= len){
                tCypher += plain.substr(tb, tPart);
            }
            else{
                plain = plain + this._genRandomStr(te - len);
                tCypher += plain.substr(tb, tPart);
            }
        }
        
        tCypher += String.fill("%09d", len);
        return tCypher;
    },

    decode(cypher){
        var strLen = cypher.substr(cypher.length - 9, 9);
        var strCypher = cypher.substr(0, cypher.length - 9);
        var len = strCypher.length;
        var tLen = parseInt(strLen);
        
        var tPlain = "";

        if(len % 5 !== 0){
            return "";
        }
        var tPart = Math.ceil(len / 5);
        for(let i = 0; i < 5; ++i){
            var ti = (i - 1 + 5) % 5;
            var tb = ti * tPart;
            var te = tb + tPart;
           
            tPlain += strCypher.substr(tb, tPart);
        }

        return tPlain.substr(0, tLen);
    },

    _genRandomStr(len){
        if(len <= 0){
            return "";
        }

        var ret = "";
        for(let i = 0; i < len; ++i){
            ret += "0";
        }
        return ret;
    }
}

module.exports = DYCoder;