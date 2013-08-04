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

var StopTazmo = {
  //Name of the mirror
  mirrorName : "StopTazmo",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/stoptazmo.png",
  //Languages of scans for the mirror
  languages : "en",
  
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("stoptazmo.com/") != -1);
  },
  
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://stoptazmo.com/downloads/manga_series.php?action=entire_list",
          
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          }, 
           
          success: function( objResponse ){
            var div = document.createElement( "div" );  
            div.innerHTML = objResponse;
            var res = [];
            $("#content > table:nth-child(3) td:first-child a", div).each(function(index) {
              res[res.length] = [$(this).text().trim(), $(this).attr("href")];
            });
            callback("StopTazmo", res);
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

              $("#content table td:first-child", div).each(function(index) {
                if ($("a", $(this).closest("tr")).size() > 0) {
                  res[res.length] = [$(this).text().trim(), $("a", $(this).closest("tr")).last().attr("href")];
                }
              });
            res.reverse();
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

    name = $("select.selectmanga option:selected", doc).text().trim();
    currentChapter =$("select.selectchapter option:selected", doc).text();
    currentMangaURL = "http://stoptazmo.com/manga-series/" + $("select.selectmanga option:selected", doc).val() + "/";
    currentChapterURL = "http://stoptazmo.com/downloads/manga_viewer.php?series=" + $("select.selectmanga option:selected", doc).val() + "&chapter=" + $("select.selectchapter option:selected", doc).val();
    
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
    //var manga = $("select.selectmanga option:selected", doc).val();
    //var chap = $("select.selectchapter option:selected", doc).val();
    
    $("script", doc).each(function(index) {
      if ($(this).text().indexOf("SLIDES = new slideshow('SLIDES');") != -1) {
        var sc = $(this).text();
        var posdeb = sc.indexOf("s.src = '");
        while (posdeb != -1) {
          var posfin = sc.indexOf("'", posdeb + 9);
          res[res.length] = sc.substring(posdeb + 9, posfin);
          posdeb = sc.indexOf("s.src = '", posfin + 1);
        }
      }
    });
    
    /*$("select[name='pagesel1'] option", doc).each(function(index) {
      res[res.length] = {
          'manga_hid': manga,
          'chapter_hid': chap,
          'image_hid': $(this).val(),
          'series': manga,
          'chapter': chap,
          'pagesel1': $(this).val()
        };
    });*/
    
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
    if ($("form[name='pageSelector1']", doc).size() > 0) {
      return ($("img", $("form[name='pageSelector1'] td", doc)[1]).size() > 0);
    } else {
      return false;
    }
  },
  
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#wrapper", doc).css("width", "auto");
    $("#content", doc).css("width", "100%");
    $("#content table", doc).remove();  
    $("<div class='navAMR'></div>").appendTo($("#content", doc));
    $("<div class='scansAMR'></div>").appendTo($("#content", doc));
    $("<div class='navAMR'></div>").appendTo($("#content", doc));
    $(".navAMR", doc).css("text-align", "center");
    $(".navAMR", doc).css("width", "100%");
    $(".scansAMR", doc).css("width", "100%");
    $(".scansAMR", doc).css("background-color", "black");
    $(".scansAMR", doc).css("padding-top", "10px");

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
    //var url = "http://stoptazmo.com/downloads/manga_viewer.php"

    /*$.ajax(
      {
        url: url,         
        type: 'POST',
        data: urlImg,
        success: function( objResponse ){
          var div = document.createElement( "div" );
          div.innerHTML = objResponse; 
    
          var src = $("img", $("form[name='pageSelector1'] td", div)[1]).attr("src");
          
          $( image ).attr( "src", src);
        }
    });*/
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
    var base = "http://stoptazmo.com/downloads/manga_viewer.php?series=" + $("select.selectmanga option:selected", doc).val() + "&chapter=";
    $("select.selectchapter option", doc).each(function(index) {
      $(this).val(base + $(this).val());
    });
    
    return $("select.selectchapter", doc);
  },  
  
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
  }
}

// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("StopTazmo", StopTazmo);
}