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
})