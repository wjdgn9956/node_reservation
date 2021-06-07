/**
 * 
 * 회원 전용 미들웨어
 * 
 */

/** 회원 전용 페이지 */
module.exports.memberOnly = (req, res, next) => {
    if (!req.isLogin) {
        res.status(401);
        return res.send(`<script>alert('회원전용 페이지입니다');history.back();</script>`);
    }
    next();
}

/** 비회원 전용 페이지 */
module.exports.guestOnly = (req, res, next) => {
    if (req.isLogin) {
        res.status(401);
        return res.send(`<script>alert('비회원전용 페이지입니다');history.back();</script>`);
    }
    next();
}
/** 관리자 전용 페이지 */

module.exports.adminOnly = (req, res, next) => {
    if(!req.isLogin || !req.member.isAdmin) {
        res.status(401);
        return res.send(`<script>alert('관리자 전용 페이지입니다');history.back();</script>`);
    }

    next();
}