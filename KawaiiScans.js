var KawaiiScans = {
  mirrorName : "Kawaii Scans",
  canListFullMangas : true,
  mirrorIcon : "img/kawaiiscans.png",
  languages : "en",
  isMe : function (url) {
    return (url.indexOf("kawaii.ca/") !== -1);
  },
  getMangaList : function (search, callback) {
    $.ajax({
      url : "http://kawaii.ca/reader/",
      beforeSend : function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success : function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;
        var res = [];
        $("select[name='manga'] option", div).each(function (index) {
          if ($(this).attr('value') !== 0) {
            res.push([$(this).text(), 'http://kawaii.ca/reader/' + $(this).attr('value')]);
          }
        });
        callback("Kawaii Scans", res);
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
        var currentMangaURL = 'http://kawaii.ca/reader/' + $("select[name='manga']:first option[selected]", div).attr('value');
        var res = [];
        $("select[name='chapter']:first option", div).each(function (index) {
          res.push([$(this).text(), currentMangaURL + (res.length > 0 ? '/' + $(this).attr('value') : '')]);
        });
        res.reverse();
        callback(res, obj);
      }
    });
  },
  getInformationsFromCurrentPage : function (doc, curUrl, callback) {
    var name = $("select[name='manga']:first option[selected]", doc).text();
    var currentChapter = $("select[name='chapter']:first option[selected]", doc).text();
    var currentMangaURL = 'http://kawaii.ca/reader/' + $("select[name='manga']:first option[selected]", doc).attr('value');
    var currentChapterURL;
    if ($("select[name='chapter']:first option[selected]", doc).attr('value') === $("select[name='chapter']:first option:first", doc).attr('value')) {
      currentChapterURL = currentMangaURL;
    } else {
      currentChapterURL = currentMangaURL + '/' + $("select[name='chapter']:first option[selected]", doc).attr('value');
    }
    callback({
      "name" : name,
      "currentChapter" : currentChapter,
      "currentMangaURL" : currentMangaURL,
      "currentChapterURL" : currentChapterURL
    });
  },
  getListImages : function (doc, curUrl) {
    var currentMangaURL = 'http://kawaii.ca/reader/' + $("select[name='manga']:first option[selected]", doc).attr('value');
    var currentChapterURL = currentMangaURL + '/' + $("select[name='chapter']:first option[selected]", doc).attr('value');
    var res = [];
    $("select[name='page']:first option", doc).each(function () {
      if ($(this).attr('value') === '') {
        return true;
      }
      res.push(currentChapterURL + '/' + $(this).attr('value'));
    });
    return res;
  },
  removeBanners : function (doc, curUrl) {
    $('.ads').remove();
  },
  whereDoIWriteScans : function (doc, curUrl) {
    return $('.imgAMR', doc);
  },
  whereDoIWriteNavigation : function (doc, curUrl) {
    return $(".navAMR", doc);
  },
  isCurrentPageAChapterPage : function (doc, curUrl) {
    return ($("select[name='chapter']", doc).length > 0);
  },
  doSomethingBeforeWritingScans : function (doc, curUrl) {
    doc.onkeydown = null;
    $('td.mid table', doc).remove();
    $('td.mid', doc).css('background-color', '#f4f4f4');
    $('td.mid', doc).append($("<div class='navAMR'></div>"));
    $('td.mid', doc).append($("<div class='imgAMR'></div>"));
    $('td.mid', doc).append($("<div class='navAMR'></div>"));
    $(".navAMR").css("text-align", "center");
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
        var src = 'http://kawaii.ca/reader/' + $('img.picture', div).attr('src');
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
    $("body", doc).css('background-color', '#f5f5f5');
  }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Kawaii Scans", KawaiiScans);
}