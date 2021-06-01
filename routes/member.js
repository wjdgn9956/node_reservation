const express = require("express");
const bcrypt = require("bcrypt");
const { sequelize, Sequelize : {QueryTypes}} = require("../models");
const { joinValidator} = require("../middlewares/join_validator");
const { loginValidator } = require("../middlewares/login_validator");
const router = express.Router();

// 회원가입 처리 //
router.route("/join")
    .get((req, res, next) => { // 회원가입 폼

        /** 
        if (req.isLogin) { //로그인 상태인 경우 접근 불가.
            return res.send("<script>history.back();</script>");
        }
        */
        res.render("member/form");
    })
    // 회원가입 처리 구현 //
    .post(joinValidator, async (req, res, next) => {
        try {
            const hash = await bcrypt.hash(req.body.memPw, 10);
            const sql = `INSERT INTO member (memId, memPw, email, phone, address)
                            VALUES(:memId, :memPw, :email, :phone, :address)`;

            const replacements = {
                    memId : req.body.memId,
                    memPw : hash,
                    email : req.body.email,
                    phone : req.body.phone,
                    address : req.body.address,

            }   
            
            await sequelize.query(sql, {
                replacements,
                type : QueryTypes.INSERT,
            })

            // 회원가입 성공 - 로그인페이지로 이동
            
           // return res.render("member/login");
            return res.send("<script>parent.location.href='/member/login';</script>");
        } catch (err) {
            next(err); // 에러처리 미들웨어로 이동
        }
    })
  

// 로그인 처리//
router.route("/login")
    .get((req, res, next) => { // 로그인 폼
        if (req.isLogin) { //로그인 상태인 경우 접근 불가.
            return res.send("<script>history.back();</script>");
        }
        res.render("member/login");
    })    
    .post(loginValidator, async (req, res, next) => {
        /**
         * 1. 유효성 검사 -> lgoin_validator
         * 2. 아이디 -> 회원정보를 조회 
         * 3. 회원 입력비번과 회원정보의 비밀번호 해시의 비교
         * bcrypt.compare
         * 일치 -> 세션에 회원 정보를 찾을 수 있도록
         */
        try {
            const sql = "SELECT * FROM member WHERE memId = ?";
            let row = await sequelize.query(sql,{
                replacements : [req.body.memId],
                type : QueryTypes.SELECT,
            });
            
            const match = await bcrypt.compare(req.body.memPw, row[0].memPw);
            if (!match) { // 비밀번호 불일치
                return res.send("<script>alert('비밀번호 불일치');history.back();</script>");
            }
            // 비밀번호 일치
            delete row[0].memPw;
            req.session.member = row[0];

            // 메인페이지로 이동
            res.redirect("/");
        } catch(err) {
            next(err); // 에러처리 미들웨어로 이동
        }
    });
    // 회원 로그아웃 //
    router.get("/logout", (req, res, next) => {
        req.session.destroy();
        delete req.member;
        delete res.locals.member;

        req.islogin = res.locals.isLogin = false;

        res.redirect("/");
    })

    router.get("/mypage", (req, res, next) => {
        res.render("member/mypage");
    })

    /** 회원 정보 수정 */
    router.route("/join")
    .get((req, res, next) => {
        if (!req.isLogin) {
           return res.send("<script>history.back();</script>");
        }
        res.render("member/form");  
    })
    .patch(joinValidator, async (req, res, next) => {
         try {

            const replacements = {
                email : req.body.email,
                phone : req.body.phone,
                address :req.body.address,
                idx : req.member.idx,
            };

            let addSet = "";
            if (req.body.memPw) {
                addSet += ", memPw = :memPw";
                const hash = await bcrypt.hash(req.body.memPw, 10);
                replacements.memPw = hash;
            }

           const sql = `UPDATE member
                           SET 
                           email = :email,
                           phone = :phone,
                           address = :address
                           ${addSet}
                           WHERE 
                               idx = :idx`;
           
           const result = await sequelize.query(sql,{
               replacements,
               type: QueryTypes.UPDATE,
           });

           if (!result) {
               throw new Error("회원정보 수정 실패!");    
           }

           return res.send("<script>parent.location.href='/member/mypage';</script>");

         } catch(err){
            return res.send(`<script>alert('${err.message}');history.back();</script>`);
         }
    });
         
    
 


    
module.exports = router;