var Manga2u = {
   mirrorName : "Manga2u",
   canListFullMangas : false,
   mirrorIcon : "img/manga2u.png",
   languages : "en",
   isMe : function (url) {
      return (url.indexOf("manga2u.me/") != -1);
   },
   getMangaList : function (search, callback) {
      $.ajax({
         url : "http://www.manga2u.me/list/search/",
         type : 'POST',
         data : {
            "cmd_wpm_search" : "Search",
            "txt_wpm_wgt_mng_sch_nme" : search,
            "cmd_wpm_wgt_mng_sch_sbm" : 1,
            "cmd_wpm_wgt_mng_sch_sbm_img.x" : 0,
            "cmd_wpm_wgt_mng_sch_sbm_img.y" : 0
         },
         beforeSend : function (xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
         },
         success : function (objResponse) {
            var div = document.createElement("div");
            div.innerHTML = objResponse;
            var res = [];
            $(".wpm_pag.mng_lst .det a:first-child", div).each(function (index) {
               if ($(this).text().trim() != "") {
                  res[res.length] = [$(this).text(), $(this).attr("href")];
               }
            });
            res.sort(function (a, b) {
               return ((a[0].toLowerCase() < b[0].toLowerCase()) ? -1 : ((a[0] == b[0]) ? 0 : 1));
            });
            callback("Manga2u", res);
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
         success : function (objResponse) {
            var div = document.createElement("div");
            div.innerHTML = objResponse;
            var res = [];
            $("ul.lst a.lst", div).each(function (index) {
               if ($(this).text().trim() != "") {
                  res[res.length] = [$("b.val", $(this)).text(), $(this).attr("href")];
               }
            });
            callback(res, obj);
         }
      });
   },
   getInformationsFromCurrentPage : function (doc, curUrl, callback) {
      var name;
      var currentChapter;
      var currentMangaURL;
      var currentChapterURL;
      name = $("h1.ttl a:first", doc).text().trim();
      if (name.substring(name.length - 5, name.length) == "Manga") {
         name = name.substr(0, name.length - 5).trim();
      }
      var url = curUrl;
      var pos = 0;
      for (var i = 0; i < 4; i++) {
         pos = url.indexOf("/", pos + 1);
      }
      currentMangaURL = url.substr(0, pos + 1);
      currentChapter = $("h1.ttl", doc).contents().last().text().trim();
      if (currentChapter.substr(0, 1) == "-") {
         currentChapter = currentChapter.substr(1).trim();
      }
      currentChapterURL = $("link[rel='canonical']", doc).attr("href");
      callback({
         "name" : name,
         "currentChapter" : currentChapter,
         "currentMangaURL" : currentMangaURL,
         "currentChapterURL" : currentChapterURL
      });
   },
   getListImages : function (doc, curUrl) {
      var res = [];
      var nba = $("h2.wpm_tip.lnk_cnr a", doc).size();
      $("h2.wpm_tip.lnk_cnr a", doc).each(function (index) {
         if (index != nba - 1) {
            res[res.length] = $(this).attr("href");
         }
      });
      return res;
   },
   removeBanners : function (doc, curUrl) {},
   whereDoIWriteScans : function (doc, curUrl) {
      return $(".wpm_nav:first", doc).next();
   },
   whereDoIWriteNavigation : function (doc, curUrl) {
      return $(".wpm_nav", doc);
   },
   isCurrentPageAChapterPage : function (doc, curUrl) {
      return ($("img.manga-page", doc).size() > 0 || $("#chapter-link a").text().toLowerCase().indexOf("begin reading") != -1 || $("h1:first").text().indexOf("Index of") != -1);
   },
   doSomethingBeforeWritingScans : function (doc, curUrl) {
      $(".wpm_nav:first", doc).next().empty();
      $(".wpm_nav:first", doc).next().next().remove();
      $(".wpm_nav", doc).empty();
      $(".wpm_nav", doc).css("text-align", "center");
      $(".wpm_nav", doc).css("padding", "5px");
      $(".wpm_nav", doc).css("height", "auto");
      $("#sct_col_l").css("width", "auto");
      $("#sct_col_l").css("float", "none");
      $(".wrap").css("width", "auto");
   },
   nextChapterUrl : function (select, doc, curUrl) {
      if ($(select).children("option:selected").prev().size() != 0) {
         return $(select).children("option:selected").prev().val();
      }
      return null;
   },
   previousChapterUrl : function (select, doc, curUrl) {
      if ($(select).children("option:selected").next().size() != 0) {
         return $(select).children("option:selected").next().val();
      }
      return null;
   },
   getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
      $.ajax({
         url : urlImg,
         success : function (objResponse) {
            var div = document.createElement("div");
            div.innerHTML = objResponse;
            var src = $("img.manga-page", div).attr("src");
            $(image).attr("src", src);
         }
      });
   },
   isImageInOneCol : function (img, doc, curUrl) {
      return false;
   },
   getMangaSelectFromPage : function (doc, curUrl) {
      var url = curUrl;
      var pos = 0;
      for (var i = 0; i < 4; i++) {
         pos = url.indexOf("/", pos + 1);
      }
      var currentMangaURL = url.substr(0, pos + 1);
      $(".cbo_wpm_chp:first option", doc).each(function (index) {
         $(this).val(currentMangaURL + $(this).val() + "/01/");
      });
      return $(".cbo_wpm_chp:first", doc);
   },
   doAfterMangaLoaded : function (doc, curUrl) {
      $("body > div:empty", doc).remove();
   },
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga2u", Manga2u);
}