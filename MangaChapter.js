var MangaChapter =
{
    mirrorName: "MangaChapter",
    canListFullMangas: false,
    mirrorIcon: "img/mangachapter.png",
    languages: "en",
    isMe: function(url)
    {
        return (url.indexOf("mangachapter.net") != -1);
    },
    getMangaList: function(search, callback)
    {
        var urlSearch = "http://www.mangachapter.net/search.html?w=" + search;
        var res = [];
        var getMangaListRecursive = function(url, callback)
        {
            $.ajax(
            {
                url: url,
                beforeSend: function(xhr)
                {
                    xhr.setRequestHeader("Cache-Control", "no-cache");
                    xhr.setRequestHeader("Pragma", "no-cache");
                },
                success: function(response)
                {
                    var div = document.createElement('div');
                    div.innerHTML = response.replace('<img ', '<noload ');
                    $(".info_box a", div).each(function(index)
                    {
                        res[res.length] = [$(this).text(), $(this).attr("href") || ""];
                    });
                    var next = false;
                    var isNext = function(index)
                    {
                        if ($(this).text() == "Next")
                        {
                            next = $(this).attr("href") || "";
                            return false;
                        }
                    }
                    $(".next-page a", div).each(isNext);
                    if (next)
                        getMangaListRecursive(next, callback);
                    else
                        callback("MangaChapter", res);
                }
            });
        };
        getMangaListRecursive(urlSearch, callback);
    },
    getListChaps: function(urlManga, mangaName, obj, callback)
    {
        var res = [];
        var getListChapsRecursive = function(urlManga, mangaName, obj, callback)
        {
            $.ajax(
            {
                url: urlManga,
                beforeSend: function(xhr)
                {
                    xhr.setRequestHeader("Cache-Control", "no-cache");
                    xhr.setRequestHeader("Pragma", "no-cache");
                },
                success: function(response)
                {
                    var div = document.createElement( "div" );
                    div.innerHTML = response.replace('<img ', '<noload ');
                    $(".mangadata a[title]", div).each(function(index)
                    {
                        var currentChapter = $(this).attr("title").toLowerCase().replace(mangaName.toLowerCase(), "");
                        res[res.length] = [currentChapter.trim(), $(this).attr("href") || ""];
                    });
                    var next = false;
                    var isNext = function(index)
                    {
                        if ($(this).text() == "Next")
                        {
                            next = $(this).attr("href") || "";
                            return false;
                        }
                    }
                    $(".mangadata a:not([title])", div).each(isNext);
                    if (next)
                        getListChapsRecursive(next, mangaName, obj, callback);
                    else
                        callback(res, obj);
                }
            });
        };
        getListChapsRecursive(urlManga, mangaName, obj, callback);
    },
    getInformationsFromCurrentPage: function(doc, curUrl, callback)
    {
        var name = $(".box-read h2 a", doc).attr("title") || "";
        var mangaurl = curUrl.substring(0, curUrl.lastIndexOf('/')) + ".html";
        var currentChapter = $(".box-read h1 strong", doc).text();
        currentChapter = currentChapter.replace(name, "");
        callback(
        {
            "name": name.trim(),
            "currentChapter": currentChapter.trim(),
            "currentMangaURL": mangaurl.trim(),
            "currentChapterURL": curUrl
        });
    },
    getListImages: function(doc, curUrl)
    {
        res = [];
        $(".page-select:first option", doc).each(function(index)
        {
            res[res.length] = "http://www.mangachapter.net" + $(this).val();
        });
        return res;
    },
    removeBanners: function(doc, curUrl)
    {
        $("iframe", doc).remove();
    },
    whereDoIWriteScans: function(doc, curUrl)
    {
        return $(".scanAMR", doc);
    },
    whereDoIWriteNavigation: function(doc, curUrl)
    {
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function(doc, curUrl)
    {
        return ($("#mangaImg, #Img1", doc).length != 0);
    },
    doSomethingBeforeWritingScans: function(doc, curUrl)
    {
        $(".mangaread-tp,.mangaread-bt", doc).remove();
        $(".mangaread-icon", doc).remove();
        $(".footer", doc).remove();
        var viewer = $(".main", doc);
        viewer.empty();
        viewer.removeAttr("class");
        viewer.removeAttr("style");
        viewer.css("width", "auto");
        $("<div class='navAMR'></div>").appendTo(viewer);
        $("<div class='scanAMR'></div>").appendTo(viewer);
        $("<div class='navAMR'></div>").appendTo(viewer);
        $(".navAMR", doc).css({ 'text-align':'center', 'background-color':'#fff', 'margin-bottom':'15px' });
    },
    nextChapterUrl: function(select, doc, curUrl)
    {
        if ($(select).children("option:selected").prev().size() != 0)
        {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl: function(select, doc, curUrl)
    {
        if ($(select).children("option:selected").next().size() != 0)
        {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite: function(urlImg, image, doc, curUrl)
    {
        $.ajax(
        {
            url: urlImg,
            success: function(objResponse)
            {
                var div = document.createElement( "div" );
                div.innerHTML = objResponse;
                var src = $("#mangaImg, #Img1", div).attr("src") || "";
                $( image ).attr( "src", src);
            }
        });
    },
    isImageInOneCol: function(img, doc, curUrl)
    {
        return false;
    },
    getMangaSelectFromPage: function(doc, curUrl)
    {
        return null;
    },
    doAfterMangaLoaded: function(doc, curUrl)
    {
        $("body > div:empty", doc).remove();
        $(".imageAMR", doc).css('margin-top', '10px');
        $("body, table", doc).css(
        {
            'background-color':'#000',
            'border-bottom-color':'#000',
            'border-left-color':'#000',
            'border-right-color':'#000',
            'border-top-color':'#000'
        });
        if (doc.createElement)
        {
            var script = doc.createElement('script');
            script.innerText = "document.onkeydown = undefined;";
            doc.body.appendChild(script);
        }
    }
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("MangaChapter", MangaChapter);
}