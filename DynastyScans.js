var DynastyScans = {
    mirrorName : "Dynasty Scans",
    canListFullMangas : false,
    mirrorIcon : "img/dynastyscans.png",
    languages : "en",
    isMe : function (url) {
        return (url.indexOf("dynasty-scans.com/") !== -1);
    },
    getMangaList : function (search, callback) {
        $.ajax({
            url : "http://dynasty-scans.com/search?q=" + search + "&type=series",
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $("a.name", div).each(function (index) {
                    res.push([$(this).text(), 'http://dynasty-scans.com' + $(this).attr('href')]);
                });
                callback("Dynasty Scans", res);
            }
        });
    },
    getListChaps : function (urlManga, mangaName, obj, callback) {
        $.ajax({
            url : urlManga,
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $("a.name", div).each(function (index) {
                    res.push([$(this).text(), 'http://dynasty-scans.com' + $(this).attr('href')]);
                });
                res.reverse();
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage : function (doc, curUrl, callback) {
        var name = $('#chapter-title a:first', doc).text();
        var currentChapter = $('#chapter-title b', doc).contents()[1].textContent.trim();
        var currentMangaURL = 'http://dynasty-scans.com' + $('#chapter-title a:first', doc).attr('href');
        var currentChapterURL = curUrl;
        callback({
            "name" : name,
            "currentChapter" : currentChapter,
            "currentMangaURL" : currentMangaURL,
            "currentChapterURL" : currentChapterURL
        });
    },
    getListImages : function (doc, curUrl) {
        var res = [];
        $.ajax({
            url : curUrl,
            async : false,
            success : function (response) {
                var div = document.createElement("div");
                div.innerHTML = response;
                var pages = JSON.parse($(div).html().match(/var pages = .*$/m)[0].replace(/^[^[]*|;$/g, ''));
                pages.forEach(function (page) {
                    res.push('http://dynasty-scans.com' + page.image);
                });
            }
        });
        return res;
    },
    removeBanners : function (doc, curUrl) {},
    whereDoIWriteScans : function (doc, curUrl) {
        return $('.imgAMR', doc);
    },
    whereDoIWriteNavigation : function (doc, curUrl) {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage : function (doc, curUrl) {
        return (curUrl.search('dynasty-scans.com/chapters/') > -1);
    },
    doSomethingBeforeWritingScans : function (doc, curUrl) {
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "$(document).unbind('keyup');";
            doc.body.appendChild(script);
        }
        $('#reader', doc).empty();
        $('#reader', doc).css('background-color', '#f4f4f4');
        $('#reader', doc).append("<div class='navAMR'></div>");
        $('#reader', doc).append("<div class='imgAMR'></div>");
        $('#reader', doc).append("<div class='navAMR'></div>");
        $(".navAMR", doc).css("text-align", "center");
      	$(".spanForImg", doc).css("float", "none");
    },
    nextChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").prev().size() !== 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").next().size() !== 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
        $(image).attr("src", urlImg);
    },
    isImageInOneCol : function (img, doc, curUrl) {
        return false;
    },
    getMangaSelectFromPage : function (doc, curUrl) {
        return null;
    },
    doAfterMangaLoaded : function (doc, curUrl) {
        $("body > div:empty", doc).remove();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Dynasty Scans", DynastyScans);
}