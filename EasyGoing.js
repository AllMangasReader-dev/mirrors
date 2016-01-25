var EasyGoing = {
    mirrorName : "Easy Going",
    canListFullMangas : true,
    mirrorIcon : "img/easygoing.png",
    languages : "en",
    isMe : function (url) {
        "use strict";
        return (url.match(/read\.egscans\.(com|org)/gi) !== null);
    },
    getMangaList : function (search, callback) {
        "use strict";
        $.ajax({
            url : "http://read.egscans.com/",
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success : function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img /gi, '<noload');
                $("select[name='manga'] option", div).each(function () {
                    if ($(this).attr('value') !== 0) {
                        res[res.length] = [$(this).text(), "http://read.egscans.com/" + $(this).attr('value')];
                    }
                });
                callback("Easy Going", res);
            }
        });
    },
    getListChaps : function (urlManga, mangaName, obj, callback) {
        "use strict";
        $.ajax({
            url : urlManga,
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success : function (objResponse) {
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img /gi, '<noload');
                $("select[name='chapter'] option", div).each(function (index) {
                    res[res.length] = [$(this).text(), urlManga + '/' + $(this).attr('value')];
                });
                res.reverse();
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage : function (doc, curUrl, callback) {
        "use strict";
        var name = $("select[name='manga'] option:selected", doc).text(),
            currentChapter = $("select[name='chapter'] option:selected", doc).text(),
            currentMangaURL = "http://read.egscans.com/" + $("select[name='manga'] option:selected", doc).attr('value'),
            currentChapterURL = currentMangaURL + '/' + $("select[name='chapter'] option:selected", doc).attr('value');
        callback({
            "name" : name,
            "currentChapter" : currentChapter,
            "currentMangaURL" : currentMangaURL,
            "currentChapterURL" : currentChapterURL
        });
    },
    getListImages : function (doc, curUrl) {
        "use strict";
        var res = [],
            img = [],
            txt,
            i;
        txt = $(".mid > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > script:nth-child(2)", doc).html();
        txt = JSON.stringify(txt);
        img = txt.match(/img_url\.push\(\'.+?\' \)/g);
        for (i = 0; img.length > i; i += 1) {
            res.push("http://read.egscans.com/" + img[i].match(/'(.*?)'/ig)[0].replace(/'/g, ""));
        }
        return res;
    },
    whereDoIWriteScans : function (doc, curUrl) {
        "use strict";
        return $('.imgAMR', doc);
    },
    whereDoIWriteNavigation : function (doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage : function (doc, curUrl) {
        "use strict";
        return ($("select[name='chapter']", doc).length > 0);
    },
    doSomethingBeforeWritingScans : function (doc, curUrl) {
        "use strict";
        $('td.mid', doc).empty();
        $('td.mid', doc).append($("<div class='navAMR'></div>"));
        $('td.mid', doc).append($("<div class='imgAMR'></div>"));
        $('td.mid', doc).append($("<div class='navAMR'></div>"));
        $(".navAMR").css("text-align", "center");
    },
    nextChapterUrl : function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").prev().size() !== 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl : function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").next().size() !== 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
        "use strict";
        $(image).attr("src", urlImg);
    },
    isImageInOneCol : function (img, doc, curUrl) {
        "use strict";
        return false;
    },
    getMangaSelectFromPage : function (doc, curUrl) {
        "use strict";
        return null;
    },
    doAfterMangaLoaded : function (doc, curUrl) {
        "use strict";
        $("body > div:empty", doc).remove();
        $('select', doc).css('background-color', 'white');
        $('option', doc).css('background-color', 'white').css('color', 'black');
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Easy Going", EasyGoing);
}