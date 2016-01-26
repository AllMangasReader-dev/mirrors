var MangaLib = {
  mirrorName : "Manga Library",
  canListFullMangas : true,
  mirrorIcon : "img/mangalib.png",
  languages : "pl",
  isMe : function (url) {
    "use strict";
    return (url.indexOf("manga-lib.pl/") !== -1);
  },
  getMangaList : function (search, callback) {
    "use strict";
    $.ajax({
      url : "http://www.manga-lib.pl/index.php/manga/search?title=" + search,
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success : function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse.replace(/<img /gi, "<noload ");
        var res = [];
        $("table.manga_list tbody tr td:first-child a", div).each(function (index) {
          res[res.length] = [$(this).text(), $(this).attr("href")];
        });
        callback("Manga Library", res);
      }
    });
  },
  getListChaps : function (urlManga, mangaName, obj, callback) {
    "use strict";
    $.ajax({
      url : urlManga,
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success : function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse.replace(/<img /gi, "<noload ");
        var res = [];
        $("table.chapters_list tbody tr td:first-child a", div).each(function (index) {
          res[res.length] = [$(this).text(), $(this).attr("href")];
        });
        callback(res, obj);
      }
    });
  },
  getInformationsFromCurrentPage : function (doc, curUrl, callback) {
    "use strict";
    var name;
    var currentChapter;
    var currentMangaURL;
    var currentChapterURL;
    name = $(".reader_top_panel .reader_top_panel_l a", doc)[0].text();
    currentMangaURL = $(".reader_top_panel .reader_top_panel_l a", doc)[0].attr("href");
    currentChapter = $("option:selected", $(".reader_top_panel .reader_top_panel_l .ch_chapter", doc)).text();
    currentChapterURL = $("option:selected", $(".reader_top_panel .reader_top_panel_l .ch_chapter", doc)).attr("value");
    callback({
      "name" : name,
      "currentChapter" : currentChapter,
      "currentMangaURL" : currentMangaURL,
      "currentChapterURL" : currentChapterURL
    });
  },
  getListImages : function (doc, curUrl) {
    "use strict";
    var res = [];
    $("option", $(".reader_top_panel .reader_top_panel_l .ch_page", doc)).each(function (index) {
      res[res.length] = $(this).attr("value");
    });
    return res;
  },
  removeBanners : function (doc, curUrl) {
    "use strict";
  },
  whereDoIWriteScans : function (doc, curUrl) {
    "use strict";
    return $(".reader", doc);
  },
  whereDoIWriteNavigation : function (doc, curUrl) {
    "use strict";
    return $(".navAMR", doc);
  },
  isCurrentPageAChapterPage : function (doc, curUrl) {
    "use strict";
    return ($("#img_curr", doc).size() > 0);
  },
  doSomethingBeforeWritingScans : function (doc, curUrl) {
    "use strict";
    $(".reader", doc).empty();
    $(".reader", doc).css("height", "auto");
    $(".reader", doc).css("width", "auto");
    $(".reader", doc).before("<div class='navAMR'></div>");
    $(".reader", doc).after("<div class='navAMR'></div>");
    $(".navAMR", doc).css("text-align", "center");
  },
  nextChapterUrl : function (select, doc, curUrl) {
    "use strict";
    if ($("option:selected", $(".reader_top_panel .reader_top_panel_l .ch_chapter", doc)).prev().size() !== 0) {
      return $("option:selected", $(".reader_top_panel .reader_top_panel_l .ch_chapter", doc)).prev().attr("value");
    }
    return null;
  },
  previousChapterUrl : function (select, doc, curUrl) {
    "use strict";
    if ($("option:selected", $(".reader_top_panel .reader_top_panel_l .ch_chapter", doc)).next().size() !== 0) {
      return $("option:selected", $(".reader_top_panel .reader_top_panel_l .ch_chapter", doc)).next().attr("value");
    }
    return null;
  },
  getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
    "use strict";
    $.ajax({
      url : urlImg,
      success : function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;
        var src = $("#img_curr", div).attr("src");
        $(image).attr("src", src);
      }
    });
  },
  isImageInOneCol : function (img, doc, curUrl) {
    "use strict";
    return false;
  },
  getMangaSelectFromPage : function (doc, curUrl) {
    "use strict";
    return $($(".reader_menu .left select", doc)[0]);
  },
  doAfterMangaLoaded : function (doc, curUrl) {
    "use strict";
    $("body > div:empty", doc).remove();
    $(".reader_page_holder .AMRtable", doc).css("background-color", "black");
    $(".reader_page_holder .AMRtable tr", doc).css("background-color", "black");
    $(".reader_page_holder .AMRtable tr td", doc).css("background-color", "black");
  }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga Library", MangaLib);
}