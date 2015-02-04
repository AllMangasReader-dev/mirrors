var Batoto = {
    mirrorName: "Batoto",
    canListFullMangas: false,
    mirrorIcon: "img/Batoto.png",
    languages: "en,fr,de,es,pt,tr,id,el,tl",
    isMe: function (url) {
        "use strict";
        return (url.match(/ba(to)+.(com|net|to)/gi) !== null);
    },
    getMangaList: function (search, callback) {
        "use strict";
        $.ajax({
            url: 'http://bato.to/search?name=' + search + '&name_cond=c',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                $("#comic_search_results .chapters_list tr a", div).each(function (index) {
                    $.ajax({
                        url: $(this).attr("href"),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Cache-Control", "no-cache");
                            xhr.setRequestHeader("Pragma", "no-cache");
                        },
                        success: function (objResponse) {
                            var divIn = document.createElement("div"),
                                res = [];
                            divIn.innerHTML = objResponse.replace(/<img/gi,
                                '<noload');
                            if ($(".lang_English:eq(-1) a:first", divIn) !==
                                null) {
                                res[res.length] = [$(".ipsType_pagetitle",
                                    divIn).text().trim(), $(
                                    ".lang_English:eq(-1) a:first",
                                    divIn).attr('href')];
                            }
                            /* if ($(".chapters_list .row:not(.lang_English)", divIn).attr('href') !== null) {
                                I couldn't test this piece of code
                                res[res.length] = [$(".ipsType_pagetitle", divIn).text().trim(), $(this).attr('href')];
                            }
                            */
                            callback("Batoto", res);
                        }
                    });
                });
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
                var div = document.createElement("div"),
                    res = [];
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                var res = [];
                $(".moderation_bar:first [name='chapter_select'] option", div).each(function (index) {
                    res[index] = [$(this).text().trim(), $(this).val()];
                });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        var mod_bar = $(".moderation_bar:first", doc);
        var chapter = $("[name='chapter_select'] option:selected", mod_bar);
        var manga = $("ul:first-child a", mod_bar);
        var name = manga.text();
        var group = $("select[name='group_select']:first option:selected", doc).text();
        if (group && group != "") {
            var gps = group.split(" ");
            var lang;
            var i = gps.length - 1;
            while ((lang = gps[i]) == "" && i >= 0) {
                i--;
            }
            if (lang != "English" && lang != "") {
                name += " (" + lang + ")";
            }
        }
        var currentChapter = chapter.text();
        var pos = $("[name='chapter_select'] option:last", mod_bar).val().lastIndexOf("/");
        var currentMangaURL = $("[name='chapter_select'] option:last", mod_bar).val();
        var currentChapterURL = chapter.val();
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
        if ($(".moderation_bar:first #page_select option", doc).size() > 0) {
            $(".moderation_bar:first #page_select option", doc).each(function (index) {
                res[index] = $(this).val();
            });
        } else {
            $('#content > div > img', doc).each(function (index) {
                res[index] = $(this).attr('src');
            });
        }
        return res;
    },
    removeBanners: function (doc, curUrl) {
        "use strict";
    },
    whereDoIWriteScans: function (doc, curUrl) {
        "use strict";
        return $(".scanAMR", doc);
    },
    whereDoIWriteNavigation: function (doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function (doc, curUrl) {
        "use strict";
        return ($("#comic_page", doc).size() > 0 || $("#full_image", doc).size() > 0 || curUrl.indexOf(/read/) !==
            -1);
    },
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        "use strict";
        if ($("#full_image", doc).size() > 0) {
            $("#full_image", doc).after($("<div class='amrcontainer'></div>"));
            $("#full_image", doc).remove();
        } else {
            $('#content > div > img', doc).parent().empty().append($("<div class='amrcontainer'></div>"));
        }
        var mod_bar = $(".moderation_bar", doc);
        $("li:not(:first)", mod_bar).remove();
        mod_bar.css("height", "8px");
        mod_bar.css("margin-bottom", "0px");
        mod_bar.css("padding-top", "0px");

        if ($("#comic_page", doc).parent().size() > 0) {
            $("#comic_page", doc).parent().remove();
            $("<div class='AMRcomic'></div>").appendTo($(".amrcontainer", doc));
        }
        $("<div class='navAMR widepage'></div>").appendTo($(".amrcontainer", doc));
        $("<div class='scanAMR widepage'></div>").appendTo($(".amrcontainer", doc));
        $("<div class='navAMR widepage'></div>").appendTo($(".amrcontainer", doc));
        $("#content", doc).css("width", "auto !important");
        $("#content", doc).css("background-color", "black");
        $("#content", doc).css("text-align", "center");
        $("#ipbwrapper", doc).css("background", "black")
        $("#full_image", doc).css("display", "");
        $("select[name=chapter_select]", doc).attr("style", "");
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
        if ($(".AMRcomic", doc).size() !== 0) {
            $.ajax({
                url: urlImg,
                success: function (objResponse) {
                    var div = document.createElement("div");
                    div.innerHTML = objResponse;
                    var src = $("img#comic_page", div).attr("src");
                    $(image).attr("src", src);
                }
            });
        } else {
            $(image).attr("src", urlImg);
        }
    },
    isImageInOneCol: function (img, doc, curUrl) {
        "use strict";
        return false;
    },
    getMangaSelectFromPage: function (doc, curUrl) {
        "use strict";
        return $(".moderation_bar:first [name='chapter_select']", doc);
    },
    doAfterMangaLoaded: function (doc, curUrl) {
        "use strict";
        $("body > div:empty", doc).remove();
        $("#full_image", doc).css("display", "");
        $("#content", doc).css("width", "auto !important");
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "Hotkeys.hotkeys.clear();";
            doc.body.appendChild(script);
        }
    }
};

// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Batoto", Batoto);
}