var MangaStream = {
    mirrorName: "MangaStream",
    canListFullMangas: true,
    mirrorIcon: "img/mangastream.png",
    languages: "en",
    isMe: function (url) {
        "use strict";
        return (url.match(/(mangastream|readms).com/g) !== null);
    },
    getMangaList: function (search, callback) {
        "use strict";
        $.ajax({
            url: "http://mangastream.com/manga",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                $('.table-striped strong a', div).each(function (index) {
                    res[index] = [$(this).text().trim(), $(this).attr('href')];
                });
                callback("MangaStream", res);
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
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                $('.table-striped a', div).each(function () {
                    res[res.length] = [$(this).text().trim(), $(this).attr("href")];
                });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        "use strict";
        var name = $('.dropdown-toggle .hidden-sm', doc)[0].innerText,
            currentChapter = $('.btn-group .dropdown-toggle', doc)[0].innerText.replace(name, '').trim(),
            currentMangaURL = $('.btn-group .dropdown-menu:first a:last', doc).attr('href'),
            currentChapterURL = $('.dropdown-menu:last a:first', doc).attr('href');
        callback({
            "name": name,
            "currentChapter": currentChapter,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL
        });
    },
    getListImages: function (doc, curUrl) {
        "use strict";
        var res = [];
        var last = $('.dropdown-menu:last li a:last', doc);
        var npages = parseInt(last.text().replace(/[^0-9]/g, ''));
        var baseUrl = last.attr('href').replace(/\/[^/]*$/g, '/');
        while (npages > 0)
        {
            res[npages - 1] = baseUrl + npages;
            npages--;
        }
        return res;
    },
    removeBanners: function (doc, curUrl) {
        "use strict";
        $('.banner-ad', doc).remove();
        $('#reader-sky', doc).appendTo('.row-fluid.page-wrap', doc);
        $('#reader-sky', doc).css('margin-left', 'auto');
        $('#reader-sky', doc).css('margin-right', 'auto');
        $('#reader-sky', doc).css('left', 'auto');
        $('#reader-sky', doc).css('right', 'auto');
        $('#reader-sky', doc).css('position', 'relative');
    },
    whereDoIWriteScans: function (doc, curUrl) {
        "use strict";
        return $(".scanAMR", doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
        "use strict";
        return ($("#manga-page", doc).size() > 0);
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        "use strict";
        $(".page", doc).empty();
        $(".page", doc).css("width", "auto");
        $(".sub-nav", doc).hide();
        $(".page", doc).append("<div class='navAMR'></div>");
        $(".page", doc).append("<div class='scanAMR'></div>");
        $(".page", doc).append("<div class='navAMR'></div>");
        $(".navAMR", doc).css("text-align", "center");
    },
    nextChapterUrl: function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").prev().size() !== 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl: function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").next().size() !== 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
        "use strict";
        $.ajax({
            url: urlImg,
            success: function (objResponse) {
                var div = document.createElement("div"),
                    src;
                div.innerHTML = objResponse;
                src = $("img#manga-page", div).attr("src");
                $(image).attr("src", src);
            }
        });
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
	registerMangaObject("MangaStream", MangaStream);
}