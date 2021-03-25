/** 宣言 */
var isChanged = false;
var format_version = /** @type {string} */ ("1.16.100");
var is_separator_drag = false;
var timeoutID;
var is_can_issue = true;
var help_page_num = 0;
var format_json = new Object();

onChangedJSON();
/** ページ離脱時に警告表示 */
$(window).bind("beforeunload", function () {
  if (isChanged) {
    return "このページを離れようとしています。";
  }
});

/* ------------------------- UI 制御 ------------------------- */
/** input,textarea,select 変更 */
$(document).on("change", "input,textarea,select", function () {
  onChangedJSON();
  isChanged = true;
});
$(document).on("keyup", "input,textarea,select", function () {
  onChangedJSON();
  isChanged = true;
});
/** セパレータ移動 */
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
/** ウィンドウワイズ変更時にcss削除 */
$(window).resize(function () {
  $("div.preview").css("display", "");
  $("div.editor").css("flex-basis", "");
  $("div.data-check").css("flex-basis", "");
  help_page_num = 5;
  switchHelp();
});
/** ヘルプを表示 */
$("#show-help").on("click", function () {
  $("#page-help").fadeIn("fast");
  switchHelp();
});
$("#page-help").on("click", function () {
  switchHelp();
});
/** ヘルプ切換 */
function switchHelp() {
  switch (help_page_num) {
    case 1:
      $("#help-content-1").fadeOut("fast");
      $("#help-content-2").slideToggle("fast");
      help_page_num++;
      return;
    case 2:
      $("#help-content-2").slideToggle("fast");
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
      $("#help-content-2").hide();
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
/** プレビュー表示切替 (phone) */
$("div#show-preview").on("click", function () {
  const showPreview = $("div#show-preview");
  $("div.preview").slideToggle();
  if (showPreview.hasClass("active")) {
    showPreview.removeClass("active");
  } else {
    showPreview.addClass("active");
  }
});
/** about開く */
$("#open-about").on("click", function () {
  $("div.page-about").removeClass("about-hide");
});
/** about閉じる */
$("#close-about-btn").on("click", function () {
  $("div.page-about").addClass("about-hide");
});
/** Editor switcher開閉 */
$("#hamburger-opener").on("click", function () {
  $(".switch-element-body").toggleClass("open", $("#hamburger-opener").is(":checked"));
});
/** Editor switch */
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
/** block tab変更 */
$(document).on("click", ".block-tab-children>input[type=radio]", (
  /** @type {jQuery.Event} */ event
) => {
  const target = $(event.target);
  const tabNumber = Number(target.next(".tab-number").text());
  target.closest(".block-tabPanel").find(".block-tab-container").removeClass("selected");
  target.closest(".block-tabPanel").find(".block-tab-container").eq(tabNumber).addClass("selected");
});
/** block tab追加 */
$(document).on("click", ".add-block-tab-element", (/** @type {jQuery.Event} */ event) => {
  addBlockTabElement($(event.target).closest(".block-tabPanel"));
});
/**
 * Block タブ追加
 * @param {jQuery} blockTabPanel
 */
function addBlockTabElement(blockTabPanel) {
  // tab
  const body = blockTabPanel.find(".block-tab-body");
  const children_len = body.children().length;
  body.append(
    $("<label>")
      .addClass(
        `${blockTabPanel
          .attr("class")
          .replace(" block-tabPanel", "")} block-tab-children invisible-Control`
      )
      .append(
        $("<input>")
          .attr({
            ["type"]: "radio",
            ["name"]: "permutations",
          })
          .prop("checked", children_len == 0)
          .addClass("permutations block-tab"),
        $("<div>").addClass("tab-number").text(children_len)
      )
  );
  // コンテンツ
  const tab_contents = blockTabPanel.find(".block-tab-contents");
  tab_contents.append(
    $("#permutation-block-tab")
      .contents()
      .clone()
      .toggleClass("selected", children_len == 0)
  );
}
/** block tab削除 */
$(document).on("click", ".remove-block-tab-element", (/** @type {jQuery.Event} */ event) => {
  const target = $(event.target);
  const tabpanel = target.closest(".block-tabPanel");
  let child = tabpanel.find(".block-tab-body > .block-tab-children");
  let child_len = child.length;
  // 0以下終了
  if (child_len <= 0) return;
  // 選択tab検索
  let checked_index = 0;
  for (let index = 0; index < child_len; index++) {
    if (child.eq(index).find("input[type=radio]").is(":checked")) {
      checked_index = index;
      break;
    }
  }
  tabpanel.find(".block-tab-container").eq(checked_index).remove();
  child.eq(checked_index).remove();
  tabpanel.find(".block-tab-container:first-child").addClass("selected");
  child = tabpanel.find(".block-tab-body > .block-tab-children");
  child_len = child.length;
  for (let index = 0; index < child_len; index++) {
    child
      .eq(index)
      .find("input[type=radio]")
      .prop("checked", index == 0);
    child.eq(index).find(".tab-number").text(index);
  }
});
// コンポーネント削除＆追加
$(document).on("change", "input.element-control-switch", (/** @type {jQuery.Event} */ event) => {
  changeElement($(event.target));
  onChangedJSON();
});
/**
 * コンポーネント切替
 * @param {jQuery} control_switch
 */
function changeElement(control_switch) {
  const element_body = control_switch.closest(".element-control").prev(".editor-element-body");
  if (control_switch.is(":checked"))
    element_body.append(
      $("#value-elements-component")
        .contents()
        .filter(`.value-element.${control_switch.attr("name")}`)
        .clone()
    );
  else
    element_body
      .contents()
      .filter(`.value-element.${control_switch.attr("name")}`)
      .remove();
}
/** value-input switchable */
$(document).on("click", ".switchable-content select", (/** @type {jQuery.Event} */ event) => {
  const select_elem = $(event.target);
  const switchable_element = select_elem
    .closest(".switchable-content")
    .nextAll(`.switchable-element`);
  for (let index = 0; index < switchable_element.length; index++) {
    switchable_element
      .eq(index)
      .toggleClass(
        "hide",
        !switchable_element.eq(index).hasClass(/** @type {string}*/ (select_elem.val()))
      );
  }
});
/** tab変更 */
$(document).on("click", ".tab-children>input[type=radio]", (/** @type {jQuery.Event} */ event) => {
  const target = $(event.target);
  const tabNumber = Number(target.next(".tab-number").text());
  target
    .closest(".tabpanel")
    .children(".tab-contents")
    .children(".tab-container")
    .removeClass("selected")
    .eq(tabNumber)
    .addClass("selected");
});
/** tab追加 */
$(document).on("click", ".add-tab-element", (/** @type {jQuery.Event} */ event) => {
  addTabElement($(event.target).closest(".tabpanel"));
});
/**
 * tab 追加
 * @param {jQuery} tabpanel
 */
function addTabElement(/** @type {jQuery} */ tabpanel) {
  const body = tabpanel.children(".tab-navigation").children(".tab-body");
  const child = body.children(":first-child").clone();
  child.find("input[type=radio]").prop("checked", false);
  child.find(".tab-number").text(body.children().length);
  body.append(child);
  const tab_contents = tabpanel.children(".tab-contents");
  tab_contents.append(tab_contents.children("div:first-child").clone().removeClass("selected"));
}
/** tab削除 */
$(document).on("click", ".remove-tab-element", (/** @type {jQuery.Event} */ event) => {
  const target = $(event.target);
  const tabpanel = target.closest(".tabpanel");
  let child = tabpanel.children(".tab-navigation").find(".tab-body > .tab-children");
  let child_len = child.length;
  // 1以下終了
  if (child_len <= 1) return;
  let checked_index = 0;
  for (let index = 0; index < child_len; index++) {
    if (child.eq(index).find("input[type=radio]").is(":checked")) {
      checked_index = index;
      break;
    }
  }
  target
    .closest(".tabpanel")
    .children(".tab-contents")
    .children(".tab-container")
    .eq(checked_index)
    .remove();
  child.eq(checked_index).remove();
  target
    .closest(".tabpanel")
    .children(".tab-contents")
    .children(".tab-container:first-child")
    .addClass("selected");
  child = tabpanel.children(".tab-navigation").find(".tab-body > .tab-children");
  child_len = child.length;
  for (let index = 0; index < child_len; index++) {
    child
      .eq(index)
      .find("input[type=radio]")
      .prop("checked", index == 0);
    child.eq(index).find(".tab-number").text(index);
  }
});
/** 配列制御 追加 */
$(document).on("click", "input.add-array-element", (/** @type {jQuery.Event} */ event) => {
  addArrayElement($(event.target).closest(".value-input"));
});
/** 配列制御追加
 * @param {jQuery} value_input
 */
function addArrayElement(/** @type {jQuery} */ value_input) {
  const array_list = value_input.find(".array-list");
  const class_name = /** @type {string} */ (array_list
    .find(".array-data:last-child>input")
    .attr("name"));
  if (value_input.hasClass("type-array-modal")) {
    array_list.append(
      $("<div>")
        .addClass("array-data type-modal")
        .append(
          $("<label>").append(
            $("<div>").addClass("array-num").text(array_list.children().length),
            $("<input>")
              .attr({ ["type"]: "button", ["value"]: "編集" })
              .addClass("modal-open")
          ),
          array_list.find(":first-child .modal").clone()
        )
    );
  } else {
    array_list.append(
      $("<label>")
        .addClass("array-data")
        .append(
          $("<div>").addClass("array-num").text(array_list.children().length),
          (() => {
            const input = $("<input>");
            if (value_input.hasClass("type-array-integer")) {
              input
                .attr({ ["type"]: "number", ["name"]: class_name })
                .addClass(`${class_name} type-array-integer`);
            } else if (value_input.hasClass("type-array-string")) {
              input
                .attr({ ["type"]: "text", ["name"]: class_name })
                .addClass(`${class_name} type-array-string`);
            } else if (value_input.hasClass("type-array-select")) {
              return $("<select>")
                .attr("name", class_name)
                .addClass(`${class_name} type-array-select`)
                .append(
                  $('<option value="up">上</option>'),
                  $('<option value="down">下</option>'),
                  $('<option value="north">北</option>'),
                  $('<option value="south">南</option>'),
                  $('<option value="east">東</option>'),
                  $('<option value="west">西</option>'),
                  $('<option value="side">側面</option>'),
                  $('<option value="all">全面</option>')
                );
            }
            return input;
          })()
        )
    );
  }
}
/** 配列制御 削除 */
$(document).on("click", "input.remove-array-element", (/** @type {jQuery.Event} */ event) => {
  const list = $(event.target).closest(".value-input").find(".array-list");
  if (list.length <= 1) return;
  list.find(".array-data:last-child").remove();
});
/** モーダル開く */
$(document).on("click", ".modal-open", (/** @type {jQuery.Event} */ event) => {
  $(event.target).closest(".type-modal").children(".modal").removeClass("hide");
  event.stopPropagation();
});
/** モーダル閉じる */
$(document).on("click", ".modal", (/** @type {jQuery.Event} */ event) => {
  const click_element = $(event.target);
  // console.log(click_element.children(".modal-dialog").length,
  // !click_element.closest(".modal").find(".modal").hasClass("hide"));
  if (click_element.children(".modal-dialog").length) {
    // console.log(click_element.closest(".type-modal").children(".modal"))
    click_element.closest(".type-modal").children(".modal").addClass("hide");
  }
  event.stopPropagation();
});
/** モーダル閉じる(ボタン) */
$(document).on("click", ".modal-close", (/** @type {jQuery.Event} */ event) => {
  const click_element = $(event.target);
  click_element.closest(".type-modal").children(".modal").addClass("hide");
});
/** イシューリスト開閉 */
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
/** event 追加 */
$("#event-add").on("click", () => {
  addEvent();
});
/**
 * イベント追加
 */
function addEvent() {
  $(".event.status-block-body").append($("#event-status-block").contents().clone());
}
/** event 削除 */
$(document).on("click", "input.event-delete", (/** @type {jQuery.Event} */ event) => {
  $(event.target).closest(".status-block-content").remove();
});
/** blockState 追加 */
$("#blockState-add").on("click", () => {
  addBlockState();
});
/**
 * BlockState追加
 */
function addBlockState() {
  $(".blockState.status-block-body").append($("#blockState-status-block").contents().clone());
}
/** blockState 削除 */
$(document).on("click", "input.blockState-delete", (/** @type {jQuery.Event} */ event) => {
  $(event.target).closest(".status-block-content").remove();
});

/* ------------------------- page 入出力 ------------------------- */
/** シェア */
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
/** 外部インポート */
$("#input-file").on("change", function () {
  importJsonFile();
});
/** インポート処理 */
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
/** ファイルドラッグ&ドロップ */
$(document).on("dragenter dragover", function (/** @type {jQuery.Event} */ event) {
  event.stopPropagation();
  event.preventDefault();
  $(".file-drop-zone").removeClass("hide");
});
$(".file-drop-zone,.file-drop-zone-textarea").on("dragleave", function (
  /** @type {Event} */ event
) {
  event.stopPropagation();
  event.preventDefault();
  $(".file-drop-zone").addClass("hide");
});
$(document).on("drop", function (/** @type {jQuery.Event} */ _event) {
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
/** コピー */
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
/** ダウンロード */
$("#control-download").on("click", function () {
  let content = $("textarea#code-buffer").val();
  $("<a></a>", {
    href: window.URL.createObjectURL(new Blob([content])),
    download: "manifest.json",
    target: "_blank",
  })[0].click();
});
/** 色変更 color val-> color */
$(document).on("change", ".components-map-color", (/** @type {jQuery.Event} */ event) => {
  $(event.target)
    .closest(".type-color")
    .find(".components-map-color-pick")
    .val(/** @type {string} */ ($(event.target).val()));
});
/** 色変更 color -> color val */
$(document).on("change", ".components-map-color-pick", (/** @type {jQuery.Event} */ event) => {
  $(event.target)
    .closest(".type-color")
    .find(".components-map-color")
    .val(/** @type {string} */ ($(event.target).val()));
});
/** 発光量変更 */
$(document).on("change", ".components-block-light-emission", (
  /** @type {jQuery.Event} */ event
) => {
  const target = $(event.target);
  target
    .next(".components-block-light-emission-eq")
    .text(`= ${`  ${Math.round(parseFloat(target.val()) * 15)}`.slice(-2)}`);
});

/* ------------------------- json 処理 ------------------------- */
/** フォーマットバージョン変更 */
$("#format-version").on("change", function () {
  format_version = $("#format-version").val();
  if (!Object.keys(format_json).length) setFormatJson();
  for (const format_key in format_json) {
    $(`.${format_key}`).toggleClass(
      "unsupported",
      !format_json[format_key].includes(format_version)
    );
  }
});
$(window).on("load", () => {
  setFormatJson();
});
/** format.json を取得 */
function setFormatJson() {
  let request = new XMLHttpRequest();
  request.open("GET", "../json/format.json");
  request.responseType = "json";
  request.send();
  request.onload = function () {
    format_json = new Object(request.response);
  };
}

/** 更新処理 */
function onChangedJSON() {
  onChangedFlammable();

  if (is_can_issue) checkIssue();
  setDelayIssue();
  const json_code = getJSONData();
  $("pre.language-json code.language-json").remove();
  $("pre.language-json").append($("<code>").addClass("language-json").text(json_code));
  $("textarea#code-buffer").val(json_code);
  Prism.highlightAll();
}
/** 高頻度更新防止
 * */
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
/** 燃焼コンポーネント変更 */
function onChangedFlammable() {
  const flame_odds = $(".components-flammable-flame-odds");
  const flame_odds_len = flame_odds.length;
  const burn_odds = $(".components-flammable-burn-odds");
  for (let index = 0; index < flame_odds_len; index++) {
    const is_empty = flame_odds.eq(index).val() == "0";
    burn_odds.eq(index).prop("disabled", is_empty);
    burn_odds.eq(index).closest(".value-element").toggleClass("disabled", is_empty);
  }
}
/** イシューチェック */
function checkIssue() {
  // イシュー削除
  $("ul.issue-list li").remove();
  $(".stat-warning,.stat-error").removeClass("stat-warning stat-error");
  const error_num = checkJSONError();
  const warning_num = checkJSONWarning();
  $("span.issue-warning-num").text("警告:" + warning_num);
  $("span.issue-error-num").text("エラー:" + error_num);
  if (warning_num <= 0 && error_num <= 0) {
    $("ul.issue-list").append("<li>問題はありません</li>");
  }
}
/** イシュー更新
 * @param {string} type
 * @param {string} issue_comment
 * @param {jQuery} issue_element
 */
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
/** 警告検査
 * @return {number}
 */
function checkJSONWarning() {
  let warning_num = 0;
  return warning_num;
}
/** エラー検査
 * @return {number}
 *  */
function checkJSONError() {
  let error_num = 0;
  // ID
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

/** json 出力
 * @return {string}
 */
function getJSONData() {
  let json_raw = {};
  json_raw["format_version"] = format_version;
  json_raw["minecraft:block"] = new Object();

  // description
  let description = new Object();
  description["identifier"] = $("#description-block-name").val();
  switch (format_version) {
    case "1.16.100":
      // blockState
      const status_block_contents = $(".blockState.status-block-content");
      const status_block_contents_len = status_block_contents.length;
      const name_list = $("#blockState-name-list");
      name_list.children().remove();
      if (
        (() => {
          // 名前アリ 1つ以上
          for (let index = 0; index < status_block_contents_len; index++) {
            if ("" != $(".blockState-name").eq(index).val()) return true;
          }
          return false;
        })()
      ) {
        let properties = new Object();
        for (let index = 0; index < status_block_contents_len; index++) {
          const body = status_block_contents.eq(index);
          const key = /** @type {string} */ (body.find(".blockState-name").val());
          if ("" != key) {
            const type = body.find(".blockState-type").val();
            let data_list = new Array();
            switch (type) {
              case "val_Integer":
                {
                  const array_data = body.find(
                    `.${type}>.value-element input.blockState-integer.type-array-integer`
                  );
                  const array_data_len = array_data.length;
                  for (let num = 0; num < array_data_len; num++) {
                    if (array_data.eq(num).val() != "") {
                      data_list.push(Number(array_data.eq(num).val()));
                    }
                  }
                }
                break;
              case "val_String":
                {
                  const array_data = body.find(
                    `.${type}>.value-element input.blockState-string.type-array-string`
                  );
                  const array_data_len = array_data.length;
                  for (let num = 0; num < array_data_len; num++) {
                    if (array_data.eq(num).val() != "") {
                      data_list.push(array_data.eq(num).val());
                    }
                  }
                }
                break;
              case "val_Boolean":
              default:
                const bool = body.find(".blockState-boolean").is(":checked");
                data_list = [bool, !bool];
                break;
            }
            properties[key] = data_list;
            // 画面 データリスト更新
            name_list.append($("<option>").attr("value", key));
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

  // components
  json_raw["minecraft:block"]["components"] = getComponents(
    $("#editor-main .editor-element-body").children(),
    /** @type {string} */ (format_version)
  );

  // "events"
  switch (format_version) {
    case "1.16.100":
      const status_block_contents = $(".event.status-block-content");
      const status_block_contents_len = status_block_contents.length;
      const name_list = $("#event-name-list");
      name_list.children().remove();
      if (
        (() => {
          // 名前アリ 1つ以上
          for (let index = 0; index < status_block_contents_len; index++) {
            if ("" != $(".event-name").eq(index).val()) return true;
          }
          return false;
        })()
      ) {
        let events = new Object();
        for (let index = 0; index < status_block_contents_len; index++) {
          const body = /** @type {jQuery} */ (status_block_contents.eq(index));
          const key = /** @type {string} */ (body.find(".event-name").val());
          if (key != "") {
            const value_element = body
              .children(".editor-element")
              .children(".editor-element-body")
              .children();
            events[key] = getEventResponses(value_element);
            // 画面 データリスト更新
            name_list.append($("<option>").attr("value", key));
          }
        }
        json_raw["minecraft:block"]["events"] = events;
      }
      break;
    case "1.16.0":
    case "1.12.0":
    default:
      break;
  }
  // "permutations"
  switch (format_version) {
    case "1.16.100":
      const conditions = $(".permutations_condition");
      const conditions_len = conditions.length;
      if (
        (() => {
          // 名前アリ 1つ以上
          for (let index = 0; index < conditions_len; index++) {
            if ("" != conditions.eq(index).val()) return true;
          }
          return false;
        })()
      ) {
        let permutations = new Array();
        const container = $(".permutations.block-tab-container");
        for (let index = 0; index < conditions_len; index++) {
          const body = /** @type {jQuery} */ (container.eq(index).find(".editor-element-body"));
          const condition = /** @type {string} */ (conditions.eq(index).val());
          if (condition != "") {
            let data = new Object();
            data["condition"] = condition;
            data["components"] = getComponents(body.children(), format_version);
            permutations.push(data);
          }
        }
        json_raw["minecraft:block"]["permutations"] = permutations;
      }
      break;
    case "1.16.0":
    case "1.12.0":
    default:
      break;
  }
  return JSON.stringify(json_raw, null, "  ");
}

/**
 * @param {jQuery} value_elements
 * @param {string} version
 * @return {Object}
 */
function getComponents(/** @type {jQuery} */ value_elements, /** @type {string} */ version) {
  let components = new Object();
  switch (version) {
    case "1.16.100":
      let element = value_elements.filter(".components_loot");
      if (element.length) {
        components["minecraft:loot"] = element.find(".components-loot").val();
      }
      element = value_elements.filter(".components_display_name");
      if (element.length) {
        components["minecraft:display_name"] = element.find(".components-display-name").val();
      }
      element = value_elements.filter(".components_tag");
      if (element.length) {
        const tag = element.find(".components-tag");
        const tag_len = tag.length;
        for (let index = 0; index < tag_len; index++) {
          components[`tag:${tag.eq(index).val()}`] = new Object();
        }
      }
      element = value_elements.filter(".components_placement_filter");
      if (element.length) {
        components["minecraft:placement_filter"] = new Object();
        const container = element.find(".tab-container");
        const container_len = container.length;
        let condition_list = new Array();
        for (let index = 0; index < container_len; index++) {
          let condition = new Object();

          const face = container.eq(index).find(".components-placement-filter-allowed-faces");
          let allowed_faces = new Array();
          for (let index_face = 0; index_face < face.length && index_face <= 8; index_face++) {
            allowed_faces.push(face.eq(index_face).val());
          }
          condition["allowed_faces"] = allowed_faces;

          const block = container.eq(index).find(".components-placement-filter-block-filter");
          let block_filter = new Array();
          for (let index_block = 0; index_block < block.length; index_block++) {
            block_filter.push(block.eq(index_block).val());
          }
          condition["block_filter"] = block_filter;
          condition_list.push(condition);
        }
        components["minecraft:placement_filter"]["conditions"] = condition_list;
      }
      element = value_elements.filter(".components_preventsjumping");
      if (element.length) {
        components["minecraft:preventsjumping"] = element
          .find(".components-preventsJumping")
          .is(":checked");
      }
      element = value_elements.filter(".components_unwalkable");
      if (element.length) {
        components["minecraft:unwalkable"] = element.find(".components-unwalkable").is(":checked");
      }
      element = value_elements.filter(".components_map_color");
      if (element.length) {
        components["minecraft:map_color"] = element.find(".components-map-color").val();
      }
      element = value_elements.filter(".components_crafting_table");
      if (element.length) {
        let crafting_table = new Object();
        crafting_table["grid_size"] = Number(
          element.find(".components-crafting-table-grid-size").val()
        );
        const tag = element.find(".components-crafting-table-crafting-tags");
        const tag_len = tag.length;
        let crafting_tags = new Array();
        for (let index = 0; index < tag_len; index++) {
          crafting_tags.push(tag.eq(index).val());
        }
        crafting_table["crafting_tags"] = crafting_tags;
        crafting_table["custom_description"] = element
          .find(".components-crafting-table-custom-description")
          .val();
        components["minecraft:crafting_table"] = crafting_table;
      }
      element = value_elements.filter(".components_geometry");
      if (element.length) {
        switch (element.find(".components-geometry-switch").val()) {
          case "val_geometry":
            components["minecraft:geometry"] = element.find(".components-geometry").val();
            break;
          case "val_cube":
            components["minecraft:unit_cube"] = new Object();
            break;
          default:
            break;
        }
      }
      element = value_elements.filter(".components_material_instances");
      if (element.length) {
        let data = new Object();

        const face = element.find(".components-material-instances-face");
        const face_len = face.length;
        for (let index = 0; index < face_len; index++) {
          let instance = new Object();
          instance["texture"] = element
            .find(".components-material-instances-texture")
            .eq(index)
            .val();
          instance["render_method"] = element
            .find(".components-material-instances-material")
            .eq(index)
            .val();
          data[face.eq(index).val()] = instance;
        }

        components["minecraft:material_instances"] = data;
      }
      element = value_elements.filter(".components_entity_collision");
      if (element.length) {
        let val;
        switch (element.find(".components-entity-collision-switch").val()) {
          case "val_simple":
            val = element.find(".components-entity-collision-simple").is(":checked");
            break;
          case "val_details":
            val = new Object();
            val["origin"] = [
              Number(element.find(".components-entity-collision-origin-x").val()),
              Number(element.find(".components-entity-collision-origin-y").val()),
              Number(element.find(".components-entity-collision-origin-z").val()),
            ];
            val["size"] = [
              Number(element.find(".components-entity-collision-size-x").val()),
              Number(element.find(".components-entity-collision-size-y").val()),
              Number(element.find(".components-entity-collision-size-z").val()),
            ];
            break;
          default:
            break;
        }
        components["minecraft:entity_collision"] = val;
      }
      element = value_elements.filter(".components_pick_collision");
      if (element.length) {
        let val;
        switch (element.find(".components-pick-collision-switch").val()) {
          case "val_simple":
            val = element.find(".components-pick-collision-simple").is(":checked");
            break;
          case "val_details":
            val = new Object();
            val["origin"] = [
              Number(element.find(".components-pick-collision-origin-x").val()),
              Number(element.find(".components-pick-collision-origin-y").val()),
              Number(element.find(".components-pick-collision-origin-z").val()),
            ];
            val["size"] = [
              Number(element.find(".components-pick-collision-size-x").val()),
              Number(element.find(".components-pick-collision-size-y").val()),
              Number(element.find(".components-pick-collision-size-z").val()),
            ];
            break;
          default:
            break;
        }
        components["minecraft:pick_collision"] = val;
      }
      element = value_elements.filter(".components_rotation");
      if (element.length) {
        components["minecraft:rotation"] = [
          parseInt(element.find(".components-rotation-x").val(), 10),
          parseInt(element.find(".components-rotation-y").val(), 10),
          parseInt(element.find(".components-rotation-z").val(), 10),
        ];
      }
      element = value_elements.filter(".components_breathability");
      if (element.length) {
        components["minecraft:breathability"] = element.find(".components-breathability").val();
      }
      element = value_elements.filter(".components_block_light_absorption");
      if (element.length) {
        components["minecraft:block_light_absorption"] = parseInt(
          element.find(".components-block-light-absorption").val(),
          10
        );
      }
      element = value_elements.filter(".components_block_light_emission");
      if (element.length) {
        components["minecraft:block_light_emission"] = Number(
          element.find(".components-block-light-emission").val()
        );
      }
      element = value_elements.filter(".components_destroy_time");
      if (element.length) {
        components["minecraft:destroy_time"] = Number(
          element.find(".components-destroy-time").val()
        );
      }
      element = value_elements.filter(".components_explosion_resistance");
      if (element.length) {
        components["minecraft:explosion_resistance"] = Number(
          element.find(".components-explosion-resistance").val()
        );
      }
      element = value_elements.filter(".components_breakonpush");
      if (element.length) {
        components["minecraft:breakonpush"] = element
          .find(".components-breakonpush")
          .is(":checked");
      }
      element = value_elements.filter(".components_immovable");
      if (element.length) {
        components["minecraft:immovable"] = element.find(".components-immovable").is(":checked");
      }
      element = value_elements.filter(".components_onlypistonpush");
      if (element.length) {
        components["minecraft:onlypistonpush"] = element
          .find(".components-onlypistonpush")
          .is(":checked");
      }
      element = value_elements.filter(".components_friction");
      if (element.length) {
        components["minecraft:friction"] = Number(element.find(".components-friction").val());
      }
      element = value_elements.filter(".components_flammable");
      if (element.length) {
        let flammable = new Object();
        flammable["flame_odds"] = parseInt(
          element.find(".components-flammable-flame-odds").val(),
          10
        );
        flammable["burn_odds"] = parseInt(
          element.find(".components-flammable-burn-odds").val(),
          10
        );
        components["minecraft:flammable"] = flammable;
      }
      element = value_elements.filter(".components_event_on_fall_on");
      if (element.length) {
        let content = new Object();
        content["event"] = element.find(".components-event-on-fall-on-event").val();
        let val = element.find(".components-event-on-fall-on-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-on-fall-on-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:on_fall_on"] = content;
      }
      element = value_elements.filter(".components_event_on_interact");
      if (element.length) {
        let content = new Object();
        content["event"] = element.find(".components-event-on-interact-event").val();
        let val = element.find(".components-event-on-interact-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-on-interact-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:on_interact"] = content;
      }
      element = value_elements.filter(".components_event_on_placed");
      if (element.length) {
        let content = new Object();
        content["event"] = element.find(".components-event-on-placed-event").val();
        content["condition"] = element.find(".components-event-on-placed-condition").val();
        let val = element.find(".components-event-on-placed-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:on_placed"] = content;
      }
      element = value_elements.filter(".components_event_on_player_placing");
      if (element.length) {
        let content = new Object();
        content["event"] = element.find(".components-event-on-player-placing-event").val();
        let val = element.find(".components-event-on-player-placing-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-on-player-placing-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:on_player_placing"] = content;
      }
      element = value_elements.filter(".components_event_on_step_on");
      if (element.length) {
        let content = new Object();
        content["event"] = element.find(".components-event-on-step-on-event").val();
        let val = element.find(".components-event-on-step-on-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-on-step-on-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:on_step_on"] = content;
      }
      element = value_elements.filter(".components_event_on_step_off");
      if (element.length) {
        let content = new Object();
        content["event"] = element.find(".components-event-on-step-off-event").val();
        let val = element.find(".components-event-on-step-off-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-on-step-off-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:on_step_off"] = content;
      }
      element = value_elements.filter(".components_event_on_player_destroyed");
      if (element.length) {
        let content = new Object();
        content["event"] = element.find(".components-event-on-player-destroyed-event").val();
        let val = element.find(".components-event-on-player-destroyed-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-on-player-destroyed-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:on_player_destroyed"] = content;
      }
      element = value_elements.filter(".components_event_ticking");
      if (element.length) {
        components["minecraft:ticking"] = new Object();
        let content = new Object();
        content["event"] = element.find(".components-event-ticking-event").val();
        let val = element.find(".components-event-ticking-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-ticking-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:ticking"]["on_tick"] = content;
        components["minecraft:ticking"]["range"] = [
          Number(element.find(".components-event-ticking-range-x").val()),
          Number(element.find(".components-event-ticking-range-z").val()),
        ];
        components["minecraft:ticking"]["looping"] = element
          .find(".components-event-ticking-looping")
          .is(":checked");
      }
      element = value_elements.filter(".components_event_random_ticking");
      if (element.length) {
        components["minecraft:random_ticking"] = new Object();
        let content = new Object();
        content["event"] = element.find(".components-event-random-ticking-event").val();
        let val = element.find(".components-event-random-ticking-condition").val();
        if (val != "") content["condition"] = val;
        val = element.find(".components-event-random-ticking-target").val();
        if (val != "default") content["target"] = val;
        components["minecraft:random_ticking"]["on_tick"] = content;
      }
      break;
    case "1.16.0":
      element = value_elements.filter(".components_loot");
      if (element.length) {
        components["minecraft:loot"] = element.find(".components-loot").val();
      }
      element = value_elements.filter(".components_destroy_time");
      if (element.length) {
        components["minecraft:destroy_time"] = Number(
          element.find(".components-destroy-time").val()
        );
      }
      element = value_elements.filter(".components_explosion_resistance");
      if (element.length) {
        components["minecraft:explosion_resistance"] = Number(
          element.find(".components-explosion-resistance").val()
        );
      }
      element = value_elements.filter(".components_friction");
      if (element.length) {
        components["minecraft:friction"] = Number(element.find(".components-friction").val());
      }
      element = value_elements.filter(".components_flammable");
      if (element.length) {
        let flammable = new Object();
        flammable["flame_odds"] = parseInt(
          element.find(".components-flammable-flame-odds").val(),
          10
        );
        flammable["burn_odds"] = parseInt(
          element.find(".components-flammable-burn-odds").val(),
          10
        );
        components["minecraft:flammable"] = flammable;
      }
      element = value_elements.filter(".components_map_color");
      if (element.length) {
        components["minecraft:map_color"] = element.find(".components-map-color").val();
      }
      element = value_elements.filter(".components_block_light_absorption");
      if (element.length) {
        components["minecraft:block_light_absorption"] = parseInt(
          element.find(".components-block-light-absorption").val(),
          10
        );
      }
      element = value_elements.filter(".components_block_light_emission");
      if (element.length) {
        components["minecraft:block_light_emission"] = Number(
          element.find(".components-block-light-emission").val()
        );
      }
      break;
    case "1.12.0":
      element = value_elements.filter(".components_loot");
      if (element.length) {
        components["minecraft:loot"] = new Object();
        components["minecraft:loot"]["table"] = element.find(".components-loot").val();
      }
      element = value_elements.filter(".components_destroy_time");
      if (element.length) {
        components["minecraft:destroy_time"] = new Object();
        components["minecraft:destroy_time"]["value"] = Number(
          element.find(".components-destroy-time").val()
        );
      }
      element = value_elements.filter(".components_explosion_resistance");
      if (element.length) {
        components["minecraft:explosion_resistance"] = new Object();
        components["minecraft:explosion_resistance"]["value"] = Number(
          element.find(".components-explosion-resistance").val()
        );
      }
      element = value_elements.filter(".components_friction");
      if (element.length) {
        components["minecraft:friction"] = new Object();
        components["minecraft:friction"]["value"] = Number(
          element.find(".components-friction").val()
        );
      }
      element = value_elements.filter(".components_flammable");
      if (element.length) {
        components["minecraft:flammable"] = new Object();
        components["minecraft:flammable"]["flame_odds"] = parseInt(
          element.find(".components-flammable-flame-odds").val(),
          10
        );
        components["minecraft:flammable"]["burn_odds"] = parseInt(
          element.find(".components-flammable-burn-odds").val(),
          10
        );
      }
      element = value_elements.filter(".components_map_color");
      if (element.length) {
        components["minecraft:map_color"] = new Object();
        components["minecraft:map_color"]["color"] = element.find(".components-map-color").val();
      }
      element = value_elements.filter(".components_block_light_absorption");
      if (element.length) {
        components["minecraft:block_light_absorption"] = new Object();
        components["minecraft:block_light_absorption"]["value"] = parseInt(
          element.find(".components-block-light-absorption").val(),
          10
        );
      }
      element = value_elements.filter(".components_block_light_emission");
      if (element.length) {
        components["minecraft:block_light_emission"] = new Object();
        components["minecraft:block_light_emission"]["emission"] = Number(
          element.find(".components-block-light-emission").val()
        );
      }
      break;
    default:
      break;
  }
  return components;
}

/**
 * @param {jQuery} value_elements
 * @return {Object}
 *  */
function getEventResponses(/** @type {jQuery} */ value_elements) {
  let event_responses = new Object();
  let element = value_elements.filter(".event_responses_set_block_property");
  if (element.length) {
    event_responses["set_block_property"] = new Object();
    let states = new Object();
    const element_states = element.find(".event-responses-set-block-state");
    const element_value = element.find(".event-responses-set-block-value");
    for (let index = 0; index < element_states.length; index++) {
      states[
        /** @type {string} */ (element_states.eq(index).val())
      ] = /** @type {string} */ (element_value.eq(index).val());
    }
    event_responses["set_block_property"] = states;
  }
  element = value_elements.filter(".event_responses_set_block");
  if (element.length) {
    let content = new Object();
    const block_type = element.find(".event-responses-set-block").val();
    try {
      if (block_type != "") content["block_type"] = JSON.parse(`{${block_type}}`);
      else content["block_type"] = "";
    } catch (error) {
      content["block_type"] = block_type;
    }
    event_responses["set_block"] = content;
  }
  element = value_elements.filter(".event_responses_set_block_at_pos");
  if (element.length) {
    let content = new Object();
    const block_type = element.find(".event-responses-set-block-at-pos-id").val();
    try {
      if (block_type != "") content["block_type"] = JSON.parse(`{${block_type}}`);
      else content["block_type"] = "";
    } catch (error) {
      content["block_type"] = block_type;
    }
    content["block_offset"] = [
      Number(element.find(".event-responses-set-block-at-pos-position-x").val()),
      Number(element.find(".event-responses-set-block-at-pos-position-y").val()),
      Number(element.find(".event-responses-set-block-at-pos-position-z").val()),
    ];
    event_responses["set_block_at_pos"] = content;
  }
  element = value_elements.filter(".event_responses_spawn_loot");
  if (element.length) {
    event_responses["spawn_loot"] = new Object();
    event_responses["spawn_loot"]["table"] = element.find(".event-responses-spawn-loot").val();
  }
  element = value_elements.filter(".event_responses_add_mob_effect");
  if (element.length) {
    let content = new Object();
    content["effect"] = element.find(".event-responses-add-mob-effect-id").val();
    content["amplifier"] = Number(element.find(".event-responses-add-mob-effect-amplifier").val());
    content["duration"] = Number(element.find(".event-responses-add-mob-effect-duration").val());
    if (element.find(".event-responses-add-mob-effect-target").val() != "default") {
      content["target"] = element.find(".event-responses-add-mob-effect-target").val();
    }
    event_responses["add_mob_effect"] = content;
  }
  element = value_elements.filter(".event_responses_remove_mob_effect");
  if (element.length) {
    let content = new Object();
    content["effect"] = element.find(".event-responses-remove-mob-effect-id").val();
    if (element.find(".event-responses-remove-mob-effect-target").val() != "default") {
      content["target"] = element.find(".event-responses-remove-mob-effect-target").val();
    }
    event_responses["remove_mob_effect"] = content;
  }
  element = value_elements.filter(".event_responses_damage");
  if (element.length) {
    let content = new Object();
    content["type"] = element.find(".event-responses-damage-type").val();
    content["amount"] = element.find(".event-responses-damage-amount").val();
    if (element.find(".event-responses-damage-target").val() != "default") {
      content["target"] = element.find(".event-responses-damage-target").val();
    }
    event_responses["damage"] = content;
  }
  element = value_elements.filter(".event_responses_decrement_stack");
  if (element.length) {
    let content = new Object();
    content["ignore_game_mode"] = element
      .find(".event-responses-decrement-stack-ignore-game-mode")
      .is(":checked");
    event_responses["decrement_stack"] = content;
  }
  element = value_elements.filter(".event_responses_die");
  if (element.length) {
    let content = new Object();
    if (element.find(".event-responses-die-target").val() != "default") {
      content["target"] = element.find(".event-responses-die-target").val();
    }
    event_responses["die"] = content;
  }
  element = value_elements.filter(".event_responses_play_effect");
  if (element.length) {
    let content = new Object();
    content["effect"] = element.find(".event-responses-play-effect-id").val();
    content["data"] = element.find(".event-responses-play-effect-data").val();
    if (element.find(".event-responses-play-effect-target").val() != "default") {
      content["target"] = element.find(".event-responses-play-effect-target").val();
    }
    event_responses["play_effect"] = content;
  }
  element = value_elements.filter(".event_responses_play_sound");
  if (element.length) {
    let content = new Object();
    content["sound"] = element.find(".event-responses-play-sound-id").val();
    if (element.find(".event-responses-play-sound-target").val() != "default") {
      content["target"] = element.find(".event-responses-play-sound-target").val();
    }
    event_responses["play_sound"] = content;
  }
  element = value_elements.filter(".event_responses_teleport");
  if (element.length) {
    let content = new Object();
    content["destination"] = [
      Number(element.find(".event-responses-teleport-destination-x").val()),
      Number(element.find(".event-responses-teleport-destination-y").val()),
      Number(element.find(".event-responses-teleport-destination-z").val()),
    ];
    content["max_range"] = [
      Number(element.find(".event-responses-teleport-max-range-x").val()),
      Number(element.find(".event-responses-teleport-max-range-y").val()),
      Number(element.find(".event-responses-teleport-max-range-z").val()),
    ];
    content["avoid_water"] = element.find(".event-responses-teleport-avoid_water").is(":checked");
    content["land_on_block"] = element
      .find(".event-responses-teleport-land-on-block")
      .is(":checked");
    if (element.find(".event-responses-teleport-target").val() != "default") {
      content["target"] = element.find(".event-responses-teleport-target").val();
    }
    event_responses["teleport"] = content;
  }
  element = value_elements.filter(".event_responses_transform_item");
  if (element.length) {
    event_responses["transform_item"]["transform"] = element
      .find(".event-responses-transform-item-id")
      .val();
  }
  element = value_elements.filter(".event_responses_trigger");
  if (element.length) {
    let content = new Object();
    content["event"] = element.find(".event-responses-trigger-event").val();
    let val = element.find(".event-responses-trigger-condition").val();
    if (val != "") content["condition"] = val;
    val = element.find(".event-responses-trigger-target").val();
    if (val != "default") content["target"] = val;
    event_responses["trigger"] = content;
  }
  element = value_elements.filter(".event_responses_run_command");
  if (element.length) {
    let content = new Object();
    const command = element.find(".event-responses-run-command");
    const command_len = command.length;
    let command_array = new Array();
    for (let index = 0; index < command_len; index++) {
      const val = command.eq(index).val();
      if (val != "") command_array.push(val);
    }
    content["command"] = command_array;
    if (element.find(".event-responses-run-command-target").val() != "default") {
      content["target"] = element.find(".event-responses-run-command-target").val();
    }
    event_responses["run_command"] = content;
  }
  element = value_elements.filter(".event_responses_swing");
  if (element.length) event_responses["swing"] = new Object();
  element = value_elements.filter(".event_responses_sequence");
  if (element.length) {
    const container = element.closestOpposite(".tab-contents").children(".tab-container");
    const container_len = container.length;
    let content = new Array();
    for (let index = 0; index < container_len; index++) {
      content.push(
        getEventResponses(container.eq(index).children(".editor-element-body").children())
      );
    }
    event_responses["sequence"] = content;
  }
  element = value_elements.filter(".event_responses_randomize");
  if (element.length) {
    const container = element.closestOpposite(".tab-contents").children(".tab-container");
    const container_len = container.length;
    let content = new Array();
    for (let index = 0; index < container_len; index++) {
      let data = getEventResponses(container.eq(index).children(".editor-element-body").children());
      data["weight"] = Number(element.find(".event-responses-randomize-weight").val());
      content.push(data);
    }
    event_responses["randomize"] = content;
  }
  return event_responses;
}

/**
 * @param {jQuerySelector} selector - selector
 * @return {!jQuery}
 * @this {jQuery}
 */
$.fn.closestOpposite = function (selector) {
  // 1階層下の子要素を取得
  let children = this.children();
  // 子要素がないときは探索終了
  if (children.length === 0) return $();
  // 現在の要素が探索するクラス名を持っていたとき
  if (this.filter(selector).length) {
    return this.filter(selector);
  }
  // それ以外のときはさらに下層を再帰的に探索
  return children.closestOpposite(selector);
};

/** エラー時のテキスト
 * @param {string} json
 * @param {string} message
 * @return {string}
 */
function getErrorText(json = "", message = "") {
  let messageText = "有効なjsonではありません。";
  // 空白の場合は何も付け足さない
  if (json == "" || message == "") return messageText;
  const splitText = message.split(" ");
  const lineIndex = splitText.findIndex((element) => element == "line");
  const positionIndex = splitText.findIndex((element) => element == "position");
  const getBeginningOfLineIndex = (maxLine) => {
    let lastIndex = 0;
    for (let i = 1; i < maxLine; i++) {
      lastIndex = json.indexOf("\n", lastIndex) + 1;
    }
    return lastIndex;
  };
  if (lineIndex != -1 || positionIndex != -1) {
    const line =
      lineIndex != -1
        ? parseInt(splitText[lineIndex + 1], 10)
        : json.substring(0, parseInt(splitText[positionIndex + 1], 10)).match(/\n/g).length + 1;
    const prevLineIndex = getBeginningOfLineIndex(line - 1);
    const LineLastIndex = getBeginningOfLineIndex(line + 1) - 1;
    messageText += `\n${line - 1}~${line}行で問題が発生しました。\n${json.substring(
      prevLineIndex,
      LineLastIndex
    )}`;
  }
  return messageText;
}

/** jsonデータ取り出し */
function setJSONData(json_text = "") {
  let json_data;
  try {
    json_data = JSON.parse(json_text);
  } catch (e) {
    window.alert(getErrorText(json_text, e.message));
    console.error("error:" + e);
    return;
  }

  if (json_data["format_version"] != null) {
    format_version = json_data["format_version"];
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
  if (description["is_experimental"] != null) {
    $("#description-is-experimental").prop("checked", description["is_experimental"]);
  }
  if (description["register_to_creative-menu"] != null) {
    $("#description-register-to-creative-menu").prop(
      "checked",
      description["register_to_creative-menu"]
    );
  }
  if (description["properties"] != null) {
    const keys = Object.keys(description["properties"]);
    for (let index = 0; index < keys.length; index++) {
      addBlockState();
      const block_content = $(".blockState.status-block-content").eq(index);
      block_content.find(".blockState-name").val(keys[index]);
      const states = description["properties"][keys[index]];
      switch (typeof states[0]) {
        case "number":
          block_content.find(".blockState-type").val("val_Integer");
          for (let states_index = 0; states_index < states.length; states_index++) {
            if (states_index != 0)
              addArrayElement(block_content.find(".switchable-element.val_Integer .value-input"));
            block_content.find(".blockState-integer").eq(states_index).val(states[states_index]);
          }
          break;
        case "string":
          block_content.find(".blockState-type").val("val_String");
          for (let states_index = 0; states_index < states.length; states_index++) {
            if (states_index != 0)
              addArrayElement(block_content.find(".switchable-element.val_String .value-input"));
            block_content.find(".blockState-string").eq(states_index).val(states[states_index]);
          }
          break;
        case "boolean":
        default:
          block_content.find(".blockState-type").val("val_Boolean");
          block_content.find(".blockState-boolean").prop("checked", states[0]);
          break;
      }
    }
  }
  // blockState

  // components
  setComponents(
    $("#editor-main>:last-child"),
    format_version,
    json_data["minecraft:block"]["components"]
  );

  // Event
  if (json_data["minecraft:block"]["events"] != null) {
    const keys = Object.keys(json_data["minecraft:block"]["events"]);
    for (let index = 0; index < keys.length; index++) {
      addEvent();
      $(".event-name").eq(index).val(keys[index]);
      setEventResponses(
        $(".event.status-block-content").eq(index),
        json_data["minecraft:block"]["events"][keys[index]]
      );
    }
  }

  // Permutation
  if (json_data["minecraft:block"]["permutations"] != null) {
    const permutations = json_data["minecraft:block"]["permutations"];
    for (let index = 0; index < permutations.length; index++) {
      addBlockTabElement($("#editor-permutations .permutations.block-tabPanel"));
      if (permutations[index]["condition"] != null) {
        $(".permutations_condition").eq(index).val(permutations[index]["condition"]);
      }
      setComponents(
        $(".permutations.block-tab-container").eq(index).find(".editor-element:last-child"),
        format_version,
        permutations[index]["components"]
      );
    }
  }

  onChangedJSON();
}

/**
 * @param {jQuery} element_scope -.editor-element を返す
 * @param {string} version
 * @param {!Object} import_data - 元json
 */
function setComponents(element_scope, version, import_data = new Object()) {
  const element_control = element_scope
    .closestOpposite(".editor-element-footer.element-control .modal-body")
    .children();
  const value_elements = element_scope.closestOpposite(".editor-element-body");

  switch (version) {
    case "1.16.100":
      let is_exist = import_data["minecraft:loot"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_loot")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_loot")
          .find(".components-loot")
          .val(import_data["minecraft:loot"]);
      }
      is_exist = import_data["minecraft:display_name"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_display_name")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_display_name")
          .find(".components-display-name")
          .val(import_data["minecraft:display_name"]);
      }
      const tags = /** @type {Array<string>} */ ((() => {
        return import_data != undefined
          ? Object.keys(import_data).filter((val) => {
              return val.match(/^tag:/g) != null;
            })
          : [];
      })());
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_tag")
          .find(".element-control-switch")
          .prop("checked", tags.length))
      );
      if (tags.length) {
        const inner_element = value_elements.children(".components_tag");
        for (let index = 0; index < tags.length; index++) {
          if (index != 0) addArrayElement(inner_element.find(".value-input"));
          inner_element.find(".components-tag").eq(index).val(tags[index].replace(/^tag:/g, ""));
        }
      }
      is_exist = import_data["minecraft:placement_filter"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_placement_filter")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:placement_filter"]["conditions"];
        const inner_element = value_elements.children(".components_placement_filter");
        for (let index = 0; index < inner_json.length; index++) {
          const condition = inner_json[index];
          if (condition["allowed_faces"] != null) {
            for (
              let condition_index = 0;
              condition_index < condition["allowed_faces"].length;
              condition_index++
            ) {
              if (condition_index != 0) addTabElement(inner_element.find(".tabpanel"));
              const inner_condition = condition[condition_index];
              if (inner_condition["allowed_faces"] != null) {
                inner_element
                  .find(".components-placement-filter-allowed-faces")
                  .eq(condition_index)
                  .val(inner_condition["allowed_faces"]);
              }
              if (inner_condition["block_filter"] != null) {
                inner_element
                  .find(".components-placement-filter-block-filter")
                  .eq(condition_index)
                  .val(inner_condition["block_filter"]);
              }
            }
          }
        }
      }
      is_exist = import_data["minecraft:preventsjumping"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_preventsjumping")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_preventsjumping")
          .find(".components-preventsJumping")
          .prop("checked", import_data["minecraft:preventsjumping"]);
      }
      is_exist = import_data["minecraft:unwalkable"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_unwalkable")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_unwalkable")
          .find(".components-unwalkable")
          .prop("checked", import_data["minecraft:unwalkable"]);
      }
      is_exist = import_data["minecraft:map_color"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_map_color")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_map_color")
          .find(".components-map-color")
          .val(import_data["minecraft:map_color"]);
      }
      is_exist = import_data["minecraft:crafting_table"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_crafting_table")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_element = value_elements.children(".components_crafting_table");
        let json_content = import_data["minecraft:crafting_table"]["grid_size"];
        if (json_content != null) {
          inner_element.find(".components-crafting-table-grid-size").val(json_content);
        }
        json_content = import_data["minecraft:crafting_table"]["crafting_tags"];
        if (json_content != null) {
          for (let index = 0; index < json_content.length; index++) {
            if (index != 0)
              addArrayElement(
                inner_element
                  .find(".components-crafting-table-crafting-tags")
                  .closest(".value-input")
              );
            inner_element
              .find(".components-crafting-table-crafting-tags")
              .eq(index)
              .val(json_content[index]);
          }
        }
        json_content = import_data["custom_description"];
        if (json_content != null) {
          inner_element.find(".components-crafting-table-custom-description").val(json_content);
        }
      }
      is_exist =
        import_data["minecraft:geometry"] != null || import_data["minecraft:unit_cube"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_geometry")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_element = value_elements.children(".components_geometry");
        if (import_data["minecraft:geometry"] != null) {
          // geometryある
          inner_element.find(".components-geometry-switch").val("val_geometry");
          inner_element.find(".components-geometry").val(import_data["minecraft:geometry"]);
        } else {
          inner_element.find(".components-geometry-switch").val("val_cube");
        }
      }
      is_exist = import_data["minecraft:material_instances"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_material_instances")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_element = value_elements.children(".components_material_instances");
        const key = Object.keys(import_data["minecraft:material_instances"]);
        for (let index = 0; index < key.length; index++) {
          if (index != 0) addArrayElement(inner_element.closestOpposite(".value-input"));
          const key_name = key[index];
          inner_element.find(".components-material-instances-face").eq(index).val(key_name);
          let json_content = import_data["minecraft:material_instances"][key_name]["texture"];
          if (json_content != null) {
            inner_element
              .find(".components-material-instances-texture")
              .eq(index)
              .val(json_content);
          }
          json_content = import_data["minecraft:material_instances"][key_name]["render_method"];
          if (json_content != null) {
            inner_element
              .find(".components-material-instances-material")
              .eq(index)
              .val(json_content);
          }
        }
      }
      is_exist = import_data["minecraft:entity_collision"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_entity_collision")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const json_inner = import_data["minecraft:entity_collision"];
        const element_inner = value_elements.children(".components_entity_collision");
        if (typeof json_inner == "boolean") {
          element_inner.find(".components-entity-collision-switch").val("val_simple");
          element_inner.find(".components-entity-collision-simple").prop("checked", json_inner);
        } else {
          element_inner.find(".components-entity-collision-switch").val("val_details");
          let json_content = json_inner["origin"];
          if (json_content != null) {
            element_inner.find(".components-entity-collision-origin-x").val(json_content[0]);
            element_inner.find(".components-entity-collision-origin-y").val(json_content[1]);
            element_inner.find(".components-entity-collision-origin-z").val(json_content[2]);
          }
          json_content = json_inner["size"];
          if (json_content != null) {
            element_inner.find(".components-entity-collision-size-x").val(json_content[0]);
            element_inner.find(".components-entity-collision-size-y").val(json_content[1]);
            element_inner.find(".components-entity-collision-size-z").val(json_content[2]);
          }
        }
      }
      is_exist = import_data["minecraft:pick_collision"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_pick_collision")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const json_inner = import_data["minecraft:pick_collision"];
        const element_inner = value_elements.children(".components_pick_collision");
        if (typeof json_inner == "boolean") {
          element_inner.find(".components-pick-collision-switch").val("val_simple");
          element_inner.find(".components-pick-collision-simple").prop("checked", json_inner);
        } else {
          element_inner.find(".components-pick-collision-switch").val("val_details");
          let json_content = json_inner["origin"];
          if (json_content != null) {
            element_inner.find(".components-pick-collision-origin-x").val(json_content[0]);
            element_inner.find(".components-pick-collision-origin-y").val(json_content[1]);
            element_inner.find(".components-pick-collision-origin-z").val(json_content[2]);
          }
          json_content = json_inner["size"];
          if (json_content != null) {
            element_inner.find(".components-pick-collision-size-x").val(json_content[0]);
            element_inner.find(".components-pick-collision-size-y").val(json_content[1]);
            element_inner.find(".components-pick-collision-size-z").val(json_content[2]);
          }
        }
      }
      is_exist = import_data["minecraft:rotation"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_rotation")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_rotation")
          .find(".components-rotation-x")
          .val(import_data["minecraft:rotation"][0]);
        value_elements
          .children(".components_rotation")
          .find(".components-rotation-y")
          .val(import_data["minecraft:rotation"][1]);
        value_elements
          .children(".components_rotation")
          .find(".components-rotation-z")
          .val(import_data["minecraft:rotation"][2]);
      }
      is_exist = import_data["minecraft:breathability"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_breathability")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_breathability")
          .find(".components-breathability")
          .val(import_data["minecraft:breathability"]);
      }
      is_exist = import_data["minecraft:block_light_absorption"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_block_light_absorption")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_block_light_absorption")
          .find(".components-block-light-absorption")
          .val(import_data["minecraft:block_light_absorption"]);
      }
      is_exist = import_data["minecraft:block_light_emission"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_block_light_emission")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_block_light_emission")
          .find(".components-block-light-emission")
          .val(import_data["minecraft:block_light_emission"]);
      }
      is_exist = import_data["minecraft:destroy_time"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_destroy_time")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_destroy_time")
          .find(".components-destroy-time")
          .val(import_data["minecraft:destroy_time"]);
      }
      is_exist = import_data["minecraft:explosion_resistance"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_explosion_resistance")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_explosion_resistance")
          .find(".components-explosion-resistance")
          .val(import_data["minecraft:explosion_resistance"]);
      }
      is_exist = import_data["minecraft:breakonpush"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_breakonpush")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_breakonpush")
          .find(".components-breakonpush")
          .prop("checked", import_data["minecraft:breakonpush"]);
      }
      is_exist = import_data["minecraft:immovable"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_immovable")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_immovable")
          .find(".components-immovable")
          .prop("checked", import_data["minecraft:immovable"]);
      }
      is_exist = import_data["minecraft:onlypistonpush"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_onlypistonpush")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_onlypistonpush")
          .find(".components-onlypistonpush")
          .prop("checked", import_data["minecraft:onlypistonpush"]);
      }
      is_exist = import_data["minecraft:friction"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_friction")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_friction")
          .find(".components-friction")
          .val(import_data["minecraft:friction"]);
      }
      is_exist = import_data["minecraft:flammable"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_flammable")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:flammable"];
        const inner_element = value_elements.children(".components_flammable");
        if (inner_json["flame_odds"] != null) {
          inner_element.find(".components-flammable-flame-odds").val(inner_json["flame_odds"]);
        }
        if (inner_json["burn_odds"] != null) {
          inner_element.find(".components-flammable-burn-odds").val(inner_json["burn_odds"]);
        }
      }
      is_exist = import_data["minecraft:on_fall_on"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_on_fall_on")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:on_fall_on"];
        const inner_element = value_elements.children(".components_event_on_fall_on");
        if (inner_json["event"] != null) {
          inner_element.find(".components-event-on-fall-on-event").val(inner_json["event"]);
        }
        if (inner_json["condition"] != null) {
          inner_element.find(".components-event-on-fall-on-condition").val(inner_json["condition"]);
        }
        if (inner_json["target"] != null) {
          inner_element.find(".components-event-on-fall-on-target").val(inner_json["target"]);
        }
      }
      is_exist = import_data["minecraft:on_interact"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_on_interact")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:on_interact"];
        const inner_element = value_elements.children(".components_event_on_interact");
        if (inner_json["event"] != null) {
          inner_element.find(".components-event-on-interact-event").val(inner_json["event"]);
        }
        if (inner_json["condition"] != null) {
          inner_element
            .find(".components-event-on-interact-condition")
            .val(inner_json["condition"]);
        }
        if (inner_json["target"] != null) {
          inner_element.find(".components-event-on-interact-target").val(inner_json["target"]);
        }
      }
      is_exist = import_data["minecraft:on_placed"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_on_placed")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:on_placed"];
        const inner_element = value_elements.children(".components_event_on_placed");
        if (inner_json["event"] != null) {
          inner_element.find(".components-event-on-placed-event").val(inner_json["event"]);
        }
        if (inner_json["condition"] != null) {
          inner_element.find(".components-event-on-placed-condition").val(inner_json["condition"]);
        }
        if (inner_json["target"] != null) {
          inner_element.find(".components-event-on-placed-target").val(inner_json["target"]);
        }
      }
      is_exist = import_data["minecraft:on_player_placing"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_on_player_placing")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:on_player_placing"];
        const inner_element = value_elements.children(".components_event_on_player_placing");
        if (inner_json["event"] != null) {
          inner_element.find(".components-event-on-player-placing-event").val(inner_json["event"]);
        }
        if (inner_json["condition"] != null) {
          inner_element
            .find(".components-event-on-player-placing-condition")
            .val(inner_json["condition"]);
        }
        if (inner_json["target"] != null) {
          inner_element
            .find(".components-event-on-player-placing-target")
            .val(inner_json["target"]);
        }
      }
      is_exist = import_data["minecraft:on_step_on"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_on_step_on")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:on_step_on"];
        const inner_element = value_elements.children(".components_event_on_step_on");
        if (inner_json["event"] != null) {
          inner_element.find(".components-event-on-step-on-event").val(inner_json["event"]);
        }
        if (inner_json["condition"] != null) {
          inner_element.find(".components-event-on-step-on-condition").val(inner_json["condition"]);
        }
        if (inner_json["target"] != null) {
          inner_element.find(".components-event-on-step-on-target").val(inner_json["target"]);
        }
      }
      is_exist = import_data["minecraft:on_step_off"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_on_step_off")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:on_step_off"];
        const inner_element = value_elements.children(".components_event_on_step_off");
        if (inner_json["event"] != null) {
          inner_element.find(".components-event-on-step-off-event").val(inner_json["event"]);
        }
        if (inner_json["condition"] != null) {
          inner_element
            .find(".components-event-on-step-off-condition")
            .val(inner_json["condition"]);
        }
        if (inner_json["target"] != null) {
          inner_element.find(".components-event-on-step-off-target").val(inner_json["target"]);
        }
      }
      is_exist = import_data["minecraft:on_player_destroyed"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_on_player_destroyed")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:on_player_destroyed"];
        const inner_element = value_elements.children(".components_event_on_player_destroyed");
        if (inner_json["event"] != null) {
          inner_element
            .find(".components-event-on-player-destroyed-event")
            .val(inner_json["event"]);
        }
        if (inner_json["condition"] != null) {
          inner_element
            .find(".components-event-on-player-destroyed-condition")
            .val(inner_json["condition"]);
        }
        if (inner_json["target"] != null) {
          inner_element
            .find(".components-event-on-player-destroyed-target")
            .val(inner_json["target"]);
        }
      }
      is_exist = import_data["minecraft:ticking"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_ticking")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:ticking"];
        const inner_element = value_elements.children(".components_event_ticking");
        if (inner_json["on_tick"] != null) {
          if (inner_json["on_tick"]["event"] != null) {
            inner_element
              .find(".components-event-ticking-event")
              .val(inner_json["on_tick"]["event"]);
          }
          if (inner_json["on_tick"]["condition"] != null) {
            inner_element
              .find(".components-event-ticking-condition")
              .val(inner_json["on_tick"]["condition"]);
          }
          if (inner_json["on_tick"]["target"] != null) {
            inner_element
              .find(".components-event-ticking-target")
              .val(inner_json["on_tick"]["target"]);
          }
        }
        if (inner_json["range"] != null) {
          inner_element.find(".components-event-ticking-range-x").val(inner_json["range"][0]);
          inner_element.find(".components-event-ticking-range-z").val(inner_json["range"][1]);
        }
        if (inner_json["looping"] != null) {
          inner_element.find(".components-event-ticking-looping").val(inner_json["looping"]);
        }
      }
      is_exist = import_data["minecraft:random_ticking"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_event_random_ticking")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:random_ticking"];
        const inner_element = value_elements.children(".components_event_random_ticking");
        if (inner_json["on_tick"] != null) {
          if (inner_json["on_tick"]["event"] != null) {
            inner_element
              .find(".components-event-random-ticking-event")
              .val(inner_json["on_tick"]["event"]);
          }
          if (inner_json["on_tick"]["condition"] != null) {
            inner_element
              .find(".components-event-random-ticking-condition")
              .val(inner_json["on_tick"]["condition"]);
          }
          if (inner_json["on_tick"]["target"] != null) {
            inner_element
              .find(".components-event-random-ticking-target")
              .val(inner_json["on_tick"]["target"]);
          }
        }
      }
      break;
    case "1.16.0":
      is_exist = import_data["minecraft:loot"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_loot")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_loot")
          .find(".components-loot")
          .val(import_data["minecraft:loot"]);
      }
      is_exist = import_data["minecraft:map_color"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_map_color")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_map_color")
          .find(".components-map-color")
          .val(import_data["minecraft:map_color"]);
      }
      is_exist = import_data["minecraft:block_light_absorption"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_block_light_absorption")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_block_light_absorption")
          .find(".components-block-light-absorption")
          .val(import_data["minecraft:block_light_absorption"]);
      }
      is_exist = import_data["minecraft:block_light_emission"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_block_light_emission")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_block_light_emission")
          .find(".components-block-light-emission")
          .val(import_data["minecraft:block_light_emission"]);
      }
      is_exist = import_data["minecraft:destroy_time"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_destroy_time")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_destroy_time")
          .find(".components-destroy-time")
          .val(import_data["minecraft:destroy_time"]);
      }
      is_exist = import_data["minecraft:explosion_resistance"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_explosion_resistance")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_explosion_resistance")
          .find(".components-explosion-resistance")
          .val(import_data["minecraft:explosion_resistance"]);
      }
      is_exist = import_data["minecraft:friction"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_friction")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_friction")
          .find(".components-friction")
          .val(import_data["minecraft:friction"]);
      }
      is_exist = import_data["minecraft:flammable"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_flammable")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:flammable"];
        const inner_element = value_elements.children(".components_flammable");
        if (inner_json["flame_odds"] != null) {
          inner_element.find(".components-flammable-flame-odds").val(inner_json["flame_odds"]);
        }
        if (inner_json["burn_odds"] != null) {
          inner_element.find(".components-flammable-burn-odds").val(inner_json["burn_odds"]);
        }
      }
      break;
    case "1.12.0":
      is_exist = import_data["minecraft:loot"]["table"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_loot")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_loot")
          .find(".components-loot")
          .val(import_data["minecraft:loot"]["table"]);
      }
      is_exist = import_data["minecraft:map_color"]["color"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_map_color")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_map_color")
          .find(".components-map-color")
          .val(import_data["minecraft:map_color"]["color"]);
      }
      is_exist = import_data["minecraft:block_light_absorption"]["value"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_block_light_absorption")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_block_light_absorption")
          .find(".components-block-light-absorption")
          .val(import_data["minecraft:block_light_absorption"]["value"]);
      }
      is_exist = import_data["minecraft:block_light_emission"]["emission"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_block_light_emission")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_block_light_emission")
          .find(".components-block-light-emission")
          .val(import_data["minecraft:block_light_emission"]["emission"]);
      }
      is_exist = import_data["minecraft:destroy_time"]["value"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_destroy_time")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_destroy_time")
          .find(".components-destroy-time")
          .val(import_data["minecraft:destroy_time"]["value"]);
      }
      is_exist = import_data["minecraft:explosion_resistance"]["value"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_explosion_resistance")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_explosion_resistance")
          .find(".components-explosion-resistance")
          .val(import_data["minecraft:explosion_resistance"]["value"]);
      }
      is_exist = import_data["minecraft:friction"]["value"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_friction")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        value_elements
          .children(".components_friction")
          .find(".components-friction")
          .val(import_data["minecraft:friction"]["value"]);
      }
      is_exist = import_data["minecraft:flammable"] != null;
      changeElement(
        /** @type {jQuery} */ (element_control
          .filter(".components_flammable")
          .find(".element-control-switch")
          .prop("checked", is_exist))
      );
      if (is_exist) {
        const inner_json = import_data["minecraft:flammable"];
        const inner_element = value_elements.children(".components_flammable");
        if (inner_json["flame_odds"] != null) {
          inner_element.find(".components-flammable-flame-odds").val(inner_json["flame_odds"]);
        }
        if (inner_json["burn_odds"] != null) {
          inner_element.find(".components-flammable-burn-odds").val(inner_json["burn_odds"]);
        }
      }
      break;
    default:
      break;
  }
}

/**
 * @param {jQuery} element_scope
 * @param {!Object} json_data
 */
function setEventResponses(element_scope, json_data) {
  const element_control = element_scope
    .closestOpposite(".editor-element-footer.element-control .modal-body")
    .children();
  const value_elements = element_scope.closestOpposite(".editor-element-body");

  let is_exist = json_data["set_block_property"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_set_block_property")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_element = value_elements.children(".event_responses_set_block_property");
    const keys = Object.keys(json_data["set_block_property"]);
    for (let index = 0; index < keys.length; index++) {
      if (index != 0)
        addArrayElement(inner_element.closestOpposite(".value-input.type-array-modal"));
      const key = keys[index];
      inner_element.find(".event-responses-set-block-state").eq(index).val(key);
      inner_element
        .find(".event-responses-set-block-value")
        .eq(index)
        .val(json_data["set_block_property"][key]);
    }
  }
  is_exist = json_data["set_block"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_set_block")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const block_type = json_data["set_block"]["block_type"];
    if (block_type != null) {
      value_elements
        .children(".event_responses_set_block")
        .find(".event-responses-set-block")
        .val(
          typeof block_type == "object"
            ? JSON.stringify(block_type).replace(/^\{|\}$/g, "")
            : block_type
        );
    }
  }
  is_exist = json_data["set_block_at_pos"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_set_block_at_pos")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_element = value_elements.children(".event_responses_set_block_at_pos");
    const inner_json = json_data["set_block_at_pos"];
    const block_type = inner_json["block_type"];
    if (block_type != null) {
      inner_element
        .find(".event-responses-set-block-at-pos-id")
        .val(
          typeof block_type == "object"
            ? JSON.stringify(block_type).replace(/^\{|\}$/g, "")
            : block_type
        );
    }
    if (inner_json["block_offset"] != null) {
      inner_element
        .find(".event-responses-set-block-at-pos-position-x")
        .val(inner_json["block_offset"][0]);
      inner_element
        .find(".event-responses-set-block-at-pos-position-y")
        .val(inner_json["block_offset"][1]);
      inner_element
        .find(".event-responses-set-block-at-pos-position-z")
        .val(inner_json["block_offset"][2]);
    }
  }
  is_exist = json_data["spawn_loot"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_spawn_loot")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    if (json_data["spawn_loot"]["table"] != null)
      value_elements
        .children(".event_responses_spawn_loot")
        .find(".event-responses-spawn-loot")
        .val(json_data["spawn_loot"]["table"]);
  }
  is_exist = json_data["add_mob_effect"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_add_mob_effect")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["add_mob_effect"];
    const inner_element = value_elements.children(".event_responses_add_mob_effect");
    if (inner_json["effect"] != null)
      inner_element.find(".event-responses-add-mob-effect-id").val(inner_json["effect"]);
    if (inner_json["amplifier"] != null)
      inner_element.find(".event-responses-add-mob-effect-amplifier").val(inner_json["amplifier"]);
    if (inner_json["duration"] != null)
      inner_element.find(".event-responses-add-mob-effect-duration").val(inner_json["duration"]);
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-add-mob-effect-target").val(inner_json["target"]);
  }
  is_exist = json_data["remove_mob_effect"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_remove_mob_effect")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["remove_mob_effect"];
    const inner_element = value_elements.children(".event_responses_remove_mob_effect");
    if (inner_json["effect"] != null)
      inner_element.find(".event-responses-remove-mob-effect-id").val(inner_json["effect"]);
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-remove-mob-effect-target").val(inner_json["target"]);
  }
  is_exist = json_data["damage"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_damage")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["damage"];
    const inner_element = value_elements.children(".event_responses_damage");
    if (inner_json["effect"] != null)
      inner_element.find(".event-responses-damage-type").val(inner_json["effect"]);
    if (inner_json["amount"] != null)
      inner_element.find(".event-responses-damage-amount").val(inner_json["amount"]);
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-damage-target").val(inner_json["target"]);
  }
  is_exist = json_data["decrement_stack"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_decrement_stack")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["decrement_stack"];
    if (inner_json["ignore_game_mode"] != null)
      value_elements
        .children(".event_responses_decrement_stack")
        .find(".event-responses-decrement-stack-ignore-game-mode")
        .prop("checked", inner_json["ignore_game_mode"]);
  }
  is_exist = json_data["die"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_die")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["die"];
    if (inner_json["target"] != null)
      value_elements
        .children(".event_responses_die")
        .find(".event-responses-die-target")
        .val(inner_json["target"]);
  }
  is_exist = json_data["play_effect"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_play_effect")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["play_effect"];
    const inner_element = value_elements.children(".event_responses_play_effect");
    if (inner_json["effect"] != null)
      inner_element.find(".event-responses-play-effect-id").val(inner_json["effect"]);
    if (inner_json["data"] != null)
      inner_element.find(".event-responses-play-effect-data").val(inner_json["data"]);
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-play-effect-target").val(inner_json["target"]);
  }
  is_exist = json_data["play_sound"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_play_sound")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["play_sound"];
    const inner_element = value_elements.children(".event_responses_play_sound");
    if (inner_json["sound"] != null)
      inner_element.find(".event-responses-play-sound-id").val(inner_json["sound"]);
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-play-sound-target").val(inner_json["target"]);
  }
  is_exist = json_data["teleport"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_teleport")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["teleport"];
    const inner_element = value_elements.children(".event_responses_teleport");
    if (inner_json["destination"] != null) {
      inner_element
        .find(".event-responses-teleport-destination-x")
        .val(inner_json["destination"][0]);
      inner_element
        .find(".event-responses-teleport-destination-y")
        .val(inner_json["destination"][1]);
      inner_element
        .find(".event-responses-teleport-destination-z")
        .val(inner_json["destination"][2]);
    }
    if (inner_json["max_range"] != null) {
      inner_element.find(".event-responses-teleport-max-range-x").val(inner_json["max_range"][0]);
      inner_element.find(".event-responses-teleport-max-range-y").val(inner_json["max_range"][1]);
      inner_element.find(".event-responses-teleport-max-range-z").val(inner_json["max_range"][2]);
    }
    if (inner_json["avoid_water"] != null)
      inner_element.find(".event-responses-teleport-avoid_water").val(inner_json["avoid_water"]);
    if (inner_json["land_on_block"] != null)
      inner_element
        .find(".event-responses-teleport-land-on-block")
        .val(inner_json["land_on_block"]);
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-teleport-target").val(inner_json["target"]);
  }
  is_exist = json_data["transform_item"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_transform_item")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["transform_item"];
    if (inner_json["transform"] != null)
      value_elements
        .children(".event_responses_transform_item")
        .find(".event-responses-transform-item-id")
        .val(inner_json["transform"]);
  }
  is_exist = json_data["trigger"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_trigger")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["trigger"];
    const inner_element = value_elements.children(".event_responses_trigger");
    if (inner_json["event"] != null)
      inner_element.find(".event-responses-trigger-event").val(inner_json["event"]);
    if (inner_json["condition"] != null)
      inner_element.find(".event-responses-trigger-condition").val(inner_json["condition"]);
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-trigger-target").val(inner_json["target"]);
  }
  is_exist = json_data["run_command"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_run_command")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["run_command"];
    const inner_element = value_elements.children(".event_responses_run_command");
    if (inner_json["command"] != null) {
      const commands = inner_json["command"];
      for (let index = 0; index < commands.length; index++) {
        if (index != 0) addArrayElement(inner_element.find(".value-input.type-array-string"));
        inner_element.find(".event-responses-run-command").eq(index).val(inner_json["command"]);
      }
    }
    if (inner_json["target"] != null)
      inner_element.find(".event-responses-run-command-target").val(inner_json["target"]);
  }
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_swing")
      .find(".element-control-switch")
      .prop("checked", json_data["swing"] != null))
  );
  is_exist = json_data["sequence"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_sequence")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["sequence"];
    const inner_element = value_elements.children(".event_responses_sequence");
    for (let index = 0; index < inner_json.length; index++) {
      const tabpanel = inner_element.closestOpposite(".tabpanel");
      if (index != 0) addTabElement(tabpanel);
      setEventResponses(tabpanel.closestOpposite(".tab-container").eq(index), inner_json[index]);
    }
  }
  is_exist = json_data["randomize"] != null;
  changeElement(
    /** @type {jQuery} */ (element_control
      .filter(".event_responses_randomize")
      .find(".element-control-switch")
      .prop("checked", is_exist))
  );
  if (is_exist) {
    const inner_json = json_data["randomize"];
    const inner_element = value_elements.children(".event_responses_randomize");
    for (let index = 0; index < inner_json.length; index++) {
      const tabpanel = inner_element.closestOpposite(".tabpanel");
      if (index != 0) addTabElement(tabpanel);
      setEventResponses(tabpanel.closestOpposite(".tab-container").eq(index), inner_json[index]);
      if (inner_json[index]["weight"] != null) {
        tabpanel
          .closestOpposite(".tab-container")
          .eq(index)
          .find(".event-responses-randomize-weight")
          .val(inner_json[index]["weight"]);
      }
    }
  }
}
