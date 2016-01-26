/*/////////////////////////////////////////////////////////////////////////////
//                                                                           //
//   All Mangas Reader : Follow updates of your favorite mangas sites.       //
//                                                                           //
//   Developped by jknito (keliasjes@gmail.com)                              //
//   twitter account (http://twitter.com/jknito)                             //
//                                                                           //
/////////////////////////////////////////////////////////////////////////////*/
function formatMgName(name) {
  if (name == undefined || name == null || name == "null") return "";
  return name.trim().replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}
var Animextremist = {
  mirrorName : "Animextremist",
  canListFullMangas : true,
  mirrorIcon : "img/animextremist.png",
  //Languages of scans for the mirror
  languages : "es",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("animextremist.com/mangas-online") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://www.animextremist.com/mangas-online/mns.htm",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            $("option", div).each(function(index) {
      				if( $(this).attr("value") == "00") return;
      				res[res.length] = [$(this).text(), "http://www.animextremist.com/"+$(this).attr("value")];
            });
            callback("Animextremist", res);
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
            $("#Layer17 #tomos a", div).each(function(index) {
      				if( ! $(this).text()) return;
      				var ref = $(this).attr("href");
      				if( ref.indexOf("capitulo") == -1 ) return;
      				var texto = ref.replace(".html", "-1.html");
      				res[res.length] = [texto.replace(/(http:\/\/.*capitulo-)/,"").replace(/(\/.*)/,""), texto];
            });
			      if( ! res.length ){
    				  $("#Layer10 table a", div).each(function(index) {
      					if( ! $(this).text()) return;
      					var ref = $(this).attr("href");
      					if( ref.indexOf("capitulo") == -1 ) return;
      					var texto = ref;
      					res[res.length] = [texto.replace(/(http:\/\/.*capitulo-)/,"").replace(/(\/.*)/,""), texto];
    				  });
			      }
      			res.sort(function( a, b){
      				var x = parseInt(a[0]);
      				var y = parseInt(b[0]);
      				return ((x < y) ? 1 : ((x > y) ? -1 : 0));
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
    var name;
    var currentChapter;
    var currentMangaURL;
    var currentChapterURL;
    //FILL THE ABOVE VARIABLES HERE...
  	var manga = $("head title", doc).text();
  	var pos = manga.indexOf(" - ");
  	name = manga.substr(0, pos);
  	/*var mangaExist = manga.lastIndexOf(" ") == (manga.length - 6) ? manga.lastIndexOf(" ") : manga.length;
    name = manga.substr(manga.indexOf(" ")+1, mangaExist - manga.indexOf(" ") - 1);*/
  	currentChapter = $("#photo", doc).attr("src").replace(/(http:\/\/.*capitulo-)/,"").replace(/(\/.*)/,"");
    currentChapterURL = curUrl;
    //This function runs in the DOM of the current consulted page.
     $.ajax(
        {
          url: "http://www.animextremist.com/mangas-online/mns.htm",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var sent = false;
            $("option", div).each(function(index) {
      				if( $(this).attr("value") == "00") return;
      				var tmpname = $(this).text();
      				if (!sent && formatMgName(tmpname) == formatMgName(name)) {
                currentMangaURL = "http://www.animextremist.com/"+$(this).attr("value");
                sent = true;
                callback({"name": name,
                        "currentChapter": currentChapter,
                        "currentMangaURL": currentMangaURL,
                        "currentChapterURL": currentChapterURL});
              }
            });
          }
    });
  },
  //Returns the list of the urls of the images of the full chapter
  //This function can return urls which are not the source of the
  //images. The src of the image is set by the getImageFromPageAndWrite() function.
  getListImages : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    var res = [];
    $("#nav-jump option", doc).each(
      function(index){
        res[index] = "http://www.animextremist.com/" + $(this).val();
      }
    );
    return res;
  },
  //Remove the banners from the current page
  removeBanners : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
	   $("#publi", doc).remove();
  },
  //This method returns the place to write the full chapter in the document
  //The returned element will be totally emptied.
  whereDoIWriteScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
	   return $("#div-photo", doc);
  },
  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $("#nav", doc).add($("#sub-nav", doc));
  },
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
    return $("#photo",doc).size() > 0;
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //PREPARE THE PAGE TO HOST NAVIGATION AND THE FULL CHAPTER
    //you may need to change elements in the page, add elements, remove others and change css
    $("#wrapper").css("width", "auto");
	  $("#nav", doc).empty();
	  $("#sub-nav", doc).empty();
    $("#div-photo", doc).empty();
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
    //IF URL IS IMAGE URL --> $( image ).attr( "src", urlImg );
  	$.ajax({
  		url: urlImg,
  		beforeSend: function(xhr) {
  			xhr.setRequestHeader("Cache-Control", "no-cache");
  			xhr.setRequestHeader("Pragma", "no-cache");
  		},
  		success: function( objResponse ){
  			var div = document.createElement( "div" );
  			div.innerHTML = objResponse;
  			var src = $("#photo",div).attr("src");
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
    var select = $("<select></select>");
    var listOptions = [];
    var URL = curUrl.substr(0,curUrl.lastIndexOf("/"));
    $("iframe", doc).each(function(index){
    	if( index == 1 )
    		URL = URL + "/" + $(this).attr("src");
      });
    $.ajax({
        url: URL,
    	  async: false,
        beforeSend: function(xhr) {
          xhr.setRequestHeader("Cache-Control", "no-cache");
          xhr.setRequestHeader("Pragma", "no-cache");
        },
        success: function( objResponse ){
          var div = document.createElement( "div" );
          div.innerHTML = objResponse;
      		$("select option",div).each(function(index){
      			var thisUrl = curUrl.substr(0,curUrl.lastIndexOf("/"));
      			thisUrl = thisUrl.substr(0,thisUrl.lastIndexOf("/"));
      			if(index != 0){
      				listOptions[listOptions.length] = thisUrl + "/"+ $(this).attr("value");
      				var option = $("<option></option>").text($(this).text()).attr("value",listOptions[listOptions.length-1]);
      				if( listOptions[listOptions.length-1] == curUrl )
      					$(option).attr("selected","selected");
      				$(select).prepend(option);
      			}
    		  });
        }
    });
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    //$("body > div:empty", doc).remove();
    $($("table > tbody > tr > td > center")[0]).remove();
	  return;
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Animextremist", Animextremist);
}