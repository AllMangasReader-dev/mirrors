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

var MangaChapter = {
  //Name of the mirror.
  mirrorName : "MangaChapter",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/mangachapter.png",
  //Languages of scans for the mirror
  languages : "en",
  
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
	//console.log("isMe");
    return (url.indexOf("mangachapter.net") != -1);
  },
  
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
	//console.log("getMangaList");
    var urlManga = "http://www.mangachapter.net/top.html";// will look later on how to request each page
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
            $(".info_box a", div).each(
              function(index){   
                  res[res.length] = [$(this).text(), $(this).attr("href")];
              }
            );
            callback("MangaChapter", res);
            
          }
    });
  }, 
  
  //Find the list of all chapters of the manga represented by the urlManga parameter
  //This list must be an Array of [["chapter name", "url"], ...]
  //This list must be sorted descending. The first element must be the most recent.
  //This function MUST call callback([list of chapters], obj);
  getListChaps : function(urlManga, mangaName, obj, callback) {
	//console.log("getListChaps");
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
			
            $(".mangadata a", div).each(
              function(index){
				var currentChapter = $(this).attr("title").replace(mangaName, "");
                res[res.length] = [currentChapter.trim(), $(this).attr("href")];
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
	//console.log("getInformationsFromCurrentPage");
    //This function runs in the DOM of the current consulted page.
	
    var name = $(".box-read h2 a", doc).attr("title");
    //console.log("Manga name : " + name);
    var mangaurl = curUrl.substring(0, curUrl.lastIndexOf('/')) + ".html";
    //console.log("Manga url : " + mangaurl);
    var currentChapter = $(".box-read h1 strong", doc).text();
    currentChapter = currentChapter.replace(name, "");
    //console.log("Current chapter name : " + currentChapter.trim());
    //console.log("Current chapter url : " + curUrl);
    callback({"name": name.trim(), 
            "currentChapter": currentChapter.trim(), 
            "currentMangaURL": mangaurl.trim(), 
            "currentChapterURL": curUrl});
  }, 
  
  //Returns the list of the urls of the images of the full chapter
  //This function can return urls which are not the source of the
  //images. The src of the image is set by the getImageFromPageAndWrite() function.
  getListImages : function(doc, curUrl) {
	//console.log("getListImages");
    //This function runs in the DOM of the current consulted page.
    res = [];
    $(".page-select:first option", doc).each(function(index) {
      res[res.length] = $(this).val();//"http://www.mangachapter.net" + $(this).val();
    });
    return res;
  },
  
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
	//console.log("removeBanners");
    //This function runs in the DOM of the current consulted page.
    $("iframe", doc).remove();
  },
  
  //This method returns the place to write the full chapter in the document
  //The returned element will be totally emptied.
  whereDoIWriteScans : function(doc, curUrl) {
	//console.log("whereDoIWriteScans");
    //This function runs in the DOM of the current consulted page.
    return $(".scanAMR", doc);
  },
  
  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation : function(doc, curUrl) {
	//console.log("whereDoIWriteNavigation");
    //This function runs in the DOM of the current consulted page.
    return $(".navAMR", doc);
  },
  
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
	//console.log("isCurrentPageAChapterPage");
    //This function runs in the DOM of the current consulted page.
    return ($("#mangaImg", doc).length != 0);
  },
  
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
	//console.log("doSomethingBeforeWritingScans");
    //This function runs in the DOM of the current consulted page.
	$(".mangaread-tp,.mangaread-bt", doc).remove();
	$(".mangaread-icon", doc).remove();
	$(".footer", doc).remove();
	var viewer = $(".main", doc);
    viewer.empty();
	viewer.removeAttr("class");
	viewer.removeAttr("style");
	viewer.css("width", "auto");
    $("<div class='navAMR'></div>").appendTo(viewer);
    $("<div class='scanAMR'></div>").appendTo(viewer);
    $("<div class='navAMR'></div>").appendTo(viewer);
    $(".navAMR", doc).css({ 'text-align':'center', 'background-color':'#fff', 'margin-bottom':'15px' });
  },
  
  //This method is called to fill the next button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  nextChapterUrl : function(select, doc, curUrl) {
	//console.log("nextChapterUrl");
    //This function runs in the DOM of the current consulted page.

    if ($(select).children("option:selected").prev().size() != 0) {
      return $(select).children("option:selected").prev().val();
    }
    return null;
  },
  
  //This method is called to fill the previous button's url in the manga site navigation bar
  //The select containing the mangas list next to the button is passed in argument
  previousChapterUrl : function(select, doc, curUrl) {
	//console.log("previousChapterUrl");
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
	//console.log("getImageFromPageAndWrite");
    //This function runs in the DOM of the current consulted page.
    $.ajax(
        {
          url: urlImg,
           
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse; 

            var src = $("#mangaImg", div).attr("src");
            $( image ).attr( "src", src);
          }
      });
  },
  
  //If it is possible to know if an image is a credit page or something which 
  //must not be displayed as a book, just return true and the image will stand alone
  //img is the DOM object of the image
  isImageInOneCol : function(img, doc, curUrl) {
	//console.log("isImageInOneCol");
    //This function runs in the DOM of the current consulted page.
    return false;
  },
  
  //This function can return a preexisting select from the page to fill the 
  //chapter select of the navigation bar. It avoids to load the chapters
  getMangaSelectFromPage : function(doc, curUrl) {
	//console.log("getMangaSelectFromPage");
    //This function runs in the DOM of the current consulted page.
    return null;
  },
  
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
	//console.log("doAfterMangaLoaded");
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
    $(".imageAMR", doc).css({ 'margin-top':'10px' });
	$("body,table", doc).css({
		'background-color':'#000',
		'border-bottom-color':'#000',
		'border-left-color':'#000',
		'border-right-color':'#000',
		'border-top-color':'#000'
	});
  }
}

// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("MangaChapter", MangaChapter);
}