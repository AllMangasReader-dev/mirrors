var MangaReader = {
    mirrorName : "Manga Reader",
    canListFullMangas : false,
    mirrorIcon : "img/mangareader.png",
    languages : "en",
    isMe : function (url) {
        return (url.indexOf("www.mangareader.net") !== -1);
    },
    getMangaList : function (search, callback) {
        var urlManga = "http://www.mangareader.net/search/?w=" + search + "&rd=0&status=0&order=0&genre=0000000000000000000000000000000000000&p=0";
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
                $(".manga_name a", div).each(function (index) {
                    res[res.length] = [$(this).text(), "http://www.mangareader.net" + $(this).attr("href")];
                });
                callback("Manga Reader", res);
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
                var mangaName = $("#mangaproperties h1", div).text().replace("Manga", "").trim();
                $("#chapterlist #listing tr td:first-child a", div).each(function (index) {
                    res[res.length] = [$(this).text().replace(mangaName, "").trim(), "http://www.mangareader.net" + $(this).attr("href")];
                });
                res = res.reverse();
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage : function (doc, curUrl, callback) {
        var name = $($("#mangainfo h2.c2 a", doc)[0]).text().replace("Manga", "").trim();
        var mangaurl = "http://www.mangareader.net" + $($("#mangainfo h2.c2 a", doc)[0]).attr("href");
        var currentChapter = $("#mangainfo h1", doc).text().replace(name, "").trim();
        var curChapUrl = "http://www.mangareader.net" + $($("#mangainfo_son a", doc)[0]).attr("href");
        callback({
            "name" : name,
            "currentChapter" : currentChapter,
            "currentMangaURL" : mangaurl,
            "currentChapterURL" : curChapUrl
        });
    },
    getListImages : function (doc, curUrl) {
        res = [];
        $("#pageMenu option", doc).each(function (index) {
            res[res.length] = "http://www.mangareader.net" + $(this).val();
        });
        return res;
    },
    removeBanners : function (doc, curUrl) {
        $("iframe", doc).remove();
        $("#adtop", doc).remove();
    },
    whereDoIWriteScans : function (doc, curUrl) {
        return $("#imgholder", doc);
    },
    whereDoIWriteNavigation : function (doc, curUrl) {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage : function (doc, curUrl) {
        return ($("img", $("#imgholder", doc)).size() !== 0);
    },
    doSomethingBeforeWritingScans : function (doc, curUrl) {
        $("#imgholder", doc).empty();
        $("#imgholder", doc).css("width", "auto");
        $("#imgholder", doc).before("<div class='navAMR'></div>");
        $("#imgholder", doc).after("<div class='navAMR'></div>");
        $("#selection", doc).next().remove();
        $("#selection", doc).remove();
        $("#navi", doc).empty();
        $("#selectmanga", doc).empty();
        $("#wrapper_body", doc).css("width", "auto");
        $("#topchapter", doc).css("width", "950px");
        $("#topchapter", doc).css("text-align", "center");
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
        $.ajax({
            url : urlImg,
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src = $("#imgholder img", div).attr("src");
                $(image).attr("src", src);
            }
        });
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
	registerMangaObject("Manga Reader", MangaReader);
}