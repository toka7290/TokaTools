$(function(){
    // 宣言
    var isChanged = false;
    var format_version = "1.16.0";
    var is_separator_drag = false;
    onChangedJSON();
    // ページ離脱時に警告表示
    $(window).bind("beforeunload", function() {
        if (isChanged) {
            return "このページを離れようとしています。";
        }
    });
    // 変更
    $(document).on("change",'input,textarea,select',function(){
        onChangedJSON();
        isChanged = true;
    });
    // セパレータ移動
    $(".separator").on("mousedown",function(e){
        if(!is_separator_drag){
            is_separator_drag = true;

        }else if(is_separator_drag){
            is_separator_drag = false;
        }
    });
    $(document).on("mouseup",function(){
        is_separator_drag = false;
        $("html").removeAttr("style",'');
        $(".separator").prev().removeClass('drag_lock');
        $(".separator").next().removeClass('drag_lock');
    });
    $(document).on("mousemove",function(e){
        if(is_separator_drag){
            $("html").css("cursor","e-resize");
            $(".separator").prev().addClass('drag_lock');
            $(".separator").next().addClass('drag_lock');
            var maxwidth = $("html").width()-5;
            var nextwidth = maxwidth-e.clientX;
            var prevwidth = maxwidth-nextwidth;
            $(".separator").prev().css("flex-basis",prevwidth);
            $(".separator").next().css("flex-basis",nextwidth);
        }
    });
    // シェア
    $('#page_share').on("click",function(){
        const data = {
            title: "とかさんのItemGenelator",
            text: "アドオン作成補助ツールItem jsonを簡単に作成・編集",
            url: "https://toka7290.github.io/TokaItemGenelator/"
        }
        if (navigator.share) {
            navigator.share(data);
        }
    });
    // 外部インポート
    $("#input_file").on("change",function(){
        importFile();
    });
    // ファイルドラッグ&ドロップ
    $(window).on("dragover",function(event){
        event.preventDefault();
        $(".import_file").addClass('ondrag');
    });
    $(window).on("dragleave",function(event){
        event.preventDefault();
        $(".import_file").removeClass('dragover ondrag');
    });
    $(".import_file").on("dragover",function(event){
        event.preventDefault();
        $(".import_file").addClass('dragover');
    });
    $(".import_file").on("dragleave",function(event){
        event.preventDefault();
        $(".import_file").removeClass('dragover ondrag');
    });
    $(".import_file").on("drop",function(_event){
        isChanged = true;
        $(".import_file").removeClass('dragover ondrag');
        var event = _event;
        if( _event.originalEvent ){
            event = _event.originalEvent;
        }
        event.stopPropagation();
        event.preventDefault();
        $("#input_file").prop('files', event.dataTransfer.files);
        importFile();
    });
    // プレビュー表示切替
    $("p#show_preview").on("click",function(){
        $("div.preview").slideToggle();
        if($("p#show_preview").attr("class")=="active"){
            $("p#show_preview").removeClass('active');
        }else{
            $("p#show_preview").addClass('active');
        }
    });
    // ウィンドウワイズ変更時にcss削除
    $(window).resize(function(){
        $("div.preview").removeAttr("style",'');
    });
    // about開く
    $("p#open_about").on("click",function(){
        $("div.page_about").fadeIn();
    });
    // about閉じる
    $("div.close_about").on("click",function(){
        $("div.page_about").fadeOut();
    });
    // コピー
    $("p.preview_contlrol_copy").on("click",function(){
        $("textarea#code_buffer").select();
        document.execCommand("copy");
        $("p.preview_contlrol_copy").text("Copied");
        $("textarea#code_buffer").blur();
        setTimeout(function(){
            $("p.preview_contlrol_copy").text("Copy");
        },1000);
    });
    // ダウンロード
    $("p.preview_contlrol_download").on("click",function(){
        content = $("textarea#code_buffer").val();
        temp = $("#description_item_name").val().split(/:/,2);
        filename = "Item.json";
        if(temp[1]!=null)filename = temp[1]+".json";
        $("<a></a>", {href: window.URL.createObjectURL(new Blob([content])),
            download: filename,
            target: "_blank"})[0].click();
    });
    // イシューリスト開閉
    $("div.issue_contlrol_bar").on("click",function(){
        if($("div.issue_contlrol_bar img").attr("class")=="close"){
            // 開く
            $("div.issue_contlrol_bar img").attr("class","open")
        }
        else if($("div.issue_contlrol_bar img").attr("class")=="open"){
            // 閉じる
            $("div.issue_contlrol_bar img").attr("class","close")
        }
        $("div.issue_content").slideToggle();
    });

    // colorchange
    $("#components_map_color").on("change",function(){
        $("#components_map_color_pick").val($("#components_map_color").val());
    });

    // フォーマットバージョン変更
    $('#format_version').on("change",function(){
        format_version = $('#format_version').val();
    });
    //Food Effects tab変更
    $(document).on("click",".components_food_effects_controls_tab li",function(){
        selectedindex = $(".components_food_effects_controls_tab li").index(this);
        $(".components_food_effects_controls_tab li").removeClass('selected_tab');
        $(".components_food_effects_controls_tab li").eq(selectedindex).addClass('selected_tab');
        $(".components_food_effects_contents > div").removeClass('selected_tab_content');
        $(".components_food_effects_contents > div").eq(selectedindex).addClass('selected_tab_content');
    });
    // Food Effects tab削除
    $(document).on("click",".components_food_effects_controls_tab li span.delete_tab",function(event){
        selectedindex = $(this).parent().index();
        if($(".components_food_effects_controls_tab li").eq(selectedindex).hasClass('selected_tab')){
            $(".components_food_effects_controls_tab li").eq(selectedindex-1).addClass('selected_tab');
            $(".components_food_effects_contents > div").eq(selectedindex-1).addClass('selected_tab_content');
        }
        $(this).parent().remove();
        $(".components_food_effects_contents > div").eq(selectedindex).remove();
        for(i=0;i<$(".components_food_effects_controls_tab li").length;i++){
            $(".components_food_effects_controls_tab li").eq(i).html(i+'<span class="delete_tab">×</span>');
        }
        if($(".components_food_effects_controls_tab li").length<=1){
            $(".components_food_effects_controls_addtab").show();
        }
        onChangedJSON();
        event.stopPropagation();
    });
    //Food Effects tab追加
    $(".components_food_effects_controls_addtab").on("click",function(){
        components_food_effects_addtab();
        onChangedJSON();
    });
    //Remove effect追加
    $("#components_food_remove_effect_add").on("click",function(){
        // if(is_metadata_enable){
            add_author($("#components_food_remove_effect").val());
        // }
        $("#components_food_remove_effect").val("");
        onChangedJSON();
    });
    //Remove effect削除
    $(document).on("click",".components_food_remove_effect_delete",function(){
        // if(is_metadata_enable){
            $(this).parent().remove();
        // }
        onChangedJSON();
    });

    // Food Effects タブ追加
    function components_food_effects_addtab(){
        num = $(".components_food_effects_controls_tab li").length;
        addtab = '<li>'+num+'<span class="delete_tab">×</span></li>';
        $(".components_food_effects_controls_tab").append(addtab);
        content = $(".components_food_effects_contents > div:first-child").clone();
        content.removeClass('selected_tab_content');
        $(".components_food_effects_contents").append(content);
    }
    // Remove effect 追加
    function add_author(name){
        author_list_child = '<div><span class="name">'+name+'</span><span class="components_food_remove_effect_delete">×</span></div>';
        $(".components_food_remove_effect_list").append(author_list_child);
    }
    // インポート処理
    function importFile(){
        var data = $("#input_file").prop('files')[0]; 
        var file_reader = new FileReader();
        file_reader.onload = function(){
            json_text = file_reader.result;
            import_data(json_text);
        };
        try{
            file_reader.readAsText(data);
        }catch(e){
            console.error("error:"+e);
        }
    }
    // 更新処理
    function onChangedJSON(){
        onChangedflammable();
        onChangedColor();
        onChangedItemLightEmission();

        checkIssue();
        json_code = exportJSON();
        $("pre.language-json code.language-json").remove();
        content = '<code class="language-json">'+json_code+'</code>';
        $("pre.language-json").append(content);
        $("textarea#code_buffer").val(json_code);
        Prism.highlightAll();
    }
    // 燃焼コンポーネント変更
    function onChangedflammable() {
        if($('#components_flame_odds').val()!="0"){
            $("#components_burn_odds").prop('disabled', false);
            $("#components_burn_odds").parent().removeClass('disabled');
        }else{
            $("#components_burn_odds").prop('disabled', true);
            $("#components_burn_odds").parent().addClass('disabled');
        }
    }
    // 色変更
    function onChangedColor(){
        $("#components_map_color").val($("#components_map_color_pick").val());
    }
    // 発光量変更
    function onChangedItemLightEmission() {
        $("#components_Item_light_emission_eq").text(Math.round(parseFloat($('#components_Item_light_emission').val())*15),);
    }
    // イシューチェック
    function checkIssue(){
        // イシュー削除
        $("ul.issue_list li").remove();
        error_num = checkJSONError();
        warning_num = checkJSONWarning();
        $("span.issue_warning_num").text("警告:"+warning_num);
        $("span.issue_error_num").text("エラー:"+error_num);
        if(warning_num<=0&&error_num<=0){
            $("ul.issue_list").append('<li>問題はありません</li>');
        }
    }
    // 警告検査
    function checkJSONWarning(){
        warning_num = 0;
        return warning_num;
    }
    // エラー検査
    function checkJSONError(){
        error_num = 0;

        Item_ID = $('#description_item_name').val();
        ID = Item_ID.split(/:/);
        if(Item_ID==""){
            //ブロックIDが空です
            addIssue('error',"[Description:identifier] ブロックIDが空です。\"名前空間:ブロックID\"を入力してください。");
            error_num++;
        }else if(Item_ID.indexOf('\:')<0){

            //ブロックIDが:で区切られていません
            addIssue('error',"[Description:identifier] ブロックIDが \":\" で区切られていません。\"名前空間:ブロックID\"の形式になっている必要があります。");
            error_num++;
        }else if(ID[1] == ""){
            //ブロックIDがありません
            addIssue('error',"[Description:identifier] ブロックIDがありません。\"名前空間:ブロックID\"を入力してください。");
            error_num++;
        }
        return error_num;
    }
    // イシュー更新
    function addIssue(type,issue_content){
        content = '';
        if(type=='warning'){
            content = '<li><img src="img/warning.svg" alt=""><p>'+issue_content+'</p></li>';
        }else if(type=='error'){
            content = '<li><img src="img/error.svg" alt=""><p>'+issue_content+'</p></li>';
        }
        $("ul.issue_list").append(content);
    }
    // jsonデータ取り出し
    function import_data(json_text){
        try{
            json_data = JSON.parse(json_text);
        }catch(e){
            window.alert("有効なjsonではありません");
            console.error("error:"+e)
            return;
        }

        format_version = json_data.format_version;
        if(format_version!=null){
            
            switch(format_version){
                case "1.16.0":
                    break;
                case "1.12.0":
                    break;
                default:
                    temp = format_version.split(/,/);
                    if(temp[0] == "1"&&parseInt(temp[1]) >=16){
                        format_version = "1.16.0";
                    }else if(temp[0] == "1"&&parseInt(temp[1]) <16){
                        format_version = "1.12.0";
                    }
                    break;
            }
            $('#format_version').val(format_version);
        }

        description = json_data["minecraft:item"].description;
        if(description.identifier!=null){
            $('#description_item_name').val(description.identifier)
        }
        if(description.is_experimental){
            $('#description_is_experimental').prop("checked",true);
        }
        if(description.register_to_creative_menu){
            $('#description_register_to_creative_menu').prop("checked",true);
        }

        components = json_data["minecraft:item"].components;
        switch(format_version){
            case "1.16.0":
                if(components["minecraft:loot"]!=null){
                    $('#components_loot').val(components["minecraft:loot"]);
                }
                if(components["minecraft:destroy_time"]!=null){
                    $('#components_destroy_time').val(components["minecraft:destroy_time"])
                }
                if(components["minecraft:explosion_resistance"]!=null){
                    $('#components_explosion_resistance').val(components["minecraft:explosion_resistance"])
                }
                if(components["minecraft:friction"]!=null){
                    $('#components_friction').val(components["minecraft:friction"]);
                }
                if(components["minecraft:flammable"]!=null){
                    flammable = components["minecraft:flammable"];
                    $('#components_flame_odds').val(flammable.flame_odds);
                    if(flammable.flame_odds!=0){
                        $('#components_burn_odds').val(flammable.burn_odds);
                        $("#components_burn_odds").prop('disabled', false);
                    }
                }
                if(components["minecraft:map_color"]!=null){
                    $('#components_map_color').val(components["minecraft:map_color"]);
                    $('#components_map_color_pick').val(components["minecraft:map_color"]);
                }
                if(components["minecraft:item_light_absorption"]!=null){
                    $('#components_Item_light_absorption').val(components["minecraft:item_light_absorption"])
                }
                if(components["minecraft:item_light_emission"]!=null){
                    $('#components_Item_light_emission').val(components["minecraft:item_light_emission"])
                }
                break;
            case "1.12.0":
                if(components["minecraft:loot"].table!=null){
                    $('#components_loot').val(components["minecraft:loot"].table);
                }
                if(components["minecraft:destroy_time"].value!=null){
                    $('#components_destroy_time').val(components["minecraft:destroy_time"].value)
                }
                if(components["minecraft:explosion_resistance"].value!=null){
                    $('#components_explosion_resistance').val(components["minecraft:explosion_resistance"].value)
                }
                if(components["minecraft:friction"].value!=null){
                    $('#components_friction').val(components["minecraft:friction"].value);
                }
                if(components["minecraft:flammable"]!=null){
                    flammable = components["minecraft:flammable"];
                    $('#components_flame_odds').val(flammable.flame_odds);
                    if(flammable.flame_odds!=0){
                        $('#components_burn_odds').val(flammable.burn_odds);
                        $("#components_burn_odds").prop('disabled', false);
                    }
                }
                if(components["minecraft:map_color"].color!=null){
                    $('#components_map_color').val(components["minecraft:map_color"].color);
                    $('#components_map_color_pick').val(components["minecraft:map_color"].color);
                }
                if(components["minecraft:item_light_absorption"].value!=null){
                    $('#components_Item_light_absorption').val(components["minecraft:item_light_absorption"].value)
                }
                if(components["minecraft:item_light_emission"].emission!=null){
                    $('#components_Item_light_emission').val(components["minecraft:item_light_emission"].emission)
                }
                break;
            default:
                break;
        }
        onChangedJSON();
    }
    // json 出力
    function exportJSON(){
        var json_raw = {};
        json_raw.format_version = format_version;
        json_raw["minecraft:item"] = {};

        description = new Object();
        description.identifier = $('#description_item_name').val();

        json_raw["minecraft:item"]["description"] = description;

        components = new Object();

        components["minecraft:foil"] = $('#components_foil').is(':checked');
        components["minecraft:hand_equipped"] = $('#components_hand_equipped').is(':checked');
        components["minecraft:max_damage"] = parseInt($('#components_max_damage').val(), 10);
        components["minecraft:block"] = $('#components_block').val();
        components["minecraft:max_stack_size"] = parseInt($('#components_max_stack_size').val(), 10);
        components["minecraft:stacked_by_data"] = $('#components_stacked_by_data').is(':checked');
        components["minecraft:use_duration"] = parseInt($('#components_use_duration').val(), 10);

        food = new Object();
        food.nutrition = parseInt($('#components_food_nutrition').val(), 10);
        food.food_can_always_eat = $('#components_food_can_always_eat').is(':checked');
        food.using_converts_to = $('#components_food_using_converts_to').val();

        food.effects = new Array();
        for(i=0;i<$(".components_food_effects_controls_tab li").length;i++){
            child_num = i + 1;
            food.effects[i] = new Object();
            food.effects[i].name = $('#components_food_effects_name').val();
            food.effects[i].chance = parseFloat($('#components_food_effects_chance').val());
            food.effects[i].duration = parseInt($('#components_food_effects_duration').val(), 10);
            food.effects[i].amplifier = parseInt($('#components_food_effects_amplifier').val(), 10);
        }

        food.remove_effect = new Array();
        for(i=1;i<=$("div.components_food_remove_effect_list > div").length;i++){
            food.remove_effect.push($('div.components_food_remove_effect_list > div:nth-child('+i+') > span.name').text());
        }

        food.is_meat = $('#components_food_is_meat').is(':checked');
        food.on_use_action = $('#components_food_on_use_action').val();
        
        food.on_use_range = "replace_on_use_range";

        food.cooldown_type = $('#components_food_cooldown_type').val();
        food.cooldown_time = parseInt($('#components_food_cooldown_time').val(), 10);

        components["minecraft:food"] = food;

        seed = new Object();
        seed.crop_result = $('#components_seed_crop_result').val();
        seed.plant_at = $('#components_seed_plant_at').val();
        components["minecraft:seed"] = seed;

        camera = new Object();
        camera.black_bars_duration = parseFloat($('#components_camera_black_bars_duration').val());
        camera.black_bars_screen_ratio = parseFloat($('#components_camera_black_bars_screen_ratio').val());
        camera.shutter_duration = parseFloat($('#components_camera_shutter_duration').val());
        camera.picture_duration = parseFloat($('#components_camera_picture_duration').val());
        camera.slide_away_duration = parseFloat($('#components_camera_slide_away_duration').val());
        components["minecraft:camera"] = camera;

        json_raw["minecraft:item"]["components"] = components;
        
        return jsonArrayReplacer(JSON.stringify(json_raw,null,'  '));
    }
    function jsonArrayReplacer(string_raw) {
        on_use_range = JSON.stringify([
            Number($('#components_food_on_use_range_x').val()), 
            Number($('#components_food_on_use_range_y').val()), 
            Number($('#components_food_on_use_range_z').val())
        ]).split(/,/).join(', ');
        string_raw = string_raw.replace('"replace_on_use_range"', on_use_range);
        return string_raw;
    }
})