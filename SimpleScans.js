var SimpleScans = {
    mirrorName: "Simple Scans",
    canListFullMangas: false,
    mirrorIcon: "img/simplescans.png",
    languages: "en",
    isMe: function (e) {
        return e.indexOf("www.simple-scans.com/slide/") !== -1
    },
    getMangaList: function (e, t) {
        $.ajax({
            url: "http://www.simple-scans.com/slide/search/",
            type: "POST",
            data: {
                search: e
            },
            beforeSend: function (e) {
                e.setRequestHeader("Cache-Control", "no-cache");
                e.setRequestHeader("Pragma", "no-cache")
            },
            success: function (e) {
                var n = document.createElement("div");
                n.innerHTML = e.replace(/<img/gi, "<noload");
                var r = [];
                $(".list > .group > .title > a", n).each(function (e) {
                    r[r.length] = [$(this).attr("title"), $(this).attr("href")]
                });
                t("Simple Scans", r)
            }
        })
    },
    getListChaps: function (e, t, n, r) {
        $.ajax({
            url: e,
            beforeSend: function (e) {
                e.setRequestHeader("Cache-Control", "no-cache");
                e.setRequestHeader("Pragma", "no-cache")
            },
            success: function (e) {
                var t = document.createElement("div");
                t.innerHTML = e.replace(/<img/gi, "<noload");
                var i = [];
                $(".list .element > .title > a", t).each(function (e) {
                    i[i.length] = [$(this).attr("title"), $(this).attr("href")]
                });
                r(i, n)
            }
        })
    },
    getInformationsFromCurrentPage: function (e, t, n) {
        var r = $(".tbtitle div a", e)[0].title;
        var i = $(".tbtitle div a", e)[1].text;
        var s = $(".tbtitle div a", e)[0].href;
        var o = $(".tbtitle div a", e)[1].href;
        n({
            name: r,
            currentChapter: i,
            currentMangaURL: s,
            currentChapterURL: o
        })
    },
    getListImages: function (e, t) {
        var n = [];
        $.ajax({
            url: t,
            async: false,
            success: function (e) {
                var t = document.createElement(t);
                t.innerHTML = e;
                var r = JSON.parse($(t).html().match(/var pages = .*$/m)[0].replace(/^[^[]*|;$/g, ""));
                r.forEach(function (e) {
                    n.push(e.url)
                })
            }
        });
        return n
    },
    removeBanners: function (e, t) {
        $(".ads", e).remove()
    },
    whereDoIWriteScans: function (e, t) {
        return $("#page", e)
    },
    whereDoIWriteNavigation: function (e, t) {
        return $(".navAMR", e)
    },
    isCurrentPageAChapterPage: function (e, t) {
        return t.search("www.simple-scans.com/slide/read/") > -1
    },
    doSomethingBeforeWritingScans: function (e, t) {
        if (typeof e.createElement === 'function') {
            script = e.createElement("script");
            script.innerText = "$(document).unbind('keydown');";
            e.body.appendChild(script);
        }
        $("#page", e).css("max-width", "none");
        $("#page", e).css("width", "100%");
        $("#page", e).before($("<div class='navAMR'></div>"));
        $("#page", e).after($("<div class='navAMR'></div>"));
        $("#page", e).empty();
        $(".navAMR").css("text-align", "center");
        $(window).resize(function () {
            $("#page", e).css("max-width", "none");
            $("#page", e).css("width", "100%")
        })
    },
    nextChapterUrl: function (e, t, n) {
        if ($(e).children("option:selected").prev().size() !== 0) {
            return $(e).children("option:selected").prev().val()
        }
        return null
    },
    previousChapterUrl: function (e, t, n) {
        if ($(e).children("option:selected").next().size() !== 0) {
            return $(e).children("option:selected").next().val()
        }
        return null
    },
    getImageFromPageAndWrite: function (e, t, n, r) {
        $(t).attr("src", e)
    },
    isImageInOneCol: function (e, t, n) {
        return false
    },
    getMangaSelectFromPage: function (e, t) {
        return null
    },
    doAfterMangaLoaded: function (e, t) {
        $("body > div:empty", e).remove()
    }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Simple Scans", SimpleScans);
}