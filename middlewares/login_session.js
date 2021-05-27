/**
 * 로그인 세션 처리
 */

 module.exports.loginSession = (req, res, next) => {
    
    req.isLogin = res.locals.isLogin = false;
    if (req.session.member) { // 로그인 성공
        req.isLogin = res.locals.isLogin = true;
        req.member = res.locals.member = req.session.member;
    }
    next(); // 항상 다음 미들웨어로 이동;
}