const { sequelize, Sequelize : {QueryTypes}} = require("../models");
/**
 * 회원 가입 유효성 검사 미들웨어
 * 
 */
module.exports.joinValidator = async (req, res, next) => {
    try {
        /**
         * 아이디 유효성 검사 (8~20 영어, 숫자 포함)
         * 중복 아이디 체크
         */
        const memId = req.body.memId;
        if (memId.length < 8 || memId.length > 20 || /[^a-z0-9]/i.test(memId)){
            throw new Error ("아이디는 8~20 자이인 영어와 숫자로 구성해주세요");
        }

        // 중복 아이디 체크
        const sql = "SELECT COUNT (*) as cnt FROM member WHERE memId =?";
        const rows = await sequelize.query(sql, {
            replacements : [memId],
            type : QueryTypes.SELECT,
        })
        if (rows[0].cnt > 0 ){
            throw new Error("이미 사용중인 아이디입니다.");
        }

        /**
         * 유효성 검사 비밀번호
         * memPw, memPwRe 일치 여부
         * 자리수 (8~20 특수문자, 영어, 숫자, 대문자 포함)
         */
        const memPw = req.body.memPw;
        if (memPw && memPw != req.body.memPwRe) {
            throw new Error("비밀번호 확인이 일치하지 않습니다.");
        }

        if (memPw.length < 8 || memPw.length > 20 || !/[a-z]/.test(memPw) || !/[A-Z]/.test(memPw)
        || !/[\d]/.test(memPw) || !/[~!@#$%^&]/.test(memPw)) {
            throw new Error("비밀번호는 8~20자리인 대문자,특수문자 알파벳 숫자를 포함해주세요.");
        }


        next(); // 다음 미들웨어로 이동
    } catch (err) {
        return res.send(`<script>alert('${err.message}');history.back();</script>`);
    }
}