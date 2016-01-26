var OurManga = {
    mirrorName: "Our Manga",
    canListFullMangas: false,
    mirrorIcon: "img/ourmanga.png",
    languages: "en",
    isMe: function (e) {
        return e.indexOf("ourmanga.com/") != -1
    },
    getMangaList: function (e, t) {
        $.ajax({
            url: "http://www.ourmanga.com/directory/",
            beforeSend: function (e) {
                e.setRequestHeader("Cache-Control", "no-cache");
                e.setRequestHeader("Pragma", "no-cache")
            },
            success: function (e) {
                var n = document.createElement("div");
                n.innerHTML = e;
                var r = [];
                $("div.m_s_title a", n).each(function (e) {
                    if (e != 0 && $("a", $(this).parent()).size() == 1 && $(this).attr("href") != undefined && $(this).attr("href").trim() != "http://www.ourmanga.com/") {
                        r[r.length] = [$(this).text(), $(this).attr("href")]
                    }
                });
                t("Our Manga", r)
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
                $(".manga_naruto_title a", t).each(function (e) {
                    if ($(this).parent().next().next().text().indexOf("Soon") == -1) {
                        i[i.length] = [$(this).text(), $(this).attr("href") + "/9001e"]
                    }
                });
                r(i, n)
            }
        })
    },
    getInformationsFromCurrentPage: function (e, t, n) {
        var r;
        var i;
        var s;
        var o;
        r = $(".inner_heading_left p", e).text().trim();
        i = $("select[name='chapter'] option:selected", e).text();
        var u = 0;
        for (var a = 0; a < 4; a++) {
            u = t.indexOf("/", u + 1)
        }
        o = t.substr(0, u + 1) + $("select[name='chapter'] option:selected", e).val() + "/9001e";
        s = t.substr(0, u + 1);
        n({
            name: r,
            currentChapter: i,
            currentMangaURL: s,
            currentChapterURL: o
        })
    },
    getListImages: function (e, t) {
        var n = [];
        var r = 0;
        for (var i = 0; i < 5; i++) {
            r = t.indexOf("/", r + 1)
        }
        $("select[name='page'] option", e).each(function (e) {
            n[n.length] = t.substr(0, r + 1) + $(this).val()
        });
        return n
    },
    removeBanners: function (e, t) {
        $(".inner_banner", e).remove();
        $("#link_heading_banner", e).remove()
    },
    whereDoIWriteScans: function (e, t) {
        return $(".inner_full_view", e)
    },
    whereDoIWriteNavigation: function (e, t) {
        return $(".navAMR", e).add($(".inner_heading", e))
    },
    isCurrentPageAChapterPage: function (e, t) {
        return $(".inner_full_view img", e).size() > 0
    },
    doSomethingBeforeWritingScans: function (e, t) {
        $("#page").css("width", "auto");
        $("#inner_page").css("width", "auto");
        $("#inner_page").css("float", "none");
        $("#header").css("margin-left", "auto");
        $("#header").css("float", "none");
        $("#header").css("margin-right", "auto");
        $(".inner").css("width", "auto");
        $(".inner").css("float", "none");
        $(".inner div").css("width", "auto");
        $(".inner div").css("float", "none");
        $(".inner_heading", e).empty();
        $(".inner_full_view", e).empty();
        $(".inner_full_view", e).css("width", "100%");
        $(".inner_full_view", e).after($("<div class='navAMR'></div>"));
        $(".navAMR", e).css("text-align", "center");
        $(".inner_heading", e).css("text-align", "center")
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
        $.ajax({
            url: e,
            success: function (e) {
                var n = document.createElement("div");
                n.innerHTML = e;
                var r = $(".inner_full_view img", n).attr("src");
                $(t).attr("src", r)
            }
        })
    },
    isImageInOneCol: function (e, t, n) {
        return false
    },
    getMangaSelectFromPage: function (e, t) {
        var n = 0;
        for (var r = 0; r < 4; r++) {
            n = t.indexOf("/", n + 1)
        }
        $("select[name='chapter'] option", e).each(function (e) {
            $(this).val(t.substr(0, n + 1) + $(this).val() + "/9001e")
        });
        return $("select[name='chapter']", e)
    },
    doAfterMangaLoaded: function (e, t) {
        $("body > div:empty", e).remove()
    }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Our Manga", OurManga);
}