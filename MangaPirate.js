var MangaPirate = {
  mirrorName : "Manga Pirate",
  canListFullMangas : false,
  mirrorIcon : "img/mangapirate.png",
  languages : "en",
  isMe : function (url) {
    return (url.match(/mangapirate.(me|net)/gi) !== null);
  },
  getMangaList : function (search, callback) {
    $.ajax({
      url : "http://mangapirate.me/manga-list/advanced-search/",
      type : 'POST',
      data : {
        "txt_wpm_pag_mng_sch_nme" : search,
        "cmd_wpm_pag_mng_sch_sbm" : "Search"
      },
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success : function (objResponse) {
        var div = document.createElement("div"),
          res = [];
        div.innerHTML = objResponse.replace(/<img/gi, '<noload');
        $("#sct_content .mng_det_pop:odd", div).each(function (index) {
          res[res.length] = [$(this).attr("title").trim(), $(this).attr("href").replace("mangapirate.net", "mangapirate.me")];
        });
        callback("Manga Pirate", res);
      }
    });
  },
  getListChaps : function (urlManga, mangaName, obj, callback) {
    $.ajax({
      url : urlManga,
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      // TODO: Load the complete list in case of more than 50 chapters.
      success : function (objResponse) {
        var div = document.createElement("div"),
          res = [];
        div.innerHTML = objResponse.replace(/<img/gi, '<noload');
        $("#sct_content .lng_ .lst .val", div).each(function (index) {
          res.push([$(this).text(), $(this).parent().attr("href").replace("mangapirate.net", "mangapirate.me")]);
        });
        callback(res, obj);
      }
    });
  },
  isCurrentPageAChapterPage : function (doc, curUrl) {
    return ($(".prw img", doc).size() > 0);
  },
  getInformationsFromCurrentPage : function (doc, curUrl, callback) {
    var name = $("h1.ttl a", doc).text(),
      currentMangaURL = $("h1.ttl a", doc).attr('href').replace("mangapirate.net", "mangapirate.me"),
      currentChapter = $("select.cbo_wpm_chp:first option:selected", doc).text().trim(),
      currentChapterURL = currentMangaURL + $("select.cbo_wpm_chp:first option:selected", doc).attr('value') + "/";
    callback({
      "name" : name,
      "currentChapter" : currentChapter,
      "currentMangaURL" : currentMangaURL,
      "currentChapterURL" : currentChapterURL
    });
  },
  getListImages : function (doc, curUrl) {
    var currentMangaURL = $("h1.ttl a", doc).attr('href'),
      currentChapterURL = currentMangaURL + $("select.cbo_wpm_chp:first option:selected", doc).attr('value'),
      res = [];
    $('.cbo_wpm_pag:first option', doc).each(function () {
      res.push(currentChapterURL + '/' + $(this).attr('value'));
    });
    return res;
  },
  removeBanners : function (doc, curUrl) {
    $("#top-left-ad", doc).remove();
    $("#top-right-ad", doc).remove();
    $("#bottom-right-ad", doc).remove();
    $("#bottom-left-ad", doc).remove();
  },
  doSomethingBeforeWritingScans : function (doc, curUrl) {
    $(".mng_rlt", doc).hide();
    $(".wpm_nav", doc).hide();
    $(".prw", doc).empty();
    $(".prw", doc).prepend("<div class='navAMR'></div>");
    $(".prw", doc).append("<div class='navAMR'></div>");
  },
  whereDoIWriteScans : function (doc, curUrl) {
    return $(".prw", doc);
  },
	whereDoIWriteNavigation : function (doc, curUrl) {
    return $(".navAMR", doc);
	},
  nextChapterUrl : function (select, doc, curUrl) {
    if ($(select).children("option:selected").prev().size() !== 0) {
      return $(select).children("option:selected").prev().val();
    }
    return null;
  },
  previousChapterUrl : function (select, doc, curUrl) {
    if ($(select).children("option:selected").next().size() !== 0) {
      return $(select).children("option:selected").next().val();
    }
    return null;
  },
  getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
    $.ajax({
      url : urlImg,
      success : function (objResponse) {
        var div = document.createElement("div"),
          src;
        div.innerHTML = objResponse;
        src = $(".prw img", div).attr('src');
        $(image).attr("src", src);
      }
    });
  },
  isImageInOneCol : function (img, doc, curUrl) {
    return false;
  },
  getMangaSelectFromPage : function (doc, curUrl) {
    return null;
  },
  doAfterMangaLoaded : function (doc, curUrl) {
    $("body > div:empty", doc).remove();
  }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga Pirate", MangaPirate);
}