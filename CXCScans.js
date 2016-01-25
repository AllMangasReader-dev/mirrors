var CXCScans = {
    mirrorName : "CXC Scans",
    canListFullMangas : false,
    mirrorIcon : "img/cxcscans.png",
    languages: "en",
    isMe : function(url) {
        return (url.indexOf("manga.cxcscans.com") != -1);
    },
    getMangaList : function(search, callback) {
        $.ajax(
            {
                url: "http://manga.cxcscans.com/search",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Cache-Control", "no-cache");
                    xhr.setRequestHeader("Pragma", "no-cache");
                    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
                },
                type: 'POST',
                data: {
                    'search': search
                },
                success: function(objResponse){
                    var div = document.createElement("div"),
                        res = [];
                    div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                    $('.panel .group > .title a', div).each(function(index) {
                        res[res.length] = [$(this).attr('title'), $(this).attr('href')];
                    });
                    callback("CXC Scans", res);
                }
            });
    },
    getListChaps : function(urlManga, mangaName, obj, callback) {
        $.ajax(
            {
                url: urlManga,
                data : {
                    'adult' : true
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Cache-Control", "no-cache");
                    xhr.setRequestHeader("Pragma", "no-cache");
                    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
                },
                success: function(objResponse){
                    var div = document.createElement( "div" );
                    div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                    var res = [];
                    $('.list .group .title a', div).each(function(index) {
                        res[res.length] = [$(this).attr('title'), $(this).attr('href')];
                    });
                    callback(res, obj);
                }
            });
    },
    getInformationsFromCurrentPage : function(doc, curUrl, callback) {
        var name = $('.tbtitle div a', doc)[0].title;
        var currentChapter = $('.tbtitle div a', doc)[1].text;
        var currentMangaURL = $('.tbtitle div a', doc)[0].href;
        var currentChapterURL = $('.tbtitle div a', doc)[1].href;
        callback({"name": name,
                  "currentChapter": currentChapter,
                  "currentMangaURL": currentMangaURL,
                  "currentChapterURL": currentChapterURL});
    },
    getListImages : function(doc, curUrl) {
        var res = [],
            pages = JSON.parse($('body', doc).html().match(/pages\s?=\s?.*];/)[0].replace(/pages\s?=\s?/,"").replace(/;$/,""));
        pages.forEach(function(page) {
            res.push(page.url);
        });
        return res;
    },
    removeBanners : function(doc, curUrl) {
        $(".ads", doc).remove();
    },
    whereDoIWriteScans : function(doc, curUrl) {
        return $('#page', doc);
    },
    whereDoIWriteNavigation : function(doc, curUrl) {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage : function(doc, curUrl) {
        return (curUrl.search('manga.cxcscans.com/read/') > -1);
    },
    doSomethingBeforeWritingScans : function(doc, curUrl) {
        if (typeof doc.createElement == 'function') {
            script = doc.createElement('script');
            script.innerText = "$(document).unbind('keydown');";
            doc.body.appendChild(script);
        }
        $("#page", doc).before($("<div class='navAMR'></div>"));
        $("#page", doc).after($("<div class='navAMR'></div>"));
        $("#page", doc).empty();
        $("#page", doc).css("width", "auto");
        $("#page", doc).css("max-width", "none");
        $(".navAMR").css("text-align", "center");
        $(window).resize(function() {
            $("#page", doc).css("max-width", "none");
            $("#page", doc).css("width", "auto");
        });
    },
    nextChapterUrl : function(select, doc, curUrl) {
        if ($(select).children("option:selected").prev().size() != 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl : function(select, doc, curUrl) {
        if ($(select).children("option:selected").next().size() != 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite : function(urlImg, image, doc, curUrl) {
        $(image).attr("src", urlImg);
    },
    isImageInOneCol : function(img, doc, curUrl) {
        return false;
    },
    getMangaSelectFromPage : function(doc, curUrl) {
        return null;
    },
    doAfterMangaLoaded : function(doc, curUrl) {
        $("body > div:empty", doc).remove();
        $("#page", doc).css("width", "auto");
        $("#page", doc).css("max-width", "none");
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("CXC Scans", CXCScans);
}