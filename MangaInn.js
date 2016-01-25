var MangaInn = {
    mirrorName : "MangaInn",
    canListFullMangas : false,
    languages : "en",
    isMe : function (url) {
        return (url.indexOf("mangainn.me/") !== -1);
    },
    getMangaList : function (search, callback) {
        $.ajax({
            url : "http://www.mangainn.me/advresults",
            type : 'POST',
            data : {
                "seriestype" : "c",
                "series" : search,
                "authortype" : "c",
                "artisttype" : "c",
                "yeartype" : "o"
            },
            beforeSend : function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            },
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $(".content .TurqHeadLabel", div).each(function (index) {
                    res[res.length] = [$(this).text().trim(), 'http://www.mangainn.me/manga/' + $(this).attr("onclick").toString().replace("function onclick(event) {", "").replace("MangaInfo", "").replace("}", "").replace("('", "").replace("')", "").trim()];
                });
                res.sort(function (a, b) {
                    return ((a[0].toLowerCase() < b[0].toLowerCase()) ? -1 : ((a[0] === b[0]) ? 0 : 1));
                });
                callback("MangaInn", res);
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
            complete : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.responseText.replace(/<img/gi, '<noload');
                var res = [];
                $(".divThickBorder:last .BlackLabel14 a", div).each(function () {
                    if ($(this).text().trim() !== "") {
                        var name = $(this)[0].innerText.replace(mangaName, '').trim();
                        name = name.replace(' :', ':');
                        res[res.length] = [name, $(this)[0].href];
                    }
                });
                res.reverse();
                callback(res, obj);
            }
        });
    },
    isCurrentPageAChapterPage : function (doc, curUrl) {
        return (curUrl.search('www.mangainn.me/manga/chapter') > -1);
    },
    getInformationsFromCurrentPage : function (doc, curUrl, callback) {
        var name = $('#gotoMangaInfo', doc).text();
        var currentChapter = $('#chapters option:selected', doc).text().replace(name, '').trim();
        var currentMangaURL = $('#gotoMangaInfo', doc).attr('href');
      var currentChapterURL = "http://www.mangainn.me/manga/chapter/" + $("#chapters option:selected", doc).val();
        callback({
            "name" : name,
            "currentChapter" : currentChapter,
            "currentMangaURL" : currentMangaURL,
            "currentChapterURL" : currentChapterURL
        });
    },
    getListImages : function (doc, curUrl) {
        var res = [];
        $('#cmbpages > option', doc).each(function () {
            if (this.value > 0) {
                res.push(curUrl.substr(0, curUrl.length) + '/page_' + this.value);
            }
        });
        return res;
    },
    getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
        $.ajax({
            url : urlImg,
            success : function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src = $("img#imgPage", div).attr("src");
                $(image).attr("src", src);
            }
        });
    },
    removeBanners : function (doc, curUrl) {
        $("#divmangareadtopad", doc).remove();
        $("#divmangareadtopad2", doc).remove();
    },
    whereDoIWriteScans : function (doc, curUrl) {
        return $(".scanAMR", doc);
    },
    whereDoIWriteNavigation : function (doc, curUrl) {
        return $(".navAMR", doc);
    },
    doSomethingBeforeWritingScans : function (doc, curUrl) {
        $(".boscontent", doc).after("<div class='amrcontainer'></div>");
        $(".boscontent", doc).empty();
      	$(".footer", doc).hide();
        $(".amrcontainer", doc).append("<div class='navAMR widepage'></div>");
        $(".amrcontainer", doc).append("<div class='scanAMR widepage'></div>");
        $(".amrcontainer", doc).append("<div class='navAMR widepage'></div>");
    },
    nextChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").next().size() !== 0) {
            return "http://www.mangainn.me/manga/chapter/" + $(select).children("option:selected").next().val();
        }
        return null;
    },
    previousChapterUrl : function (select, doc, curUrl) {
        if ($(select).children("option:selected").prev().size() !== 0) {
            return "http://www.mangainn.me/manga/chapter/" + $(select).children("option:selected").prev().val();
        }
        return null;
    },
    isImageInOneCol : function (img, doc, curUrl) {
        return false;
    },
    getMangaSelectFromPage : function (doc, curUrl) {
        return $("#chapters", doc);
    },
    doAfterMangaLoaded : function (doc, curUrl) {
        $("body > div:empty", doc).remove();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("MangaInn", MangaInn);
}