var AnimeA = {
    mirrorName: "AnimeA",
    canListFullMangas: false,
    mirrorIcon: "img/animea.png",
    languages: "en",
    isMe: function (url) {
        return (url.indexOf("manga.animea.net/") !== -1);
    },
    getMangaList: function (search, callback) {
        $.ajax({
            url: "http://manga.animea.net/browse.html?input=Search&title=" + search,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
                xhr.setRequestHeader("X-Set-Cookie", "skip=1");
                xhr.withCredentials = true;
            },
            success: function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img/g, '<noload');
                $(".mangalisttext a", div).each(function () {
                    res[res.length] = [$(this).text(), "http://manga.animea.net" + $(this).attr("href")];
                });
                callback("AnimeA", res);
            }
        });
    },
    getListChaps: function (urlManga, mangaName, obj, callback) {
        $.ajax({
            url: urlManga,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
                xhr.setRequestHeader("X-Set-Cookie", "skip=1");
                xhr.withCredentials = true;
            },
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/g, '<noload');
                var res = [];
                $("ul.chapterlistfull li > a", div).each(function () {
                    res[res.length] = [$(this).text(), "http://manga.animea.net" + $(this).attr("href")];
                });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        var name = $(".description h1 a", doc).text(),
            currentMangaURL = "http://manga.animea.net" + $(".description h1 a", doc).attr("href"),
            chapter = $('.description h1', doc).text(),
            currentChapter = chapter.replace(/Page.*/,'').trim(),
            currentChapterURL = "http://manga.animea.net/" + $('.scan a', doc).attr('href').replace(/-page.*/, '') + '.html';
        callback({
            "name": name,
            "currentChapter": currentChapter,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL
        });
    },
    getListImages: function (doc, curUrl) {
        var ref = curUrl;
        var pos = ref.search(/.html|-page/g);
        ref = ref.substr(0, pos) + "-page-";
        var res = [];
        $("select.mangaselecter.pageselect option", doc).each(function (index) {
            res[index] = ref + $(this).val() + ".html";
        });
        return res;
    },
    removeBanners: function (doc, curUrl) {
        $("iframe", doc).remove();
        $(".ads300", doc).remove();
    },
    whereDoIWriteScans: function (doc, curUrl) {
        return $(".h_contentmp", doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
        return ($("img.scanmr", doc).size() > 0);
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        $(".hca", doc).remove();
        $(".h_contentmp", doc).empty();
        $(".h_contentmp", doc).before($("<div>").addClass("navAMR"));
        $(".h_contentmp", doc).after($("<div>").addClass("navAMR"));
    },
    nextChapterUrl: function (select, doc, curUrl) {
        if ($(select).children("option:selected").prev().size() !== 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl: function (select, doc, curUrl) {
        if ($(select).children("option:selected").next().size() !== 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
        $.ajax({
            url: urlImg,
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src = $("img.scanmr", div).attr("src");
                $(image).attr("src", src);
            }
        });
    },
    isImageInOneCol: function (img, doc, curUrl) {
        return false;
    },
    getMangaSelectFromPage: function (doc, curUrl) {
        return null;
    },
    doAfterMangaLoaded: function (doc, curUrl) {
        $("body > div:empty", doc).remove();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("AnimeA", AnimeA);
}