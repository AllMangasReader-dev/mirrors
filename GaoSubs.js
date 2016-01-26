var GaoSubs = {
    mirrorName: "Gao-subs",
    canListFullMangas: false,
    mirrorIcon: "img/gaosubs.png",
    languages: "en",
    isMe: function (url) {
        "use strict";
        return (url.search(/(gao-subs|gaomanga)\.com/g) > -1);
    },
    getMangaList: function (search, callback) {
        "use strict";
        $.ajax({
            url: "http://www.gaomanga.com/search/search.php?search=" + search,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                $('.mangaDisplay', div).each(function (index) {
                    res.push([$('.mangaNfo', this).text(), 'http://www.gaomanga.com' + $('a', this).attr('href')]);
                });
                callback("Gao-subs", res);
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
                $('.fullLink:odd', div).each(function (index) {
                    res.push([this.firstChild.textContent.trim(), 'http://www.gaomanga.com' + $(this).attr('href')]);
                });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        "use strict";
        var name = $('#searchBar a:last', doc).text(),
            info = $("script", doc).text().match(/write_select_chapters\(.*?\)/)[0].split(","),
            currentChapter = $('.chapterNavigator select option:selected', doc).text(),
            currentMangaURL = 'http://www.' + (curUrl.indexOf('subs') !== -1 ? 'gao-subs.com' : 'gaomanga.com') + $('#searchBar a:last', doc).attr('href'),
            currentChapterURL = currentMangaURL + "volume_" + info[1].trim().replace(/[^0-9.]/g, "") + "/" + "chapter_" + info[2].trim().replace(/[^0-9.]/g, "") + "/";
        callback({
            "name": name,
            "currentChapter": currentChapter,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL
        });
    },
    getListImages: function (doc, curUrl) {
        "use strict";
        var res = [],
            basename = curUrl.substr(0, curUrl.lastIndexOf('/') + 1) + $('#slice0', doc).attr('src').substr(0, $('#slice0', doc).attr('src').indexOf('_') + 1),
            pages = parseInt($('.pageNavigator select:first option:last', doc).attr('value'), 10),
            i;
        for (i = 0; i < pages; i += 1) {
            res.push(basename + (i / 10000).toFixed(4).substr(2) + '.jpg');
        }
        return res;
    },
    removeBanners: function (doc, curUrl) {
        "use strict";
        $('#topAd, #adDivRight, #adDivLeft', doc).remove();
    },
    whereDoIWriteScans: function (doc, curUrl) {
        "use strict";
        return $('.scanAMR', doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
        "use strict";
        return ($('#belowTitle', doc).length > 0);
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        "use strict";
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "document['onkeyup'] = {};";
            doc.body.appendChild(script);
        }
        $('.chapterTitle', doc).css('min-width', '');
        $('.chapterTitle', doc).css('width', '100%');
        $('.pageNavigator', doc).hide();
        $('#midManga', doc).hide();
        $('.note', doc).hide();
        $("#belowTitle", doc).prepend($("<div class='navAMR'></div>"));
        $("#belowTitle", doc).prepend($("<div class='scanAMR'></div>"));
        $("#belowTitle", doc).prepend($("<div class='navAMR'></div>"));
        $(".navAMR", doc).css("text-align", "center");
    },
    nextChapterUrl: function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").prev().size() > 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl: function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").next().size() > 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
        "use strict";
        $(image).attr("src", urlImg);
    },
    isImageInOneCol: function (img, doc, curUrl) {
        "use strict";
        return false;
    },
    getMangaSelectFromPage: function (doc, curUrl) {
        "use strict";
        var chpinfo = [];
        $("#select_ch option").each(function () {
            $(this).val().split(';')
            chpinfo.push($(this).val().split(';'))
        });
        return null;
    },
    doAfterMangaLoaded: function (doc, curUrl) {
        "use strict";
        $("body > div:empty", doc).remove();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Gao-subs", GaoSubs);
}