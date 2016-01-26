var Mangajoy = {
	mirrorName: "Mangajoy",
	canListFullMangas: false,
	mirrorIcon: "img/mangajoy.png",
	languages: "en",
	isMe: function(url)
	{
		"use strict";
		return (url.match(/^http:\/\/(www\.)?mangajoy\.com/gi) !== null);
	},
	getMangaList: function(search, callback)
	{
		"use strict";
		$.ajax(
		{
			url: "http://mangajoy.com/manga-list/advanced-search/",
			type: "POST",
			data:
			{
				cbo_wpm_pag_mng_sch_nme: 0,
				txt_wpm_pag_mng_sch_nme: search,
				cmd_wpm_pag_mng_sch_sbm: "Search"
			},
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				// Limited to the first page of results, else a wide crazy search like 'a' would
				// return more than a thousand pages of results.
				var div = document.createElement("div"),
					res = [];
				div.innerHTML = objResponse.replace(/<img /gi, '<noload');
				$(".srs h2 a", div).each(function()
				{
					res[res.length] = [$(this).text(), $(this).attr('href')];
				});
				callback("Mangajoy", res);
			}
		});
	},
	getListChaps: function(urlManga, mangaName, obj, callback)
	{
		"use strict";
		$.ajax(
		{
			url: urlManga,
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				var div = document.createElement("div"),
					res = [];
				div.innerHTML = objResponse.replace(/<img /gi, '<noload');
				$(".chp_lst a", div).each(function (index) {
					res[res.length] = [$('.val', this).text().substr(mangaName.length + 1), $(this).attr('href')];
				});
				callback(res, obj);
			}
		});
	},
	getInformationsFromCurrentPage: function(doc, curUrl, callback)
	{
		"use strict";
		var name = $($("h1 a", doc)[1]).text(),
			chapterSelect = $($(".wpm_nav_rdr select", doc)[0]),
			currentChapter = $("option:selected", chapterSelect).text(),
			currentMangaURL = chapterSelect.attr('onchange').toString().match(/location\.href='([^']+)'/)[1],
			currentChapterURL = currentMangaURL + $("option:selected", chapterSelect).attr("value") + "/";
		callback(
		{
			"name" : name,
			"currentChapter" : currentChapter,
			"currentMangaURL" : currentMangaURL,
			"currentChapterURL" : currentChapterURL
		});
	},
	getListImages: function(doc, curUrl)
	{
		"use strict";
		var res = [],
			pageSelect,
			href,
			i;
		pageSelect = $($(".wpm_nav_rdr select", doc)[1]);
		href = pageSelect.attr('onchange').toString().match(/location\.href='([^']+)'/)[1];
		i = $("option", pageSelect).length;
		for (true; i > 0; i -= 1)
		{
			res.push(href + i + "/");
		}
		res.reverse();
		return res;
	},
	removeBanners: function(doc, curUrl)
	{
		return null;
	},
	whereDoIWriteScans: function(doc, curUrl)
	{
		"use strict";
		return $('.imgAMR', doc);
	},
	whereDoIWriteNavigation: function(doc, curUrl)
	{
		"use strict";
		return $(".navAMR", doc);
	},
	isCurrentPageAChapterPage: function(doc, curUrl)
	{
		"use strict";
		return ($(".wpm_nav_rdr select", doc).length > 0);
	},
	doSomethingBeforeWritingScans: function(doc, curUrl)
	{
		"use strict";
		$(".wpm_pag", doc).empty();
		$(".wpm_pag", doc).append($("<div class='navAMR'></div>"));
		$(".wpm_pag", doc).append($("<div class='imgAMR'></div>"));
		$(".wpm_pag", doc).append($("<div class='navAMR'></div>"));
		$(".navAMR", doc).css("text-align", "center");
	},
	nextChapterUrl: function(select, doc, curUrl)
	{
		"use strict";
		if ($(select, doc).children("option:selected").prev().size() != 0) {
			return $(select, doc).children("option:selected").prev().val();
		}
		return null;
	},
	previousChapterUrl: function(select, doc, curUrl)
	{
		"use strict";
		if ($(select, doc).children("option:selected").next().size() !== 0) {
			return $(select, doc).children("option:selected").next().val();
		}
		return null;
	},
	getImageFromPageAndWrite: function(urlImg, image, doc, curUrl)
	{
		"use strict";
		$.ajax(
		{
			url: urlImg,
			success: function(objResponse)
			{
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				$(image).attr("src", $(".prw img", div).attr("src"));
			}
		});
	},
	isImageInOneCol: function(img, doc, curUrl)
	{
		"use strict";
		return false;
	},
	getMangaSelectFromPage: function(doc, curUrl)
	{
		"use strict";
		var chapterSelect = $($(".wpm_nav_rdr select", doc)[0]),
			mangaUrl = chapterSelect.attr('onchange').toString().match(/location\.href='([^']+)'/)[1];
		$("option", chapterSelect).each(function(index)
		{
			$(this).val(mangaUrl + $(this).val() + "/")
		});
		return chapterSelect;
	},
	doAfterMangaLoaded: function(doc, curUrl)
	{
		"use strict";
		return null;
	}
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Mangajoy", Mangajoy);
}