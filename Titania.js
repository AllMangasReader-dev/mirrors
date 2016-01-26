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
var Titania = {
  //Name of the mirror
  mirrorName : "Titania Scanlations",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/titania.png",
  //Languages of scans for the mirror
  languages : "en",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("www.titaniascans.com/reader/") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://www.titaniascans.com/reader/",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $(".selector .options a", div).each(function(index) {
              res[res.length] = [$(this).attr("title").trim(), $(this).attr("href")];
            });
            callback("Titania Scanlations", res);
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
              $(".theList a:has(.chapter)", div).each(function(index) {
                res[res.length] = [$("b", $(this)).text().trim(), $(this).attr("href")];
              });
            callback(res, obj);
          }
    });
  },
  retrieveInfo: function(sel) {
    var _obj = {};
    var curval = $(sel.contents()[0]).text();
    $("a", sel).each(function(index) {
      if ($(".option", $(this)).text().trim() == curval) {
        _obj = {name: curval, url: $(this).attr("href")};
      }
    });
    return _obj;
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
    var manga = Titania.retrieveInfo($($(".selector", doc)[0]));
    var chapter = Titania.retrieveInfo($($(".selector", doc)[1]));
    name = manga.name;
    currentChapter = chapter.name;
    currentChapterURL = chapter.url;
    currentMangaURL = manga.url;
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
    $("script", doc).each(function(index) {
      if ($(this).text().indexOf("imageArray = new Array();") != -1) {
        var txt = $(this).text();
        var pos = txt.indexOf("imageArray[");
        while (pos != -1) {
          var debur = txt.indexOf("'", pos);
          var finur = txt.indexOf("'", debur + 1);
          res[res.length] = txt.substring(debur + 1, finur);
          pos = txt.indexOf("imageArray[", finur + 1);
        }
      }
    });
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $(".ads", doc).remove();
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
  },
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
    return ($("#theManga #thePic", doc).size() > 0);
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#theManga", doc).empty();
    var cloned = $("#theManga", doc).clone();
    $("#theManga", doc).after(cloned);
    cloned.attr("id", "amrManga");
    $("#theManga", doc).remove();
    $("#amrManga", doc).css("width", "auto");
    $("#amrManga", doc).css("margin", "0");
    $("#theHead", doc).remove();
    $("<div class='navAMR'></div>").appendTo($("#amrManga", doc));
    $("<div class='scanAMR'></div>").appendTo($("#amrManga", doc));
    $("<div class='navAMR'></div>").appendTo($("#amrManga", doc));
    $(".navAMR", doc).css("text-align", "center");
	script = doc.createElement('script');
	script.innerText  = "$(document).unbind('keyup');\n";
	script.innerText += "$(document).unbind('hashchange');";
	doc.body.appendChild(script);
  },
  //This method is called to fill the next button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  nextChapterUrl : function(select, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    if ($(select).children("option:selected").next().size() != 0) {
      return $(select).children("option:selected").next().val();
    }
    return null;
  },
  //This method is called to fill the previous button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  previousChapterUrl : function(select, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    if ($(select).children("option:selected").prev().size() != 0) {
      return $(select).children("option:selected").prev().val();
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
    var sel = $($(".selector", doc)[1]);
    var ret = $("<select></select>");
    var curval = $(sel.contents()[0]).text();
    $("a", sel).each(function(index) {
      var iscur = false;
      if ($(".option", $(this)).text().trim() == curval) {
        iscur = true;
      }
      $("<option value=\"" + $(this).attr("href") + "\"" + (iscur ? "selected=\"selected\"" : "") + ">" + $(".option", $(this)).text().trim() + "</option>").appendTo(ret);
    });
    return ret;
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
	$('#infoSpread').remove();
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Titania Scanlations", Titania);
}