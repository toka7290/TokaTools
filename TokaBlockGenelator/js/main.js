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
            title: "とかさんのBlockGenelator",
            text: "アドオン作成補助ツールblock jsonを簡単に作成・編集",
            url: "https://toka7290.github.io/TokaBlockGenelator/"
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
        temp = $("#description_block_name").val().split(/:/,2);
        filename = "block.json";
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
        onChangedBlockLightEmission();

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
    function onChangedBlockLightEmission() {
        $("#components_block_light_emission_eq").text(Math.round(parseFloat($('#components_block_light_emission').val())*15),);
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

        block_ID = $('#description_block_name').val();
        ID = block_ID.split(/:/);
        if(block_ID==""){
            //ブロックIDが空です
            addIssue('error',"[Description:identifier] ブロックIDが空です。\"名前空間:ブロックID\"を入力してください。");
            error_num++;
        }else if(block_ID.indexOf('\:')<0){

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

        description = json_data["minecraft:block"].description;
        if(description.identifier!=null){
            $('#description_block_name').val(description.identifier)
        }
        if(description.is_experimental){
            $('#description_is_experimental').prop("checked",true);
        }
        if(description.register_to_creative_menu){
            $('#description_register_to_creative_menu').prop("checked",true);
        }

        components = json_data["minecraft:block"].components;
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
                if(components["minecraft:block_light_absorption"]!=null){
                    $('#components_block_light_absorption').val(components["minecraft:block_light_absorption"])
                }
                if(components["minecraft:block_light_emission"]!=null){
                    $('#components_block_light_emission').val(components["minecraft:block_light_emission"])
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
                if(components["minecraft:block_light_absorption"].value!=null){
                    $('#components_block_light_absorption').val(components["minecraft:block_light_absorption"].value)
                }
                if(components["minecraft:block_light_emission"].emission!=null){
                    $('#components_block_light_emission').val(components["minecraft:block_light_emission"].emission)
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
        json_raw["minecraft:block"] = {};

        description = new Object();
        description.identifier = $('#description_block_name').val();
        description.is_experimental = $('#description_is_experimental').is(':checked');
        description.register_to_creative_menu = $('#description_register_to_creative_menu').is(':checked');

        json_raw["minecraft:block"]["description"] = description;

        components = new Object();

        switch(format_version){
            case "1.16.0":
                if($('#components_loot').val()!="") components["minecraft:loot"] = $('#components_loot').val();
                components["minecraft:destroy_time"] = parseFloat($('#components_destroy_time').val());
                components["minecraft:explosion_resistance"] = parseFloat($('#components_explosion_resistance').val());
                components["minecraft:friction"] = parseFloat($('#components_friction').val());
                if($('#components_flame_odds').val()!="0"){
                    flammable = new Object();
                    flammable.flame_odds = parseInt($('#components_flame_odds').val(), 10);
                    flammable.burn_odds = parseInt($('#components_burn_odds').val(), 10);
                    components["minecraft:flammable"] = flammable;
                }
                components["minecraft:map_color"] = $('#components_map_color').val();
                components["minecraft:block_light_absorption"] = parseInt($('#components_block_light_absorption').val(), 10);
                components["minecraft:block_light_emission"] = parseFloat($('#components_block_light_emission').val());
                break;
            case "1.12.0":
                if($('#components_loot').val()!="") components["minecraft:loot"] = { table : $('#components_loot').val() };
                components["minecraft:destroy_time"] = { value : parseFloat($('#components_destroy_time').val()) };
                components["minecraft:explosion_resistance"] = { value : parseFloat($('#components_explosion_resistance').val()) };
                components["minecraft:friction"] = { value : parseFloat($('#components_friction').val()) };
                if($('#components_flame_odds').val()!="0"){
                    flammable = new Object();
                    flammable.flame_odds = parseInt($('#components_flame_odds').val(), 10);
                    flammable.burn_odds = parseInt($('#components_burn_odds').val(), 10);
                    components["minecraft:flammable"] = flammable;
                }
                components["minecraft:map_color"] = { color : $('#components_map_color').val() };
                components["minecraft:block_light_absorption"] = { value : parseInt($('#components_block_light_absorption').val(), 10) };
                components["minecraft:block_light_emission"] = { emission : parseFloat($('#components_block_light_emission').val()) };
                break;
            default:
                break;
        }

        json_raw["minecraft:block"]["components"] = components;
        
        return JSON.stringify(json_raw,null,'  ');
    }
})