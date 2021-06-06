const { sequelize, Sequelize : { QueryTypes} } = require("../models");


module.exports.findidValidator = async (req, res, next) => {

     try { 
         //** 필수 데이터 체크 */
         if (!req.body.email) {
             throw new Error("이메일을 입력해주세요!");
         } 
         if (!req.body.phone) {
             throw new Error("휴대폰번호를 입력해주세요!");
         }

          // 이메일 존재 유무 체크 
        const sql = "SELECT COUNT(*) as cnt FROM member WHERE email = ?";
        const rows = await sequelize.query(sql,{
                replacements : [req.body.email],
                type:QueryTypes.SELECT,
        })
        if (rows[0].cnt == 0)  {
            throw new Error("존재하지 않는 이메일 입니다.");
        }

         // 휴대전화 존재 유무 체크 
         const sql2 = "SELECT COUNT(*) as cnt FROM member WHERE phone = ?";
         const rows2 = await sequelize.query(sql2,{
                 replacements : [req.body.phone],
                 type:QueryTypes.SELECT,
         })
         if (rows2[0].cnt == 0)  {
             throw new Error("존재하지 않는 휴대전화 입니다.");
         }
         next(err);
     } catch(err) {
         return res.send (`<script>alert('${err.message}');history.bakc();</script>`);
     }

    
}