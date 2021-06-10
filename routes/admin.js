/** 관리자 페이지 */
const express = require("express");
const router = express.Router();
const {adminOnly} = require("../middlewares/member_only");


router.get("/", adminOnly, (req, res, next) => {
    
    return res.render("admin/main");
})



module.exports = router;