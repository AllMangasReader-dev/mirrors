var TheSpectrum = {
    mirrorName: "The Spectrum",
    canListFullMangas: true,
    mirrorIcon: "img/thespectrum.png",
    languages: "en",
    isMe: function (url) {
        return (url.indexOf("thespectrum.net/") != -1 || url.indexOf("mangamonger.com/") != -1);
    },
    getMangaList: function (search, callback) {
        $.ajax({
            url: "http://www.thespectrum.net/manga_scans/",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var res = [];
                $("span#all a", div).each(function (index) {
                    if (index > 1) {
                        res[res.length] = [$(this).text(), "http://www.thespectrum.net" + $(this).attr("href")];
                    }
                });
                callback("The Spectrum", res);
            }
        });
    },
    getListChaps: function (urlManga, mangaName, obj, callback) {
        $.ajax({
            url: urlManga,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var linka;
                $("a", $($("#mainmid .mainbgtop > p", div))).each(function (index) {
                    if (linka == undefined && $(this).attr("target") != "" && $(this).attr("target") != "_blank" && $(this).attr("href").indexOf("thespectrum.net/") != -1) {
                        linka = $(this).attr("href");
                    }
                });
                $.ajax({
                    url: linka,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Cache-Control", "no-cache");
                        xhr.setRequestHeader("Pragma", "no-cache");
                    },
                    success: function (resp) {
                        var div2 = document.createElement("div");
                        div2.innerHTML = resp;
                        var res = [];
                        $(".viewerLabel .selectchapter option", div2).each(function (index) {
                            res[res.length] = [$(this).text(), linka + "?ch=" + $(this).val() + "&page=1"];
                        });
                        res.reverse();
                        callback(res, obj);
                    }
                });
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        var currentMangaURL;
        var nameManga;
        var currentChapter;
        var currentChapterURL;
        currentMangaURL = "";
        $(".viewerLabel", $("#mainGallery .post form[name='pageSelector1']", doc)).each(function (index) {
            if (nameManga == undefined && !$(this).hasClass("hidden")) {
                nameManga = $(this).text().trim();
            }
        });
        chrome.extension.sendRequest({
            action: "getListManga",
            mirror: "The Spectrum"
        }, function (res) {
            var tmpNM = nameManga.replace(/[^a-zA-Z0-9]/g, "");
            for (var i = 0; i < res.length; i++) {
                if (tmpNM == res[i][0].replace(/[^a-zA-Z0-9]/g, "")) {
                    currentMangaURL = res[i][1];
                    nameManga = res[i][0];
                    break;
                }
            }
            currentChapter = $(".viewerLabel .selectchapter option:selected", doc).text();
            chrome.extension.sendRequest({
                action: "getListChap",
                mirror: "The Spectrum",
                mangaUrl: currentMangaURL,
                mangaName: nameManga
            }, function (res) {
                var base = res[0][1];
                if (base.indexOf(".html") != -1) {
                    var pos = base.indexOf(".html");
                    base = base.substr(0, pos) + ".html";
                }
                else {
                    var pos = base.lastIndexOf("/");
                    base = base.substr(0, pos) + "/";
                }
                currentChapterURL = base + "?ch=" + $(".viewerLabel .selectchapter option:selected", doc).val() + "&page=1";
                callback({
                    "name": nameManga,
                    "currentChapter": currentChapter,
                    "currentMangaURL": currentMangaURL,
                    "currentChapterURL": currentChapterURL
                });
            });
        });
    },
    getListImages: function (doc, curUrl) {
        var ref = curUrl;
        pos = ref.lastIndexOf(".html");
        if (pos != -1) {
            ref = ref.substr(0, pos) + ".html?ch=" + $(".viewerLabel .selectchapter option:selected", doc).text() + "&page=";
        }
        else {
            pos = ref.lastIndexOf("/");
            ref = ref.substr(0, pos) + "/?ch=" + $(".viewerLabel .selectchapter option:selected", doc).text() + "&page=";
        }
        var res = [];
        $(".viewerLabel select.selectpage  option", doc).each(function (index) {
            res[index] = ref + $(this).val();
        });
        return res;
    },
    removeBanners: function (doc, curUrl) {
        $("iframe", doc).remove();
    },
    whereDoIWriteScans: function (doc, curUrl) {
        return $(".scansAMR", doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
      return (curUrl.search('view.thespectrum.net/series/') > -1)
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        if ($("#midtable", doc).size() > 0) {
            $("#midtable", doc).wrap($("<div class='scansAMR'></div>"));
            $("#midtable", doc).remove();
            $(".scansAMR", doc).before($("<div class='navAMR'></div>"));
            $(".scansAMR", doc).after($("<div class='navAMR'></div>"));
            $(".navAMR", doc).css("text-align", "center");
        }
        else {
            $("body > table", doc).css("display", "none");
            $("body > table", doc).after($("<div class='navAMR'></div>"));
            $("body > table", doc).next().after($("<div class='scansAMR'></div>"));
            $("body > table", doc).next().next().after($("<div class='navAMR'></div>"));
            $(".navAMR", doc).css("text-align", "center");
        }
    },
    nextChapterUrl: function (select, doc, curUrl) {
        if ($(select).children("option:selected").next().size() != 0) {
            var chap = $(select).children("option:selected").next().val();
            return chap;
        }
        return null;
    },
    previousChapterUrl: function (select, doc, curUrl) {
        if ($(select).children("option:selected").prev().size() != 0) {
            var chap = $(select).children("option:selected").prev().val();
            return chap;
        }
        return null;
    },
    getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
        $.ajax({
            url: urlImg,
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src;
                if (curUrl.indexOf("view.thespectrum.net") != -1) {
                    src = $(".imgContainer img#mainimage", div).attr("src");
                }
                else {
                    src = "http://view.mangamonger.com" + $(".imgContainer img#mainimage", div).attr("src");
                }
                $(image).attr("src", src);
            }
        });
    },
    isImageInOneCol: function (img, doc, curUrl) {
        return false;
    },
    getMangaSelectFromPage: function (doc, curUrl) {
        $(".viewerLabel .selectchapter option", doc).each(function (index) {
            var base = $("#mainGallery .post h1 > a", doc).attr("href");
            if (base == undefined || base.length == 0) {
                base = $("#head #title a", doc).attr("href");
            }
            $(this).val(base + "?ch=" + $(this).val() + "&page=1");
        });
        return $(".viewerLabel .selectchapter", doc);
    },
    doAfterMangaLoaded: function (doc, curUrl) {
        $("body > div:empty", doc).remove();
    },
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("The Spectrum", TheSpectrum);
}