/*/////////////////////////////////////////////////////////////////////////////
//                                                                           //
//   All Mangas Reader : Follow updates of your favorite mangas sites.       //
//   Copyright (c) 2011 Pierre-Louis DUHOUX (pl.duhoux at gmail d0t com)     //
//                                                                           //
/////////////////////////////////////////////////////////////////////////////*/

/********************************************************************************************************
 IMPORTANT NOTE : methods which are running in the DOM of the page could directly use this DOM.
 However, if you want to test the mirror with the lab, you must use the two arguments (doc and curUrl)
 of these methods to avoid using window.location.href (replaced by curUrl) and manipulate the DOM within
 the object doc (example, replace $("select") by $("select", doc) in jQuery).
 ********************************************************************************************************/

var AdultManga;
AdultManga = {
  //Name of the mirror
  mirrorName: "AdultManga",
  //True if the mirror can list all of its mangas.
  canListFullMangas: false,
  //Extension internal link to the icon of the mirror.
  mirrorIcon: "img/readmanga.png",
  //Languages of scans for the mirror
  languages: "ru",

  //Return true if the url corresponds to the mirror
  isMe: function (url) {
    return (url.indexOf("mintmanga.com/") !== -1);
  },

  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList: function (search, callback) {
    $.ajax({
      url: "http://mintmanga.com/search",
      type: "POST",
      data: {
        q: search
      },
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success: function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;
        var res = [];
        $("#mangaResults td a:first-child", div).each(function (index) {
          var tit = $($(this).contents()[0]).text();
          tit = tit.split("|");
          res[res.length] = [tit[0].trim(), "http://mintmanga.com" + $(this).attr("href")];
        });
        callback("AdultManga", res);
      }
    });
  },

  //Find the list of all chapters of the manga represented by the urlManga parameter
  //This list must be an Array of [["chapter name", "url"], ...]
  //This list must be sorted descending. The first element must be the most recent.
  //This function MUST call callback([list of chapters], obj);
  getListChaps: function (urlManga, mangaName, obj, callback) {
    $.ajax({
      url: urlManga + "?mature=1",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },
      success: function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;
        var res = [];
        var mng_nm = (urlManga.split("/")).pop();
        $("div.expandable td > a", div).each(
          function (index) {
            var str = $(this).attr("href");
            str = str.split("/")[1];
            if (str === mng_nm) {
              res[res.length] = [$($(this).contents()[0]).text(), "http://mintmanga.com" + $(this).attr("href")];
            }
          }
        );
        callback(res, obj);
      }
    });
  },

  //This method must return (throught callback method) an object like :
  //{"name" : Name of current manga,
  //  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
  //  "currentMangaURL": Url to access current manga,
  //  "currentChapterURL": Url to access current chapter}
  getInformationsFromCurrentPage: function (doc, curUrl, callback) {
    //This function runs in the DOM of the current consulted page.
    var name = $($("#mangaBox h1 a:first-child", doc).contents()[0]).text();
    var nameurl = "http://mintmanga.com" + $("#mangaBox h1 a:first-child", doc).attr("href");
    var curChapName = $("#chapterSelectorSelect:first option:selected", doc).text();
    var chapurl = "http://mintmanga.com" + $("#chapterSelectorSelect:first option:selected", doc).val();
    callback({
      "name": name,
      "currentChapter": curChapName,
      "currentMangaURL": nameurl,
      "currentChapterURL": chapurl
    });
  },

  //Returns the list of the urls of the images of the full chapter
  //This function can return urls which are not the source of the
  //images. The src of the image is set by the getImageFromPageAndWrite() function.
  getListImages: function (doc, curUrl2) {
    //This function runs in the DOM of the current consulted page.
    var res = [];
    var matches = doc.documentElement.innerHTML;
    matches = matches.match(/rm_h\.init\(.*?\]\]/);
    if (matches) {
      matches = matches[0].slice(10);
      matches = matches.split("'").join('"');
      var b = JSON.parse(matches);
      for (var i = 0; i < b.length; i++) {
        res[i] = b[i][1] + b[i][0] + b[i][2];
      }
    }
    return res;
  },

  //Remove the banners from the current page
  removeBanners: function (doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $(".baner", doc).remove();
  },

  //This method returns the place to write the full chapter in the document
  //The returned element will be totally emptied.
  whereDoIWriteScans: function (doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $("#mangaBox", doc);
  },

  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation: function (doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $(".navAMR", doc);
    //return $("select[name='series']").parent().parent();
  },

  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage: function (doc, curUrl) {
    return ($("img#mangaPicture", doc).size() > 0);
  },

  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans: function (doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#mangaBox", doc).prev().remove();
    $("#mangaBox", doc).prev().remove();
    $(".second-nav", doc).append($("h1", doc));
    $("h1", doc).css("text-align", "center");
    $("#mangaBox", doc).empty();
    $(".footerControl", doc).remove();
    $("#mangaBox", doc).css("width", "100%");
    $("#mangaBox", doc).css("padding", "0");
    $("#mangaBox", doc).css("padding-top", "10px");
    $("#mangaBox", doc).css("padding-bottom", "10px");
    $("#mangaBox", doc).css("border", "0");

    $("#mangaBox", doc).css("background-color", "black");
    $("#mangaBox", doc).before($("<div class='navAMR'></div>"));
    $("#mangaBox", doc).after($("<div class='navAMR'></div>"));
  },

  //This method is called to fill the next button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  nextChapterUrl: function (select, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    if ($(select).children("option:selected").prev().size() !== 0) {
      return $(select).children("option:selected").prev().val();
    }
    return null;
  },

  //This method is called to fill the previous button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  previousChapterUrl: function (select, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    if ($(select).children("option:selected").next().size() !== 0) {
      return $(select).children("option:selected").next().val();
    }
    return null;
  },

  //Write the image from the the url returned by the getListImages() function.
  //The function getListImages can return an url which is not the source of the
  //image. The src of the image is set by this function.
  //If getListImages function returns the src of the image, just do $( image ).attr( "src", urlImg );
  getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $(image).attr("src", urlImg);
  },

  //If it is possible to know if an image is a credit page or something which
  //must not be displayed as a book, just return true and the image will stand alone
  //img is the DOM object of the image
  isImageInOneCol: function (img, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return false;
  },

  //This function can return a preexisting select from the page to fill the
  //chapter select of the navigation bar. It avoids to load the chapters
  getMangaSelectFromPage: function (doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#chapterSelectorSelect option", doc).each(function (index) {
      $(this).val("http://mintmanga.com" + $(this).val());
    });

    return $($("#chapterSelectorSelect", doc)[0]);
  },

  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded: function (doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
  }
};

// Call registerMangaObject to be known by includer
if (typeof registerMangaObject === "function") {
  registerMangaObject("AdultManga", AdultManga);
}
