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
var BacaManga = {
  //Name of the mirror
  mirrorName : "BacaManga",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/bacamanga.png",
  //Languages of scans for the mirror
  languages : "id",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("komikid.com/") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://komikid.com/",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $("select[name='manga']:first option", div).each(function(index) {
              if (index > 0) {
                res[res.length] = [$(this).text().trim(), "http://komikid.com/" + $(this).val()];
              }
            });
            callback("BacaManga", res);
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
            $("select[name='chapter']:first option", div).each(
                function(index){
                    res[res.length] = [$(this).text(), urlManga + "/" + $(this).val()];
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
  getInformationsFromCurrentPage : function(doc, curUrl, callback) {
    //This function runs in the DOM of the current consulted page.
    var name = $("select[name='manga']:first option:selected", doc).text();
    var nameurl = "http://komikid.com/" + $("select[name='manga']:first option:selected", doc).val();
    var curChapName = $("select[name='chapter']:first option:selected", doc).text();
    var chapurl = nameurl + "/" + $("select[name='chapter']:first option:selected", doc).val();
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
    var nameurl = "http://komikid.com/" + $("select[name='manga']:first option:selected", doc).val();
    var chapurl = nameurl + "/" + $("select[name='chapter']:first option:selected", doc).val();
    var res = [];
    $("select[name='page']:first option", doc).each(function(index) {
      res[res.length] = chapurl + "/" + $(this).val();
    });
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $(".baner", doc).remove();
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
    return ($("img.picture", doc).size() > 0);
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#omv > table", doc).remove();
    $("#omv > div:empty", doc).remove();
    $("#header", doc).after($("<div class='navAMR'></div>"));
    $("#header", doc).after($("<div class='scanAMR'></div>"));
    $("#header", doc).after($("<div class='navAMR'></div>"));
    $(".navAMR", doc).css("text-align", "center");
    $(".scanAMR", doc).css("background-color", "black");
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
            var src = "http://komikid.com/" + $("img.picture", div).attr("src");
            $( image ).attr( "src", src );
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
    var nameurl = "http://komikid.com/" + $("select[name='manga']:first option:selected", doc).val();
    $("select[name='chapter']:first option", doc).each(function(index) {
      $(this).val(nameurl + "/" + $(this).val());
    });
    return $("select[name='chapter']:first", doc);
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
    $("#omv .scanAMR table").css("background-color", "black");
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("BacaManga", BacaManga);
}