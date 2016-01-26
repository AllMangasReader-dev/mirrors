var amanteanime = {
  mirrorName : "amanteanime",
  canListFullMangas : false,
  mirrorIcon : "img/amanteanime.png",
  languages : "en,es",
  isMe : function (url) {
    return (url.indexOf("online.amanteanime.net") != -1);
  },
  getMangaList : function (search, callback) {
    $.ajax({
      url : "http://online.amanteanime.net/reader/search/",
      type : 'POST',
      data : {
        'search' : search
      },
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success : function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;
        var res = [];
        $('.list > .group > .title > a', div).each(function (index) {
          res[res.length] = [$(this).attr('title'), $(this).attr('href')];
        });
        callback("amanteanime", res);
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
          res[res.length] = [$(this).attr('title'), $(this).attr('href')];
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
  removeBanners : function(doc, curUrl) {
  },
  isCurrentPageAChapterPage : function (doc, curUrl) {
    return (curUrl.search('online.amanteanime.net/reader/read/') > -1);
  },
  getListImages : function(doc, curUrl) {
    return null;
  },
  doSomethingBeforeWritingScans : function (doc, curUrl) {
    $("#page", doc).before($("<div class='navAMR'></div>"));
    $("#page", doc).after($("<div class='navAMR'></div>"));
    $(".navAMR").css("text-align", "center");
  },
  whereDoIWriteScans : function(doc, curUrl) {
    return null;
  },
  whereDoIWriteNavigation : function (doc, curUrl) {
    return $(".navAMR", doc);
  },
  nextChapterUrl : function (select, doc, curUrl) {
    if ($(select).children("option:selected").prev().size() != 0) {
      return $(select).children("option:selected").prev().val();
    }
    return null;
  },
  whereDoIWriteScans : function(doc, curUrl) {
    return $('#page', doc);
  },
  getImageFromPageAndWrite : function(urlImg, image, doc, curUrl) {
    $(image).attr("src", urlImg);
  },
  isImageInOneCol : function(img, doc, curUrl) {
    return false;
  },
  previousChapterUrl : function (select, doc, curUrl) {
    if ($(select).children("option:selected").next().size() != 0) {
      return $(select).children("option:selected").next().val();
    }
    return null;
  },
  getMangaSelectFromPage : function (doc, curUrl) {
    return null;
  },
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("amanteanime", amanteanime);
}