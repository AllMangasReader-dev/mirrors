var S2scans = {
  mirrorName : "S2scans",
  canListFullMangas : false,
  mirrorIcon : "img/S2scans.png",
  languages : "en",
  isMe : function (url) {
    return (url.indexOf("s2scanlations.com/online/") !== -1);
  },
  getMangaList : function (search, callback) {
    $.ajax({
      url : "http://s2scanlations.com/online/search/",
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
        div.innerHTML = objResponse.replace(/<img/gi, '<noload');;
        var res = [];
        $('.list > .group > .title > a', div).each(function (index) {
          res[res.length] = [$(this).attr('title'), $(this).attr('href')];
        });
        callback("S2scans", res);
      }
    });
  },
  getListChaps : function (urlManga, mangaName, obj, callback) {
    $.ajax({
      url : urlManga,
      type : 'POST',
      data : {
        'adult' : true
      },
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
      },
      success : function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse.replace(/<img/gi, '<noload');
        var res = [];
        $('.element > .title > a', div).each(function (index) {
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
  removeBanners : function (doc, curUrl) {},
  whereDoIWriteScans : function (doc, curUrl) {
    return $('#page', doc);
  },
  whereDoIWriteNavigation : function (doc, curUrl) {
    return $(".navAMR", doc);
  },
  isCurrentPageAChapterPage : function (doc, curUrl) {
    return ($("#content #page img.open", doc).length > 0);
  },
  doSomethingBeforeWritingScans : function (doc, curUrl) {
    if (typeof doc.createElement == 'function') {
      script = doc.createElement('script');
      script.type = "text/javascript";
      script.onload = OnceLoaded;
      script.innerText = "changePage = function(){}; $(document).ready(function(){$(document).off('keydown');});";
      script.innerText += "function OnceLoaded() {changePage = function(){};$(document).ready(function(){$(document).off('keydown');});}"
      doc.body.appendChild(script);
      function OnceLoaded() {
           changePage = function(){};
           $(document).ready(function(){$(document).off('keydown');});
      }
    }
    $("#page", doc).css("max-width", "none");
	  $("#page", doc).css("width", "100%");
    $('#page', doc).css("overflow", "visible");
    $("#page", doc).before($("<div class='navAMR'></div>"));
    $("#page", doc).after($("<div class='navAMR'></div>"));
    $("#page", doc).empty();
    $(".navAMR").css("text-align", "center");
    $(window).resize(function() {
  	  $("#page", doc).css("max-width", "none");
  	  $("#page", doc).css("width", "100%");
    });
  },
  nextChapterUrl : function (select, doc, curUrl) {
    if ($(select).children("option:selected").prev().length != 0) {
      return $(select).children("option:selected").prev().val();
    }
    return null;
  },
  previousChapterUrl : function (select, doc, curUrl) {
    if ($(select).children("option:selected").next().length != 0) {
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
	registerMangaObject("S2scans", S2scans);
}