var AnimeA = {
	mirrorName : "AnimeA",
	canListFullMangas : false,
	mirrorIcon : "img/animea.png",
	languages : "en",
	isMe : function (url) {
		return (url.indexOf("manga.animea.net/") != -1);
	},
	getMangaList : function (search, callback) {
		$.ajax({
			url : "http://manga.animea.net/search.html?title=" + search,
			beforeSend : function (xhr) {
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
				xhr.setRequestHeader("X-Set-Cookie", "skip=1");
				xhr.withCredentials = true;
			},
			success : function (objResponse) {
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$(".manga_desc > a", div).each(function (index) {
					res[res.length] = [$(this).text(), "http://manga.animea.net" + $(this).attr("href")];
				});
				callback("AnimeA", res);
			}
		});
	},
	getListChaps : function (urlManga, mangaName, obj, callback) {
		$.ajax({
			url : urlManga,
			beforeSend : function (xhr) {
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
				xhr.setRequestHeader("X-Set-Cookie", "skip=1");
				xhr.withCredentials = true;
			},
			success : function (objResponse) {
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$("ul.chapters_list li > a", div).each(function (index) {
					res[res.length] = [$(this).text(), "http://manga.animea.net" + $(this).attr("href")];
				});
				callback(res, obj);
			}
		});
	},
	getInformationsFromCurrentPage : function (doc, curUrl, callback) {
		var name;
		var currentChapter;
		var currentMangaURL;
		var currentChapterURL;
		var pos,
		chapterNumber;
		name = $(".contents h1 > a", doc).text();
		currentMangaURL = "http://manga.animea.net" + $(".contents h1 > a", doc).attr("href");
		chapterNumber = $($("h1", doc)[0].lastChild).text().substring(11);
		currentChapter = name + ' ' + chapterNumber;
		pos = currentMangaURL.lastIndexOf(".html");
		currentChapterURL = currentMangaURL.substring(0, pos) + "-chapter-" + chapterNumber + ".html"
			callback({
				"name" : name,
				"currentChapter" : currentChapter,
				"currentMangaURL" : currentMangaURL,
				"currentChapterURL" : currentChapterURL
			});
	},
	getListImages : function (doc, curUrl) {
		ref = curUrl;
		pos = ref.lastIndexOf(".html");
		ref = ref.substr(0, pos) + "-page-";
		var res = [];
		$("select.mangaselecter:first option", doc).each(function (index) {
			res[index] = ref + $(this).val() + ".html";
		});
		return res;
	},
	removeBanners : function (doc, curUrl) {
		$("iframe", doc).remove();
		$(".ads300", doc).remove();
	},
	whereDoIWriteScans : function (doc, curUrl) {
		return $("body > div.center", doc);
	},
	whereDoIWriteNavigation : function (doc, curUrl) {
		return $(".navigation", doc).add($(".navAMR", doc));
	},
	isCurrentPageAChapterPage : function (doc, curUrl) {
		return ($("img.mangaimg", doc).size() > 0);
	},
	doSomethingBeforeWritingScans : function (doc, curUrl) {
		$(".navigation", doc).empty();
		$("body > div.center", doc).empty();
		$(".navigation", doc).css("text-align", "center");
	},
	nextChapterUrl : function (select, doc, curUrl) {
		if ($(select).children("option:selected").prev().size() != 0) {
			return $(select).children("option:selected").prev().val();
		}
		return null;
	},
	previousChapterUrl : function (select, doc, curUrl) {
		if ($(select).children("option:selected").next().size() != 0) {
			return $(select).children("option:selected").next().val();
		}
		return null;
	},
	getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
		$.ajax({
			url : urlImg,
			success : function (objResponse) {
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var src = $("img.mangaimg", div).attr("src");
				$(image).attr("src", src);
			}
		});
	},
	isImageInOneCol : function (img, doc, curUrl) {
		return false;
	},
	getMangaSelectFromPage : function (doc, curUrl) {
		return null;
	},
	doAfterMangaLoaded : function (doc, curUrl) {
		$("body > div:empty", doc).remove();
	},
}

// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("AnimeA", AnimeA);
}