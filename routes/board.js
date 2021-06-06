const express = require("express");
const board = require("../models/board");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const router = express.Router();

/** 게시글 목록, 등록, 삭제, 수정 */

// 파일 업로드 설정 //

const upload = multer({
	storage : multer.diskStorage({
		// 파일저장 폴더 
		destination : (req, file, done) => {
			done(null, 'public/editor_image/');
		},
		// 저장될 파일명 설정 
		filename : (req, file, done) => {
			// 파일이름_timestamp_확장자
			const ext = path.extname(file.originalname)
			const filename = path.basename(file.originalname, ext) + "_" + Date.now() + "_" + ext;
			done(null, filename);
		},
	}),
	limits : { filesize : 10 * 1024 * 1024 },
});




router.route("/")
      // 게시글 등록 form
      .get (async (req, res, next) => {
          let data = {};
          if (req.query.idx) { // 게시글 수정인 경우
             data = await board.get(req.query.idx);
             if (!data) {
                 return res.send(`<script>alert('수정할 데이터가 존재하지 않습니다');history.back();</script>`);
             }
          }

          /** 
          if (!req.isLogin) {
              return res.send(`<script>history.back();</script>`)
          }
          */
          res.render("board/form", data);
      })

      // 게시글 등록
      .post(async (req, res, next) => {
          try {
            
            const idx = await board.data(req.body)
                                    .validator("register")
                                    .register();
             if (!idx) {
                 throw new Error("게시글 등록 실패!");
             }      
             //return res.redirect("/board" + idx); //등록 성공시 게시글 보기페이지로 이동
              return res.send(`<script>parent.location.href='/board/${idx}';</script>`);        
          } catch(err){
              return res.send(`<script>alert('${err.message}');</script>`);
          }
      })
      // 게시글 수정
      .patch(async (req, res, next) => {
		try {
			const result = await board.data(req.body)
											.validator("update")
											.update();
			if (!result) {
				throw new Error("게시글 수정 실패!");
			}
			
			return res.send(`<script>parent.location.href='/board/${req.body.idx}';</script>`);
		} catch (err) {
			return res.send(`<script>alert('${err.message}');</script>`);
		}
		
	});
    // 게시글 목록
    router.get("/list", async (req, res, next) => {
        
        // /list&page=1
        const page = req.query.page || 1;

        const data = await board.getList(page);
        data.list.forEach((v, i, _list) => {
            const date = new Date(v.regDt);
            const year = date.getFullYear();
            let month = date.getMonth() + 1;
            month = (month < 10)?"0"+month:month;
            let day = date.getDate();
            day = (day < 10)?"0"+day:day;
            _list[i].regDt = `${year}-${month}-${day}`;
        })

        res.render("board/list", data);
    })
 
 /** 게시글 조회 /board/등록번호 */
 router.get("/:idx", async (req, res, next) => {
     /**
      * req.query, req.params - GET
      * req.body - POST
      */
     const data = await board.get(req.params.idx);
     res.render("board/view", data);
 });     

 /** 게시글 삭제 */

 router.get("/delete/:idx", async (req, res, next) => {
     try {

        const result = await board.delete(req.params.idx);
        if (!result) {
            throw new Error("삭제 실패!");
        }

        return res.send("<script>location.href='/board/list';</script>");
     } catch (err) {
         console.error(err);
         return res.send(`<script>alert('${err.message}');history.back();</script>`);
     }
 });
 // 파일 업로드 처리 라우터 
router.post("/file", upload.single('file'), async (req, res, next) => {
	try {
		if (!req.file) {
			throw new Error("파일을 업로드해 주세요.");
		}
		
		if (req.file.mimetype.indexOf('image') == -1) {
			await fs.unlink(req.file.path);
			throw new Error("이미지 형식의 파일만 업로드해 주세요.");
		}
		
		return res.send(`<script>parent.insertImageEditor('${req.file.filename}');</script>`);
		
	} catch (err) {
		return res.send(`<script>alert('${err.message}');</script>`);
	}
});


module.exports = router;