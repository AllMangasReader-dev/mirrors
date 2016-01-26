var GoodManga = {
    mirrorName : "GoodManga",
    canListFullMangas : false,
    mirrorIcon : "img/goodmanga.png",
    languages : "en",
    isMe : function (url) {
        return (url.indexOf("www.goodmanga.net/") != -1);
    },
    getMangaList : function (search, callback) {
        $.ajax({
            url : "http://www.goodmanga.net/manga-search?key=" + search + "&search=Go" + "",
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $(".series_list .right_col h3 a:first-child", div).each(function (index) {
                    res[res.length] = [$(this).text().trim(), $(this).attr("href")];
                });
                callback("GoodManga", res);
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
                $("#chapters ul li a", div).each(function (index) {
                    res[res.length] = [$(this).text().trim(), $(this).attr("href")];
                });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage : function (doc, curUrl, callback) {
        var name = $("#content #manga_head h1 a", doc).text();
        var nameurl = $("#content #manga_head h1 a", doc).attr("href");
        var curChapName = $("select.chapter_select:first option:selected", doc).text();
        var chapurl = $("#page #content #assets #asset_1 select.chapter_select:first option:selected", doc).val();
        callback({
            "name" : name,
            "currentChapter" : curChapName,
            "currentMangaURL" : nameurl,
            "currentChapterURL" : chapurl
        });
    },
    getListImages : function (doc, curUrl2) {
        var res = [];
        $("#page #content #assets #asset_2 select.page_select:first option", doc).each(function (index) {
            res[res.length] = $(this).val();
        });
        return res;
    },
    removeBanners : function (doc, curUrl) {
        $("#mv_ad_top", doc).remove();
        $("#mv_ad_bottom", doc).remove();
    },
    whereDoIWriteScans : function (doc, curUrl) {
        return $("#manga_viewer", doc);
    },
    whereDoIWriteNavigation : function (doc, curUrl) {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage : function (doc, curUrl) {
        return ($("div#content div#manga_viewer img", doc).size() > 0);
    },
    doSomethingBeforeWritingScans : function (doc, curUrl) {
        $("#manga_nav_top", doc).remove();
        $("#manga_nav_bottom", doc).remove();
        $("#manga_viewer", doc).empty();
        $("#manga_viewer", doc).before("<div class='navAMR'></div>");
        $("#manga_viewer", doc).after("<div class='navAMR'></div>");
        $(".navAMR", doc).css("text-align", "center");
        $("#content", doc).css("background-color", "black");
        $("#manga_viewer", doc).css("padding-top", "10px");
    },
    nextChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").next().size() != 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    previousChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").prev().size() != 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
        $.ajax({
            url : urlImg,
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src = $("#manga_viewer img", div).attr("src");
                $(image).attr("src", src);
            }
        });
    },
    isImageInOneCol : function (img, doc, curUrl) {
        return false;
    },
    getMangaSelectFromPage : function (doc, curUrl) {
        $("select#bottom_chapter_list:first option", doc).each(function (index) {
            $(this).val("http://www.goodmanga.net" + $(this).val());
        });
        return $("select.chapter_select:first", doc);
    },
    doAfterMangaLoaded : function (doc, curUrl) {
        $("body > div:empty", doc).remove();
    }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("GoodManga", GoodManga);
}