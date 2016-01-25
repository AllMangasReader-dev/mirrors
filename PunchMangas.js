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
var PunchMangas = {
  //Name of the mirror
  mirrorName : "PunchMangas",
  //True if the mirror can list all of its mangas.
  canListFullMangas : true,
  //Extension internal link to the icon of the mirror.
  mirrorIcon : "img/punchmangas.png",
  //Languages of scans for the mirror
  languages : "pt",
  //Return true if the url corresponds to the mirror
  isMe : function(url) {
    return (url.indexOf("punchmangas.com.br/") != -1);
  },
  //Return the list of all or part of all mangas from the mirror
  //The search parameter is filled if canListFullMangas is false
  //This list must be an Array of [["manga name", "url"], ...]
  //This function must call callback("Mirror name", [returned list]);
  getMangaList : function(search, callback) {
     $.ajax(
        {
          url: "http://www.punchmangas.com.br/lmangas/Todos/titulo/c",
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Pragma", "no-cache");
          },
          success: function( objResponse ){
            var div = document.createElement( "div" );
            div.innerHTML = objResponse;
            var res = [];
            //console.log($("#listagemMangas li", div).size());
            $("#listagemMangas > ul > li", div).each(function(index) {
              //console.log($($("a", $(this))[0]).contents().size());
              res[res.length] = [$($("a", $(this))[0]).contents().filter(function(){ return this.nodeType == 3; }).text(), $("#lLancs a", $(this)).attr("href")];
            });
            callback("PunchMangas", res);
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
              $("#listagemCaps > ul > li", div).each(function(index) {
                res[res.length] = [$($("a", $(this))[0]).contents().filter(function(){ return this.nodeType == 3; }).text(), $("#menuOpcoes a", $(this)).attr("href")];
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
    var a = $("#paginaCaminho a[href^='http://www.punchmangas.com.br/listagem/']", doc);
    name = a.text();
    currentMangaURL = a.attr("href");
    currentChapter = $("#listaDeCaps option:selected", doc).text();
    currentChapterURL = $("#listaDeCaps option:selected", doc).val();
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
    var base;
    $("script", doc).each(function(index) {
      if ($(this).text().indexOf("jQuery.preLoadImages(\"") != -1) {
        var posdeb = $(this).text().indexOf("jQuery.preLoadImages(\"");
        var posfin = $(this).text().indexOf("\"", posdeb + 23);
        base = $(this).text().substring(posdeb + 22, posfin);
      }
    });
    $("#listaDePaginas option", doc).each(function(index) {
      var num = $(this).val();
      if (parseInt(num, 10) < 10) num = "0" + num;
      res[res.length] = base + num + ".jpg";
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
    //This function runs in the DOM of the current consulted page.
    return $("#imagemPagina", doc);
  },
  //This method returns places to write the navigation bar in the document
  //The returned elements won't be emptied.
  whereDoIWriteNavigation : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    return $("#controles", doc).add($("#leitorRodape", doc));
  },
  //Return true if the current page is a page containing scan.
  isCurrentPageAChapterPage : function(doc, curUrl) {
    return ($("#imagemAtual", doc).size() > 0);
  },
  //This method is called before displaying full chapters in the page
  doSomethingBeforeWritingScans : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("#controles", doc).empty();
    $("#leitorTopo", doc).css("height", "auto");
    $("#leitorRodape", doc).empty();
    $("#imagemPagina", doc).empty();
    $("#imagemPagina", doc).css("background-color", "black");
    $("#imagemPagina", doc).css("padding-top", "10px");
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
    return $("#listaDeCaps", doc);
  },
  //This function is called when the manga is full loaded. Just do what you want here...
  doAfterMangaLoaded : function(doc, curUrl) {
    //This function runs in the DOM of the current consulted page.
    $("body > div:empty", doc).remove();
  }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("PunchMangas", PunchMangas);
}