var Japanzai = {
    mirrorName: "Japanzai & XscansX",
    canListFullMangas: false,
    mirrorIcon: "img/japanzai.png",
    languages: "en",
    isMe: function (url) {
        "use strict";
        return (url.indexOf("reader.japanzai.com/") !== -1);
    },
    getMangaList: function (search, callback) {
        "use strict";
        $.ajax({
            url: "https://reader.japanzai.com/search/",
            type: 'POST',
            data: {
                'search': search
            },
            success: function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                $('.list .group .title a', div).each(function (index) {
                    res[res.length] = [$(this).attr('title'), $(this).attr('href')];
                });
                callback("Japanzai & XscansX", res);
            }
        });
    },
    getListChaps: function (urlManga, mangaName, obj, callback) {
        "use strict";
        $.ajax({
            url : urlManga,
            type : 'POST',
            data : {
                'adult' : true
            },
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
                xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
            },
            success: function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                $('.list .title a', div).each(function (index) {
                    res[res.length] = [$(this).attr('title'), $(this).attr('href')];
                });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        "use strict";
        var name = $('.tbtitle.dnone a:first', doc).text(),
            currentChapter = $('.tbtitle.dnone a:last', doc).text(),
            currentMangaURL = $('.tbtitle.dnone a:first', doc).attr("href"),
            currentChapterURL = $('.tbtitle.dnone a:last', doc).attr("href");
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
        $.ajax({
            url: curUrl,
            async: false,
            success: function (response) {
                var div = document.createElement("div"),
                    re1,
                    rel,
                    i,
                    imgstring,
                    imgarray,
                    re2,
                    p,
                    m,
                    txt,
                    sbraces1;
                div.innerHTML = response;
                txt = $("script", div).text();
                rel = "var pages="
                re1 = '.*?'; // Non-greedy match on filler
                re2 = '[{^(]*((.*))[^)}]'; // Square Braces 1
                p = new RegExp(rel + re1 + re2, ["i"]);
                m = p.exec(txt);
                if (m !== null) {
                    sbraces1 = m[1];
                    imgstring = sbraces1.replace(/</, "<").replace(" = ","").replace(/;([^;]*)$/,'$1').replace(/;.*/,"");
                    imgarray = JSON.parse(imgstring);
                    for (i = 0; i < imgarray.length; i += 1) {
                        res.push(imgarray[i].url);
                    }
                }
            }
        });
        return res;
    },
    removeBanners: function (doc, curUrl) {
        "use strict";
    },
    whereDoIWriteScans: function (doc, curUrl) {
        "use strict";
        return $('#page', doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
        "use strict";
        return (curUrl.search('reader.japanzai.com/read/') > -1);
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        "use strict";
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "changePage = function(){}; $(document).ready(function(){$(document).unbind('keydown');});";
            script.type = 'text/javascript';
            doc.body.appendChild(script);
        }
        $('#page', doc).css("max-width", "none");
        $('#page', doc).css("width", "100%");
        $("#page", doc).before("<div class='navAMR'></div>");
        $("#page", doc).after("<div class='navAMR'></div>");
        $("#page", doc).empty();
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
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Japanzai & XscansX", Japanzai);
}