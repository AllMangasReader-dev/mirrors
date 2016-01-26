var Imangascans = {
    mirrorName: "Imangascans",
    canListFullMangas: true,
    mirrorIcon: "img/imangascans.png",
    languages: "en",
    isMe: function (url) {
        "use strict";
        return (url.indexOf("reader.imangascans.org") !== -1);
    },
    getMangaList: function (search, callback) {
        "use strict";
        $.ajax({
            url: "https://reader.imangascans.org/",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $("select[name='manga'] option", div).each(function (index) {
                    if ($(this).attr('value') !== 0) {
                        res[res.length] = [$(this).text(),
                            'https://reader.imangascans.org/' + $(this).attr('value')
                        ];
                    }
                });
                callback("Imangascans", res);
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
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $("select[name='chapter'] option", div).each(function (index) {
                    res[res.length] = [$(this).text(), urlManga + '/' + $(this).attr(
                        'value')];
                });
                res.reverse();
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        "use strict";
        var name = $("select[name='manga'] option[selected]", doc).text();
        var currentChapter = $("select[name='chapter'] option[selected]", doc).text();
        var currentMangaURL = 'https://reader.imangascans.org/' + $("select[name='manga'] option[selected]",
            doc).attr('value');
        var currentChapterURL = currentMangaURL + '/' + $("select[name='chapter'] option[selected]", doc).attr(
            'value');
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
            img,
            imgUrl,
            base = /"pg_base":(".*?")/gi,
            pages = /"pages":(\[.*?\])/gi;
        imgUrl = "https://reader.imangascans.org/" + JSON.parse(base.exec($('body', doc).html())[1]);
        img = JSON.parse(pages.exec($('body', doc).html())[1]);
        res = $.map(img, function (val) {
            return imgUrl + val;
        });
        return res;
    },
    removeBanners: function (doc, curUrl) {
        "use strict";
    },
    whereDoIWriteScans: function (doc, curUrl) {
        "use strict";
        return $('.imgAMR', doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
        "use strict";
        return ($("select[name='chapter']", doc).length > 0);
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        "use strict";
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "$(document).unbind('keydown');";
            doc.body.appendChild(script);
        }
        $('td.mid', doc).empty();
        $('td.mid', doc).append($("<div class='navAMR'></div>"));
        $('td.mid', doc).append($("<div class='imgAMR'></div>"));
        $('td.mid', doc).append($("<div class='navAMR'></div>"));
        $(".navAMR").css("text-align", "center");
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
        $(image).attr("src", urlImg);
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
        $("body", doc).css('background-color', '#f5f5f5');
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Imangascans", Imangascans);
}