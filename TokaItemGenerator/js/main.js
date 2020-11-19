$(function(){
    // 宣言
    var isChanged = false;
    var format_version = "1.16.0";
    var is_separator_drag = false;
    var is_components_food_enable = false;
    var is_components_seed_enable = false;
    var is_components_camera_enable = false;
    var help_page_num = 0;
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
    $(document).on("keyup",'input,textarea,select',function(){
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
            let maxwidth = $("html").width()-5;
            let next_width = maxwidth-e.clientX;
            let prev_width = maxwidth-next_width;
            $(".separator").prev().css("flex-basis",prev_width);
            $(".separator").next().css("flex-basis",next_width);
        }
    });
    // シェア
    $('#page_share').on("click",function(){
        const data = {
            title: "とかさんのItemGenerator",
            text: "アドオン作成補助ツールItem jsonを簡単に作成・編集",
            url: "https://toka7290.github.io/TokaItemGenerator/"
        }
        if (navigator.share) {
            navigator.share(data);
        }
    });
    // 外部インポート
    $("#input_file").on("change",function(){
        importFile();
    });
    // ヘルプを表示
    $("#show_help").on("click",function(){
        $("#page_help").fadeIn("fast");
        toggle_help();
    });
    $("#page_help").on("click",function(){
        toggle_help();
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
    $("div#show_preview").on("click",function(){
        $("div.preview").slideToggle();
        if($("div#show_preview").attr("class")=="active"){
            $("div#show_preview").removeClass('active');
        }else{
            $("div#show_preview").addClass('active');
        }
    });
    // ウィンドウワイズ変更時にcss削除
    $(window).resize(function(){
        $("div.preview").removeAttr("style",'');
        $("div.editor").removeAttr("style",'');
        $("div.data_check").removeAttr("style",'');
        help_page_num = 5;
        toggle_help();
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
    $("p.preview_control_copy").on("click",function(){
        $("textarea#code_buffer").select();
        document.execCommand("copy");
        $("p.preview_control_copy").text("Copied");
        $("textarea#code_buffer").blur();
        setTimeout(function(){
            $("p.preview_control_copy").text("Copy");
        },1000);
    });
    // ダウンロード
    $("p.preview_control_download").on("click",function(){
        const content = $("textarea#code_buffer").val();
        const temp = $("#description_item_name").val().split(/:/,2);
        let filename = "Item.json";
        if(temp[1]!=null)filename = temp[1]+".json";
        $("<a></a>", {href: window.URL.createObjectURL(new Blob([content])),
            download: filename,
            target: "_blank"})[0].click();
    });
    // イシューリスト開閉
    $("div.issue_control_bar").on("click",function(){
        if($("div.issue_control_bar img").attr("class")=="close"){
            // 開く
            $("div.issue_control_bar img").attr("class","open")
        }
        else if($("div.issue_control_bar img").attr("class")=="open"){
            // 閉じる
            $("div.issue_control_bar img").attr("class","close")
        }
        $("div.issue_content").slideToggle();
    });

    // color change
    $("#components_map_color").on("change",function(){
        $("#components_map_color_pick").val($("#components_map_color").val());
    });

    // フォーマットバージョン変更
    $('#format_version').on("change",function(){
        format_version = $('#format_version').val();
    });
    //tab変更
    $(document).on("click",".tab_controls_bar_tab li",function(){
        if(
            (is_components_food_enable&&$(this).parents('.tab_controls').hasClass("components_food_effects"))
        ){
            const selected_index = $(this).index();
            const controls_tab = $(this).parent();
            const controls_tabs = controls_tab.children("li");
            controls_tabs.removeClass('selected_tab');
            controls_tabs.eq(selected_index).addClass('selected_tab');
            const tab_content = controls_tab.parents('.tab_controls').next().children("div");
            tab_content.removeClass('selected_tab_content');
            tab_content.eq(selected_index).addClass('selected_tab_content');
        }
    });
    //tab削除
    $(document).on("click",".tab_controls_bar_tab li span.delete_tab",function(event){
        if(
            (is_components_food_enable&&$(this).parents('.tab_controls').hasClass("components_food_effects"))
        ){
            const selected_tab = $(this).parent();
            const controls_tab = selected_tab.parent();
            let controls_tabs = controls_tab.children("li");
            let selected_index = selected_tab.index();
            const tab_content_list = controls_tab.parents('.tab_controls').next().children("div");
            selected_tab.hide(
                150,
                function(){
                    tab_content_list.eq(selected_index).remove();
                    if(selected_tab.hasClass('selected_tab')){
                        if(selected_index-1<0) selected_index=2;
                        controls_tabs.eq(selected_index-1).addClass('selected_tab');
                        tab_content_list.eq(selected_index-1).addClass('selected_tab_content');
                    }
                    selected_tab.remove();
                    controls_tabs = controls_tab.children("li");
                    for(let i=0;i<controls_tabs.length;i++){
                        controls_tabs.eq(i).html(i+'<span class="delete_tab">×</span>');
                    }
                    onChangedJSON();
                }
            );
        }
        event.stopPropagation();
    });
    //tab追加
    $(".tab_controls_addTab").on("click",function(){
        if(
            (is_components_food_enable&&$(this).hasClass("components_food_effects"))
        ){
            add_tab($(this).prev());
        }
        onChangedJSON();

    });
    //Remove effect追加
    $("#components_food_remove_effect_add").on("click",function(){
        add_author($("#components_food_remove_effect").val());
        $("#components_food_remove_effect").val("");
        onChangedJSON();
    });
    //Remove effect削除
    $(document).on("click",".components_food_remove_effect_delete",function(){
        const remove_effect = $(this).parent();
        remove_effect.hide(
            150,
            function (){
                remove_effect.remove();
                onChangedJSON();
            }
        );
    });

    //タブ追加
    function add_tab(controls_tab){
        const num = controls_tab.children('li').length;
        const addTab = '<li>'+num+'<span class="delete_tab">×</span></li>';
        controls_tab.append(addTab)
        controls_tab.children('li:last-child').hide().show(150);
        const tab_content_list = controls_tab.parents('.tab_controls').next();
        const content = tab_content_list.children("div:first-child").clone();
        content.removeClass('selected_tab_content');
        tab_content_list.append(content);
    }
    // Remove effect 追加
    function add_author(name){
        const remove_effect_list = $(".components_food_remove_effect_list");
        let remove_effect_list_child = $('div').append($('<span>').addClass('name').text(name));
        remove_effect_list_child.append($('<span>').addClass('components_food_remove_effect_delete').text('×'));
        remove_effect_list.append(remove_effect_list_child);
        remove_effect_list.children('div:last-child').hide().show(150);
    }
    // インポート処理
    function importFile(){
        var data = $("#input_file").prop('files')[0];
        var file_reader = new FileReader();
        file_reader.onload = function(){
            const json_text = file_reader.result;
            import_data(json_text);
        };
        try{
            file_reader.readAsText(data);
        }catch(e){
            console.error("error:"+e);
        }
    }
    // ヘルプ切換
    function toggle_help(){
        switch(help_page_num){
            case 1:
                $("#help_content_1").fadeOut("fast");
                $("#help_content_2").slideToggle("fast");
                help_page_num++;
                return;
            case 2:
                $("#help_content_2").slideToggle("fast");
                $("#help_content_3").fadeIn("fast");
                help_page_num++;
                return;
            case 3:
                $("#help_content_3").fadeOut("fast");
                $("#page_help").hide();
                help_page_num = 0;
                return;
            case 5:
                $("#help_content_1").hide();
                $("#help_content_2").hide();
                $("#help_content_3").hide();
                $("#page_help").hide();
                help_page_num = 0;
                return;
            case 0:
            default:
                $("#help_content_1").fadeIn("fast");
                help_page_num++;
                return;
        }
    }
    // 更新処理
    function onChangedJSON(){
        changed_checkbox();

        checkIssue();
        const json_code = exportJSON();
        $("pre.language-json code.language-json").remove();
        const content = '<code class="language-json">'+json_code+'</code>';
        $("pre.language-json").append(content);
        $("textarea#code_buffer").val(json_code);
        Prism.highlightAll();
    }
    // チェックボックス変更
    function changed_checkbox(){
        is_components_food_enable = $('#components_food_enable').is(':checked');
        is_components_seed_enable = $('#components_seed_enable').is(':checked');
        is_components_camera_enable = $('#components_camera_enable').is(':checked');
        if(is_components_food_enable){
            $("div.components_food_list").removeClass('disabled');
            $('div.components_food_list input').prop('disabled', false);
            $('div.components_food_list select').prop('disabled', false);
            $('div.components_food_list .tab_controls_bar').removeClass('disabled');
        }else{
            $("div.components_food_list").addClass('disabled');
            $('div.components_food_list input').prop('disabled', true);
            $('div.components_food_list select').prop('disabled', true);
            $('div.components_food_list .tab_controls_bar').addClass('disabled');
        }
        if(is_components_seed_enable){
            $("div.components_seed_list").removeClass('disabled');
            $('div.components_seed_list input').prop('disabled', false);
        }else{
            $("div.components_seed_list").addClass('disabled');
            $('div.components_seed_list input').prop('disabled', true);
        }
        if(is_components_camera_enable){
            $("div.components_camera_list").removeClass('disabled');
            $('div.components_camera_list input').prop('disabled', false);
        }else{
            $("div.components_camera_list").addClass('disabled');
            $('div.components_camera_list input').prop('disabled', true);
        }
    }
    // イシューチェック
    function checkIssue(){
        // イシュー削除
        $("ul.issue_list li").remove();
        const error_num = checkJSONError();
        const warning_num = checkJSONWarning();
        $("span.issue_warning_num").text("警告:"+warning_num);
        $("span.issue_error_num").text("エラー:"+error_num);
        if(warning_num<=0&&error_num<=0){
            $("ul.issue_list").append('<li>問題はありません</li>');
        }
    }
    // 警告検査
    function checkJSONWarning(){
        let warning_num = 0;
        return warning_num;
    }
    // エラー検査
    function checkJSONError(){
        let error_num = 0;

        const Item_ID = $('#description_item_name').val();
        const Item_ID_split = Item_ID.split(/:/);
        if(Item_ID==""){
            //アイテムIDが空です
            addIssue('error',"[Description:identifier] アイテムIDが空です。アイテムIDを入力してください。アイテムIDは\"名前空間:アイテムID\"を入力してください。");
            error_num++;
        }else if(Item_ID.indexOf('\:')<0){
            //アイテムIDが:で区切られていません
            addIssue('error',"[Description:identifier] アイテムIDが \":\" で区切られていません。\"名前空間:アイテムID\"の形式になっている必要があります。");
            error_num++;
        }else if(Item_ID_split[1] == ""){
            //アイテムIDがありません
            addIssue('error',"[Description:identifier] アイテムIDがありません。\"名前空間:アイテムID\"を入力してください。");
            error_num++;
        }
        return error_num;
    }
    // イシュー更新
    function addIssue(type,issue_content){
        let content = '';
        if(type=='warning'){
            content = '<li><img src="img/warning.svg" alt=""><p>'+issue_content+'</p></li>';
        }else if(type=='error'){
            content = '<li><img src="img/error.svg" alt=""><p>'+issue_content+'</p></li>';
        }
        $("ul.issue_list").append(content);
    }
    // jsonデータ取り出し
    function import_data(json_text){
        let json_data;
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
                    const temp = format_version.split(/,/);
                    if(temp[0] == "1"&&parseInt(temp[1]) >=16){
                        format_version = "1.16.0";
                    }else if(temp[0] == "1"&&parseInt(temp[1]) <16){
                        format_version = "1.12.0";
                    }
                    break;
            }
            $('#format_version').val(format_version);
        }

        const description = json_data["minecraft:item"].description;
        if(description.identifier!=null){
            $('#description_item_name').val(description.identifier)
        }
        if(description.is_experimental){
            $('#description_is_experimental').prop("checked",true);
        }
        if(description.register_to_creative_menu){
            $('#description_register_to_creative_menu').prop("checked",true);
        }

        const components = json_data["minecraft:item"].components;
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
                    const flammable = components["minecraft:flammable"];
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
                    const flammable = components["minecraft:flammable"];
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

        let description = new Object();
        description.identifier = $('#description_item_name').val();

        json_raw["minecraft:item"]["description"] = description;

        let components = new Object();

        if($('#components_foil').is(':checked'))components["minecraft:foil"] = $('#components_foil').is(':checked');
        if($('#components_hand_equipped').is(':checked'))components["minecraft:hand_equipped"] = $('#components_hand_equipped').is(':checked');
        components["minecraft:max_damage"] = parseInt($('#components_max_damage').val(), 10);
        if($('#components_block').val()!="")components["minecraft:block"] = $('#components_block').val();
        components["minecraft:max_stack_size"] = parseInt($('#components_max_stack_size').val(), 10);
        if($('#components_stacked_by_data').is(':checked')!="")components["minecraft:stacked_by_data"] = $('#components_stacked_by_data').is(':checked');
        components["minecraft:use_duration"] = parseInt($('#components_use_duration').val(), 10);

        if(is_components_food_enable){
            let food = new Object();
            food.nutrition = Number($('#components_food_nutrition').val());
            if($('#components_food_can_always_eat').is(':checked')){
                food.food_can_always_eat = $('#components_food_can_always_eat').is(':checked');
            }
            if($('#components_food_using_converts_to').val()!=""){
                food.using_converts_to = $('#components_food_using_converts_to').val();
            }
            food.saturation_modifier = $('#components_food_saturation_modifier').val();
            let tab_content = $('div.components_food_effects.tab_content_list > div:first-child');
            if(
                tab_content.find('#components_food_effects_name').val()!=""&&
                Number(tab_content.find('#components_food_effects_chance').val())!=0&&
                Number(tab_content.find('#components_food_effects_duration').val()!=0&&
                Number(tab_content.find('#components_food_effects_amplifier').val())!=0)
            ){
                food.effects = new Array();
                for(let i=0;i<$(".components_food_effects.tab_controls_bar_tab li").length;i++){
                    const child_num = i + 1;
                    food.effects[i] = new Object();
                    tab_content = $('div.components_food_effects.tab_content_list > div:nth-child('+child_num+')');
                    food.effects[i].name = tab_content.find('#components_food_effects_name').val();
                    food.effects[i].chance = Number(tab_content.find('#components_food_effects_chance').val());
                    food.effects[i].duration = Number(tab_content.find('#components_food_effects_duration').val());
                    food.effects[i].amplifier = Number(tab_content.find('#components_food_effects_amplifier').val());
                }
            }
            if($("div.components_food_remove_effect_list > div").length>0){
                food.remove_effect = new Array();
                for(let i=1;i<=$("div.components_food_remove_effect_list > div").length;i++){
                    food.remove_effect.push($('div.components_food_remove_effect_list > div:nth-child('+i+') > span.name').text());
                }
            }
            if($('#components_food_is_meat').is(':checked')){
                food.is_meat = $('#components_food_is_meat').is(':checked');
            }
            if($('#components_food_on_use_action').val()!=""){
                food.on_use_action = $('#components_food_on_use_action').val();
                food.on_use_range = "replace_on_use_range";
            }
            if($('#components_food_cooldown_type').val()!=""){
                food.cooldown_type = $('#components_food_cooldown_type').val();
                food.cooldown_time = Number($('#components_food_cooldown_time').val());
            }
            components["minecraft:food"] = food;
        }

        if(is_components_seed_enable){
            let seed = new Object();
            seed.crop_result = $('#components_seed_crop_result').val();
            seed.plant_at = $('#components_seed_plant_at').val();
            components["minecraft:seed"] = seed;
        }

        if(is_components_camera_enable){
            let camera = new Object();
            camera.black_bars_duration = parseFloat($('#components_camera_black_bars_duration').val());
            camera.black_bars_screen_ratio = parseFloat($('#components_camera_black_bars_screen_ratio').val());
            camera.shutter_duration = parseFloat($('#components_camera_shutter_duration').val());
            camera.picture_duration = parseFloat($('#components_camera_picture_duration').val());
            camera.slide_away_duration = parseFloat($('#components_camera_slide_away_duration').val());
            components["minecraft:camera"] = camera;
        }

        json_raw["minecraft:item"]["components"] = components;

        return jsonArrayReplacer(JSON.stringify(json_raw,null,'  '));
    }
    function jsonArrayReplacer(string_raw) {
        const on_use_range = JSON.stringify([
            Number($('#components_food_on_use_range_x').val()),
            Number($('#components_food_on_use_range_y').val()),
            Number($('#components_food_on_use_range_z').val())
        ]).split(/,/).join(', ');
        string_raw = string_raw.replace('"replace_on_use_range"', on_use_range);
        return string_raw;
    }
})