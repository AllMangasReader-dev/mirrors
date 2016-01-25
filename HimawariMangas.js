var HimawariMangas =
{
	mirrorName: "Himawari Mangás",
	canListFullMangas: true,
	mirrorIcon: "img/himawarimangas.png",
	languages: "pt",
	isMe : function(url)
	{
		return (url.indexOf("read.himawarimangas.com.br/") != -1);
	},
	//Return the list of all or part of all mangas from the mirror
	//The search parameter is filled if canListFullMangas is false
	//This list must be an Array of [["manga name", "url"], ...]
	//This function must call callback("Mirror name", [returned list]);
	getMangaList: function(search, callback)
	{
		$.ajax(
		{
			url: "http://read.himawarimangas.com.br/",
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$(".selector2 .options a", div).each(function(index)
				{
					res.push([$(this).attr("title").trim(), "http://read.himawarimangas.com.br/" + $(this).attr("href")]);
				});
				callback("Himawari Mangás", res);
			}
		});
	},
	//Find the list of all chapters of the manga represented by the urlManga parameter
	//This list must be an Array of [["chapter name", "url"], ...]
	//This list must be sorted descending. The first element must be the most recent.
	//This function MUST call callback([list of chapters], obj);
	getListChaps: function(urlManga, mangaName, obj, callback)
	{
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
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$(".theList .chapter", div).each(function(index)
				{
					res.push([$("b", $(this)).text().trim(), "http://read.himawarimangas.com.br/" + $("a", $(this)).attr("href")]);
				});
				callback(res, obj);
			}
		});
	},
	retrieveInfo: function(sel)
	{
		var _obj = {};
		var curval = $(sel.contents()[0]).text();
		var pos = curval.indexOf(": ");
		curval = curval.substring(pos + 2, curval.length).trim();
		$("a", sel).each(function(index)
		{
			if ($(".option", $(this)).text().trim() == curval)
			{
				_obj = {name: curval, url: "http://read.himawarimangas.com.br/" + $(this).attr("href")};
			}
		});
		return _obj;
	},
	//This method must return (throught callback method) an object like :
	//{"name" : Name of current manga,
	//  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
	//  "currentMangaURL": Url to access current manga,
	//  "currentChapterURL": Url to access current chapter}
	//This function runs in the DOM of the current consulted page.
	getInformationsFromCurrentPage: function(doc, curUrl, callback)
	{
		var name;
		var currentChapter;
		var currentMangaURL;
		var currentChapterURL;
		var manga = HimawariMangas.retrieveInfo($($(".selector2", doc)[0]));
		var chapter = HimawariMangas.retrieveInfo($($(".selector2", doc)[1]));
		name = manga.name;
		currentChapter = chapter.name;
		currentChapterURL = chapter.url;
		currentMangaURL = manga.url;
		callback(
		{
			"name": name,
			"currentChapter": currentChapter,
			"currentMangaURL": currentMangaURL,
			"currentChapterURL": currentChapterURL
		});
	},
	//Returns the list of the urls of the images of the full chapter
	//This function can return urls which are not the source of the
	//images. The src of the image is set by the getImageFromPageAndWrite() function.
	//This function runs in the DOM of the current consulted page.
	getListImages: function(doc, curUrl)
	{
		var res = [];
		$("script", doc).each(function(index)
		{
			if ($(this).text().indexOf("imageArray = new Array();") != -1)
			{
				var txt = $(this).text();
				var pos = txt.indexOf("imageArray[");
				while (pos != -1)
				{
					var debur = txt.indexOf("'", pos);
					var finur = txt.indexOf("'", debur + 1);
					res.push("http://read.himawarimangas.com.br/" + txt.substring(debur + 1, finur));
					pos = txt.indexOf("imageArray[", finur + 1);
				}
			}
		});
		res.pop()
		return res;
	},
	//Remove the banners from the current page
	//This function runs in the DOM of the current consulted page.
	removeBanners: function(doc, curUrl)
	{
		$(".ads", doc).remove();
	},
	//This method returns the place to write the full chapter in the document
	//The returned element will be totally emptied.
	//This function runs in the DOM of the current consulted page.
	whereDoIWriteScans: function(doc, curUrl)
	{
		return $(".scanAMR", doc);
	},
	//This method returns places to write the navigation bar in the document
	//The returned elements won't be emptied.
	//This function runs in the DOM of the current consulted page.
	whereDoIWriteNavigation: function(doc, curUrl)
	{
		return $(".navAMR", doc);
	},
	//Return true if the current page is a page containing scan.
	isCurrentPageAChapterPage: function(doc, curUrl)
	{
		return ($("#theManga #thePic", doc).size() > 0);
	},
	//This method is called before displaying full chapters in the page
	//This function runs in the DOM of the current consulted page.
	doSomethingBeforeWritingScans: function(doc, curUrl)
	{
		if (typeof doc.createElement == 'function')
		{
			script = doc.createElement('script');
			script.innerText = "$(document).unbind('keyup');";
			doc.body.appendChild(script);
		}
		$("#theManga", doc).empty();
		var cloned = $("#theManga", doc).clone();
		$("#theManga", doc).after(cloned);
		cloned.attr("id", "amrManga");
		$("#theManga", doc).remove();
		$("#amrManga", doc).css("width", "auto");
		$("#amrManga", doc).css("margin", "0");
		$("#theHead", doc).remove();
		$("<div class='navAMR'></div>").appendTo($("#amrManga", doc));
		$("<div class='scanAMR'></div>").appendTo($("#amrManga", doc));
		$("<div class='navAMR'></div>").appendTo($("#amrManga", doc));
		$(".navAMR", doc).css("text-align", "center");
	},
	//This method is called to fill the next button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	nextChapterUrl: function(select, doc, curUrl)
	{
		if ($(select).children("option:selected").next().size() != 0)
		{
			return $(select).children("option:selected").next().val();
		}
		return null;
	},
	//This method is called to fill the previous button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	previousChapterUrl: function(select, doc, curUrl)
	{
		if ($(select).children("option:selected").prev().size() != 0)
		{
			return $(select).children("option:selected").prev().val();
		}
		return null;
	},
	//Write the image from the the url returned by the getListImages() function.
	//The function getListImages can return an url which is not the source of the
	//image. The src of the image is set by this function.
	//If getListImages function returns the src of the image, just do $( image ).attr( "src", urlImg );
	//This function runs in the DOM of the current consulted page.
	getImageFromPageAndWrite : function(urlImg, image, doc, curUrl)
	{
		$(image).attr("src", urlImg);
	},
	//If it is possible to know if an image is a credit page or something which
	//must not be displayed as a book, just return true and the image will stand alone
	//img is the DOM object of the image
	//This function runs in the DOM of the current consulted page.
	isImageInOneCol: function(img, doc, curUrl)
	{
		return false;
	},
	//This function can return a preexisting select from the page to fill the
	//chapter select of the navigation bar. It avoids to load the chapters
	//This function runs in the DOM of the current consulted page.
	getMangaSelectFromPage: function(doc, curUrl)
	{
		var sel = $($(".selector2", doc)[1]);
		var ret = $("<select></select>");
		var curval = $(sel.contents()[0]).text();
		var pos = curval.indexOf(": ");
		curval = curval.substring(pos + 2, curval.length).trim();
		$("a", sel).each(function(index)
		{
			var iscur = false;
			if ($(".option", $(this)).text().trim() == curval)
			{
				iscur = true;
			}
			$("<option value=\"" + "http://read.himawarimangas.com.br/" + $(this).attr("href") + "\"" + (iscur ? "selected=\"selected\"" : "") + ">" + $(".option", $(this)).text().trim() + "</option>").appendTo(ret);
		});
		return ret;
	},
	//This function is called when the manga is full loaded. Just do what you want here...
	//This function runs in the DOM of the current consulted page.
	doAfterMangaLoaded : function(doc, curUrl)
	{
		$("body > div:empty", doc).remove();
		$('#infoSpread').hide();
	}
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Himawari Mangás", HimawariMangas);
}