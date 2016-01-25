var DragonFlyScans = {
  mirrorName : "Dragon & Fly Scans",
  canListFullMangas : true,
  mirrorIcon : "img/dragonflyscans.png",
  languages : "en",
  isMe : function (url) {
    return (url.indexOf("dragonflyscans.org") !== -1);
  },
  getMangaList : function (search, callback) {
    $.ajax({
      url : "http://dragonflyscans.org",
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success : function (objResponse) {
        var div = document.createElement("div"),
          res = [],
          name,
          url,
          list;
        div.innerHTML = objResponse;
        list = $('.rightcol h2:contains(Manga List)', div);
        while ((list = list.next()).length > 0) {
          if (list.is('h3')) {
            name = list.text();
            list = list.next();
            if (!list.is('ul')) {
              break;
            }
            url = $('a:first', list).attr('href');
            n = url.indexOf("\/", 33);
            url = url.substring(0, n);
            res.push([name, url + "/"]);
          }
        }
        callback("Dragon & Fly Scans", res);
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
        var div = document.createElement("div"),
          res = [];
        div.innerHTML = objResponse.replace(/<img/gi, '<noload');
        $(".releases a", div).each(function () {
          res.push([$(this).text().substr(mangaName.length).trim(), $(this).attr("href")]);
        });
        callback(res, obj);
      }
    });
  },
  getInformationsFromCurrentPage : function (doc, curUrl, callback) {
    var name = $('h2', doc).text().replace(/ Manga/, ''),
      currentChapter = $('h1', doc).text().substr(name.length).trim(),
      currentMangaURL = $('h2 a', doc).attr('href'),
      currentChapterURL = $('link[rel=canonical]', doc).attr('href');
    callback({
      "name" : name,
      "currentChapter" : currentChapter,
      "currentMangaURL" : currentMangaURL,
      "currentChapterURL" : currentChapterURL
    });
  },
  getListImages : function (doc, curUrl) {
    var res = [];
    $('.controls:first a', doc).each(function () {
      var text = $(this).text();
      if ((text === 'Prev') || (text === 'Next')) {
        return true;
      }
      res.push($(this).attr('href'));
    });
    return res;
  },
  removeBanners : function (doc, curUrl) {},
  whereDoIWriteScans : function (doc, curUrl) {
    return $("#page", doc);
  },
  whereDoIWriteNavigation : function (doc, curUrl) {
    return $(".navAMRav", doc).add($("#navAMRap", doc));
  },
  isCurrentPageAChapterPage : function (doc, curUrl) {
    return $("#page", doc).length > 0;
  },
  doSomethingBeforeWritingScans : function (doc, curUrl) {
    $('.controls', doc).remove();
    $('#tips', doc).remove();
    $('#chapter_list', doc).hide();
    $('#page', doc).empty();
    $("#page", doc).before($("<div class='navAMRav'></div>"));
    $("#page", doc).after($("<div class='navAMRav'></div>"));
    $('#page', doc).css('padding', '20px 0');
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
        var div = document.createElement("div");
        div.innerHTML = objResponse;
        var src = $('#page img', div).attr('src');
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
	registerMangaObject("Dragon & Fly Scans", DragonFlyScans);
}