/*!
 * Image (upload) dialog plugin for Editor.md
 *
 * @file        video-dialog.js
 * @author      pandao
 * @version     1.3.4
 * @updateTime  2015-06-09
 * {@link       https://github.com/pandao/editor.md}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

		var pluginName   = "video-dialog";

		exports.fn.videoDialog = function() {

            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var videoLang   = lang.dialog.video;
            var classPrefix = this.classPrefix;
            var iframeName  = classPrefix + "video-iframe";
			var dialogName  = classPrefix + pluginName, dialog;

			cm.focus();

            var loading = function(show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            if (editor.find("." + dialogName).length < 1)
            {
                var guid   = (new Date).getTime();
                var action = settings.videoUploadURL?(settings.videoUploadURL + (settings.videoUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid):"";

                if (settings.crossDomainUpload)
                {
                    action += "&callback=" + settings.uploadCallbackURL + "&dialog_id=editormd-video-dialog-" + guid;
                }

                var dialogContent = ( (settings.videoUpload) ? "<form action=\"" + action +"\" target=\"" + iframeName + "\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\">" : "<div class=\"" + classPrefix + "form\">" ) +
                                        ( (settings.videoUpload) ? "<iframe name=\"" + iframeName + "\" id=\"" + iframeName + "\" guid=\"" + guid + "\"></iframe>" : "" ) +
                                        "<label>" + videoLang.url + "</label>" +
                                        "<input type=\"text\" data-url />" + (function(){
                                            return (settings.videoUpload) ? "<div class=\"" + classPrefix + "file-input\">" +
                                                                                "<input type=\"file\" name=\"" + classPrefix + "video-file\" accept=\"video/*\" />" +
                                                                                "<input type=\"submit\" value=\"" + videoLang.uploadButton + "\" />" +
                                                                            "</div>" : "";
                                        })() +
                                        "<br/>" +
                                    ( (settings.videoUpload) ? "</form>" : "</div>");

                //var videoFooterHTML = "<button class=\"" + classPrefix + "btn " + classPrefix + "video-manager-btn\" style=\"float:left;\">" + videoLang.managerButton + "</button>";

                dialog = this.createDialog({
                    title      : videoLang.title,
                    width      : (settings.videoUpload) ? 465 : 380,
                    height     : 'auto',
                    name       : dialogName,
                    content    : dialogContent,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons : {
                        enter : [lang.buttons.enter, function() {
                            var url  = this.find("[data-url]").val();

                            if (url === "")
                            {
                               // alert(videoLang.videoURLEmpty);
                                return false;
                            }
			    if(url.toLowerCase().trim().startsWith("<iframe")) {
				cm.replaceSelection(url);
			    }else{
				cm.replaceSelection('<video class="video-js" controls="" data-setup="{&quot;errorDisplay&quot;:false}"><source src="'+url+'" type="video/mp4" /></video>');
			    }

                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }]
                    }
                });

                dialog.attr("id", classPrefix + "video-dialog-" + guid);

				if (!settings.videoUpload) {
                    return ;
                }

				var fileInput  = dialog.find("[name=\"" + classPrefix + "video-file\"]");

				fileInput.bind("change", function() {
					var fileName  = fileInput.val();
					var isImage   = new RegExp("(\\.(" + settings.videoFormats.join("|") + "))$"); // /(\.(webp|jpg|jpeg|gif|bmp|png))$/

					if (fileName === "")
					{
						alert(videoLang.uploadFileEmpty);

                        return false;
					}

                    if (!isImage.test(fileName))
					{
						alert(videoLang.formatNotAllowed + settings.videoFormats.join(", "));

                        return false;
					}

                    loading(true);

                    var submitHandler = function() {

                        var uploadIframe = document.getElementById(iframeName);

                        uploadIframe.onload = function() {

                            loading(false);

                            var body = (uploadIframe.contentWindow ? uploadIframe.contentWindow : uploadIframe.contentDocument).document.body;
                            var json = (body.innerText) ? body.innerText : ( (body.textContent) ? body.textContent : null);

                            json = (typeof JSON.parse !== "undefined") ? JSON.parse(json) : eval("(" + json + ")");

                            if(!settings.crossDomainUpload)
                            {
                              if (json.success === 1)
                              {
                                  dialog.find("[data-url]").val(json.url);
                              }
                              else
                              {
                                  alert(json.message);
                              }
                            }

                            return false;
                        };
                    };

                    dialog.find("[type=\"submit\"]").bind("click", submitHandler).trigger("click");
				});
            }

			dialog = editor.find("." + dialogName);
			dialog.find("[type=\"text\"]").val("");
			dialog.find("[type=\"file\"]").val("");
			dialog.find("[data-link]").val("http://");

			this.dialogShowMask(dialog);
			this.dialogLockScreen();
			dialog.show();

		};

	};

	// CommonJS/Node.js
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    {
        module.exports = factory;
    }
	else if (typeof define === "function")  // AMD/CMD/Sea.js
    {
		if (define.amd) { // for Require.js

			define(["editormd"], function(editormd) {
                factory(editormd);
            });

		} else { // for Sea.js
			define(function(require) {
                var editormd = require("./../../editormd");
                factory(editormd);
            });
		}
	}
	else
	{
        factory(window.editormd);
	}

})();
