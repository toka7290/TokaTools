$(function(){
    // 変更
    $(document).on("change",'input[type="checkbox"]',function(){
        for(i=1;i<=$('div.tool-list div.tool-card').length;i++){
            tool_card = $('div.tool-list div.tool-card:nth-child('+i+')');
            is_show = false;
            if($('#filter_behavior').is(':checked') && tool_card.find('span.behavior')[0])is_show = true;
            if($('#filter_resource').is(':checked') && tool_card.find('span.resource')[0])is_show = true;
            if($('#filter_other').is(':checked') && tool_card.find('span.other')[0])is_show = true;
            if(is_show){
                tool_card.show(1000);
            }else{
                tool_card.hide(1000);
            }
        }
    });
})