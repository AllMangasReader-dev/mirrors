var MangaFox = {
    mirrorName: "Manga-Fox",
    canListFullMangas: false,
    mirrorIcon: "img/mangafox.png",
    languages: "en",
    isMe: function(url) {
        "use strict";
        return (url.indexOf("mangafox") !== -1);
    },
    getMangaList: function(search, callback) {
        "use strict";
        var urlManga = "http://mangafox.me/search.php?name=" + search +
            "&advopts=1";
        $.ajax({
            url: urlManga,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Cache-Control",
                    "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function(objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                if (objResponse.indexOf("No Manga Series") !==
                    -1) {
                    callback("Manga-Fox", []);
                } else {
                    var res = [];
                    $("#listing tr td:first-child a", div).each(
                        function(index) {
                            res[index] = [$(this).html(),
                                $(this).attr("href")
                            ];
                        });
                    callback("Manga-Fox", res);
                }
            }
        });
    },
    getListChaps: function(urlManga, mangaName, obj, callback) {
        "use strict";
        $.ajax({
            url: urlManga + "?no_warning=1",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Cache-Control",
                    "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function(objResponse) {
                var div = document.createElement("div");
                objResponse = objResponse.replace(/<img\b[^>]*>/ig, ''); //avoid loading cover image
                div.innerHTML = objResponse;
                var res = [];
                var mangaName = $('#title h2', div).text().substr(
                    5, $('#title h2', div).text().length -
                    18);
                $("ul.chlist h3, ul.chlist h4", div).each(
                    function(index) {
                        if ($('a', $(this)).attr("href")
                            .indexOf("/manga/") !== -1) {
                            var vol = $(this).parents(
                                    'ul.chlist').prev(
                                    'div.slide').children(
                                    'h3').contents(
                                    ':not(span)').text()
                                .trim().substr(7);
                            var tit = 'Vol ' + vol +
                                ' Ch ' + $('a', $(this))
                                .text().substr(
                                    mangaName.length +
                                    1) + ': ' + $(
                                    'span.title', $(
                                        this)).text();
                            var url = $('a', $(this)).attr(
                                "href");
                            var curChapURL = url.substr(
                                0, url.lastIndexOf(
                                    "/") + 1);
                            if (curChapURL.substr(
                                curChapURL.length -
                                2, 2) === "//") {
                                curChapURL = curChapURL
                                    .substr(0,
                                        curChapURL.length -
                                        1);
                            }
                            res[res.length] = [tit.trim(),
                                curChapURL
                            ];
                        }
                    });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function(doc, curUrl, callback) {
        "use strict";
        var str = $('#series > strong a', doc).text(); // dom lookups are expensive!
        var name = $('#related > h3 a', doc).text() || str.substring(0,
            str.length - 6); //falls through #related, into #series
        var currentChapter = $("#series h1", doc).text();
        var url = curUrl;
        var posSl5 = 0;
        var i;
        for (i = 0; i < 5; i += 1) {
            posSl5 = url.indexOf("/", posSl5 + 1);
        }
        var curChapURL = url.substr(0, url.lastIndexOf("/") + 1);
        if (curChapURL.substr(curChapURL.length - 2, 2) === "//") {
            curChapURL = curChapURL.substr(0, curChapURL.length - 1);
        }
        callback({
            "name": name,
            "currentChapter": currentChapter.trim(),
            "currentMangaURL": url.substr(0, posSl5 + 1),
            "currentChapterURL": curChapURL
        });
    },
    getListImages: function(doc, curUrl) {
        "use strict";
        var res = [];
        $('#top_bar select.m option', doc).each(function() {
            if (this.value > 0) {
                res.push(curUrl.substr(0, curUrl.lastIndexOf(
                    "/") + 1) + this.value + '.html');
            }
        });
        return res;
    },
    removeBanners: function(doc, curUrl) {
        "use strict";
        $("#bottom_ads", doc).remove();
        $('#MarketGid9463', doc).remove();
        $('.ad', doc).remove();
        $('#banner', doc).remove();
    },
    whereDoIWriteScans: function(doc, curUrl) {
        "use strict";
        return $("#viewer", doc);
    },
    whereDoIWriteNavigation: function(doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function(doc, curUrl) {
        "use strict";
        if ($("#viewer", doc) !== null) {
            return ($("#viewer", doc).size() !== 0);
        }
        return false;
    },
    doSomethingBeforeWritingScans: function(doc, curUrl) {
        "use strict";
        $('#viewer', doc).css({
            'width': 'auto',
            'margin': 'auto',
            'background-color': 'black'
        });
        $("#image", doc).remove();
        $("#tool", doc).next().remove();
        $("#viewer", doc).after("<div class='navAMR'></div>").before(
            "<div class='navAMR'></div>");
        $(".widepage.page", doc).remove();
        $('.fb_iframe_widget', doc).remove();
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "$(document).unbind('keydown');";
            doc.body.appendChild(script);
        }
    },
    nextChapterUrl: function(select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").prev().size() !== 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl: function(select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").next().size() !== 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite: function(urlImg, image, doc, curUrl) {
        "use strict";
        $.ajax({
            url: urlImg,
            success: function(objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src = $('#image').attr('src') || $("meta[property='og:image']", div).attr("content").replace(/thumbnails\/(?:mini.)?/, "compressed/");
                $(image).attr("src", src);
            }
        });
    },
    isImageInOneCol: function(img, doc, curUrl) {
        "use strict";
        return false;
    },
    getMangaSelectFromPage: function(doc, curUrl) {
        "use strict";
        return null;
    },
    doAfterMangaLoaded: function(doc, curUrl) {
        "use strict";
        $("body > div:empty", doc).remove();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga-Fox", MangaFox);
}