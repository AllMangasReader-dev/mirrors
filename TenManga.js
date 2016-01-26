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
var TenManga = {
  //Name of the mirror
  mirrorName : "TenManga",
  //True if the mirror can list all of its mangas.
  canListFullMangas : false,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/tenmanga.png",
  //Languages of scans for the mirror
  languages : "en,zh",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("tenmanga.com/") != -1 || url.indexOf("dm72.com/") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://www.fullcomic.com/list/?wd=" + search,
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $("dt > a:first-child", div).each(function(index) {
              var title = $(this).text().replace(/  /g, " ");
              res[res.length] = [title, $(this).attr("href")];
            });
            callback("TenManga", res);
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
          url: urlManga + ((urlManga.indexOf("tenmanga.com/") != -1) ? "?waring=1" : ""),
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            if (urlManga.indexOf("tenmanga.com/") != -1) {
              $(".chapter_list tr td:first-child a", div).each(function(index) {
                if (index != $(".chapter_list tr td:first-child a", div).size() - 1) {
                  res[res.length] = [$(this).text(), "http://www.tenmanga.com" + $(this).attr("href")];
                }
              });
            } else if (urlManga.indexOf("www.dm72.com/") != -1) {
              $(".chapter_list tr td:first-child a", div).each(function(index) {
                res[res.length] = [$(this).text(), "http://www.dm72.com" + $(this).attr("href")];
              });
            } else {
              $(".chapter_list tr td:first-child a", div).each(function(index) {
                res[res.length] = [$(this).text(), $(this).attr("href")];
              });
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
    var name;
    var currentChapter;
    var currentMangaURL;
    var currentChapterURL;
    if (curUrl.indexOf("tenmanga.com/") != -1) {
      name = $(".chapter_bar div.postion span.normal a:nth-child(2)", doc).text().trim();
      currentMangaURL = $(".chapter_bar div.postion span.normal a:nth-child(2)", doc).attr("href");
      currentChapter = $("select#chapter:first option:selected", doc).text();
      currentChapterURL = $("select#chapter:first option:selected", doc).val();
    } else if (curUrl.indexOf("www.dm72.com/") != -1) {
      name = $(".juan .top_guide > div:first a:nth-child(3)", doc).text().trim();
      currentMangaURL = "http://www.dm72.com" + $(".juan .top_guide > div:first a:nth-child(3)", doc).attr("href");
      currentChapter = $("select#juan_list:first option:selected", doc).text();
      currentChapterURL = "http://www.dm72.com" + $("select#juan_list:first option:selected", doc).val();
    } else {
      name = $(".main_bar div.postion span.normal a:nth-child(2)", doc).text().trim();
      currentMangaURL = $(".main_bar div.postion span.normal a:nth-child(2)", doc).attr("href");
      currentChapter = $("select#chapter:first option:selected", doc).text();
      currentChapterURL = $("select#chapter:first option:selected", doc).val();
    }
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
    if (curUrl.indexOf("tenmanga.com/") != -1) {
      $("select#page:first option", doc).each(function(index) {
        res[res.length] = $(this).val();
      });
    } else if (curUrl.indexOf("www.dm72.com/") != -1) {
      var base = "http://www.dm72.com" + $("select#juan_list:first option:selected", doc).val();
      var pos = base.lastIndexOf("/");
      base = base.substr(0, pos);
      $("select#pic_list:first option", doc).each(function(index) {
        res[res.length] = base + $(this).val();
      });
    } else {
      $("select#page:first option", doc).each(function(index) {
        res[res.length] = $(this).val();
      });
    }
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("iframe", doc).remove();
    if (curUrl.indexOf("tenmanga.com/") != -1) {
      $(".outer", doc).parent().next().remove();
    }
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
    if (curUrl.indexOf("tenmanga.com/") != -1) {
      return ($("img#comicpic", doc).size() > 0);
    } else if (curUrl.indexOf("www.dm72.com/") != -1) {
      return ($("img#comicpic", doc).size() > 0);
    } else {
      return ($("img", $(".outer", doc).next().next()).size() > 0);
    }
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    if (curUrl.indexOf("tenmanga.com/") != -1) {
      $(".outer", doc).nextAll().remove();
      $(".outer", doc).after($("<div class='navAMR'></div>"));
      $(".outer", doc).after($("<div class='scansAMR'></div>"));
      $(".outer", doc).after($("<div class='navAMR'></div>"));
    } else if (curUrl.indexOf("www.dm72.com/") != -1) {
      $("#juan_list").remove();
      $(".juan", doc).next().remove();
      $(".juan", doc).next().remove();
      $(".juan", doc).after($("<div class='navAMR'></div>"));
      $(".juan", doc).after($("<div class='scansAMR'></div>"));
      $(".juan", doc).after($("<div class='navAMR'></div>"));
    } else {
      $(".outer", doc).nextAll().remove();
      $(".outer", doc).after($("<div class='navAMR'></div>"));
      $(".outer", doc).after($("<div class='scansAMR'></div>"));
      $(".outer", doc).after($("<div class='navAMR'></div>"));
    }
    $(".navAMR", doc).css("text-align", "center");
    $(".navAMR", doc).css("width", "100%");
    $(".scansAMR", doc).css("background-color", "black");
    $(".scansAMR", doc).css("padding-top", "10px");
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
   $.ajax(
      {
        url: urlImg,
        success: function( objResponse ){
          var div = document.createElement( "div" );
          div.innerHTML = objResponse;
          var src;
          if (curUrl.indexOf("tenmanga.com/") != -1) {
            src = $("img#comicpic", div).attr("src");
          } else if (curUrl.indexOf("www.dm72.com/") != -1) {
            src = $("img#comicpic", div).attr("src");
          } else {
            src = $($("img", $(".outer", div).next().next())[0]).attr("src");
          }
          $( image ).attr( "src", src);
        }
    });
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
    if (curUrl.indexOf("tenmanga.com/") != -1) {
      return $("select#chapter:first", doc);
    } else if (curUrl.indexOf("www.dm72.com/") != -1) {
      $("select#juan_list:first option", doc).each(function(index) {
        $(this).val("http://www.dm72.com" + $(this).val());
      });
      return $("select#juan_list:first", doc);
    } else {
      return $("select#chapter:first", doc);
    }
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("TenManga", TenManga);
}