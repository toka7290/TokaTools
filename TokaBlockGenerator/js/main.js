$(function () {
  // 宣言
  var isChanged = false;
  var format_version = "1.16.0";
  var is_separator_drag = false;
  var help_page_num = 0;
  onChangedJSON();
  // ページ離脱時に警告表示
  $(window).bind("beforeunload", function () {
    if (isChanged) {
      return "このページを離れようとしています。";
    }
  });
  // 変更
  $(document).on("change", "input,textarea,select", function () {
    onChangedJSON();
    isChanged = true;
  });
  $(document).on("keyup", "input,textarea,select", function () {
    onChangedJSON();
    isChanged = true;
  });
  // セパレータ移動
  $(".separator").on("mousedown", function (e) {
    if (!is_separator_drag) {
      is_separator_drag = true;
    } else if (is_separator_drag) {
      is_separator_drag = false;
    }
  });
  $(document).on("mouseup", function () {
    is_separator_drag = false;
    $("html").removeAttr("style", "");
    $(".separator").prev().removeClass("drag_lock");
    $(".separator").next().removeClass("drag_lock");
  });
  $(document).on("mousemove", function (e) {
    if (is_separator_drag) {
      $("html").css("cursor", "e-resize");
      $(".separator").prev().addClass("drag_lock");
      $(".separator").next().addClass("drag_lock");
      let maxwidth = $("html").width() - 5;
      let next_width = maxwidth - e.clientX;
      let prev_width = maxwidth - next_width;
      $(".separator").prev().css("flex-basis", prev_width);
      $(".separator").next().css("flex-basis", next_width);
    }
  });
  // シェア
  $("#page_share").on("click", function () {
    const data = {
      title: "とかさんの Block Generator",
      text: "とかさんの Block Generator -block jsonを簡単に作成・編集-",
      url: "https://toka7290.github.io/TokaBlockGenerator/",
    };
    if (navigator.share) {
      navigator.share(data);
    }
  });
  // 外部インポート
  $("#input_file").on("change", function () {
    importFile();
  });
  // ヘルプを表示
  $("#show_help").on("click", function () {
    $("#page_help").fadeIn("fast");
    toggle_help();
  });
  $("#page_help").on("click", function () {
    toggle_help();
  });
  // ファイルドラッグ&ドロップ
  $(window).on("dragover", function (event) {
    event.preventDefault();
    $(".import_file").addClass("ondrag");
  });
  $(window).on("dragleave", function (event) {
    event.preventDefault();
    $(".import_file").removeClass("dragover ondrag");
  });
  $(".import_file").on("dragover", function (event) {
    event.preventDefault();
    $(".import_file").addClass("dragover");
  });
  $(".import_file").on("dragleave", function (event) {
    event.preventDefault();
    $(".import_file").removeClass("dragover ondrag");
  });
  $(".import_file").on("drop", function (_event) {
    isChanged = true;
    $(".import_file").removeClass("dragover ondrag");
    let event = _event;
    if (_event.originalEvent) {
      event = _event.originalEvent;
    }
    event.stopPropagation();
    event.preventDefault();
    $("#input_file").prop("files", event.dataTransfer.files);
    importFile();
  });
  // プレビュー表示切替
  $("div#show_preview").on("click", function () {
    $("div.preview").slideToggle();
    if ($("div#show_preview").attr("class") == "active") {
      $("div#show_preview").removeClass("active");
    } else {
      $("div#show_preview").addClass("active");
    }
  });
  // ウィンドウワイズ変更時にcss削除
  $(window).resize(function () {
    $("div.preview").removeAttr("style", "");
    $("div.editor").removeAttr("style", "");
    $("div.data_check").removeAttr("style", "");
    help_page_num = 5;
    toggle_help();
  });
  // about開く
  $("p#open_about").on("click", function () {
    $("div.page_about").fadeIn();
  });
  // about閉じる
  $("div.close_about").on("click", function () {
    $("div.page_about").fadeOut();
  });
  // コピー
  $("p.preview_control_copy").on("click", function () {
    $("textarea#code_buffer").select();
    document.execCommand("copy");
    $("p.preview_control_copy").text("Copied");
    $("textarea#code_buffer").blur();
    setTimeout(function () {
      $("p.preview_control_copy").text("Copy");
    }, 1000);
  });
  // ダウンロード
  $("p.preview_control_download").on("click", function () {
    const content = $("textarea#code_buffer").val();
    const temp = $("#description_block_name").val().split(/:/, 2);
    let filename = "block.json";
    if (temp[1] != null) filename = temp[1] + ".json";
    $("<a></a>", {
      href: window.URL.createObjectURL(new Blob([content])),
      download: filename,
      target: "_blank",
    })[0].click();
  });
  // イシューリスト開閉
  $("div.issue_control_bar").on("click", function () {
    if ($("div.issue_control_bar img").attr("class") == "close") {
      // 開く
      $("div.issue_control_bar img").attr("class", "open");
    } else if ($("div.issue_control_bar img").attr("class") == "open") {
      // 閉じる
      $("div.issue_control_bar img").attr("class", "close");
    }
    $("div.issue_content").slideToggle();
  });

  // color change
  $("#components_map_color").on("change", function () {
    $("#components_map_color_pick").val($("#components_map_color").val());
  });

  // フォーマットバージョン変更
  $("#format_version").on("change", function () {
    format_version = $("#format_version").val();
  });

  // インポート処理
  function importFile() {
    let data = $("#input_file").prop("files")[0];
    let file_reader = new FileReader();
    file_reader.onload = function () {
      const json_text = file_reader.result;
      import_data(json_text);
    };
    try {
      file_reader.readAsText(data);
    } catch (e) {
      console.error("error:" + e);
    }
  }
  // ヘルプ切換
  function toggle_help() {
    switch (help_page_num) {
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
  function onChangedJSON() {
    onChangedFlammable();
    onChangedColor();
    onChangedBlockLightEmission();

    checkIssue();
    const json_code = exportJSON();
    $("pre.language-json code.language-json").remove();
    const content = '<code class="language-json">' + json_code + "</code>";
    $("pre.language-json").append(content);
    $("textarea#code_buffer").val(json_code);
    Prism.highlightAll();
  }
  // 燃焼コンポーネント変更
  function onChangedFlammable() {
    if ($("#components_flame_odds").val() != "0") {
      $("#components_burn_odds").prop("disabled", false);
      $("#components_burn_odds").parent().removeClass("disabled");
    } else {
      $("#components_burn_odds").prop("disabled", true);
      $("#components_burn_odds").parent().addClass("disabled");
    }
  }
  // 色変更
  function onChangedColor() {
    $("#components_map_color").val($("#components_map_color_pick").val());
  }
  // 発光量変更
  function onChangedBlockLightEmission() {
    $("#components_block_light_emission_eq").text(
      Math.round(parseFloat($("#components_block_light_emission").val()) * 15)
    );
  }
  // イシューチェック
  function checkIssue() {
    // イシュー削除
    $("ul.issue_list li").remove();
    const error_num = checkJSONError();
    const warning_num = checkJSONWarning();
    $("span.issue_warning_num").text("警告:" + warning_num);
    $("span.issue_error_num").text("エラー:" + error_num);
    if (warning_num <= 0 && error_num <= 0) {
      $("ul.issue_list").append("<li>問題はありません</li>");
    }
  }
  // 警告検査
  function checkJSONWarning() {
    let warning_num = 0;
    return warning_num;
  }
  // エラー検査
  function checkJSONError() {
    let error_num = 0;

    const block_ID = $("#description_block_name").val();
    const block_ID_split = block_ID.split(/:/);
    if (block_ID == "") {
      //ブロックIDが空です
      addIssue(
        "error",
        '[Description:identifier] ブロックIDが空です。ブロックIDを入力してください。ブロックIDは"名前空間:ブロックID"を入力してください。'
      );
      error_num++;
    } else if (block_ID.indexOf(":") < 0) {
      //ブロックIDが:で区切られていません
      addIssue(
        "error",
        '[Description:identifier] ブロックIDが ":" で区切られていません。"名前空間:ブロックID"の形式になっている必要があります。'
      );
      error_num++;
    } else if (block_ID_split[1] == "") {
      //ブロックIDがありません
      addIssue(
        "error",
        '[Description:identifier] ブロックIDがありません。"名前空間:ブロックID"を入力してください。'
      );
      error_num++;
    }
    return error_num;
  }
  // イシュー更新
  function addIssue(type, issue_content) {
    let content = "";
    if (type == "warning") {
      content = '<li><img src="img/warning.svg" alt=""><p>' + issue_content + "</p></li>";
    } else if (type == "error") {
      content = '<li><img src="img/error.svg" alt=""><p>' + issue_content + "</p></li>";
    }
    $("ul.issue_list").append(content);
  }
  // jsonデータ取り出し
  function import_data(json_text) {
    let json_data;
    try {
      json_data = JSON.parse(json_text);
    } catch (e) {
      window.alert("有効なjsonではありません");
      console.error("error:" + e);
      return;
    }

    format_version = json_data.format_version;
    if (format_version != null) {
      switch (format_version) {
        case "1.16.0":
          break;
        case "1.12.0":
          break;
        default:
          const temp = format_version.split(/,/);
          if (temp[0] == "1" && parseInt(temp[1]) >= 16) {
            format_version = "1.16.0";
          } else if (temp[0] == "1" && parseInt(temp[1]) < 16) {
            format_version = "1.12.0";
          }
          break;
      }
      $("#format_version").val(format_version);
    }

    const description = json_data["minecraft:block"].description;
    if (description.identifier != null) {
      $("#description_block_name").val(description.identifier);
    }
    if (description.is_experimental) {
      $("#description_is_experimental").prop("checked", true);
    }
    if (description.register_to_creative_menu) {
      $("#description_register_to_creative_menu").prop("checked", true);
    }

    const components = json_data["minecraft:block"].components;
    switch (format_version) {
      case "1.16.0":
        if (components["minecraft:loot"] != null) {
          $("#components_loot").val(components["minecraft:loot"]);
        }
        if (components["minecraft:destroy_time"] != null) {
          $("#components_destroy_time").val(components["minecraft:destroy_time"]);
        }
        if (components["minecraft:explosion_resistance"] != null) {
          $("#components_explosion_resistance").val(components["minecraft:explosion_resistance"]);
        }
        if (components["minecraft:friction"] != null) {
          $("#components_friction").val(components["minecraft:friction"]);
        }
        if (components["minecraft:flammable"] != null) {
          const flammable = components["minecraft:flammable"];
          $("#components_flame_odds").val(flammable.flame_odds);
          if (flammable.flame_odds != 0) {
            $("#components_burn_odds").val(flammable.burn_odds);
            $("#components_burn_odds").prop("disabled", false);
          }
        }
        if (components["minecraft:map_color"] != null) {
          $("#components_map_color").val(components["minecraft:map_color"]);
          $("#components_map_color_pick").val(components["minecraft:map_color"]);
        }
        if (components["minecraft:block_light_absorption"] != null) {
          $("#components_block_light_absorption").val(
            components["minecraft:block_light_absorption"]
          );
        }
        if (components["minecraft:block_light_emission"] != null) {
          $("#components_block_light_emission").val(components["minecraft:block_light_emission"]);
        }
        break;
      case "1.12.0":
        if (components["minecraft:loot"].table != null) {
          $("#components_loot").val(components["minecraft:loot"].table);
        }
        if (components["minecraft:destroy_time"].value != null) {
          $("#components_destroy_time").val(components["minecraft:destroy_time"].value);
        }
        if (components["minecraft:explosion_resistance"].value != null) {
          $("#components_explosion_resistance").val(
            components["minecraft:explosion_resistance"].value
          );
        }
        if (components["minecraft:friction"].value != null) {
          $("#components_friction").val(components["minecraft:friction"].value);
        }
        if (components["minecraft:flammable"] != null) {
          const flammable = components["minecraft:flammable"];
          $("#components_flame_odds").val(flammable.flame_odds);
          if (flammable.flame_odds != 0) {
            $("#components_burn_odds").val(flammable.burn_odds);
            $("#components_burn_odds").prop("disabled", false);
          }
        }
        if (components["minecraft:map_color"].color != null) {
          $("#components_map_color").val(components["minecraft:map_color"].color);
          $("#components_map_color_pick").val(components["minecraft:map_color"].color);
        }
        if (components["minecraft:block_light_absorption"].value != null) {
          $("#components_block_light_absorption").val(
            components["minecraft:block_light_absorption"].value
          );
        }
        if (components["minecraft:block_light_emission"].emission != null) {
          $("#components_block_light_emission").val(
            components["minecraft:block_light_emission"].emission
          );
        }
        break;
      default:
        break;
    }
    onChangedJSON();
  }
  // json 出力
  function exportJSON() {
    let json_raw = {};
    json_raw.format_version = format_version;
    json_raw["minecraft:block"] = {};

    let description = new Object();
    description.identifier = $("#description_block_name").val();
    description.is_experimental = $("#description_is_experimental").is(":checked");
    description.register_to_creative_menu = $("#description_register_to_creative_menu").is(
      ":checked"
    );

    json_raw["minecraft:block"]["description"] = description;

    let components = new Object();

    switch (format_version) {
      case "1.16.0":
        if ($("#components_loot").val() != "")
          components["minecraft:loot"] = $("#components_loot").val();
        components["minecraft:destroy_time"] = parseFloat($("#components_destroy_time").val());
        components["minecraft:explosion_resistance"] = parseFloat(
          $("#components_explosion_resistance").val()
        );
        components["minecraft:friction"] = parseFloat($("#components_friction").val());
        if ($("#components_flame_odds").val() != "0") {
          let flammable = new Object();
          flammable.flame_odds = parseInt($("#components_flame_odds").val(), 10);
          flammable.burn_odds = parseInt($("#components_burn_odds").val(), 10);
          components["minecraft:flammable"] = flammable;
        }
        components["minecraft:map_color"] = $("#components_map_color").val();
        components["minecraft:block_light_absorption"] = parseInt(
          $("#components_block_light_absorption").val(),
          10
        );
        components["minecraft:block_light_emission"] = parseFloat(
          $("#components_block_light_emission").val()
        );
        break;
      case "1.12.0":
        if ($("#components_loot").val() != "")
          components["minecraft:loot"] = { table: $("#components_loot").val() };
        components["minecraft:destroy_time"] = {
          value: parseFloat($("#components_destroy_time").val()),
        };
        components["minecraft:explosion_resistance"] = {
          value: parseFloat($("#components_explosion_resistance").val()),
        };
        components["minecraft:friction"] = { value: parseFloat($("#components_friction").val()) };
        if ($("#components_flame_odds").val() != "0") {
          let flammable = new Object();
          flammable.flame_odds = parseInt($("#components_flame_odds").val(), 10);
          flammable.burn_odds = parseInt($("#components_burn_odds").val(), 10);
          components["minecraft:flammable"] = flammable;
        }
        components["minecraft:map_color"] = { color: $("#components_map_color").val() };
        components["minecraft:block_light_absorption"] = {
          value: parseInt($("#components_block_light_absorption").val(), 10),
        };
        components["minecraft:block_light_emission"] = {
          emission: parseFloat($("#components_block_light_emission").val()),
        };
        break;
      default:
        break;
    }

    json_raw["minecraft:block"]["components"] = components;

    return JSON.stringify(json_raw, null, "  ");
  }
});
