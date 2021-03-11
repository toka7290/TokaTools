$(function () {
  // 宣言
  var isChanged = false;
  var format_version = "1.16.100";
  var is_separator_drag = false;
  var timeoutID;
  var is_can_issue = true;
  var help_page_num = 0;
  var format_json = new Object();
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
    $("html").css("cursor", "");
    const separator = $(".separator");
    separator.prev().removeClass("drag-lock");
    separator.next().removeClass("drag-lock");
  });
  $(document).on("mousemove", function (e) {
    if (is_separator_drag) {
      $("html").css("cursor", "e-resize");
      const separator = $(".separator");
      separator.prev().addClass("drag-lock");
      separator.next().addClass("drag-lock");
      const maxwidth = $("html").width() - 2;
      const next_width = maxwidth - e.clientX;
      const prev_width = maxwidth - next_width;
      separator.next().css("flex-basis", next_width);
      separator.prev().css("flex-basis", prev_width);
    }
  });
  // シェア
  $("#page-share").on("click", function () {
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
  $("#input-file").on("change", function () {
    importJsonFile();
  });
  // ヘルプを表示
  $("#show-help").on("click", function () {
    $("#page-help").fadeIn("fast");
    switchHelp();
  });
  $("#page-help").on("click", function () {
    switchHelp();
  });
  // ファイルドラッグ&ドロップ
  $(document).on("dragenter dragover", function (event) {
    event.stopPropagation();
    event.preventDefault();
    $(".file-drop-zone").removeClass("hide");
  });
  $(".file-drop-zone,.file-drop-zone-textarea").on("dragleave", function (event) {
    event.stopPropagation();
    event.preventDefault();
    $(".file-drop-zone").addClass("hide");
  });
  $(document).on("drop", function (_event) {
    isChanged = true;
    $(".file-drop-zone").addClass("hide");
    var event = _event;
    if (_event.originalEvent) {
      event = _event.originalEvent;
    }
    event.stopPropagation();
    event.preventDefault();
    $("#input-file").prop("files", event.dataTransfer.files);
    importJsonFile();
  });
  // プレビュー表示切替
  $("div#show-preview").on("click", function () {
    const showPreview = $("div#show-preview");
    $("div.preview").slideToggle();
    if (showPreview.hasClass("active")) {
      showPreview.removeClass("active");
    } else {
      showPreview.addClass("active");
    }
  });
  // ウィンドウワイズ変更時にcss削除
  $(window).resize(function () {
    $("div.preview").css("display", "");
    $("div.editor").css("flex-basis", "");
    $("div.data-check").css("flex-basis", "");
    help_page_num = 5;
    switchHelp();
  });
  // about開く
  $("#open-about").on("click", function () {
    $("div.page-about").removeClass("about-hide");
  });
  // about閉じる
  $("#close-about-btn").on("click", function () {
    $("div.page-about").addClass("about-hide");
  });
  // コピー
  $("#control-copy").on("click", function () {
    const codeBuffer = $("textarea#code-buffer");
    codeBuffer.select();
    document.execCommand("copy");
    $("p#control-copy-text").text("Copied");
    codeBuffer.blur();
    setTimeout(function () {
      $("p#control-copy-text").text("Copy");
    }, 1000);
  });
  // ダウンロード
  $("#control-download").on("click", function () {
    let content = $("textarea#code-buffer").val();
    $("<a></a>", {
      href: window.URL.createObjectURL(new Blob([content])),
      download: "manifest.json",
      target: "_blank",
    })[0].click();
  });
  // イシューリスト開閉
  $("#issue-control").on("click", function () {
    const control_bar_img = $("div.issue-status-label svg");
    if (control_bar_img.hasClass("close")) {
      // 開く
      control_bar_img.attr("class", "open");
    } else {
      // 閉じる
      control_bar_img.attr("class", "close");
    }
    $("div.issue-content").slideToggle();
  });

  // Editor switcher開閉
  $("#hamburger-opener").on("click", function () {
    $(".switch-element-body").toggleClass("open", $("#hamburger-opener").is(":checked"));
  });

  // Editor switch
  $('input[name="editor-switch"]').on("click", function () {
    let hide = [true, true, true, true];
    switch ($('input[name="editor-switch"]:checked').val()) {
      case "event":
        hide[1] = false;
        break;
      case "permutations":
        hide[2] = false;
        break;
      case "blockState":
        hide[3] = false;
        break;
      case "main":
      default:
        hide[0] = false;
        break;
    }
    $("#editor-main").toggleClass("hide", hide[0]);
    $("#editor-event").toggleClass("hide", hide[1]);
    $("#editor-permutations").toggleClass("hide", hide[2]);
    $("#editor-blockState").toggleClass("hide", hide[3]);
  });

  // color change
  $("#components-map-color").on("change", function () {
    $("#components-map-color-pick").val($("#components-map-color").val().toString());
  });

  // フォーマットバージョン変更
  $("#format-version").on("change", function () {
    format_version = $("#format-version").val();
    if (!Object.keys(format_json).length) setFormatJson();
    for (const format_key in format_json) {
      $(`#${format_key}`).toggleClass(
        "unsupported",
        !format_json[format_key].includes(format_version)
      );
    }
  });

  $(window).on("load", () => {
    setFormatJson();
  });
  function setFormatJson() {
    let request = new XMLHttpRequest();
    request.open("GET", "../json/format.json");
    request.responseType = "json";
    request.send();
    request.onload = function () {
      format_json = new Object(request.response);
    };
  }

  // 高頻度更新防止処理
  function setDelayIssue() {
    is_can_issue = false;
    if (typeof timeoutID === "number") {
      window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(function () {
      is_can_issue = true;
      checkIssue();
    }, 500);
  }
  // インポート処理
  function importJsonFile() {
    const data = $("#input-file").prop("files")[0];
    const file_reader = new FileReader();
    file_reader.onload = function () {
      const json_text = file_reader.result;
      setJSONData(json_text);
    };
    try {
      file_reader.readAsText(data);
    } catch (e) {
      console.error("error:" + e);
    }
  }
  // ヘルプ切換
  function switchHelp() {
    switch (help_page_num) {
      case 1:
        $("#help-content-1").fadeOut("fast");
        $("#help-content_2").slideToggle("fast");
        help_page_num++;
        return;
      case 2:
        $("#help-content_2").slideToggle("fast");
        $("#help-content-3").fadeIn("fast");
        help_page_num++;
        return;
      case 3:
        $("#help-content-3").fadeOut("fast");
        $("#page-help").hide();
        help_page_num = 0;
        return;
      case 5:
        $("#help-content-1").hide();
        $("#help-content_2").hide();
        $("#help-content-3").hide();
        $("#page-help").hide();
        help_page_num = 0;
        return;
      case 0:
      default:
        $("#help-content-1").fadeIn("fast");
        help_page_num++;
        return;
    }
  }
  // 更新処理
  function onChangedJSON() {
    onChangedFlammable();
    onChangedColor();
    onChangedBlockLightEmission();

    if (is_can_issue) checkIssue();
    setDelayIssue();
    const json_code = getJSONData();
    $("pre.language-json code.language-json").remove();
    $("pre.language-json").append($("<code>").addClass("language-json").text(json_code));
    $("textarea#code-buffer").val(json_code);
    Prism.highlightAll();
  }
  // 燃焼コンポーネント変更
  function onChangedFlammable() {
    if ($("#components-flame-odds").val() != "0") {
      $("#components-burn-odds").prop("disabled", false);
      $("#components-burn-odds").parent().removeClass("disabled");
    } else {
      $("#components-burn-odds").prop("disabled", true);
      $("#components-burn-odds").parent().addClass("disabled");
    }
  }
  // 色変更
  function onChangedColor() {
    $("#components-map-color").val($("#components-map-color-pick").val().toString());
  }
  // 発光量変更
  function onChangedBlockLightEmission() {
    $("#components-block-light-emission-eq").text(
      `= ${`  ${Math.round(parseFloat($("#components-block-light-emission").val()) * 15)}`.slice(
        -2
      )}`
    );
  }
  // イシューチェック
  function checkIssue() {
    // イシュー削除
    $("ul.issue-list li").remove();
    $(".stat-warning, .stat-error").removeClass("stat-warning stat-error");
    const error_num = checkJSONError();
    const warning_num = checkJSONWarning();
    $("span.issue-warning-num").text("警告:" + warning_num);
    $("span.issue-error-num").text("エラー:" + error_num);
    if (warning_num <= 0 && error_num <= 0) {
      $("ul.issue-list").append("<li>問題はありません</li>");
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

    const block_name = $("#description-block-name");
    const block_ID = block_name.val().split(/:/);
    let message = "";
    if (block_ID.length < 2) {
      // ブロックIDが:で区切られていません
      message =
        '[Description:identifier] ブロックIDが ":" で区切られていません。"名前空間:ブロックID"の形式になっている必要があります。';
    } else if (block_ID.length > 2) {
      // 不明なID形式
      message =
        '[Description:identifier] 不明なID形式です。"名前空間:ブロックID"の形式になっている必要があります。';
    } else if (block_ID[1] == "") {
      // ブロックIDが空です
      message =
        '[Description:identifier] ブロックIDが空です。ブロックIDを入力してください。ブロックIDは"名前空間:ブロックID"を入力してください。';
    } else if (block_ID[0] == "") {
      // 名前空間が空です
      message =
        '[Description:identifier] 名前空間が空です。名前空間を入力してください。ブロックIDは"名前空間:ブロックID"を入力してください。';
    }
    if (message != "") {
      addIssue("error", message, block_name);
      error_num++;
    }
    return error_num;
  }
  // イシュー更新
  function addIssue(type, issue_comment, issue_element) {
    let content = $("<li>");
    if (type == "warning") {
      content.append(
        $("<img>").attr({
          src: "img/warning.svg",
          alt: "",
          width: "19px",
          height: "19px",
        }),
        $("<p>").text(issue_comment)
      );
      issue_element.addClass("stat-warning");
    } else if (type == "error") {
      content.append(
        $("<img>").attr({
          src: "img/error.svg",
          alt: "",
          width: "19px",
          height: "19px",
        }),
        $("<p>").text(issue_comment)
      );
      issue_element.addClass("stat-error");
    }
    $("ul.issue-list").append(content);
  }
  // エラー時のテキスト
  function setErrorText(text = "", message = "") {
    let messageText = "有効なjsonではありません。";
    // 空白の場合は何も付け足さない
    if (text == "" || message == "") return messageText;
    const splitText = message.split(" ");
    const lineIndex = splitText.findIndex((element) => element == "line");
    const positionIndex = splitText.findIndex((element) => element == "position");
    if (lineIndex != -1) {
      const line = parseInt(splitText[lineIndex + 1], 10);
      const getBeginningOfLineIndex = (maxLine) => {
        let lastIndex = 0;
        for (let i = 1; i < maxLine; i++) {
          lastIndex = text.indexOf("\n", lastIndex) + 1;
        }
        return lastIndex;
      };
      const prevLineIndex = getBeginningOfLineIndex(line - 1);
      const LineLastIndex = getBeginningOfLineIndex(line + 1) - 1;
      messageText += `\n${line - 1}~${line}行で問題が発生しました。\n${text.substring(
        prevLineIndex,
        LineLastIndex
      )}`;
    } else if (positionIndex != -1) {
      const position = splitText[positionIndex + 1];
      const prevLineIndex = text.lastIndexOf("\n", text.lastIndexOf("\n", position) - 1) + 1;
      const prevLineNum = text.substr(0, prevLineIndex).match(/\n/g).length + 1;
      messageText += `\n${prevLineNum}~${prevLineNum + 1}行で問題が発生しました。\n${text.substring(
        prevLineIndex,
        text.indexOf("\n", position - 1)
      )}`;
    }
    return messageText;
  }
  // jsonデータ取り出し
  function setJSONData(json_text = "") {
    let json_data;
    try {
      json_data = JSON.parse(json_text);
    } catch (e) {
      window.alert(setErrorText(json_text, e.message));
      console.error("error:" + e);
      return;
    }

    format_version = json_data["format_version"];
    if (format_version != null) {
      switch (format_version) {
        case "1.16.100":
        case "1.16.0":
        case "1.12.0":
          break;
        default:
          const temp = format_version.split(/,/).map((str) => {
            return Number(str);
          });
          if (temp[0] >= 1 && temp[1] >= 16 && temp[2] >= 100) {
            // 1.16.100以上
            format_version = "1.16.100";
          } else if (temp[0] == 1 && temp[1] == 16 && temp[2] >= 0) {
            // 1.16.0~1.16.99
            format_version = "1.16.0";
          } else if (temp[0] <= 1 && temp[1] < 16) {
            // 0.0.0~1.15.999
            format_version = "1.12.0";
          }
          break;
      }
    }
    $("#format-version").val(format_version);

    const description = json_data["minecraft:block"]["description"];
    if (description["identifier"] != null) {
      $("#description-block-name").val(description["identifier"]);
    }
    // blockState

    const components = json_data["minecraft:block"]["components"];
    switch (format_version) {
      case "1.16.100":
        // -----------------------実装-----------------------------
        break;
      case "1.16.0":
        if (description["is_experimental"]) {
          $("#description-is-experimental").prop("checked", true);
        }
        if (description["register_to_creative_menu"]) {
          $("#description-register-to-creative-menu").prop("checked", true);
        }
        if (components["minecraft:loot"] != null) {
          $("#components-loot").val(components["minecraft:loot"]);
        }
        if (components["minecraft:destroy_time"] != null) {
          $("#components-destroy-time").val(components["minecraft:destroy_time"]);
        }
        if (components["minecraft:explosion_resistance"] != null) {
          $("#components-explosion-resistance").val(components["minecraft:explosion_resistance"]);
        }
        if (components["minecraft:friction"] != null) {
          $("#components-friction").val(components["minecraft:friction"]);
        }
        if (components["minecraft:flammable"] != null) {
          const flammable = components["minecraft:flammable"];
          $("#components-flame-odds").val(flammable["flame_odds"]);
          if (flammable["flame_odds"] != 0) {
            $("#components-burn-odds").val(flammable["burn_odds"]);
            $("#components-burn-odds").prop("disabled", false);
          }
        }
        if (components["minecraft:map_color"] != null) {
          $("#components-map-color").val(components["minecraft:map_color"]);
          $("#components-map-color-pick").val(components["minecraft:map_color"]);
        }
        if (components["minecraft:block_light_absorption"] != null) {
          $("#components-block-light-absorption").val(
            components["minecraft:block-light-absorption"]
          );
        }
        if (components["minecraft:block_light_emission"] != null) {
          $("#components-block-light-emission").val(components["minecraft:block_light_emission"]);
        }
        break;
      case "1.12.0":
        if (description["is_experimental"]) {
          $("#description-is-experimental").prop("checked", true);
        }
        if (description["register_to_creative_menu"]) {
          $("#description-register-to-creative-menu").prop("checked", true);
        }
        if (components["minecraft:loot"]["table"] != null) {
          $("#components-loot").val(components["minecraft:loot"]["table"]);
        }
        if (components["minecraft:destroy_time"].value != null) {
          $("#components-destroy-time").val(components["minecraft:destroy_time"]["value"]);
        }
        if (components["minecraft:explosion_resistance"]["value"] != null) {
          $("#components-explosion-resistance").val(
            components["minecraft:explosion_resistance"]["value"]
          );
        }
        if (components["minecraft:friction"]["value"] != null) {
          $("#components-friction").val(components["minecraft:friction"]["value"]);
        }
        if (components["minecraft:flammable"] != null) {
          const flammable = components["minecraft:flammable"];
          $("#components-flame-odds").val(flammable["flame_odds"]);
          if (flammable["flame_odds"] != 0) {
            $("#components-burn-odds").val(flammable["burn_odds"]);
            $("#components-burn-odds").prop("disabled", false);
          }
        }
        if (components["minecraft:map_color"]["color"] != null) {
          $("#components-map-color").val(components["minecraft:map_color"]["color"]);
          $("#components-map-color-pick").val(components["minecraft:map_color"]["color"]);
        }
        if (components["minecraft:block_light_absorption"]["value"] != null) {
          $("#components-block-light-absorption").val(
            components["minecraft:block_light_absorption"]["value"]
          );
        }
        if (components["minecraft:block_light_emission"]["emission"] != null) {
          $("#components-block-light-emission").val(
            components["minecraft:block_light_emission"]["emission"]
          );
        }
        break;
      default:
        break;
    }
    onChangedJSON();
  }
  // json 出力
  function getJSONData() {
    let json_raw = {};
    json_raw["format_version"] = format_version;
    json_raw["minecraft:block"] = new Object();

    let description = new Object();
    description["identifier"] = $("#description-block-name").val();
    switch (format_version) {
      case "1.16.100":
        // blockState
        const status_block_contents = $(".blockState.status-block-content");
        const status_block_contents_len = status_block_contents.length;
        const condition = [
          status_block_contents_len <= 1,
          (() => {
            // val some
            for (let index = 0; index < status_block_contents_len; index++) {
              if ("" == $(".blockState-name").eq(index).val()) {
                continue;
              } else {
                return true;
              }
            }
            return false;
          })(),
        ];
        if (
          condition.some((val) => {
            return val;
          })
        ) {
          let properties = new Object();
          for (let index = 0; index < status_block_contents_len; index++) {
            const body = $(".blockState.status-block-content").eq(index);
            const key = body.find(".blockState-name").val();
            if ("" == key) {
              continue;
            } else {
              const type = body.find(".blockState-type").val();
              let data_list = new Array();
              switch (type) {
                case "Integer":
                  {
                    const array_data = body.find(`.value-element.${type} .array-data>input`);
                    const array_data_len = array_data.length;
                    for (let num = 0; num < array_data_len; num++) {
                      data_list.push(Number(array_data.eq(num).val()));
                    }
                  }
                  break;
                case "String":
                  {
                    const array_data = body.find(`.value-element.${type} .array-data>input`);
                    const array_data_len = array_data.length;
                    for (let num = 0; num < array_data_len; num++) {
                      data_list.push(array_data.eq(num).val());
                    }
                  }
                  break;
                case "Boolean":
                default:
                  const bool = body.find(".blockState-boolean").is(":checked");
                  data_list = [bool, !bool];
                  break;
              }
              properties[key] = data_list;
            }
          }
          description["properties"] = properties;
        }
        break;
      case "1.16.0":
      case "1.12.0":
        description["is_experimental"] = $("#description-is-experimental").is(":checked");
        description["register_to_creative-menu"] = $("#description-register-to-creative-menu").is(
          ":checked"
        );
        break;
    }

    json_raw["minecraft:block"]["description"] = description;

    let components = new Object();

    switch (format_version) {
      case "1.16.100":
        break;
      case "1.16.0":
        if ($("#components-loot").val() != "")
          components["minecraft:loot"] = $("#components-loot").val();
        components["minecraft:destroy_time"] = parseFloat($("#components-destroy-time").val());
        components["minecraft:explosion_resistance"] = parseFloat(
          $("#components-explosion-resistance").val()
        );
        components["minecraft:friction"] = parseFloat($("#components-friction").val());
        if ($("#components_flame-odds").val() != "0") {
          let flammable = new Object();
          flammable["flame_odds"] = parseInt($("#components-flame-odds").val(), 10);
          flammable["burn_odds"] = parseInt($("#components-burn-odds").val(), 10);
          components["minecraft:flammable"] = flammable;
        }
        components["minecraft:map_color"] = $("#components-map-color").val();
        components["minecraft:block_light_absorption"] = parseInt(
          $("#components-block-light-absorption").val(),
          10
        );
        components["minecraft:block_light_emission"] = parseFloat(
          $("#components-block-light-emission").val()
        );
        break;
      case "1.12.0":
        if ($("#components-loot").val() != "")
          components["minecraft:loot"] = { table: $("#components-loot").val() };
        components["minecraft:destroy_time"] = {
          value: parseFloat($("#components-destroy-time").val()),
        };
        components["minecraft:explosion_resistance"] = {
          value: parseFloat($("#components-explosion-resistance").val()),
        };
        components["minecraft:friction"] = { value: parseFloat($("#components-friction").val()) };
        if ($("#components-flame-odds").val() != "0") {
          let flammable = new Object();
          flammable["flame_odds"] = parseInt($("#components-flame-odds").val(), 10);
          flammable["burn_odds"] = parseInt($("#components-burn-odds").val(), 10);
          components["minecraft:flammable"] = flammable;
        }
        components["minecraft:map_color"] = { color: $("#components-map-color").val() };
        components["minecraft:block_light_absorption"] = {
          value: parseInt($("#components-block-light-absorption").val(), 10),
        };
        components["minecraft:block-light-emission"] = {
          emission: parseFloat($("#components-block-light-emission").val()),
        };
        break;
      default:
        break;
    }

    json_raw["minecraft:block"]["components"] = components;

    // "events"
    switch (format_version) {
      case "1.16.100":
        json_raw["minecraft:block"]["events"] = new Object();
        break;
      case "1.16.0":
      case "1.12.0":
      default:
        break;
    }
    // "permutations"
    switch (format_version) {
      case "1.16.100":
        json_raw["minecraft:block"]["permutations"] = new Array();
        break;
      case "1.16.0":
      case "1.12.0":
      default:
        break;
    }

    return JSON.stringify(json_raw, null, "  ");
  }
});