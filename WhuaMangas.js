var WhuaMangas = {
   mirrorName : "Whua! Mangás",
   canListFullMangas : true,
   mirrorIcon : "img/whuamangas.png",
   languages : "pt",
   isMe : function (url) {
      return (url.indexOf("leitor.whua-mangas.com") != -1);
   },
   getMangaList : function (search, callback) {
      $.ajax({
         url : "http://leitor.whua-mangas.com/reader/list/",
         beforeSend : function (xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
         },
         success : function (objResponse) {
            var div = document.createElement("div");
            div.innerHTML = objResponse;
            var res = [];
            $('.list.series > .group:has(.element a) > .title > a', div).each(function (index) {
               res.push([$(this).attr('title'), $(this).attr('href')]);
            });
            callback("Whua! Mangás", res);
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
            $('.list > .element > .title > a', div).each(function (index) {
               res.push([$(this).attr('title'), $(this).attr('href')]);
            });
            callback(res, obj);
         }
      });
   },
   getInformationsFromCurrentPage : function (doc, curUrl, callback) {
      var name = $('.tbtitle div a', doc)[0].title;
      var currentChapter = $('.tbtitle div a', doc)[1].text;
      var currentMangaURL = $('.tbtitle div a', doc)[0].href;
      var currentChapterURL = $('.tbtitle div a', doc)[1].href;
      callback({
         "name" : name,
         "currentChapter" : currentChapter,
         "currentMangaURL" : currentMangaURL,
         "currentChapterURL" : currentChapterURL
      });
   },
   getListImages : function (doc, curUrl) {
      var res = [];
      $.ajax({
         url : curUrl,
         async : false,
         success : function (response) {
            var div = document.createElement(div);
            div.innerHTML = response;
            var pages = JSON.parse($(div).html().match(/var pages = .*$/m)[0].replace(/^[^[]*|;$/g, ''));
            pages.forEach(function (page) {
               res.push(page.url);
            });
         }
      });
      return res;
   },
   removeBanners : function (doc, curUrl) {
      $(".ads.iframe.banner", doc).remove();
   },
   whereDoIWriteScans : function (doc, curUrl) {
      return $('#page', doc);
   },
   whereDoIWriteNavigation : function (doc, curUrl) {
      return $(".navAMR", doc);
   },
   isCurrentPageAChapterPage : function (doc, curUrl) {
      return (curUrl.search('leitor.whua-mangas.com/reader/read/') > -1);
   },
   doSomethingBeforeWritingScans : function (doc, curUrl) {
      if (typeof doc.createElement == 'function') {
         script = doc.createElement('script');
         script.innerText = "$(document).unbind('keydown');";
         doc.body.appendChild(script);
      }
      $("#page", doc).css("max-width", "none");
      $("#page", doc).css("width", "100%");
      $("#page", doc).before($("<div class='navAMR'></div>"));
      $("#page", doc).after($("<div class='navAMR'></div>"));
      $("#page", doc).empty();
      $(".navAMR", doc).css("text-align", "center");
      $(window).resize(function () {
         $("#page", doc).css("max-width", "none");
         $("#page", doc).css("width", "100%");
      });
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
      $(image).attr("src", urlImg);
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
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Whua! Mangás", WhuaMangas);
}