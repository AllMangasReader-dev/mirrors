var ExtrasScans = {
    mirrorName : "Extras Scans",
    canListFullMangas : false,
    mirrorIcon : "img/ExtrasScans.png",
    languages : "en",
    isMe : function (url) {
        return (url.indexOf("slide.extrascans.net") !== -1);
    },
    getMangaList : function (search, callback) {
        $.ajax({
            url : "http://slide.extrascans.net/search/",
            type : 'POST',
            data : {
                'search' : search
            },
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $('.list > .group > .title > a', div).each(function (index) {
                    res[res.length] = [$(this).attr('title'), $(this).attr('href')];
                });
                callback("Extras Scans", res);
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
                $('.list > .release > .title > a', div).each(function (index) {
                    res[res.length] = [$(this).attr('title'), $(this).attr('href')];
                });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage : function (doc, curUrl, callback) {
        var name = $("title", doc).text().split(" :: ")[0];
        var currentChapter = $(".btn-group:eq(0) button.dropdown-toggle", doc).text().trim();
        var currentMangaURL = $(".controls > a", doc).attr("href");
        var currentChapterURL = $("a[title=\""+currentChapter+"\"]", doc).attr("href");
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
                    res.push(page.url);
                });
            }
        });
        return res;
    },
    removeBanners : function (doc, curUrl) {
        $(".ads", doc).remove();
    },
    whereDoIWriteScans : function (doc, curUrl) {
        return $('.content', doc);
    },
    whereDoIWriteNavigation : function (doc, curUrl) {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage : function (doc, curUrl) {
        return (curUrl.search('slide.extrascans.net/read/') > -1);
    },
    doSomethingBeforeWritingScans : function (doc, curUrl) {
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "$(document).off('keydown');";
            script.type = "text/javascript";
            doc.body.appendChild(script);
        }
        $(".content", doc).before("<div class='navAMR'></div>");
        $(".content", doc).after("<div class='navAMR'></div>");
        $(".content", doc).empty();
        $(".content", doc).css("width", "auto");
        $(".content", doc).css("max-width", "none");
        $(".navAMR").css("text-align", "center");
        $(".controls").hide()
        $(window).resize(function () {
            $(".content", doc).css("max-width", "none");
            $(".content", doc).css("width", "auto");
        });
    },
    nextChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").prev().length !== 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").next().length !== 0) {
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
	registerMangaObject("Extras Scans", ExtrasScans);
}