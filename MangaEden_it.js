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
var MangaEden_it = {
  //Name of the mirror
  mirrorName : "Manga Eden (IT)",
  //True if the mirror can list all of its mangas.
  canListFullMangas : false,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/mangaeden.png",
  //Languages of scans for the mirror
  languages : "it",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("www.mangaeden.com/it-manga/") != -1);
  },
  getMangaListPage: function(response, res)
  {
      var div = document.createElement("div");
	  div.innerHTML = response;
	  $('#mangaList tr td:first-child a', div).each(function(index) {
	    res.push([$(this).text(), "http://www.mangaeden.com" + $(this).attr("href")]);
	  });
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://www.mangaeden.com/it-directory/?title=" + search,
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
			res = [];
			MangaEden_it.getMangaListPage(objResponse, res);
			var div = document.createElement("div");
		    div.innerHTML = objResponse;
			if (!isNaN(n = parseInt($('.pagination_bottom a:not(:has(span)):last', div).text())))
			{
				for (i = 2; i <= n; i++)
				{
					$.ajax(
					{
						url: "http://www.mangaeden.com/it-directory/?title=" + search + "&page=" + i,
						async: false,
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Cache-Control", "no-cache");
							xhr.setRequestHeader("Pragma", "no-cache");
						},
						success: function(objResponse)
						{
							MangaEden_it.getMangaListPage(objResponse, res);
						}
					});
				}
			}
            callback("Manga Eden (IT)", res);
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
              $('.chapterLink', div).each(function(index) {
                res[res.length] = [parseFloat($("b", $(this)).text()), "http://www.mangaeden.com" + $(this).attr("href")];
              });
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
    var name = $('#top a:last', doc).text();
    var currentChapter = $('#combobox option:selected', doc).text();
    var currentMangaURL = "http://www.mangaeden.com" + $('#top a:last', doc).attr('href');
    var currentChapterURL = currentMangaURL + currentChapter + "/1/";
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
	res.push(curUrl);
    $('.pagination a:not(:contains("Prev")):not(:contains("Next")):not(.selected)', doc).each(function(index)
	{
		res.push($(this).attr('href'));
    });
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#adsTop", doc).remove();
    $("#adsRight", doc).remove();
    $("#bottomAds", doc).remove();
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
    if (curUrl.indexOf("www.mangaeden.com/it-manga/") != -1)
	{
		return (curUrl.substring(curUrl.indexOf("www.mangaeden.com/it-manga/") + 27).split(/\//g).length - 1) > 1
	}
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
	$('.pagination').remove();
    $("#content", doc).empty();
    $("<div class='navAMR'></div>").appendTo($("#content", doc));
    $("<div class='scanAMR'></div>").appendTo($("#content", doc));
    $("<div class='navAMR'></div>").appendTo($("#content", doc));
    $(".navAMR", doc).css("text-align", "center");
	script = doc.createElement('script');
	script.innerText = "document.onkeydown = null;\n";
	doc.body.appendChild(script);
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
	if (urlImg.indexOf("http://") == -1)
	{
		urlImg = "http://www.mangaeden.com" + urlImg;
	}
	$.ajax(
	{
		url: urlImg,
		success: function(objResponse)
		{
			var div = document.createElement( "div" );
			div.innerHTML = objResponse;
			$(image).attr('src', $('#mainImgC img', div).attr('src'));
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
    return null;
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga Eden (IT)", MangaEden_it);
}