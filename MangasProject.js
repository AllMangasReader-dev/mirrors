/*/////////////////////////////////////////////////////////////////////////////
//                                                                           //
//   All Mangas Reader : Follow updates of your favorite mangas sites.       //
//   Copyright (c) 2011 Pierre-Louis DUHOUX (pl.duhoux at gmail d0t com)     //
//                                                                           //
/////////////////////////////////////////////////////////////////////////////*/
function parseToLink(str)
{
  	str = str.replace(/[ .]/g,"-").replace(/\//g,"");
    return str;
}
var MangasProject =
{
	mirrorName: "Mangas Project",
	canListFullMangas: true,
	mirrorIcon: "img/mangasproject.png",
	languages: "pt",
	//Return true if the url corresponds to the mirror
	isMe: function(url)
	{
		return (url.indexOf("mangas.xpg.com.br/") != -1);
	},
	//Return the list of all or part of all mangas from the mirror
	//The search parameter is filled if canListFullMangas is false
	//This list must be an Array of [["manga name", "url"], ...]
	//This function must call callback("Mirror name", [returned list]);
	getMangaList: function(search, callback)
	{
		$.ajax(
		{
			url: "http://mangas.xpg.com.br/includes/getSeriesList.php",
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				var obj = JSON.parse(objResponse).All;
				var res = [];
				for (var j = 0; j < obj.length; j++)
				{
					var url = "http://mangas.xpg.com.br/Manga/"+obj[j].seriesId+"-"+parseToLink(obj[j].seriesName);
					res[res.length] = [obj[j].seriesName, url];
				}
				callback("Mangas Project", res);
			}
		});
	},
	//Find the list of all chapters of the manga represented by the urlManga parameter
	//This list must be an Array of [["chapter name", "url"], ...]
	//This list must be sorted descending. The first element must be the most recent.
	//This function MUST call callback([list of chapters], obj);
	getListChaps: function(urlManga, mangaName, obj, callback)
	{
		var pos = urlManga.lastIndexOf("/");
		var poss = urlManga.indexOf("-", pos);
		var id = urlManga.substring(pos + 1, poss);
		$.ajax(
		{
			url: "http://mangas.xpg.com.br/includes/getChaptersList.php?series=" + id,
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				var objR = JSON.parse(objResponse)["1"];
				var res = [];
				if (objR != undefined)
				{
					for (var j = 0; j < objR.length; j++)
					{
						var name = objR[j].chapValue + " " + objR[j].chapName;
						for (var i = 0; i < objR[j].releases.length; i++)
						{
							res[res.length] = [name + " (" + objR[j].releases[i].groupName + ")", "http://mangas.xpg.com.br/reader/?rel=" + objR[j].releases[i].releaseId];
						}
					}
				}
				callback(res, obj);
			}
		});
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
		currentChapterURL = $("meta[property='og:url']", doc).attr("content").replace("www.mangasproject", "mangas");
		var pos = currentChapterURL.indexOf("?rel=");
		var id = currentChapterURL.substring(pos + 5, currentChapterURL.length);
		$.ajax(
		{
			url: "http://mangas.xpg.com.br/reader/listPages.php",
			type: 'POST',
			data:
			{
				"rel": id,
				"updating": 0
			},
			success: function(objResponse)
			{
				var obj = JSON.parse(objResponse);
				name = obj.series;
				currentMangaURL = "http://mangas.xpg.com.br/Manga/"+obj.seriesId+"-"+parseToLink(obj.series);
				currentChapter = obj.number + " " + obj.name + " (" + obj.group + ")";
				callback(
				{
					"name": name,
					"currentChapter": currentChapter,
					"currentMangaURL": currentMangaURL,
					"currentChapterURL": currentChapterURL
				});
			}
		});
	},
	//Returns the list of the urls of the images of the full chapter
	//This function can return urls which are not the source of the
	//images. The src of the image is set by the getImageFromPageAndWrite() function.
	//This function runs in the DOM of the current consulted page.
	getListImages: function(doc, curUrl)
	{
		var url = $("meta[property='og:url']", doc).attr("content");
		var pos = url.indexOf("?rel=");
		var id = url.substring(pos + 5, url.length);
		var res = [];
		$.ajax(
		{
			url: "http://mangas.xpg.com.br/reader/listPages.php",
			type: 'POST',
			data:
			{
				"rel": id
			},
			async: false,
			success: function(objResponse)
			{
				var obj = JSON.parse(objResponse);
				if (obj != undefined)
				{
					var path = obj.path;
					var i = 0;
					while (obj.pages[i+''])
					{
						var iurl = obj.pages[i+''].path;
						if (iurl.indexOf("http") == 0)
						{
							res[res.length] = iurl;
						}
						else
						{
							res[res.length] = path + iurl;
						}
						i++;
					}
				}
			}
		});
		return res;
	},
	//Remove the banners from the current page
	//This function runs in the DOM of the current consulted page.
	removeBanners: function(doc, curUrl)
	{
		$("#banner", doc).remove();
	},
	//This method returns the place to write the full chapter in the document
	//The returned element will be totally emptied.
	//This function runs in the DOM of the current consulted page.
	whereDoIWriteScans: function(doc, curUrl)
	{
		return $(".pageAMR", doc);
	},
	//This method returns places to write the navigation bar in the document
	//The returned elements won't be emptied.
	//This function runs in the DOM of the current consulted page.
	whereDoIWriteNavigation: function(doc, curUrl)
	{
		return $(".navAMR", doc);
	},
	//Return true if the current page is a page containing scan.
	isCurrentPageAChapterPage : function(doc, curUrl)
	{
		return ($("div.page", doc).size() > 0);
	},
	//This method is called before displaying full chapters in the page
	//This function runs in the DOM of the current consulted page.
	doSomethingBeforeWritingScans: function(doc, curUrl)
	{
		$("#viewer", doc).empty();
		$("<div class='navAMR'></div>").appendTo($("#viewer", doc));
		$("<div class='pageAMR'></div>").appendTo($("#viewer", doc));
		$("<div class='navAMR'></div>").appendTo($("#viewer", doc));
		$("#viewer", doc).css("padding-top", "10px");
	},
	//This method is called to fill the next button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	nextChapterUrl: function(select, doc, curUrl)
	{
		if ($(select).children("option:selected").prev().size() != 0)
		{
			return $(select).children("option:selected").prev().val();
		}
		return null;
	},
	//This method is called to fill the previous button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	previousChapterUrl: function(select, doc, curUrl)
	{
		if ($(select).children("option:selected").next().size() != 0)
		{
			return $(select).children("option:selected").next().val();
		}
		return null;
	},
	//Write the image from the the url returned by the getListImages() function.
	//The function getListImages can return an url which is not the source of the
	//image. The src of the image is set by this function.
	//If getListImages function returns the src of the image, just do $( image ).attr( "src", urlImg );
	//This function runs in the DOM of the current consulted page.
	getImageFromPageAndWrite: function(urlImg, image, doc, curUrl)
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
		return null;
	},
	//This function is called when the manga is full loaded. Just do what you want here...
	//This function runs in the DOM of the current consulted page.
	doAfterMangaLoaded: function(doc, curUrl)
	{
		$("body > div:empty", doc).remove();
	}
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Mangas Project", MangasProject);
}