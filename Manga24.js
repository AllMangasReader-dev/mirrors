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
var Manga24 = {
  //Name of the mirror
  mirrorName : "Manga24",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/Manga24.png",
  //Languages of scans for the mirror
  languages : "ru",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("manga24.ru/") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://manga24.ru/all/",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $("select#manga_list > option", div).each(function(index) {
              if (index > 0) {
                res[res.length] = [$(this).text(), "http://manga24.ru" + $(this).val()];
              }
            });
            callback("Manga24", res);
          }
    });
  },
  //Find the list of all chapters of the manga represented by the urlManga parameter
  //This list must be an Array of [["chapter name", "url"], ...]
  //This list must be sorted descending. The first element must be the most recent.
  //This function MUST call callback([list of chapters], obj);
  getListChaps : function(urlManga, mangaName, obj, callback) {
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
            var res = [];
            if ($("#main .chapters li", div).size() > 0) {
              $("#main .chapters li", div).each(
                  function(index){
                      res[res.length] = [$($("em", $(this)).contents()[0]).text(), "http://manga24.ru" + $("a", $(this)).attr("href")];
                   }
              );
            } else {
              res[res.length] = [$("#up h1", div).text(), urlManga +"read/"];
            }
            callback(res, obj);
          }
    });
  },
  //This method must return (throught callback method) an object like :
  //{"name" : Name of current manga,
  //  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
  //  "currentMangaURL": Url to access current manga,
  //  "currentChapterURL": Url to access current chapter}
  getInformationsFromCurrentPage : function(doc, curUrl, callback) {
    //This function runs in the DOM of the current consulted page.
    var mangaURL = "";
    $("script", doc).each(function(index) {
      if ($(this).text().indexOf("Reader.init(") != -1)  {
        var pos = $(this).text().indexOf("mangaUrl: \"\\") + 12;
        var fin = $(this).text().indexOf("\\/\"", pos);
        mangaURL = "http://manga24.ru" + $(this).text().substring(pos, fin) + "/";
      }
    });
    var name = $("title", doc).text();//$( $("option:selected", $("select[name='series']", doc)[0] ) ).text();
    var pos = name.indexOf("-");
    if (pos != -1) {
      name = name.substring(0, pos).trim();
    }
    var nameurl = mangaURL;
    var curChapName = "";
    var chapurl = "";
    if ($("#chapters select", doc).size() > 0) {
      curChapName = $("#chapters select option:selected", doc).text();
      chapurl = mangaURL + $("#chapters select option:selected", doc).val() + "/";
    } else {
      curChapName = name;
      chapurl = mangaURL + "read/";
    }
    callback({"name": name,
            "currentChapter": curChapName,
            "currentMangaURL": nameurl,
            "currentChapterURL": chapurl});
  },
  //Returns the list of the urls of the images of the full chapter
  //This function can return urls which are not the source of the
  //images. The src of the image is set by the getImageFromPageAndWrite() function.
  getListImages : function(doc, curUrl2) {
    //This function runs in the DOM of the current consulted page.
    var res = [];
    var dir = "";
    var scansstr = "";
    $("script", doc).each(function(index) {
      if ($(this).text().indexOf("Reader.init(") != -1)  {
        var posdir = $(this).text().indexOf("dir: \"") + 6;
        var findir = $(this).text().indexOf("\"", posdir);
        dir = $(this).text().substring(posdir, findir).replace(/\\\//g, "/");
        var possc = $(this).text().indexOf("images: [[") + 8;
        var finsc = $(this).text().indexOf("]]", possc) + 2;
        scansstr = $(this).text().substring(possc, finsc).replace(/\\\//g, "/");
        var pos = scansstr.indexOf("\"");
        while (pos != -1) {
          var end = scansstr.indexOf("\"", pos + 1);
          res[res.length] = dir + scansstr.substring(pos + 1, end);
          pos = scansstr.indexOf("\"", end + 1);
        }
      }
    });
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //$("iframe", doc).remove();
  },
  //This method returns the place to write the full chapter in the document
  //The returned element will be totally emptied.
  whereDoIWriteScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $(".scanAMR", doc);
  },
  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $(".navAMR", doc);
    //return $("select[name='series']").parent().parent();
  },
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
    var isChap = false;
    $("script", doc).each(function(index) {
      if ($(this).text().indexOf("Reader.init(") != -1)  {
        isChap = true;
      }
    });
    return isChap;
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#sidebar", doc).remove();
    $("#content", doc).empty();
    $("#content", doc).css("width", "100%");
    $("<div class='navAMR'></div>").appendTo($("#content", doc));
    $("<div class='scanAMR'></div>").appendTo($("#content", doc));
    $("<div class='navAMR'></div>").appendTo($("#content", doc));
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
    $( image ).attr( "src", urlImg )
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
    var mangaURL = "";
    $("script", doc).each(function(index) {
      if ($(this).text().indexOf("Reader.init(") != -1)  {
        var pos = $(this).text().indexOf("mangaUrl: \"\\") + 12;
        var fin = $(this).text().indexOf("\\/\"", pos);
        mangaURL = "http://manga24.ru" + $(this).text().substring(pos, fin) + "/";
      }
    });
    var name = $("title", doc).text();//$( $("option:selected", $("select[name='series']", doc)[0] ) ).text();
    var pos = name.indexOf("-");
    if (pos != -1) {
      name = name.substring(0, pos).trim();
    }
    var select = null;
    if ($("#chapters select", doc).size() > 0) {
      $("#chapters select option", doc).each(function(index) {
        $(this).val(mangaURL + $(this).val() + "/");
      });
      select = $("#chapters select", doc);
    } else {
      select = $("<select><option val=\"" + mangaURL + "read/\" selected=\"true\">" + name + "</option></select>");
    }
    return select;
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //$("body > div:empty", doc).remove();
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga24", Manga24);
}