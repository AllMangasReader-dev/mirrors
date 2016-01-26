var SubManga = {
  //Name of the mirror
  mirrorName : "SubManga",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/submanga.png",
  //Languages of scans for the mirror
  languages : "es",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("submanga.com/") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://submanga.com/series/n",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $("#w .b468 td:first-child a", div).each(function(index) {
			        $("b",$(this)).remove();
			        var tit = $(this).attr("href");
			        tit = tit.replace("submanga.me", "submanga.com");
              res[res.length] = [$(this).remove("b").text(), tit];
            });
            callback("SubManga", res);
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
          url: urlManga + "/completa",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $("#w .b468 .caps td:first-child a", div).each(function(index) {
              var ref = $(this).attr("href");
              var pos = ref.lastIndexOf("/");
              ref = "http://submanga.com/c/" + ref.substr(pos + 1, ref.length);
			  res[res.length] = [$("strong", $(this)).text(), ref];
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
    var name;
    var currentChapter;
    var currentMangaURL;
    var currentChapterURL;
    name = $("td.l a:nth-child(3)", doc).text();
    var ref = $("td.l a:nth-child(3)", doc).attr("href").replace("/scanlation/", "/").substr(2);
    var pos = ref.lastIndexOf("/");
    ref = "http://submanga.com/" + ref.substr(0, pos);
    currentMangaURL = ref;
    currentChapter = $("td.l a:nth-child(4)", doc).text();
    ref = $("td.l a:nth-child(4)", doc).attr("href").replace("/scanlation/", "/");
    pos = ref.lastIndexOf("/");
    ref = "http://submanga.com/c/" + ref.substr(pos + 1, ref.length);
    currentChapterURL = ref;
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
	var path = curUrl;
    $("table#t select option", doc).each(
      function(index){
        res[index] = path + "/" + $(this).val();
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
    return $("#scan", doc);
  },
  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $(".navAMR", doc);
  },
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
    return ($("#t", doc).size() > 0 && $("div a img", doc).size() > 0);
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
	// this code remove the fixed style from table create for this extension
	// submanga have a style position: fixed for tables, this cause the table create for this extension dont work
	$("link",doc).remove();
	$("body",doc).attr("bgcolor","#000");
	$("body",doc).attr("margin","0");
	$("body",doc).attr("padding","0");
	$("#t",doc).attr("bgcolor","#1c6a6d");
	$("#t",doc).attr("width","100%");
	$("#t",doc).css("sppanding","4px");
	$("#t",doc).css("font","400 11px 'verdana'");
	$("#t",doc).css("margin","4px");
	$("#t",doc).css("padding","6px");
	$("#t a",doc).css("text-decoration","none");
	$("#t a",doc).css("color","white");
	$("#t th",doc).last().remove();
	$("#t th",doc).last().remove();
	$("#t th",doc).last().remove();
	$("#t select",doc).last().remove();
    //This function runs in the DOM of the current consulted page.
    $("body div", doc).empty();
    $("body div", doc).append("<div id='scan'></div>");
    $("#scan", doc).before($("<div class='navAMR'></div>"));
    $("#scan", doc).after($("<div class='navAMR'></div>"));
	$(".navAMR", doc).css("text-align", "center");
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
          var src = $("div a img", div).attr("src");
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
    return null;
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //$("body > div:empty", doc).remove();
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("SubManga", SubManga);
}