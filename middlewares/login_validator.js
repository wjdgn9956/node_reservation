const { sequelize, Sequelize : {QueryTypes}} = require("../models");



module.exports.loginValidator = async (req, res, next) => {
    try {
        // 필수 데이터 체크
        if (!req.body.memId) {
            throw new Error("아이디를 입력해주세요!");
        }
        if (!req.body.memPw) {
            throw new Error("비밀번호를 입력해주세요!")
        }

        // 회원의 존재 유무 체크 
        const sql = "SELECT COUNT(*) as cnt FROM member WHERE memId = ?";
        const rows = await sequelize.query(sql,{
                replacements : [req.body.memId],
                type:QueryTypes.SELECT,
        })
        if (rows[0].cnt == 0)  {
            throw new Error("존재하지 않는 아이디 입니다.");
        }

        next();  // 유효성 검사 성공 - 다음 미들웨어로 이동
    } catch (err) {
        return res.send(`<script>alert('${err.message}');history.back();</script>`);
    }
}
