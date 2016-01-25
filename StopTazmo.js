var StopTazmo = {
    mirrorName: "StopTazmo",
    canListFullMangas: false,
    mirrorIcon: "img/stoptazmo.png",
    languages: "en",
    isMe: function (e) {
        return e.indexOf("stoptazmo.com/") != -1
    },
    getMangaList: function (e, t) {
        $.ajax({
            url: "http://example.com/",
            beforeSend: function (e) {
                e.setRequestHeader("Cache-Control", "no-cache");
                e.setRequestHeader("Pragma", "no-cache")
            },
            success: function (e) {
                var n = document.createElement("div");
                n.innerHTML = e;
                var r = [];
                $("#content > table:nth-child(3) td:first-child a", n).each(function (e) {
                    r[r.length] = [$(this).text().trim(), $(this).attr("href")]
                });
                t("StopTazmo", r)
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
                t.innerHTML = e;
                var i = [];
                $("#content table td:first-child", t).each(function (e) {
                    if ($("a", $(this).closest("tr")).size() > 0) {
                        i[i.length] = [$(this).text().trim(), $("a", $(this).closest("tr")).last().attr("href")]
                    }
                });
                i.reverse();
                r(i, n)
            }
        })
    },
    getInformationsFromCurrentPage: function (e, t, n) {
        var r;
        var i;
        var s;
        var o;
        r = $("select.selectmanga option:selected", e).text().trim();
        i = $("select.selectchapter option:selected", e).text();
        s = "http://stoptazmo.com/manga-series/" + $("select.selectmanga option:selected", e).val() + "/";
        o = "http://stoptazmo.com/downloads/manga_viewer.php?series=" + $("select.selectmanga option:selected", e).val() + "&chapter=" + $("select.selectchapter option:selected", e).val();
        n({
            name: r,
            currentChapter: i,
            currentMangaURL: s,
            currentChapterURL: o
        })
    },
    getListImages: function (e, t) {
        var n = [];
        $("script", e).each(function (e) {
            if ($(this).text().indexOf("SLIDES = new slideshow('SLIDES');") != -1) {
                var t = $(this).text();
                var r = t.indexOf("s.src = '");
                while (r != -1) {
                    var i = t.indexOf("'", r + 9);
                    n[n.length] = t.substring(r + 9, i);
                    r = t.indexOf("s.src = '", i + 1)
                }
            }
        });
        return n
    },
    removeBanners: function (e, t) {},
    whereDoIWriteScans: function (e, t) {
        return $(".scansAMR", e)
    },
    whereDoIWriteNavigation: function (e, t) {
        return $(".navAMR", e)
    },
    isCurrentPageAChapterPage: function (e, t) {
        if ($("form[name='pageSelector1']", e).size() > 0) {
            return $("img", $("form[name='pageSelector1'] td", e)[1]).size() > 0
        } else {
            return false
        }
    },
    doSomethingBeforeWritingScans: function (e, t) {
        $("#wrapper", e).css("width", "auto");
        $("#content", e).css("width", "100%");
        $("#content table", e).remove();
        $("<div class='navAMR'></div>").appendTo($("#content", e));
        $("<div class='scansAMR'></div>").appendTo($("#content", e));
        $("<div class='navAMR'></div>").appendTo($("#content", e));
        $(".navAMR", e).css("text-align", "center");
        $(".navAMR", e).css("width", "100%");
        $(".scansAMR", e).css("width", "100%");
        $(".scansAMR", e).css("background-color", "black");
        $(".scansAMR", e).css("padding-top", "10px")
    },
    nextChapterUrl: function (e, t, n) {
        if ($(e).children("option:selected").next().size() != 0) {
            return $(e).children("option:selected").next().val()
        }
        return null
    },
    previousChapterUrl: function (e, t, n) {
        if ($(e).children("option:selected").prev().size() != 0) {
            return $(e).children("option:selected").prev().val()
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
        var n = "http://stoptazmo.com/downloads/manga_viewer.php?series=" + $("select.selectmanga option:selected", e).val() + "&chapter=";
        $("select.selectchapter option", e).each(function (e) {
            $(this).val(n + $(this).val())
        });
        return $("select.selectchapter", e)
    },
    doAfterMangaLoaded: function (e, t) {
        $("body > div:empty", e).remove()
    }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("StopTazmo", StopTazmo);
}