var Trinitybakuma = {
    mirrorName : "Trinity BAKumA",
    canListFullMangas : true,
    mirrorIcon : "img/trinitybakuma.png",
    languages : "en",
    isMe : function (url) {
        "use strict";
        return (url.indexOf("trinitybakuma.com/manga/") !== -1);
    },
    getMangaList : function (search, callback) {
        "use strict";
        $.ajax({
            url : "http://trinitybakuma.com/manga/",
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $(".selector2 .options a", div).each(function (index) {
                    res[res.length] = [$(this).attr("title").trim(), "http://trinitybakuma.com/manga/" + $(this).attr("href")];
                });
                callback("Trinity BAKumA", res);
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
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $(".theList .chapter", div).each(function (index) {
                    res[res.length] = [$("b", $(this)).text().trim(), "http://trinitybakuma.com/manga/" + $("a", $(this)).attr("href")];
                });
                callback(res, obj);
            }
        });
    },
    retrieveInfo : function (sel) {
        "use strict";
        var myobj = {};
        var curval = $(sel.contents()[0]).text();
        var pos = curval.indexOf(": ");
        curval = curval.substring(pos + 2, curval.length).trim();
        $("a", sel).each(function (index) {
            if ($(".option", $(this)).text().trim() === curval) {
                myobj = {
                    name : curval,
                    url : "http://trinitybakuma.com/manga/" + $(this).attr("href")
                };
            }
        });
        return myobj;
    },
    getInformationsFromCurrentPage : function (doc, curUrl, callback) {
        "use strict";
        var name;
        var currentChapter;
        var currentMangaURL;
        var currentChapterURL;
        var manga = Trinitybakuma.retrieveInfo($($(".selector2", doc)[0]));
        var chapter = Trinitybakuma.retrieveInfo($($(".selector2", doc)[1]));
        name = manga.name;
        currentChapter = chapter.name;
        currentChapterURL = chapter.url;
        currentMangaURL = manga.url;
        callback({
            "name" : name,
            "currentChapter" : currentChapter,
            "currentMangaURL" : currentMangaURL,
            "currentChapterURL" : currentChapterURL
        });
    },
    getListImages : function (doc, curUrl) {
        "use strict";
        var res = [];
        $("script", doc).each(function (index) {
            if ($(this).text().indexOf("imageArray = new Array();") !== -1) {
                var txt = $(this).text();
                var pos = txt.indexOf("imageArray[");
                while (pos !== -1) {
                    var debur = txt.indexOf("'", pos);
                    var finur = txt.indexOf("'", debur + 1);
                    res[res.length] = "http://trinitybakuma.com/manga/" + txt.substring(debur + 1, finur);
                    pos = txt.indexOf("imageArray[", finur + 1);
                }
            }
        });
        res.pop();
        return res;
    },
    removeBanners : function (doc, curUrl) {
        "use strict";
        $(".ads", doc).remove();
    },
    whereDoIWriteScans : function (doc, curUrl) {
        "use strict";
        return $(".scanAMR", doc);
    },
    whereDoIWriteNavigation : function (doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage : function (doc, curUrl) {
        "use strict";
        return ($("#theManga #thePic", doc).size() > 0);
    },
    doSomethingBeforeWritingScans : function (doc, curUrl) {
        "use strict";
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "$(document).unbind('keyup');";
            doc.body.appendChild(script);
        }
        $("#theManga", doc).empty();
        var cloned = $("#theManga", doc).clone();
        $("#theManga", doc).after(cloned);
        cloned.attr("id", "amrManga");
        $("#theManga", doc).remove();
        $("#amrManga", doc).css("width", "auto");
        $("#amrManga", doc).css("margin", "0");
        $("#theHead", doc).remove();
        $("<div class='navAMR'></div>").appendTo($("#amrManga", doc));
        $("<div class='scanAMR'></div>").appendTo($("#amrManga", doc));
        $("<div class='navAMR'></div>").appendTo($("#amrManga", doc));
        $(".navAMR", doc).css("text-align", "center");
    },
    nextChapterUrl : function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").next().size() !== 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    previousChapterUrl : function (select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").prev().size() !== 0) {
            return $(select).children("option:selected").prev().val();
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
        var sel = $($(".selector2", doc)[1]);
        var ret = $("<select></select>");
        var curval = $(sel.contents()[0]).text();
        var pos = curval.indexOf(": ");
        curval = curval.substring(pos + 2, curval.length).trim();
        $("a", sel).each(function (index) {
            var iscur = false;
            if ($(".option", $(this)).text().trim() === curval) {
                iscur = true;
            }
            $("<option value=\"" + "http://trinitybakuma.com/manga/" + $(this).attr("href") + "\"" + (iscur ? "selected=\"selected\"" : "") + ">" + $(".option", $(this)).text().trim() + "</option>").appendTo(ret);
        });
        return ret;
    },
    doAfterMangaLoaded : function (doc, curUrl) {
        "use strict";
        $("body > div:empty", doc).remove();
        $('#infoSpread').hide();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Trinity BAKumA", Trinitybakuma);
}