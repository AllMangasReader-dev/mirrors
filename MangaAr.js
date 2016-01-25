var MangaAr = {
   mirrorName : "Manga Ar",
   canListFullMangas : false,
   mirrorIcon : "img/mangaar.png",
   languages : "ar",
   isMe : function (url) {
      return (url.indexOf("manga-ar.com/") != -1);
   },
   getMangaList : function (search, callback) {
      $.ajax({
         url : "http://manga-ar.com/directory.php?action=search&SeriesName=" + search,
         beforeSend : function (xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
         },
         success : function (objResponse) {
            var div = document.createElement("div");
            div.innerHTML = objResponse;
            var res = [];
            $("td.list > a", div).each(function (index) {
               res[res.length] = [$(this).text(), $(this).attr("href")];
            });
           $("td.color > a", div).each(function (index) {
               res[res.length] = [$(this).text(), $(this).attr("href")];
            });
            callback("Manga Ar", res);
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
            $("#newspaper-b3 tbody tr td:nth-child(6) > a", div).each(function (index) {
               res[res.length] = [$(this).text(), $(this).attr("href")];
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
      name = $(".indexer a:nth-child(2)", doc).text();
      var SeriesID = $("#SeriesID", doc).val();
      var ChapterID = $("#ChapterID", doc).val();
      currentMangaURL = "http://manga-ar.com/" + SeriesID + "/";
      currentChapter = $("#ChapterID:first option:selected", doc).text();
      currentChapterURL = "http://manga-ar.com/" + SeriesID + "/" + ChapterID + "/1";
      callback({
         "name" : name,
         "currentChapter" : currentChapter,
         "currentMangaURL" : currentMangaURL,
         "currentChapterURL" : currentChapterURL
      });
   },
   getListImages : function (doc, curUrl) {
      var res = [];
      var SeriesID = $("#SeriesID", doc).val();
      var ChapterID = $("#ChapterID", doc).val();
      $("#PageID:first option", doc).each(function (index) {
         res[res.length] = "http://manga-ar.com/" + SeriesID + "/" + ChapterID + "/" + $(this).val();
      });
      return res;
   },
   removeBanners : function (doc, curUrl) {
      $("#aswift_0_anchor", doc).remove();
      $("#aswift_1_anchor", doc).remove();
      $("#aswift_2_anchor", doc).remove();
   },
   whereDoIWriteScans : function (doc, curUrl) {
      return $("#PagePhoto", doc);
   },
   whereDoIWriteNavigation : function (doc, curUrl) {
      return $("#newspaper-b4", doc);
   },
   isCurrentPageAChapterPage : function (doc, curUrl) {
      return ($("img.manga-pic2", doc).size() > 0);
   },
   doSomethingBeforeWritingScans : function (doc, curUrl) {
      $("#newspaper-b4", doc).empty();
      $("#newspaper-b4:last", doc).remove();
      $("#newspaper-b4:last", doc).remove();
      $("#newspaper-b4", doc).css("text-align", "center");
      $("#PagePhoto", doc).empty();
      $("#content2", doc).css("width", "auto");
      $(".gallery", doc).css("background", "black");
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
            var src = $("img.manga-pic2", div).attr("src");
            $(image).attr("src", src);
         }
      });
   },
   isImageInOneCol : function (img, doc, curUrl) {
      return false;
   },
   getMangaSelectFromPage : function (doc, curUrl) {
      var res = [];
      var currentMangaURL = "http://manga-ar.com/" + $("select[name='manga']:first option:selected", doc).val();
      var SeriesID = $("#SeriesID", doc).val();
      $("#ChapterID option", doc).each(function (index) {
         $(this).val("http://manga-ar.com/" + SeriesID + "/" + $(this).val() + "/1");
      });
      return $("#ChapterID:first", doc);
   },
   doAfterMangaLoaded : function (doc, curUrl) {
      $("body > div:empty", doc).remove();
   }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga Ar", MangaAr);
}