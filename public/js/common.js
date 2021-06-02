// 주소 검색


$(() => {

   

    /**주소 검색 */
    $(".address").click(function(){
        new daum.Postcode({
            oncomplete : function(data){
               $("input[name='address']").val(data.address);
            }
        }).open();
    })
});


$(() => {
    
     // CKEIDTOR 로드
     CKEDITOR.replace("contents");
     CKEDITOR.config.height = 350;
     
    
    // 레이어 팝업 블러 닫기//
    $("#layer_dim").click(function() {
        $("#layer_dim, #layer_popup").removeClass("dn").addClass("dn");
    });
    
      // 레이어  펼치기//
      $("#addImage").click(function() {
        $("#layer_dim, #layer_popup").removeClass("dn");
        
    });

    $("#frmFile input[type='file']").change(function() {
        $("frmFile").submit();
    })
})

function insertImageEditor(imageName) {
	const tag = `<img src='/editor_image/${imageName}' style='max-width:500px;'>`;
	
	CKEDITOR.instances.contents.insertHtml(tag);
	$("#layer_popup, #layer_dim").removeClass("dn").addClass("dn");
}

