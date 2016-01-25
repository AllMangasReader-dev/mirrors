/*/////////////////////////////////////////////////////////////////////////////
//                                                                           //
//   All Mangas Reader : Follow updates of your favorite mangas sites.       //
//   Copyright (c) 2011 Matteo TeoMan Mangano (MM.teoman at gmail dot com)   //
//                                                                           //
/////////////////////////////////////////////////////////////////////////////*/
/********************************************************************************************************
  IMPORTANT NOTE : methods which are running in the DOM of the page could directly use this DOM.
  However, if you want to test the mirror with the lab, you must use the two arguments (doc and curUrl)
  of these methods to avoid using window.location.href (replaced by curUrl) and manipulate the DOM within
  the object doc (example, replace $("select") by $("select", doc) in jQuery).
********************************************************************************************************/
var getListChapsInnerCnt = 0;
  function getListChapsInner(urlManga, mangaName, obj, callback, res, level) {
     $.ajax(
        {
          url: urlManga,
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            if ($("div[id='mycontent']", div).size() > 0)
            {
                // Regular chapters and sub-chapters
                $("table.snif tr td a", div).each(function(index) {
                  if (index > 2 && $(this).attr("title") != "")
                  {
                    if ($(this).attr("title").indexOf("-") == -1 || level >= 1)
                      res[res.length] = [$(this).attr("title"), $(this).attr("href").replace(".html", "_nas.html")];
                    else
                    {
                      //res[res.length] = [$(this).attr("title"), $(this).attr("href")];
                      getListChapsInnerCnt++;
                      //getListChapsInner($(this).attr("href"), mangaName, obj, callback, res, level + 1);
                      var subUrl = $(this).attr("href");
                      window.setTimeout (function () { getListChapsInner(subUrl, mangaName, obj, callback, res, level + 1); }, 500 * getListChapsInnerCnt);
                    }
                  }
                });
            }
            else if ($("div[id='content']", div).size() > 0)
            {
                // It is a single chapter so we directly have the images here
                var pos = urlManga.lastIndexOf("/");
                var name = urlManga.substr(pos + 1, urlManga.length - pos - 6);
                while(name.indexOf("_") != -1)
                    name = name.replace("_", " ");
                if (name.indexOf(mangaName) == -1)
                  name = mangaName + " " + name;
                res[res.length] = [name, urlManga.substr(0, urlManga.length - 5) + "_nas.html"];
            }
            if (getListChapsInnerCnt <= 0) {
              callback(res, obj);
              getListChapsInnerCnt = 0;
            } else {
              getListChapsInnerCnt--;
            }
          }
    });
  }
var UnixManga = {
  //Name of the mirror
  mirrorName : "UnixManga",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/UnixManga.png",
  //Languages of scans for the mirror
  languages : "en",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("http://unixmanga.com") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          type: 'POST',
          url: "http://unixmanga.com/onlinereading/manga-lists.html",
          data: {word: search},
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $("table.snif tr td a", div).each(function(index) {
              res[res.length] = [$(this).attr("title"), $(this).attr("href")];
            });
            callback("UnixManga", res);
          }
    });
  },
  //Find the list of all chapters of the manga represented by the urlManga parameter
  //This list must be an Array of [["chapter name", "url"], ...]
  //This list must be sorted descending. The first element must be the most recent.
  //This function MUST call callback([list of chapters], obj);
  getListChaps : function(urlManga, mangaName, obj, callback) {
    var res = [];
    getListChapsInner(urlManga, mangaName, obj, callback, res, 0);
  },
  //This method must return (throught callback method) an object like :
  //{"name" : Name of current manga,
  //  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
  //  "currentMangaURL": Url to access current manga,
  //  "currentChapterURL": Url to access current chapter}
  getInformationsFromCurrentPage : function(doc, curUrl, callback) {
    //This function runs in the DOM of the current consulted page.
    var name;
    var currentChapter;
    var currentMangaURL;
    var currentChapterURL;
    var pos1 = curUrl.indexOf("/onlinereading/");
//    var pos2 = curUrl.indexOf("/", pos1 + 15);
//    if (pos2 == -1 && $("div[id='mycontent']", doc).size() != 0)
//      pos2 = curUrl.indexOf(".html", pos1 + 15);
    var pos2 = -1;
    if ($("div[id='mycontent']", doc).size() == 0)
      pos2 = curUrl.indexOf("/", pos1 + 15);
    else
      pos2 = curUrl.indexOf(".html", pos1 + 15);
    if (pos2 != -1)
    {
        // Regular chapters
        name = curUrl.substr(pos1 + 15, pos2 - pos1 - 15);
        currentChapter = curUrl.substr(pos2 + 1, curUrl.length - pos2 - 10);
        currentMangaURL = curUrl.substr(0, pos2) + ".html";
    }
    else
    {
        // It is a single chapter so we directly have the images here
        name = curUrl.substr(pos1 + 15, curUrl.length - pos1 - 24);
        currentChapter = curUrl.substr(pos1 + 15, curUrl.length - pos1 - 24);
        currentMangaURL = curUrl.substr(0, curUrl.length - 9) + ".html";
    }
    while(name.indexOf("_") != -1)
        name = name.replace("_", " ");
    while(currentChapter.indexOf("_") != -1)
        currentChapter = currentChapter.replace("_", " ");
    currentChapterURL = curUrl;
    /*console.log(" name : " + name +
            " currentChapter : " + currentChapter +
            " currentMangaURL : " + currentMangaURL +
            " currentChapterURL : " + currentChapterURL);*/
    callback({"name": name,
            "currentChapter": currentChapter,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL});
   },
  //Returns the list of the urls of the images of the full chapter
  //This function can return urls which are not the source of the
  //images. The src of the image is set by the getImageFromPageAndWrite() function.
  getListImages : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    var res = [];
    $("div[id='content'] a", doc).each(
      function(index){
        var url = $(this).attr("href").replace("/?image=", "/");
        var pos = url.indexOf("&server=");
        if (pos != -1)
          res[res.length] = url.substr(0, pos);
      }
    );
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
  },
  //This method returns the place to write the full chapter in the document
  //The returned element will be totally emptied.
  whereDoIWriteScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $(".scansAMR", doc);
  },
  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $(".navAMR", doc);
  },
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
    if ($("div[id='content'] a", doc).size() == 0)
      return false;
    return ($("div[id='content'] a", doc).first().attr("href").indexOf("?image") != -1);
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //PREPARE THE PAGE TO HOST NAVIGATION AND THE FULL CHAPTER
    //you may need to change elements in the page, add elements, remove others and change css
    $("div[id='content'] a", doc).each(
      function(index){
        if ($(this).text() != "BACK TO MAIN LIST" && index < 29)
          $(this).remove();
      }
    );
    $("div[id='content']", doc).before($("<div class='navAMR'></div>"));
    $("div[id='content']", doc).before($("<div class='scansAMR'></div>"));
    $("div[id='content']", doc).after($("<div class='navAMR'></div>"));
    $("div[id='content']", doc).after($("div[id='content'] a").append("<br>"));
    $("div[id='content']", doc).remove();
    $(".navAMR").css("text-align", "center");
    $(".scansAMR", doc).css("width", "100%");
    $(".td2", doc).css("color", "#FFFFFF");
    $("#wrap", doc).css("width", "auto");
    $("#menu", doc).css("width", "800px");
    $("#bottom", doc).remove();
  },
  //This method is called to fill the next button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  nextChapterUrl : function(select, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    if ($(select).children("option:selected").prev().size() != 0) {
      return $(select).children("option:selected").prev().val();
    }
    return null;
  },
  //This method is called to fill the previous button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  previousChapterUrl : function(select, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    if ($(select).children("option:selected").next().size() != 0) {
      return $(select).children("option:selected").next().val();
    }
    return null;
  },
  //Write the image from the the url returned by the getListImages() function.
  //The function getListImages can return an url which is not the source of the
  //image. The src of the image is set by this function.
  //If getListImages function returns the src of the image, just do $( image ).attr( "src", urlImg );
  getImageFromPageAndWrite : function(urlImg, image, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $( image ).attr( "src", urlImg );
  },
  //If it is possible to know if an image is a credit page or something which
  //must not be displayed as a book, just return true and the image will stand alone
  //img is the DOM object of the image
  isImageInOneCol : function(img, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return false;
  },
  //This function can return a preexisting select from the page to fill the
  //chapter select of the navigation bar. It avoids to load the chapters
  getMangaSelectFromPage : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return null;
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //THE FOLLOWING LINE IS NECESSARY IN MOST OF CASES
    $("body > div:empty", doc).remove();
    //DO ANYTHING ELSE YOU NEED
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("UnixManga", UnixManga);
}