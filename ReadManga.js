var ReadManga = {
	mirrorName : "ReadManga",
	canListFullMangas : false,
	mirrorIcon : "img/readmanga.png",
	languages : "ru",
	isMe : function (url) {
		return (url.indexOf("readmanga.me/") != -1);
	},
	getMangaList : function (search, callback) {
		$.ajax({
			url : "http://readmanga.me/search",
			type : 'POST',
			data : {
				q : search
			},
			beforeSend : function (xhr) {
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success : function (objResponse) {
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$("#mangaResults td a:first-child", div).each(function (index) {
					var tit = $($(this).contents()[0]).text();
					titsp = tit.split("|");
					res[res.length] = [titsp[0].trim(), "http://readmanga.me" + $(this).attr("href")];
				});
				callback("ReadManga", res);
			}
		});
	},
	getListChaps : function (urlManga, mangaName, obj, callback) {
		$.ajax({
			url : urlManga + "?mature=1",
			beforeSend : function (xhr) {
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success : function (objResponse) {
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				var mng_nm = (urlManga.split('/')).pop();
				$("div.expandable td > a", div).each(function (index) {
					var str = $(this).attr("href");
					str = str.split('/')[1];
					if (str == mng_nm) {
						res[res.length] = [$($(this).contents()[0]).text(), "http://readmanga.me" + $(this).attr("href")];
					}
				});
				callback(res, obj);
			}
		});
	},
	getInformationsFromCurrentPage : function (doc, curUrl, callback) {
		var name = $($("#mangaBox h1 a:first-child", doc).contents()[0]).text();
		var nameurl = "http://readmanga.me" + $("#mangaBox h1 a:first-child", doc).attr("href");
		var curChapName = $("#chapterSelectorSelect:first option:selected", doc).text();
		var chapurl = "http://readmanga.me" + $("#chapterSelectorSelect:first option:selected", doc).val();
		callback({
			"name" : name,
			"currentChapter" : curChapName,
			"currentMangaURL" : nameurl,
			"currentChapterURL" : chapurl
		});
	},
	getListImages : function (doc, curUrl2) {
		var res = [];
		var dir = "";
		var scansstr = "";
		$("script", doc).each(function (index) {
			if ($(this).text().indexOf("var pictures = [{") != -1) {
				var possc = $(this).text().indexOf("var pictures = [{") + 12;
				var finsc = $(this).text().indexOf("]", possc);
				scansstr = $(this).text().substring(possc, finsc);
				var pos = scansstr.indexOf('"');
				while (pos != -1) {
					var end = scansstr.indexOf('"', pos + 1);
					res[res.length] = scansstr.substring(pos + 1, end);
					pos = scansstr.indexOf('"', end + 1);
				}
			}
		});
		return res;
	},
	removeBanners : function (doc, curUrl) {
		$(".baner", doc).remove();
	},
	whereDoIWriteScans : function (doc, curUrl) {
		return $("#mangaBox", doc);
	},
	whereDoIWriteNavigation : function (doc, curUrl) {
		return $(".navAMR", doc);
	},
	isCurrentPageAChapterPage : function (doc, curUrl) {
		return ($("img#mangaPicture", doc).size() > 0);
	},
	doSomethingBeforeWritingScans : function (doc, curUrl) {
		$("#mangaBox", doc).prev().remove();
		$("#mangaBox", doc).empty();
		$(".footerControl", doc).remove();
		$("#mangaBox", doc).css("width", "100%");
		$("#mangaBox", doc).css("padding", "0");
		$("#mangaBox", doc).css("padding-top", "10px");
		$("#mangaBox", doc).css("padding-bottom", "10px");
		$("#mangaBox", doc).css("border", "0");
		$("#mangaBox", doc).css("background-color", "black");
		$("#mangaBox", doc).before($("<div class='navAMR'></div>"));
		$("#mangaBox", doc).after($("<div class='navAMR'></div>"));
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
		$(image).attr("src", urlImg)
	},
	isImageInOneCol : function (img, doc, curUrl) {
		return false;
	},
	getMangaSelectFromPage : function (doc, curUrl) {
		$("#chapterSelectorSelect option", doc).each(function (index) {
			$(this).val("http://readmanga.me" + $(this).val());
		});
		return $($("#chapterSelectorSelect", doc)[0]);
	},
	doAfterMangaLoaded : function (doc, curUrl) {
		$("body > div:empty", doc).remove();
	},
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("ReadManga", ReadManga);
}