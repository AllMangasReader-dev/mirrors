var MangaHere = {
    //Name of the mirror
    mirrorName: "Manga Here",
    //True if the mirror can list all of its mangas.
    canListFullMangas: false,
    //Extension internal link to the icon of the mirror.
    mirrorIcon: "img/mangahere.png",
    //Languages of scans for the mirror
    languages: "en",
    //Return true if the url corresponds to the mirror
    isMe: function (url) {
        return (url.indexOf("mangahere.co/") != -1);
    },
    //Return the list of all or part of all mangas from the mirror
    //The search parameter is filled if canListFullMangas is false
    //This list must be an Array of [["manga name", "url"], ...]
    //This function must call callback("Mirror name", [returned list]);
    getMangaList: function (search, callback) {
        $.ajax({
            url: "https://www.mangahere.co/search.php?name=" + search,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var res = [];
                $(".result_search dl dt a:first-child", div).each(function (index) {
                    res[res.length] = [$(this).text().trim(), this.href];
                });
                callback("Manga Here", res);
            }
        });
    },
    //Find the list of all chapters of the manga represented by the urlManga parameter
    //This list must be an Array of [["chapter name", "url"], ...]
    //This list must be sorted descending. The first element must be the most recent.
    //This function MUST call callback([list of chapters], obj);
    getListChaps: function (urlManga, mangaName, obj, callback) {
        $.ajax({
            url: urlManga,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function (objResponse) {
                var div = document.createElement("div");
                objResponse = objResponse.replace(/<img\b[^>]*>/ig, ''); //avoid loading cover image
                div.innerHTML = objResponse;
                var res = [];
                $(".detail_list ul li span.left a", div).each(function (index) {
                    url = this.href.replace("chrome-extension", "https")
                    res[res.length] = [$(this).text().trim(), url];
                });
                callback(res, obj);
            }
        });
    },
    //This method must return (throught callback method) an object like :
    //{"name" : Name of current manga,
    //  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
    //  "currentMangaURL": Url to access current manga,
    //  "currentChapterURL": Url to access current chapter}
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        //This function runs in the DOM of the current consulted page.
        var name;
        var currentChapter;
        var currentMangaURL;
        var currentChapterURL;
        name = $($(".readpage_top .title a", doc)[1]).text().trim();
        if (name.length >= 5 && name.substr(name.length - 5, 5) == "Manga") {
            name = name.substr(0, name.length - 5).trim();
        }
        currentChapter = $($(".readpage_top .title a", doc)[0]).text();
        currentChapterURL = $(".readpage_top .title a", doc)[0].href;
        console.log(currentChapterURL);
        currentMangaURL = $(".readpage_top .title a", doc)[1].href;
        callback({
            "name": name,
            "currentChapter": currentChapter,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL
        });
    },
    //Returns the list of the urls of the images of the full chapter
    //This function can return urls which are not the source of the
    //images. The src of the image is set by the getImageFromPageAndWrite() function.
    getListImages: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        var res = [];
        $("select.wid60:first option", doc).each(function (index) {
            res[res.length] = $(this).val();
        });
        return res;
    },
    //Remove the banners from the current page
    removeBanners: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        $(".inner_banner", doc).remove();
        $("#link_heading_banner", doc).remove();
        $(".readpage_top .title", doc).next().remove();
    },
    //This method returns the place to write the full chapter in the document
    //The returned element will be totally emptied.
    whereDoIWriteScans: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        return $(".scanAMR", doc);
    },
    //This method returns places to write the navigation bar in the document
    //The returned elements won't be emptied.
    whereDoIWriteNavigation: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        return $(".navAMR", doc);
    },
    //Return true if the current page is a page containing scan.
    isCurrentPageAChapterPage: function (doc, curUrl) {
        return ($("#image", doc).size() > 0);
    },
    //This method is called before displaying full chapters in the page
    doSomethingBeforeWritingScans: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        $("#viewer", doc).empty().append($("<div class='amrcontainer'></div>"));
        $(".go_page.clearfix", doc).empty();
        $("<div class='navAMR widepage'></div>").appendTo($(".amrcontainer", doc));
        $("<div class='scanAMR widepage'></div>").appendTo($(".amrcontainer", doc));
        $("<div class='navAMR widepage'></div>").appendTo($(".amrcontainer", doc));
    },
    //This method is called to fill the next button's url in the manga site navigation bar
    //The select containing the mangas list next to the button is passed in argument
    nextChapterUrl: function (select, doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        if ($(select).children("option:selected").prev().size() != 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    //This method is called to fill the previous button's url in the manga site navigation bar
    //The select containing the mangas list next to the button is passed in argument
    previousChapterUrl: function (select, doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        if ($(select).children("option:selected").next().size() != 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    //Write the image from the the url returned by the getListImages() function.
    //The function getListImages can return an url which is not the source of the
    //image. The src of the image is set by this function.
    //If getListImages function returns the src of the image, just do $( image ).attr( "src", urlImg );
    getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        $.ajax({
            url: urlImg,
            success: function (objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse;
                var src = $("#image", div).attr("src");
                $(image).attr("src", src);
            }
        });
    },
    //If it is possible to know if an image is a credit page or something which
    //must not be displayed as a book, just return true and the image will stand alone
    //img is the DOM object of the image
    isImageInOneCol: function (img, doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        return false;
    },
    //This function can return a preexisting select from the page to fill the
    //chapter select of the navigation bar. It avoids to load the chapters
    getMangaSelectFromPage: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        return null;
    },
    //This function is called when the manga is full loaded. Just do what you want here...
    doAfterMangaLoaded: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        $("body > div:empty", doc).remove();
        var script = doc.createElement('script');
        script.innerText = "Hotkeys.hotkeys.clear();";
        doc.body.appendChild(script);
        $(".spanForImg").css("text-align", "left");
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
    registerMangaObject("Manga Here", MangaHere);
}
