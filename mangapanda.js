var mangapanda = {
    mirrorName: "Manga Panda",
    canListFullMangas: false,
    mirrorIcon: "img/mangapanda.png",
    languages: "en",
    isMe: function (url) {
        "use strict";
        return url.indexOf("www.mangapanda.com") !== -1;
    },
    getMangaList: function (search, callback) {
        "use strict";
        var urlManga = "http://www.mangapanda.com/search/?w=" + search;
        $.ajax({
            url: urlManga,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse;
                $(".mangaresultinner .manga_name a", div).each(function () {
                    res[res.length] = [$(this).text(), "http://www.mangapanda.com" + $(this).attr("href")];
                });
                callback("Manga Panda", res);
            }
        });
    },
    getListChaps: function (urlManga, mangaName, obj, callback) {
        "use strict";
        $.ajax({
            url: urlManga,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse;
                mangaName = $($("#mangaproperties h1", div)[0]).text().trim();
                if (mangaName.substr(mangaName.length - 5, 5) === "Manga") {
                    mangaName = mangaName.substring(0, mangaName.length - 5).trim();
                }
                $("#chapterlist #listing tr td:first-child", div).each(function () {
                    var txt = "",
                        inlink = $(this).children("a").attr("href");
                    $(this).contents().each(function () {
                        txt += $(this).text();
                    });
                    txt = txt.replace(mangaName.trim(), " ");
                    txt = txt.replace(/(\n| )+/g, " ");
                    res[res.length] = [txt.trim(), "http://www.mangapanda.com" + inlink];
                });
                res = res.reverse();
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        "use strict";
        var name = $($("#mangainfo h2.c2 a", doc)[0]).text().trim();
        if (name.substr(name.length - 5, name.length) === "Manga") {
            name = name.substr(0, name.length - 5);
        }
        var mangaurl = "http://www.mangapanda.com" + $($("#mangainfo h2.c2 a", doc)[0]).attr("href");
        var currentChapter = $("#mangainfo h1", doc).text();
        currentChapter = currentChapter.replace(name, "");
        var curChapUrl = "http://www.mangapanda.com" + $($("#mangainfo_son a", doc)[0]).attr("href");
        callback({
            "name": name.trim(),
            "currentChapter": currentChapter.trim(),
            "currentMangaURL": mangaurl.trim(),
            "currentChapterURL": curChapUrl.trim()
        });
    },
    getListImages: function (doc, curUrl) {
        "use strict";
        var res = [];
        $("#pageMenu option", doc).each(function (index) {
            res[res.length] = "http://www.mangapanda.com" + $(this).val();
        });
        return res;
    },
    removeBanners: function (doc, curUrl) {
        "use strict";
        $("iframe", doc).remove();
        $("#adtop", doc).remove();
    },
    whereDoIWriteScans: function (doc, curUrl) {
        "use strict";
        return $("#imgholder", doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        "use strict";
        return $("#navAMRav", doc).add($("#navAMRap", doc));
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
        "use strict";
        return $("img", $("#imgholder", doc)).size() !== 0;
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        "use strict";
        $("#imgholder", doc).empty();
        $("#imgholder", doc).css("width", "auto");
        $("#imgholder", doc).before($("<div id='navAMRav'></div>"));
        $("#imgholder", doc).after($("<div id='navAMRap'></div>"));
        $("#selection", doc).next().remove();
        $("#selection", doc).remove();
        $("#navAMRav", doc).css("text-align", "center");
        $("#navAMRap", doc).css("text-align", "center");
        $("#navi", doc).empty();
        $("#selectmanga", doc).empty();
        $("#wrapper_body", doc).css("width", "auto");
        $("#topchapter", doc).css("width", "950px");
        $("#topchapter", doc).css("text-align", "center");
    },
    nextChapterUrl: function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").prev().size() !== 0) return $(select).children("option:selected").prev().val();
        return null;
    },
    previousChapterUrl: function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").next().size() !== 0) return $(select).children("option:selected").next().val();
        return null;
    },
    getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
        "use strict";
        $.ajax({
            url: urlImg,
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src = $("#imgholder img", div).attr("src");
                $(image).attr("src", src);
            }
        })
    },
    isImageInOneCol: function (img, doc, curUrl) {
        "use strict";
        return false;
    },
    getMangaSelectFromPage: function (doc, curUrl) {
        "use strict";
        return null;
    },
    doAfterMangaLoaded: function (doc, curUrl) {
        "use strict";
        $("body > div:empty", doc).remove();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga Panda", mangapanda);
}