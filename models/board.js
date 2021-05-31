const { sequelize, Sequelize : { QueryTypes}} = require("./index");
const pagination = require("pagination");

/**
 * 게시판 Model
 * 
 */
const board = {
    params : {},
    /**
     * 처리할 데이터 설정
     * 
     * @param Object 처리할 데이터
     * @return this
     * 
     */
    data : function(params) {
        this.params = params;

        return this;
    },
    /**
     * 유효성 검사
     * 
     * @param String mode - register(등록), update("수정")
     * @return this
     * @throw Error 검증실패시
     * 
     */
    validator : function (mode) {
        mode = mode || "register";

        if (!this.params) {
            throw new Error("입력 데이터가 없습니다.");
        }

        switch (mode) {
            case "update" :
               //idx 
               if (!this.params.idx) {
                   throw new Error("잘못된 접근입니다.");
               }
            case "register" :
                const required = {
                    poster : "글쓴이를 입력해주세요",
                    subject : "제목을 입력해주세요",
                    contents : "내용을 입력해주세요",
                };

                for (key in required) {
                    if (!this.params[key]) {
                        throw new Error(required[key]);
                    }
                }

            break;
        }

        return this;
    },
   /**
    * 게시글 등록
    * 
    * @return Integer|Boolean 성공시 게시글 번호, 실패 -false
    */

   register : async function() {
       
        try {
            const sql = `INSERT INTO board (poster, subject, contents)
                         VALUES (:poster, :subject, :contents)`;
            const replacements = {
                poster : this.params.poster,
                subject : this.params.subject,
                contents : this.params.contents,
            } 
            const result = await sequelize.query(sql, {
                replacements,
                type : QueryTypes.INSERT,
            }) 
            
            // result [0]  -> idx(게시글번호, result[1] - 성공실패)
            return result[0];

        } catch (err){
            console.error(err);
            return false;
        }
   },

 	/**
	* 게시글 수정 
	*
	* @return Boolean
	*/
	update : async function() {
		try {
			const sql = `UPDATE board2 
									SET 
										poster = :poster,
										subject = :subject,
										contents = :contents
								WHERE 
										idx = :idx`;
			const replacements = {
				poster : this.params.poster,
				subject : this.params.subject,
				contents : this.params.contents,
				idx : this.params.idx,
			};				
			
			await sequelize.query(sql, {
				replacements,
				type : QueryTypes.UPDATE,
			});
			
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	},

   /**
    * 게시글 조회
    * 
    * @param Integer idx 게시글 번호
    * @return Object
    * 
    */
   get: async function (idx) {
       try {
           const sql = "SELECT * FROM board WHERE idx = ?";
           const rows = await sequelize.query(sql, {
               replacements : [idx],
               type : QueryTypes.SELECT,
           });

           const data = (rows.length > 0)?rows[0]:{};
           return data;

       } catch(err) {
           console.error(err);
           return false;
       }
   },

   /**
    * 게시글 목록 조회
    * 
    * @return Array | Boolean
    */

    getList : async function(page, limit) {
        page = page || 1;
        limit = limit || 5;
        const offset = (page -1) * limit; // 페이지 시작 레코드

        try {
            let sql = "SELECT COUNT(*) as cnt FROM board";
            let rows = await sequelize.query(sql, {
                type:QueryTypes.SELECT,
            });

            const totalResult = rows[0].cnt;
            const paginator = pagination.create('search', { prelink : "/board/list", current : page, rowsPerPage : limit, totalResult});


            sql = "SELECT * FROM board ORDER BY regDt DESC LIMIT ?, ?";
            rows = await sequelize.query(sql, {
                replacements : [offset, limit],
                type: QueryTypes.SELECT,
            });

            return { list : rows, pagination: paginator.render()};

        } catch (err) {
            console.error(err);
            return false;
        }
    },

   /**
    * 게시글 삭제
    * 
    * @param Integer idx 게시글 번호
    * @return Boolean
    */

   delete : async function (idx) {
       try {
            const sql = "DELETE FROM board WHERE idx = ?";
            await sequelize.query(sql, {
                replacements : [idx],
                type:QueryTypes.DELETE,
            })

            return true;
       } catch(err) {
           console.error(err);
           return false;
       }
   }
};

module.exports = board;