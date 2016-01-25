/*/////////////////////////////////////////////////////////////////////////////
//                                                                           //
//   All Mangas Reader : Follow updates of your favorite mangas sites.       //
//   Copyright (c) Enter here your copyright mention...                      //
//                                                                           //
/////////////////////////////////////////////////////////////////////////////
*/
//This class is an example of manga site following implementation for All Manga Reader.
//To test this class, just modify the json variable in mgEntry.js.
//If your implementation works and has been fully tested, send it to me with an
//icon (png with transparency file, 16x16) for your mirror
//at pl dot duhoux (at) gmail dot com. I will add it in the extension.
//If you have problems implementing your mirror, send me a mail... i will be glad to help you...
//CHANGE here the classname
var Animexis = {
  //CHANGE : Name of the mirror
  mirrorName : "Animexis Scans",
  //CHANGE : True if the mirror can list all of its mangas.
  canListFullMangas : false,
  //CHANGE : Extension internal link to the icon of the mirror. (if not filled, will be blank...)
  mirrorIcon : "img/animexis.png",
  languages: "en",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("manga.animexis.org/") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          //CHANGE URL HERE
          url: "http://manga.animexis.org/reader/search/",
		  type: 'POST',
		  data:
		  {
			'search': search
		  },
          //KEEP THE HEADERS, THEY PREVENT CHROME TO LOAD URL FROM CACHE
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $('.list > .group > .title > a', div).each(function(index) {
			  res[res.length] = [$(this).attr('title'), $(this).attr('href')];
            });
            callback("Animexis Scans", res);
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
          //CHANGE URL HERE
          url: urlManga,
          //KEEP THE HEADERS, THEY PREVENT CHROME TO LOAD URL FROM CACHE
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $('.list > .element > .title > a', div).each(function(index) {
              res[res.length] = [$(this).attr('title'), $(this).attr('href')];
            });
            callback(res, obj);
          }
    });
  },
  /********************************************************************************************************
    IMPORTANT NOTE : methods which are running in the DOM of the page could directly use this DOM.
    However, if you want to test the mirror with the lab, you must use the two arguments (doc and curUrl)
    of these methods to avoid using window.location.href (replaced by curUrl) and manipulate the DOM within
    the object doc (example, replace $("select") by $("select", doc) in jQuery).
  ********************************************************************************************************/
  //This method must return (throught callback method) an object like :
  //{"name" : Name of current manga,
  //  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
  //  "currentMangaURL": Url to access current manga,
  //  "currentChapterURL": Url to access current chapter}
  getInformationsFromCurrentPage : function(doc, curUrl, callback) {
    //This function runs in the DOM of the current consulted page.
    var name = $('.tbtitle div a', doc)[0].title;
    var currentChapter = $('.tbtitle div a', doc)[1].text;
    var currentMangaURL = $('.tbtitle div a', doc)[0].href;
    var currentChapterURL = $('.tbtitle div a', doc)[1].href;
    callback({"name": name,
            "currentChapter": currentChapter,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL});
  },
  //Returns the list of the urls of the images of the full chapter
  //This function can return urls which are not the source of the
  //images. The src of the image is set by the getImageFromPageAndWrite() function.
  getListImages : function(doc, curUrl) {
    var res = [];
	eval($('body', doc).html().match(/var pages = .*\n/)[0]);
	pages.forEach(function(page)
	{
		res.push(page.url);
	});
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
  },
  //This method returns the place to write the full chapter in the document
  //The returned element will be totally emptied.
  whereDoIWriteScans : function(doc, curUrl) {
    return $('#page', doc);
  },
  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //YOU MUST RETURN TWO PLACES (ON TOP AND AT THE BOTTOM OF THE CHAPTER)
    //you can change the DOM of the page before this method is called in doSomethingBeforeWritingScans
    return $(".navAMR", doc);
  },
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
    return (curUrl.search('manga.animexis.org/reader/read/') > -1);
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
	script = doc.createElement('script');
	script.innerText = "$(document).unbind('keydown');";
	doc.body.appendChild(script);
	$('#page').css("max-width", (screen.width - 150) + 'px');
    $("#page", doc).before($("<div class='navAMR'></div>"));
    $("#page", doc).after($("<div class='navAMR'></div>"));
    $("#page", doc).empty();
    $(".navAMR").css("text-align", "center");
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
    $(image).attr("src", urlImg);
  },
  //If it is possible to know if an image is a credit page or something which
  //must not be displayed as a book, just return true and the image will stand alone
  //img is the DOM object of the image
  isImageInOneCol : function(img, doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //DO NOT CHANGE IF NOT NEEDED, NOT USED BY ANY EXISTING MIRROR AND CHAPTER'S DISPLAY IS WORKING FINE FOR THEM
    return false;
  },
  //This function can return a preexisting select from the page to fill the
  //chapter select of the navigation bar. It avoids to load the chapters
  getMangaSelectFromPage : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //RETURN A SELECT IF NEEDED, ELSE, THE EXTENSIOn WILL FIND CHAPTER BY IT'S OWN MEANS
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
	registerMangaObject("Animexis Scans", Animexis);
}