
/* jquery.iphorm.js */

/* 1   */ /*
/* 2   *|  * iPhorm WordPress jQuery plugin
/* 3   *|  */
/* 4   */ ;(function($) {
/* 5   */ 	$.iPhorm = function ($form, options) {
/* 6   */ 		var _this = this,
/* 7   */ 		settings = {},
/* 8   */ 		extraData = {
/* 9   */ 			iphorm_ajax: 1
/* 10  */ 		},
/* 11  */ 		submitted = false,
/* 12  */ 		uploaders = [],
/* 13  */ 		uploadQueue = [],
/* 14  */ 		swfUploadError = false,
/* 15  */ 		supportsSwfUpload = typeof swfobject === 'object'  && swfobject.hasFlashPlayerVersion('9.0.28'),
/* 16  */ 		$successMessage = $('.iphorm-success-message', $form),
/* 17  */ 		$loadingSpinner = $('.iphorm-loading-wrap', $form);
/* 18  */ 
/* 19  */ 		// Expose the form to the outside world
/* 20  */ 		_this.$form = $form;
/* 21  */ 
/* 22  */ 		// Load in any options
/* 23  */ 		if (options) {
/* 24  */ 			$.extend(settings, options);
/* 25  */ 		}
/* 26  */ 
/* 27  */ 		/**
/* 28  *| 		 * Add an SWFUpload element to the form
/* 29  *| 		 *
/* 30  *| 		 * @param object element JavaScript object containing the element information
/* 31  *| 		 */
/* 32  */ 		_this.addUploader = function (element) {
/* 33  */ 			if (supportsSwfUpload) {
/* 34  */ 				// Hide the normal file element
/* 35  */ 				$('.' + element.name + '-input-wrap', $form).hide();
/* 36  */ 				$('.' + element.name + '-add-another-upload', $form).hide();
/* 37  */ 
/* 38  */ 				// Show the SWFUpload element
/* 39  */ 				$('#' + element.uniqueId + '-swfupload').show();
/* 40  */ 
/* 41  */ 				var $queue = $('#' + element.uniqueId + '-file-queue'),
/* 42  */                 $queueErrors = $('#' + element.uniqueId + '-file-queue-errors'),
/* 43  */                 browseButton = getHiddenDimensions($('#' + element.uniqueId + '-browse')), swfu;
/* 44  */ 
/* 45  */ 				// Define SWFUpload handles
/* 46  */ 				function fileDialogStart () {
/* 47  */ 					$queueErrors.hide().empty();
/* 48  */ 				}
/* 49  */ 
/* 50  */ 				function fileQueued (file) {

/* jquery.iphorm.js */

/* 51  */ 					var $close = $('<div class="iphorm-upload-queue-remove">X</div>').click(function () {
/* 52  */                         swfu.cancelUpload(file.id);
/* 53  */                         for (var i = 0; i < uploadQueue.length; i++) {
/* 54  */                             if (uploadQueue[i].file.id == file.id) {
/* 55  */                                 uploadQueue.splice(i, 1);
/* 56  */                             }
/* 57  */                         }
/* 58  */                         $(this).parent().remove();
/* 59  */ 
/* 60  */                         if ($queue.children().length == 0) {
/* 61  */                         	$queue.hide();
/* 62  */                         }
/* 63  */                     });
/* 64  */ 
/* 65  */                     uploadQueue.push({
/* 66  */                         file: file,
/* 67  */                         uploaderId: swfu.movieName
/* 68  */                     });
/* 69  */ 
/* 70  */                     $queue.append($('<div id="' + file.id + '" class="iphorm-upload-queue-file"><div class="iphorm-upload-queue-filename">' + file.name + ' (' + formatFileSize(file.size) + ')</div></div>').append($close)).show();
/* 71  */ 				}
/* 72  */ 
/* 73  */ 				function fileQueueError (file, errorCode, message) {
/* 74  */ 					$queueErrorsList = $('<div class="iphorm-queue-errors-list iphorm-clearfix"></div>');
/* 75  */ 
/* 76  */ 					switch (errorCode) {
/* 77  */ 	                    case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
/* 78  */ 	                    	$queueErrorsList.append('<div class="iphorm-queue-error">' + iphormL10n.swfupload_too_many + '</div>');
/* 79  */ 	                        break;
/* 80  */ 	                    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
/* 81  */ 	                    	$queueErrorsList.append('<div class="iphorm-queue-error">' + file.name + ' - ' + iphormL10n.swfupload_file_too_big + '</div>');
/* 82  */ 	                        break;
/* 83  */ 	                    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
/* 84  */ 	                    	$queueErrorsList.append('<div class="iphorm-queue-error">' + file.name + ' - ' + iphormL10n.swfupload_file_empty + '</div>');
/* 85  */ 	                        break;
/* 86  */ 	                    case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
/* 87  */ 	                    	$queueErrorsList.append('<div class="iphorm-queue-error">' + file.name + ' - ' + iphormL10n.swfupload_file_type_not_allowed + '</div>');
/* 88  */ 	                        break;
/* 89  */ 	                    default:
/* 90  */ 	                    	$queueErrorsList.append('<div class="iphorm-queue-error">' + iphormL10n.swfupload_unknown_queue_error + '</div>');
/* 91  */ 	                        break;
/* 92  */ 	                }
/* 93  */ 
/* 94  */ 					$queueErrors.append($queueErrorsList).show();
/* 95  */ 				}
/* 96  */ 
/* 97  */ 				function uploadStart(file) {
/* 98  */ 					// Show the upload progress bar
/* 99  */ 					$('.iphom-upload-progress-wrap').show();
/* 100 */ 				}

/* jquery.iphorm.js */

/* 101 */ 
/* 102 */ 				function uploadProgress(file, bytesLoaded, bytesTotal) {
/* 103 */ 					var progress = Math.min(100, ((bytesLoaded / file.size) * 100)); // Limit to 100% maximum
/* 104 */ 					$('.iphorm-upload-progress-bar').css('width', progress + '%');
/* 105 */ 					$('.iphorm-upload-filename').text(file.name);
/* 106 */ 				}
/* 107 */ 
/* 108 */ 				function uploadError(file, errorCode, message) {
/* 109 */ 					switch (errorCode) {
/* 110 */ 						case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
/* 111 */ 							swfUploadError = true;
/* 112 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_upload_error).show();
/* 113 */ 							break;
/* 114 */ 						case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
/* 115 */ 							swfUploadError = true;
/* 116 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_upload_failed).show();
/* 117 */ 							break;
/* 118 */ 						case SWFUpload.UPLOAD_ERROR.IO_ERROR:
/* 119 */ 							swfUploadError = true;
/* 120 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_server_io).show();
/* 121 */ 							break;
/* 122 */ 						case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
/* 123 */ 							swfUploadError = true;
/* 124 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_security_error).show();
/* 125 */ 							break;
/* 126 */ 						case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
/* 127 */ 							swfUploadError = true;
/* 128 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_limit_exceeded).show();
/* 129 */ 							break;
/* 130 */ 						case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
/* 131 */ 							swfUploadError = true;
/* 132 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_validation_failed).show();
/* 133 */ 							break;
/* 134 */ 						case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
/* 135 */ 							break;
/* 136 */ 						case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
/* 137 */ 							swfUploadError = true;
/* 138 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_upload_stopped).show();
/* 139 */ 							break;
/* 140 */ 						default:
/* 141 */ 							swfUploadError = true;
/* 142 */ 							$('.iphorm-upload-error', $form).text(iphormL10n.swfupload_unknown_upload_error).show();
/* 143 */ 							break;
/* 144 */ 					}
/* 145 */ 				}
/* 146 */ 
/* 147 */ 				function uploadSuccess(file, response) {
/* 148 */ 					if (response) {
/* 149 */ 						var response = $.parseJSON(response);
/* 150 */ 

/* jquery.iphorm.js */

/* 151 */ 						if (typeof response == 'object' && response.type == 'error') {
/* 152 */ 						    swfUploadError = true;
/* 153 */ 						    $('.iphorm-upload-error', $form).text(file.name + ' - ' + response.data[0]).show();
/* 154 */ 							$('#' + file.id, $form).remove();
/* 155 */ 						}
/* 156 */ 					}
/* 157 */ 				}
/* 158 */ 
/* 159 */ 				function uploadComplete(file) {
/* 160 */ 					if (!swfUploadError) {
/* 161 */ 						// Show the file as uploaded successfully
/* 162 */ 						$('#' + file.id, $form).find('.iphorm-upload-queue-remove').removeClass('iphorm-upload-queue-remove').addClass('iphorm-upload-queue-success').unbind('click');
/* 163 */ 
/* 164 */ 						if (uploadQueue.length > 0) {
/* 165 */ 							var next = uploadQueue.shift();
/* 166 */ 							getUploader(next.uploaderId).startUpload(next.file.id);
/* 167 */ 						} else {
/* 168 */ 							// Nothing left in the queue so this time we submit the form
/* 169 */ 							$('.iphom-upload-progress-wrap').hide();
/* 170 */ 							_this.submit();
/* 171 */ 						}
/* 172 */ 					} else {
/* 173 */ 						// Hide the loading spinner
/* 174 */ 						$loadingSpinner.hide();
/* 175 */ 						resetSWFUpload();
/* 176 */ 						submitted = false;
/* 177 */ 					}
/* 178 */ 				}
/* 179 */ 
/* 180 */ 				swfu = new SWFUpload({
/* 181 */ 					button_height: browseButton.outerHeight,
/* 182 */                     button_width: browseButton.outerWidth,
/* 183 */                     button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
/* 184 */                     button_placeholder_id: element.uniqueId + '-object',
/* 185 */                     button_cursor: SWFUpload.CURSOR.HAND,
/* 186 */ 
/* 187 */                     flash_url: iphormL10n.swfupload_flash_url,
/* 188 */                     upload_url: iphormL10n.swfupload_upload_url,
/* 189 */                     file_post_name: element.name,
/* 190 */ 
/* 191 */                     file_dialog_start_handler: fileDialogStart,
/* 192 */                     file_queued_handler: fileQueued,
/* 193 */     				file_queue_error_handler: fileQueueError,
/* 194 */     				upload_start_handler: uploadStart,
/* 195 */     				upload_progress_handler: uploadProgress,
/* 196 */     				upload_error_handler: uploadError,
/* 197 */     				upload_success_handler: uploadSuccess,
/* 198 */     				upload_complete_handler: uploadComplete,
/* 199 */ 
/* 200 */                     post_params: {

/* jquery.iphorm.js */

/* 201 */                         iphorm_id: settings.id,
/* 202 */                         iphorm_form_uniq_id: settings.uniqueId,
/* 203 */                         iphorm_element_id: element.id,
/* 204 */                         iphorm_element_name: element.name,
/* 205 */                         PHPSESSID: settings.PHPSESSID
/* 206 */                     },
/* 207 */ 
/* 208 */                     prevent_swf_caching: true,
/* 209 */ 
/* 210 */                     file_types : element.fileTypes,
/* 211 */                     file_types_description: element.fileTypesDescription,
/* 212 */                     file_size_limit : element.fileSizeLimit,
/* 213 */                     file_upload_limit : element.fileUploadLimit,
/* 214 */ 
/* 215 */                     debug: false
/* 216 */ 				});
/* 217 */ 
/* 218 */ 				uploaders.push(swfu);
/* 219 */ 			}
/* 220 */ 		}; // End addUploader
/* 221 */ 
/* 222 */ 		/**
/* 223 *| 		 * Bind to the submit event of the form
/* 224 *| 		 */
/* 225 */ 		if (settings.useAjax) {
/* 226 */ 			$form.bind('submit', function(event) {
/* 227 */ 				// Can't submit during preview
/* 228 */ 				if (settings.preview === true) {
/* 229 */ 					alert(iphormL10n.preview_no_submit);
/* 230 */ 					return false;
/* 231 */ 				}
/* 232 */ 
/* 233 */ 				// Prevent double submit
/* 234 */ 				if (submitted) {
/* 235 */ 					return false;
/* 236 */ 				} else {
/* 237 */ 					submitted = true;
/* 238 */ 				}
/* 239 */ 
/* 240 */ 				// Show loading image
/* 241 */ 				$loadingSpinner.fadeIn('slow');
/* 242 */ 
/* 243 */ 				// Prevent the browser submitting the form normally
/* 244 */ 				event.preventDefault();
/* 245 */ 
/* 246 */ 				// Remove any previous upload error
/* 247 */ 				$('.iphorm-upload-error', $form).hide().text('');
/* 248 */ 
/* 249 */ 				// Detect if there are any SWFUpload files in the queue and upload them first
/* 250 */ 				if (uploadQueue.length > 0) {

/* jquery.iphorm.js */

/* 251 */ 					extraData.iphorm_swfu = 1;
/* 252 */ 					var next = uploadQueue.shift();
/* 253 */ 					getUploader(next.uploaderId).startUpload(next.file.id);
/* 254 */ 				} else {
/* 255 */ 					// There are no uploads in the queue, submit the form normally
/* 256 */ 					_this.submit();
/* 257 */ 				}
/* 258 */ 			}); // End bind
/* 259 */ 		} // if settings.useAjax
/* 260 */ 
/* 261 */ 		/**
/* 262 *| 		 * Submits the form
/* 263 *| 		 */
/* 264 */ 		_this.submit = function () {
/* 265 */ 			// Bind the form submit to use the ajax form plugin
/* 266 */ 			$form.ajaxSubmit({
/* 267 */ 				async: false,
/* 268 */ 				type: 'post',
/* 269 */ 				dataType: 'json',
/* 270 */ 				data: extraData,
/* 271 */ 				iframe: true,
/* 272 */ 				url: '',
/* 273 */ 				success: function(response) {
/* 274 */ 					// Reload the recaptcha, we can't use it twice
/* 275 */ 					if (typeof Recaptcha === 'object') {
/* 276 */ 					    try { // Catching errors due to conflict with another plugin
/* 277 */ 					        Recaptcha.reload();
/* 278 */ 					    } catch (e) {}
/* 279 */ 					}
/* 280 */ 
/* 281 */ 					// Prepares the form to be submitted again
/* 282 */ 					var prepareForm = function () {
/* 283 */ 						// Hide the loading spinner
/* 284 */ 						$loadingSpinner.hide();
/* 285 */ 
/* 286 */ 						// Hide any previous errors or success messages
/* 287 */ 						$('.iphorm-errors-wrap', $form).hide();
/* 288 */ 						$('.iphorm-errors-list, .iphorm-error', $form).remove();
/* 289 */ 						$('.iphorm-queue-errors', $form).hide().empty();
/* 290 */ 						$successMessage.hide();
/* 291 */ 						$('.iphorm-element-error', $form).removeClass('iphorm-element-error');
/* 292 */ 
/* 293 */ 						// Allow the form to be submitted again
/* 294 */ 						submitted = false;
/* 295 */ 					};
/* 296 */ 
/* 297 */ 					// Check if the form submission was successful
/* 298 */ 					if (response === null || response === undefined) {
/* 299 */ 						// Hide the loading spinner
/* 300 */ 						$loadingSpinner.hide();

/* jquery.iphorm.js */

/* 301 */ 
/* 302 */ 						// Allow resubmitting
/* 303 */ 						submitted = false;
/* 304 */ 
/* 305 */ 						alert(iphormL10n.error_submitting_form);
/* 306 */ 					} else if (typeof response === 'object') {
/* 307 */ 						if (response.type == 'success') {
/* 308 */ 							prepareForm();
/* 309 */ 							// Reset the captcha
/* 310 */ 							$('.iphorm-captcha-image', $form).trigger('click');
/* 311 */ 
/* 312 */ 							// Reset the form
/* 313 */ 							$form.resetForm();
/* 314 */ 
/* 315 */ 							// Call blur on element to reset inline labels
/* 316 */ 							$('input[type="text"], textarea', $form).blur();
/* 317 */ 
/* 318 */ 							// Hide dynamically added file inputs
/* 319 */ 							$('.iphorm-add-another-file-wrap', $form).remove();
/* 320 */ 
/* 321 */ 							// Reset conditional logic
/* 322 */ 							_this.applyAllLogic();
/* 323 */ 
/* 324 */ 							// Sync uniform with underlying elements
/* 325 */ 							if (typeof $.uniform === 'object' && typeof $.uniform.update === 'function') {
/* 326 */ 								$.uniform.update();
/* 327 */ 							}
/* 328 */ 
/* 329 */ 							// Reset SWF upload stats
/* 330 */ 							resetSWFUpload();
/* 331 */ 
/* 332 */ 							// Hide any tooltips
/* 333 */ 							$('.qtip').hide();
/* 334 */ 
/* 335 */ 							if (typeof response.redirect === 'string') {
/* 336 */ 							    if (response.redirect == '') {
/* 337 */ 							        window.location.reload();
/* 338 */ 							    } else {
/* 339 */ 							        window.location = response.redirect;
/* 340 */ 							    }
/* 341 */ 							} else {
/* 342 */ 								// Then fade in the success message
/* 343 */ 								$successMessage.html(response.data).fadeIn('slow').show(0, function() {
/* 344 */ 									// Set timeout
/* 345 */ 									if (settings.successMessageTimeout > 0) {
/* 346 */ 										setTimeout(function () {
/* 347 */ 											$successMessage.fadeOut(400);
/* 348 */ 										}, (settings.successMessageTimeout * 1000));
/* 349 */ 									}
/* 350 */ 

/* jquery.iphorm.js */

/* 351 */ 									// Custom success callback
/* 352 */ 									if (typeof settings.success === 'function') {
/* 353 */ 										settings.success();
/* 354 */ 									}
/* 355 */ 								});
/* 356 */ 
/* 357 */ 								// Scroll to the success message if it's not in view
/* 358 */ 								if (!isScrolledIntoView($successMessage) && $.isFunction($.smoothScroll)) {
/* 359 */ 									$.smoothScroll({
/* 360 */ 										scrollTarget: $successMessage,
/* 361 */ 										offset: -50,
/* 362 */ 										speed: 500
/* 363 */ 									});
/* 364 */ 								}
/* 365 */ 							}
/* 366 */ 						} else if (response.type == 'error') {
/* 367 */ 							prepareForm();
/* 368 */ 
/* 369 */ 							var $errors = $();
/* 370 */ 
/* 371 */ 							// Go through each element containing errors
/* 372 */ 							$.each(response.data, function(index, info) {
/* 373 */ 								// If there are errors for this element
/* 374 */ 								if (info.errors != undefined && info.errors.length > 0) {
/* 375 */ 									// Save a reference to this element
/* 376 */ 									var $elementWrap = $("." + index + "-element-wrap", $form),
/* 377 */ 									$errorsWrap = $elementWrap.find('.iphorm-errors-wrap');
/* 378 */ 
/* 379 */ 									// If the returned element exists
/* 380 */ 									if ($elementWrap.length && $errorsWrap.length) {
/* 381 */ 										// Create a blank error list
/* 382 */ 										var $errorList = $('<div class="iphorm-errors-list iphorm-clearfix"></div>');
/* 383 */ 
/* 384 */ 										// Go through each error for this field
/* 385 */ 										$.each(info.errors, function(i, e) {
/* 386 */ 											// Append the error to the list as a list item
/* 387 */ 											$errorList.append('<div class="iphorm-error">' + e + '</div>');
/* 388 */ 											return false; // Just display one error per element
/* 389 */ 										});
/* 390 */ 
/* 391 */ 										$errors = $errors.add($elementWrap);
/* 392 */ 
/* 393 */ 										// Add the error list after the element's wrapper
/* 394 */ 										$errorsWrap.append($errorList);
/* 395 */ 
/* 396 */ 										// Add an error class to the element wrapper
/* 397 */ 										$elementWrap.addClass('iphorm-element-error');
/* 398 */ 									}
/* 399 */ 								}
/* 400 */ 							});

/* jquery.iphorm.js */

/* 401 */ 
/* 402 */ 							// Fade all errors in
/* 403 */ 							$('.iphorm-errors-wrap', $form).fadeIn(1000).show();
/* 404 */ 
/* 405 */ 							// Scroll to the first error
/* 406 */ 							if ($errors.size()) {
/* 407 */ 								var $targetError = $errors.get(0);
/* 408 */ 								if (!isScrolledIntoView($targetError) && $.isFunction($.smoothScroll)) {
/* 409 */ 									$.smoothScroll({
/* 410 */ 										scrollTarget: $targetError,
/* 411 */ 										offset: -50,
/* 412 */ 										speed: 700
/* 413 */ 									});
/* 414 */ 								}
/* 415 */ 							}
/* 416 */ 
/* 417 */ 							// Custom error callback
/* 418 */ 							if (typeof settings.error === 'function') {
/* 419 */ 								settings.error();
/* 420 */ 							}
/* 421 */ 						} // End reponse.type == error
/* 422 */ 					} // End typeof response == object
/* 423 */ 				}, // End success callback
/* 424 */ 				error: function () {
/* 425 */ 					// Hide the loading spinner
/* 426 */ 					$loadingSpinner.hide();
/* 427 */ 
/* 428 */ 					// Allow resubmitting
/* 429 */ 					submitted = false;
/* 430 */ 
/* 431 */ 					alert(iphormL10n.error_submitting_form);
/* 432 */ 				}
/* 433 */ 			}); // End ajaxSubmit()
/* 434 */ 		}; // End submit()
/* 435 */ 
/* 436 */ 		/**
/* 437 *| 		 * Adds a datepicker to the element with the given unique ID
/* 438 *| 		 *
/* 439 *| 		 * @param string uniqueId
/* 440 *| 		 */
/* 441 */ 		_this.addDatepicker = function (uniqueId, options) {
/* 442 */             if ($.isFunction($.fn.datepicker)) {
/* 443 */                 var $daySelect = $('#' + uniqueId + '_day'),
/* 444 */                 $monthSelect = $('#' + uniqueId + '_month'),
/* 445 */                 $yearSelect = $('#' + uniqueId + '_year'),
/* 446 */             	$datePicker = $('.iphorm-datepicker', '#' + uniqueId).datepicker($.extend({}, {
/* 447 */             		onSelect: function (dateText, inst) {
/* 448 */             		   $daySelect.val(inst.selectedDay).change();
/* 449 */             		   $monthSelect.val(inst.selectedMonth + 1).change();
/* 450 */             		   $yearSelect.val(inst.selectedYear).change();

/* jquery.iphorm.js */

/* 451 */                     },
/* 452 */                     beforeShow: function (input, inst) {
/* 453 */                         var currentTime = new Date(),
/* 454 */                         dayToSet = ($daySelect.val().length > 0) ? $daySelect.val() : currentTime.getDate(),
/* 455 */                         monthToSet = ($monthSelect.val().length > 0) ? $monthSelect.val()-1 : currentTime.getMonth(),
/* 456 */                         yearToSet = ($yearSelect.val().length > 0) ? $yearSelect.val() : currentTime.getFullYear();
/* 457 */ 
/* 458 */                     	$datePicker.datepicker('setDate', new Date(yearToSet, monthToSet, dayToSet));
/* 459 */                     }}, options)
/* 460 */                 );
/* 461 */ 
/* 462 */                 $('.iphorm-datepicker-icon', '#' + uniqueId).click(function () {
/* 463 */                     $datePicker.datepicker('show');
/* 464 */                 }).show();
/* 465 */             }
/* 466 */ 		};
/* 467 */ 
/* 468 */ 		/**
/* 469 *| 		 * Applies the the logic to all elements
/* 470 *| 		 *
/* 471 *| 		 * If loading is true, bind the logic triggers and do not animate the logic
/* 472 *| 		 *
/* 473 *| 		 * @param boolean loading
/* 474 *| 		 */
/* 475 */ 		_this.applyAllLogic = function (loading) {
/* 476 */ 			_this.applyLogic(settings.clElementIds, loading);
/* 477 */ 
/* 478 */ 			if (loading) {
/* 479 */ 				_this.applyDependentLogic(settings.clDependentElementIds);
/* 480 */ 			}
/* 481 */ 		};
/* 482 */ 
/* 483 */ 		/**
/* 484 *| 		 * Applies logic to show or hide the elements with the given IDs
/* 485 *| 		 *
/* 486 *| 		 * @param array elementIds The element IDs to apply the logic to
/* 487 *| 		 * @param boolean loading True if we are applying initial logic (to skip animating)
/* 488 *| 		 */
/* 489 */ 		_this.applyLogic = function (elementIds, loading) {
/* 490 */ 			for (var i = 0; i < elementIds.length; i++) {
/* 491 */ 				_this.applyElementLogic(elementIds[i], loading);
/* 492 */ 			}
/* 493 */ 		};
/* 494 */ 
/* 495 */ 		/**
/* 496 *| 		 * Apply logic to the given element ID
/* 497 *| 		 *
/* 498 *| 		 * @param int elementId
/* 499 *| 		 * @param boolean loading True if we are applying initial logic (to skip animating)
/* 500 *| 		 */

/* jquery.iphorm.js */

/* 501 */ 		_this.applyElementLogic = function (elementId, loading) {
/* 502 */ 			if (iPhorm.logic[settings.id] && iPhorm.logic[settings.id].logic) {
/* 503 */ 				var logic = iPhorm.logic[settings.id].logic[elementId];
/* 504 */ 
/* 505 */ 				if (logic && logic.rules && logic.rules.length) {
/* 506 */ 					var matchedValues = 0;
/* 507 */ 					for (var i = 0; i < logic.rules.length; i++) {
/* 508 */ 						var rule = logic.rules[i];
/* 509 */ 						if ((rule.operator == 'eq' && _this.elementHasValue(rule.element_id, rule.value)) || (rule.operator == 'neq' && !_this.elementHasValue(rule.element_id, rule.value))) {
/* 510 */ 							matchedValues++;
/* 511 */ 						}
/* 512 */ 					}
/* 513 */ 
/* 514 */ 					if ((logic.match == 'any' && matchedValues > 0) || (logic.match == 'all' && matchedValues == logic.rules.length)) {
/* 515 */ 						var action = logic.action;
/* 516 */ 					} else {
/* 517 */ 						var action = logic.action == 'show' ? 'hide' : 'show';
/* 518 */ 					}
/* 519 */ 
/* 520 */ 					var $element = $('.iphorm_'+settings.id+'_'+elementId+'-element-wrap, .iphorm_'+settings.id+'_'+elementId+'-group-wrap', $form);
/* 521 */ 
/* 522 */ 					if (!loading && iPhorm.logic[settings.id].animate) {
/* 523 */ 						if (action == 'show') {
/* 524 */ 							$element.slideDown(400, function () {
/* 525 */ 								centerFancybox();
/* 526 */ 							});
/* 527 */ 						} else {
/* 528 */ 							$element.slideUp(400, function () {
/* 529 */ 								centerFancybox();
/* 530 */ 							});
/* 531 */ 						}
/* 532 */ 					} else {
/* 533 */ 						if (action == 'show') {
/* 534 */ 							$element.show();
/* 535 */ 						} else {
/* 536 */ 							$element.hide();
/* 537 */ 						}
/* 538 */ 
/* 539 */ 						if (!loading) {
/* 540 */ 							centerFancybox();
/* 541 */ 						}
/* 542 */ 					}
/* 543 */ 				}
/* 544 */ 			}
/* 545 */ 		};
/* 546 */ 
/* 547 */ 		/**
/* 548 *| 		 * Binds the conditional logic events to the elements
/* 549 *| 		 *
/* 550 *| 		 * @param array elementIds

/* jquery.iphorm.js */

/* 551 *| 		 */
/* 552 */ 		_this.applyDependentLogic = function (elementIds) {
/* 553 */ 			if (iPhorm.logic[settings.id] && iPhorm.logic[settings.id].dependents) {
/* 554 */ 				for (var i = 0; i < elementIds.length; i++) {
/* 555 */ 					var dependentElementIds = iPhorm.logic[settings.id].dependents[elementIds[i]],
/* 556 */ 					$input = $('.iphorm_' + settings.id + '_' + elementIds[i], $form);
/* 557 */ 
/* 558 */ 					if ($input.length) {
/* 559 */ 						var bind;
/* 560 */ 						if ($input.is('select')) {
/* 561 */ 							bind = 'change.iphorm';
/* 562 */ 						} else if ($input.is('input[type=checkbox]') || $input.is('input[type=radio]')) {
/* 563 */ 							bind = 'click.iphorm';
/* 564 */ 						}
/* 565 */ 
/* 566 */ 						if (bind) {
/* 567 */ 							(function (deps) {
/* 568 */ 								$input.bind(bind, function () {
/* 569 */ 									_this.applyLogic(deps);
/* 570 */ 								});
/* 571 */ 							})(dependentElementIds);
/* 572 */ 						}
/* 573 */ 					}
/* 574 */ 				}
/* 575 */ 			}
/* 576 */ 		};
/* 577 */ 
/* 578 */ 		/**
/* 579 *| 		 * Does the element of the given ID has the given value?
/* 580 *| 		 *
/* 581 *| 		 * @param int elementId
/* 582 *| 		 * @param string value
/* 583 *| 		 * @return boolean
/* 584 *| 		 */
/* 585 */ 		_this.elementHasValue = function (elementId, value) {
/* 586 */ 			var $input = $('.iphorm_' + settings.id + '_' + elementId, $form);
/* 587 */ 
/* 588 */ 			if ($input.length) {
/* 589 */ 				if ($input.is('select')) {
/* 590 */ 					if ($input.val() == value) {
/* 591 */ 						return true;
/* 592 */ 					}
/* 593 */ 				} else if ($input.is('input[type=checkbox]') || $input.is('input[type=radio]')) {
/* 594 */ 					var hasValue = false;
/* 595 */ 					$.each($input, function () {
/* 596 */ 						if ($(this).is(':checked') && $(this).val() == value) {
/* 597 */ 							hasValue = true;
/* 598 */ 							return false;
/* 599 */ 						}
/* 600 */ 					});

/* jquery.iphorm.js */

/* 601 */ 					return hasValue;
/* 602 */ 				}
/* 603 */ 			}
/* 604 */ 
/* 605 */ 			return false;
/* 606 */ 		};
/* 607 */ 
/* 608 */ 		/**
/* 609 *| 		 * Clears the default value and saves it and unbind the focus event,
/* 610 *| 		 * if reset is true a blur event is bound to show the default value
/* 611 *| 		 * again on blur if left empty.
/* 612 *| 		 *
/* 613 *| 		 * @param boolean reset
/* 614 *| 		 */
/* 615 */ 		_this.clearDefaultValue = function (reset) {
/* 616 */         	$(this).data('iphorm-default-value', $(this).val()).val('').unbind('focus');
/* 617 */ 
/* 618 */         	if (reset) {
/* 619 */             	$(this).bind('blur', function () {
/* 620 */             		_this.resetDefaultValue.call(this);
/* 621 */                 });
/* 622 */         	}
/* 623 */         };
/* 624 */ 
/* 625 */         /**
/* 626 *|          * Resets the default value of the element
/* 627 *|          */
/* 628 */         _this.resetDefaultValue = function () {
/* 629 */ 			if ($(this).val() == '') {
/* 630 */ 				$(this).val($(this).data('iphorm-default-value')).unbind('blur').bind('focus', function () {
/* 631 */ 					_this.clearDefaultValue.call(this, true);
/* 632 */ 				});
/* 633 */ 			}
/* 634 */         };
/* 635 */ 
/* 636 */         /**
/* 637 *|          * Center the fancybox inside the viewport
/* 638 *|          */
/* 639 */         function centerFancybox()
/* 640 */         {
/* 641 */         	if (settings.centerFancybox && typeof $.fancybox === 'function' && typeof $.fancybox.center === 'function' && $('#fancybox-wrap').length && $('#fancybox-wrap').is(':visible')) {
/* 642 */                 $.fancybox.center(settings.centerFancyboxSpeed);
/* 643 */         	}
/* 644 */         }
/* 645 */ 
/* 646 */ 		/**
/* 647 *| 		 * Format a file size given in bytes to a human readable value
/* 648 *| 		 *
/* 649 *| 		 * @param int File size in bytes
/* 650 *| 		 * @return string

/* jquery.iphorm.js */

/* 651 *| 		 */
/* 652 */ 		function formatFileSize(size) {
/* 653 */ 			if (size >= 1073741824) {
/* 654 */ 				size = (Math.round((size / 1073741824) * 10) / 10) + ' GB';
/* 655 */ 			} else if (size >= 1048576) {
/* 656 */ 				size = (Math.round((size / 1048576) * 10) / 10) + ' MB';
/* 657 */ 			} else if (size >= 1024) {
/* 658 */ 				size = (Math.round((size / 1024) * 10) / 10) + ' KB';
/* 659 */ 			} else {
/* 660 */ 				size = size + ' bytes';
/* 661 */ 			}
/* 662 */ 
/* 663 */ 			return size;
/* 664 */ 		}
/* 665 */ 
/* 666 */ 		/**
/* 667 *| 		 * Get the SWFUploader with the given ID
/* 668 *| 		 *
/* 669 *| 		 * @param string The uploader movie ID
/* 670 *| 		 * @return object|null
/* 671 *| 		 */
/* 672 */ 		function getUploader(uploaderId)
/* 673 */ 		{
/* 674 */ 			for (var i = 0; i < uploaders.length; i++) {
/* 675 */ 				if (uploaders[i].movieName == uploaderId) {
/* 676 */ 					return uploaders[i];
/* 677 */ 				}
/* 678 */ 			}
/* 679 */ 
/* 680 */ 			return null;
/* 681 */ 		}
/* 682 */ 
/* 683 */ 		/**
/* 684 *| 		 * Is the element in or scrolled out of the current viewport
/* 685 *| 		 *
/* 686 *| 		 * @param DOMElement element
/* 687 *| 		 * @return boolean
/* 688 *| 		 */
/* 689 */ 		function isScrolledIntoView(elem) {
/* 690 */ 	        var docViewTop = $(window).scrollTop();
/* 691 */ 	        var docViewBottom = docViewTop + $(window).height();
/* 692 */ 
/* 693 */ 	        var elemTop = $(elem).offset().top;
/* 694 */ 	        var elemBottom = elemTop + $(elem).height();
/* 695 */ 
/* 696 */ 	        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
/* 697 */ 	          && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
/* 698 */ 	    }
/* 699 */ 
/* 700 */ 		/**

/* jquery.iphorm.js */

/* 701 *| 		 * Reset all the SWFUpload fields and stats
/* 702 *| 		 */
/* 703 */ 		function resetSWFUpload()
/* 704 */ 		{
/* 705 */ 			// Reset the SWFUpload stats and queues
/* 706 */ 			$('.iphorm-file-queue').hide().empty();
/* 707 */ 			for (var i = 0; i < uploaders.length; i++) {
/* 708 */ 				try {
/* 709 */ 					uploaders[i].setStats({
/* 710 */ 						in_progress: 0,
/* 711 */ 						files_queued : 0,
/* 712 */ 						successful_uploads : 0,
/* 713 */ 						upload_errors : 0,
/* 714 */ 						upload_cancelled : 0,
/* 715 */ 						queue_errors : 0
/* 716 */ 					});
/* 717 */ 				} catch (e) {}
/* 718 */ 			}
/* 719 */ 		}
/* 720 */ 
/* 721 */ 		/**
/* 722 *| 		 * Get the dimensions of the given element even if it is hidden
/* 723 *| 		 *
/* 724 *| 		 * @param DOMElement element
/* 725 *| 		 * @param boolean includeMargin Include margin in outerWidth?
/* 726 *| 		 * @return object Object with all dimensions
/* 727 *| 		 */
/* 728 */ 		function getHiddenDimensions(element, includeMargin) {
/* 729 */ 		    var $item = $(element),
/* 730 */ 		        props = { position: 'absolute', visibility: 'hidden', display: 'block' },
/* 731 */ 		        dim = { width:0, height:0, innerWidth: 0, innerHeight: 0,outerWidth: 0,outerHeight: 0 },
/* 732 */ 		        $hiddenParents = $item.parents()[!!$.fn.addBack ? 'addBack' : 'andSelf']().not(':visible'),
/* 733 */ 		        includeMargin = (includeMargin == null)? false : includeMargin;
/* 734 */ 
/* 735 */ 		    var oldProps = [];
/* 736 */ 		    $hiddenParents.each(function() {
/* 737 */ 		        var old = {};
/* 738 */ 
/* 739 */ 		        for ( var name in props ) {
/* 740 */ 		            old[ name ] = this.style[ name ];
/* 741 */ 		            this.style[ name ] = props[ name ];
/* 742 */ 		        }
/* 743 */ 
/* 744 */ 		        oldProps.push(old);
/* 745 */ 		    });
/* 746 */ 
/* 747 */ 		    dim.width = $item.width();
/* 748 */ 		    dim.outerWidth = $item.outerWidth(includeMargin);
/* 749 */ 		    dim.innerWidth = $item.innerWidth();
/* 750 */ 		    dim.height = $item.height();

/* jquery.iphorm.js */

/* 751 */ 		    dim.innerHeight = $item.innerHeight();
/* 752 */ 		    dim.outerHeight = $item.outerHeight(includeMargin);
/* 753 */ 
/* 754 */ 		    $hiddenParents.each(function(i) {
/* 755 */ 		        var old = oldProps[i];
/* 756 */ 		        for ( var name in props ) {
/* 757 */ 		            this.style[ name ] = old[ name ];
/* 758 */ 		        }
/* 759 */ 		    });
/* 760 */ 
/* 761 */ 		    return dim;
/* 762 */ 		};
/* 763 */ 	}; // End $.iPhorm()
/* 764 */ 
/* 765 */ 	$.fn.iPhorm = function(options) {
/* 766 */ 		return this.each(function () {
/* 767 */ 			iPhorm.instance = new $.iPhorm($(this), options);
/* 768 */ 		});
/* 769 */ 	}; // End $.fn.iPhorm
/* 770 */ 
/* 771 */ 	// Preload the images in the base theme
/* 772 */ 	$(window).load(function () {
/* 773 */         window.iPhorm.preload([
/* 774 */             'file-upload-tick.png',
/* 775 */             'captcha-refresh-icon.png',
/* 776 */             'default-loading.gif',
/* 777 */             'error.png',
/* 778 */             'success.png'
/* 779 */         ], iphormL10n.plugin_url + '/images/');
/* 780 */     });
/* 781 */ })(jQuery); // End jQuery wrapper

;
/* jquery.form.min.js */

/* 1 */ /*
/* 2 *| * jQuery Form Plugin; v20130616
/* 3 *| * http://jquery.malsup.com/form/
/* 4 *| * Copyright (c) 2013 M. Alsup; Dual licensed: MIT/GPL
/* 5 *| * https://github.com/malsup/form#copyright-and-license
/* 6 *| */
/* 7 */ ;(function(e){"use strict";function t(t){var r=t.data;t.isDefaultPrevented()||(t.preventDefault(),e(this).ajaxSubmit(r))}function r(t){var r=t.target,a=e(r);if(!a.is("[type=submit],[type=image]")){var n=a.closest("[type=submit]");if(0===n.length)return;r=n[0]}var i=this;if(i.clk=r,"image"==r.type)if(void 0!==t.offsetX)i.clk_x=t.offsetX,i.clk_y=t.offsetY;else if("function"==typeof e.fn.offset){var o=a.offset();i.clk_x=t.pageX-o.left,i.clk_y=t.pageY-o.top}else i.clk_x=t.pageX-r.offsetLeft,i.clk_y=t.pageY-r.offsetTop;setTimeout(function(){i.clk=i.clk_x=i.clk_y=null},100)}function a(){if(e.fn.ajaxSubmit.debug){var t="[jquery.form] "+Array.prototype.join.call(arguments,"");window.console&&window.console.log?window.console.log(t):window.opera&&window.opera.postError&&window.opera.postError(t)}}var n={};n.fileapi=void 0!==e("<input type='file'/>").get(0).files,n.formdata=void 0!==window.FormData;var i=!!e.fn.prop;e.fn.attr2=function(){if(!i)return this.attr.apply(this,arguments);var e=this.prop.apply(this,arguments);return e&&e.jquery||"string"==typeof e?e:this.attr.apply(this,arguments)},e.fn.ajaxSubmit=function(t){function r(r){var a,n,i=e.param(r,t.traditional).split("&"),o=i.length,s=[];for(a=0;o>a;a++)i[a]=i[a].replace(/\+/g," "),n=i[a].split("="),s.push([decodeURIComponent(n[0]),decodeURIComponent(n[1])]);return s}function o(a){for(var n=new FormData,i=0;a.length>i;i++)n.append(a[i].name,a[i].value);if(t.extraData){var o=r(t.extraData);for(i=0;o.length>i;i++)o[i]&&n.append(o[i][0],o[i][1])}t.data=null;var s=e.extend(!0,{},e.ajaxSettings,t,{contentType:!1,processData:!1,cache:!1,type:u||"POST"});t.uploadProgress&&(s.xhr=function(){var r=e.ajaxSettings.xhr();return r.upload&&r.upload.addEventListener("progress",function(e){var r=0,a=e.loaded||e.position,n=e.total;e.lengthComputable&&(r=Math.ceil(100*(a/n))),t.uploadProgress(e,a,n,r)},!1),r}),s.data=null;var l=s.beforeSend;return s.beforeSend=function(e,t){t.data=n,l&&l.call(this,e,t)},e.ajax(s)}function s(r){function n(e){var t=null;try{e.contentWindow&&(t=e.contentWindow.document)}catch(r){a("cannot get iframe.contentWindow document: "+r)}if(t)return t;try{t=e.contentDocument?e.contentDocument:e.document}catch(r){a("cannot get iframe.contentDocument: "+r),t=e.document}return t}function o(){function t(){try{var e=n(g).readyState;a("state = "+e),e&&"uninitialized"==e.toLowerCase()&&setTimeout(t,50)}catch(r){a("Server abort: ",r," (",r.name,")"),s(D),j&&clearTimeout(j),j=void 0}}var r=f.attr2("target"),i=f.attr2("action");w.setAttribute("target",d),u||w.setAttribute("method","POST"),i!=m.url&&w.setAttribute("action",m.url),m.skipEncodingOverride||u&&!/post/i.test(u)||f.attr({encoding:"multipart/form-data",enctype:"multipart/form-data"}),m.timeout&&(j=setTimeout(function(){T=!0,s(k)},m.timeout));var o=[];try{if(m.extraData)for(var l in m.extraData)m.extraData.hasOwnProperty(l)&&(e.isPlainObject(m.extraData[l])&&m.extraData[l].hasOwnProperty("name")&&m.extraData[l].hasOwnProperty("value")?o.push(e('<input type="hidden" name="'+m.extraData[l].name+'">').val(m.extraData[l].value).appendTo(w)[0]):o.push(e('<input type="hidden" name="'+l+'">').val(m.extraData[l]).appendTo(w)[0]));m.iframeTarget||(v.appendTo("body"),g.attachEvent?g.attachEvent("onload",s):g.addEventListener("load",s,!1)),setTimeout(t,15);try{w.submit()}catch(c){var p=document.createElement("form").submit;p.apply(w)}}finally{w.setAttribute("action",i),r?w.setAttribute("target",r):f.removeAttr("target"),e(o).remove()}}function s(t){if(!x.aborted&&!F){if(M=n(g),M||(a("cannot access response document"),t=D),t===k&&x)return x.abort("timeout"),S.reject(x,"timeout"),void 0;if(t==D&&x)return x.abort("server abort"),S.reject(x,"error","server abort"),void 0;if(M&&M.location.href!=m.iframeSrc||T){g.detachEvent?g.detachEvent("onload",s):g.removeEventListener("load",s,!1);var r,i="success";try{if(T)throw"timeout";var o="xml"==m.dataType||M.XMLDocument||e.isXMLDoc(M);if(a("isXml="+o),!o&&window.opera&&(null===M.body||!M.body.innerHTML)&&--O)return a("requeing onLoad callback, DOM not available"),setTimeout(s,250),void 0;var u=M.body?M.body:M.documentElement;x.responseText=u?u.innerHTML:null,x.responseXML=M.XMLDocument?M.XMLDocument:M,o&&(m.dataType="xml"),x.getResponseHeader=function(e){var t={"content-type":m.dataType};return t[e]},u&&(x.status=Number(u.getAttribute("status"))||x.status,x.statusText=u.getAttribute("statusText")||x.statusText);var l=(m.dataType||"").toLowerCase(),c=/(json|script|text)/.test(l);if(c||m.textarea){var f=M.getElementsByTagName("textarea")[0];if(f)x.responseText=f.value,x.status=Number(f.getAttribute("status"))||x.status,x.statusText=f.getAttribute("statusText")||x.statusText;else if(c){var d=M.getElementsByTagName("pre")[0],h=M.getElementsByTagName("body")[0];d?x.responseText=d.textContent?d.textContent:d.innerText:h&&(x.responseText=h.textContent?h.textContent:h.innerText)}}else"xml"==l&&!x.responseXML&&x.responseText&&(x.responseXML=X(x.responseText));try{L=_(x,l,m)}catch(b){i="parsererror",x.error=r=b||i}}catch(b){a("error caught: ",b),i="error",x.error=r=b||i}x.aborted&&(a("upload aborted"),i=null),x.status&&(i=x.status>=200&&300>x.status||304===x.status?"success":"error"),"success"===i?(m.success&&m.success.call(m.context,L,"success",x),S.resolve(x.responseText,"success",x),p&&e.event.trigger("ajaxSuccess",[x,m])):i&&(void 0===r&&(r=x.statusText),m.error&&m.error.call(m.context,x,i,r),S.reject(x,"error",r),p&&e.event.trigger("ajaxError",[x,m,r])),p&&e.event.trigger("ajaxComplete",[x,m]),p&&!--e.active&&e.event.trigger("ajaxStop"),m.complete&&m.complete.call(m.context,x,i),F=!0,m.timeout&&clearTimeout(j),setTimeout(function(){m.iframeTarget||v.remove(),x.responseXML=null},100)}}}var l,c,m,p,d,v,g,x,b,y,T,j,w=f[0],S=e.Deferred();if(r)for(c=0;h.length>c;c++)l=e(h[c]),i?l.prop("disabled",!1):l.removeAttr("disabled");if(m=e.extend(!0,{},e.ajaxSettings,t),m.context=m.context||m,d="jqFormIO"+(new Date).getTime(),m.iframeTarget?(v=e(m.iframeTarget),y=v.attr2("name"),y?d=y:v.attr2("name",d)):(v=e('<iframe name="'+d+'" src="'+m.iframeSrc+'" />'),v.css({position:"absolute",top:"-1000px",left:"-1000px"})),g=v[0],x={aborted:0,responseText:null,responseXML:null,status:0,statusText:"n/a",getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(t){var r="timeout"===t?"timeout":"aborted";a("aborting upload... "+r),this.aborted=1;try{g.contentWindow.document.execCommand&&g.contentWindow.document.execCommand("Stop")}catch(n){}v.attr("src",m.iframeSrc),x.error=r,m.error&&m.error.call(m.context,x,r,t),p&&e.event.trigger("ajaxError",[x,m,r]),m.complete&&m.complete.call(m.context,x,r)}},p=m.global,p&&0===e.active++&&e.event.trigger("ajaxStart"),p&&e.event.trigger("ajaxSend",[x,m]),m.beforeSend&&m.beforeSend.call(m.context,x,m)===!1)return m.global&&e.active--,S.reject(),S;if(x.aborted)return S.reject(),S;b=w.clk,b&&(y=b.name,y&&!b.disabled&&(m.extraData=m.extraData||{},m.extraData[y]=b.value,"image"==b.type&&(m.extraData[y+".x"]=w.clk_x,m.extraData[y+".y"]=w.clk_y)));var k=1,D=2,A=e("meta[name=csrf-token]").attr("content"),E=e("meta[name=csrf-param]").attr("content");E&&A&&(m.extraData=m.extraData||{},m.extraData[E]=A),m.forceSync?o():setTimeout(o,10);var L,M,F,O=50,X=e.parseXML||function(e,t){return window.ActiveXObject?(t=new ActiveXObject("Microsoft.XMLDOM"),t.async="false",t.loadXML(e)):t=(new DOMParser).parseFromString(e,"text/xml"),t&&t.documentElement&&"parsererror"!=t.documentElement.nodeName?t:null},C=e.parseJSON||function(e){return window.eval("("+e+")")},_=function(t,r,a){var n=t.getResponseHeader("content-type")||"",i="xml"===r||!r&&n.indexOf("xml")>=0,o=i?t.responseXML:t.responseText;return i&&"parsererror"===o.documentElement.nodeName&&e.error&&e.error("parsererror"),a&&a.dataFilter&&(o=a.dataFilter(o,r)),"string"==typeof o&&("json"===r||!r&&n.indexOf("json")>=0?o=C(o):("script"===r||!r&&n.indexOf("javascript")>=0)&&e.globalEval(o)),o};return S}if(!this.length)return a("ajaxSubmit: skipping submit process - no element selected"),this;var u,l,c,f=this;"function"==typeof t&&(t={success:t}),u=t.type||this.attr2("method"),l=t.url||this.attr2("action"),c="string"==typeof l?e.trim(l):"",c=c||window.location.href||"",c&&(c=(c.match(/^([^#]+)/)||[])[1]),t=e.extend(!0,{url:c,success:e.ajaxSettings.success,type:u||"GET",iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank"},t);var m={};if(this.trigger("form-pre-serialize",[this,t,m]),m.veto)return a("ajaxSubmit: submit vetoed via form-pre-serialize trigger"),this;if(t.beforeSerialize&&t.beforeSerialize(this,t)===!1)return a("ajaxSubmit: submit aborted via beforeSerialize callback"),this;var p=t.traditional;void 0===p&&(p=e.ajaxSettings.traditional);var d,h=[],v=this.formToArray(t.semantic,h);if(t.data&&(t.extraData=t.data,d=e.param(t.data,p)),t.beforeSubmit&&t.beforeSubmit(v,this,t)===!1)return a("ajaxSubmit: submit aborted via beforeSubmit callback"),this;if(this.trigger("form-submit-validate",[v,this,t,m]),m.veto)return a("ajaxSubmit: submit vetoed via form-submit-validate trigger"),this;var g=e.param(v,p);d&&(g=g?g+"&"+d:d),"GET"==t.type.toUpperCase()?(t.url+=(t.url.indexOf("?")>=0?"&":"?")+g,t.data=null):t.data=g;var x=[];if(t.resetForm&&x.push(function(){f.resetForm()}),t.clearForm&&x.push(function(){f.clearForm(t.includeHidden)}),!t.dataType&&t.target){var b=t.success||function(){};x.push(function(r){var a=t.replaceTarget?"replaceWith":"html";e(t.target)[a](r).each(b,arguments)})}else t.success&&x.push(t.success);if(t.success=function(e,r,a){for(var n=t.context||this,i=0,o=x.length;o>i;i++)x[i].apply(n,[e,r,a||f,f])},t.error){var y=t.error;t.error=function(e,r,a){var n=t.context||this;y.apply(n,[e,r,a,f])}}if(t.complete){var T=t.complete;t.complete=function(e,r){var a=t.context||this;T.apply(a,[e,r,f])}}var j=e('input[type=file]:enabled[value!=""]',this),w=j.length>0,S="multipart/form-data",k=f.attr("enctype")==S||f.attr("encoding")==S,D=n.fileapi&&n.formdata;a("fileAPI :"+D);var A,E=(w||k)&&!D;t.iframe!==!1&&(t.iframe||E)?t.closeKeepAlive?e.get(t.closeKeepAlive,function(){A=s(v)}):A=s(v):A=(w||k)&&D?o(v):e.ajax(t),f.removeData("jqxhr").data("jqxhr",A);for(var L=0;h.length>L;L++)h[L]=null;return this.trigger("form-submit-notify",[this,t]),this},e.fn.ajaxForm=function(n){if(n=n||{},n.delegation=n.delegation&&e.isFunction(e.fn.on),!n.delegation&&0===this.length){var i={s:this.selector,c:this.context};return!e.isReady&&i.s?(a("DOM not ready, queuing ajaxForm"),e(function(){e(i.s,i.c).ajaxForm(n)}),this):(a("terminating; zero elements found by selector"+(e.isReady?"":" (DOM not ready)")),this)}return n.delegation?(e(document).off("submit.form-plugin",this.selector,t).off("click.form-plugin",this.selector,r).on("submit.form-plugin",this.selector,n,t).on("click.form-plugin",this.selector,n,r),this):this.ajaxFormUnbind().bind("submit.form-plugin",n,t).bind("click.form-plugin",n,r)},e.fn.ajaxFormUnbind=function(){return this.unbind("submit.form-plugin click.form-plugin")},e.fn.formToArray=function(t,r){var a=[];if(0===this.length)return a;var i=this[0],o=t?i.getElementsByTagName("*"):i.elements;if(!o)return a;var s,u,l,c,f,m,p;for(s=0,m=o.length;m>s;s++)if(f=o[s],l=f.name,l&&!f.disabled)if(t&&i.clk&&"image"==f.type)i.clk==f&&(a.push({name:l,value:e(f).val(),type:f.type}),a.push({name:l+".x",value:i.clk_x},{name:l+".y",value:i.clk_y}));else if(c=e.fieldValue(f,!0),c&&c.constructor==Array)for(r&&r.push(f),u=0,p=c.length;p>u;u++)a.push({name:l,value:c[u]});else if(n.fileapi&&"file"==f.type){r&&r.push(f);var d=f.files;if(d.length)for(u=0;d.length>u;u++)a.push({name:l,value:d[u],type:f.type});else a.push({name:l,value:"",type:f.type})}else null!==c&&c!==void 0&&(r&&r.push(f),a.push({name:l,value:c,type:f.type,required:f.required}));if(!t&&i.clk){var h=e(i.clk),v=h[0];l=v.name,l&&!v.disabled&&"image"==v.type&&(a.push({name:l,value:h.val()}),a.push({name:l+".x",value:i.clk_x},{name:l+".y",value:i.clk_y}))}return a},e.fn.formSerialize=function(t){return e.param(this.formToArray(t))},e.fn.fieldSerialize=function(t){var r=[];return this.each(function(){var a=this.name;if(a){var n=e.fieldValue(this,t);if(n&&n.constructor==Array)for(var i=0,o=n.length;o>i;i++)r.push({name:a,value:n[i]});else null!==n&&n!==void 0&&r.push({name:this.name,value:n})}}),e.param(r)},e.fn.fieldValue=function(t){for(var r=[],a=0,n=this.length;n>a;a++){var i=this[a],o=e.fieldValue(i,t);null===o||void 0===o||o.constructor==Array&&!o.length||(o.constructor==Array?e.merge(r,o):r.push(o))}return r},e.fieldValue=function(t,r){var a=t.name,n=t.type,i=t.tagName.toLowerCase();if(void 0===r&&(r=!0),r&&(!a||t.disabled||"reset"==n||"button"==n||("checkbox"==n||"radio"==n)&&!t.checked||("submit"==n||"image"==n)&&t.form&&t.form.clk!=t||"select"==i&&-1==t.selectedIndex))return null;if("select"==i){var o=t.selectedIndex;if(0>o)return null;for(var s=[],u=t.options,l="select-one"==n,c=l?o+1:u.length,f=l?o:0;c>f;f++){var m=u[f];if(m.selected){var p=m.value;if(p||(p=m.attributes&&m.attributes.value&&!m.attributes.value.specified?m.text:m.value),l)return p;s.push(p)}}return s}return e(t).val()},e.fn.clearForm=function(t){return this.each(function(){e("input,select,textarea",this).clearFields(t)})},e.fn.clearFields=e.fn.clearInputs=function(t){var r=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var a=this.type,n=this.tagName.toLowerCase();r.test(a)||"textarea"==n?this.value="":"checkbox"==a||"radio"==a?this.checked=!1:"select"==n?this.selectedIndex=-1:"file"==a?/MSIE/.test(navigator.userAgent)?e(this).replaceWith(e(this).clone(!0)):e(this).val(""):t&&(t===!0&&/hidden/.test(a)||"string"==typeof t&&e(this).is(t))&&(this.value="")})},e.fn.resetForm=function(){return this.each(function(){("function"==typeof this.reset||"object"==typeof this.reset&&!this.reset.nodeType)&&this.reset()})},e.fn.enable=function(e){return void 0===e&&(e=!0),this.each(function(){this.disabled=!e})},e.fn.selected=function(t){return void 0===t&&(t=!0),this.each(function(){var r=this.type;if("checkbox"==r||"radio"==r)this.checked=t;else if("option"==this.tagName.toLowerCase()){var a=e(this).parent("select");t&&a[0]&&"select-one"==a[0].type&&a.find("option").selected(!1),this.selected=t}})},e.fn.ajaxSubmit.debug=!1})(jQuery);

;
/* jquery.smooth-scroll.min.js */

/* 1  */ /*! Smooth Scroll - v1.4.9 - 2013-01-21
/* 2  *| * https://github.com/kswedberg/jquery-smooth-scroll
/* 3  *| * Copyright (c) 2013 Karl Swedberg; Licensed MIT
/* 4  *| *
/* 5  *| * Modified by ThemeCatcher to be compatible with jQuery Tools Scrollable
/* 6  *| * The following code was removed from the original file:
/* 7  *| * 
/* 8  *| *   scrollable: function(dir) {
/* 9  *| *	    var scrl = getScrollable.call(this, {dir: dir});
/* 10 *| *	    return this.pushStack(scrl);
/* 11 *| *  	},
/* 12 *| * 
/* 13 *| */
/* 14 */ (function(b){function m(b){return b.replace(/(:|\.)/g,"\\$1")}b.fn.extend({firstScrollable:function(e){var c=[],a=!1,f=e&&"left"==e?"scrollLeft":"scrollTop";this.each(function(){if(!(this==document||this==window)){var d=b(this);0<d[f]()?c.push(this):(d[f](1),(a=0<d[f]())&&c.push(this),d[f](0))}});c.length||this.each(function(){"BODY"===this.nodeName&&(c=[this])});1<c.length&&(c=[c[0]]);return this.pushStack(c)},smoothScroll:function(e){e=e||{};var c=b.extend({},b.fn.smoothScroll.defaults,e),a=b.smoothScroll.filterPath(location.pathname); this.unbind("click.smoothscroll").bind("click.smoothscroll",function(e){var d=b(this),g=c.exclude,j=c.excludeWithin,h=0,k=0,l=!0,n={},q=location.hostname===this.hostname||!this.hostname,r=c.scrollTarget||(b.smoothScroll.filterPath(this.pathname)||a)===a,p=m(this.hash);if(!c.scrollTarget&&(!q||!r||!p))l=!1;else{for(;l&&h<g.length;)d.is(m(g[h++]))&&(l=!1);for(;l&&k<j.length;)d.closest(j[k++]).length&&(l=!1)}l&&(e.preventDefault(),b.extend(n,c,{scrollTarget:c.scrollTarget||p,link:this}),b.smoothScroll(n))}); return this}});b.smoothScroll=function(e,c){var a,f,d,g;g=0;var j="offset",h="scrollTop",k={};d={};"number"===typeof e?(a=b.fn.smoothScroll.defaults,d=e):(a=b.extend({},b.fn.smoothScroll.defaults,e||{}),a.scrollElement&&(j="position","static"==a.scrollElement.css("position")&&a.scrollElement.css("position","relative")));a=b.extend({link:null},a);h="left"==a.direction?"scrollLeft":h;a.scrollElement?(f=a.scrollElement,g=f[h]()):f=b("html, body").firstScrollable();a.beforeScroll.call(f,a);d="number"=== typeof e?e:c||b(a.scrollTarget)[j]()&&b(a.scrollTarget)[j]()[a.direction]||0;k[h]=d+g+a.offset;g=a.speed;"auto"===g&&(g=k[h]||f.scrollTop(),g/=a.autoCoefficent);d={duration:g,easing:a.easing,complete:function(){a.afterScroll.call(a.link,a)}};a.step&&(d.step=a.step);f.length?f.stop().animate(k,d):a.afterScroll.call(a.link,a)};b.smoothScroll.version="1.4.9";b.smoothScroll.filterPath=function(b){return b.replace(/^\//,"").replace(/(index|default).[a-zA-Z]{3,4}$/,"").replace(/\/$/,"")};b.fn.smoothScroll.defaults= {exclude:[],excludeWithin:[],offset:0,direction:"top",scrollElement:null,scrollTarget:null,beforeScroll:function(){},afterScroll:function(){},easing:"swing",speed:400,autoCoefficent:2}})(jQuery);

;
/* jquery.qtip.min.js */

/* 1 */ /*! qTip2 v2.0.1-36- (includes: tips / basic css3) | qtip2.com | Licensed MIT, GPL | Wed Mar 20 2013 08:57:14 */
/* 2 */ (function(e,t,n){(function(e){"use strict";typeof define=="function"&&define.amd?define(["jquery"],e):jQuery&&!jQuery.fn.qtip&&e(jQuery)})(function(r){function P(n){S={pageX:n.pageX,pageY:n.pageY,type:"mousemove",scrollX:e.pageXOffset||t.body.scrollLeft||t.documentElement.scrollLeft,scrollY:e.pageYOffset||t.body.scrollTop||t.documentElement.scrollTop}}function H(e){var t=function(e){return e===o||"object"!=typeof e},n=function(e){return!r.isFunction(e)&&(!e&&!e.attr||e.length<1||"object"==typeof e&&!e.jquery&&!e.then)};if(!e||"object"!=typeof e)return s;t(e.metadata)&&(e.metadata={type:e.metadata});if("content"in e){if(t(e.content)||e.content.jquery)e.content={text:e.content};n(e.content.text||s)&&(e.content.text=s),"title"in e.content&&(t(e.content.title)&&(e.content.title={text:e.content.title}),n(e.content.title.text||s)&&(e.content.title.text=s))}return"position"in e&&t(e.position)&&(e.position={my:e.position,at:e.position}),"show"in e&&t(e.show)&&(e.show=e.show.jquery?{target:e.show}:e.show===i?{ready:i}:{event:e.show}),"hide"in e&&t(e.hide)&&(e.hide=e.hide.jquery?{target:e.hide}:{event:e.hide}),"style"in e&&t(e.style)&&(e.style={classes:e.style}),r.each(E,function(){this.sanitize&&this.sanitize(e)}),e}function B(n,u,a,f){function R(e){var t=0,n,r=u,i=e.split(".");while(r=r[i[t++]])t<i.length&&(n=r);return[n||u,i.pop()]}function U(e){return C.concat("").join(e?"-"+e+" ":" ")}function z(){var e=u.style.widget,t=B.hasClass(F);B.removeClass(F),F=e?"ui-state-disabled":"qtip-disabled",B.toggleClass(F,t),B.toggleClass("ui-helper-reset "+U(),e).toggleClass(L,u.style.def&&!e),I.content&&I.content.toggleClass(U("content"),e),I.titlebar&&I.titlebar.toggleClass(U("header"),e),I.button&&I.button.toggleClass(x+"-icon",!e)}function W(e){I.title&&(I.titlebar.remove(),I.titlebar=I.title=I.button=o,e!==s&&l.reposition())}function X(){var e=u.content.title.button,t=typeof e=="string",n=t?e:"Close tooltip";I.button&&I.button.remove(),e.jquery?I.button=e:I.button=r("<a />",{"class":"qtip-close "+(u.style.widget?"":x+"-icon"),title:n,"aria-label":n}).prepend(r("<span />",{"class":"ui-icon ui-icon-close",html:"&times;"})),I.button.appendTo(I.titlebar||B).attr("role","button").click(function(e){return B.hasClass(F)||l.hide(e),s})}function V(){var e=g+"-title";I.titlebar&&W(),I.titlebar=r("<div />",{"class":x+"-titlebar "+(u.style.widget?U("header"):"")}).append(I.title=r("<div />",{id:e,"class":x+"-title","aria-atomic":i})).insertBefore(I.content).delegate(".qtip-close","mousedown keydown mouseup keyup mouseout",function(e){r(this).toggleClass("ui-state-active ui-state-focus",e.type.substr(-4)==="down")}).delegate(".qtip-close","mouseover mouseout",function(e){r(this).toggleClass("ui-state-hover",e.type==="mouseover")}),u.content.title.button&&X()}function J(e){var t=I.button;if(!l.rendered)return s;e?X():t.remove()}function K(e,t){var i=I.title;if(!l.rendered||!e)return s;r.isFunction(e)&&(e=e.call(n,q.event,l));if(e===s||!e&&e!=="")return W(s);e.jquery&&e.length>0?i.empty().append(e.css({display:"block"})):i.html(e),t!==s&&l.rendered&&B[0].offsetWidth>0&&l.reposition(q.event)}function Q(e){e&&r.isFunction(e.done)&&e.done(function(e){G(e,null,s)})}function G(e,t,i){function a(e){function s(t){if(t.src===b||r.inArray(t,i)!==-1)return;i.push(t),r.data(t,"imagesLoaded",{src:t.src}),n.length===i.length&&(setTimeout(e),n.unbind(".imagesLoaded"))}var t=r(this),n=t.find("img").add(t.filter("img")),i=[];if(!n.length)return e();n.bind("load.imagesLoaded error.imagesLoaded",function(e){s(e.target)}).each(function(e,t){var n=t.src,i=r.data(t,"imagesLoaded");if(i&&i.src===n||t.complete&&t.naturalWidth)s(t);else if(t.readyState||t.complete)t.src=b,t.src=n})}var o=I.content;return!l.rendered||!e?s:(r.isFunction(e)&&(e=e.call(n,q.event,l)||""),i!==s&&Q(u.content.deferred),e.jquery&&e.length>0?o.empty().append(e.css({display:"block"})):o.html(e),l.rendered<0?B.queue("fx",a):(M=0,a.call(B[0],r.noop)),l)}function Y(){function p(e){if(B.hasClass(F))return s;clearTimeout(l.timers.show),clearTimeout(l.timers.hide);var t=function(){l.toggle(i,e)};u.show.delay>0?l.timers.show=setTimeout(t,u.show.delay):t()}function d(e){if(B.hasClass(F)||y||M)return s;var t=r(e.relatedTarget),n=t.closest(k)[0]===B[0],i=t[0]===f.show[0];clearTimeout(l.timers.show),clearTimeout(l.timers.hide);if(this!==t[0]&&o.target==="mouse"&&n||u.hide.fixed&&/mouse(out|leave|move)/.test(e.type)&&(n||i)){try{e.preventDefault(),e.stopImmediatePropagation()}catch(a){}return}u.hide.delay>0?l.timers.hide=setTimeout(function(){l.hide(e)},u.hide.delay):l.hide(e)}function v(e){if(B.hasClass(F))return s;clearTimeout(l.timers.inactive),l.timers.inactive=setTimeout(function(){l.hide(e)},u.hide.inactive)}function m(e){l.rendered&&B[0].offsetWidth>0&&l.reposition(e)}var o=u.position,f={show:u.show.target,hide:u.hide.target,viewport:r(o.viewport),document:r(t),body:r(t.body),window:r(e)},c={show:r.trim(""+u.show.event).split(" "),hide:r.trim(""+u.hide.event).split(" ")},h=E.ie===6;B.bind("mouseenter"+j+" mouseleave"+j,function(e){var t=e.type==="mouseenter";t&&l.focus(e),B.toggleClass(O,t)}),/mouse(out|leave)/i.test(u.hide.event)&&u.hide.leave==="window"&&f.document.bind("mouseout"+j+" blur"+j,function(e){!/select|option/.test(e.target.nodeName)&&!e.relatedTarget&&l.hide(e)}),u.hide.fixed?(f.hide=f.hide.add(B),B.bind("mouseover"+j,function(){B.hasClass(F)||clearTimeout(l.timers.hide)})):/mouse(over|enter)/i.test(u.show.event)&&f.hide.bind("mouseleave"+j,function(e){clearTimeout(l.timers.show)}),(""+u.hide.event).indexOf("unfocus")>-1&&o.container.closest("html").bind("mousedown"+j+" touchstart"+j,function(e){var t=r(e.target),i=l.rendered&&!B.hasClass(F)&&B[0].offsetWidth>0,s=t.parents(k).filter(B[0]).length>0;t[0]!==n[0]&&t[0]!==B[0]&&!s&&!n.has(t[0]).length&&i&&l.hide(e)}),"number"==typeof u.hide.inactive&&(f.show.bind("qtip-"+a+"-inactive",v),r.each(w.inactiveEvents,function(e,t){f.hide.add(I.tooltip).bind(t+j+"-inactive",v)})),r.each(c.hide,function(e,t){var n=r.inArray(t,c.show),i=r(f.hide);n>-1&&i.add(f.show).length===i.length||t==="unfocus"?(f.show.bind(t+j,function(e){B[0].offsetWidth>0?d(e):p(e)}),delete c.show[n]):f.hide.bind(t+j,d)}),r.each(c.show,function(e,t){f.show.bind(t+j,p)}),"number"==typeof u.hide.distance&&f.show.add(B).bind("mousemove"+j,function(e){var t=q.origin||{},n=u.hide.distance,r=Math.abs;(r(e.pageX-t.pageX)>=n||r(e.pageY-t.pageY)>=n)&&l.hide(e)}),o.target==="mouse"&&(f.show.bind("mousemove"+j,P),o.adjust.mouse&&(u.hide.event&&(B.bind("mouseleave"+j,function(e){(e.relatedTarget||e.target)!==f.show[0]&&l.hide(e)}),I.target.bind("mouseenter"+j+" mouseleave"+j,function(e){q.onTarget=e.type==="mouseenter"})),f.document.bind("mousemove"+j,function(e){l.rendered&&q.onTarget&&!B.hasClass(F)&&B[0].offsetWidth>0&&l.reposition(e||S)}))),(o.adjust.resize||f.viewport.length)&&(r.event.special.resize?f.viewport:f.window).bind("resize"+j,m),o.adjust.scroll&&f.window.add(o.container).bind("scroll"+j,m)}function Z(){var n=[u.show.target[0],u.hide.target[0],l.rendered&&I.tooltip[0],u.position.container[0],u.position.viewport[0],u.position.container.closest("html")[0],e,t];l.rendered?r([]).pushStack(r.grep(n,function(e){return typeof e=="object"})).unbind(j):u.show.target.unbind(j+"-create")}var l=this,m=t.body,g=x+"-"+a,y=0,M=0,B=r(),j=".qtip-"+a,F="qtip-disabled",I,q;l.id=a,l.rendered=s,l.destroyed=s,l.elements=I={target:n},l.timers={img:{}},l.options=u,l.checks={},l.plugins={},l.cache=q={event:{},target:r(),disabled:s,attr:f,onTarget:s,lastClass:""},l.checks.builtin={"^id$":function(e,t,n){var o=n===i?w.nextid:n,u=x+"-"+o;o!==s&&o.length>0&&!r("#"+u).length&&(B[0].id=u,I.content[0].id=u+"-content",I.title[0].id=u+"-title")},"^content.text$":function(e,t,n){G(u.content.text)},"^content.deferred$":function(e,t,n){Q(u.content.deferred)},"^content.title.text$":function(e,t,n){if(!n)return W();!I.title&&n&&V(),K(n)},"^content.title.button$":function(e,t,n){J(n)},"^position.(my|at)$":function(e,t,n){"string"==typeof n&&(e[t]=new E.Corner(n))},"^position.container$":function(e,t,n){l.rendered&&B.appendTo(n)},"^show.ready$":function(){l.rendered?l.toggle(i):l.render(1)},"^style.classes$":function(e,t,n){B.attr("class",x+" qtip "+n)},"^style.width|height":function(e,t,n){B.css(t,n)},"^style.widget|content.title":z,"^events.(render|show|move|hide|focus|blur)$":function(e,t,n){B[(r.isFunction(n)?"":"un")+"bind"]("tooltip"+t,n)},"^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)":function(){var e=u.position;B.attr("tracking",e.target==="mouse"&&e.adjust.mouse),Z(),Y()}},r.extend(l,{_triggerEvent:function(e,t,n){var i=r.Event("tooltip"+e);return i.originalEvent=(n?r.extend({},n):o)||q.event||o,B.trigger(i,[l].concat(t||[])),!i.isDefaultPrevented()},render:function(e){if(l.rendered)return l;var t=u.content.text,o=u.content.title,a=u.position;return r.attr(n[0],"aria-describedby",g),B=I.tooltip=r("<div/>",{id:g,"class":[x,L,u.style.classes,x+"-pos-"+u.position.my.abbrev()].join(" "),width:u.style.width||"",height:u.style.height||"",tracking:a.target==="mouse"&&a.adjust.mouse,role:"alert","aria-live":"polite","aria-atomic":s,"aria-describedby":g+"-content","aria-hidden":i}).toggleClass(F,q.disabled).data("qtip",l).appendTo(u.position.container).append(I.content=r("<div />",{"class":x+"-content",id:g+"-content","aria-atomic":i})),l.rendered=-1,y=1,o.text?(V(),r.isFunction(o.text)||K(o.text,s)):o.button&&X(),(!r.isFunction(t)||t.then)&&G(t,s),l.rendered=i,z(),r.each(u.events,function(e,t){r.isFunction(t)&&B.bind(e==="toggle"?"tooltipshow tooltiphide":"tooltip"+e,t)}),r.each(E,function(){this.initialize==="render"&&this(l)}),Y(),B.queue("fx",function(t){l._triggerEvent("render"),y=0,(u.show.ready||e)&&l.toggle(i,q.event,s),t()}),l},get:function(e){var t,n;switch(e.toLowerCase()){case"dimensions":t={height:B.outerHeight(s),width:B.outerWidth(s)};break;case"offset":t=E.offset(B,u.position.container);break;default:n=R(e.toLowerCase()),t=n[0][n[1]],t=t.precedance?t.string():t}return t},set:function(e,t){function p(e,t){var n,r,i;for(n in c)for(r in c[n])if(i=(new RegExp(r,"i")).exec(e))t.push(i),c[n][r].apply(l,t)}var n=/^position\.(my|at|adjust|target|container)|style|content|show\.ready/i,a=/^content\.(title|attr)|style/i,f=s,c=l.checks,h;return"string"==typeof e?(h=e,e={},e[h]=t):e=r.extend(i,{},e),r.each(e,function(t,i){var s=R(t.toLowerCase()),o;o=s[0][s[1]],s[0][s[1]]="object"==typeof i&&i.nodeType?r(i):i,e[t]=[s[0],s[1],i,o],f=n.test(t)||f}),H(u),y=1,r.each(e,p),y=0,l.rendered&&B[0].offsetWidth>0&&f&&l.reposition(u.position.target==="mouse"?o:q.event),l},toggle:function(e,n){function w(){e?(E.ie&&B[0].style.removeAttribute("filter"),B.css("overflow",""),"string"==typeof f.autofocus&&r(f.autofocus,B).focus(),f.target.trigger("qtip-"+a+"-inactive")):B.css({display:"",visibility:"",opacity:"",left:"",top:""}),l._triggerEvent(e?"visible":"hidden")}if(n){if(/over|enter/.test(n.type)&&/out|leave/.test(q.event.type)&&u.show.target.add(n.target).length===u.show.target.length&&B.has(n.relatedTarget).length)return l;q.event=r.extend({},n)}if(!l.rendered)return e?l.render(1):l;var o=e?"show":"hide",f=u[o],c=u[e?"hide":"show"],h=u.position,p=u.content,d=B.css("width"),v=B[0].offsetWidth>0,m=e||f.target.length===1,g=!n||f.target.length<2||q.target[0]===n.target,y,b;return(typeof e).search("boolean|number")&&(e=!v),!B.is(":animated")&&v===e&&g?l:!l._triggerEvent(o,[90])&&!l.destroyed?l:(r.attr(B[0],"aria-hidden",!e),e?(q.origin=r.extend({},S),l.focus(n),r.isFunction(p.text)&&G(p.text,s),r.isFunction(p.title.text)&&K(p.title.text,s),!D&&h.target==="mouse"&&h.adjust.mouse&&(r(t).bind("mousemove.qtip",P),D=i),d||B.css("width",B.outerWidth()),l.reposition(n,arguments[2]),d||B.css("width",""),!f.solo||(typeof f.solo=="string"?r(f.solo):r(k,f.solo)).not(B).not(f.target).qtip("hide",r.Event("tooltipsolo"))):(clearTimeout(l.timers.show),delete q.origin,D&&!r(k+'[tracking="true"]:visible',f.solo).not(B).length&&(r(t).unbind("mousemove.qtip"),D=s),l.blur(n)),f.effect===s||m===s?(B[o](),w.call(B)):r.isFunction(f.effect)?(B.stop(1,1),f.effect.call(B,l),B.queue("fx",function(e){w(),e()})):B.fadeTo(90,e?1:0,w),e&&f.target.trigger("qtip-"+a+"-inactive"),l)},show:function(e){return l.toggle(i,e)},hide:function(e){return l.toggle(s,e)},focus:function(e){if(!l.rendered)return l;var t=r(k),n=parseInt(B[0].style.zIndex,10),i=w.zindex+t.length,s=r.extend({},e),o;return B.hasClass(A)||l._triggerEvent("focus",[i],s)&&(n!==i&&(t.each(function(){this.style.zIndex>n&&(this.style.zIndex=this.style.zIndex-1)}),t.filter("."+A).qtip("blur",s)),B.addClass(A)[0].style.zIndex=i),l},blur:function(e){return B.removeClass(A),l._triggerEvent("blur",[B.css("zIndex")],e),l},reposition:function(n,i){if(!l.rendered||y)return l;y=1;var o=u.position.target,a=u.position,f=a.my,m=a.at,g=a.adjust,b=g.method.split(" "),w=B.outerWidth(s),x=B.outerHeight(s),T=0,N=0,C=B.css("position"),k=a.viewport,L={left:0,top:0},A=a.container,O=B[0].offsetWidth>0,M=n&&n.type==="scroll",_=r(e),D,P;if(r.isArray(o)&&o.length===2)m={x:h,y:c},L={left:o[0],top:o[1]};else if(o==="mouse"&&(n&&n.pageX||q.event.pageX))m={x:h,y:c},n=S&&S.pageX&&(g.mouse||!n||!n.pageX)?{pageX:S.pageX,pageY:S.pageY}:(!n||n.type!=="resize"&&n.type!=="scroll"?n&&n.pageX&&n.type==="mousemove"?n:(!g.mouse||u.show.distance)&&q.origin&&q.origin.pageX?q.origin:n:q.event)||n||q.event||S||{},C!=="static"&&(L=A.offset()),L={left:n.pageX-L.left,top:n.pageY-L.top},g.mouse&&M&&(L.left-=S.scrollX-_.scrollLeft(),L.top-=S.scrollY-_.scrollTop());else{o==="event"&&n&&n.target&&n.type!=="scroll"&&n.type!=="resize"?q.target=r(n.target):o!=="event"&&(q.target=r(o.jquery?o:I.target)),o=q.target,o=r(o).eq(0);if(o.length===0)return l;o[0]===t||o[0]===e?(T=E.iOS?e.innerWidth:o.width(),N=E.iOS?e.innerHeight:o.height(),o[0]===e&&(L={top:(k||o).scrollTop(),left:(k||o).scrollLeft()})):E.imagemap&&o.is("area")?D=E.imagemap(l,o,m,E.viewport?b:s):E.svg&&o[0].ownerSVGElement?D=E.svg(l,o,m,E.viewport?b:s):(T=o.outerWidth(s),N=o.outerHeight(s),L=o.offset()),D&&(T=D.width,N=D.height,P=D.offset,L=D.position),L=E.offset(o,L,A);if(E.iOS>3.1&&E.iOS<4.1||E.iOS>=4.3&&E.iOS<4.33||!E.iOS&&C==="fixed")L.left-=_.scrollLeft(),L.top-=_.scrollTop();L.left+=m.x===d?T:m.x===v?T/2:0,L.top+=m.y===p?N:m.y===v?N/2:0}return L.left+=g.x+(f.x===d?-w:f.x===v?-w/2:0),L.top+=g.y+(f.y===p?-x:f.y===v?-x/2:0),E.viewport?(L.adjusted=E.viewport(l,L,a,T,N,w,x),P&&L.adjusted.left&&(L.left+=P.left),P&&L.adjusted.top&&(L.top+=P.top)):L.adjusted={left:0,top:0},l._triggerEvent("move",[L,k.elem||k],n)?(delete L.adjusted,i===s||!O||isNaN(L.left)||isNaN(L.top)||o==="mouse"||!r.isFunction(a.effect)?B.css(L):r.isFunction(a.effect)&&(a.effect.call(B,l,r.extend({},L)),B.queue(function(e){r(this).css({opacity:"",height:""}),E.ie&&this.style.removeAttribute("filter"),e()})),y=0,l):l},disable:function(e){return"boolean"!=typeof e&&(e=!B.hasClass(F)&&!q.disabled),l.rendered?(B.toggleClass(F,e),r.attr(B[0],"aria-disabled",e)):q.disabled=!!e,l},enable:function(){return l.disable(s)},destroy:function(e){function t(){var e=n[0],t=r.attr(e,_),i=n.data("qtip");l.rendered&&(r.each(l.plugins,function(e){this.destroy&&this.destroy(),delete l.plugins[e]}),B.stop(1,0).find("*").remove().end().remove(),l.rendered=s),clearTimeout(l.timers.show),clearTimeout(l.timers.hide),Z();if(!i||l===i)n.removeData("qtip").removeAttr(T),u.suppress&&t&&(n.attr("title",t),n.removeAttr(_)),n.removeAttr("aria-describedby");n.unbind(".qtip-"+a),delete N[l.id],delete l.options,delete l.elements,delete l.cache,delete l.timers,delete l.checks}if(l.destroyed)return;l.destroyed=i;var o=s;return e!==i&&(B.bind("tooltiphide",function(){o=i,B.bind("tooltiphidden",t)}),l.hide()),o||t(),n}})}function j(e,n,u){var a,f,l,c,h,p=r(t.body),d=e[0]===t?p:e,v=e.metadata?e.metadata(u.metadata):o,m=u.metadata.type==="html5"&&v?v[u.metadata.name]:o,g=e.data(u.metadata.name||"qtipopts");try{g=typeof g=="string"?r.parseJSON(g):g}catch(y){}c=r.extend(i,{},w.defaults,u,typeof g=="object"?H(g):o,H(m||v)),f=c.position,c.id=n;if("boolean"==typeof c.content.text){l=e.attr(c.content.attr);if(c.content.attr===s||!l)return s;c.content.text=l}f.container.length||(f.container=p),f.target===s&&(f.target=d),c.show.target===s&&(c.show.target=d),c.show.solo===i&&(c.show.solo=f.container.closest("body")),c.hide.target===s&&(c.hide.target=d),c.position.viewport===i&&(c.position.viewport=f.container),f.container=f.container.eq(0),f.at=new E.Corner(f.at),f.my=new E.Corner(f.my);if(e.data("qtip"))if(c.overwrite)e.qtip("destroy");else if(c.overwrite===s)return s;return e.attr(T,!0),c.suppress&&(h=e.attr("title"))&&e.removeAttr("title").attr(_,h).attr("title",""),a=new B(e,c,n,!!l),e.data("qtip",a),e.one("remove.qtip-"+n+" removeqtip.qtip-"+n,function(){var e;(e=r(this).data("qtip"))&&e.destroy()}),a}function R(e,t,n){var r=Math.ceil(t/2),i=Math.ceil(n/2),s={bottomright:[[0,0],[t,n],[t,0]],bottomleft:[[0,0],[t,0],[0,n]],topright:[[0,n],[t,0],[t,n]],topleft:[[0,0],[0,n],[t,n]],topcenter:[[0,n],[r,0],[t,n]],bottomcenter:[[0,0],[t,0],[r,n]],rightcenter:[[0,0],[t,i],[0,n]],leftcenter:[[t,0],[t,n],[0,i]]};return s.lefttop=s.bottomright,s.righttop=s.bottomleft,s.leftbottom=s.topright,s.rightbottom=s.topleft,s[e.string()]}function U(e,t){function k(e){var t=w.is(":visible");w.show(),e(),w.toggle(t)}function L(){x.width=g.height,x.height=g.width}function A(){x.width=g.width,x.height=g.height}function O(t,r,o,f){if(!b.tip)return;var l=m.corner.clone(),w=o.adjusted,E=e.options.position.adjust.method.split(" "),x=E[0],T=E[1]||E[0],N={left:s,top:s,x:0,y:0},C,k={},L;m.corner.fixed!==i&&(x===y&&l.precedance===u&&w.left&&l.y!==v?l.precedance=l.precedance===u?a:u:x!==y&&w.left&&(l.x=l.x===v?w.left>0?h:d:l.x===h?d:h),T===y&&l.precedance===a&&w.top&&l.x!==v?l.precedance=l.precedance===a?u:a:T!==y&&w.top&&(l.y=l.y===v?w.top>0?c:p:l.y===c?p:c),l.string()!==S.corner.string()&&(S.top!==w.top||S.left!==w.left)&&m.update(l,s)),C=m.position(l,w),C[l.x]+=_(l,l.x),C[l.y]+=_(l,l.y),C.right!==n&&(C.left=-C.right),C.bottom!==n&&(C.top=-C.bottom),C.user=Math.max(0,g.offset);if(N.left=x===y&&!!w.left)l.x===v?k["margin-left"]=N.x=C["margin-left"]-w.left:(L=C.right!==n?[w.left,-C.left]:[-w.left,C.left],(N.x=Math.max(L[0],L[1]))>L[0]&&(o.left-=w.left,N.left=s),k[C.right!==n?d:h]=N.x);if(N.top=T===y&&!!w.top)l.y===v?k["margin-top"]=N.y=C["margin-top"]-w.top:(L=C.bottom!==n?[w.top,-C.top]:[-w.top,C.top],(N.y=Math.max(L[0],L[1]))>L[0]&&(o.top-=w.top,N.top=s),k[C.bottom!==n?p:c]=N.y);b.tip.css(k).toggle(!(N.x&&N.y||l.x===v&&N.y||l.y===v&&N.x)),o.left-=C.left.charAt?C.user:x!==y||N.top||!N.left&&!N.top?C.left:0,o.top-=C.top.charAt?C.user:T!==y||N.left||!N.left&&!N.top?C.top:0,S.left=w.left,S.top=w.top,S.corner=l.clone()}function M(){var t=g.corner,n=e.options.position,r=n.at,o=n.my.string?n.my.string():n.my;return t===s||o===s&&r===s?s:(t===i?m.corner=new E.Corner(o):t.string||(m.corner=new E.Corner(t),m.corner.fixed=i),S.corner=new E.Corner(m.corner.string()),m.corner.string()!=="centercenter")}function _(e,t,n){t=t?t:e[e.precedance];var r=b.titlebar&&e.y===c,i=r?b.titlebar:w,s="border-"+t+"-width",o=function(e){return parseInt(e.css(s),10)},u;return k(function(){u=(n?o(n):o(b.content)||o(i)||o(w))||0}),u}function D(e){var t=b.titlebar&&e.y===c,n=t?b.titlebar:b.content,r="-moz-",i="-webkit-",s="border-radius-"+e.y+e.x,o="border-"+e.y+"-"+e.x+"-radius",u=function(e){return parseInt(n.css(e),10)||parseInt(w.css(e),10)},a;return k(function(){a=u(o)||u(s)||u(r+o)||u(r+s)||u(i+o)||u(i+s)||0}),a}function P(e){function N(e,t,n){var r=e.css(t)||p;return n&&r===e.css(n)?s:f.test(r)?s:r}var t,n,o,u=b.tip.css("cssText",""),a=e||m.corner,f=/rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i,l="border-"+a[a.precedance]+"-color",h="background-color",p="transparent",d=" !important",y=b.titlebar,E=y&&(a.y===c||a.y===v&&u.position().top+x.height/2+g.offset<y.outerHeight(i)),S=E?y:b.content;k(function(){T.fill=N(u,h)||N(S,h)||N(b.content,h)||N(w,h)||u.css(h),T.border=N(u,l,"color")||N(S,l,"color")||N(b.content,l,"color")||N(w,l,"color")||w.css(l),r("*",u).add(u).css("cssText",h+":"+p+d+";border:0"+d+";")})}function H(e){var t=e.precedance===a,n=x[t?f:l],r=x[t?l:f],i=e.string().indexOf(v)>-1,s=n*(i?.5:1),o=Math.pow,u=Math.round,c,h,p,d=Math.sqrt(o(s,2)+o(r,2)),m=[N/s*d,N/r*d];return m[2]=Math.sqrt(o(m[0],2)-o(N,2)),m[3]=Math.sqrt(o(m[1],2)-o(N,2)),c=d+m[2]+m[3]+(i?0:m[0]),h=c/d,p=[u(h*r),u(h*n)],{height:p[t?0:1],width:p[t?1:0]}}function B(e,t,n){return"<qvml:"+e+' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" '+(t||"")+' style="behavior: url(#default#VML); '+(n||"")+'" />'}var m=this,g=e.options.style.tip,b=e.elements,w=b.tooltip,S={top:0,left:0},x={width:g.width,height:g.height},T={},N=g.border||0,C;m.corner=o,m.mimic=o,m.border=N,m.offset=g.offset,m.size=x,e.checks.tip={"^position.my|style.tip.(corner|mimic|border)$":function(){m.init()||m.destroy(),e.reposition()},"^style.tip.(height|width)$":function(){x={width:g.width,height:g.height},m.create(),m.update(),e.reposition()},"^content.title.text|style.(classes|widget)$":function(){b.tip&&b.tip.length&&m.update()}},r.extend(m,{init:function(){var e=M()&&(q||E.ie);return e&&(m.create(),m.update(),w.unbind(I).bind("tooltipmove"+I,O)),e},create:function(){var e=x.width,t=x.height,n;b.tip&&b.tip.remove(),b.tip=r("<div />",{"class":"qtip-tip"}).css({width:e,height:t}).prependTo(w),q?r("<canvas />").appendTo(b.tip)[0].getContext("2d").save():(n=B("shape",'coordorigin="0,0"',"position:absolute;"),b.tip.html(n+n),r("*",b.tip).bind("click"+I+" mousedown"+I,function(e){e.stopPropagation()}))},update:function(e,t){var n=b.tip,f=n.children(),l=x.width,y=x.height,C=g.mimic,k=Math.round,O,M,D,j,F;e||(e=S.corner||m.corner),C===s?C=e:(C=new E.Corner(C),C.precedance=e.precedance,C.x==="inherit"?C.x=e.x:C.y==="inherit"?C.y=e.y:C.x===C.y&&(C[e.precedance]=e[e.precedance])),O=C.precedance,e.precedance===u?L():A(),b.tip.css({width:l=x.width,height:y=x.height}),P(e),T.border!=="transparent"?(N=_(e,o),g.border===0&&N>0&&(T.fill=T.border),m.border=N=g.border!==i?g.border:N):m.border=N=0,D=R(C,l,y),m.size=F=H(e),n.css(F).css("line-height",F.height+"px"),e.precedance===a?j=[k(C.x===h?N:C.x===d?F.width-l-N:(F.width-l)/2),k(C.y===c?F.height-y:0)]:j=[k(C.x===h?F.width-l:0),k(C.y===c?N:C.y===p?F.height-y-N:(F.height-y)/2)],q?(f.attr(F),M=f[0].getContext("2d"),M.restore(),M.save(),M.clearRect(0,0,3e3,3e3),M.fillStyle=T.fill,M.strokeStyle=T.border,M.lineWidth=N*2,M.lineJoin="miter",M.miterLimit=100,M.translate(j[0],j[1]),M.beginPath(),M.moveTo(D[0][0],D[0][1]),M.lineTo(D[1][0],D[1][1]),M.lineTo(D[2][0],D[2][1]),M.closePath(),N&&(w.css("background-clip")==="border-box"&&(M.strokeStyle=T.fill,M.stroke()),M.strokeStyle=T.border,M.stroke()),M.fill()):(D="m"+D[0][0]+","+D[0][1]+" l"+D[1][0]+","+D[1][1]+" "+D[2][0]+","+D[2][1]+" xe",j[2]=N&&/^(r|b)/i.test(e.string())?E.ie===8?2:1:0,f.css({coordsize:l+N+" "+(y+N),antialias:""+(C.string().indexOf(v)>-1),left:j[0],top:j[1],width:l+N,height:y+N}).each(function(e){var t=r(this);t[t.prop?"prop":"attr"]({coordsize:l+N+" "+(y+N),path:D,fillcolor:T.fill,filled:!!e,stroked:!e}).toggle(!!N||!!e),!e&&t.html()===""&&t.html(B("stroke",'weight="'+N*2+'px" color="'+T.border+'" miterlimit="1000" joinstyle="miter"'))})),setTimeout(function(){b.tip.css({display:"inline-block",visibility:"visible"})},1),t!==s&&m.position(e)},position:function(e){var t=b.tip,n={},i=Math.max(0,g.offset),o,p,d;return g.corner===s||!t?s:(e=e||m.corner,o=e.precedance,p=H(e),d=[e.x,e.y],o===u&&d.reverse(),r.each(d,function(t,r){var s,u,d;r===v?(s=o===a?h:c,n[s]="50%",n["margin-"+s]=-Math.round(p[o===a?f:l]/2)+i):(s=_(e,r),u=_(e,r,b.content),d=D(e),n[r]=t?u:i+(d>s?d:-s))}),n[e[o]]-=p[o===u?f:l],t.css({top:"",bottom:"",left:"",right:"",margin:""}).css(n),n)},destroy:function(){w.unbind(I),b.tip&&b.tip.find("*").remove().end().remove(),delete m.corner,delete m.mimic,delete m.size}}),m.init()}var i=!0,s=!1,o=null,u="x",a="y",f="width",l="height",c="top",h="left",p="bottom",d="right",v="center",m="flip",g="flipinvert",y="shift",b="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",w,E,S,x="qtip",T="data-hasqtip",N={},C=["ui-widget","ui-tooltip"],k="div.qtip."+x,L=x+"-default",A=x+"-focus",O=x+"-hover",M="_replacedByqTip",_="oldtitle",D;w=r.fn.qtip=function(e,t,u){var a=(""+e).toLowerCase(),f=o,l=r.makeArray(arguments).slice(1),c=l[l.length-1],h=this[0]?r.data(this[0],"qtip"):o;if(!arguments.length&&h||a==="api")return h;if("string"==typeof e)return this.each(function(){var e=r.data(this,"qtip");if(!e)return i;c&&c.timeStamp&&(e.cache.event=c);if(a!=="option"&&a!=="options"||!t)e[a]&&e[a].apply(e[a],l);else{if(!r.isPlainObject(t)&&u===n)return f=e.get(t),s;e.set(t,u)}}),f!==o?f:this;if("object"==typeof e||!arguments.length)return h=H(r.extend(i,{},e)),w.bind.call(this,h,c)},w.bind=function(e,t){return this.each(function(o){function p(e){function t(){c.render(typeof e=="object"||u.show.ready),a.show.add(a.hide).unbind(l)}if(c.cache.disabled)return s;c.cache.event=r.extend({},e),c.cache.target=e?r(e.target):[n],u.show.delay>0?(clearTimeout(c.timers.show),c.timers.show=setTimeout(t,u.show.delay),f.show!==f.hide&&a.hide.bind(f.hide,function(){clearTimeout(c.timers.show)})):t()}var u,a,f,l,c,h;h=r.isArray(e.id)?e.id[o]:e.id,h=!h||h===s||h.length<1||N[h]?w.nextid++:N[h]=h,l=".qtip-"+h+"-create",c=j(r(this),h,e);if(c===s)return i;u=c.options,r.each(E,function(){this.initialize==="initialize"&&this(c)}),a={show:u.show.target,hide:u.hide.target},f={show:r.trim(""+u.show.event).replace(/ /g,l+" ")+l,hide:r.trim(""+u.hide.event).replace(/ /g,l+" ")+l},/mouse(over|enter)/i.test(f.show)&&!/mouse(out|leave)/i.test(f.hide)&&(f.hide+=" mouseleave"+l),a.show.bind("mousemove"+l,function(e){P(e),c.cache.onTarget=i}),a.show.bind(f.show,p),(u.show.ready||u.prerender)&&p(t)})},E=w.plugins={Corner:function(e){e=(""+e).replace(/([A-Z])/," $1").replace(/middle/gi,v).toLowerCase(),this.x=(e.match(/left|right/i)||e.match(/center/)||["inherit"])[0].toLowerCase(),this.y=(e.match(/top|bottom|center/i)||["inherit"])[0].toLowerCase();var t=e.charAt(0);this.precedance=t==="t"||t==="b"?a:u,this.string=function(){return this.precedance===a?this.y+this.x:this.x+this.y},this.abbrev=function(){var e=this.x.substr(0,1),t=this.y.substr(0,1);return e===t?e:this.precedance===a?t+e:e+t},this.invertx=function(e){this.x=this.x===h?d:this.x===d?h:e||this.x},this.inverty=function(e){this.y=this.y===c?p:this.y===p?c:e||this.y},this.clone=function(){return{x:this.x,y:this.y,precedance:this.precedance,string:this.string,abbrev:this.abbrev,clone:this.clone,invertx:this.invertx,inverty:this.inverty}}},offset:function(e,n,i){function c(e,t){n.left+=t*e.scrollLeft(),n.top+=t*e.scrollTop()}var s=e.closest("body"),o=E.ie&&t.compatMode!=="CSS1Compat",u=i,a,f,l;if(u){do u.css("position")!=="static"&&(f=u.position(),n.left-=f.left+(parseInt(u.css("borderLeftWidth"),10)||0)+(parseInt(u.css("marginLeft"),10)||0),n.top-=f.top+(parseInt(u.css("borderTopWidth"),10)||0)+(parseInt(u.css("marginTop"),10)||0),!a&&(l=u.css("overflow"))!=="hidden"&&l!=="visible"&&(a=u));while((u=r(u[0].offsetParent)).length);(a&&a[0]!==s[0]||o)&&c(a||s,1)}return n},ie:function(){var e=3,n=t.createElement("div");while(n.innerHTML="<!--[if gt IE "+ ++e+"]><i></i><![endif]-->")if(!n.getElementsByTagName("i")[0])break;return e>4?e:s}(),iOS:parseFloat((""+(/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent)||[0,""])[1]).replace("undefined","3_2").replace("_",".").replace("_",""))||s,fn:{attr:function(e,t){if(this.length){var n=this[0],i="title",s=r.data(n,"qtip");if(e===i&&s&&"object"==typeof s&&s.options.suppress)return arguments.length<2?r.attr(n,_):(s&&s.options.content.attr===i&&s.cache.attr&&s.set("content.text",t),this.attr(_,t))}return r.fn["attr"+M].apply(this,arguments)},clone:function(e){var t=r([]),n="title",i=r.fn["clone"+M].apply(this,arguments);return e||i.filter("["+_+"]").attr("title",function(){return r.attr(this,_)}).removeAttr(_),i}}},r.each(E.fn,function(e,t){if(!t||r.fn[e+M])return i;var n=r.fn[e+M]=r.fn[e];r.fn[e]=function(){return t.apply(this,arguments)||n.apply(this,arguments)}}),r.ui||(r["cleanData"+M]=r.cleanData,r.cleanData=function(e){for(var t=0,n;(n=r(e[t])).length&&n.attr(T);t++)try{n.triggerHandler("removeqtip")}catch(i){}r["cleanData"+M](e)}),w.version="2.0.1-36-",w.nextid=0,w.inactiveEvents="click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "),w.zindex=15e3,w.defaults={prerender:s,id:s,overwrite:i,suppress:i,content:{text:i,attr:"title",deferred:s,title:{text:s,button:s}},position:{my:"top left",at:"bottom right",target:s,container:s,viewport:s,adjust:{x:0,y:0,mouse:i,scroll:i,resize:i,method:"flipinvert flipinvert"},effect:function(e,t,n){r(this).animate(t,{duration:200,queue:s})}},show:{target:s,event:"mouseenter",effect:i,delay:90,solo:s,ready:s,autofocus:s},hide:{target:s,event:"mouseleave",effect:i,delay:0,fixed:s,inactive:s,leave:"window",distance:s},style:{classes:"",widget:s,width:s,height:s,def:i},events:{render:o,move:o,show:o,hide:o,toggle:o,visible:o,hidden:o,focus:o,blur:o}};var F,I=".qtip-tip",q=!!t.createElement("canvas").getContext;F=E.tip=function(e){var t=e.plugins.tip;return"object"==typeof t?t:e.plugins.tip=new U(e)},F.initialize="render",F.sanitize=function(e){var t=e.style,n;t&&"tip"in t&&(n=e.style.tip,typeof n!="object"&&(e.style.tip={corner:n}),/string|boolean/i.test(typeof n.corner)||(n.corner=i),typeof n.width!="number"&&delete n.width,typeof n.height!="number"&&delete n.height,typeof n.border!="number"&&n.border!==i&&delete n.border,typeof n.offset!="number"&&delete n.offset)},r.extend(i,w.defaults,{style:{tip:{corner:i,mimic:s,width:6,height:6,border:i,offset:0}}})})})(window,document);

;
/* jquery.uniform.min.js */

/* 1 */ /* Uniform v2.1.2 Copyright © 2009 Josh Pyles / Pixelmatrix Design LLC http://pixelmatrixdesign.com https://github.com/ThemeCatcher/uniform */
/* 2 */ !function(a,b,c){"use strict";function d(a){var b=Array.prototype.slice.call(arguments,1);return a.prop?a.prop.apply(a,b):a.attr.apply(a,b)}function e(a,b,c){var d,e;for(d in c)c.hasOwnProperty(d)&&(e=d.replace(/ |$/g,b.eventNamespace),a.bind(e,c[d]))}function f(a,b,c){e(a,c,{focus:function(){b.addClass(c.focusClass)},blur:function(){b.removeClass(c.focusClass),b.removeClass(c.activeClass)},mouseenter:function(){b.addClass(c.hoverClass)},mouseleave:function(){b.removeClass(c.hoverClass),b.removeClass(c.activeClass)},"mousedown touchbegin":function(){a.is(":disabled")||b.addClass(c.activeClass)},"mouseup touchend":function(){b.removeClass(c.activeClass)}})}function g(a,b){a.removeClass(b.hoverClass+" "+b.focusClass+" "+b.activeClass)}function h(a,b,c){c?a.addClass(b):a.removeClass(b)}function i(a,b,c){var d="checked",e=b.is(":"+d);b.prop?b.prop(d,e):e?b.attr(d,d):b.removeAttr(d),h(a,c.checkedClass,e)}function j(a,b,c){h(a,c.disabledClass,b.is(":disabled"))}function k(a,b,c){switch(c){case"after":return a.after(b),a.next();case"before":return a.before(b),a.prev();case"wrap":return a.wrap(b),a.parent()}return null}function l(a,c,e){var f,g,h;return e||(e={}),e=b.extend({bind:{},divClass:null,divWrap:"wrap",spanClass:null,spanHtml:null,spanWrap:"wrap"},e),f=b("<div />"),g=b("<span />"),c.autoHide&&a.is(":hidden")&&"none"===a.css("display")&&f.hide(),e.divClass&&f.addClass(e.divClass),c.wrapperClass&&f.addClass(c.wrapperClass),e.spanClass&&g.addClass(e.spanClass),h=d(a,"id"),c.useID&&h&&d(f,"id",c.idPrefix+"-"+h),e.spanHtml&&g.html(e.spanHtml),f=k(a,f,e.divWrap),g=k(a,g,e.spanWrap),j(f,a,c),{div:f,span:g}}function m(a,c){var d;return c.wrapperClass?(d=b("<span />").addClass(c.wrapperClass),d=k(a,d,"wrap")):null}function n(){var c,d,e,f;return f="rgb(120,2,153)",d=b('<div style="width:0;height:0;color:'+f+'">'),b("body").append(d),e=d.get(0),c=a.getComputedStyle?a.getComputedStyle(e,"").color:(e.currentStyle||e.style||{}).color,d.remove(),c.replace(/ /g,"")!==f}function o(a){return a?b("<span />").text(a).html():""}function p(){return navigator.cpuClass&&!navigator.product}function q(){return void 0!==a.XMLHttpRequest?!0:!1}function r(a){var b;return a[0].multiple?!0:(b=d(a,"size"),!b||1>=b?!1:!0)}function s(){return!1}function t(a,b){var c="none";e(a,b,{"selectstart dragstart mousedown":s}),a.css({MozUserSelect:c,msUserSelect:c,webkitUserSelect:c,userSelect:c})}function u(a,b,c){var d=a.val();""===d?d=c.fileDefaultHtml:(d=d.split(/[\/\\]+/),d=d[d.length-1]),b.text(d)}function v(a,b,c){var d,e;for(d=[],a.each(function(){var a;for(a in b)Object.prototype.hasOwnProperty.call(b,a)&&(d.push({el:this,name:a,old:this.style[a]}),this.style[a]=b[a])}),c();d.length;)e=d.pop(),e.el.style[e.name]=e.old}function w(a,b){var c;c=a.parents(),c.push(a[0]),c=c.not(":visible"),v(c,{visibility:"hidden",display:"block",position:"absolute"},b)}function x(a,b){return function(){a.unwrap().unwrap().unbind(b.eventNamespace)}}var y=!0,z=!1,A=[{match:function(a){return a.is("a, button, :submit, :reset, input[type='button']")},apply:function(b,c){var h,i,k,m,n;return i=c.submitDefaultHtml,b.is(":reset")&&(i=c.resetDefaultHtml),m=b.is("a, button")?function(){return b.html()||i}:function(){return o(d(b,"value"))||i},k=l(b,c,{divClass:c.buttonClass,spanHtml:m()}),h=k.div,f(b,h,c),n=!1,e(h,c,{"click touchend":function(){var c,e,f,g;n||b.is(":disabled")||(n=!0,b[0].dispatchEvent?(c=document.createEvent("MouseEvents"),c.initEvent("click",!0,!0),e=b[0].dispatchEvent(c),b.is("a")&&e&&(f=d(b,"target"),g=d(b,"href"),f&&"_self"!==f?a.open(g,f):document.location.href=g)):b.click(),n=!1)}}),t(h,c),{remove:function(){return h.after(b),h.remove(),b.unbind(c.eventNamespace),b},update:function(){g(h,c),j(h,b,c),b.detach(),k.span.html(m()).append(b)}}}},{match:function(a){return a.is(":checkbox")},apply:function(a,b){var c,d,h;return c=l(a,b,{divClass:b.checkboxClass}),d=c.div,h=c.span,f(a,d,b),e(a,b,{"click touchend":function(){i(h,a,b)}}),i(h,a,b),{remove:x(a,b),update:function(){g(d,b),h.removeClass(b.checkedClass),i(h,a,b),j(d,a,b)}}}},{match:function(a){return a.is(":file")},apply:function(a,c){function o(){u(a,m,c)}var h,i,m,n;return h=l(a,c,{divClass:c.fileClass,spanClass:c.fileButtonClass,spanHtml:c.fileButtonHtml,spanWrap:"after"}),i=h.div,n=h.span,m=b("<span />").html(c.fileDefaultHtml),m.addClass(c.filenameClass),m=k(a,m,"after"),d(a,"size")||d(a,"size",i.width()/10),f(a,i,c),o(),p()?e(a,c,{click:function(){a.trigger("change"),setTimeout(o,0)}}):e(a,c,{change:o}),t(m,c),t(n,c),{remove:function(){return m.remove(),n.remove(),a.unwrap().unbind(c.eventNamespace)},update:function(){g(i,c),u(a,m,c),j(i,a,c)}}}},{match:function(a){if(a.is("input")){var b=(" "+d(a,"type")+" ").toLowerCase(),c=" color date datetime datetime-local email month number password search tel text time url week ";return c.indexOf(b)>=0}return!1},apply:function(a,b){var c,e;return c=d(a,"type"),a.addClass(b.inputClass),e=m(a,b),f(a,a,b),b.inputAddTypeAsClass&&a.addClass(c),{remove:function(){a.removeClass(b.inputClass),b.inputAddTypeAsClass&&a.removeClass(c),e&&a.unwrap()},update:s}}},{match:function(a){return a.is(":radio")},apply:function(a,c){var h,k,m;return h=l(a,c,{divClass:c.radioClass}),k=h.div,m=h.span,f(a,k,c),e(a,c,{"click touchend":function(){b.uniform.update(b(':radio[name="'+d(a,"name")+'"]'))}}),i(m,a,c),{remove:x(a,c),update:function(){g(k,c),i(m,a,c),j(k,a,c)}}}},{match:function(a){return a.is("select")&&!r(a)?!0:!1},apply:function(a,c){var d,h,i,k;return c.selectAutoWidth&&w(a,function(){k=a.width()}),d=l(a,c,{divClass:c.selectClass,spanHtml:(a.find(":selected:first")||a.find("option:first")).html(),spanWrap:"before"}),h=d.div,i=d.span,c.selectAutoWidth?w(a,function(){v(b([i[0],h[0]]),{display:"block"},function(){var a;a=i.outerWidth()-i.width(),h.width(k+a),i.width(k)})}):h.addClass("fixedWidth"),f(a,h,c),e(a,c,{change:function(){i.html(a.find(":selected").html()),h.removeClass(c.activeClass)},"click touchend":function(){var b=a.find(":selected").html();i.html()!==b&&a.trigger("change")},keyup:function(){i.html(a.find(":selected").html())}}),t(i,c),{remove:function(){return i.remove(),a.unwrap().unbind(c.eventNamespace),a},update:function(){c.selectAutoWidth?(b.uniform.restore(a),a.uniform(c)):(g(h,c),a[0].selectedIndex=a[0].selectedIndex,i.html(a.find(":selected").html()),j(h,a,c))}}}},{match:function(a){return a.is("select")&&r(a)?!0:!1},apply:function(a,b){var c;return a.addClass(b.selectMultiClass),c=m(a,b),f(a,a,b),{remove:function(){a.removeClass(b.selectMultiClass),c&&a.unwrap()},update:s}}},{match:function(a){return a.is("textarea")},apply:function(a,b){var c;return a.addClass(b.textareaClass),c=m(a,b),f(a,a,b),{remove:function(){a.removeClass(b.textareaClass),c&&a.unwrap()},update:s}}}];p()&&!q()&&(y=!1),b.uniform={defaults:{activeClass:"active",autoHide:!0,buttonClass:"button",checkboxClass:"checker",checkedClass:"checked",disabledClass:"disabled",eventNamespace:".uniform",fileButtonClass:"action",fileButtonHtml:"Choose File",fileClass:"uploader",fileDefaultHtml:"No file selected",filenameClass:"filename",focusClass:"focus",hoverClass:"hover",idPrefix:"uniform",inputAddTypeAsClass:!0,inputClass:"uniform-input",radioClass:"radio",resetDefaultHtml:"Reset",resetSelector:!1,selectAutoWidth:!0,selectClass:"selector",selectMultiClass:"uniform-multiselect",submitDefaultHtml:"Submit",textareaClass:"uniform",useID:!0,wrapperClass:null},elements:[]},b.fn.uniform=function(c){var d=this;return c=b.extend({},b.uniform.defaults,c),z||(z=!0,n()&&(y=!1)),y?(c.resetSelector&&b(c.resetSelector).mouseup(function(){a.setTimeout(function(){b.uniform.update(d)},10)}),this.each(function(){var d,e,f,a=b(this);if(a.data("uniformed"))return b.uniform.update(a),void 0;for(d=0;d<A.length;d+=1)if(e=A[d],e.match(a,c))return f=e.apply(a,c),a.data("uniformed",f),b.uniform.elements.push(a.get(0)),void 0})):this},b.uniform.restore=b.fn.uniform.restore=function(a){a===c&&(a=b.uniform.elements),b(a).each(function(){var c,d,a=b(this);d=a.data("uniformed"),d&&(d.remove(),c=b.inArray(this,b.uniform.elements),c>=0&&b.uniform.elements.splice(c,1),a.removeData("uniformed"))})},b.uniform.update=b.fn.uniform.update=function(a){a===c&&(a=b.uniform.elements),b(a).each(function(){var c,a=b(this);c=a.data("uniformed"),c&&c.update(a,c.options)})}}(this,jQuery);

;
/* jquery.infieldlabel.min.js */

/* 1  */ /*
/* 2  *|  In-Field Label jQuery Plugin
/* 3  *|  http://fuelyourcoding.com/scripts/infield.html
/* 4  *| 
/* 5  *|  Copyright (c) 2009 Doug Neiner
/* 6  *|  Dual licensed under the MIT and GPL licenses.
/* 7  *|  Uses the same license as jQuery, see:
/* 8  *|  http://docs.jquery.com/License
/* 9  *| 
/* 10 *| */
/* 11 */ (function(d){d.InFieldLabels=function(e,b,f){var a=this;a.$label=d(e);a.label=e;a.$field=d(b);a.field=b;a.$label.data("InFieldLabels",a);a.showing=true;a.init=function(){a.options=d.extend({},d.InFieldLabels.defaultOptions,f);if(a.$field.val()!==""){a.$label.hide();a.showing=false}a.$field.focus(function(){a.fadeOnFocus()}).blur(function(){a.checkForEmpty(true)}).bind("keydown.infieldlabel",function(c){a.hideOnChange(c)}).bind("paste",function(){a.setOpacity(0)}).change(function(){a.checkForEmpty()}).bind("onPropertyChange",
/* 12 */ function(){a.checkForEmpty()})};a.fadeOnFocus=function(){a.showing&&a.setOpacity(a.options.fadeOpacity)};a.setOpacity=function(c){a.$label.stop().animate({opacity:c},a.options.fadeDuration);a.showing=c>0};a.checkForEmpty=function(c){if(a.$field.val()===""){a.prepForShow();a.setOpacity(c?1:a.options.fadeOpacity)}else a.setOpacity(0)};a.prepForShow=function(){if(!a.showing){a.$label.css({opacity:0}).show();a.$field.bind("keydown.infieldlabel",function(c){a.hideOnChange(c)})}};a.hideOnChange=function(c){if(!(c.keyCode===
/* 13 */ 16||c.keyCode===9)){if(a.showing){a.$label.hide();a.showing=false}a.$field.unbind("keydown.infieldlabel")}};a.init()};d.InFieldLabels.defaultOptions={fadeOpacity:0.5,fadeDuration:300};d.fn.inFieldLabels=function(e){return this.each(function(){var b=d(this).attr("for");if(b){b=d("input#"+b+"[type='text'],input#"+b+"[type='search'],input#"+b+"[type='tel'],input#"+b+"[type='url'],input#"+b+"[type='email'],input#"+b+"[type='password'],textarea#"+b);b.length!==0&&new d.InFieldLabels(this,b[0],e)}})}})(jQuery);
/* 14 */ 

;
/* avia.js */

/* 1    */ (function($)
/* 2    */ {	
/* 3    */     "use strict";
/* 4    */ 
/* 5    */     $(document).ready(function()
/* 6    */     {	
/* 7    */         var aviabodyclasses = AviaBrowserDetection('html');
/* 8    */ 
/* 9    */ 		$.avia_utilities = $.avia_utilities || {};
/* 10   */ 		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 'ontouchstart' in document.documentElement)
/* 11   */     	{
/* 12   */     		$.avia_utilities.isMobile =  true;
/* 13   */     	}
/* 14   */     	else
/* 15   */     	{
/* 16   */     		$.avia_utilities.isMobile =  false;
/* 17   */     	}
/* 18   */ 
/* 19   */     	
/* 20   */         //check if user uses IE7 - if yes don't execute the function or the menu will break
/* 21   */         if(aviabodyclasses.indexOf("avia-msie-7") == -1) avia_responsive_menu();
/* 22   */ 
/* 23   */         // decreases header size when user scrolls down
/* 24   */         avia_header_size();
/* 25   */         
/* 26   */         // set sidebar main menu option
/* 27   */         avia_sidebar_menu();
/* 28   */         
/* 29   */         //activates the sticky submenu
/* 30   */ 		avia_sticky_submenu();
/* 31   */ 
/* 32   */         //show scroll top button
/* 33   */         avia_scroll_top_fade();
/* 34   */         
/* 35   */         //creates search tooltip
/* 36   */         new $.AviaTooltip({"class": 'avia-search-tooltip',data: 'avia-search-tooltip', event:'click', position:'bottom', scope: "body", attach:'element'});
/* 37   */ 
/* 38   */         //creates relate posts tooltip
/* 39   */         new $.AviaTooltip({"class": 'avia-related-tooltip', data: 'avia-related-tooltip', scope: ".related_posts, .av-share-box", attach:'element', delay:0});
/* 40   */ 
/* 41   */         //creates ajax search
/* 42   */         new $.AviaAjaxSearch({scope:'#header'});
/* 43   */ 
/* 44   */ 		// actiavte portfolio sorting
/* 45   */ 		if($.fn.avia_iso_sort)
/* 46   */ 		$('.grid-sort-container').avia_iso_sort();
/* 47   */ 
/* 48   */ 		//activates the mega menu javascript
/* 49   */ 		if($.fn.aviaMegamenu)
/* 50   */ 		$(".main_menu .menu").aviaMegamenu({modify_position:true});

/* avia.js */

/* 51   */ 		
/* 52   */ 
/* 53   */ 		
/* 54   */ 		
/* 55   */ 		$.avia_utilities.avia_ajax_call();
/* 56   */ 		
/* 57   */ 		
/* 58   */     });
/* 59   */ 
/* 60   */ 	$.avia_utilities = $.avia_utilities || {};
/* 61   */ 	
/* 62   */ 	$.avia_utilities.avia_ajax_call = function(container)
/* 63   */ 	{
/* 64   */ 		if(typeof container == 'undefined'){ container = 'body';};
/* 65   */ 		
/* 66   */ 		
/* 67   */ 		$('a.avianolink').on('click', function(e){ e.preventDefault(); });
/* 68   */         $('a.aviablank').attr('target', '_blank');
/* 69   */ 
/* 70   */         //activates the prettyphoto lightbox
/* 71   */         $(container).avia_activate_lightbox();
/* 72   */         
/* 73   */         //scrollspy for main menu. must be located before smoothscrolling
/* 74   */ 		if($.fn.avia_scrollspy)
/* 75   */ 		{
/* 76   */ 			if(container == 'body')
/* 77   */ 			{
/* 78   */ 				$('body').avia_scrollspy({target:'.main_menu .menu li > a'});
/* 79   */ 			}
/* 80   */ 			else
/* 81   */ 			{
/* 82   */ 				$('body').avia_scrollspy('refresh');
/* 83   */ 			}
/* 84   */ 		}
/* 85   */ 
/* 86   */ 		//smooth scrooling
/* 87   */ 		if($.fn.avia_smoothscroll)
/* 88   */ 		$('a[href*=#]', container).avia_smoothscroll(container);
/* 89   */ 
/* 90   */ 		avia_small_fixes(container);
/* 91   */ 
/* 92   */ 		avia_hover_effect(container);
/* 93   */ 
/* 94   */ 		avia_iframe_fix(container);
/* 95   */ 
/* 96   */ 		//activate html5 video player
/* 97   */ 		if($.fn.avia_html5_activation && $.fn.mediaelementplayer)
/* 98   */ 		$(".avia_video, .avia_audio", container).avia_html5_activation({ratio:'16:9'});
/* 99   */ 
/* 100  */ 	}

/* avia.js */

/* 101  */ 	
/* 102  */ 	// -------------------------------------------------------------------------------------------
/* 103  */ 	// Error log helper
/* 104  */ 	// -------------------------------------------------------------------------------------------
/* 105  */ 	
/* 106  */ 	$.avia_utilities.log = function(text, type, extra)
/* 107  */ 	{
/* 108  */ 		if(typeof console == 'undefined'){return;} if(typeof type == 'undefined'){type = "log"} type = "AVIA-" + type.toUpperCase(); 
/* 109  */ 		console.log("["+type+"] "+text); if(typeof extra != 'undefined') console.log(extra); 
/* 110  */ 	}
/* 111  */ 
/* 112  */ 
/* 113  */ 
/* 114  */ 	// -------------------------------------------------------------------------------------------
/* 115  */ 	// modified SCROLLSPY by bootstrap
/* 116  */ 	// -------------------------------------------------------------------------------------------
/* 117  */ 
/* 118  */ 	
/* 119  */ 	  function AviaScrollSpy(element, options)
/* 120  */ 	  {
/* 121  */ 	  	var self = this;
/* 122  */ 	  
/* 123  */ 		    var process = $.proxy(self.process, self)
/* 124  */ 		      , refresh = $.proxy(self.refresh, self)
/* 125  */ 		      , $element = $(element).is('body') ? $(window) : $(element)
/* 126  */ 		      , href
/* 127  */ 		    self.$body = $('body')
/* 128  */ 		    self.$win = $(window)
/* 129  */ 		    self.options = $.extend({}, $.fn.avia_scrollspy.defaults, options)
/* 130  */ 		    self.selector = (self.options.target
/* 131  */ 		      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
/* 132  */ 		      || '')
/* 133  */ 		    
/* 134  */ 		   	self.activation_true = false;
/* 135  */ 		   	
/* 136  */ 		    if(self.$body.find(self.selector + "[href*=#]").length)
/* 137  */ 		    {
/* 138  */ 		    	self.$scrollElement = $element.on('scroll.scroll-spy.data-api', process);
/* 139  */ 		    	self.$win.on('av-height-change', refresh);
/* 140  */ 		    	self.$body.on('av_resize_finished', refresh);
/* 141  */ 		    	self.activation_true = true;
/* 142  */ 		    	self.checkFirst();
/* 143  */ 		    	
/* 144  */ 		    	setTimeout(function()
/* 145  */ 	  			{
/* 146  */ 		    		self.refresh()
/* 147  */ 		    		self.process()
/* 148  */ 		    		
/* 149  */ 		    	},100);
/* 150  */ 		    }

/* avia.js */

/* 151  */ 	    
/* 152  */ 	  }
/* 153  */ 	
/* 154  */ 	  AviaScrollSpy.prototype = {
/* 155  */ 	
/* 156  */ 	      constructor: AviaScrollSpy
/* 157  */ 		, checkFirst: function () {
/* 158  */ 		
/* 159  */ 			var current = window.location.href.split('#')[0],
/* 160  */ 				matching_link = this.$body.find(this.selector + "[href='"+current+"']").attr('href',current+'#top');
/* 161  */ 		}
/* 162  */ 	    , refresh: function () {
/* 163  */ 	    
/* 164  */ 	    if(!this.activation_true) return;
/* 165  */ 	    
/* 166  */ 	        var self = this
/* 167  */ 	          , $targets
/* 168  */ 	
/* 169  */ 	        this.offsets = $([])
/* 170  */ 	        this.targets = $([])
/* 171  */ 	
/* 172  */ 	        $targets = this.$body
/* 173  */ 	          .find(this.selector)
/* 174  */ 	          .map(function () {
/* 175  */ 	            var $el = $(this)
/* 176  */ 	              , href = $el.data('target') || $el.attr('href')
/* 177  */ 	              , hash = this.hash
/* 178  */ 	              , hash = hash.replace(/\//g, "")
/* 179  */ 	              , $href = /^#\w/.test(hash) && $(hash)
/* 180  */ 	             
/* 181  */ 	            return ( $href
/* 182  */ 	              && $href.length
/* 183  */ 	              && [[ $href.position().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]] ) || null
/* 184  */ 	          })
/* 185  */ 	          .sort(function (a, b) { return a[0] - b[0] })
/* 186  */ 	          .each(function () {
/* 187  */ 	            self.offsets.push(this[0])
/* 188  */ 	            self.targets.push(this[1])
/* 189  */ 	          })
/* 190  */ 	          
/* 191  */ 	      }
/* 192  */ 	
/* 193  */ 	    , process: function () {
/* 194  */ 	    	
/* 195  */ 	    	if(!this.offsets) return;
/* 196  */ 	    	
/* 197  */ 	        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
/* 198  */ 	          , scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
/* 199  */ 	          , maxScroll = scrollHeight - this.$scrollElement.height()
/* 200  */ 	          , offsets = this.offsets

/* avia.js */

/* 201  */ 	          , targets = this.targets
/* 202  */ 	          , activeTarget = this.activeTarget
/* 203  */ 	          , i
/* 204  */ 
/* 205  */ 	        if (scrollTop >= maxScroll) {
/* 206  */ 	          return activeTarget != (i = targets.last()[0])
/* 207  */ 	            && this.activate ( i )
/* 208  */ 	        }
/* 209  */ 	
/* 210  */ 	        for (i = offsets.length; i--;) {
/* 211  */ 	          activeTarget != targets[i]
/* 212  */ 	            && scrollTop >= offsets[i]
/* 213  */ 	            && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
/* 214  */ 	            && this.activate( targets[i] )
/* 215  */ 	        }
/* 216  */ 	      }
/* 217  */ 	
/* 218  */ 	    , activate: function (target) {
/* 219  */ 	        var active
/* 220  */ 	          , selector
/* 221  */ 	
/* 222  */ 	        this.activeTarget = target
/* 223  */ 	
/* 224  */ 	        $(this.selector)
/* 225  */ 	          .parent('.' + this.options.applyClass)
/* 226  */ 	          .removeClass(this.options.applyClass)
/* 227  */ 	
/* 228  */ 	        selector = this.selector
/* 229  */ 	          + '[data-target="' + target + '"],'
/* 230  */ 	          + this.selector + '[href="' + target + '"]'
/* 231  */ 	
/* 232  */ 	        active = $(selector)
/* 233  */ 	          .parent('li')
/* 234  */ 	          .addClass(this.options.applyClass)
/* 235  */ 	
/* 236  */ 	        if (active.parent('.sub-menu').length)  {
/* 237  */ 	          active = active.closest('li.dropdown_ul_available').addClass(this.options.applyClass)
/* 238  */ 	        }
/* 239  */ 	
/* 240  */ 	        active.trigger('activate')
/* 241  */ 	      }
/* 242  */ 	
/* 243  */ 	  }
/* 244  */ 	
/* 245  */ 	
/* 246  */ 	 /* AviaScrollSpy PLUGIN DEFINITION
/* 247  *| 	  * =========================== */
/* 248  */ 	
/* 249  */ 	  $.fn.avia_scrollspy = function (option) {
/* 250  */ 	    return this.each(function () {

/* avia.js */

/* 251  */ 	      var $this = $(this)
/* 252  */ 	        , data = $this.data('scrollspy')
/* 253  */ 	        , options = typeof option == 'object' && option
/* 254  */ 	      if (!data) $this.data('scrollspy', (data = new AviaScrollSpy(this, options)))
/* 255  */ 	      if (typeof option == 'string') data[option]()
/* 256  */ 	    })
/* 257  */ 	  }
/* 258  */ 	
/* 259  */ 	  $.fn.avia_scrollspy.Constructor = AviaScrollSpy
/* 260  */ 	
/* 261  */ 	  $.fn.avia_scrollspy.defaults = {
/* 262  */ 	    offset: (parseInt($('.html_header_sticky #main').data('scroll-offset'), 10)) + ($(".html_header_sticky #header_main_alternate").outerHeight()) + ($(".html_header_sticky #header_meta").outerHeight()) + 1 + parseInt($('html').css('margin-top'),10),
/* 263  */ 	    applyClass: 'current-menu-item'
/* 264  */ 	  }
/* 265  */ 
/* 266  */ 
/* 267  */ 
/* 268  */ 
/* 269  */ 
/* 270  */ 
/* 271  */     // -------------------------------------------------------------------------------------------
/* 272  */     // detect browser and add class to body
/* 273  */     // -------------------------------------------------------------------------------------------
/* 274  */ 
/* 275  */     function AviaBrowserDetection(outputClassElement)
/* 276  */     {
/* 277  */         if(typeof($.browser) !== 'undefined')
/* 278  */         {
/* 279  */             var bodyclass = '';
/* 280  */ 
/* 281  */             if($.browser.msie){
/* 282  */                 bodyclass += 'avia-msie';
/* 283  */             }else if($.browser.webkit){
/* 284  */                 bodyclass += 'avia-webkit';
/* 285  */             }else if($.browser.mozilla)
/* 286  */             {
/* 287  */                 bodyclass += 'avia-mozilla';
/* 288  */             }
/* 289  */ 
/* 290  */             if($.browser.version) bodyclass += ' ' + bodyclass + '-' + parseInt($.browser.version) + ' ';
/* 291  */ 
/* 292  */             if($.browser.ipad){
/* 293  */                 bodyclass += ' avia-ipad ';
/* 294  */             }else if($.browser.iphone){
/* 295  */                 bodyclass += ' avia-iphone ';
/* 296  */             }else if($.browser.android){
/* 297  */                 bodyclass += ' avia-android ';
/* 298  */             }else if($.browser.win){
/* 299  */                 bodyclass += ' avia-windows ';
/* 300  */             }else if($.browser.mac){

/* avia.js */

/* 301  */                 bodyclass += ' avia-mac ';
/* 302  */             }else if($.browser.linux){
/* 303  */                 bodyclass += ' avia-linux ';
/* 304  */             }
/* 305  */         }
/* 306  */ 
/* 307  */         if(outputClassElement) $(outputClassElement).addClass(bodyclass)
/* 308  */         
/* 309  */         return bodyclass;
/* 310  */     }
/* 311  */ 
/* 312  */ 
/* 313  */ 
/* 314  */     // -------------------------------------------------------------------------------------------
/* 315  */ 	// responsive menu function
/* 316  */ 	// -------------------------------------------------------------------------------------------
/* 317  */ 
/* 318  */     function avia_responsive_menu()
/* 319  */     {
/* 320  */     	var $html = $('html'), win = $(window), header = $('.responsive #header');
/* 321  */ 
/* 322  */     	if(!header.length) return;
/* 323  */ 
/* 324  */     	var menu 			  	= header.find('.main_menu ul:eq(0)'),
/* 325  */ 	    	first_level_items 	= menu.find('>li').length,
/* 326  */ 	    	bottom_menu 	  	= $('html').is('.html_bottom_nav_header'),
/* 327  */ 	    	container			= $('#wrap_all'),
/* 328  */     		show_menu_btn		= $('#advanced_menu_toggle'),
/* 329  */     		hide_menu_btn		= $('#advanced_menu_hide'),
/* 330  */     		mobile_advanced 	= menu.clone().attr({id:"mobile-advanced", "class":""}),
/* 331  */     		sub_hidden			= $html.is('.html_header_mobile_behavior'),
/* 332  */ 			insert_menu 		= function()
/* 333  */ 			{	
/* 334  */ 				if(first_level_items == 0) 
/* 335  */ 				{
/* 336  */ 					show_menu_btn.remove();
/* 337  */ 				}
/* 338  */ 				else
/* 339  */ 				{
/* 340  */ 					var after_menu = $('#header .logo');
/* 341  */ 					show_menu_btn.insertAfter(after_menu);
/* 342  */ 					mobile_advanced.find('.noMobile').remove();
/* 343  */ 					mobile_advanced.prependTo(container);
/* 344  */ 					hide_menu_btn.prependTo(container);
/* 345  */ 				}
/* 346  */ 			},
/* 347  */ 			set_height = function()
/* 348  */ 			{
/* 349  */ 				var height = mobile_advanced.outerHeight(true), win_h  = win.height();
/* 350  */ 				

/* avia.js */

/* 351  */ 				if(height < win_h) height = win_h;
/* 352  */ 				container.css({'height':height});
/* 353  */ 				
/* 354  */ 				mobile_advanced.css({position:'absolute', 'min-height':win_h});
/* 355  */ 			},
/* 356  */ 			hide_menu = function()
/* 357  */ 			{	
/* 358  */ 				container.removeClass('show_mobile_menu');
/* 359  */ 				setTimeout(function(){ container.css({'height':"auto", 'overflow':'hidden', 'minHeight':0}); },600);
/* 360  */ 				return false;
/* 361  */ 			},
/* 362  */ 			autohide = function()
/* 363  */ 			{
/* 364  */ 				if(container.is('.show_mobile_menu') && hide_menu_btn.css('display') == 'none'){ hide_menu(); }
/* 365  */ 			},
/* 366  */ 			show_menu = function()
/* 367  */ 			{
/* 368  */ 				if(container.is('.show_mobile_menu'))
/* 369  */ 				{
/* 370  */ 					hide_menu();
/* 371  */ 				}
/* 372  */ 				else
/* 373  */ 				{
/* 374  */ 					win.scrollTop(0);
/* 375  */ 					container.addClass('show_mobile_menu');
/* 376  */ 					set_height();
/* 377  */ 				}
/* 378  */ 				return false;
/* 379  */ 			};
/* 380  */ 		
/* 381  */ 		
/* 382  */ 		$html.on('click', '#mobile-advanced li a, #mobile-advanced .mega_menu_title', function()
/* 383  */ 		{
/* 384  */ 			var current = $(this);
/* 385  */ 			
/* 386  */ 			//if submenu items are hidden do the toggle
/* 387  */ 			if(sub_hidden)
/* 388  */ 			{
/* 389  */ 				var list_item = current.siblings('ul, .avia_mega_div');
/* 390  */ 				if(list_item.length)
/* 391  */ 				{
/* 392  */ 					if(list_item.hasClass('visible_sublist'))
/* 393  */ 					{
/* 394  */ 						list_item.removeClass('visible_sublist');
/* 395  */ 					}
/* 396  */ 					else
/* 397  */ 					{
/* 398  */ 						list_item.addClass('visible_sublist');
/* 399  */ 					}
/* 400  */ 					set_height();

/* avia.js */

/* 401  */ 					return false;
/* 402  */ 				}
/* 403  */ 			}
/* 404  */ 			
/* 405  */ 			//when clicked on anchor link remove the menu so the body can scroll to the anchor
/* 406  */ 			if(current.filter('[href*=#]').length)
/* 407  */ 			{
/* 408  */ 				container.removeClass('show_mobile_menu');
/* 409  */ 				container.css({'height':"auto"});
/* 410  */ 			}
/* 411  */ 			
/* 412  */ 		});
/* 413  */ 		
/* 414  */ 
/* 415  */ 		show_menu_btn.click(show_menu);
/* 416  */ 		hide_menu_btn.click(hide_menu);
/* 417  */ 		win.on( 'debouncedresize',  autohide );
/* 418  */ 		insert_menu();
/* 419  */     }
/* 420  */ 
/* 421  */ 
/* 422  */     // -------------------------------------------------------------------------------------------
/* 423  */ 	// html 5 videos
/* 424  */ 	// -------------------------------------------------------------------------------------------
/* 425  */     $.fn.avia_html5_activation = function(options)
/* 426  */ 	{	
/* 427  */ 		var defaults =
/* 428  */ 		{
/* 429  */ 			ratio: '16:9'
/* 430  */ 		};
/* 431  */ 
/* 432  */ 		var options  = $.extend(defaults, options),
/* 433  */ 			isMobile = $.avia_utilities.isMobile;
/* 434  */ 		
/* 435  */ 		// if(isMobile) return;
/* 436  */ 		
/* 437  */ 		this.each(function()
/* 438  */ 		{
/* 439  */ 		var fv 			= $(this),
/* 440  */ 	      	id_to_apply = '#' + fv.attr('id'),
/* 441  */ 	      	posterImg 	= fv.attr('poster');
/* 442  */ 		
/* 443  */ 
/* 444  */ 		fv.mediaelementplayer({
/* 445  */ 		    // if the <video width> is not specified, this is the default
/* 446  */ 		    defaultVideoWidth: 480,
/* 447  */ 		    // if the <video height> is not specified, this is the default
/* 448  */ 		    defaultVideoHeight: 270,
/* 449  */ 		    // if set, overrides <video width>
/* 450  */ 		    videoWidth: -1,

/* avia.js */

/* 451  */ 		    // if set, overrides <video height>
/* 452  */ 		    videoHeight: -1,
/* 453  */ 		    // width of audio player
/* 454  */ 		    audioWidth: 400,
/* 455  */ 		    // height of audio player
/* 456  */ 		    audioHeight: 30,
/* 457  */ 		    // initial volume when the player starts
/* 458  */ 		    startVolume: 0.8,
/* 459  */ 		    // useful for <audio> player loops
/* 460  */ 		    loop: false,
/* 461  */ 		    // enables Flash and Silverlight to resize to content size
/* 462  */ 		    enableAutosize: false,
/* 463  */ 		    // the order of controls you want on the control bar (and other plugins below)
/* 464  */ 		    features: ['playpause','progress','current','duration','tracks','volume'],
/* 465  */ 		    // Hide controls when playing and mouse is not over the video
/* 466  */ 		    alwaysShowControls: false,
/* 467  */ 		    // force iPad's native controls
/* 468  */ 		    iPadUseNativeControls: false,
/* 469  */ 		    // force iPhone's native controls
/* 470  */ 		    iPhoneUseNativeControls: false,
/* 471  */ 		    // force Android's native controls
/* 472  */ 		    AndroidUseNativeControls: false,
/* 473  */ 		    // forces the hour marker (##:00:00)
/* 474  */ 		    alwaysShowHours: false,
/* 475  */ 		    // show framecount in timecode (##:00:00:00)
/* 476  */ 		    showTimecodeFrameCount: false,
/* 477  */ 		    // used when showTimecodeFrameCount is set to true
/* 478  */ 		    framesPerSecond: 25,
/* 479  */ 		    // turns keyboard support on and off for this instance
/* 480  */ 		    enableKeyboard: true,
/* 481  */ 		    // when this player starts, it will pause other players
/* 482  */ 		    pauseOtherPlayers: false,
/* 483  */ 		    poster: posterImg,
/* 484  */ 		    success: function (mediaElement, domObject) { 
/* 485  */          	
/* 486  */ 				setTimeout(function()
/* 487  */ 				{
/* 488  */ 					if (mediaElement.pluginType == 'flash') 
/* 489  */ 					{	
/* 490  */ 						mediaElement.addEventListener('canplay', function() { fv.trigger('av-mediajs-loaded'); }, false);
/* 491  */ 					}
/* 492  */ 					else
/* 493  */ 					{
/* 494  */ 				        fv.trigger('av-mediajs-loaded').addClass('av-mediajs-loaded');
/* 495  */ 					}
/* 496  */ 				         
/* 497  */ 				     mediaElement.addEventListener('ended', function() {  fv.trigger('av-mediajs-ended'); }, false);  
/* 498  */ 				     
/* 499  */ 				},10);
/* 500  */ 		         

/* avia.js */

/* 501  */ 		    },
/* 502  */ 		    // fires when a problem is detected
/* 503  */ 		    error: function () { 
/* 504  */ 		
/* 505  */ 		    },
/* 506  */ 		    
/* 507  */ 		    // array of keyboard commands
/* 508  */ 		    keyActions: []
/* 509  */ 			});
/* 510  */ 				
/* 511  */ 			});
/* 512  */ 		}
/* 513  */ 
/* 514  */ 
/* 515  */ 
/* 516  */  	// -------------------------------------------------------------------------------------------
/* 517  */ 	// hover effect for images
/* 518  */ 	// -------------------------------------------------------------------------------------------
/* 519  */     function avia_hover_effect(container)
/* 520  */     {
/* 521  */     	//hover overlay for mobile device doesnt really make sense. in addition it often slows down the click event
/* 522  */     	if($.avia_utilities.isMobile) return;
/* 523  */     
/* 524  */ 		var overlay = "", cssTrans = $.avia_utilities.supports('transition');
/* 525  */ 		
/* 526  */ 		if(container == 'body')
/* 527  */     	{
/* 528  */     		var elements = $('#main a img').parents('a').not('.noLightbox, .noLightbox a, .avia-gallery-thumb a, .avia-layerslider a, .noHover, .noHover a').add('#main .avia-hover-fx');
/* 529  */     	}
/* 530  */     	else
/* 531  */     	{
/* 532  */     		var elements = $('a img', container).parents('a').not('.noLightbox, .noLightbox a, .avia-gallery-thumb a, .avia-layerslider a, .noHover, .noHover a').add('.avia-hover-fx', container);
/* 533  */     	}
/* 534  */ 
/* 535  */ 	   elements.each(function(e)
/* 536  */        {
/* 537  */             var link = $(this), 
/* 538  */             	current = link.find('img:first');
/* 539  */ 
/* 540  */             if(current.hasClass('alignleft')) link.addClass('alignleft').css({float:'left', margin:0, padding:0});
/* 541  */             if(current.hasClass('alignright')) link.addClass('alignright').css({float:'right', margin:0, padding:0});
/* 542  */             if(current.hasClass('aligncenter')) link.addClass('aligncenter').css({float:'none','text-align':'center', margin:0, padding:0});
/* 543  */ 
/* 544  */             if(current.hasClass('alignnone'))
/* 545  */             {
/* 546  */                link.addClass('alignnone').css({margin:0, padding:0});;
/* 547  */                if(!link.css('display') || link.css('display') == 'inline') { link.css({display:'inline-block'}); }
/* 548  */             }
/* 549  */             
/* 550  */             if(!link.css('position') || link.css('position') == 'static') { link.css({position:'relative', overflow:'hidden'}); }

/* avia.js */

/* 551  */             
/* 552  */             var url		 	= link.attr('href'),
/* 553  */ 				span_class	= "overlay-type-video",
/* 554  */ 				opa			= link.data('opacity') || 0.7,
/* 555  */ 				overlay_offset = 5,
/* 556  */ 				overlay 	= link.find('.image-overlay');
/* 557  */             	
/* 558  */             	if(url)
/* 559  */ 				{
/* 560  */ 					if( url.match(/(jpg|gif|jpeg|png|tif)/) ) span_class = "overlay-type-image";
/* 561  */ 					if(!url.match(/(jpg|gif|jpeg|png|\.tif|\.mov|\.swf|vimeo\.com|youtube\.com)/) ) span_class = "overlay-type-extern";
/* 562  */ 				}
/* 563  */ 				
/* 564  */ 				if(!overlay.length)
/* 565  */ 				{
/* 566  */ 					overlay = $("<span class='image-overlay "+span_class+"'><span class='image-overlay-inside'></span></span>").appendTo(link);
/* 567  */ 				}
/* 568  */             	
/* 569  */             	link.on('mouseenter', function(e)
/* 570  */ 				{
/* 571  */ 					var current = link.find('img:first'),
/* 572  */ 						_self	= current.get(0),
/* 573  */ 						outerH 	= current.outerHeight(),
/* 574  */ 						outerW 	= current.outerWidth(),
/* 575  */ 						pos		= current.position(),
/* 576  */ 						linkCss = link.css('display'),
/* 577  */ 						overlay = link.find('.image-overlay');
/* 578  */ 					
/* 579  */ 					if(outerH > 100)
/* 580  */ 					{
/* 581  */ 						
/* 582  */ 						if(!overlay.length)
/* 583  */ 						{
/* 584  */ 							overlay = $("<span class='image-overlay "+span_class+"'><span class='image-overlay-inside'></span></span>").appendTo(link);
/* 585  */ 							
/* 586  */ 						}
/* 587  */ 						//can be wrapped into if !overlay.length statement if chrome fixes fade in problem
/* 588  */ 						if(link.height() == 0) { link.addClass(_self.className); _self.className = ""; }
/* 589  */ 						if(!linkCss || linkCss == 'inline') { link.css({display:'block'}); }
/* 590  */ 						//end wrap
/* 591  */ 						
/* 592  */ 						overlay.css({left:(pos.left - overlay_offset) + parseInt(current.css("margin-left"),10), top:pos.top + parseInt(current.css("margin-top"),10)})
/* 593  */ 							   .css({overflow:'hidden',display:'block','height':outerH,'width':(outerW + (2*overlay_offset))});
/* 594  */ 							   
/* 595  */ 						if(cssTrans === false ) overlay.stop().animate({opacity:opa}, 400);
/* 596  */ 					}
/* 597  */ 					else
/* 598  */ 					{
/* 599  */ 						overlay.css({display:"none"});
/* 600  */ 					}

/* avia.js */

/* 601  */ 		
/* 602  */ 				}).on('mouseleave', elements, function(){
/* 603  */ 		
/* 604  */ 					if(overlay.length)
/* 605  */ 					{
/* 606  */ 						if(cssTrans === false ) overlay.stop().animate({opacity:0}, 400);
/* 607  */ 					}
/* 608  */ 				});
/* 609  */         });
/* 610  */     }
/* 611  */ 
/* 612  */ 
/* 613  */ 
/* 614  */ 
/* 615  */ 
/* 616  */ 
/* 617  */ 
/* 618  */ 
/* 619  */ // -------------------------------------------------------------------------------------------
/* 620  */ // Smooth scrooling when clicking on anchor links
/* 621  */ // todo: maybe use https://github.com/ryanburnette/scrollToBySpeed/blob/master/src/scrolltobyspeed.jquery.js in the future
/* 622  */ // -------------------------------------------------------------------------------------------
/* 623  */ 
/* 624  */ 	(function($)
/* 625  */ 	{
/* 626  */ 		$.fn.avia_smoothscroll = function(apply_to_container)
/* 627  */ 		{
/* 628  */ 			if(!this.length) return;
/* 629  */ 				
/* 630  */ 			var the_win = $(window),
/* 631  */ 				$header = $('#header'),
/* 632  */ 				$main 	= $('.html_header_top.html_header_sticky #main').not('.page-template-template-blank-php #main'),
/* 633  */ 				$meta 	= $('.html_header_top #header_meta'),
/* 634  */ 				$alt  	= $('.html_header_top #header_main_alternate'),
/* 635  */ 				shrink	= $('.html_header_top.html_header_shrinking').length,
/* 636  */ 				fixedMainPadding = 0,
/* 637  */ 				isMobile = $.avia_utilities.isMobile,
/* 638  */ 				sticky_sub = $('.sticky_placeholder:first'), 
/* 639  */ 				calc_main_padding= function()
/* 640  */ 				{
/* 641  */ 					if($header.css('position') == "fixed")
/* 642  */ 					{
/* 643  */ 						var tempPadding  		= parseInt($main.data('scroll-offset'),10) || 0,
/* 644  */ 							non_shrinking		= parseInt($meta.outerHeight(),10) || 0,
/* 645  */ 							non_shrinking2		= parseInt($alt.outerHeight(),10) || 0; 
/* 646  */ 						
/* 647  */ 						if(tempPadding > 0 && shrink) 
/* 648  */ 						{
/* 649  */ 							tempPadding = (tempPadding / 2 ) + non_shrinking + non_shrinking2;
/* 650  */ 						}

/* avia.js */

/* 651  */ 						else
/* 652  */ 						{
/* 653  */ 							tempPadding = tempPadding + non_shrinking + non_shrinking2;
/* 654  */ 						}
/* 655  */ 						
/* 656  */ 						tempPadding += parseInt($('html').css('margin-top'),10);
/* 657  */ 						fixedMainPadding = tempPadding;
/* 658  */ 					}
/* 659  */ 					else
/* 660  */ 					{
/* 661  */ 						fixedMainPadding = parseInt($('html').css('margin-top'),10);
/* 662  */ 					}
/* 663  */ 					
/* 664  */ 				};
/* 665  */ 			
/* 666  */ 			if(isMobile) shrink = false;
/* 667  */ 			
/* 668  */ 			calc_main_padding();
/* 669  */ 			the_win.on("debouncedresize av-height-change",  calc_main_padding);
/* 670  */ 
/* 671  */ 			var hash = window.location.hash.replace(/\//g, "");
/* 672  */ 			
/* 673  */ 			//if a scroll event occurs at pageload and an anchor is set and a coresponding element exists apply the offset to the event
/* 674  */ 			if (fixedMainPadding > 0 && hash && apply_to_container == 'body' && hash.charAt(1) != "!")
/* 675  */ 			{
/* 676  */ 				var scroll_to_el = $(hash), modifier = 0;
/* 677  */ 				
/* 678  */ 				if(scroll_to_el.length)
/* 679  */ 				{
/* 680  */ 					the_win.on('scroll.avia_first_scroll', function()
/* 681  */ 					{	
/* 682  */ 						setTimeout(function(){ //small delay so other scripts can perform necessary resizing
/* 683  */ 							if(sticky_sub.length && scroll_to_el.offset().top > sticky_sub.offset().top) { modifier = sticky_sub.outerHeight() - 3; }
/* 684  */ 							the_win.off('scroll.avia_first_scroll').scrollTop( scroll_to_el.offset().top - fixedMainPadding - modifier);
/* 685  */ 						},10); 
/* 686  */ 				    });
/* 687  */ 			    }
/* 688  */ 			}
/* 689  */ 			
/* 690  */ 			return this.each(function()
/* 691  */ 			{
/* 692  */ 				$(this).click(function(e) {
/* 693  */ 
/* 694  */ 				   var newHash  = this.hash.replace(/\//g, ""),
/* 695  */ 				   	   clicked  = $(this),
/* 696  */ 				   	   data		= clicked.data();
/* 697  */ 					
/* 698  */ 				   if(newHash != '' && newHash != '#' && newHash != '#prev' && newHash != '#next' && !clicked.is('.comment-reply-link, #cancel-comment-reply-link, .no-scroll'))
/* 699  */ 				   {
/* 700  */ 					   var container = "", originHash = "";

/* avia.js */

/* 701  */ 					   
/* 702  */ 					   if("#next-section" == newHash)
/* 703  */ 					   {
/* 704  */ 					   		originHash  = newHash;
/* 705  */ 					   		container   = clicked.parents('.container_wrap:eq(0)').nextAll('.container_wrap:eq(0)');
/* 706  */ 					   		newHash		= '#' + container.attr('id') ;
/* 707  */ 					   }
/* 708  */ 					   else
/* 709  */ 					   {
/* 710  */ 					   		container = $(this.hash.replace(/\//g, ""));
/* 711  */ 					   }
/* 712  */ 					   
/* 713  */ 					   
/* 714  */ 
/* 715  */ 						if(container.length)
/* 716  */ 						{
/* 717  */ 							var cur_offset = the_win.scrollTop(),
/* 718  */ 								container_offset = container.offset().top,
/* 719  */ 								target =  container_offset - fixedMainPadding,
/* 720  */ 								hash = window.location.hash,
/* 721  */ 								hash = hash.replace(/\//g, ""),
/* 722  */ 								oldLocation=window.location.href.replace(hash, ''),
/* 723  */ 								newLocation=this,
/* 724  */ 								duration= data.duration || 1200,
/* 725  */ 								easing= data.easing || 'easeInOutQuint';
/* 726  */ 							
/* 727  */ 							if(sticky_sub.length && container_offset > sticky_sub.offset().top) { target -= sticky_sub.outerHeight() - 3;}
/* 728  */ 							
/* 729  */ 							// make sure it's the same location
/* 730  */ 							if(oldLocation+newHash==newLocation || originHash)
/* 731  */ 							{
/* 732  */ 								if(cur_offset != target) // if current pos and target are the same dont scroll
/* 733  */ 								{
/* 734  */ 									if(!(cur_offset == 0 && target <= 0 )) // if we are at the top dont try to scroll to top or above
/* 735  */ 									{
/* 736  */ 										// animate to target and set the hash to the window.location after the animation
/* 737  */ 										$('html:not(:animated),body:not(:animated)').animate({ scrollTop: target }, duration, easing, function() {
/* 738  */ 										
/* 739  */ 											// add new hash to the browser location
/* 740  */ 											//window.location.href=newLocation;
/* 741  */ 											if(window.history.replaceState)
/* 742  */ 											window.history.replaceState("", "", newHash);
/* 743  */ 										});
/* 744  */ 									}
/* 745  */ 								}
/* 746  */ 								// cancel default click action
/* 747  */ 								e.preventDefault();
/* 748  */ 							}
/* 749  */ 						}
/* 750  */ 					}

/* avia.js */

/* 751  */ 				});
/* 752  */ 			});
/* 753  */ 		};
/* 754  */ 	})(jQuery);
/* 755  */ 
/* 756  */ 
/* 757  */ 	// -------------------------------------------------------------------------------------------
/* 758  */ 	// iframe fix for firefox and ie so they get proper z index
/* 759  */ 	// -------------------------------------------------------------------------------------------
/* 760  */ 	function avia_iframe_fix(container)
/* 761  */ 	{
/* 762  */ 		var iframe 	= jQuery('iframe[src*="youtube.com"]:not(.av_youtube_frame)', container),
/* 763  */ 			youtubeEmbed = jQuery('iframe[src*="youtube.com"]:not(.av_youtube_frame) object, iframe[src*="youtube.com"]:not(.av_youtube_frame) embed', container).attr('wmode','opaque');
/* 764  */ 
/* 765  */ 			iframe.each(function()
/* 766  */ 			{
/* 767  */ 				var current = jQuery(this),
/* 768  */ 					src 	= current.attr('src');
/* 769  */ 
/* 770  */ 				if(src)
/* 771  */ 				{
/* 772  */ 					if(src.indexOf('?') !== -1)
/* 773  */ 					{
/* 774  */ 						src += "&wmode=opaque";
/* 775  */ 					}
/* 776  */ 					else
/* 777  */ 					{
/* 778  */ 						src += "?wmode=opaque";
/* 779  */ 					}
/* 780  */ 
/* 781  */ 					current.attr('src', src);
/* 782  */ 				}
/* 783  */ 			});
/* 784  */ 	}
/* 785  */ 
/* 786  */ 	// -------------------------------------------------------------------------------------------
/* 787  */ 	// small js fixes for pixel perfection :)
/* 788  */ 	// -------------------------------------------------------------------------------------------
/* 789  */ 	function avia_small_fixes(container)
/* 790  */ 	{
/* 791  */ 		if(!container) container = document;
/* 792  */ 
/* 793  */ 		//make sure that iframes do resize correctly. uses css padding bottom iframe trick
/* 794  */ 		var win		= jQuery(window),
/* 795  */ 			iframes = jQuery('.avia-iframe-wrap iframe:not(.avia-slideshow iframe):not( iframe.no_resize):not(.avia-video iframe)', container),
/* 796  */ 			adjust_iframes = function()
/* 797  */ 			{
/* 798  */ 				iframes.each(function(){
/* 799  */ 
/* 800  */ 					var iframe = jQuery(this), parent = iframe.parent(), proportions = 56.25;

/* avia.js */

/* 801  */ 
/* 802  */ 					if(this.width && this.height)
/* 803  */ 					{
/* 804  */ 						proportions = (100/ this.width) * this.height;
/* 805  */ 						parent.css({"padding-bottom":proportions+"%"});
/* 806  */ 					}
/* 807  */ 				});
/* 808  */ 			};
/* 809  */ 
/* 810  */ 			adjust_iframes();
/* 811  */ 
/* 812  */ 	}
/* 813  */ 
/* 814  */ 	// -------------------------------------------------------------------------------------------
/* 815  */ 	// Ligthbox activation
/* 816  */ 	// -------------------------------------------------------------------------------------------
/* 817  */ 
/* 818  */ 	(function($)
/* 819  */ 	{
/* 820  */ 		$.fn.avia_activate_lightbox = function(variables)
/* 821  */ 		{
/* 822  */ 			var defaults = {
/* 823  */ 				groups			:	['.avia-gallery', '.isotope', '.post-entry', '.sidebar', '#main'], 
/* 824  */ 				autolinkElements:   'a[rel^="prettyPhoto"], a[rel^="lightbox"], a[href$=jpg], a[href$=png], a[href$=gif], a[href$=jpeg], a[href*=".jpg?"], a[href*=".png?"], a[href*=".gif?"], a[href*=".jpeg?"], a[href$=".mov"] , a[href$=".swf"] , a:regex(href, .vimeo\.com/[0-9]) , a[href*="youtube.com/watch"] , a[href*="screenr.com"], a[href*="iframe=true"]',
/* 825  */ 				videoElements	: 	'a[href$=".mov"] , a[href$=".swf"] , a:regex(href, .vimeo\.com/[0-9]) , a[href*="youtube.com/watch"] , a[href*="screenr.com"], a[href*="iframe=true"]',
/* 826  */ 				exclude			:	'.noLightbox, .noLightbox a, .fakeLightbox, .lightbox-added',
/* 827  */ 			},
/* 828  */ 			
/* 829  */ 			options = $.extend({}, defaults, variables),
/* 830  */ 			
/* 831  */ 			av_popup = {
/* 832  */ 				type: 				'image',
/* 833  */ 				mainClass: 			'avia-popup mfp-zoom-in',
/* 834  */ 				tLoading: 			'',
/* 835  */ 				tClose: 			'',
/* 836  */ 				removalDelay: 		300, //delay removal by X to allow out-animation
/* 837  */ 				closeBtnInside: 	true,
/* 838  */ 				closeOnContentClick:true,
/* 839  */ 				midClick: 			true,
/* 840  */ 				fixedContentPos: 	false, // allows scrolling when lightbox is open but also removes any jumping because of scrollbar removal
/* 841  */ 				
/* 842  */ 				image: {
/* 843  */ 				    titleSrc: function(item){
/* 844  */ 					    var title = item.el.attr('title');
/* 845  */ 					    if(!title) title = item.el.find('img').attr('title');
/* 846  */ 					    if(typeof title == "undefined") return "";
/* 847  */ 					    return title;
/* 848  */ 					}
/* 849  */ 				},
/* 850  */ 				

/* avia.js */

/* 851  */ 				gallery: {
/* 852  */ 					// delegate: 	options.autolinkElements,
/* 853  */ 					tPrev:		'',
/* 854  */ 					tNext:		'',
/* 855  */ 					tCounter:	'%curr% / %total%',
/* 856  */ 					enabled:	true,
/* 857  */ 					preload:	[1,1] // Will preload 1 - before current, and 1 after the current image
/* 858  */ 				},
/* 859  */ 
/* 860  */ 				callbacks: 
/* 861  */ 				{
/* 862  */ 					open: function()
/* 863  */ 					{
/* 864  */ 						//overwrite default prev + next function. Add timeout for css3 crossfade animation
/* 865  */ 						$.magnificPopup.instance.next = function() {
/* 866  */ 							var self = this;
/* 867  */ 							self.wrap.removeClass('mfp-image-loaded');
/* 868  */ 							setTimeout(function() { $.magnificPopup.proto.next.call(self); }, 120);
/* 869  */ 						}
/* 870  */ 						$.magnificPopup.instance.prev = function() {
/* 871  */ 							var self = this;
/* 872  */ 							self.wrap.removeClass('mfp-image-loaded');
/* 873  */ 							setTimeout(function() { $.magnificPopup.proto.prev.call(self); }, 120);
/* 874  */ 						}
/* 875  */ 					},
/* 876  */ 					imageLoadComplete: function() 
/* 877  */ 					{	
/* 878  */ 						var self = this;
/* 879  */ 						setTimeout(function() { self.wrap.addClass('mfp-image-loaded'); }, 16);
/* 880  */ 					}
/* 881  */ 				}
/* 882  */ 			},
/* 883  */ 			
/* 884  */ 			active = !$('html').is('.av-custom-lightbox');
/* 885  */ 			
/* 886  */ 			if(!active) return this;
/* 887  */ 			
/* 888  */ 			return this.each(function()
/* 889  */ 			{
/* 890  */ 				var container	= $(this),
/* 891  */ 					videos		= $(options.videoElements, this).not(options.exclude).addClass('mfp-iframe'), /*necessary class for the correct lightbox markup*/
/* 892  */ 					ajaxed		= !container.is('body') && !container.is('.ajax_slide');
/* 893  */ 										
/* 894  */ 					for (var i = 0; i < options.groups.length; i++) 
/* 895  */ 					{
/* 896  */ 						$(options.groups[i]).each(function() 
/* 897  */ 						{ 
/* 898  */ 							var links = $(options.autolinkElements, this);
/* 899  */ 						
/* 900  */ 							if(ajaxed) links.removeClass('lightbox-added');

/* avia.js */

/* 901  */ 							links.not(options.exclude).addClass('lightbox-added').magnificPopup(av_popup);
/* 902  */ 						});
/* 903  */ 					}
/* 904  */ 				
/* 905  */ 			});
/* 906  */ 		}
/* 907  */ 	})(jQuery);
/* 908  */ 
/* 909  */ 
/* 910  */ 
/* 911  */ // -------------------------------------------------------------------------------------------
/* 912  */ // Avia Menu
/* 913  */ // -------------------------------------------------------------------------------------------
/* 914  */ 
/* 915  */ (function($)
/* 916  */ {
/* 917  */ 	$.fn.aviaMegamenu = function(variables)
/* 918  */ 	{
/* 919  */ 		var defaults =
/* 920  */ 		{
/* 921  */ 			modify_position:true,
/* 922  */ 			delay:300
/* 923  */ 		};
/* 924  */ 
/* 925  */ 		var options = $.extend(defaults, variables),
/* 926  */ 		win			= $(window),
/* 927  */ 		the_main	= $('#main .container:first'),
/* 928  */ 		css_block	= $("<style type='text/css' id='av-browser-width-mm'></style>").appendTo('head:first'),
/* 929  */ 		calc_dimensions = function()
/* 930  */ 		{
/* 931  */ 			var css			= "",
/* 932  */ 				w_12 		= Math.round( the_main.width() );
/* 933  */ 				
/* 934  */ 			css += " #header .three.units{width:"	+ ( w_12 * 0.25)+	"px;}";
/* 935  */ 			css += " #header .six.units{width:"		+ ( w_12 * 0.50)+	"px;}";
/* 936  */ 			css += " #header .nine.units{width:"	+ ( w_12 * 0.75)+	"px;}";
/* 937  */ 			css += " #header .twelve.units{width:"	+( w_12 )		+	"px;}";
/* 938  */ 			
/* 939  */ 			//ie8 needs different insert method
/* 940  */ 			try{
/* 941  */ 				css_block.text(css); 
/* 942  */ 			}
/* 943  */ 			catch(err){
/* 944  */ 				css_block.remove();
/* 945  */ 				css_block = $("<style type='text/css' id='av-browser-width-mm'>"+css+"</style>").appendTo('head:first');
/* 946  */ 			}
/* 947  */ 			
/* 948  */ 		};
/* 949  */ 		
/* 950  */ 		if($('.avia_mega_div').length > 0)

/* avia.js */

/* 951  */ 		{
/* 952  */ 			win.on( 'debouncedresize', calc_dimensions);
/* 953  */ 			calc_dimensions();
/* 954  */ 		}	
/* 955  */ 
/* 956  */ 		return this.each(function()
/* 957  */ 		{
/* 958  */ 			var the_html	= $('html:first'),
/* 959  */ 				main		= $('#main .container:first'),
/* 960  */ 				left_menu	= the_html.filter('.html_menu_left, .html_logo_center').length,
/* 961  */ 				isMobile 	= $.avia_utilities.isMobile,
/* 962  */ 				menu = $(this),
/* 963  */ 				menuItems = menu.find(">li"),
/* 964  */ 				megaItems = menuItems.find(">div").parent().css({overflow:'hidden'}),
/* 965  */ 				menuActive = menu.find('>.current-menu-item>a, >.current_page_item>a'),
/* 966  */ 				dropdownItems = menuItems.find(">ul").parent(),
/* 967  */ 				parentContainer = menu.parent(),
/* 968  */ 				mainMenuParent = menu.parents('.main_menu').eq(0),
/* 969  */ 				parentContainerWidth = parentContainer.width(),
/* 970  */ 				delayCheck = {},
/* 971  */ 				mega_open = [];
/* 972  */ 				
/* 973  */ 
/* 974  */ 			if(!menuActive.length){ menu.find('.current-menu-ancestor:eq(0) a:eq(0), .current_page_ancestor:eq(0) a:eq(0)').parent().addClass('active-parent-item')}
/* 975  */ 			if(!the_html.is('.html_header_top')) { options.modify_position = false; }
/* 976  */ 			
/* 977  */ 			
/* 978  */ 			menuItems.on('click' ,'a', function()
/* 979  */ 			{
/* 980  */ 				if(this.href == window.location.href + "#" || this.href == window.location.href + "/#")
/* 981  */ 				return false;
/* 982  */ 			});
/* 983  */ 
/* 984  */ 			menuItems.each(function()
/* 985  */ 			{
/* 986  */ 				var item = $(this),
/* 987  */ 					pos = item.position(),
/* 988  */ 					megaDiv = item.find("div:first").css({opacity:0, display:"none"}),
/* 989  */ 					normalDropdown = "";
/* 990  */ 
/* 991  */ 				//check if we got a mega menu
/* 992  */ 				if(!megaDiv.length)
/* 993  */ 				{
/* 994  */ 					normalDropdown = item.find(">ul").css({display:"none"});
/* 995  */ 				}
/* 996  */ 
/* 997  */ 				//if we got a mega menu or dropdown menu add the arrow beside the menu item
/* 998  */ 				if(megaDiv.length || normalDropdown.length)
/* 999  */ 				{
/* 1000 */ 					var link = item.addClass('dropdown_ul_available').find('>a');

/* avia.js */

/* 1001 */ 					link.append('<span class="dropdown_available"></span>');
/* 1002 */ 
/* 1003 */ 					//is a mega menu main item doesnt have a link to click use the default cursor
/* 1004 */ 					if(typeof link.attr('href') != 'string' || link.attr('href') == "#"){ link.css('cursor','default').click(function(){return false;}); }
/* 1005 */ 				}
/* 1006 */ 
/* 1007 */ 
/* 1008 */ 				//correct position of mega menus
/* 1009 */ 				if(options.modify_position && megaDiv.length)
/* 1010 */ 				{	
/* 1011 */ 					item.one('mouseenter', function(){ calc_offset(item, pos, megaDiv, parentContainerWidth) });
/* 1012 */ 				}
/* 1013 */ 
/* 1014 */ 
/* 1015 */ 
/* 1016 */ 			});
/* 1017 */ 			
/* 1018 */ 			
/* 1019 */ 			function calc_offset(item, pos, megaDiv, parentContainerWidth)
/* 1020 */ 			{	
/* 1021 */ 				if(!left_menu)
/* 1022 */ 					{
/* 1023 */ 						if(pos.left + megaDiv.width() < parentContainerWidth)
/* 1024 */ 						{
/* 1025 */ 							megaDiv.css({right: -megaDiv.outerWidth() + item.outerWidth()  });
/* 1026 */ 							//item.css({position:'static'});
/* 1027 */ 						}
/* 1028 */ 						else if(pos.left + megaDiv.width() > parentContainerWidth)
/* 1029 */ 						{
/* 1030 */ 							megaDiv.css({right: -mainMenuParent.outerWidth() + (pos.left + item.outerWidth() ) });
/* 1031 */ 						}
/* 1032 */ 					}
/* 1033 */ 					else
/* 1034 */ 					{
/* 1035 */ 						if(megaDiv.width() > pos.left + item.outerWidth())
/* 1036 */ 						{
/* 1037 */ 							megaDiv.css({left: (pos.left* -1)});
/* 1038 */ 						}
/* 1039 */ 						else if(pos.left + megaDiv.width() > parentContainerWidth)
/* 1040 */ 						{
/* 1041 */ 							megaDiv.css({left: (megaDiv.width() - pos.left) * -1 });
/* 1042 */ 						}
/* 1043 */ 					}
/* 1044 */ 			}
/* 1045 */ 
/* 1046 */ 			function megaDivShow(i)
/* 1047 */ 			{
/* 1048 */ 				if(delayCheck[i] == true)
/* 1049 */ 				{
/* 1050 */ 					var item = megaItems.filter(':eq('+i+')').css({overflow:'visible'}).find("div:first"),

/* avia.js */

/* 1051 */ 						link = megaItems.filter(':eq('+i+')').find("a:first");
/* 1052 */ 						mega_open["check"+i] = true;
/* 1053 */ 
/* 1054 */ 						item.stop().css('display','block').animate({opacity:1},300);
/* 1055 */ 
/* 1056 */ 						if(item.length)
/* 1057 */ 						{
/* 1058 */ 							link.addClass('open-mega-a');
/* 1059 */ 						}
/* 1060 */ 				}
/* 1061 */ 			}
/* 1062 */ 
/* 1063 */ 			function megaDivHide (i)
/* 1064 */ 			{
/* 1065 */ 				if(delayCheck[i] == false)
/* 1066 */ 				{
/* 1067 */ 					megaItems.filter(':eq('+i+')').find(">a").removeClass('open-mega-a');
/* 1068 */ 
/* 1069 */ 					var listItem = megaItems.filter(':eq('+i+')'),
/* 1070 */ 						item = listItem.find("div:first");
/* 1071 */ 
/* 1072 */ 
/* 1073 */ 					item.stop().css('display','block').animate({opacity:0},300, function()
/* 1074 */ 					{
/* 1075 */ 						$(this).css('display','none');
/* 1076 */ 						listItem.css({overflow:'hidden'});
/* 1077 */ 						mega_open["check"+i] = false;
/* 1078 */ 					});
/* 1079 */ 				}
/* 1080 */ 			}
/* 1081 */ 
/* 1082 */ 			if(isMobile)
/* 1083 */ 			{
/* 1084 */ 				megaItems.each(function(i){
/* 1085 */ 
/* 1086 */ 					$(this).bind('click', function()
/* 1087 */ 					{
/* 1088 */ 						if(mega_open["check"+i] != true) return false;
/* 1089 */ 					});
/* 1090 */ 				});
/* 1091 */ 			}
/* 1092 */ 
/* 1093 */ 
/* 1094 */ 			//bind event for mega menu
/* 1095 */ 			megaItems.each(function(i){
/* 1096 */ 
/* 1097 */ 				$(this).hover(
/* 1098 */ 
/* 1099 */ 					function()
/* 1100 */ 					{

/* avia.js */

/* 1101 */ 						delayCheck[i] = true;
/* 1102 */ 						setTimeout(function(){megaDivShow(i); },options.delay);
/* 1103 */ 					},
/* 1104 */ 
/* 1105 */ 					function()
/* 1106 */ 					{
/* 1107 */ 						delayCheck[i] = false;
/* 1108 */ 						setTimeout(function(){megaDivHide(i); },options.delay);
/* 1109 */ 					}
/* 1110 */ 				);
/* 1111 */ 			});
/* 1112 */ 
/* 1113 */ 
/* 1114 */ 			// bind events for dropdown menu
/* 1115 */ 			dropdownItems.find('li').andSelf().each(function()
/* 1116 */ 			{
/* 1117 */ 				var currentItem = $(this),
/* 1118 */ 					sublist = currentItem.find('ul:first'),
/* 1119 */ 					showList = false;
/* 1120 */ 
/* 1121 */ 				if(sublist.length)
/* 1122 */ 				{
/* 1123 */ 					sublist.css({display:'block', opacity:0, visibility:'hidden'});
/* 1124 */ 					var currentLink = currentItem.find('>a');
/* 1125 */ 
/* 1126 */ 					currentLink.bind('mouseenter', function()
/* 1127 */ 					{
/* 1128 */ 						sublist.stop().css({visibility:'visible'}).animate({opacity:1});
/* 1129 */ 					});
/* 1130 */ 
/* 1131 */ 					currentItem.bind('mouseleave', function()
/* 1132 */ 					{
/* 1133 */ 						sublist.stop().animate({opacity:0}, function()
/* 1134 */ 						{
/* 1135 */ 							sublist.css({visibility:'hidden'});
/* 1136 */ 						});
/* 1137 */ 					});
/* 1138 */ 
/* 1139 */ 				}
/* 1140 */ 
/* 1141 */ 			});
/* 1142 */ 
/* 1143 */ 		});
/* 1144 */ 	};
/* 1145 */ })(jQuery);
/* 1146 */ 
/* 1147 */ 
/* 1148 */ 
/* 1149 */ 
/* 1150 */ // -------------------------------------------------------------------------------------------

/* avia.js */

/* 1151 */ //Portfolio sorting
/* 1152 */ // -------------------------------------------------------------------------------------------
/* 1153 */ 
/* 1154 */     $.fn.avia_iso_sort = function(options)
/* 1155 */ 	{
/* 1156 */ 		return this.each(function()
/* 1157 */ 		{
/* 1158 */ 			var the_body		= $('body'),
/* 1159 */ 				container		= $(this),
/* 1160 */ 				portfolio_id	= container.data('portfolio-id'),
/* 1161 */ 				parentContainer	= container.parents('.entry-content-wrapper, .avia-fullwidth-portfolio'),
/* 1162 */ 				filter			= parentContainer.find('.sort_width_container[data-portfolio-id="' + portfolio_id + '"]').find('#js_sort_items').css({visibility:"visible", opacity:0}),
/* 1163 */ 				links			= filter.find('a'),
/* 1164 */ 				imgParent		= container.find('.grid-image'),
/* 1165 */ 				isoActive		= false,
/* 1166 */ 				items			= $('.post-entry', container);
/* 1167 */ 
/* 1168 */ 			function applyIso()
/* 1169 */ 			{
/* 1170 */ 				container.addClass('isotope_activated').isotope({
/* 1171 */ 					layoutMode : 'fitRows', itemSelector : '.flex_column'
/* 1172 */ 				});
/* 1173 */ 				
/* 1174 */ 				container.isotope( 'on', 'layoutComplete', function()
/* 1175 */ 				{
/* 1176 */ 					container.css({overflow:'visible'});
/* 1177 */ 					the_body.trigger('av_resize_finished');
/* 1178 */ 				}); 
/* 1179 */ 				
/* 1180 */ 				isoActive = true;
/* 1181 */ 				setTimeout(function(){ parentContainer.addClass('avia_sortable_active'); }, 0);
/* 1182 */ 			};
/* 1183 */ 
/* 1184 */ 			links.bind('click',function()
/* 1185 */ 			{
/* 1186 */ 				var current		= $(this),
/* 1187 */ 			  		selector	= current.data('filter'),
/* 1188 */ 			  		linktext	= current.html(),
/* 1189 */ 			  		activeCat	= parentContainer.find('.av-current-sort-title');
/* 1190 */ 
/* 1191 */ 			  		if(activeCat.length) activeCat.html(linktext);
/* 1192 */ 			  		
/* 1193 */ 					links.removeClass('active_sort');
/* 1194 */ 					current.addClass('active_sort');
/* 1195 */ 					container.attr('id', 'grid_id_'+selector);
/* 1196 */ 
/* 1197 */ 					parentContainer.find('.open_container .ajax_controlls .avia_close').trigger('click');
/* 1198 */ 					//container.css({overflow:'hidden'})
/* 1199 */ 					container.isotope({ layoutMode : 'fitRows', itemSelector : '.flex_column' , filter: '.'+selector});
/* 1200 */ 

/* avia.js */

/* 1201 */ 					return false;
/* 1202 */ 			});
/* 1203 */ 
/* 1204 */ 			// update columnWidth on window resize
/* 1205 */ 			$(window).on( 'debouncedresize', function()
/* 1206 */ 			{
/* 1207 */ 			  	applyIso();
/* 1208 */ 			});
/* 1209 */ 
/* 1210 */ 			$.avia_utilities.preload({container: container, single_callback:  function()
/* 1211 */ 				{
/* 1212 */ 					filter.animate({opacity:1}, 400); applyIso();
/* 1213 */ 
/* 1214 */ 					//call a second time to for the initial resizing
/* 1215 */ 					setTimeout(function(){ applyIso(); });
/* 1216 */ 
/* 1217 */ 					imgParent.css({height:'auto'}).each(function(i)
/* 1218 */ 					{
/* 1219 */ 						var currentLink = $(this);
/* 1220 */ 
/* 1221 */ 						setTimeout(function()
/* 1222 */ 						{
/* 1223 */ 							currentLink.animate({opacity:1},1500);
/* 1224 */ 						}, (100 * i));
/* 1225 */ 					});
/* 1226 */ 				}
/* 1227 */ 			});
/* 1228 */ 
/* 1229 */ 		});
/* 1230 */ 	};
/* 1231 */ 
/* 1232 */ 	
/* 1233 */ 	
/* 1234 */ 	
/* 1235 */ 	function avia_sticky_submenu()
/* 1236 */ 	{
/* 1237 */ 		var win 		= $(window),
/* 1238 */ 			html 		= $('html:first'),
/* 1239 */ 			header  	= $('.html_header_top.html_header_sticky #header'),
/* 1240 */ 			html_margin = parseInt( $('html:first').css('margin-top'), 10),
/* 1241 */ 			setWitdth	= $('.html_header_sidebar #main, .boxed #main'),
/* 1242 */ 			menus		= $('.av-submenu-container'),
/* 1243 */ 			calc_margin	= function()
/* 1244 */ 			{
/* 1245 */ 				html_margin = parseInt( html.css('margin-top'), 10);
/* 1246 */ 				if(!$('.mobile_menu_toggle:visible').length)
/* 1247 */ 				{
/* 1248 */ 					$('.av-open-submenu').removeClass('av-open-submenu');
/* 1249 */ 				}
/* 1250 */ 			},

/* avia.js */

/* 1251 */ 			calc_values	= function()
/* 1252 */ 			{
/* 1253 */ 				var content_width = setWitdth.width();
/* 1254 */ 				html_margin = parseInt( html.css('margin-top'), 10);
/* 1255 */ 				menus.width(content_width);
/* 1256 */ 				
/* 1257 */ 			},
/* 1258 */ 			check 		= function(placeholder, no_timeout)
/* 1259 */ 			{
/* 1260 */ 				var menu_pos	= this.offset().top,
/* 1261 */ 					top_pos 	= placeholder.offset().top,
/* 1262 */ 					scrolled	= win.scrollTop(),
/* 1263 */ 					modifier 	= html_margin, fixed = false;
/* 1264 */ 					
/* 1265 */ 					if(header.length) modifier += header.outerHeight() + parseInt( header.css('margin-top'), 10);
/* 1266 */ 				
/* 1267 */ 					if(scrolled + modifier > top_pos)
/* 1268 */ 					{
/* 1269 */ 						if(!fixed)
/* 1270 */ 						{
/* 1271 */ 							this.css({top: modifier - 1, position: 'fixed'}); fixed = true
/* 1272 */ 						}
/* 1273 */ 					}
/* 1274 */ 					else
/* 1275 */ 					{
/* 1276 */ 						this.css({top: 'auto', position: 'absolute'}); fixed = false
/* 1277 */ 					}
/* 1278 */ 					
/* 1279 */ 			},
/* 1280 */ 			toggle = function(e)
/* 1281 */ 			{
/* 1282 */ 				e.preventDefault();
/* 1283 */ 				
/* 1284 */ 				var clicked = $(this), 
/* 1285 */ 					menu 	= clicked.siblings('.av-subnav-menu');
/* 1286 */ 				
/* 1287 */ 					if(menu.hasClass('av-open-submenu'))
/* 1288 */ 					{
/* 1289 */ 						menu.removeClass('av-open-submenu');
/* 1290 */ 					}
/* 1291 */ 					else
/* 1292 */ 					{
/* 1293 */ 						menu.addClass('av-open-submenu');
/* 1294 */ 					}
/* 1295 */ 			};
/* 1296 */ 		
/* 1297 */ 		win.on("debouncedresize av-height-change",  calc_margin ); calc_margin();
/* 1298 */ 			
/* 1299 */ 		if(setWitdth.length)
/* 1300 */ 		{

/* avia.js */

/* 1301 */ 			win.on("debouncedresize av-height-change",  calc_values );
/* 1302 */ 			calc_values();
/* 1303 */ 		}
/* 1304 */ 		
/* 1305 */ 		$(".av-sticky-submenu").each(function()
/* 1306 */ 		{	
/* 1307 */ 			 var menu  = $(this), placeholder = menu.next('.sticky_placeholder'), mobile_button = menu.find('.mobile_menu_toggle');
/* 1308 */ 			 win.on( 'scroll',  function(){ window.requestAnimationFrame( $.proxy( check, menu, placeholder) )} );
/* 1309 */ 			 
/* 1310 */ 			 if(mobile_button.length)
/* 1311 */ 			 {
/* 1312 */ 			 	mobile_button.on( 'click',  toggle );
/* 1313 */ 			 }
/* 1314 */ 			 
/* 1315 */ 			 
/* 1316 */ 		});
/* 1317 */ 		
/* 1318 */ 		html.on('click', '.av-submenu-hidden .av-open-submenu li a', function()
/* 1319 */ 		{
/* 1320 */ 			var current = $(this);
/* 1321 */ 			
/* 1322 */ 			var list_item = current.siblings('ul, .avia_mega_div');
/* 1323 */ 			if(list_item.length)
/* 1324 */ 			{
/* 1325 */ 				if(list_item.hasClass('av-visible-sublist'))
/* 1326 */ 				{
/* 1327 */ 				    list_item.removeClass('av-visible-sublist');
/* 1328 */ 				}
/* 1329 */ 				else
/* 1330 */ 				{
/* 1331 */ 				    list_item.addClass('av-visible-sublist');
/* 1332 */ 				}
/* 1333 */ 				return false;
/* 1334 */ 			}
/* 1335 */ 		});
/* 1336 */ 		
/* 1337 */ 		$('.avia_mobile').on('click', '.av-menu-mobile-disabled li a', function()
/* 1338 */ 		{
/* 1339 */ 			var current = $(this);
/* 1340 */ 			console.log(current); 
/* 1341 */ 			var list_item = current.siblings('ul');
/* 1342 */ 			if(list_item.length)
/* 1343 */ 			{
/* 1344 */ 				if(list_item.hasClass('av-visible-mobile-sublist'))
/* 1345 */ 				{
/* 1346 */ 				    
/* 1347 */ 				}
/* 1348 */ 				else
/* 1349 */ 				{
/* 1350 */ 					$('.av-visible-mobile-sublist').removeClass('av-visible-mobile-sublist');

/* avia.js */

/* 1351 */ 				    list_item.addClass('av-visible-mobile-sublist');
/* 1352 */ 				    return false;
/* 1353 */ 				}
/* 1354 */ 				
/* 1355 */ 			}
/* 1356 */ 		});
/* 1357 */ 		
/* 1358 */ 		
/* 1359 */ 		
/* 1360 */ 	}
/* 1361 */ 	
/* 1362 */ 	
/* 1363 */ 	
/* 1364 */ 	function avia_sidebar_menu()
/* 1365 */ 	{
/* 1366 */ 		var win				= $(window),
/* 1367 */ 			main			= $('#main'),
/* 1368 */ 			sb_header		= $('.html_header_sidebar #header_main'),
/* 1369 */             sidebar			= $('.html_header_sidebar #header.av_conditional_sticky');
/* 1370 */             
/* 1371 */         if(!sb_header.length) return;
/* 1372 */         // main.css({"min-height":sb_header.outerHeight()});
/* 1373 */ 		
/* 1374 */ 	
/* 1375 */             
/* 1376 */         if(!sidebar.length) return;
/* 1377 */         
/* 1378 */         var innerSidebar	= $('#header_main'),
/* 1379 */        	 	wrap			= $('#wrap_all'),
/* 1380 */        	 	subtract 		= parseInt($('html').css('margin-top'), 10),
/* 1381 */             calc_values 	= function()
/* 1382 */             {
/* 1383 */             	if(innerSidebar.outerHeight() < win.height()) 
/* 1384 */ 				{ 
/* 1385 */ 					sidebar.addClass('av_always_sticky'); 
/* 1386 */ 				}
/* 1387 */ 				else
/* 1388 */ 				{
/* 1389 */ 					sidebar.removeClass('av_always_sticky'); 
/* 1390 */ 				}
/* 1391 */ 				
/* 1392 */ 				wrap.css({'min-height': win.height() - subtract});
/* 1393 */             };
/* 1394 */         
/* 1395 */         calc_values(); 
/* 1396 */         win.on("debouncedresize av-height-change",  calc_values);
/* 1397 */ 	}
/* 1398 */ 	
/* 1399 */ 	function av_change_class($element, change_method, class_name)
/* 1400 */ 	{	

/* avia.js */

/* 1401 */ 		if($element[0].classList)
/* 1402 */ 		{
/* 1403 */ 			if(change_method == "add") 
/* 1404 */ 			{
/* 1405 */ 				$element[0].classList.add(class_name);
/* 1406 */ 			}
/* 1407 */ 			else
/* 1408 */ 			{
/* 1409 */ 				$element[0].classList.remove(class_name);
/* 1410 */ 			}
/* 1411 */ 		}
/* 1412 */ 		else
/* 1413 */ 		{
/* 1414 */ 			if(change_method == "add") 
/* 1415 */ 			{
/* 1416 */ 				$element.addClass(class_name);
/* 1417 */ 			}
/* 1418 */ 			else
/* 1419 */ 			{
/* 1420 */ 				$element.removeClass(class_name);
/* 1421 */ 			}
/* 1422 */ 		}
/* 1423 */ 	}
/* 1424 */ 	
/* 1425 */ 
/* 1426 */ 
/* 1427 */     //check if the browser supports element rotation
/* 1428 */     function avia_header_size()
/* 1429 */     {
/* 1430 */         var win				= $(window),
/* 1431 */             header          = $('.html_header_top.html_header_sticky #header');
/* 1432 */             
/* 1433 */         if(!header.length) return;
/* 1434 */         
/* 1435 */         var logo            = $('#header_main .container .logo img, #header_main .container .logo a'),
/* 1436 */             elements        = $('#header_main .container:first, #header_main .main_menu ul:first-child > li > a:not(.avia_mega_div a, #header_main_alternate a)'),
/* 1437 */             el_height       = $(elements).filter(':first').height(),
/* 1438 */             isMobile        = $.avia_utilities.isMobile,
/* 1439 */             scroll_top		= $('#scroll-top-link'),
/* 1440 */             transparent 	= header.is('.av_header_transparency'),
/* 1441 */             shrinking		= header.is('.av_header_shrinking'),
/* 1442 */             set_height      = function()
/* 1443 */             {	
/* 1444 */                 var st = win.scrollTop(), newH = 0;
/* 1445 */ 				
/* 1446 */ 				if(shrinking && !isMobile)
/* 1447 */                 {
/* 1448 */ 	                if(st < el_height/2)
/* 1449 */ 	                {
/* 1450 */ 	                    newH = el_height - st;

/* avia.js */

/* 1451 */ 	                    
/* 1452 */ 	                    av_change_class(header, 'remove', 'header-scrolled');
/* 1453 */ 	                    //header.removeClass('header-scrolled');
/* 1454 */ 	                }
/* 1455 */ 	                else
/* 1456 */ 	                {
/* 1457 */ 	                    newH = el_height/2;
/* 1458 */ 	                    //header.addClass('header-scrolled');
/* 1459 */ 	                    av_change_class(header, 'add', 'header-scrolled');
/* 1460 */ 	                }
/* 1461 */ 	                
/* 1462 */ 	                elements.css({'height': newH + 'px', 'lineHeight': newH + 'px'});
/* 1463 */                 	logo.css({'maxHeight': newH + 'px'});
/* 1464 */                 }
/* 1465 */                 
/* 1466 */                 if(transparent)
/* 1467 */                 {	
/* 1468 */                 	if(st > 50)
/* 1469 */                 	{	
/* 1470 */                 		//header.removeClass('av_header_transparency');
/* 1471 */                 		av_change_class(header, 'remove', 'av_header_transparency');
/* 1472 */                 	}
/* 1473 */                 	else
/* 1474 */                 	{
/* 1475 */                 		//header.addClass('av_header_transparency');
/* 1476 */                 		av_change_class(header, 'add', 'av_header_transparency');
/* 1477 */                 	}
/* 1478 */                 }
/* 1479 */ 
/* 1480 */                
/* 1481 */             }
/* 1482 */ 
/* 1483 */             if($('body').is('.avia_deactivate_menu_resize')) shrinking = false;
/* 1484 */             
/* 1485 */             if(!transparent && !shrinking) return;
/* 1486 */             
/* 1487 */ 			win.on( 'debouncedresize',  function(){ el_height = $(elements).attr('style',"").filter(':first').height(); set_height(); } );
/* 1488 */             win.on( 'scroll',  function(){ window.requestAnimationFrame( set_height )} );
/* 1489 */             set_height();
/* 1490 */     }
/* 1491 */ 
/* 1492 */ 
/* 1493 */    function avia_scroll_top_fade()
/* 1494 */    {
/* 1495 */    		 var win 		= $(window),
/* 1496 */    		 	 timeo = false,
/* 1497 */    		 	 scroll_top = $('#scroll-top-link'),
/* 1498 */    		 	 set_status = function()
/* 1499 */              {
/* 1500 */              	var st = win.scrollTop();

/* avia.js */

/* 1501 */ 
/* 1502 */              	if(st < 500)
/* 1503 */              	{
/* 1504 */              		scroll_top.removeClass('avia_pop_class');
/* 1505 */              	}
/* 1506 */              	else if(!scroll_top.is('.avia_pop_class'))
/* 1507 */              	{
/* 1508 */              		scroll_top.addClass('avia_pop_class');
/* 1509 */              	}
/* 1510 */              };
/* 1511 */ 
/* 1512 */    		 win.on( 'scroll',  function(){ window.requestAnimationFrame( set_status )} );
/* 1513 */          set_status();
/* 1514 */ 	}
/* 1515 */ 
/* 1516 */ 
/* 1517 */ 
/* 1518 */ 
/* 1519 */ 	$.AviaAjaxSearch  =  function(options)
/* 1520 */ 	{
/* 1521 */ 	   var defaults = {
/* 1522 */             delay: 300,                //delay in ms until the user stops typing.
/* 1523 */             minChars: 3,               //dont start searching before we got at least that much characters
/* 1524 */             scope: 'body'
/* 1525 */ 
/* 1526 */         }
/* 1527 */ 
/* 1528 */         this.options = $.extend({}, defaults, options);
/* 1529 */         this.scope   = $(this.options.scope);
/* 1530 */         this.timer   = false;
/* 1531 */         this.lastVal = "";
/* 1532 */ 		
/* 1533 */         this.bind_events();
/* 1534 */ 	}
/* 1535 */ 
/* 1536 */ 
/* 1537 */ 	$.AviaAjaxSearch.prototype =
/* 1538 */     {
/* 1539 */         bind_events: function()
/* 1540 */         {
/* 1541 */             this.scope.on('keyup', '#s:not(".av_disable_ajax_search #s")' , $.proxy( this.try_search, this));
/* 1542 */         },
/* 1543 */ 
/* 1544 */         try_search: function(e)
/* 1545 */         {
/* 1546 */             clearTimeout(this.timer);
/* 1547 */ 
/* 1548 */             //only execute search if chars are at least "minChars" and search differs from last one
/* 1549 */             if(e.currentTarget.value.length >= this.options.minChars && this.lastVal != $.trim(e.currentTarget.value))
/* 1550 */             {

/* avia.js */

/* 1551 */                 //wait at least "delay" miliseconds to execute ajax. if user types again during that time dont execute
/* 1552 */                 this.timer = setTimeout($.proxy( this.do_search, this, e), this.options.delay);
/* 1553 */             }
/* 1554 */         },
/* 1555 */ 
/* 1556 */         do_search: function(e)
/* 1557 */         {
/* 1558 */             var obj          = this,
/* 1559 */                 currentField = $(e.currentTarget).attr( "autocomplete", "off" ),
/* 1560 */                 form         = currentField.parents('form:eq(0)'),
/* 1561 */                 results      = form.find('.ajax_search_response'),
/* 1562 */                 loading      = $('<div class="ajax_load"><span class="ajax_load_inner"></span></div>'),
/* 1563 */                 action 		 = form.attr('action'),
/* 1564 */                 values       = form.serialize();
/* 1565 */                 values      += '&action=avia_ajax_search';
/* 1566 */ 
/* 1567 */            	//check if the form got get parameters applied and also apply them
/* 1568 */            	if(action.indexOf('?') != -1)
/* 1569 */            	{
/* 1570 */            		action  = action.split('?');
/* 1571 */            		values += "&" + action[1];
/* 1572 */            	}
/* 1573 */ 
/* 1574 */             if(!results.length) results = $('<div class="ajax_search_response"></div>').appendTo(form);
/* 1575 */ 
/* 1576 */             //return if we already hit a no result and user is still typing
/* 1577 */             if(results.find('.ajax_not_found').length && e.currentTarget.value.indexOf(this.lastVal) != -1) return;
/* 1578 */ 
/* 1579 */             this.lastVal = e.currentTarget.value;
/* 1580 */ 
/* 1581 */             $.ajax({
/* 1582 */ 				url: avia_framework_globals.ajaxurl,
/* 1583 */ 				type: "POST",
/* 1584 */ 				data:values,
/* 1585 */ 				beforeSend: function()
/* 1586 */ 				{
/* 1587 */ 					loading.insertAfter(currentField);
/* 1588 */ 				},
/* 1589 */ 				success: function(response)
/* 1590 */ 				{
/* 1591 */ 				    if(response == 0) response = "";
/* 1592 */                     results.html(response);
/* 1593 */ 				},
/* 1594 */ 				complete: function()
/* 1595 */ 				{
/* 1596 */ 				    loading.remove();
/* 1597 */ 				}
/* 1598 */ 			});
/* 1599 */         }
/* 1600 */     }

/* avia.js */

/* 1601 */ 
/* 1602 */ 
/* 1603 */ 
/* 1604 */ 
/* 1605 */ 
/* 1606 */ 
/* 1607 */ 
/* 1608 */ 
/* 1609 */ 
/* 1610 */ 
/* 1611 */ 	$.AviaTooltip  =  function(options)
/* 1612 */ 	{
/* 1613 */ 	   var defaults = {
/* 1614 */             delay: 1500,                //delay in ms until the tooltip appears
/* 1615 */             delayOut: 300,             	//delay in ms when instant showing should stop
/* 1616 */             delayHide: 0,             	//delay hiding of tooltip in ms
/* 1617 */             "class": "avia-tooltip",   	//tooltip classname for css styling and alignment
/* 1618 */             scope: "body",             	//area the tooltip should be applied to
/* 1619 */             data:  "avia-tooltip",     	//data attribute that contains the tooltip text
/* 1620 */             attach:"body",          	//either attach the tooltip to the "mouse" or to the "element" // todo: implement mouse, make sure that it doesnt overlap with screen borders
/* 1621 */             event: 'mouseenter',       	//mousenter and leave or click and leave
/* 1622 */             position:'top',             //top or bottom
/* 1623 */             extraClass:'avia-tooltip-class' //extra class that is defined by a tooltip element data attribute
/* 1624 */         }
/* 1625 */ 		
/* 1626 */         this.options = $.extend({}, defaults, options);
/* 1627 */         this.body    = $('body');
/* 1628 */         this.scope   = $(this.options.scope);
/* 1629 */         this.tooltip = $('<div class="'+this.options['class']+' avia-tt"><span class="avia-arrow-wrap"><span class="avia-arrow"></span></span></div>');
/* 1630 */         this.inner   = $('<div class="inner_tooltip"></div>').prependTo(this.tooltip);
/* 1631 */         this.open    = false;
/* 1632 */         this.timer   = false;
/* 1633 */         this.active  = false;
/* 1634 */ 		
/* 1635 */         this.bind_events();
/* 1636 */ 	}
/* 1637 */ 
/* 1638 */ 	$.AviaTooltip.openTTs = [];
/* 1639 */     $.AviaTooltip.prototype =
/* 1640 */     {
/* 1641 */         bind_events: function()
/* 1642 */         {
/* 1643 */             this.scope.on(this.options.event + ' mouseleave', '[data-'+this.options.data+']', $.proxy( this.start_countdown, this) );
/* 1644 */ 
/* 1645 */             if(this.options.event != 'click')
/* 1646 */             {
/* 1647 */                 this.scope.on('mouseleave', '[data-'+this.options.data+']', $.proxy( this.hide_tooltip, this) );
/* 1648 */             }
/* 1649 */             else
/* 1650 */             {

/* avia.js */

/* 1651 */                 this.body.on('mousedown', $.proxy( this.hide_tooltip, this) );
/* 1652 */             }
/* 1653 */         },
/* 1654 */ 
/* 1655 */         start_countdown: function(e)
/* 1656 */         {
/* 1657 */             clearTimeout(this.timer);
/* 1658 */ 
/* 1659 */             if(e.type == this.options.event)
/* 1660 */             {
/* 1661 */                 var delay = this.options.event == 'click' ? 0 : this.open ? 0 : this.options.delay;
/* 1662 */ 
/* 1663 */                 this.timer = setTimeout($.proxy( this.display_tooltip, this, e), delay);
/* 1664 */             }
/* 1665 */             else if(e.type == 'mouseleave')
/* 1666 */             {
/* 1667 */                 this.timer = setTimeout($.proxy( this.stop_instant_open, this, e), this.options.delayOut);
/* 1668 */             }
/* 1669 */             e.preventDefault();
/* 1670 */         },
/* 1671 */ 
/* 1672 */         reset_countdown: function(e)
/* 1673 */         {
/* 1674 */             clearTimeout(this.timer);
/* 1675 */             this.timer = false;
/* 1676 */         },
/* 1677 */ 
/* 1678 */         display_tooltip: function(e)
/* 1679 */         {
/* 1680 */             var target 		= this.options.event == "click" ? e.target : e.currentTarget,
/* 1681 */             	element 	= $(target),
/* 1682 */                 text    	= element.data(this.options.data),
/* 1683 */                 newTip  	= element.data('avia-created-tooltip'),
/* 1684 */             	extraClass 	= element.data('avia-tooltip-class'),
/* 1685 */                 attach  	= this.options.attach == 'element' ? element : this.body,
/* 1686 */                 offset  	= this.options.attach == 'element' ? element.position() : element.offset(),
/* 1687 */                 position	= element.data('avia-tooltip-position'),
/* 1688 */                 align		= element.data('avia-tooltip-alignment');
/* 1689 */             
/* 1690 */             text = $.trim(text);
/* 1691 */              
/* 1692 */ 			if(text == "") return;
/* 1693 */ 			if(position == "" || typeof position == 'undefined') position = this.options.position;
/* 1694 */ 			if(align == "" || typeof align == 'undefined') align = 'center';
/* 1695 */ 			
/* 1696 */ 			if(typeof newTip != 'undefined')
/* 1697 */ 			{
/* 1698 */ 				newTip = $.AviaTooltip.openTTs[newTip]
/* 1699 */ 			}
/* 1700 */ 			else

/* avia.js */

/* 1701 */ 			{
/* 1702 */ 				
/* 1703 */ 				this.inner.html(text); 
/* 1704 */ 				
/* 1705 */                 newTip = this.options.attach == 'element' ? this.tooltip.clone().insertAfter(attach) : this.tooltip.clone().appendTo(attach);
/* 1706 */                 if(extraClass != "") newTip.addClass(extraClass);
/* 1707 */ 			}
/* 1708 */ 			
/* 1709 */             this.open = true;
/* 1710 */             this.active = newTip;
/* 1711 */ 
/* 1712 */             if((newTip.is(':animated:visible') && e.type == 'click') || element.is('.'+this.options['class']) || element.parents('.'+this.options['class']).length != 0) return;
/* 1713 */ 
/* 1714 */ 
/* 1715 */             var animate1 = {}, animate2	= {}, pos1 = "", pos2 = "";
/* 1716 */ 			
/* 1717 */ 			if(position == "top" || position == "bottom")
/* 1718 */ 			{
/* 1719 */ 				switch(align)
/* 1720 */ 				{
/* 1721 */ 					case "left": pos2 = offset.left; break;
/* 1722 */ 					case "right": pos2 = offset.left + element.outerWidth() - newTip.outerWidth();  break;
/* 1723 */ 					default: pos2 = (offset.left + (element.outerWidth() / 2)) - (newTip.outerWidth() / 2); break;
/* 1724 */ 				}	
/* 1725 */ 			}
/* 1726 */ 			else
/* 1727 */ 			{
/* 1728 */ 				switch(align)
/* 1729 */ 				{
/* 1730 */ 					case "top": pos1 = offset.top; break;
/* 1731 */ 					case "bottom": pos1 = offset.top + element.outerHeight() - newTip.outerHeight();  break;
/* 1732 */ 					default: pos1 = (offset.top + (element.outerHeight() / 2)) - (newTip.outerHeight() / 2); break;
/* 1733 */ 				}	
/* 1734 */ 			}
/* 1735 */ 	
/* 1736 */ 			switch(position)
/* 1737 */ 			{
/* 1738 */ 				case "top": 
/* 1739 */ 				pos1 = offset.top - newTip.outerHeight();
/* 1740 */                 animate1 = {top: pos1 - 10, left: pos2};
/* 1741 */                 animate2 = {top: pos1};
/* 1742 */ 				break;
/* 1743 */ 				case "bottom": 	
/* 1744 */ 				pos1 = offset.top + element.outerHeight();
/* 1745 */ 				animate1 = {top: pos1 + 10, left: pos2};
/* 1746 */ 				animate2 = {top: pos1};
/* 1747 */ 				break;
/* 1748 */ 				case "left": 
/* 1749 */ 				pos2 = offset.left  - newTip.outerWidth();
/* 1750 */ 				animate1 = {top: pos1, left: pos2 -10};

/* avia.js */

/* 1751 */             	animate2 = {left: pos2};	
/* 1752 */ 				break;
/* 1753 */ 				case "right": 	
/* 1754 */ 				pos2 = offset.left + element.outerWidth();
/* 1755 */ 				animate1 = {top: pos1, left: pos2 + 10};
/* 1756 */             	animate2 = {left: pos2};	
/* 1757 */ 				break;
/* 1758 */ 			}
/* 1759 */ 			
/* 1760 */ 			animate1['display'] = "block";
/* 1761 */ 			animate1['opacity'] = 0;
/* 1762 */ 			animate2['opacity'] = 1;
/* 1763 */ 			
/* 1764 */ 
/* 1765 */             newTip.css(animate1).stop().animate(animate2,200);
/* 1766 */             newTip.find('input, textarea').focus();
/* 1767 */             $.AviaTooltip.openTTs.push(newTip);
/* 1768 */             element.data('avia-created-tooltip', $.AviaTooltip.openTTs.length - 1);
/* 1769 */ 
/* 1770 */         },
/* 1771 */ 
/* 1772 */         hide_tooltip: function(e)
/* 1773 */         {
/* 1774 */             var element 	= $(e.currentTarget) , newTip, animateTo, 
/* 1775 */             	position	= element.data('avia-tooltip-position'),
/* 1776 */                 align		= element.data('avia-tooltip-alignment');
/* 1777 */                 
/* 1778 */             if(position == "" || typeof position == 'undefined') position = this.options.position;
/* 1779 */ 			if(align == "" || typeof align == 'undefined') align = 'center';
/* 1780 */ 
/* 1781 */             if(this.options.event == 'click')
/* 1782 */             {
/* 1783 */                 element = $(e.target);
/* 1784 */ 
/* 1785 */                 if(!element.is('.'+this.options['class']) && element.parents('.'+this.options['class']).length == 0)
/* 1786 */                 {
/* 1787 */                     if(this.active.length) { newTip = this.active; this.active = false;}
/* 1788 */                 }
/* 1789 */             }
/* 1790 */             else
/* 1791 */             {
/* 1792 */                 newTip = element.data('avia-created-tooltip');
/* 1793 */                 newTip = typeof newTip != 'undefined' ? $.AviaTooltip.openTTs[newTip] : false;
/* 1794 */             }
/* 1795 */ 
/* 1796 */             if(newTip)
/* 1797 */             {
/* 1798 */             	var animate = {opacity:0};
/* 1799 */             	
/* 1800 */             	switch(position)

/* avia.js */

/* 1801 */             	{
/* 1802 */             		case "top": 	
/* 1803 */ 						animate['top'] = parseInt(newTip.css('top'),10) - 10;	
/* 1804 */ 					break;
/* 1805 */ 					case "bottom": 	
/* 1806 */ 						animate['top'] = parseInt(newTip.css('top'),10) + 10;	
/* 1807 */ 					break;
/* 1808 */ 					case "left": 	
/* 1809 */ 						animate['left'] = parseInt(newTip.css('left'), 10) - 10;
/* 1810 */ 					break;
/* 1811 */ 					case "right": 	
/* 1812 */ 						animate['left'] = parseInt(newTip.css('left'), 10) + 10;
/* 1813 */ 					break;
/* 1814 */             	}
/* 1815 */             	
/* 1816 */                 newTip.animate(animate, 200, function()
/* 1817 */                 {
/* 1818 */                     newTip.css({display:'none'});
/* 1819 */                 });
/* 1820 */             }
/* 1821 */         },
/* 1822 */ 
/* 1823 */         stop_instant_open: function(e)
/* 1824 */         {
/* 1825 */             this.open = false;
/* 1826 */         }
/* 1827 */     }
/* 1828 */ 
/* 1829 */ 
/* 1830 */ })( jQuery );
/* 1831 */ 
/* 1832 */ 
/* 1833 */ 
/* 1834 */ 
/* 1835 */ /*!
/* 1836 *|  * Isotope PACKAGED v2.0.0
/* 1837 *|  * Filter & sort magical layouts
/* 1838 *|  * http://isotope.metafizzy.co
/* 1839 *|  */
/* 1840 */ 
/* 1841 */ (function(t){function e(){}function i(t){function i(e){e.prototype.option||(e.prototype.option=function(e){t.isPlainObject(e)&&(this.options=t.extend(!0,this.options,e))})}function n(e,i){t.fn[e]=function(n){if("string"==typeof n){for(var s=o.call(arguments,1),a=0,u=this.length;u>a;a++){var p=this[a],h=t.data(p,e);if(h)if(t.isFunction(h[n])&&"_"!==n.charAt(0)){var f=h[n].apply(h,s);if(void 0!==f)return f}else r("no such method '"+n+"' for "+e+" instance");else r("cannot call methods on "+e+" prior to initialization; "+"attempted to call '"+n+"'")}return this}return this.each(function(){var o=t.data(this,e);o?(o.option(n),o._init()):(o=new i(this,n),t.data(this,e,o))})}}if(t){var r="undefined"==typeof console?e:function(t){console.error(t)};return t.bridget=function(t,e){i(e),n(t,e)},t.bridget}}var o=Array.prototype.slice;"function"==typeof define&&define.amd?define("jquery-bridget/jquery.bridget",["jquery"],i):i(t.jQuery)})(window),function(t){function e(e){var i=t.event;return i.target=i.target||i.srcElement||e,i}var i=document.documentElement,o=function(){};i.addEventListener?o=function(t,e,i){t.addEventListener(e,i,!1)}:i.attachEvent&&(o=function(t,i,o){t[i+o]=o.handleEvent?function(){var i=e(t);o.handleEvent.call(o,i)}:function(){var i=e(t);o.call(t,i)},t.attachEvent("on"+i,t[i+o])});var n=function(){};i.removeEventListener?n=function(t,e,i){t.removeEventListener(e,i,!1)}:i.detachEvent&&(n=function(t,e,i){t.detachEvent("on"+e,t[e+i]);try{delete t[e+i]}catch(o){t[e+i]=void 0}});var r={bind:o,unbind:n};"function"==typeof define&&define.amd?define("eventie/eventie",r):"object"==typeof exports?module.exports=r:t.eventie=r}(this),function(t){function e(t){"function"==typeof t&&(e.isReady?t():r.push(t))}function i(t){var i="readystatechange"===t.type&&"complete"!==n.readyState;if(!e.isReady&&!i){e.isReady=!0;for(var o=0,s=r.length;s>o;o++){var a=r[o];a()}}}function o(o){return o.bind(n,"DOMContentLoaded",i),o.bind(n,"readystatechange",i),o.bind(t,"load",i),e}var n=t.document,r=[];e.isReady=!1,"function"==typeof define&&define.amd?(e.isReady="function"==typeof requirejs,define("doc-ready/doc-ready",["eventie/eventie"],o)):t.docReady=o(t.eventie)}(this),function(){function t(){}function e(t,e){for(var i=t.length;i--;)if(t[i].listener===e)return i;return-1}function i(t){return function(){return this[t].apply(this,arguments)}}var o=t.prototype,n=this,r=n.EventEmitter;o.getListeners=function(t){var e,i,o=this._getEvents();if(t instanceof RegExp){e={};for(i in o)o.hasOwnProperty(i)&&t.test(i)&&(e[i]=o[i])}else e=o[t]||(o[t]=[]);return e},o.flattenListeners=function(t){var e,i=[];for(e=0;t.length>e;e+=1)i.push(t[e].listener);return i},o.getListenersAsObject=function(t){var e,i=this.getListeners(t);return i instanceof Array&&(e={},e[t]=i),e||i},o.addListener=function(t,i){var o,n=this.getListenersAsObject(t),r="object"==typeof i;for(o in n)n.hasOwnProperty(o)&&-1===e(n[o],i)&&n[o].push(r?i:{listener:i,once:!1});return this},o.on=i("addListener"),o.addOnceListener=function(t,e){return this.addListener(t,{listener:e,once:!0})},o.once=i("addOnceListener"),o.defineEvent=function(t){return this.getListeners(t),this},o.defineEvents=function(t){for(var e=0;t.length>e;e+=1)this.defineEvent(t[e]);return this},o.removeListener=function(t,i){var o,n,r=this.getListenersAsObject(t);for(n in r)r.hasOwnProperty(n)&&(o=e(r[n],i),-1!==o&&r[n].splice(o,1));return this},o.off=i("removeListener"),o.addListeners=function(t,e){return this.manipulateListeners(!1,t,e)},o.removeListeners=function(t,e){return this.manipulateListeners(!0,t,e)},o.manipulateListeners=function(t,e,i){var o,n,r=t?this.removeListener:this.addListener,s=t?this.removeListeners:this.addListeners;if("object"!=typeof e||e instanceof RegExp)for(o=i.length;o--;)r.call(this,e,i[o]);else for(o in e)e.hasOwnProperty(o)&&(n=e[o])&&("function"==typeof n?r.call(this,o,n):s.call(this,o,n));return this},o.removeEvent=function(t){var e,i=typeof t,o=this._getEvents();if("string"===i)delete o[t];else if(t instanceof RegExp)for(e in o)o.hasOwnProperty(e)&&t.test(e)&&delete o[e];else delete this._events;return this},o.removeAllListeners=i("removeEvent"),o.emitEvent=function(t,e){var i,o,n,r,s=this.getListenersAsObject(t);for(n in s)if(s.hasOwnProperty(n))for(o=s[n].length;o--;)i=s[n][o],i.once===!0&&this.removeListener(t,i.listener),r=i.listener.apply(this,e||[]),r===this._getOnceReturnValue()&&this.removeListener(t,i.listener);return this},o.trigger=i("emitEvent"),o.emit=function(t){var e=Array.prototype.slice.call(arguments,1);return this.emitEvent(t,e)},o.setOnceReturnValue=function(t){return this._onceReturnValue=t,this},o._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},o._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return n.EventEmitter=r,t},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return t}):"object"==typeof module&&module.exports?module.exports=t:this.EventEmitter=t}.call(this),function(t){function e(t){if(t){if("string"==typeof o[t])return t;t=t.charAt(0).toUpperCase()+t.slice(1);for(var e,n=0,r=i.length;r>n;n++)if(e=i[n]+t,"string"==typeof o[e])return e}}var i="Webkit Moz ms Ms O".split(" "),o=document.documentElement.style;"function"==typeof define&&define.amd?define("get-style-property/get-style-property",[],function(){return e}):"object"==typeof exports?module.exports=e:t.getStyleProperty=e}(window),function(t){function e(t){var e=parseFloat(t),i=-1===t.indexOf("%")&&!isNaN(e);return i&&e}function i(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0,i=s.length;i>e;e++){var o=s[e];t[o]=0}return t}function o(t){function o(t){if("string"==typeof t&&(t=document.querySelector(t)),t&&"object"==typeof t&&t.nodeType){var o=r(t);if("none"===o.display)return i();var n={};n.width=t.offsetWidth,n.height=t.offsetHeight;for(var h=n.isBorderBox=!(!p||!o[p]||"border-box"!==o[p]),f=0,c=s.length;c>f;f++){var d=s[f],l=o[d];l=a(t,l);var y=parseFloat(l);n[d]=isNaN(y)?0:y}var m=n.paddingLeft+n.paddingRight,g=n.paddingTop+n.paddingBottom,v=n.marginLeft+n.marginRight,_=n.marginTop+n.marginBottom,I=n.borderLeftWidth+n.borderRightWidth,L=n.borderTopWidth+n.borderBottomWidth,z=h&&u,S=e(o.width);S!==!1&&(n.width=S+(z?0:m+I));var b=e(o.height);return b!==!1&&(n.height=b+(z?0:g+L)),n.innerWidth=n.width-(m+I),n.innerHeight=n.height-(g+L),n.outerWidth=n.width+v,n.outerHeight=n.height+_,n}}function a(t,e){if(n||-1===e.indexOf("%"))return e;var i=t.style,o=i.left,r=t.runtimeStyle,s=r&&r.left;return s&&(r.left=t.currentStyle.left),i.left=e,e=i.pixelLeft,i.left=o,s&&(r.left=s),e}var u,p=t("boxSizing");return function(){if(p){var t=document.createElement("div");t.style.width="200px",t.style.padding="1px 2px 3px 4px",t.style.borderStyle="solid",t.style.borderWidth="1px 2px 3px 4px",t.style[p]="border-box";var i=document.body||document.documentElement;i.appendChild(t);var o=r(t);u=200===e(o.width),i.removeChild(t)}}(),o}var n=t.getComputedStyle,r=n?function(t){return n(t,null)}:function(t){return t.currentStyle},s=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"];"function"==typeof define&&define.amd?define("get-size/get-size",["get-style-property/get-style-property"],o):"object"==typeof exports?module.exports=o(require("get-style-property")):t.getSize=o(t.getStyleProperty)}(window),function(t,e){function i(t,e){return t[a](e)}function o(t){if(!t.parentNode){var e=document.createDocumentFragment();e.appendChild(t)}}function n(t,e){o(t);for(var i=t.parentNode.querySelectorAll(e),n=0,r=i.length;r>n;n++)if(i[n]===t)return!0;return!1}function r(t,e){return o(t),i(t,e)}var s,a=function(){if(e.matchesSelector)return"matchesSelector";for(var t=["webkit","moz","ms","o"],i=0,o=t.length;o>i;i++){var n=t[i],r=n+"MatchesSelector";if(e[r])return r}}();if(a){var u=document.createElement("div"),p=i(u,"div");s=p?i:r}else s=n;"function"==typeof define&&define.amd?define("matches-selector/matches-selector",[],function(){return s}):window.matchesSelector=s}(this,Element.prototype),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t){for(var e in t)return!1;return e=null,!0}function o(t){return t.replace(/([A-Z])/g,function(t){return"-"+t.toLowerCase()})}function n(t,n,r){function a(t,e){t&&(this.element=t,this.layout=e,this.position={x:0,y:0},this._create())}var u=r("transition"),p=r("transform"),h=u&&p,f=!!r("perspective"),c={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"}[u],d=["transform","transition","transitionDuration","transitionProperty"],l=function(){for(var t={},e=0,i=d.length;i>e;e++){var o=d[e],n=r(o);n&&n!==o&&(t[o]=n)}return t}();e(a.prototype,t.prototype),a.prototype._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}},this.css({position:"absolute"})},a.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},a.prototype.getSize=function(){this.size=n(this.element)},a.prototype.css=function(t){var e=this.element.style;for(var i in t){var o=l[i]||i;e[o]=t[i]}},a.prototype.getPosition=function(){var t=s(this.element),e=this.layout.options,i=e.isOriginLeft,o=e.isOriginTop,n=parseInt(t[i?"left":"right"],10),r=parseInt(t[o?"top":"bottom"],10);n=isNaN(n)?0:n,r=isNaN(r)?0:r;var a=this.layout.size;n-=i?a.paddingLeft:a.paddingRight,r-=o?a.paddingTop:a.paddingBottom,this.position.x=n,this.position.y=r},a.prototype.layoutPosition=function(){var t=this.layout.size,e=this.layout.options,i={};e.isOriginLeft?(i.left=this.position.x+t.paddingLeft+"px",i.right=""):(i.right=this.position.x+t.paddingRight+"px",i.left=""),e.isOriginTop?(i.top=this.position.y+t.paddingTop+"px",i.bottom=""):(i.bottom=this.position.y+t.paddingBottom+"px",i.top=""),this.css(i),this.emitEvent("layout",[this])};var y=f?function(t,e){return"translate3d("+t+"px, "+e+"px, 0)"}:function(t,e){return"translate("+t+"px, "+e+"px)"};a.prototype._transitionTo=function(t,e){this.getPosition();var i=this.position.x,o=this.position.y,n=parseInt(t,10),r=parseInt(e,10),s=n===this.position.x&&r===this.position.y;if(this.setPosition(t,e),s&&!this.isTransitioning)return this.layoutPosition(),void 0;var a=t-i,u=e-o,p={},h=this.layout.options;a=h.isOriginLeft?a:-a,u=h.isOriginTop?u:-u,p.transform=y(a,u),this.transition({to:p,onTransitionEnd:{transform:this.layoutPosition},isCleaning:!0})},a.prototype.goTo=function(t,e){this.setPosition(t,e),this.layoutPosition()},a.prototype.moveTo=h?a.prototype._transitionTo:a.prototype.goTo,a.prototype.setPosition=function(t,e){this.position.x=parseInt(t,10),this.position.y=parseInt(e,10)},a.prototype._nonTransition=function(t){this.css(t.to),t.isCleaning&&this._removeStyles(t.to);for(var e in t.onTransitionEnd)t.onTransitionEnd[e].call(this)},a.prototype._transition=function(t){if(!parseFloat(this.layout.options.transitionDuration))return this._nonTransition(t),void 0;var e=this._transn;for(var i in t.onTransitionEnd)e.onEnd[i]=t.onTransitionEnd[i];for(i in t.to)e.ingProperties[i]=!0,t.isCleaning&&(e.clean[i]=!0);if(t.from){this.css(t.from);var o=this.element.offsetHeight;o=null}this.enableTransition(t.to),this.css(t.to),this.isTransitioning=!0};var m=p&&o(p)+",opacity";a.prototype.enableTransition=function(){this.isTransitioning||(this.css({transitionProperty:m,transitionDuration:this.layout.options.transitionDuration}),this.element.addEventListener(c,this,!1))},a.prototype.transition=a.prototype[u?"_transition":"_nonTransition"],a.prototype.onwebkitTransitionEnd=function(t){this.ontransitionend(t)},a.prototype.onotransitionend=function(t){this.ontransitionend(t)};var g={"-webkit-transform":"transform","-moz-transform":"transform","-o-transform":"transform"};a.prototype.ontransitionend=function(t){if(t.target===this.element){var e=this._transn,o=g[t.propertyName]||t.propertyName;if(delete e.ingProperties[o],i(e.ingProperties)&&this.disableTransition(),o in e.clean&&(this.element.style[t.propertyName]="",delete e.clean[o]),o in e.onEnd){var n=e.onEnd[o];n.call(this),delete e.onEnd[o]}this.emitEvent("transitionEnd",[this])}},a.prototype.disableTransition=function(){this.removeTransitionStyles(),this.element.removeEventListener(c,this,!1),this.isTransitioning=!1},a.prototype._removeStyles=function(t){var e={};for(var i in t)e[i]="";this.css(e)};var v={transitionProperty:"",transitionDuration:""};return a.prototype.removeTransitionStyles=function(){this.css(v)},a.prototype.removeElem=function(){this.element.parentNode.removeChild(this.element),this.emitEvent("remove",[this])},a.prototype.remove=function(){if(!u||!parseFloat(this.layout.options.transitionDuration))return this.removeElem(),void 0;var t=this;this.on("transitionEnd",function(){return t.removeElem(),!0}),this.hide()},a.prototype.reveal=function(){delete this.isHidden,this.css({display:""});var t=this.layout.options;this.transition({from:t.hiddenStyle,to:t.visibleStyle,isCleaning:!0})},a.prototype.hide=function(){this.isHidden=!0,this.css({display:""});var t=this.layout.options;this.transition({from:t.visibleStyle,to:t.hiddenStyle,isCleaning:!0,onTransitionEnd:{opacity:function(){this.isHidden&&this.css({display:"none"})}}})},a.prototype.destroy=function(){this.css({position:"",left:"",right:"",top:"",bottom:"",transition:"",transform:""})},a}var r=t.getComputedStyle,s=r?function(t){return r(t,null)}:function(t){return t.currentStyle};"function"==typeof define&&define.amd?define("outlayer/item",["eventEmitter/EventEmitter","get-size/get-size","get-style-property/get-style-property"],n):(t.Outlayer={},t.Outlayer.Item=n(t.EventEmitter,t.getSize,t.getStyleProperty))}(window),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t){return"[object Array]"===f.call(t)}function o(t){var e=[];if(i(t))e=t;else if(t&&"number"==typeof t.length)for(var o=0,n=t.length;n>o;o++)e.push(t[o]);else e.push(t);return e}function n(t,e){var i=d(e,t);-1!==i&&e.splice(i,1)}function r(t){return t.replace(/(.)([A-Z])/g,function(t,e,i){return e+"-"+i}).toLowerCase()}function s(i,s,f,d,l,y){function m(t,i){if("string"==typeof t&&(t=a.querySelector(t)),!t||!c(t))return u&&u.error("Bad "+this.constructor.namespace+" element: "+t),void 0;this.element=t,this.options=e({},this.constructor.defaults),this.option(i);var o=++g;this.element.outlayerGUID=o,v[o]=this,this._create(),this.options.isInitLayout&&this.layout()}var g=0,v={};return m.namespace="outlayer",m.Item=y,m.defaults={containerStyle:{position:"relative"},isInitLayout:!0,isOriginLeft:!0,isOriginTop:!0,isResizeBound:!0,isResizingContainer:!0,transitionDuration:"0.4s",hiddenStyle:{opacity:0,transform:"scale(0.001)"},visibleStyle:{opacity:1,transform:"scale(1)"}},e(m.prototype,f.prototype),m.prototype.option=function(t){e(this.options,t)},m.prototype._create=function(){this.reloadItems(),this.stamps=[],this.stamp(this.options.stamp),e(this.element.style,this.options.containerStyle),this.options.isResizeBound&&this.bindResize()},m.prototype.reloadItems=function(){this.items=this._itemize(this.element.children)},m.prototype._itemize=function(t){for(var e=this._filterFindItemElements(t),i=this.constructor.Item,o=[],n=0,r=e.length;r>n;n++){var s=e[n],a=new i(s,this);o.push(a)}return o},m.prototype._filterFindItemElements=function(t){t=o(t);for(var e=this.options.itemSelector,i=[],n=0,r=t.length;r>n;n++){var s=t[n];if(c(s))if(e){l(s,e)&&i.push(s);for(var a=s.querySelectorAll(e),u=0,p=a.length;p>u;u++)i.push(a[u])}else i.push(s)}return i},m.prototype.getItemElements=function(){for(var t=[],e=0,i=this.items.length;i>e;e++)t.push(this.items[e].element);return t},m.prototype.layout=function(){this._resetLayout(),this._manageStamps();var t=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;this.layoutItems(this.items,t),this._isLayoutInited=!0},m.prototype._init=m.prototype.layout,m.prototype._resetLayout=function(){this.getSize()},m.prototype.getSize=function(){this.size=d(this.element)},m.prototype._getMeasurement=function(t,e){var i,o=this.options[t];o?("string"==typeof o?i=this.element.querySelector(o):c(o)&&(i=o),this[t]=i?d(i)[e]:o):this[t]=0},m.prototype.layoutItems=function(t,e){t=this._getItemsForLayout(t),this._layoutItems(t,e),this._postLayout()},m.prototype._getItemsForLayout=function(t){for(var e=[],i=0,o=t.length;o>i;i++){var n=t[i];n.isIgnored||e.push(n)}return e},m.prototype._layoutItems=function(t,e){function i(){o.emitEvent("layoutComplete",[o,t])}var o=this;if(!t||!t.length)return i(),void 0;this._itemsOn(t,"layout",i);for(var n=[],r=0,s=t.length;s>r;r++){var a=t[r],u=this._getItemLayoutPosition(a);u.item=a,u.isInstant=e||a.isLayoutInstant,n.push(u)}this._processLayoutQueue(n)},m.prototype._getItemLayoutPosition=function(){return{x:0,y:0}},m.prototype._processLayoutQueue=function(t){for(var e=0,i=t.length;i>e;e++){var o=t[e];this._positionItem(o.item,o.x,o.y,o.isInstant)}},m.prototype._positionItem=function(t,e,i,o){o?t.goTo(e,i):t.moveTo(e,i)},m.prototype._postLayout=function(){this.resizeContainer()},m.prototype.resizeContainer=function(){if(this.options.isResizingContainer){var t=this._getContainerSize();t&&(this._setContainerMeasure(t.width,!0),this._setContainerMeasure(t.height,!1))}},m.prototype._getContainerSize=h,m.prototype._setContainerMeasure=function(t,e){if(void 0!==t){var i=this.size;i.isBorderBox&&(t+=e?i.paddingLeft+i.paddingRight+i.borderLeftWidth+i.borderRightWidth:i.paddingBottom+i.paddingTop+i.borderTopWidth+i.borderBottomWidth),t=Math.max(t,0),this.element.style[e?"width":"height"]=t+"px"}},m.prototype._itemsOn=function(t,e,i){function o(){return n++,n===r&&i.call(s),!0}for(var n=0,r=t.length,s=this,a=0,u=t.length;u>a;a++){var p=t[a];p.on(e,o)}},m.prototype.ignore=function(t){var e=this.getItem(t);e&&(e.isIgnored=!0)},m.prototype.unignore=function(t){var e=this.getItem(t);e&&delete e.isIgnored},m.prototype.stamp=function(t){if(t=this._find(t)){this.stamps=this.stamps.concat(t);for(var e=0,i=t.length;i>e;e++){var o=t[e];this.ignore(o)}}},m.prototype.unstamp=function(t){if(t=this._find(t))for(var e=0,i=t.length;i>e;e++){var o=t[e];n(o,this.stamps),this.unignore(o)}},m.prototype._find=function(t){return t?("string"==typeof t&&(t=this.element.querySelectorAll(t)),t=o(t)):void 0},m.prototype._manageStamps=function(){if(this.stamps&&this.stamps.length){this._getBoundingRect();for(var t=0,e=this.stamps.length;e>t;t++){var i=this.stamps[t];this._manageStamp(i)}}},m.prototype._getBoundingRect=function(){var t=this.element.getBoundingClientRect(),e=this.size;this._boundingRect={left:t.left+e.paddingLeft+e.borderLeftWidth,top:t.top+e.paddingTop+e.borderTopWidth,right:t.right-(e.paddingRight+e.borderRightWidth),bottom:t.bottom-(e.paddingBottom+e.borderBottomWidth)}},m.prototype._manageStamp=h,m.prototype._getElementOffset=function(t){var e=t.getBoundingClientRect(),i=this._boundingRect,o=d(t),n={left:e.left-i.left-o.marginLeft,top:e.top-i.top-o.marginTop,right:i.right-e.right-o.marginRight,bottom:i.bottom-e.bottom-o.marginBottom};return n},m.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},m.prototype.bindResize=function(){this.isResizeBound||(i.bind(t,"resize",this),this.isResizeBound=!0)},m.prototype.unbindResize=function(){this.isResizeBound&&i.unbind(t,"resize",this),this.isResizeBound=!1},m.prototype.onresize=function(){function t(){e.resize(),delete e.resizeTimeout}this.resizeTimeout&&clearTimeout(this.resizeTimeout);var e=this;this.resizeTimeout=setTimeout(t,100)},m.prototype.resize=function(){this.isResizeBound&&this.needsResizeLayout()&&this.layout()},m.prototype.needsResizeLayout=function(){var t=d(this.element),e=this.size&&t;return e&&t.innerWidth!==this.size.innerWidth},m.prototype.addItems=function(t){var e=this._itemize(t);return e.length&&(this.items=this.items.concat(e)),e},m.prototype.appended=function(t){var e=this.addItems(t);e.length&&(this.layoutItems(e,!0),this.reveal(e))},m.prototype.prepended=function(t){var e=this._itemize(t);if(e.length){var i=this.items.slice(0);this.items=e.concat(i),this._resetLayout(),this._manageStamps(),this.layoutItems(e,!0),this.reveal(e),this.layoutItems(i)}},m.prototype.reveal=function(t){var e=t&&t.length;if(e)for(var i=0;e>i;i++){var o=t[i];o.reveal()}},m.prototype.hide=function(t){var e=t&&t.length;if(e)for(var i=0;e>i;i++){var o=t[i];o.hide()}},m.prototype.getItem=function(t){for(var e=0,i=this.items.length;i>e;e++){var o=this.items[e];if(o.element===t)return o}},m.prototype.getItems=function(t){if(t&&t.length){for(var e=[],i=0,o=t.length;o>i;i++){var n=t[i],r=this.getItem(n);r&&e.push(r)}return e}},m.prototype.remove=function(t){t=o(t);var e=this.getItems(t);if(e&&e.length){this._itemsOn(e,"remove",function(){this.emitEvent("removeComplete",[this,e])});for(var i=0,r=e.length;r>i;i++){var s=e[i];s.remove(),n(s,this.items)}}},m.prototype.destroy=function(){var t=this.element.style;t.height="",t.position="",t.width="";for(var e=0,i=this.items.length;i>e;e++){var o=this.items[e];o.destroy()}this.unbindResize(),delete this.element.outlayerGUID,p&&p.removeData(this.element,this.constructor.namespace)},m.data=function(t){var e=t&&t.outlayerGUID;return e&&v[e]},m.create=function(t,i){function o(){m.apply(this,arguments)}return Object.create?o.prototype=Object.create(m.prototype):e(o.prototype,m.prototype),o.prototype.constructor=o,o.defaults=e({},m.defaults),e(o.defaults,i),o.prototype.settings={},o.namespace=t,o.data=m.data,o.Item=function(){y.apply(this,arguments)},o.Item.prototype=new y,s(function(){for(var e=r(t),i=a.querySelectorAll(".js-"+e),n="data-"+e+"-options",s=0,h=i.length;h>s;s++){var f,c=i[s],d=c.getAttribute(n);try{f=d&&JSON.parse(d)}catch(l){u&&u.error("Error parsing "+n+" on "+c.nodeName.toLowerCase()+(c.id?"#"+c.id:"")+": "+l);continue}var y=new o(c,f);p&&p.data(c,t,y)}}),p&&p.bridget&&p.bridget(t,o),o},m.Item=y,m}var a=t.document,u=t.console,p=t.jQuery,h=function(){},f=Object.prototype.toString,c="object"==typeof HTMLElement?function(t){return t instanceof HTMLElement}:function(t){return t&&"object"==typeof t&&1===t.nodeType&&"string"==typeof t.nodeName},d=Array.prototype.indexOf?function(t,e){return t.indexOf(e)}:function(t,e){for(var i=0,o=t.length;o>i;i++)if(t[i]===e)return i;return-1};"function"==typeof define&&define.amd?define("outlayer/outlayer",["eventie/eventie","doc-ready/doc-ready","eventEmitter/EventEmitter","get-size/get-size","matches-selector/matches-selector","./item"],s):t.Outlayer=s(t.eventie,t.docReady,t.EventEmitter,t.getSize,t.matchesSelector,t.Outlayer.Item)}(window),function(t){function e(t){function e(){t.Item.apply(this,arguments)}return e.prototype=new t.Item,e.prototype._create=function(){this.id=this.layout.itemGUID++,t.Item.prototype._create.call(this),this.sortData={}},e.prototype.updateSortData=function(){if(!this.isIgnored){this.sortData.id=this.id,this.sortData["original-order"]=this.id,this.sortData.random=Math.random();var t=this.layout.options.getSortData,e=this.layout._sorters;for(var i in t){var o=e[i];this.sortData[i]=o(this.element,this)}}},e}"function"==typeof define&&define.amd?define("isotope/js/item",["outlayer/outlayer"],e):(t.Isotope=t.Isotope||{},t.Isotope.Item=e(t.Outlayer))}(window),function(t){function e(t,e){function i(t){this.isotope=t,t&&(this.options=t.options[this.namespace],this.element=t.element,this.items=t.filteredItems,this.size=t.size)}return function(){function t(t){return function(){return e.prototype[t].apply(this.isotope,arguments)}}for(var o=["_resetLayout","_getItemLayoutPosition","_manageStamp","_getContainerSize","_getElementOffset","needsResizeLayout"],n=0,r=o.length;r>n;n++){var s=o[n];i.prototype[s]=t(s)}}(),i.prototype.needsVerticalResizeLayout=function(){var e=t(this.isotope.element),i=this.isotope.size&&e;return i&&e.innerHeight!==this.isotope.size.innerHeight},i.prototype._getMeasurement=function(){this.isotope._getMeasurement.apply(this,arguments)},i.prototype.getColumnWidth=function(){this.getSegmentSize("column","Width")},i.prototype.getRowHeight=function(){this.getSegmentSize("row","Height")},i.prototype.getSegmentSize=function(t,e){var i=t+e,o="outer"+e;if(this._getMeasurement(i,o),!this[i]){var n=this.getFirstItemSize();this[i]=n&&n[o]||this.isotope.size["inner"+e]}},i.prototype.getFirstItemSize=function(){var e=this.isotope.filteredItems[0];return e&&e.element&&t(e.element)},i.prototype.layout=function(){this.isotope.layout.apply(this.isotope,arguments)},i.prototype.getSize=function(){this.isotope.getSize(),this.size=this.isotope.size},i.modes={},i.create=function(t,e){function o(){i.apply(this,arguments)}return o.prototype=new i,e&&(o.options=e),o.prototype.namespace=t,i.modes[t]=o,o},i}"function"==typeof define&&define.amd?define("isotope/js/layout-mode",["get-size/get-size","outlayer/outlayer"],e):(t.Isotope=t.Isotope||{},t.Isotope.LayoutMode=e(t.getSize,t.Outlayer))}(window),function(t){function e(t,e){var o=t.create("masonry");return o.prototype._resetLayout=function(){this.getSize(),this._getMeasurement("columnWidth","outerWidth"),this._getMeasurement("gutter","outerWidth"),this.measureColumns();var t=this.cols;for(this.colYs=[];t--;)this.colYs.push(0);this.maxY=0},o.prototype.measureColumns=function(){if(this.getContainerWidth(),!this.columnWidth){var t=this.items[0],i=t&&t.element;this.columnWidth=i&&e(i).outerWidth||this.containerWidth}this.columnWidth+=this.gutter,this.cols=Math.floor((this.containerWidth+this.gutter)/this.columnWidth),this.cols=Math.max(this.cols,1)},o.prototype.getContainerWidth=function(){var t=this.options.isFitWidth?this.element.parentNode:this.element,i=e(t);this.containerWidth=i&&i.innerWidth},o.prototype._getItemLayoutPosition=function(t){t.getSize();var e=t.size.outerWidth%this.columnWidth,o=e&&1>e?"round":"ceil",n=Math[o](t.size.outerWidth/this.columnWidth);n=Math.min(n,this.cols);for(var r=this._getColGroup(n),s=Math.min.apply(Math,r),a=i(r,s),u={x:this.columnWidth*a,y:s},p=s+t.size.outerHeight,h=this.cols+1-r.length,f=0;h>f;f++)this.colYs[a+f]=p;return u},o.prototype._getColGroup=function(t){if(2>t)return this.colYs;for(var e=[],i=this.cols+1-t,o=0;i>o;o++){var n=this.colYs.slice(o,o+t);e[o]=Math.max.apply(Math,n)}return e},o.prototype._manageStamp=function(t){var i=e(t),o=this._getElementOffset(t),n=this.options.isOriginLeft?o.left:o.right,r=n+i.outerWidth,s=Math.floor(n/this.columnWidth);s=Math.max(0,s);var a=Math.floor(r/this.columnWidth);a-=r%this.columnWidth?0:1,a=Math.min(this.cols-1,a);for(var u=(this.options.isOriginTop?o.top:o.bottom)+i.outerHeight,p=s;a>=p;p++)this.colYs[p]=Math.max(u,this.colYs[p])},o.prototype._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var t={height:this.maxY};return this.options.isFitWidth&&(t.width=this._getContainerFitWidth()),t},o.prototype._getContainerFitWidth=function(){for(var t=0,e=this.cols;--e&&0===this.colYs[e];)t++;return(this.cols-t)*this.columnWidth-this.gutter},o.prototype.needsResizeLayout=function(){var t=this.containerWidth;return this.getContainerWidth(),t!==this.containerWidth},o}var i=Array.prototype.indexOf?function(t,e){return t.indexOf(e)}:function(t,e){for(var i=0,o=t.length;o>i;i++){var n=t[i];if(n===e)return i}return-1};"function"==typeof define&&define.amd?define("masonry/masonry",["outlayer/outlayer","get-size/get-size"],e):t.Masonry=e(t.Outlayer,t.getSize)}(window),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t,i){var o=t.create("masonry"),n=o.prototype._getElementOffset,r=o.prototype.layout,s=o.prototype._getMeasurement;e(o.prototype,i.prototype),o.prototype._getElementOffset=n,o.prototype.layout=r,o.prototype._getMeasurement=s;var a=o.prototype.measureColumns;o.prototype.measureColumns=function(){this.items=this.isotope.filteredItems,a.call(this)};var u=o.prototype._manageStamp;return o.prototype._manageStamp=function(){this.options.isOriginLeft=this.isotope.options.isOriginLeft,this.options.isOriginTop=this.isotope.options.isOriginTop,u.apply(this,arguments)},o}"function"==typeof define&&define.amd?define("isotope/js/layout-modes/masonry",["../layout-mode","masonry/masonry"],i):i(t.Isotope.LayoutMode,t.Masonry)}(window),function(t){function e(t){var e=t.create("fitRows");return e.prototype._resetLayout=function(){this.x=0,this.y=0,this.maxY=0},e.prototype._getItemLayoutPosition=function(t){t.getSize(),0!==this.x&&t.size.outerWidth+this.x>this.isotope.size.innerWidth&&(this.x=0,this.y=this.maxY);var e={x:this.x,y:this.y};return this.maxY=Math.max(this.maxY,this.y+t.size.outerHeight),this.x+=t.size.outerWidth,e},e.prototype._getContainerSize=function(){return{height:this.maxY}},e}"function"==typeof define&&define.amd?define("isotope/js/layout-modes/fit-rows",["../layout-mode"],e):e(t.Isotope.LayoutMode)}(window),function(t){function e(t){var e=t.create("vertical",{horizontalAlignment:0});return e.prototype._resetLayout=function(){this.y=0},e.prototype._getItemLayoutPosition=function(t){t.getSize();var e=(this.isotope.size.innerWidth-t.size.outerWidth)*this.options.horizontalAlignment,i=this.y;return this.y+=t.size.outerHeight,{x:e,y:i}},e.prototype._getContainerSize=function(){return{height:this.y}},e}"function"==typeof define&&define.amd?define("isotope/js/layout-modes/vertical",["../layout-mode"],e):e(t.Isotope.LayoutMode)}(window),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t){return"[object Array]"===h.call(t)}function o(t){var e=[];if(i(t))e=t;else if(t&&"number"==typeof t.length)for(var o=0,n=t.length;n>o;o++)e.push(t[o]);else e.push(t);return e}function n(t,e){var i=f(e,t);-1!==i&&e.splice(i,1)}function r(t,i,r,u,h){function f(t,e){return function(i,o){for(var n=0,r=t.length;r>n;n++){var s=t[n],a=i.sortData[s],u=o.sortData[s];if(a>u||u>a){var p=void 0!==e[s]?e[s]:e,h=p?1:-1;return(a>u?1:-1)*h}}return 0}}var c=t.create("isotope",{layoutMode:"masonry",isJQueryFiltering:!0,sortAscending:!0});c.Item=u,c.LayoutMode=h,c.prototype._create=function(){this.itemGUID=0,this._sorters={},this._getSorters(),t.prototype._create.call(this),this.modes={},this.filteredItems=this.items,this.sortHistory=["original-order"];for(var e in h.modes)this._initLayoutMode(e)},c.prototype.reloadItems=function(){this.itemGUID=0,t.prototype.reloadItems.call(this)},c.prototype._itemize=function(){for(var e=t.prototype._itemize.apply(this,arguments),i=0,o=e.length;o>i;i++){var n=e[i];n.id=this.itemGUID++}return this._updateItemsSortData(e),e},c.prototype._initLayoutMode=function(t){var i=h.modes[t],o=this.options[t]||{};this.options[t]=i.options?e(i.options,o):o,this.modes[t]=new i(this)},c.prototype.layout=function(){return!this._isLayoutInited&&this.options.isInitLayout?(this.arrange(),void 0):(this._layout(),void 0)},c.prototype._layout=function(){var t=this._getIsInstant();this._resetLayout(),this._manageStamps(),this.layoutItems(this.filteredItems,t),this._isLayoutInited=!0},c.prototype.arrange=function(t){this.option(t),this._getIsInstant(),this.filteredItems=this._filter(this.items),this._sort(),this._layout()},c.prototype._init=c.prototype.arrange,c.prototype._getIsInstant=function(){var t=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;return this._isInstant=t,t},c.prototype._filter=function(t){function e(){f.reveal(n),f.hide(r)}var i=this.options.filter;i=i||"*";for(var o=[],n=[],r=[],s=this._getFilterTest(i),a=0,u=t.length;u>a;a++){var p=t[a];if(!p.isIgnored){var h=s(p);h&&o.push(p),h&&p.isHidden?n.push(p):h||p.isHidden||r.push(p)}}var f=this;return this._isInstant?this._noTransition(e):e(),o},c.prototype._getFilterTest=function(t){return s&&this.options.isJQueryFiltering?function(e){return s(e.element).is(t)}:"function"==typeof t?function(e){return t(e.element)}:function(e){return r(e.element,t)}},c.prototype.updateSortData=function(t){this._getSorters(),t=o(t);var e=this.getItems(t);e=e.length?e:this.items,this._updateItemsSortData(e)
/* 1842 */ },c.prototype._getSorters=function(){var t=this.options.getSortData;for(var e in t){var i=t[e];this._sorters[e]=d(i)}},c.prototype._updateItemsSortData=function(t){for(var e=0,i=t.length;i>e;e++){var o=t[e];o.updateSortData()}};var d=function(){function t(t){if("string"!=typeof t)return t;var i=a(t).split(" "),o=i[0],n=o.match(/^\[(.+)\]$/),r=n&&n[1],s=e(r,o),u=c.sortDataParsers[i[1]];return t=u?function(t){return t&&u(s(t))}:function(t){return t&&s(t)}}function e(t,e){var i;return i=t?function(e){return e.getAttribute(t)}:function(t){var i=t.querySelector(e);return i&&p(i)}}return t}();c.sortDataParsers={parseInt:function(t){return parseInt(t,10)},parseFloat:function(t){return parseFloat(t)}},c.prototype._sort=function(){var t=this.options.sortBy;if(t){var e=[].concat.apply(t,this.sortHistory),i=f(e,this.options.sortAscending);this.filteredItems.sort(i),t!==this.sortHistory[0]&&this.sortHistory.unshift(t)}},c.prototype._mode=function(){var t=this.options.layoutMode,e=this.modes[t];if(!e)throw Error("No layout mode: "+t);return e.options=this.options[t],e},c.prototype._resetLayout=function(){t.prototype._resetLayout.call(this),this._mode()._resetLayout()},c.prototype._getItemLayoutPosition=function(t){return this._mode()._getItemLayoutPosition(t)},c.prototype._manageStamp=function(t){this._mode()._manageStamp(t)},c.prototype._getContainerSize=function(){return this._mode()._getContainerSize()},c.prototype.needsResizeLayout=function(){return this._mode().needsResizeLayout()},c.prototype.appended=function(t){var e=this.addItems(t);if(e.length){var i=this._filterRevealAdded(e);this.filteredItems=this.filteredItems.concat(i)}},c.prototype.prepended=function(t){var e=this._itemize(t);if(e.length){var i=this.items.slice(0);this.items=e.concat(i),this._resetLayout(),this._manageStamps();var o=this._filterRevealAdded(e);this.layoutItems(i),this.filteredItems=o.concat(this.filteredItems)}},c.prototype._filterRevealAdded=function(t){var e=this._noTransition(function(){return this._filter(t)});return this.layoutItems(e,!0),this.reveal(e),t},c.prototype.insert=function(t){var e=this.addItems(t);if(e.length){var i,o,n=e.length;for(i=0;n>i;i++)o=e[i],this.element.appendChild(o.element);var r=this._filter(e);for(this._noTransition(function(){this.hide(r)}),i=0;n>i;i++)e[i].isLayoutInstant=!0;for(this.arrange(),i=0;n>i;i++)delete e[i].isLayoutInstant;this.reveal(r)}};var l=c.prototype.remove;return c.prototype.remove=function(t){t=o(t);var e=this.getItems(t);if(l.call(this,t),e&&e.length)for(var i=0,r=e.length;r>i;i++){var s=e[i];n(s,this.filteredItems)}},c.prototype._noTransition=function(t){var e=this.options.transitionDuration;this.options.transitionDuration=0;var i=t.call(this);return this.options.transitionDuration=e,i},c}var s=t.jQuery,a=String.prototype.trim?function(t){return t.trim()}:function(t){return t.replace(/^\s+|\s+$/g,"")},u=document.documentElement,p=u.textContent?function(t){return t.textContent}:function(t){return t.innerText},h=Object.prototype.toString,f=Array.prototype.indexOf?function(t,e){return t.indexOf(e)}:function(t,e){for(var i=0,o=t.length;o>i;i++)if(t[i]===e)return i;return-1};"function"==typeof define&&define.amd?define(["outlayer/outlayer","get-size/get-size","matches-selector/matches-selector","isotope/js/item","isotope/js/layout-mode","isotope/js/layout-modes/masonry","isotope/js/layout-modes/fit-rows","isotope/js/layout-modes/vertical"],r):t.Isotope=r(t.Outlayer,t.getSize,t.matchesSelector,t.Isotope.Item,t.Isotope.LayoutMode)}(window);
/* 1843 */ 
/* 1844 */ 
/* 1845 */ /*
/* 1846 *| jQuery Waypoints - v2.0.3
/* 1847 *| Copyright (c) 2011-2013 Caleb Troughton
/* 1848 *| Dual licensed under the MIT license and GPL license.
/* 1849 *| https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
/* 1850 *| */

/* avia.js */

/* 1851 */ (function(){var t=[].indexOf||function(t){for(var e=0,n=this.length;e<n;e++){if(e in this&&this[e]===t)return e}return-1},e=[].slice;(function(t,e){if(typeof define==="function"&&define.amd){return define("waypoints",["jquery"],function(n){return e(n,t)})}else{return e(t.jQuery,t)}})(this,function(n,r){var i,o,l,s,f,u,a,c,h,d,p,y,v,w,g,m;i=n(r);c=t.call(r,"ontouchstart")>=0;s={horizontal:{},vertical:{}};f=1;a={};u="waypoints-context-id";p="resize.waypoints";y="scroll.waypoints";v=1;w="waypoints-waypoint-ids";g="waypoint";m="waypoints";o=function(){function t(t){var e=this;this.$element=t;this.element=t[0];this.didResize=false;this.didScroll=false;this.id="context"+f++;this.oldScroll={x:t.scrollLeft(),y:t.scrollTop()};this.waypoints={horizontal:{},vertical:{}};t.data(u,this.id);a[this.id]=this;t.bind(y,function(){var t;if(!(e.didScroll||c)){e.didScroll=true;t=function(){e.doScroll();return e.didScroll=false};return r.setTimeout(t,n[m].settings.scrollThrottle)}});t.bind(p,function(){var t;if(!e.didResize){e.didResize=true;t=function(){n[m]("refresh");return e.didResize=false};return r.setTimeout(t,n[m].settings.resizeThrottle)}})}t.prototype.doScroll=function(){var t,e=this;t={horizontal:{newScroll:this.$element.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.$element.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};if(c&&(!t.vertical.oldScroll||!t.vertical.newScroll)){n[m]("refresh")}n.each(t,function(t,r){var i,o,l;l=[];o=r.newScroll>r.oldScroll;i=o?r.forward:r.backward;n.each(e.waypoints[t],function(t,e){var n,i;if(r.oldScroll<(n=e.offset)&&n<=r.newScroll){return l.push(e)}else if(r.newScroll<(i=e.offset)&&i<=r.oldScroll){return l.push(e)}});l.sort(function(t,e){return t.offset-e.offset});if(!o){l.reverse()}return n.each(l,function(t,e){if(e.options.continuous||t===l.length-1){return e.trigger([i])}})});return this.oldScroll={x:t.horizontal.newScroll,y:t.vertical.newScroll}};t.prototype.refresh=function(){var t,e,r,i=this;r=n.isWindow(this.element);e=this.$element.offset();this.doScroll();t={horizontal:{contextOffset:r?0:e.left,contextScroll:r?0:this.oldScroll.x,contextDimension:this.$element.width(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:r?0:e.top,contextScroll:r?0:this.oldScroll.y,contextDimension:r?n[m]("viewportHeight"):this.$element.height(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};return n.each(t,function(t,e){return n.each(i.waypoints[t],function(t,r){var i,o,l,s,f;i=r.options.offset;l=r.offset;o=n.isWindow(r.element)?0:r.$element.offset()[e.offsetProp];if(n.isFunction(i)){i=i.apply(r.element)}else if(typeof i==="string"){i=parseFloat(i);if(r.options.offset.indexOf("%")>-1){i=Math.ceil(e.contextDimension*i/100)}}r.offset=o-e.contextOffset+e.contextScroll-i;if(r.options.onlyOnScroll&&l!=null||!r.enabled){return}if(l!==null&&l<(s=e.oldScroll)&&s<=r.offset){return r.trigger([e.backward])}else if(l!==null&&l>(f=e.oldScroll)&&f>=r.offset){return r.trigger([e.forward])}else if(l===null&&e.oldScroll>=r.offset){return r.trigger([e.forward])}})})};t.prototype.checkEmpty=function(){if(n.isEmptyObject(this.waypoints.horizontal)&&n.isEmptyObject(this.waypoints.vertical)){this.$element.unbind([p,y].join(" "));return delete a[this.id]}};return t}();l=function(){function t(t,e,r){var i,o;r=n.extend({},n.fn[g].defaults,r);if(r.offset==="bottom-in-view"){r.offset=function(){var t;t=n[m]("viewportHeight");if(!n.isWindow(e.element)){t=e.$element.height()}return t-n(this).outerHeight()}}this.$element=t;this.element=t[0];this.axis=r.horizontal?"horizontal":"vertical";this.callback=r.handler;this.context=e;this.enabled=r.enabled;this.id="waypoints"+v++;this.offset=null;this.options=r;e.waypoints[this.axis][this.id]=this;s[this.axis][this.id]=this;i=(o=t.data(w))!=null?o:[];i.push(this.id);t.data(w,i)}t.prototype.trigger=function(t){if(!this.enabled){return}if(this.callback!=null){this.callback.apply(this.element,t)}if(this.options.triggerOnce){return this.destroy()}};t.prototype.disable=function(){return this.enabled=false};t.prototype.enable=function(){this.context.refresh();return this.enabled=true};t.prototype.destroy=function(){delete s[this.axis][this.id];delete this.context.waypoints[this.axis][this.id];return this.context.checkEmpty()};t.getWaypointsByElement=function(t){var e,r;r=n(t).data(w);if(!r){return[]}e=n.extend({},s.horizontal,s.vertical);return n.map(r,function(t){return e[t]})};return t}();d={init:function(t,e){var r;if(e==null){e={}}if((r=e.handler)==null){e.handler=t}this.each(function(){var t,r,i,s;t=n(this);i=(s=e.context)!=null?s:n.fn[g].defaults.context;if(!n.isWindow(i)){i=t.closest(i)}i=n(i);r=a[i.data(u)];if(!r){r=new o(i)}return new l(t,r,e)});n[m]("refresh");return this},disable:function(){return d._invoke(this,"disable")},enable:function(){return d._invoke(this,"enable")},destroy:function(){return d._invoke(this,"destroy")},prev:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e>0){return t.push(n[e-1])}})},next:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e<n.length-1){return t.push(n[e+1])}})},_traverse:function(t,e,i){var o,l;if(t==null){t="vertical"}if(e==null){e=r}l=h.aggregate(e);o=[];this.each(function(){var e;e=n.inArray(this,l[t]);return i(o,e,l[t])});return this.pushStack(o)},_invoke:function(t,e){t.each(function(){var t;t=l.getWaypointsByElement(this);return n.each(t,function(t,n){n[e]();return true})});return this}};n.fn[g]=function(){var t,r;r=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(d[r]){return d[r].apply(this,t)}else if(n.isFunction(r)){return d.init.apply(this,arguments)}else if(n.isPlainObject(r)){return d.init.apply(this,[null,r])}else if(!r){return n.error("jQuery Waypoints needs a callback function or handler option.")}else{return n.error("The "+r+" method does not exist in jQuery Waypoints.")}};n.fn[g].defaults={context:r,continuous:true,enabled:true,horizontal:false,offset:0,triggerOnce:false};h={refresh:function(){return n.each(a,function(t,e){return e.refresh()})},viewportHeight:function(){var t;return(t=r.innerHeight)!=null?t:i.height()},aggregate:function(t){var e,r,i;e=s;if(t){e=(i=a[n(t).data(u)])!=null?i.waypoints:void 0}if(!e){return[]}r={horizontal:[],vertical:[]};n.each(r,function(t,i){n.each(e[t],function(t,e){return i.push(e)});i.sort(function(t,e){return t.offset-e.offset});r[t]=n.map(i,function(t){return t.element});return r[t]=n.unique(r[t])});return r},above:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset<=t.oldScroll.y})},below:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset>t.oldScroll.y})},left:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset<=t.oldScroll.x})},right:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset>t.oldScroll.x})},enable:function(){return h._invoke("enable")},disable:function(){return h._invoke("disable")},destroy:function(){return h._invoke("destroy")},extendFn:function(t,e){return d[t]=e},_invoke:function(t){var e;e=n.extend({},s.vertical,s.horizontal);return n.each(e,function(e,n){n[t]();return true})},_filter:function(t,e,r){var i,o;i=a[n(t).data(u)];if(!i){return[]}o=[];n.each(i.waypoints[e],function(t,e){if(r(i,e)){return o.push(e)}});o.sort(function(t,e){return t.offset-e.offset});return n.map(o,function(t){return t.element})}};n[m]=function(){var t,n;n=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(h[n]){return h[n].apply(null,t)}else{return h.aggregate.call(null,n)}};n[m].settings={resizeThrottle:100,scrollThrottle:30};return i.load(function(){return n[m]("refresh")})})}).call(this);
/* 1852 */ 
/* 1853 */ 
/* 1854 */ 
/* 1855 */ /*
/* 1856 *|  * jQuery Browser Plugin 0.0.6
/* 1857 *|  * https://github.com/gabceb/jquery-browser-plugin
/* 1858 *|  *
/* 1859 *|  * Original jquery-browser code Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
/* 1860 *|  * http://jquery.org/license
/* 1861 *|  *
/* 1862 *|  * Modifications Copyright 2014 Gabriel Cebrian
/* 1863 *|  * https://github.com/gabceb
/* 1864 *|  *
/* 1865 *|  * Released under the MIT license
/* 1866 *|  */!function(a,b){"use strict";var c,d;if(a.uaMatch=function(a){a=a.toLowerCase();var b=/(opr)[\/]([\w.]+)/.exec(a)||/(chrome)[ \/]([\w.]+)/.exec(a)||/(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("trident")>=0&&/(rv)(?::| )([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[],c=/(ipad)/.exec(a)||/(iphone)/.exec(a)||/(android)/.exec(a)||/(windows phone)/.exec(a)||/(win)/.exec(a)||/(mac)/.exec(a)||/(linux)/.exec(a)||/(cros)/i.exec(a)||[];return{browser:b[3]||b[1]||"",version:b[2]||"0",platform:c[0]||""}},c=a.uaMatch(b.navigator.userAgent),d={},c.browser&&(d[c.browser]=!0,d.version=c.version,d.versionNumber=parseInt(c.version)),c.platform&&(d[c.platform]=!0),(d.android||d.ipad||d.iphone||d["windows phone"])&&(d.mobile=!0),(d.cros||d.mac||d.linux||d.win)&&(d.desktop=!0),(d.chrome||d.opr||d.safari)&&(d.webkit=!0),d.rv){var e="msie";c.browser=e,d[e]=!0}if(d.opr){var f="opera";c.browser=f,d[f]=!0}if(d.safari&&d.android){var g="android";c.browser=g,d[g]=!0}d.name=c.browser,d.platform=c.platform,a.browser=d}(jQuery,window);
/* 1867 */  
/* 1868 */ /*Vimeo Frogaloop API for videos*/
/* 1869 */ var Froogaloop=function(){function e(a){return new e.fn.init(a)}function h(a,c,b){if(!b.contentWindow.postMessage)return!1;var f=b.getAttribute("src").split("?")[0],a=JSON.stringify({method:a,value:c});"//"===f.substr(0,2)&&(f=window.location.protocol+f);b.contentWindow.postMessage(a,f)}function j(a){var c,b;try{c=JSON.parse(a.data),b=c.event||c.method}catch(f){}"ready"==b&&!i&&(i=!0);if(a.origin!=k)return!1;var a=c.value,e=c.data,g=""===g?null:c.player_id;c=g?d[g][b]:d[b];b=[];if(!c)return!1;void 0!==
/* 1870 */ a&&b.push(a);e&&b.push(e);g&&b.push(g);return 0<b.length?c.apply(null,b):c.call()}function l(a,c,b){b?(d[b]||(d[b]={}),d[b][a]=c):d[a]=c}var d={},i=!1,k="";e.fn=e.prototype={element:null,init:function(a){"string"===typeof a&&(a=document.getElementById(a));this.element=a;a=this.element.getAttribute("src");"//"===a.substr(0,2)&&(a=window.location.protocol+a);for(var a=a.split("/"),c="",b=0,f=a.length;b<f;b++){if(3>b)c+=a[b];else break;2>b&&(c+="/")}k=c;return this},api:function(a,c){if(!this.element||
/* 1871 */ !a)return!1;var b=this.element,f=""!==b.id?b.id:null,d=!c||!c.constructor||!c.call||!c.apply?c:null,e=c&&c.constructor&&c.call&&c.apply?c:null;e&&l(a,e,f);h(a,d,b);return this},addEvent:function(a,c){if(!this.element)return!1;var b=this.element,d=""!==b.id?b.id:null;l(a,c,d);"ready"!=a?h("addEventListener",a,b):"ready"==a&&i&&c.call(null,d);return this},removeEvent:function(a){if(!this.element)return!1;var c=this.element,b;a:{if((b=""!==c.id?c.id:null)&&d[b]){if(!d[b][a]){b=!1;break a}d[b][a]=null}else{if(!d[a]){b=
/* 1872 */ !1;break a}d[a]=null}b=!0}"ready"!=a&&b&&h("removeEventListener",a,c)}};e.fn.init.prototype=e.fn;window.addEventListener?window.addEventListener("message",j,!1):window.attachEvent("onmessage",j);return window.Froogaloop=window.$f=e}();
/* 1873 */ 
/* 1874 */ 
/* 1875 */ // http://paulirish.com/2011/requestanimationframe-for-smart-animating/ + http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
/* 1876 */ // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel. can be removed if IE9 is no longer supported or all parallax scripts are gone MIT license
/* 1877 */ (function(){var lastTime=0;var vendors=['ms','moz','webkit','o'];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||window[vendors[x]+'CancelRequestAnimationFrame']}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(callback,element){var currTime=new Date().getTime();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout(function(){callback(currTime+timeToCall)},timeToCall);lastTime=currTime+timeToCall;return id};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(id){clearTimeout(id)}}());
/* 1878 */ 
/* 1879 */ jQuery.expr[':'].regex = function(elem, index, match) {
/* 1880 */     var matchParams = match[3].split(','),
/* 1881 */         validLabels = /^(data|css):/,
/* 1882 */         attr = {
/* 1883 */             method: matchParams[0].match(validLabels) ? 
/* 1884 */                         matchParams[0].split(':')[0] : 'attr',
/* 1885 */             property: matchParams.shift().replace(validLabels,'')
/* 1886 */         },
/* 1887 */         regexFlags = 'ig',
/* 1888 */         regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
/* 1889 */     return regex.test(jQuery(elem)[attr.method](attr.property));
/* 1890 */ }
/* 1891 */ 

;
/* shortcodes.js */

/* 1    */ (function($)
/* 2    */ {	
/* 3    */     "use strict";
/* 4    */ 
/* 5    */     $(document).ready(function()
/* 6    */     {	
/* 7    */     	//global variables that are used on several ocassions
/* 8    */     	$.avia_utilities = $.avia_utilities || {};
/* 9    */     	
/* 10   */     	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 'ontouchstart' in document.documentElement)
/* 11   */     	{
/* 12   */     		$.avia_utilities.isMobile =  true;
/* 13   */     	}
/* 14   */     	else
/* 15   */     	{
/* 16   */     		$.avia_utilities.isMobile =  false;
/* 17   */     	}
/* 18   */     
/* 19   */     	//activate fixed bg fallback for mobile
/* 20   */     	if($.fn.avia_mobile_fixed)
/* 21   */ 		$('.avia-bg-style-fixed').avia_mobile_fixed();
/* 22   */     	
/* 23   */     	//activate parallax scrolling for backgrounds.
/* 24   */     	if($.fn.avia_parallax)
/* 25   */ 		$('.av-parallax').avia_parallax();
/* 26   */     	
/* 27   */     	//calculate the browser height and append a css rule to the head
/* 28   */ 		if($.fn.avia_browser_height)
/* 29   */ 		$('.av-minimum-height, .avia-fullscreen-slider').avia_browser_height();
/* 30   */ 		
/* 31   */ 		//calculate the height of each video section
/* 32   */ 		if($.fn.avia_video_section)
/* 33   */ 		 $('.av-section-with-video-bg').avia_video_section();
/* 34   */ 		
/* 35   */ 		//creates team social icon tooltip
/* 36   */         new $.AviaTooltip({'class': "avia-tooltip", data: "avia-tooltip", delay:0, scope: "body"});
/* 37   */ 		
/* 38   */ 		//creates icon element tooltip
/* 39   */ 		new $.AviaTooltip({'class': "avia-tooltip avia-icon-tooltip", data: "avia-icon-tooltip", delay:0, scope: "body"});
/* 40   */ 
/* 41   */         activate_shortcode_scripts();
/* 42   */         
/* 43   */         //layer slider height helper
/* 44   */         $('.avia-layerslider').layer_slider_height_helper();
/* 45   */         
/* 46   */         //"ajax" portfolio
/* 47   */         $('.grid-links-ajax').avia_portfolio_preview();
/* 48   */         
/* 49   */         // actiavte the masonry script: sorting/loading/etc
/* 50   */ 		if($.fn.avia_masonry)

/* shortcodes.js */

/* 51   */ 		$('.av-masonry').avia_masonry();
/* 52   */ 		
/* 53   */ 		//activate the accordion
/* 54   */ 		if($.fn.aviaccordion)
/* 55   */ 		$('.aviaccordion').aviaccordion();
/* 56   */ 		
/* 57   */     });
/* 58   */ 
/* 59   */ 
/* 60   */ 	$(window).load(function(){
/* 61   */ 	//initialize after images are loaded
/* 62   */ 	});
/* 63   */ 
/* 64   */ 
/* 65   */ 
/* 66   */ 
/* 67   */ // -------------------------------------------------------------------------------------------
/* 68   */ // ACTIVATE ALL SHORTCODES
/* 69   */ // -------------------------------------------------------------------------------------------
/* 70   */ 
/* 71   */ 	function activate_waypoints(container)
/* 72   */ 	{
/* 73   */ 		//activates simple css animations of the content once the user scrolls to an elements
/* 74   */ 		if($.fn.avia_waypoints)
/* 75   */ 		{
/* 76   */ 			if(typeof container == 'undefined'){ container = 'body';};
/* 77   */ 
/* 78   */ 			$('.avia_animate_when_visible', container).avia_waypoints();
/* 79   */ 			$('.avia_animate_when_almost_visible', container).avia_waypoints({ offset: '80%'});
/* 80   */ 		}
/* 81   */ 	}
/* 82   */ 
/* 83   */ 
/* 84   */     function activate_shortcode_scripts(container)
/* 85   */ 	{
/* 86   */ 		if(typeof container == 'undefined'){ container = 'body';}
/* 87   */ 		
/* 88   */ 		//activates the form shortcode
/* 89   */ 		if($.fn.avia_ajax_form)
/* 90   */ 		{
/* 91   */ 			$('.avia_ajax_form', container).avia_ajax_form();
/* 92   */ 		}
/* 93   */ 		
/* 94   */ 		activate_waypoints(container);
/* 95   */ 		
/* 96   */ 		//activate the video api
/* 97   */ 		if($.fn.aviaVideoApi)
/* 98   */ 		{
/* 99   */ 			$('.avia-slideshow iframe[src*="youtube.com"], .av_youtube_frame, .avia-slideshow iframe[src*="vimeo.com"], .avia-slideshow video').aviaVideoApi({}, 'li');
/* 100  */ 		}

/* shortcodes.js */

/* 101  */ 		
/* 102  */ 	    //activates the toggle shortcode
/* 103  */ 		if($.fn.avia_sc_toggle)
/* 104  */ 		{
/* 105  */ 			$('.togglecontainer', container).avia_sc_toggle();
/* 106  */ 		}
/* 107  */ 		
/* 108  */ 		//activates the tabs shortcode
/* 109  */ 		if($.fn.avia_sc_tabs)
/* 110  */ 		{
/* 111  */ 			$('.top_tab', container).avia_sc_tabs();
/* 112  */ 			$('.sidebar_tab', container).avia_sc_tabs({sidebar:true});
/* 113  */ 		}
/* 114  */ 
/* 115  */ 		//activates behavior and animation for gallery
/* 116  */ 		if($.fn.avia_sc_gallery)
/* 117  */ 		{
/* 118  */ 			$('.avia-gallery', container).avia_sc_gallery();
/* 119  */ 		}
/* 120  */ 		
/* 121  */ 		//activates animated number shortcode
/* 122  */ 		if($.fn.avia_sc_animated_number)
/* 123  */ 		{
/* 124  */ 			$('.avia-animated-number', container).avia_sc_animated_number();
/* 125  */ 		}
/* 126  */ 		
/* 127  */ 		//animation for elements that are not connected like icon shortcode
/* 128  */ 		if($.fn.avia_sc_animation_delayed)
/* 129  */ 		{
/* 130  */ 			$('.av_font_icon', container).avia_sc_animation_delayed({delay:100});
/* 131  */ 			$('.avia-image-container', container).avia_sc_animation_delayed({delay:100});
/* 132  */ 			$('.av-hotspot-image-container', container).avia_sc_animation_delayed({delay:100});
/* 133  */ 		}
/* 134  */ 
/* 135  */ 		//activates animation for iconlist
/* 136  */ 		if($.fn.avia_sc_iconlist)
/* 137  */ 		{
/* 138  */ 			$('.avia-icon-list', container).avia_sc_iconlist();
/* 139  */ 		}
/* 140  */ 
/* 141  */ 		//activates animation for progress bar
/* 142  */ 		if($.fn.avia_sc_progressbar)
/* 143  */ 		{
/* 144  */ 			$('.avia-progress-bar-container', container).avia_sc_progressbar();
/* 145  */ 		}
/* 146  */ 
/* 147  */ 		//activates animation for testimonial
/* 148  */ 		if($.fn.avia_sc_testimonial)
/* 149  */ 		{
/* 150  */ 			$('.avia-testimonial-wrapper', container).avia_sc_testimonial();

/* shortcodes.js */

/* 151  */ 		}
/* 152  */ 		
/* 153  */ 		//activate the fullscreen slider
/* 154  */ 		$('.avia-slideshow.av_fullscreen', container).aviaFullscreenSlider();
/* 155  */ 		
/* 156  */ 		//activate the aviaslider
/* 157  */ 		$('.avia-slideshow:not(.av_fullscreen)', container).aviaSlider();
/* 158  */ 		
/* 159  */         //content slider
/* 160  */         $('.avia-content-slider-active', container).aviaSlider({wrapElement: '.avia-content-slider-inner', slideElement:'.slide-entry-wrap'});
/* 161  */ 
/* 162  */         //testimonial slider
/* 163  */         $('.avia-slider-testimonials', container).aviaSlider({wrapElement: '.avia-testimonial-row', slideElement:'.avia-testimonial'});
/* 164  */         
/* 165  */         //load and activate maps
/* 166  */         if($.fn.aviaMaps)
/* 167  */         {
/* 168  */         	$('.avia-google-map-container', container).aviaMaps();
/* 169  */     	}
/* 170  */     	
/* 171  */     	 //load magazine sorting
/* 172  */         if($.fn.aviaMagazine)
/* 173  */         {
/* 174  */         	$('.av-magazine-tabs-active', container).aviaMagazine();
/* 175  */     	}
/* 176  */     	
/* 177  */     	 //load image hotspot
/* 178  */         if($.fn.aviaHotspots)
/* 179  */         {
/* 180  */         	$('.av-hotspot-image-container', container).aviaHotspots();
/* 181  */     	}
/* 182  */     	
/* 183  */     	 //load countdown
/* 184  */         if($.fn.aviaCountdown)
/* 185  */         {
/* 186  */         	$('.av-countdown-timer', container).aviaCountdown();
/* 187  */     	}
/* 188  */     	
/* 189  */     	
/* 190  */     }
/* 191  */ 
/* 192  */ 
/* 193  */ 
/* 194  */ // -------------------------------------------------------------------------------------------
/* 195  */ // 
/* 196  */ // AVIA Countdown
/* 197  */ // 
/* 198  */ // -------------------------------------------------------------------------------------------
/* 199  */ (function($)
/* 200  */ { 

/* shortcodes.js */

/* 201  */ 	"use strict";
/* 202  */ 	
/* 203  */ 	var _units	= ['weeks','days','hours','minutes','seconds'],
/* 204  */ 		_second = 1000,
/* 205  */ 		_minute = _second * 60,
/* 206  */ 		_hour 	= _minute * 60,
/* 207  */ 		_day 	= _hour * 24,
/* 208  */ 		_week	= _day * 7,	
/* 209  */ 		ticker	= function(_self)
/* 210  */ 		{
/* 211  */ 			var _time		= {},
/* 212  */ 				_now 		= new Date(),
/* 213  */ 				_timestamp  = _self.end - _now;
/* 214  */ 			
/* 215  */ 			if(_timestamp <= 0)
/* 216  */ 			{
/* 217  */ 				clearInterval(_self.countdown);
/* 218  */ 				return;
/* 219  */ 			}	
/* 220  */ 			
/* 221  */ 			_self.time.weeks   	= Math.floor( _timestamp / _week);
/* 222  */ 			_self.time.days 	= Math.floor((_timestamp % _week) / _day);
/* 223  */ 			_self.time.hours	= Math.floor((_timestamp % _day) / _hour); 
/* 224  */ 			_self.time.minutes 	= Math.floor((_timestamp % _hour) / _minute); 
/* 225  */ 			_self.time.seconds 	= Math.floor((_timestamp % _minute) / _second); 
/* 226  */ 			
/* 227  */ 			switch(_self.data.maximum)
/* 228  */ 			{
/* 229  */ 				case 1: _self.time.seconds 	= Math.floor(_timestamp / _second); break;
/* 230  */ 				case 2: _self.time.minutes 	= Math.floor(_timestamp / _minute); break;
/* 231  */ 				case 3: _self.time.hours	= Math.floor(_timestamp / _hour); 	break;
/* 232  */ 				case 4: _self.time.days 	= Math.floor(_timestamp / _day); 	break;
/* 233  */ 			}
/* 234  */ 			
/* 235  */ 			for (var i in _self.time)
/* 236  */ 			{	
/* 237  */ 				if(typeof _self.update[i] == "object")
/* 238  */ 				{
/* 239  */ 					if(_self.firstrun || _self.oldtime[i] != _self.time[i])
/* 240  */ 					{
/* 241  */ 						var labelkey = ( _self.time[i] === 1 ) ? "single" : "multi"; 
/* 242  */ 					
/* 243  */ 						_self.update[i].time_container.text(_self.time[i]);
/* 244  */ 						_self.update[i].label_container.text(_self.update[i][labelkey]);
/* 245  */ 					}
/* 246  */ 				}
/* 247  */ 			}
/* 248  */ 			
/* 249  */ 			//show ticker
/* 250  */ 			if(_self.firstrun) _self.container.addClass('av-countdown-active')

/* shortcodes.js */

/* 251  */ 			
/* 252  */ 			_self.oldtime 	= $.extend( {}, _self.time );
/* 253  */ 			_self.firstrun	= false;
/* 254  */ 		};
/* 255  */ 		
/* 256  */ 	
/* 257  */ 	$.fn.aviaCountdown = function( options )
/* 258  */ 	{	
/* 259  */ 		if(!this.length) return; 
/* 260  */ 
/* 261  */ 		return this.each(function()
/* 262  */ 		{
/* 263  */ 			var _self 			= {};
/* 264  */ 			_self.update		= {};
/* 265  */ 			_self.time			= {};			
/* 266  */ 			_self.oldtime		= {};			
/* 267  */ 			_self.firstrun		= true;			
/* 268  */ 			
/* 269  */ 			_self.container		= $(this);
/* 270  */ 			_self.data			= _self.container.data();
/* 271  */ 			_self.end			= new Date(_self.data.year, _self.data.month, _self.data.day, _self.data.hour, _self.data.minute );
/* 272  */ 			
/* 273  */ 			for (var i in _units)
/* 274  */ 			{
/* 275  */ 				_self.update[_units[i]] = {
/* 276  */ 					time_container:  _self.container.find('.av-countdown-' + _units[i] + ' .av-countdown-time'),
/* 277  */ 					label_container: _self.container.find('.av-countdown-' + _units[i] + ' .av-countdown-time-label'),
/* 278  */ 				};
/* 279  */ 				
/* 280  */ 				if(_self.update[_units[i]].label_container.length)
/* 281  */ 				{
/* 282  */ 					_self.update[_units[i]].single = _self.update[_units[i]].label_container.data('label');
/* 283  */ 					_self.update[_units[i]].multi  = _self.update[_units[i]].label_container.data('label-multi');
/* 284  */ 				}
/* 285  */ 			}
/* 286  */ 			
/* 287  */ 			ticker(_self);
/* 288  */ 			_self.countdown 	= setInterval(function(){ ticker(_self); }, _self.data.interval);
/* 289  */ 
/* 290  */ 			
/* 291  */ 		});
/* 292  */ 	}
/* 293  */ 	
/* 294  */ }(jQuery));
/* 295  */ 
/* 296  */ 
/* 297  */ 
/* 298  */ // -------------------------------------------------------------------------------------------
/* 299  */ // 
/* 300  */ // AVIA Image Hotspots

/* shortcodes.js */

/* 301  */ // 
/* 302  */ // -------------------------------------------------------------------------------------------
/* 303  */ (function($)
/* 304  */ { 
/* 305  */ 	"use strict";
/* 306  */ 
/* 307  */ 	$.fn.aviaHotspots = function( options )
/* 308  */ 	{
/* 309  */ 		if(!this.length) return; 
/* 310  */ 
/* 311  */ 		return this.each(function()
/* 312  */ 		{
/* 313  */ 			var _self = {};
/* 314  */ 			
/* 315  */ 			_self.container	= $(this);
/* 316  */ 			_self.hotspots	= _self.container.find('.av-image-hotspot');
/* 317  */ 			
/* 318  */ 				_self.container.on('avia_start_animation', function()
/* 319  */ 				{
/* 320  */ 					setTimeout(function()
/* 321  */ 					{
/* 322  */ 						_self.hotspots.each(function(i)
/* 323  */ 						{
/* 324  */ 							var current = $(this);
/* 325  */ 							setTimeout(function(){ current.addClass('av-display-hotspot'); },300 * i);
/* 326  */ 						});
/* 327  */ 					},400);
/* 328  */ 				});
/* 329  */ 
/* 330  */ 		});
/* 331  */ 	}
/* 332  */ 	
/* 333  */ }(jQuery));
/* 334  */ 
/* 335  */ 
/* 336  */ 
/* 337  */ 
/* 338  */ // -------------------------------------------------------------------------------------------
/* 339  */ // 
/* 340  */ // AVIA Magazine function for magazine sorting
/* 341  */ // 
/* 342  */ // -------------------------------------------------------------------------------------------
/* 343  */ (function($)
/* 344  */ { 
/* 345  */ 	"use strict";
/* 346  */ 	
/* 347  */ 	var animating = false,
/* 348  */ 		methods = {
/* 349  */ 		
/* 350  */ 		switchMag: function(clicked, _self)

/* shortcodes.js */

/* 351  */ 		{
/* 352  */ 			var current 		= $(clicked)
/* 353  */ 			
/* 354  */ 			if(current.is('.active_sort') || animating) return;
/* 355  */ 			
/* 356  */ 			var filter			= current.data('filter'),
/* 357  */ 				oldContainer	= _self.container.filter(':visible'),
/* 358  */ 				newContainer	= _self.container.filter('.' + filter);
/* 359  */ 			
/* 360  */ 			//switch Class
/* 361  */ 			animating = true;
/* 362  */ 			_self.sort_buttons.removeClass('active_sort');
/* 363  */ 			current.addClass('active_sort');
/* 364  */ 			
/* 365  */ 			//apply fixed heiht for transition
/* 366  */ 			_self.magazine.height(_self.magazine.outerHeight());
/* 367  */ 			
/* 368  */ 			//switch items
/* 369  */ 			oldContainer.avia_animate({opacity:0}, 200, function()
/* 370  */ 			{
/* 371  */ 				oldContainer.css({display:'none'});
/* 372  */ 				newContainer.css({opacity:0, display:'block'}).avia_animate({opacity:1}, 150, function()
/* 373  */ 				{
/* 374  */ 					_self.magazine.avia_animate({height: (newContainer.outerHeight() + _self.sort_bar.outerHeight())}, 150, function()
/* 375  */ 					{
/* 376  */ 						_self.magazine.height('auto');
/* 377  */ 						animating = false;
/* 378  */ 					});
/* 379  */ 					
/* 380  */ 				});
/* 381  */ 			});
/* 382  */ 		}
/* 383  */ 	};
/* 384  */ 	
/* 385  */ 	
/* 386  */ 	$.fn.aviaMagazine = function( options )
/* 387  */ 	{
/* 388  */ 		if(!this.length) return; 
/* 389  */ 
/* 390  */ 		return this.each(function()
/* 391  */ 		{
/* 392  */ 			var _self = {};
/* 393  */ 			 
/* 394  */ 			_self.magazine		= $(this),
/* 395  */ 			_self.sort_buttons 	= _self.magazine.find('.av-magazine-sort a');
/* 396  */ 			_self.container		= _self.magazine.find('.av-magazine-group');
/* 397  */ 			_self.sort_bar		= _self.magazine.find('.av-magazine-top-bar');
/* 398  */ 			
/* 399  */ 			_self.sort_buttons.on('click', function(e){ e.preventDefault(); methods.switchMag(this, _self);  } );
/* 400  */ 		});

/* shortcodes.js */

/* 401  */ 	}
/* 402  */ 	
/* 403  */ }(jQuery));
/* 404  */ 
/* 405  */ // -------------------------------------------------------------------------------------------
/* 406  */ // 
/* 407  */ // AVIA MAPS API - loads the google maps api asynchronously 
/* 408  */ // 
/* 409  */ // afterwards applies the map to the container
/* 410  */ // 
/* 411  */ // -------------------------------------------------------------------------------------------
/* 412  */ 
/* 413  */ 
/* 414  */ (function($)
/* 415  */ {
/* 416  */     "use strict";
/* 417  */ 
/* 418  */ 	$.AviaMapsAPI  =  function(options, container)
/* 419  */ 	{
/* 420  */ 		if(typeof window.av_google_map == 'undefined')
/* 421  */ 		{
/* 422  */ 			$.avia_utilities.log('Map creation stopped, var av_google_map not found'); return
/* 423  */ 		}
/* 424  */ 	
/* 425  */ 		// gatehr container and map data
/* 426  */ 		this.container	= container;
/* 427  */ 		this.$container	= $( container );
/* 428  */ 		this.$body  	= $('body');
/* 429  */ 		this.$mapid		= this.$container.data('mapid') - 1; 
/* 430  */ 		this.$data		= window.av_google_map[this.$mapid];
/* 431  */ 		this.retina 	= window.devicePixelRatio > 1;
/* 432  */ 		
/* 433  */ 		// set up the whole api object
/* 434  */ 		this._init( options );
/* 435  */ 	}
/* 436  */ 	
/* 437  */ 	$.AviaMapsAPI.apiFiles = 
/* 438  */ 	{
/* 439  */ 		loading: false, 
/* 440  */ 		finished: false, 
/* 441  */ 		src: 'https://maps.googleapis.com/maps/api/js?v=3.6&sensor=false&callback=aviaOnGoogleMapsLoaded' 
/* 442  */ 	}
/* 443  */ 	
/* 444  */   	$.AviaMapsAPI.prototype =
/* 445  */     {
/* 446  */     	_init: function()
/* 447  */     	{
/* 448  */     		this._bind_execution();
/* 449  */     		this._getAPI();
/* 450  */     	},

/* shortcodes.js */

/* 451  */     	
/* 452  */     	_getAPI: function( )
/* 453  */ 		{	
/* 454  */ 			//make sure the api file is loaded only once
/* 455  */ 			if((typeof window.google == 'undefined' || typeof window.google.maps == 'undefined') && $.AviaMapsAPI.apiFiles.loading == false)
/* 456  */ 			{	
/* 457  */ 				$.AviaMapsAPI.apiFiles.loading = true;
/* 458  */ 				var script 	= document.createElement('script');
/* 459  */ 				script.type = 'text/javascript';	
/* 460  */ 				script.src 	= $.AviaMapsAPI.apiFiles.src;
/* 461  */ 				
/* 462  */       			document.body.appendChild(script);
/* 463  */ 			}
/* 464  */ 			else if((typeof window.google != 'undefined' && typeof window.google.maps != 'undefined') || $.AviaMapsAPI.apiFiles.loading == false)
/* 465  */ 			//else if($.AviaMapsAPI.apiFiles.finished === true)
/* 466  */ 			{
/* 467  */ 				this._applyMap();
/* 468  */ 			}
/* 469  */ 		},
/* 470  */ 		
/* 471  */ 		_bind_execution: function()
/* 472  */ 		{
/* 473  */ 			this.$body.on('av-google-maps-api-loaded', $.proxy( this._applyMap, this) );
/* 474  */ 		},
/* 475  */ 		
/* 476  */ 		_applyMap: function()
/* 477  */ 		{
/* 478  */ 			if(typeof this.map != 'undefined') return;
/* 479  */ 			if(!this.$data.marker || !this.$data.marker[0] || !this.$data.marker[0].long || !this.$data.marker[0].long)
/* 480  */ 			{
/* 481  */ 				$.avia_utilities.log('Latitude or Longitude missing', 'map-error'); 
/* 482  */ 				return;
/* 483  */ 			}
/* 484  */ 			
/* 485  */ 			var _self = this,
/* 486  */ 				mobile_drag = $.avia_utilities.isMobile ? this.$data.mobile_drag_control : true,
/* 487  */ 				zoomValue 	= this.$data.zoom == "auto" ? 10 : this.$data.zoom;
/* 488  */ 			
/* 489  */ 			this.mapVars = {
/* 490  */ 				mapMaker: false, //mapmaker tiles are user generated content maps. might hold more info but also be inaccurate
/* 491  */ 				mapTypeControl: false,
/* 492  */ 				backgroundColor:'transparent',
/* 493  */ 				streetViewControl: false,
/* 494  */ 				panControl: this.$data.pan_control,
/* 495  */ 				zoomControl: this.$data.zoom_control,
/* 496  */ 				draggable: mobile_drag,
/* 497  */ 				scrollwheel: false,
/* 498  */ 				zoom: zoomValue,
/* 499  */ 				mapTypeId:google.maps.MapTypeId.ROADMAP,
/* 500  */ 				center: new google.maps.LatLng(this.$data.marker[0].lat, this.$data.marker[0].long),

/* shortcodes.js */

/* 501  */ 				styles:[{featureType: "poi", elementType: "labels", stylers: [ { visibility: "off" }] }]
/* 502  */ 			};
/* 503  */ 
/* 504  */ 			this.map = new google.maps.Map(this.container, this.mapVars);
/* 505  */ 		
/* 506  */ 			this._applyMapStyle();
/* 507  */ 			
/* 508  */ 			if(this.$data.zoom == "auto")
/* 509  */ 			{
/* 510  */ 				this._setAutoZoom();
/* 511  */ 			}
/* 512  */ 			
/* 513  */ 			google.maps.event.addListenerOnce(this.map, 'tilesloaded', function() {	
/* 514  */ 				_self._addMarkers();
/* 515  */ 			});
/* 516  */ 		},
/* 517  */ 		
/* 518  */ 		_setAutoZoom: function()
/* 519  */ 		{
/* 520  */ 			var bounds = new google.maps.LatLngBounds();
/* 521  */ 			
/* 522  */ 			for (var key in this.$data.marker) 
/* 523  */ 			{
/* 524  */ 				bounds.extend( new google.maps.LatLng (this.$data.marker[key].lat , this.$data.marker[key].long) );
/* 525  */ 			}
/* 526  */ 			
/* 527  */ 			this.map.fitBounds(bounds);
/* 528  */ 		},
/* 529  */ 		
/* 530  */ 		_applyMapStyle: function()
/* 531  */ 		{
/* 532  */ 			var stylers = [], style = [], mapType;
/* 533  */ 			
/* 534  */ 			if(this.$data.hue != "") stylers.push({hue: this.$data.hue});
/* 535  */ 			if(this.$data.saturation != "") stylers.push({saturation: this.$data.saturation});
/* 536  */ 			
/* 537  */ 			if(stylers.length)
/* 538  */ 			{
/* 539  */ 				style = [{
/* 540  */ 					      featureType: "all",
/* 541  */ 					      elementType: "all",
/* 542  */ 					      stylers: stylers
/* 543  */ 					    }, {
/* 544  */ 					      featureType: "poi",
/* 545  */ 					      stylers: [
/* 546  */ 						{ visibility: "off" }
/* 547  */ 					      ]
/* 548  */ 					    }];
/* 549  */ 					
/* 550  */ 				mapType = new google.maps.StyledMapType(style, { name:"av_map_style" });

/* shortcodes.js */

/* 551  */ 				this.map.mapTypes.set('av_styled_map', mapType);
/* 552  */ 				this.map.setMapTypeId('av_styled_map');
/* 553  */ 			}
/* 554  */ 		},
/* 555  */ 		
/* 556  */ 		_addMarkers: function()
/* 557  */ 		{
/* 558  */ 			for (var key in this.$data.marker) 
/* 559  */ 			{	
/* 560  */ 				var _self = this;
/* 561  */ 				
/* 562  */ 				(function(key, _self) 
/* 563  */ 				{
/* 564  */ 					setTimeout(function()
/* 565  */ 					{
/* 566  */ 							var marker = "";
/* 567  */ 							
/* 568  */ 							if(!_self.$data.marker[key] || !_self.$data.marker[key].long || !_self.$data.marker[key].long)
/* 569  */ 							{
/* 570  */ 								$.avia_utilities.log('Latitude or Longitude for single marker missing', 'map-error'); 
/* 571  */ 								return;
/* 572  */ 							}
/* 573  */ 							
/* 574  */ 							_self.$data.LatLng = new google.maps.LatLng(_self.$data.marker[key].lat, _self.$data.marker[key].long);
/* 575  */ 							
/* 576  */ 							var markerArgs = {
/* 577  */ 			        		  flat: false,
/* 578  */ 						      position: _self.$data.LatLng,
/* 579  */ 						      animation: google.maps.Animation.BOUNCE,
/* 580  */ 						      map: _self.map,
/* 581  */ 						      title: _self.$data.marker[key].address,
/* 582  */ 						      optimized: false
/* 583  */ 						    };
/* 584  */ 						    
/* 585  */ 						    //set a custom marker image if available. also set the size and reduce the marker on retina size so its sharp
/* 586  */ 						    if(_self.$data.marker[key].icon && _self.$data.marker[key].imagesize)
/* 587  */ 						    { 
/* 588  */ 						    	var size = _self.$data.marker[key].imagesize, half = "", full = "";
/* 589  */ 						    	
/* 590  */ 						    	if(_self.retina && size > 40) size = 40;			//retina downsize to at least half the px size
/* 591  */ 						    	half = new google.maps.Point(size / 2, size ) ; 	//used to position the marker
/* 592  */ 						    	full = new google.maps.Size(size , size ) ; 		//marker size
/* 593  */ 						    	markerArgs.icon = new google.maps.MarkerImage(_self.$data.marker[key].icon, null, null, half, full);
/* 594  */ 						    }
/* 595  */ 							
/* 596  */ 			        		marker = new google.maps.Marker(markerArgs);
/* 597  */ 			        		
/* 598  */ 			        		setTimeout(function(){ marker.setAnimation(null); _self._infoWindow(_self.map, marker, _self.$data.marker[key]); },500);
/* 599  */ 			        		
/* 600  */ 		        	},200 * (parseInt(key,10) + 1));

/* shortcodes.js */

/* 601  */ 		        		
/* 602  */ 		        }(key, _self));
/* 603  */     		}
/* 604  */ 		},
/* 605  */ 		
/* 606  */ 		_infoWindow: function(map, marker, data)
/* 607  */ 		{
/* 608  */ 			var info = $.trim(data.content);
/* 609  */ 			
/* 610  */ 			if(info != "")
/* 611  */ 			{
/* 612  */ 				var infowindow = new google.maps.InfoWindow({
/* 613  */ 					content: info
/* 614  */ 				});
/* 615  */ 				
/* 616  */ 				google.maps.event.addListener(marker, 'click', function() {
/* 617  */ 				    infowindow.open(map,marker);
/* 618  */ 				});
/* 619  */ 				
/* 620  */ 				if(data.tooltip_display) infowindow.open(map,marker);
/* 621  */ 			}
/* 622  */ 		}
/* 623  */ 		
/* 624  */     	
/* 625  */     }
/* 626  */ 
/* 627  */     //simple wrapper to call the api. makes sure that the api data is not applied twice
/* 628  */     $.fn.aviaMaps = function( options )
/* 629  */     {
/* 630  */     	return this.each(function()
/* 631  */     	{	
/* 632  */     		var self = $.data( this, 'aviaMapsApi' );
/* 633  */     		
/* 634  */     		if(!self)
/* 635  */     		{
/* 636  */     			self = $.data( this, 'aviaMapsApi', new $.AviaMapsAPI( options, this ) );
/* 637  */     		}
/* 638  */     	});
/* 639  */     }
/* 640  */     
/* 641  */ })( jQuery );
/* 642  */ 
/* 643  */ //this function is executed once the api file is loaded
/* 644  */ window.aviaOnGoogleMapsLoaded = function(){ $('body').trigger('av-google-maps-api-loaded'); $.AviaMapsAPI.apiFiles.finished = true; };
/* 645  */ 
/* 646  */ 
/* 647  */ // -------------------------------------------------------------------------------------------
/* 648  */ // 
/* 649  */ // AVIA VIDEO API - make sure that youtube, vimeo and html 5 use the same interface
/* 650  */ // 

/* shortcodes.js */

/* 651  */ // requires froogaloop vimeo library and youtube iframe api (yt can be loaded async)
/* 652  */ // 
/* 653  */ // -------------------------------------------------------------------------------------------
/* 654  */ 
/* 655  */ 
/* 656  */ (function($)
/* 657  */ {
/* 658  */     "use strict";
/* 659  */ 
/* 660  */ 	$.AviaVideoAPI  =  function(options, video, option_container)
/* 661  */ 	{	
/* 662  */ 		// actual video element. either iframe or video
/* 663  */ 		this.$video	= $( video );
/* 664  */ 		
/* 665  */ 		// container where the AviaVideoAPI object will be stored as data, and that can receive events like play, pause etc 
/* 666  */ 		// also the container that allows to overwrite javacript options by adding html data- attributes
/* 667  */ 		this.$option_container = option_container ? $( option_container ) : this.$video; 
/* 668  */ 		
/* 669  */ 		//mobile device?
/* 670  */ 		this.isMobile 	= $.avia_utilities.isMobile;
/* 671  */ 		
/* 672  */ 		//iamge fallback use
/* 673  */ 		this.fallback = this.isMobile ? this.$option_container.is('.av-mobile-fallback-image') : false;
/* 674  */ 		
/* 675  */ 		if(this.fallback) return;
/* 676  */ 		
/* 677  */ 		// set up the whole api object
/* 678  */ 		this._init( options );
/* 679  */ 		
/* 680  */ 	}
/* 681  */ 
/* 682  */ 	$.AviaVideoAPI.defaults  = {
/* 683  */ 	
/* 684  */ 		loop: false,
/* 685  */ 		mute: false,
/* 686  */ 		controls: false,
/* 687  */ 		events: 'play pause mute unmute loop toggle reset unload'
/* 688  */ 
/* 689  */ 	};
/* 690  */ 	
/* 691  */ 	$.AviaVideoAPI.apiFiles =
/* 692  */     {
/* 693  */     	youtube : {loaded: false, src: 'https://www.youtube.com/iframe_api' }
/* 694  */     }
/* 695  */ 	
/* 696  */   	$.AviaVideoAPI.prototype =
/* 697  */     {
/* 698  */     	_init: function( options )
/* 699  */     	{	
/* 700  */ 			// set slider options

/* shortcodes.js */

/* 701  */ 			this.options = this._setOptions(options);
/* 702  */ 			
/* 703  */ 			// info which video service we are using: html5, vimeo or youtube
/* 704  */ 			this.type = this._getPlayerType();
/* 705  */ 			
/* 706  */ 			// store the player object to the this.player variable created by one of the APIs (mediaelement, youtube, vimeo)
/* 707  */ 			this._setPlayer();			
/* 708  */ 			
/* 709  */ 			// set to true once the events are bound so it doesnt happen a second time by accident or racing condition
/* 710  */ 			this.eventsBound = false;
/* 711  */ 			
/* 712  */ 			// info if the video is playing
/* 713  */ 			this.playing = false;
/* 714  */ 			
/* 715  */ 			//play pause indicator
/* 716  */ 			this.pp = $.avia_utilities.playpause(this.$option_container);
/* 717  */     	},
/* 718  */ 		
/* 719  */ 		
/* 720  */     	//set the video options by first merging the default options and the passed options, then checking the video element if any data attributes overwrite the option set
/* 721  */     	_setOptions: function(options)
/* 722  */ 		{	
/* 723  */ 			var newOptions 	= $.extend( true, {}, $.AviaVideoAPI.defaults, options ),
/* 724  */ 				htmlData 	= this.$option_container.data(),
/* 725  */ 				i 			= "";
/* 726  */ 
/* 727  */ 			//overwritte passed option set with any data properties on the html element
/* 728  */ 			for (i in htmlData)
/* 729  */ 			{
/* 730  */ 				if (htmlData.hasOwnProperty(i) && (typeof htmlData[i] === "string" || typeof htmlData[i] === "number" || typeof htmlData[i] === "boolean"))
/* 731  */ 				{
/* 732  */ 					newOptions[i] = htmlData[i]; 
/* 733  */ 				}
/* 734  */ 			}
/* 735  */ 		
/* 736  */ 			return newOptions;
/* 737  */ 		},
/* 738  */ 		
/* 739  */ 		
/* 740  */ 		//get the player type
/* 741  */ 		_getPlayerType: function()
/* 742  */ 		{
/* 743  */ 			var vid_src = this.$video.get(0).src || this.$video.data('src');
/* 744  */ 			
/* 745  */ 			
/* 746  */ 			if(this.$video.is('video')) 				return 'html5';
/* 747  */ 			if(this.$video.is('.av_youtube_frame')) 	return 'youtube';
/* 748  */ 			if(vid_src.indexOf('vimeo.com') != -1 ) 	return 'vimeo';
/* 749  */ 			if(vid_src.indexOf('youtube.com') != -1) 	return 'youtube';
/* 750  */ 		},

/* shortcodes.js */

/* 751  */ 		
/* 752  */ 		//get the player object
/* 753  */ 		_setPlayer: function()
/* 754  */ 		{
/* 755  */ 			var _self = this;
/* 756  */ 			
/* 757  */ 			switch(this.type)
/* 758  */ 			{
/* 759  */ 				case "html5": 	
/* 760  */ 				
/* 761  */ 					this.player = this.$video.data('mediaelementplayer');  
/* 762  */ 					this._playerReady(); 
/* 763  */ 					
/* 764  */ 				break; 
/* 765  */ 					
/* 766  */ 				case "vimeo": 	
/* 767  */ 					
/* 768  */ 					this.player = Froogaloop(this.$video.get(0)); 
/* 769  */ 					this._playerReady(); 
/* 770  */ 					
/* 771  */ 				break;
/* 772  */ 					
/* 773  */ 				case "youtube": 
/* 774  */ 				
/* 775  */ 					this._getAPI(this.type);
/* 776  */ 					$('body').on('av-youtube-iframe-api-loaded', function(){ _self._playerReady(); });
/* 777  */ 					
/* 778  */ 				break;
/* 779  */ 			}
/* 780  */ 		},
/* 781  */ 		
/* 782  */ 		_getAPI: function( api )
/* 783  */ 		{	
/* 784  */ 			//make sure the api file is loaded only once
/* 785  */ 			if($.AviaVideoAPI.apiFiles[api].loaded === false)
/* 786  */ 			{	
/* 787  */ 				$.AviaVideoAPI.apiFiles[api].loaded = true;
/* 788  */ 				//load the file async
/* 789  */ 				var tag		= document.createElement('script'),
/* 790  */ 					first	= document.getElementsByTagName('script')[0];
/* 791  */ 					
/* 792  */ 				tag.src = $.AviaVideoAPI.apiFiles[api].src;
/* 793  */       			first.parentNode.insertBefore(tag, first);
/* 794  */ 			}
/* 795  */ 		},
/* 796  */ 		
/* 797  */ 		
/* 798  */ 		
/* 799  */ 		//wait for player to be ready, then bind events
/* 800  */ 		_playerReady: function()

/* shortcodes.js */

/* 801  */ 		{	
/* 802  */ 			var _self = this;
/* 803  */ 			
/* 804  */ 			this.$option_container.on('av-video-loaded', function(){ _self._bindEvents(); });
/* 805  */ 			
/* 806  */ 			switch(this.type)
/* 807  */ 			{
/* 808  */ 				case "html5": 
/* 809  */ 						
/* 810  */ 					this.$video.on('av-mediajs-loaded', function(){ _self.$option_container.trigger('av-video-loaded'); });
/* 811  */ 					this.$video.on('av-mediajs-ended' , function(){ _self.$option_container.trigger('av-video-ended');  });
/* 812  */ 					
/* 813  */ 				break;
/* 814  */ 				case "vimeo": 	
/* 815  */ 					
/* 816  */ 					//finish event must be applied after ready event for firefox
/* 817  */ 					_self.player.addEvent('ready',  function(){ _self.$option_container.trigger('av-video-loaded'); 
/* 818  */ 					_self.player.addEvent('finish', function(){ _self.$option_container.trigger('av-video-ended');  });
/* 819  */ 					}); 
/* 820  */ 					
/* 821  */ 					// vimeo sometimes does not fire. fallback jquery load event should fix this
/* 822  */ 					// currently not used because it causes firefox problems
/* 823  */ 					/*
/* 824  *| 					this.$video.load(function()
/* 825  *| 					{ 	
/* 826  *| 						if(_self.eventsBound == true || typeof _self.eventsBound == 'undefined') return;
/* 827  *| 				        _self.$option_container.trigger('av-video-loaded');
/* 828  *| 						$.avia_utilities.log('VIMEO Fallback Trigger');
/* 829  *| 				    });
/* 830  *| 					*/
/* 831  */ 					
/* 832  */ 				
/* 833  */ 				break;
/* 834  */ 				
/* 835  */ 				case "youtube": 
/* 836  */ 					
/* 837  */ 					var params = _self.$video.data();
/* 838  */ 					
/* 839  */ 					if(_self._supports_video()) params.html5 = 1;
/* 840  */ 					
/* 841  */ 					_self.player = new YT.Player(_self.$video.attr('id'), {
/* 842  */ 						videoId: params.videoid,
/* 843  */ 						height: _self.$video.attr('height'),
/* 844  */ 						width: _self.$video.attr('width'),
/* 845  */ 						playerVars: params,
/* 846  */ 						events: {
/* 847  */ 						'onReady': function(){ _self.$option_container.trigger('av-video-loaded'); },
/* 848  */ 						'onError': function(player){ $.avia_utilities.log('YOUTUBE ERROR:', 'error', player); },
/* 849  */ 						'onStateChange': function(event){ 
/* 850  */ 							if (event.data === YT.PlayerState.ENDED)

/* shortcodes.js */

/* 851  */ 							{	
/* 852  */ 								var command = _self.options.loop != false ? 'loop' : 'av-video-ended';
/* 853  */ 								_self.$option_container.trigger(command); 
/* 854  */ 							} 
/* 855  */ 						  }
/* 856  */ 						}
/* 857  */ 					});
/* 858  */ 					
/* 859  */ 					
/* 860  */ 				break;
/* 861  */ 			}
/* 862  */ 			
/* 863  */ 			//fallback always trigger after 2 seconds
/* 864  */ 			setTimeout(function()
/* 865  */ 			{ 	
/* 866  */ 				if(_self.eventsBound == true || typeof _self.eventsBound == 'undefined' || _self.type == 'youtube' ) { return; }
/* 867  */ 				$.avia_utilities.log('Fallback Video Trigger "'+_self.type+'":', 'log', _self);
/* 868  */ 				
/* 869  */ 				_self.$option_container.trigger('av-video-loaded'); 
/* 870  */ 				
/* 871  */ 			},2000);
/* 872  */ 			
/* 873  */ 		},
/* 874  */ 		
/* 875  */ 		//bind events we should listen to, to the player
/* 876  */ 		_bindEvents: function()
/* 877  */ 		{	
/* 878  */ 			if(this.eventsBound == true || typeof this.eventsBound == 'undefined')
/* 879  */ 			{
/* 880  */ 				return;
/* 881  */ 			}
/* 882  */ 			
/* 883  */ 			var _self = this, volume = 'unmute';
/* 884  */ 			
/* 885  */ 			this.eventsBound = true;
/* 886  */ 			
/* 887  */ 			this.$option_container.on(this.options.events, function(e)
/* 888  */ 			{
/* 889  */ 				_self.api(e.type);
/* 890  */ 			});
/* 891  */ 			
/* 892  */ 			if(!_self.isMobile)
/* 893  */ 			{
/* 894  */ 				//set up initial options
/* 895  */ 				if(this.options.mute != false) { volume = "mute"; 	 }
/* 896  */ 				if(this.options.loop != false) { _self.api('loop'); }
/* 897  */ 				
/* 898  */ 				_self.api(volume);
/* 899  */ 			}
/* 900  */ 			

/* shortcodes.js */

/* 901  */ 			//set timeout to prevent racing conditions with other scripts
/* 902  */ 			setTimeout(function()
/* 903  */ 			{
/* 904  */ 				_self.$option_container.trigger('av-video-events-bound').addClass('av-video-events-bound');
/* 905  */ 			},50);
/* 906  */ 		},
/* 907  */ 		
/* 908  */ 		
/* 909  */ 		_supports_video: function() {
/* 910  */ 		  return !!document.createElement('video').canPlayType;
/* 911  */ 		},
/* 912  */ 		
/* 913  */ 		
/* 914  */ 		/************************************************************************
/* 915  *| 		PUBLIC Methods
/* 916  *| 		*************************************************************************/
/* 917  */ 		
/* 918  */ 		api: function( action )
/* 919  */ 		{	
/* 920  */ 			//commands on mobile can not be executed if the player was not started manually 
/* 921  */ 			if(this.isMobile && !this.was_started()) return;
/* 922  */ 			
/* 923  */ 			// prevent calling of unbound function
/* 924  */ 			if(this.options.events.indexOf(action) === -1) return;
/* 925  */ 			
/* 926  */ 			// broadcast that the command was executed
/* 927  */ 			this.$option_container.trigger('av-video-'+action+'-executed');
/* 928  */ 			
/* 929  */ 			// calls the function based on action. eg: _html5_play()
/* 930  */ 			if(typeof this[ '_' + this.type + '_' + action] == 'function')
/* 931  */ 			{
/* 932  */ 				this[ '_' + this.type + '_' + action].call(this);
/* 933  */ 			}
/* 934  */ 			
/* 935  */ 			//call generic function eg: _toggle() or _play()
/* 936  */ 			if(typeof this[ '_' + action] == 'function')
/* 937  */ 			{
/* 938  */ 				this[ '_' + action].call(this);
/* 939  */ 			}
/* 940  */ 			
/* 941  */ 		},
/* 942  */ 		
/* 943  */ 		was_started: function()
/* 944  */ 		{
/* 945  */ 			if(!this.player) return false;
/* 946  */ 		
/* 947  */ 			switch(this.type)
/* 948  */ 			{
/* 949  */ 				case "html5": 
/* 950  */ 					if(this.player.getCurrentTime() > 0) return true; 

/* shortcodes.js */

/* 951  */ 				break; 
/* 952  */ 					
/* 953  */ 				case "vimeo": 	
/* 954  */ 					if(this.player.api('getCurrentTime') > 0) return true; 
/* 955  */ 				break;
/* 956  */ 					
/* 957  */ 				case "youtube": 
/* 958  */ 					if(this.player.getPlayerState() !== -1) return true; 
/* 959  */ 				break;
/* 960  */ 			}
/* 961  */ 			
/* 962  */ 			return false;
/* 963  */ 		},
/* 964  */ 		
/* 965  */ 		/************************************************************************
/* 966  *| 		Generic Methods, are always executed and usually set variables
/* 967  *| 		*************************************************************************/
/* 968  */ 		_play: function()
/* 969  */ 		{
/* 970  */ 			this.playing = true; 
/* 971  */ 		},
/* 972  */ 		
/* 973  */ 		_pause: function()
/* 974  */ 		{
/* 975  */ 			this.playing = false; 
/* 976  */ 		},
/* 977  */ 		
/* 978  */ 		_loop: function()
/* 979  */ 		{
/* 980  */ 			this.options.loop = true;
/* 981  */ 		},
/* 982  */ 		
/* 983  */ 		_toggle: function( )
/* 984  */ 		{
/* 985  */ 			var command = this.playing == true ? 'pause' : 'play';
/* 986  */ 			
/* 987  */ 			this.api(command);
/* 988  */ 			this.pp.set(command);
/* 989  */ 		},
/* 990  */ 		
/* 991  */ 		
/* 992  */ 		/************************************************************************
/* 993  *| 		VIMEO Methods
/* 994  *| 		*************************************************************************/
/* 995  */ 		
/* 996  */ 		_vimeo_play: function( )
/* 997  */ 		{	
/* 998  */ 			this.player.api('play');
/* 999  */ 		},
/* 1000 */ 		

/* shortcodes.js */

/* 1001 */ 		_vimeo_pause: function( )
/* 1002 */ 		{
/* 1003 */ 			this.player.api('pause');	
/* 1004 */ 		},
/* 1005 */ 		
/* 1006 */ 		_vimeo_mute: function( )
/* 1007 */ 		{
/* 1008 */ 			this.player.api('setVolume', 0);
/* 1009 */ 		},
/* 1010 */ 		
/* 1011 */ 		_vimeo_unmute: function( )
/* 1012 */ 		{
/* 1013 */ 			this.player.api('setVolume', 0.7);
/* 1014 */ 		},
/* 1015 */ 		
/* 1016 */ 		_vimeo_loop: function( )
/* 1017 */ 		{
/* 1018 */ 			// currently throws error, must be set in iframe
/* 1019 */ 			// this.player.api('setLoop', true);
/* 1020 */ 		},
/* 1021 */ 		
/* 1022 */ 		_vimeo_reset: function( )
/* 1023 */ 		{
/* 1024 */ 			this.player.api('seekTo',0);
/* 1025 */ 		},
/* 1026 */ 		
/* 1027 */ 		_vimeo_unload: function()
/* 1028 */ 		{
/* 1029 */ 			this.player.api('unload');
/* 1030 */ 		},
/* 1031 */ 		
/* 1032 */ 		/************************************************************************
/* 1033 *| 		YOUTUBE Methods
/* 1034 *| 		*************************************************************************/		
/* 1035 */ 		
/* 1036 */ 		_youtube_play: function( )
/* 1037 */ 		{
/* 1038 */ 			this.player.playVideo();
/* 1039 */ 		},
/* 1040 */ 		
/* 1041 */ 		_youtube_pause: function( )
/* 1042 */ 		{
/* 1043 */ 			this.player.pauseVideo()
/* 1044 */ 		},
/* 1045 */ 		
/* 1046 */ 		_youtube_mute: function( )
/* 1047 */ 		{
/* 1048 */ 			this.player.mute();
/* 1049 */ 		},
/* 1050 */ 		

/* shortcodes.js */

/* 1051 */ 		_youtube_unmute: function( )
/* 1052 */ 		{
/* 1053 */ 			this.player.unMute();
/* 1054 */ 		},
/* 1055 */ 		
/* 1056 */ 		_youtube_loop: function( )
/* 1057 */ 		{	
/* 1058 */ 			// does not work properly with iframe api. needs to manual loop on "end" event
/* 1059 */ 			// this.player.setLoop(true); 
/* 1060 */ 			if(this.playing == true) this.player.seekTo(0);
/* 1061 */ 		},
/* 1062 */ 		
/* 1063 */ 		_youtube_reset: function( )
/* 1064 */ 		{
/* 1065 */ 			this.player.stopVideo();
/* 1066 */ 		},
/* 1067 */ 		
/* 1068 */ 		_youtube_unload: function()
/* 1069 */ 		{
/* 1070 */ 			this.player.clearVideo();
/* 1071 */ 		},
/* 1072 */ 		
/* 1073 */ 		/************************************************************************
/* 1074 *| 		HTML5 Methods
/* 1075 *| 		*************************************************************************/
/* 1076 */ 		
/* 1077 */ 		_html5_play: function( )
/* 1078 */ 		{
/* 1079 */ 			//disable stoping of other videos in case the user wants to run section bgs
/* 1080 */ 			this.player.options.pauseOtherPlayers = false;
/* 1081 */ 			this.player.play();
/* 1082 */ 		},
/* 1083 */ 		
/* 1084 */ 		_html5_pause: function( )
/* 1085 */ 		{
/* 1086 */ 			this.player.pause();
/* 1087 */ 		},
/* 1088 */ 		
/* 1089 */ 		_html5_mute: function( )
/* 1090 */ 		{
/* 1091 */ 			this.player.setMuted(true);
/* 1092 */ 		},
/* 1093 */ 		
/* 1094 */ 		_html5_unmute: function( )
/* 1095 */ 		{
/* 1096 */ 			this.player.setVolume(0.7);
/* 1097 */ 		},
/* 1098 */ 		
/* 1099 */ 		_html5_loop: function( )
/* 1100 */ 		{

/* shortcodes.js */

/* 1101 */ 			this.player.options.loop = true;
/* 1102 */ 		},
/* 1103 */ 		
/* 1104 */ 		_html5_reset: function( )
/* 1105 */ 		{	
/* 1106 */ 			this.player.setCurrentTime(0);	
/* 1107 */ 		},
/* 1108 */ 		
/* 1109 */ 		_html5_unload: function()
/* 1110 */ 		{
/* 1111 */ 			this._html5_pause();
/* 1112 */ 			this._html5_reset();
/* 1113 */ 		}
/* 1114 */     }
/* 1115 */ 
/* 1116 */     //simple wrapper to call the api. makes sure that the api data is not applied twice
/* 1117 */     $.fn.aviaVideoApi = function( options , apply_to_parent)
/* 1118 */     {
/* 1119 */     	return this.each(function()
/* 1120 */     	{	
/* 1121 */     		// by default save the object as data to the initial video. 
/* 1122 */     		// in the case of slideshows its more benefitial to save it to a parent element (eg: the slide)
/* 1123 */     		var applyTo = this;
/* 1124 */     		
/* 1125 */     		if(apply_to_parent)
/* 1126 */     		{
/* 1127 */     			applyTo = $(this).parents(apply_to_parent).get(0);
/* 1128 */     		}
/* 1129 */     		
/* 1130 */     		var self = $.data( applyTo, 'aviaVideoApi' );
/* 1131 */     		
/* 1132 */     		if(!self)
/* 1133 */     		{
/* 1134 */     			self = $.data( applyTo, 'aviaVideoApi', new $.AviaVideoAPI( options, this, applyTo ) );
/* 1135 */     		}
/* 1136 */     	});
/* 1137 */     }
/* 1138 */     
/* 1139 */ })( jQuery );
/* 1140 */ 
/* 1141 */ window.onYouTubeIframeAPIReady = function(){ $('body').trigger('av-youtube-iframe-api-loaded'); };
/* 1142 */ 
/* 1143 */ 
/* 1144 */ 
/* 1145 */ // -------------------------------------------------------------------------------------------
/* 1146 */ // Masonry
/* 1147 */ // -------------------------------------------------------------------------------------------
/* 1148 */ 
/* 1149 */ $.fn.avia_masonry = function(options)
/* 1150 */ {

/* shortcodes.js */

/* 1151 */ 	//return if we didnt find anything
/* 1152 */ 	if(!this.length) return this;
/* 1153 */ 	
/* 1154 */ 	var the_body = $('body'),
/* 1155 */ 		isMobile = $.avia_utilities.isMobile,
/* 1156 */ 		loading = false,
/* 1157 */ 		methods = {
/* 1158 */ 	
/* 1159 */ 		masonry_filter: function()
/* 1160 */ 		{
/* 1161 */ 			var current		= $(this),
/* 1162 */ 				linktext	= current.html(),
/* 1163 */ 		  		selector	= current.data('filter'),
/* 1164 */ 		  		masonry 	= current.parents('.av-masonry:eq(0)'),
/* 1165 */ 		  		container 	= masonry.find('.av-masonry-container:eq(0)'),
/* 1166 */ 		  		links		= masonry.find('.av-masonry-sort a'),
/* 1167 */ 		  		activeCat	= masonry.find('.av-current-sort-title');
/* 1168 */ 				
/* 1169 */ 				links.removeClass('active_sort');
/* 1170 */ 				current.addClass('active_sort');
/* 1171 */ 				container.attr('id', 'masonry_id_'+selector);
/* 1172 */ 				
/* 1173 */ 				if(activeCat.length) activeCat.html(linktext);
/* 1174 */ 				
/* 1175 */ 				methods.applyMasonry(container, selector, function()
/* 1176 */ 				{
/* 1177 */ 					container.css({overflow:'visible'});
/* 1178 */ 				});
/* 1179 */ 				
/* 1180 */ 				return false;
/* 1181 */ 		},
/* 1182 */ 		
/* 1183 */ 		applyMasonry: function(container, selector, callback)
/* 1184 */ 		{
/* 1185 */ 			var filters = selector ? {filter: '.'+selector} : {};
/* 1186 */ 			
/* 1187 */ 			container.isotope(filters, function()
/* 1188 */ 			{
/* 1189 */ 				$(window).trigger('av-height-change');
/* 1190 */ 			});
/* 1191 */ 			
/* 1192 */ 			if(typeof callback == 'function')
/* 1193 */ 			{
/* 1194 */ 				setTimeout(callback, 0);
/* 1195 */ 			}
/* 1196 */ 		},
/* 1197 */ 		
/* 1198 */ 		show_bricks: function(bricks, callback)
/* 1199 */ 		{
/* 1200 */ 			bricks.each(function(i)

/* shortcodes.js */

/* 1201 */ 			{
/* 1202 */ 				var currentLink 	= $(this),
/* 1203 */ 					browserPrefix 	= $.avia_utilities.supports('transition'),
/* 1204 */ 					multiplier		= isMobile ? 0 : 100;
/* 1205 */ 				
/* 1206 */ 				setTimeout(function()
/* 1207 */ 				{
/* 1208 */ 					if(browserPrefix === false)
/* 1209 */ 					{
/* 1210 */ 						currentLink.css({visibility:"visible", opacity:0}).animate({opacity:1},1500);
/* 1211 */ 					}
/* 1212 */ 					else
/* 1213 */ 					{
/* 1214 */ 						currentLink.addClass('av-masonry-item-loaded');
/* 1215 */ 					}
/* 1216 */ 					
/* 1217 */ 					if(i == bricks.length - 1 && typeof callback == 'function')
/* 1218 */ 					{
/* 1219 */ 						callback.call();
/* 1220 */ 						$(window).trigger('av-height-change');
/* 1221 */ 					}
/* 1222 */ 					
/* 1223 */ 				}, (multiplier * i));
/* 1224 */ 			});
/* 1225 */ 		},
/* 1226 */ 		
/* 1227 */ 		loadMore: function(e)
/* 1228 */ 		{
/* 1229 */ 			e.preventDefault();
/* 1230 */ 			
/* 1231 */ 			if(loading) return false;
/* 1232 */ 			
/* 1233 */ 			loading = true;
/* 1234 */ 		
/* 1235 */ 			var current		= $(this),
/* 1236 */ 		  		data		= current.data(),
/* 1237 */ 		  		masonry 	= current.parents('.av-masonry:eq(0)'),
/* 1238 */ 		  		container	= masonry.find('.av-masonry-container'),
/* 1239 */ 		  		loader		= $.avia_utilities.loading(),
/* 1240 */ 		  		finished	= function(){ loading = false; loader.hide(); the_body.trigger('av_resize_finished'); };
/* 1241 */ 		  	
/* 1242 */ 		  	//calculate a new offset	
/* 1243 */ 		  	if(!data.offset){ data.offset = 0; }	
/* 1244 */ 		  	data.offset += data.items;
/* 1245 */ 		  	data.action = 'avia_ajax_masonry_more';
/* 1246 */ 		  	
/* 1247 */ 		  	 $.ajax({
/* 1248 */ 				url: avia_framework_globals.ajaxurl,
/* 1249 */ 				type: "POST",
/* 1250 */ 				data:data,

/* shortcodes.js */

/* 1251 */ 				beforeSend: function()
/* 1252 */ 				{
/* 1253 */ 					loader.show();
/* 1254 */ 				},
/* 1255 */ 				success: function(response)
/* 1256 */ 				{
/* 1257 */ 					if(response.indexOf("{av-masonry-loaded}") !== -1)
/* 1258 */ 					{
/* 1259 */ 						//fetch the response. if any php warnings were displayed before rendering of the items the are removed by the string split
/* 1260 */ 						var response  = response.split('{av-masonry-loaded}'),
/* 1261 */ 							new_items = $(response.pop()).filter('.isotope-item');
/* 1262 */ 							
/* 1263 */ 							//check if we got more items than we need. if not we have reached the end of items
/* 1264 */ 							if(new_items.length > data.items)
/* 1265 */ 							{
/* 1266 */ 								new_items = new_items.not(':last');
/* 1267 */ 							}
/* 1268 */ 							else
/* 1269 */ 							{
/* 1270 */ 								current.addClass('av-masonry-no-more-items');
/* 1271 */ 							}
/* 1272 */ 							
/* 1273 */ 							var load_container = $('<div class="loadcontainer"></div>').append(new_items);
/* 1274 */ 							
/* 1275 */ 							
/* 1276 */ 							
/* 1277 */ 							$.avia_utilities.preload({container: load_container, single_callback:  function()
/* 1278 */ 							{
/* 1279 */ 								var links = masonry.find('.av-masonry-sort a'),
/* 1280 */ 									    filter_container = masonry.find('.av-sort-by-term');
/* 1281 */ 								
/* 1282 */ 								filter_container.hide();
/* 1283 */ 								
/* 1284 */ 								loader.hide();
/* 1285 */ 								container.isotope( 'insert', new_items); 
/* 1286 */ 								$.avia_utilities.avia_ajax_call(container);
/* 1287 */ 								setTimeout( function(){ methods.show_bricks( new_items , finished); },150);
/* 1288 */ 
/* 1289 */ 								if(links)
/* 1290 */ 								{
/* 1291 */ 									$(links).each(function(filterlinkindex){
/* 1292 */ 										var filterlink = $(this),
/* 1293 */ 										sort = filterlink.data('filter');
/* 1294 */ 
/* 1295 */ 										if(new_items)
/* 1296 */ 										{
/* 1297 */ 										    $(new_items).each(function(itemindex){
/* 1298 */ 										        var item = $(this);
/* 1299 */ 										
/* 1300 */ 										        if(item.hasClass(sort))

/* shortcodes.js */

/* 1301 */ 										        {
/* 1302 */ 										            var term_count = filterlink.find('.avia-term-count').text();
/* 1303 */ 										            filterlink.find('.avia-term-count').text(' ' + (parseInt(term_count) + 1) + ' ');
/* 1304 */ 										
/* 1305 */ 										            if(filterlink.hasClass('avia_hide_sort'))
/* 1306 */ 										            {
/* 1307 */ 										                filterlink.removeClass('avia_hide_sort').addClass('avia_show_sort');
/* 1308 */ 										                masonry.find('.av-masonry-sort .'+sort+'_sep').removeClass('avia_hide_sort').addClass('avia_show_sort');
/* 1309 */ 										                masonry.find('.av-masonry-sort .av-sort-by-term').removeClass('hidden');
/* 1310 */ 										            }
/* 1311 */ 										        }
/* 1312 */ 										    });
/* 1313 */ 										}
/* 1314 */ 									});
/* 1315 */ 
/* 1316 */ 								}
/* 1317 */ 
/* 1318 */                                 				filter_container.fadeIn();
/* 1319 */ 							}
/* 1320 */ 						});
/* 1321 */ 					}
/* 1322 */ 					else
/* 1323 */ 					{
/* 1324 */ 						finished();
/* 1325 */ 					}
/* 1326 */ 				},
/* 1327 */ 				error: finished,
/* 1328 */ 				complete: function()
/* 1329 */ 				{
/* 1330 */ 				    
/* 1331 */ 				}
/* 1332 */ 			});
/* 1333 */ 		}
/* 1334 */ 
/* 1335 */ 	};
/* 1336 */ 
/* 1337 */ 	return this.each(function()
/* 1338 */ 	{	
/* 1339 */ 		var masonry			= $(this),
/* 1340 */ 			container 		= masonry.find('.av-masonry-container'),
/* 1341 */ 			bricks			= masonry.find('.isotope-item'), 
/* 1342 */ 			filter			= masonry.find('.av-masonry-sort').css({visibility:"visible", opacity:0}).on('click', 'a',  methods.masonry_filter),
/* 1343 */ 			load_more		= masonry.find('.av-masonry-load-more').css({visibility:"visible", opacity:0});
/* 1344 */ 			
/* 1345 */ 		$.avia_utilities.preload({container: container, single_callback:  function()
/* 1346 */ 		{
/* 1347 */ 			var start_animation = function()
/* 1348 */ 			{ 
/* 1349 */ 				filter.animate({opacity:1}, 400);
/* 1350 */ 				

/* shortcodes.js */

/* 1351 */ 				//fix for non aligned elements because of scrollbar
/* 1352 */ 				if(container.outerHeight() + container.offset().top + $('#footer').outerHeight() > $(window).height())
/* 1353 */ 				{
/* 1354 */ 					$('html').css({'overflow-y':'scroll'});
/* 1355 */ 				}
/* 1356 */ 				
/* 1357 */ 				methods.applyMasonry(container, false, function()
/* 1358 */ 				{
/* 1359 */ 					masonry.addClass('avia_sortable_active');
/* 1360 */ 					container.removeClass('av-js-disabled '); 
/* 1361 */ 				});
/* 1362 */ 				
/* 1363 */ 				methods.show_bricks(bricks, function()
/* 1364 */ 				{
/* 1365 */ 					load_more.css({opacity:1}).on('click',  methods.loadMore);
/* 1366 */ 				});
/* 1367 */ 				
/* 1368 */ 				//container.isotope( 'reLayout' );
/* 1369 */ 
/* 1370 */ 			};
/* 1371 */ 			
/* 1372 */ 			if(isMobile)
/* 1373 */ 			{
/* 1374 */ 				start_animation();
/* 1375 */ 			}
/* 1376 */ 			else
/* 1377 */ 			{
/* 1378 */ 				masonry.waypoint(start_animation , { offset: '80%'} );
/* 1379 */ 			}
/* 1380 */ 					
/* 1381 */ 			// update columnWidth on window resize
/* 1382 */ 			$(window).on( 'debouncedresize', function()
/* 1383 */ 			{
/* 1384 */ 			  	methods.applyMasonry(container, false, function()
/* 1385 */ 				{
/* 1386 */ 					masonry.addClass('avia_sortable_active');
/* 1387 */ 				});
/* 1388 */ 			});
/* 1389 */ 		}
/* 1390 */ 	});
/* 1391 */ 		
/* 1392 */ 		
/* 1393 */ 	});
/* 1394 */ };
/* 1395 */ 
/* 1396 */ 
/* 1397 */ 
/* 1398 */ 
/* 1399 */ 	
/* 1400 */ // -------------------------------------------------------------------------------------------

/* shortcodes.js */

/* 1401 */ // Avia AJAX Portfolio
/* 1402 */ // -------------------------------------------------------------------------------------------
/* 1403 */ 
/* 1404 */ (function($)
/* 1405 */ { 
/* 1406 */ 	"use strict";
/* 1407 */ 	$.avia_utilities = $.avia_utilities || {};
/* 1408 */ 	
/* 1409 */ 	$.fn.avia_portfolio_preview = function(passed_options) 
/* 1410 */ 	{	
/* 1411 */ 		var win  = $(window),
/* 1412 */ 		the_body = $('body'),
/* 1413 */ 		isMobile = $.avia_utilities.isMobile,
/* 1414 */ 		defaults = 
/* 1415 */ 		{
/* 1416 */ 			open_in:	'.portfolio-details-inner',
/* 1417 */ 			easing:		'easeOutQuint',
/* 1418 */ 			timing:		800,
/* 1419 */ 			transition:	'slide' // 'fade' or 'slide'
/* 1420 */ 		},
/* 1421 */ 		
/* 1422 */ 		options = $.extend({}, defaults, passed_options);
/* 1423 */ 	
/* 1424 */ 		return this.each(function()
/* 1425 */ 		{	
/* 1426 */ 			var container			= $(this),
/* 1427 */ 				portfolio_id		= container.data('portfolio-id'),
/* 1428 */ 				target_wrap			= $('.portfolio_preview_container[data-portfolio-id="' + portfolio_id + '"]'),
/* 1429 */ 				target_container	= target_wrap.find(options.open_in),
/* 1430 */ 				items				= container.find('.grid-entry'),
/* 1431 */ 				content_retrieved	= {},
/* 1432 */ 				is_open				= false,
/* 1433 */ 				animating			= false,
/* 1434 */ 				index_open			= false,
/* 1435 */ 				ajax_call			= false,
/* 1436 */ 				methods,
/* 1437 */ 				controls,
/* 1438 */ 				loader				= $.avia_utilities.loading();
/* 1439 */ 				
/* 1440 */ 			methods = 
/* 1441 */ 			{
/* 1442 */ 				load_item: function(e)
/* 1443 */ 				{
/* 1444 */ 					e.preventDefault();
/* 1445 */ 
/* 1446 */ 					var link			= $(this),
/* 1447 */ 						post_container	= link.parents('.post-entry:eq(0)'),
/* 1448 */ 						post_id			= "ID_" + post_container.data('ajax-id'),
/* 1449 */ 						clickedIndex	= items.index(post_container);
/* 1450 */ 					

/* shortcodes.js */

/* 1451 */ 					//check if current item is the clicked item or if we are currently animating
/* 1452 */ 					if(post_id === is_open || animating == true) 
/* 1453 */ 					{
/* 1454 */ 						return false;
/* 1455 */ 					}
/* 1456 */ 					
/* 1457 */ 					animating = true;
/* 1458 */ 					
/* 1459 */ 					container.find('.active_portfolio_item').removeClass('active_portfolio_item');
/* 1460 */ 					post_container.addClass('active_portfolio_item');
/* 1461 */ 					loader.show();
/* 1462 */ 					
/* 1463 */ 					methods.ajax_get_contents(post_id, clickedIndex);
/* 1464 */ 				},
/* 1465 */ 				
/* 1466 */ 				scroll_top: function()
/* 1467 */ 				{
/* 1468 */ 					setTimeout(function()
/* 1469 */ 					{
/* 1470 */ 						var target_offset = target_wrap.offset().top - 175,
/* 1471 */ 							window_offset = win.scrollTop();
/* 1472 */ 											
/* 1473 */ 						if(window_offset > target_offset || target_offset - window_offset > 100  )
/* 1474 */ 						{
/* 1475 */ 							$('html:not(:animated),body:not(:animated)').animate({ scrollTop: target_offset }, options.timing, options.easing);
/* 1476 */ 						}
/* 1477 */ 					},10);
/* 1478 */ 				},
/* 1479 */ 				
/* 1480 */ 				attach_item: function(post_id)
/* 1481 */ 				{
/* 1482 */ 					content_retrieved[post_id] = $(content_retrieved[post_id]).appendTo(target_container);
/* 1483 */ 					ajax_call = true;
/* 1484 */ 				},
/* 1485 */ 				
/* 1486 */ 				remove_video: function()
/* 1487 */ 				{
/* 1488 */ 					var del = target_wrap.find('iframe, .avia-video').parents('.ajax_slide:not(.open_slide)');	
/* 1489 */ 					
/* 1490 */ 						if(del.length > 0)
/* 1491 */ 						{
/* 1492 */ 							del.remove();
/* 1493 */ 							content_retrieved["ID_" + del.data('slideId')] = undefined;
/* 1494 */ 						}
/* 1495 */ 				},
/* 1496 */ 				
/* 1497 */ 				show_item: function(post_id, clickedIndex)
/* 1498 */ 				{
/* 1499 */ 				
/* 1500 */ 					//check if current item is the clicked item or if we are currently animating

/* shortcodes.js */

/* 1501 */ 					if(post_id === is_open) 
/* 1502 */ 					{
/* 1503 */ 						return false;
/* 1504 */ 					}
/* 1505 */ 					animating = true;
/* 1506 */ 					
/* 1507 */ 					
/* 1508 */ 					loader.hide();
/* 1509 */ 					
/* 1510 */ 					if(false === is_open)
/* 1511 */ 					{
/* 1512 */ 						target_wrap.addClass('open_container');
/* 1513 */ 						content_retrieved[post_id].addClass('open_slide');
/* 1514 */ 						
/* 1515 */ 						methods.scroll_top();
/* 1516 */ 						
/* 1517 */ 						target_wrap.css({display:'none'}).slideDown(options.timing, options.easing, function()
/* 1518 */ 						{
/* 1519 */ 							if(ajax_call)
/* 1520 */ 							{ 
/* 1521 */ 								activate_shortcode_scripts(content_retrieved[post_id]); 
/* 1522 */ 								$.avia_utilities.avia_ajax_call(content_retrieved[post_id]);
/* 1523 */ 								the_body.trigger('av_resize_finished');
/* 1524 */ 								ajax_call = false; 
/* 1525 */ 							}
/* 1526 */ 							
/* 1527 */ 							methods.remove_video();
/* 1528 */ 						});
/* 1529 */ 						
/* 1530 */ 							index_open	= clickedIndex;
/* 1531 */ 							is_open		= post_id;
/* 1532 */ 							animating	= false;
/* 1533 */ 						
/* 1534 */ 					}
/* 1535 */ 					else
/* 1536 */ 					{
/* 1537 */ 						methods.scroll_top();
/* 1538 */ 					
/* 1539 */ 						var initCSS = { zIndex:3 },
/* 1540 */ 							easing	= options.easing;
/* 1541 */ 							
/* 1542 */ 						if(index_open > clickedIndex) { initCSS.left = '-110%'; }
/* 1543 */ 						if(options.transition === 'fade'){ initCSS.left = '0%'; initCSS.opacity = 0; easing = 'easeOutQuad'; }
/* 1544 */ 						
/* 1545 */ 						//fixate height for container during animation
/* 1546 */ 						target_container.height(target_container.height()); //outerHeight = border problems?
/* 1547 */ 						
/* 1548 */ 						content_retrieved[post_id].css(initCSS).avia_animate({'left':"0%", opacity:1}, options.timing, easing);
/* 1549 */ 						content_retrieved[is_open].avia_animate({opacity:0}, options.timing, easing, function()
/* 1550 */ 						{

/* shortcodes.js */

/* 1551 */ 							content_retrieved[is_open].attr({'style':""}).removeClass('open_slide');
/* 1552 */ 							content_retrieved[post_id].addClass('open_slide');
/* 1553 */ 																										  //+ 2 fixes border problem (slides move up and down 2 px on transition)
/* 1554 */ 							target_container.avia_animate({height: content_retrieved[post_id].outerHeight() + 2}, options.timing/2, options.easing, function()
/* 1555 */ 							{
/* 1556 */ 								target_container.attr({'style':""});
/* 1557 */ 								is_open		= post_id;
/* 1558 */ 								index_open	= clickedIndex;
/* 1559 */ 								animating	= false;
/* 1560 */ 								
/* 1561 */ 								methods.remove_video();
/* 1562 */ 								if(ajax_call)
/* 1563 */ 								{ 
/* 1564 */ 									the_body.trigger('av_resize_finished');
/* 1565 */ 									activate_shortcode_scripts(content_retrieved[post_id]); 
/* 1566 */ 									$.avia_utilities.avia_ajax_call(content_retrieved[post_id]);
/* 1567 */ 									ajax_call = false; 
/* 1568 */ 								}
/* 1569 */ 	
/* 1570 */ 							});
/* 1571 */ 							
/* 1572 */ 						});		
/* 1573 */ 					}
/* 1574 */ 				},
/* 1575 */ 				
/* 1576 */ 				ajax_get_contents: function(post_id, clickedIndex)
/* 1577 */ 				{
/* 1578 */ 					if(content_retrieved[post_id] !== undefined)
/* 1579 */ 					{
/* 1580 */ 						methods.show_item(post_id, clickedIndex);
/* 1581 */ 						return;
/* 1582 */ 					}
/* 1583 */ 					
/* 1584 */ 					content_retrieved[post_id] = $('#avia-tmpl-portfolio-preview-' + post_id.replace(/ID_/,"")).html();
/* 1585 */ 					
/* 1586 */ 					//this line is necessary to prevent w3 total cache from messing up the portfolio if inline js is compressed
/* 1587 */ 					content_retrieved[post_id] = content_retrieved[post_id].replace('/*<![CDATA[*/','').replace('*]]>','');
/* 1588 */ 					
/* 1589 */ 					methods.attach_item(post_id);
/* 1590 */ 					
/* 1591 */ 					$.avia_utilities.preload({container: content_retrieved[post_id] , single_callback:  function(){ methods.show_item(post_id, clickedIndex); }});
/* 1592 */ 				},
/* 1593 */ 				
/* 1594 */ 				add_controls: function()
/* 1595 */ 				{
/* 1596 */ 					controls = target_wrap.find('.ajax_controlls');
/* 1597 */ 
/* 1598 */ 					target_wrap.avia_keyboard_controls({27:'.avia_close', 37:'.ajax_previous', 39:'.ajax_next'});
/* 1599 */ 					//target_wrap.avia_swipe_trigger({prev:'.ajax_previous', next:'.ajax_next'});
/* 1600 */ 					

/* shortcodes.js */

/* 1601 */ 					items.each(function(){
/* 1602 */ 					
/* 1603 */ 						var current = $(this), overlay;
/* 1604 */ 						
/* 1605 */ 						current.addClass('no_combo').bind('click', function(event)
/* 1606 */ 						{
/* 1607 */ 							overlay = current.find('.slideshow_overlay');
/* 1608 */ 							
/* 1609 */ 							if(overlay.length)
/* 1610 */ 							{
/* 1611 */ 								event.stopPropagation();
/* 1612 */ 								methods.load_item.apply(current.find('a:eq(0)'));
/* 1613 */ 								return false;
/* 1614 */ 							}
/* 1615 */ 						});
/* 1616 */ 						
/* 1617 */ 						
/* 1618 */ 					});
/* 1619 */ 				},
/* 1620 */ 				
/* 1621 */ 				control_click: function()
/* 1622 */ 				{
/* 1623 */ 					var showItem,
/* 1624 */ 						activeID = container.find('.active_portfolio_item').data('ajax-id'),
/* 1625 */ 						active   = container.find('.post-entry-'+activeID);
/* 1626 */ 				
/* 1627 */ 					switch(this.hash)
/* 1628 */ 					{
/* 1629 */ 						case '#next': 
/* 1630 */ 						
/* 1631 */ 							showItem = active.nextAll('.post-entry:visible:eq(0)').find('a:eq(0)');
/* 1632 */ 							if(!showItem.length) { showItem = $('.post-entry:visible:eq(0)', container).find('a:eq(0)'); }
/* 1633 */ 							showItem.trigger('click');
/* 1634 */ 					
/* 1635 */ 						break;
/* 1636 */ 						case '#prev': 
/* 1637 */ 							
/* 1638 */ 							showItem = active.prevAll('.post-entry:visible:eq(0)').find('a:eq(0)');
/* 1639 */ 							if(!showItem.length) { showItem = $('.post-entry:visible:last', container).find('a:eq(0)'); }
/* 1640 */ 							showItem.trigger('click');
/* 1641 */ 						
/* 1642 */ 						break;
/* 1643 */ 						case '#close':
/* 1644 */ 						
/* 1645 */ 							animating = true;
/* 1646 */ 							
/* 1647 */ 							target_wrap.slideUp( options.timing, options.easing, function()
/* 1648 */ 							{ 
/* 1649 */ 								container.find('.active_portfolio_item').removeClass('active_portfolio_item');
/* 1650 */ 								content_retrieved[is_open].attr({'style':""}).removeClass('open_slide');

/* shortcodes.js */

/* 1651 */ 								target_wrap.removeClass('open_container');
/* 1652 */ 								animating = is_open = index_open = false;
/* 1653 */ 								methods.remove_video();
/* 1654 */ 								the_body.trigger('av_resize_finished');
/* 1655 */ 							});
/* 1656 */ 							
/* 1657 */ 						break;
/* 1658 */ 					}
/* 1659 */ 					return false;
/* 1660 */ 				},
/* 1661 */ 				
/* 1662 */ 				
/* 1663 */ 				resize_reset: function()
/* 1664 */ 				{
/* 1665 */ 					if(is_open === false)
/* 1666 */ 					{
/* 1667 */ 						target_container.html('');
/* 1668 */ 						content_retrieved	= [];
/* 1669 */ 					}
/* 1670 */ 				}
/* 1671 */ 			};
/* 1672 */ 			
/* 1673 */ 			methods.add_controls();
/* 1674 */ 			
/* 1675 */ 			container.on("click", "a", methods.load_item);
/* 1676 */ 			controls.on("click", "a", methods.control_click);
/* 1677 */ 			if(jQuery.support.leadingWhitespace) { win.bind('debouncedresize', methods.resize_reset); }
/* 1678 */ 			
/* 1679 */ 		});
/* 1680 */ 	};
/* 1681 */ }(jQuery));	
/* 1682 */ 
/* 1683 */ 
/* 1684 */ 
/* 1685 */ // -------------------------------------------------------------------------------------------
/* 1686 */ // Fullscreen Slideshow 
/* 1687 */ // 
/* 1688 */ // extends avia slideshow script with a more sophisticated preloader and fixed size for slider
/* 1689 */ // -------------------------------------------------------------------------------------------
/* 1690 */ 
/* 1691 */ 
/* 1692 */ 	$.AviaFullscreenSlider  =  function(options, slider)
/* 1693 */ 	{
/* 1694 */ 	    this.$slider  	= $( slider );
/* 1695 */ 	    this.$inner	  	= this.$slider.find('.avia-slideshow-inner');
/* 1696 */ 	    this.$caption 	= this.$inner.find('.avia-slide-wrap .caption_container');
/* 1697 */ 	    this.$win	  	= $( window );
/* 1698 */ 	    this.isMobile 	= $.avia_utilities.isMobile;
/* 1699 */ 	    this.property 	= {};
/* 1700 */ 	    this.scrollPos	= "0";

/* shortcodes.js */

/* 1701 */ 	    this.transform3d= document.documentElement.className.indexOf('avia_transform3d') !== -1 ? true : false;
/* 1702 */ 	    
/* 1703 */ 	    if($.avia_utilities.supported.transition === undefined)
/* 1704 */ 		{
/* 1705 */ 			$.avia_utilities.supported.transition = $.avia_utilities.supports('transition');
/* 1706 */ 		}
/* 1707 */ 		
/* 1708 */ 	    this._init( options );
/* 1709 */ 	}
/* 1710 */ 
/* 1711 */ 	$.AviaFullscreenSlider.defaults  = {
/* 1712 */ 
/* 1713 */ 		//height of the slider in percent
/* 1714 */ 		height: 100,
/* 1715 */ 		
/* 1716 */ 		//subtract elements from the height
/* 1717 */ 		subtract: '#wpadminbar, #header, #main>.title_container'
/* 1718 */ 		
/* 1719 */ 		
/* 1720 */ 	};
/* 1721 */ 
/* 1722 */   	$.AviaFullscreenSlider.prototype =
/* 1723 */     {
/* 1724 */     	_init: function( options )
/* 1725 */     	{
/* 1726 */     		var _self = this;
/* 1727 */     		//set the default options
/* 1728 */     		this.options = $.extend( true, {}, $.AviaFullscreenSlider.defaults, options );
/* 1729 */     		
/* 1730 */     		if(this.$slider.data('slide_height')) this.options.height = this.$slider.data('slide_height');
/* 1731 */     		
/* 1732 */     		//elements that get subtracted from the image height
/* 1733 */     		this.$subtract = $(this.options.subtract);
/* 1734 */     		
/* 1735 */     		
/* 1736 */ 			// set the slideshow size
/* 1737 */ 			this._setSize(); 
/* 1738 */     		
/* 1739 */ 			// set resizing script on window resize
/* 1740 */ 			this.$win.on( 'debouncedresize',  $.proxy( this._setSize, this) );
/* 1741 */     		
/* 1742 */     		//parallax scroll if element if leaving viewport
/* 1743 */ 			setTimeout(function()
/* 1744 */ 			{
/* 1745 */ 				if(!_self.isMobile) //disable parallax scrolling on mobile
/* 1746 */     			_self.$win.on( 'scroll',  function(){ window.requestAnimationFrame( $.proxy( _self._parallax_scroll, _self) )} );
/* 1747 */     			
/* 1748 */     		},100);
/* 1749 */ 			/**/
/* 1750 */     		

/* shortcodes.js */

/* 1751 */ 			//activate the defaule slider
/* 1752 */ 			this.$slider.aviaSlider({bg_slider:true});
/* 1753 */ 			
/* 1754 */ 			
/* 1755 */     	},
/* 1756 */     	
/* 1757 */     	_fetch_properties: function(slide_height)
/* 1758 */ 		{
/* 1759 */ 			this.property.offset 	= this.$slider.offset().top;
/* 1760 */ 			this.property.wh 		= this.$win.height();
/* 1761 */ 			this.property.height 	= slide_height || this.$slider.outerHeight();
/* 1762 */ 			
/* 1763 */ 			//re-position the slider
/* 1764 */ 			this._parallax_scroll();
/* 1765 */ 		},
/* 1766 */     	
/* 1767 */     	_setSize: function( )
/* 1768 */     	{	
/* 1769 */     		if(!$.fn.avia_browser_height)
/* 1770 */     		{
/* 1771 */     	
/* 1772 */     		var viewport		= this.$win.height(),
/* 1773 */     			slide_height	= Math.ceil( (viewport / 100) * this.options.height );
/* 1774 */ 			
/* 1775 */ 			if(this.$subtract.length && this.options.height == 100)
/* 1776 */ 			{
/* 1777 */ 	    		this.$subtract.each(function()
/* 1778 */ 	    		{
/* 1779 */ 	    			slide_height -= this.offsetHeight - 0.5;
/* 1780 */ 	    		});
/* 1781 */     		}
/* 1782 */     		else
/* 1783 */     		{
/* 1784 */     			slide_height -= 1;
/* 1785 */     		}
/* 1786 */     		this.$slider.height(slide_height);
/* 1787 */     		this.$inner.css('padding',0);
/* 1788 */     		}
/* 1789 */     		
/* 1790 */     		
/* 1791 */     		this._fetch_properties(slide_height);
/* 1792 */     		
/* 1793 */     	},
/* 1794 */     	
/* 1795 */     	_parallax_scroll: function(e)
/* 1796 */     	{
/* 1797 */     		if(this.isMobile) return; //disable parallax scrolling on mobile
/* 1798 */     	
/* 1799 */     		var winTop 		= this.$win.scrollTop(),
/* 1800 */     			winBottom	=  winTop + this.property.wh,

/* shortcodes.js */

/* 1801 */     			scrollPos 	= "0", 
/* 1802 */     			prop 		= {}, prop2 = {};
/* 1803 */     		
/* 1804 */     		if(this.property.offset < winTop && winTop <= this.property.offset + this.property.height)
/* 1805 */     		{	
/* 1806 */     			scrollPos = Math.round( (winTop - this.property.offset) * 0.7 );
/* 1807 */     		}
/* 1808 */     		
/* 1809 */     		if(this.scrollPos != scrollPos)
/* 1810 */     		{	
/* 1811 */     			//slide background parallax
/* 1812 */     			this.scrollPos = scrollPos;
/* 1813 */     			if(this.transform3d)
/* 1814 */     			{
/* 1815 */     				prop[$.avia_utilities.supported.transition+"transform"] = "translate3d(0px,"+ scrollPos +"px,0px)";
/* 1816 */     			}
/* 1817 */     			else
/* 1818 */     			{
/* 1819 */     				prop[$.avia_utilities.supported.transition+"transform"] = "translate(0px,"+ scrollPos +"px)";
/* 1820 */     			}
/* 1821 */     			
/* 1822 */     			this.$inner.css(prop);
/* 1823 */     			
/* 1824 */     			//slider caption parallax
/* 1825 */     			
/* 1826 */ 				// prop2[$.avia_utilities.supported.transition+"transform"] = "translate(0px,-"+ ( scrollPos * 1) +"px)";
/* 1827 */ 				/*
/* 1828 *| 	    		prop2['opacity'] = Math.ceil((this.$slider.height() - (scrollPos * 2)) / 100)/ 10;
/* 1829 *| 	    		prop2['opacity'] = prop2['opacity'] < 0 ? 0 : prop2['opacity'];
/* 1830 *| 	    		this.$caption.css(prop2);
/* 1831 *| 				*/
/* 1832 */     		}
/* 1833 */     	}
/* 1834 */     };
/* 1835 */ 
/* 1836 */ 
/* 1837 */ 
/* 1838 */ $.fn.aviaFullscreenSlider = function( options )
/* 1839 */ {
/* 1840 */ 	return this.each(function()
/* 1841 */ 	{
/* 1842 */ 		var active = $.data( this, 'aviaFullscreenSlider' );
/* 1843 */ 
/* 1844 */ 		if(!active)
/* 1845 */ 		{
/* 1846 */ 			//make sure that the function doesnt get aplied a second time
/* 1847 */ 			$.data( this, 'aviaFullscreenSlider', 1 );
/* 1848 */ 			
/* 1849 */ 			//create the preparations for fullscreen slider
/* 1850 */ 			new $.AviaFullscreenSlider( options, this );

/* shortcodes.js */

/* 1851 */ 		}
/* 1852 */ 	});
/* 1853 */ }
/* 1854 */ 	
/* 1855 */ // -------------------------------------------------------------------------------------------
/* 1856 */ // makes sure that the fixed container height is removed once the layerslider is loaded, so it adapts to the screen resolution
/* 1857 */ // -------------------------------------------------------------------------------------------
/* 1858 */ 
/* 1859 */ 	$.AviaParallaxElement  =  function(options, element)
/* 1860 */ 	{
/* 1861 */ 	    this.$el  	  	= $( element ).addClass('active-parallax');
/* 1862 */ 	    this.$win	  	= $( window );
/* 1863 */ 	    this.$parent  	= this.$el.parent();
/* 1864 */ 	    this.property	= {};
/* 1865 */ 	    this.isMobile 	= $.avia_utilities.isMobile;
/* 1866 */ 	    this.ratio		= this.$el.data('avia-parallax-ratio') || 0.5;
/* 1867 */ 	    this.transform  = document.documentElement.className.indexOf('avia_transform') !== -1 ? true : false;
/* 1868 */ 	    this.transform3d= document.documentElement.className.indexOf('avia_transform3d') !== -1 ? true : false;
/* 1869 */ 	    
/* 1870 */ 	    if($.avia_utilities.supported.transition === undefined)
/* 1871 */ 		{
/* 1872 */ 			$.avia_utilities.supported.transition = $.avia_utilities.supports('transition');
/* 1873 */ 		}
/* 1874 */ 	    
/* 1875 */ 	    this._init( options );
/* 1876 */ 	}
/* 1877 */ 	
/* 1878 */ 	$.AviaParallaxElement.prototype = {
/* 1879 */ 	
/* 1880 */ 		_init: function( options )
/* 1881 */     	{
/* 1882 */     		var _self = this;
/* 1883 */ 			if(_self.isMobile)
/* 1884 */ 			{
/* 1885 */ 				return; //disable parallax scrolling on mobile
/* 1886 */ 			}
/* 1887 */ 			
/* 1888 */ 			
/* 1889 */ 			
/* 1890 */ 			//fetch window constants
/* 1891 */ 			this._fetch_properties();
/* 1892 */ 			this.$win.on("debouncedresize av-height-change",  $.proxy( _self._fetch_properties, _self));
/* 1893 */ 			
/* 1894 */ 			//activate the scrolling
/* 1895 */ 			setTimeout(function()
/* 1896 */ 			{
/* 1897 */     			_self.$win.on( 'scroll',  function(){ window.requestAnimationFrame( $.proxy( _self._parallax_scroll, _self) )} );
/* 1898 */     			
/* 1899 */     		},100);
/* 1900 */ 		},

/* shortcodes.js */

/* 1901 */ 		
/* 1902 */ 		_fetch_properties: function()
/* 1903 */ 		{
/* 1904 */ 			this.property.offset 	= this.$parent.offset().top;
/* 1905 */ 			this.property.wh 		= this.$win.height();
/* 1906 */ 			this.property.height 	= this.$parent.outerHeight();
/* 1907 */ 			
/* 1908 */ 			//set the height of the element based on the windows height, offset ratio and parent height
/* 1909 */ 			this.$el.height(Math.ceil((this.property.wh * this.ratio) + this.property.height));
/* 1910 */ 			
/* 1911 */ 			//re-position the element
/* 1912 */ 			this._parallax_scroll();
/* 1913 */ 		},
/* 1914 */ 		
/* 1915 */ 		_parallax_scroll: function(e)
/* 1916 */     	{
/* 1917 */     		var winTop		=  this.$win.scrollTop(),
/* 1918 */     			winBottom	=  winTop + this.property.wh,
/* 1919 */     			scrollPos 	= "0", 
/* 1920 */     			prop = {};
/* 1921 */     		
/* 1922 */     		//shift element when it moves into viewport
/* 1923 */     		if(this.property.offset < winBottom && winTop <= this.property.offset + this.property.height)
/* 1924 */     		{	
/* 1925 */     			scrollPos = Math.round( (winBottom - this.property.offset) * this.ratio );
/* 1926 */     			
/* 1927 */     			//parallax movement via backround position change, although
/* 1928 */     			if(this.transform3d)
/* 1929 */     			{
/* 1930 */     				prop[$.avia_utilities.supported.transition+"transform"] = "translate3d(0px,"+ scrollPos +"px, 0px)";
/* 1931 */     			}
/* 1932 */     			else if(this.transform)
/* 1933 */     			{
/* 1934 */     				prop[$.avia_utilities.supported.transition+"transform"] = "translate(0px,"+ scrollPos +"px)";
/* 1935 */     			}
/* 1936 */     			else
/* 1937 */     			{
/* 1938 */     				prop["background-position"] = "0px "+ scrollPos +"px";
/* 1939 */     			}
/* 1940 */ 	    		
/* 1941 */ 	    		this.$el.css(prop);
/* 1942 */     		}
/* 1943 */     	}
/* 1944 */ 	};
/* 1945 */ 
/* 1946 */ 
/* 1947 */ $.fn.avia_parallax = function(options)
/* 1948 */ {
/* 1949 */ 	
/* 1950 */ 	return this.each(function()

/* shortcodes.js */

/* 1951 */     	{
/* 1952 */     		var self = $.data( this, 'aviaParallax' );
/* 1953 */ 
/* 1954 */     		if(!self)
/* 1955 */     		{
/* 1956 */     			self = $.data( this, 'aviaParallax', new $.AviaParallaxElement( options, this ) );
/* 1957 */     		}
/* 1958 */     	});
/* 1959 */ }
/* 1960 */ 
/* 1961 */ 
/* 1962 */ // -------------------------------------------------------------------------------------------
/* 1963 */ // Helper to allow fixed bgs on mobile
/* 1964 */ // -------------------------------------------------------------------------------------------
/* 1965 */ 
/* 1966 */ $.fn.avia_mobile_fixed = function(options)
/* 1967 */ {
/* 1968 */ 	var isMobile = $.avia_utilities.isMobile;
/* 1969 */ 	if(!isMobile) return;
/* 1970 */ 	
/* 1971 */ 	return this.each(function()
/* 1972 */ 	{
/* 1973 */ 		var current				= $(this).addClass('av-parallax-section'),
/* 1974 */ 			$background 		= current.attr('style'),
/* 1975 */ 			$attachment_class 	= current.data('section-bg-repeat'),
/* 1976 */ 			template			= "";
/* 1977 */ 			
/* 1978 */ 			if($attachment_class == 'stretch' || $attachment_class == 'no-repeat' )
/* 1979 */ 			{
/* 1980 */ 				$attachment_class = " avia-full-stretch"; 
/* 1981 */ 			}
/* 1982 */ 			else
/* 1983 */ 			{
/* 1984 */ 				$attachment_class = ""; 
/* 1985 */ 			}
/* 1986 */ 			
/* 1987 */ 			template = "<div class='av-parallax " + $attachment_class + "' data-avia-parallax-ratio='0.0' style = '" + $background + "' ></div>";
/* 1988 */ 			
/* 1989 */ 			current.prepend(template);
/* 1990 */ 			current.attr('style','');
/* 1991 */ 	});
/* 1992 */ }
/* 1993 */ 
/* 1994 */ 
/* 1995 */ 
/* 1996 */ 
/* 1997 */ 	
/* 1998 */ // -------------------------------------------------------------------------------------------
/* 1999 */ // makes sure that the fixed container height is removed once the layerslider is loaded, so it adapts to the screen resolution
/* 2000 */ // -------------------------------------------------------------------------------------------

/* shortcodes.js */

/* 2001 */ 
/* 2002 */ $.fn.layer_slider_height_helper = function(options)
/* 2003 */ {
/* 2004 */ 	return this.each(function()
/* 2005 */ 	{
/* 2006 */ 		var container 	= $(this),
/* 2007 */ 			first_div 	= container.find('>div:first'),
/* 2008 */ 			timeout 	= false,
/* 2009 */ 			counter 	= 0,
/* 2010 */ 			reset_size 	= function()
/* 2011 */ 			{
/* 2012 */ 				if(first_div.height() > 0 || counter > 5)
/* 2013 */ 				{
/* 2014 */ 					container.height('auto');
/* 2015 */ 				}
/* 2016 */ 				else
/* 2017 */ 				{
/* 2018 */ 					timeout = setTimeout(reset_size, 500);
/* 2019 */ 					counter++;
/* 2020 */ 				}
/* 2021 */ 			};
/* 2022 */ 
/* 2023 */ 		if(!first_div.length) return;
/* 2024 */ 
/* 2025 */ 		timeout = setTimeout(reset_size, 0);
/* 2026 */ 	});
/* 2027 */ }
/* 2028 */ 
/* 2029 */ // -------------------------------------------------------------------------------------------
/* 2030 */ // testimonial shortcode javascript
/* 2031 */ // -------------------------------------------------------------------------------------------
/* 2032 */ 
/* 2033 */ $.fn.avia_sc_testimonial = function(options)
/* 2034 */ {
/* 2035 */ 	return this.each(function()
/* 2036 */ 	{
/* 2037 */ 		var container = $(this), elements = container.find('.avia-testimonial');
/* 2038 */ 
/* 2039 */ 
/* 2040 */ 		//trigger displaying of thumbnails
/* 2041 */ 		container.on('avia_start_animation', function()
/* 2042 */ 		{
/* 2043 */ 			elements.each(function(i)
/* 2044 */ 			{
/* 2045 */ 				var element = $(this);
/* 2046 */ 				setTimeout(function(){ element.addClass('avia_start_animation') }, (i * 150));
/* 2047 */ 			});
/* 2048 */ 		});
/* 2049 */ 	});
/* 2050 */ }

/* shortcodes.js */

/* 2051 */ 
/* 2052 */ 
/* 2053 */ // -------------------------------------------------------------------------------------------
/* 2054 */ // Progress bar shortcode javascript
/* 2055 */ // -------------------------------------------------------------------------------------------
/* 2056 */ 
/* 2057 */ $.fn.avia_sc_progressbar = function(options)
/* 2058 */ {
/* 2059 */ 	return this.each(function()
/* 2060 */ 	{
/* 2061 */ 		var container = $(this), elements = container.find('.progress');
/* 2062 */ 
/* 2063 */ 
/* 2064 */ 		//trigger displaying of thumbnails
/* 2065 */ 		container.on('avia_start_animation', function()
/* 2066 */ 		{
/* 2067 */ 			elements.each(function(i)
/* 2068 */ 			{
/* 2069 */ 				var element = $(this);
/* 2070 */ 				setTimeout(function(){ element.addClass('avia_start_animation') }, (i * 250));
/* 2071 */ 			});
/* 2072 */ 		});
/* 2073 */ 	});
/* 2074 */ }
/* 2075 */ 
/* 2076 */ // -------------------------------------------------------------------------------------------
/* 2077 */ // Iconlist shortcode javascript
/* 2078 */ // -------------------------------------------------------------------------------------------
/* 2079 */ 
/* 2080 */ $.fn.avia_sc_iconlist = function(options)
/* 2081 */ {
/* 2082 */ 	return this.each(function()
/* 2083 */ 	{
/* 2084 */ 		var iconlist = $(this), elements = iconlist.find('>li');
/* 2085 */ 
/* 2086 */ 
/* 2087 */ 		//trigger displaying of thumbnails
/* 2088 */ 		iconlist.on('avia_start_animation', function()
/* 2089 */ 		{
/* 2090 */ 			elements.each(function(i)
/* 2091 */ 			{
/* 2092 */ 				var element = $(this);
/* 2093 */ 				setTimeout(function(){ element.addClass('avia_start_animation') }, (i * 350));
/* 2094 */ 			});
/* 2095 */ 		});
/* 2096 */ 	});
/* 2097 */ }
/* 2098 */ 
/* 2099 */ 
/* 2100 */ // -------------------------------------------------------------------------------------------

/* shortcodes.js */

/* 2101 */ //  shortcode javascript for delayed animation even when non connected elements are used
/* 2102 */ // -------------------------------------------------------------------------------------------
/* 2103 */ 
/* 2104 */ $.fn.avia_sc_animation_delayed = function(options)
/* 2105 */ {
/* 2106 */ 	var global_timer = 0,
/* 2107 */ 		delay = options.delay || 50;
/* 2108 */ 
/* 2109 */ 	return this.each(function()
/* 2110 */ 	{
/* 2111 */ 		var elements = $(this);
/* 2112 */ 
/* 2113 */ 		//trigger displaying of thumbnails
/* 2114 */ 		elements.on('avia_start_animation', function()
/* 2115 */ 		{
/* 2116 */ 			var element = $(this);
/* 2117 */ 			global_timer ++;
/* 2118 */ 			setTimeout(function(){ element.addClass('avia_start_delayed_animation'); global_timer --; }, (global_timer * delay));
/* 2119 */ 		});
/* 2120 */ 	});
/* 2121 */ }
/* 2122 */ 
/* 2123 */ 
/* 2124 */ // -------------------------------------------------------------------------------------------
/* 2125 */ // Section Height Helper
/* 2126 */ // -------------------------------------------------------------------------------------------
/* 2127 */ 
/* 2128 */ $.fn.avia_browser_height = function()
/* 2129 */ {
/* 2130 */ 	if(!this.length) return;
/* 2131 */ 	
/* 2132 */ 	var win			= $(window),
/* 2133 */ 		html_el		= $('html'),
/* 2134 */ 		subtract	= $('#wpadminbar, #header.av_header_top:not(.html_header_transparency #header), #main>.title_container'),
/* 2135 */ 		css_block	= $("<style type='text/css' id='av-browser-height'></style>").appendTo('head:first'), 
/* 2136 */ 		calc_height = function()
/* 2137 */ 		{
/* 2138 */ 			var css			= "",
/* 2139 */ 				wh100 		= win.height(),
/* 2140 */ 				ww100 		= win.width(),
/* 2141 */ 				wh100_mod 	= wh100,
/* 2142 */ 				whCover		= (wh100 / 9) * 16,
/* 2143 */ 				wwCover		= (ww100 / 16) * 9,
/* 2144 */ 				wh75		= Math.round( wh100 * 0.75 ),
/* 2145 */ 				wh50		= Math.round( wh100 * 0.5  ),
/* 2146 */ 				wh25		= Math.round( wh100 * 0.25 );
/* 2147 */ 			
/* 2148 */ 			subtract.each(function(){ wh100_mod -= this.offsetHeight - 1; });	
/* 2149 */ 			
/* 2150 */ 			var whCoverMod	= (wh100_mod / 9) * 16;

/* shortcodes.js */

/* 2151 */ 			
/* 2152 */ 			//fade in of section content with minimum height once the height has been calculated
/* 2153 */ 			css += ".avia-section.av-minimum-height .container{opacity: 1; }\n";
/* 2154 */ 			
/* 2155 */ 			//various section heights (100-25% as well as 100% - header/adminbar in case its the first builder element)
/* 2156 */ 			css += ".av-minimum-height-100 .container, .avia-fullscreen-slider .avia-slideshow, #top.avia-blank .av-minimum-height-100 .container{height:"+wh100+"px;}\n";
/* 2157 */ 			css += ".av-minimum-height-75 .container	{height:"+wh75+"px;}\n";
/* 2158 */ 			css += ".av-minimum-height-50 .container {height:"+wh50+"px;}\n";
/* 2159 */ 			css += ".av-minimum-height-25 .container {height:"+wh25+"px;}\n";
/* 2160 */ 			css += ".avia-builder-el-0.av-minimum-height-100 .container, .avia-builder-el-0.avia-fullscreen-slider .avia-slideshow{height:"+wh100_mod+"px;}\n";
/* 2161 */ 			
/* 2162 */ 			//fullscreen video calculations
/* 2163 */ 			if(ww100/wh100 < 16/9)
/* 2164 */ 			{
/* 2165 */ 				css += "#top .av-element-cover iframe, #top .av-element-cover embed, #top .av-element-cover object, #top .av-element-cover video{width:"+whCover+"px; left: -"+(whCover - ww100)/2+"px;}\n";
/* 2166 */ 			}
/* 2167 */ 			else
/* 2168 */ 			{
/* 2169 */ 				css += "#top .av-element-cover iframe, #top .av-element-cover embed, #top .av-element-cover object, #top .av-element-cover video{height:"+wwCover+"px; top: -"+(wwCover - wh100)/2+"px;}\n";
/* 2170 */ 			}
/* 2171 */ 			
/* 2172 */ 			if(ww100/wh100_mod < 16/9)
/* 2173 */ 			{
/* 2174 */ 				css += "#top .avia-builder-el-0 .av-element-cover iframe, #top .avia-builder-el-0 .av-element-cover embed, #top .avia-builder-el-0 .av-element-cover object, #top .avia-builder-el-0 .av-element-cover video{width:"+whCoverMod+"px; left: -"+(whCoverMod - ww100)/2+"px;}\n";
/* 2175 */ 			}
/* 2176 */ 			else
/* 2177 */ 			{
/* 2178 */ 				css += "#top .avia-builder-el-0 .av-element-cover iframe, #top .avia-builder-el-0 .av-element-cover embed, #top .avia-builder-el-0 .av-element-cover object, #top .avia-builder-el-0 .av-element-cover video{height:"+wwCover+"px; top: -"+(wwCover - wh100_mod)/2+"px;}\n";
/* 2179 */ 			}
/* 2180 */ 			
/* 2181 */ 			//ie8 needs different insert method
/* 2182 */ 			try{
/* 2183 */ 				css_block.text(css); 
/* 2184 */ 			}
/* 2185 */ 			catch(err){
/* 2186 */ 				css_block.remove();
/* 2187 */ 				css_block = $("<style type='text/css' id='av-browser-height'>"+css+"</style>").appendTo('head:first');
/* 2188 */ 			}
/* 2189 */ 			
/* 2190 */ 			
/* 2191 */ 			setTimeout(function(){ win.trigger('av-height-change'); /*broadcast the height change*/ },100);
/* 2192 */ 		};
/* 2193 */ 	
/* 2194 */ 	win.on( 'debouncedresize', calc_height);
/* 2195 */ 	calc_height();
/* 2196 */ }
/* 2197 */ 
/* 2198 */ // -------------------------------------------------------------------------------------------
/* 2199 */ // Video Section helper
/* 2200 */ // -------------------------------------------------------------------------------------------

/* shortcodes.js */

/* 2201 */ 
/* 2202 */ $.fn.avia_video_section = function()
/* 2203 */ {
/* 2204 */ 	if(!this.length) return;
/* 2205 */ 	
/* 2206 */ 	var elements	= this.length, content = "",
/* 2207 */ 		win			= $(window),
/* 2208 */ 		css_block	= $("<style type='text/css' id='av-section-height'></style>").appendTo('head:first'), 
/* 2209 */ 		calc_height = function(section, counter)
/* 2210 */ 		{
/* 2211 */ 			if(counter === 0) { content = "";}
/* 2212 */ 		
/* 2213 */ 			var css			= "",
/* 2214 */ 				the_id		= '#' +section.attr('id'),
/* 2215 */ 				wh100 		= section.height(),
/* 2216 */ 				ww100 		= section.width(),
/* 2217 */ 				aspect		= section.data('sectionVideoRatio').split(':'),
/* 2218 */ 				video_w		= aspect[0],
/* 2219 */ 				video_h		= aspect[1],
/* 2220 */ 				whCover		= (wh100 / video_h ) * video_w,
/* 2221 */ 				wwCover		= (ww100 / video_w ) * video_h;
/* 2222 */ 			
/* 2223 */ 			//fullscreen video calculations
/* 2224 */ 			if(ww100/wh100 < video_w/video_h)
/* 2225 */ 			{
/* 2226 */ 				css += "#top "+the_id+" .av-section-video-bg iframe, #top "+the_id+" .av-section-video-bg embed, #top "+the_id+" .av-section-video-bg object, #top "+the_id+" .av-section-video-bg video{width:"+whCover+"px; left: -"+(whCover - ww100)/2+"px;}\n";
/* 2227 */ 			}
/* 2228 */ 			else
/* 2229 */ 			{
/* 2230 */ 				css += "#top "+the_id+" .av-section-video-bg iframe, #top "+the_id+" .av-section-video-bg embed, #top "+the_id+" .av-section-video-bg object, #top "+the_id+" .av-section-video-bg video{height:"+wwCover+"px; top: -"+(wwCover - wh100)/2+"px;}\n";
/* 2231 */ 			}
/* 2232 */ 			
/* 2233 */ 			content = content + css;
/* 2234 */ 			
/* 2235 */ 			if(elements == counter + 1)
/* 2236 */ 			{
/* 2237 */ 				//ie8 needs different insert method
/* 2238 */ 				try{
/* 2239 */ 					css_block.text(content);
/* 2240 */ 				}
/* 2241 */ 				catch(err){
/* 2242 */ 					css_block.remove();
/* 2243 */ 					css_block = $("<style type='text/css' id='av-section-height'>"+content+"</style>").appendTo('head:first');
/* 2244 */ 				}
/* 2245 */ 			}
/* 2246 */ 		};
/* 2247 */ 		
/* 2248 */ 		
/* 2249 */ 	return this.each(function(i)
/* 2250 */ 	{

/* shortcodes.js */

/* 2251 */ 		var self = $(this);
/* 2252 */ 		
/* 2253 */ 		win.on( 'debouncedresize', function(){ calc_height(self, i); });
/* 2254 */ 		calc_height(self, i);
/* 2255 */ 	});
/* 2256 */ 	
/* 2257 */ }
/* 2258 */ 
/* 2259 */ 
/* 2260 */ 
/* 2261 */ // -------------------------------------------------------------------------------------------
/* 2262 */ // Gallery shortcode javascript
/* 2263 */ // -------------------------------------------------------------------------------------------
/* 2264 */ 
/* 2265 */ $.fn.avia_sc_gallery = function(options)
/* 2266 */ {
/* 2267 */ 	return this.each(function()
/* 2268 */ 	{
/* 2269 */ 		var gallery = $(this), images = gallery.find('img'), big_prev = gallery.find('.avia-gallery-big');
/* 2270 */ 
/* 2271 */ 
/* 2272 */ 		//trigger displaying of thumbnails
/* 2273 */ 		gallery.on('avia_start_animation', function()
/* 2274 */ 		{
/* 2275 */ 			images.each(function(i)
/* 2276 */ 			{
/* 2277 */ 				var image = $(this);
/* 2278 */ 				setTimeout(function(){ image.addClass('avia_start_animation') }, (i * 110));
/* 2279 */ 			});
/* 2280 */ 		});
/* 2281 */ 		
/* 2282 */ 		if(gallery.hasClass('deactivate_avia_lazyload')) gallery.trigger('avia_start_animation');
/* 2283 */ 
/* 2284 */ 		//trigger thumbnail hover and big prev image change
/* 2285 */ 		if(big_prev.length)
/* 2286 */ 		{
/* 2287 */ 			gallery.on('mouseenter','.avia-gallery-thumb a', function()
/* 2288 */ 			{
/* 2289 */ 				var _self = this;
/* 2290 */ 
/* 2291 */ 				big_prev.attr('data-onclick', _self.getAttribute("data-onclick"));
/* 2292 */ 				big_prev.height(big_prev.height());
/* 2293 */ 				big_prev.attr('href', _self.href)
/* 2294 */ 
/* 2295 */ 				var newImg 		= _self.getAttribute("data-prev-img"),
/* 2296 */ 					oldImg 		= big_prev.find('img'),
/* 2297 */ 					oldImgSrc 	= oldImg.attr('src');
/* 2298 */ 
/* 2299 */ 				if(newImg != oldImgSrc)
/* 2300 */ 				{

/* shortcodes.js */

/* 2301 */ 					var next_img = new Image();
/* 2302 */ 					next_img.src = newImg;
/* 2303 */ 					
/* 2304 */ 					var $next = $(next_img);
/* 2305 */ 					
/* 2306 */ 					if(big_prev.hasClass('avia-gallery-big-no-crop-thumb'))
/* 2307 */ 					{
/* 2308 */ 						$next.css({'height':big_prev.height(),'width':'auto'});
/* 2309 */ 					}
/* 2310 */ 					
/* 2311 */ 					big_prev.stop().animate({opacity:0}, function()
/* 2312 */ 					{
/* 2313 */ 						$next.insertAfter(oldImg);
/* 2314 */ 						oldImg.remove();
/* 2315 */ 						big_prev.animate({opacity:1});
/* 2316 */ 					});
/* 2317 */ 				}
/* 2318 */ 			});
/* 2319 */ 
/* 2320 */ 			big_prev.on('click', function()
/* 2321 */ 			{
/* 2322 */ 				var imagelink = gallery.find('.avia-gallery-thumb a').eq(this.getAttribute("data-onclick") - 1);
/* 2323 */ 
/* 2324 */ 				if(imagelink && !imagelink.hasClass('aviaopeninbrowser'))
/* 2325 */ 				{
/* 2326 */ 					imagelink.trigger('click');
/* 2327 */ 				}
/* 2328 */ 				else if(imagelink)
/* 2329 */ 				{
/* 2330 */ 					var imgurl = imagelink.attr("href");
/* 2331 */ 
/* 2332 */ 					if(imagelink.hasClass('aviablank') && imgurl != '' )
/* 2333 */ 					{
/* 2334 */ 						window.open(imgurl, '_blank');
/* 2335 */ 					}
/* 2336 */ 					else if( imgurl != '' )
/* 2337 */ 					{
/* 2338 */ 						window.open(imgurl, '_self');
/* 2339 */ 					}
/* 2340 */ 				}
/* 2341 */ 				return false;
/* 2342 */ 			});
/* 2343 */ 
/* 2344 */ 
/* 2345 */ 			$(window).on("debouncedresize", function()
/* 2346 */ 			{
/* 2347 */ 			  	big_prev.height('auto');
/* 2348 */ 			});
/* 2349 */ 
/* 2350 */ 		}

/* shortcodes.js */

/* 2351 */ 	});
/* 2352 */ }
/* 2353 */ 
/* 2354 */ // -------------------------------------------------------------------------------------------
/* 2355 */ // Toggle shortcode javascript
/* 2356 */ // -------------------------------------------------------------------------------------------
/* 2357 */ 
/* 2358 */ $.fn.avia_sc_toggle = function(options)
/* 2359 */ {
/* 2360 */ 	var defaults =
/* 2361 */ 	{
/* 2362 */ 		single: '.single_toggle',
/* 2363 */ 		heading: '.toggler',
/* 2364 */ 		content: '.toggle_wrap',
/* 2365 */ 		sortContainer:'.taglist'
/* 2366 */ 	};
/* 2367 */ 
/* 2368 */ 	var win = $(window),
/* 2369 */ 		options = $.extend(defaults, options);
/* 2370 */ 
/* 2371 */ 	return this.each(function()
/* 2372 */ 	{
/* 2373 */ 		var container 	= $(this).addClass('enable_toggles'),
/* 2374 */ 			toggles		= $(options.single, container),
/* 2375 */ 			heading 	= $(options.heading, container),
/* 2376 */ 			allContent 	= $(options.content, container),
/* 2377 */ 			sortLinks	= $(options.sortContainer + " a", container);
/* 2378 */ 
/* 2379 */ 		heading.each(function(i)
/* 2380 */ 		{
/* 2381 */ 			var thisheading =  $(this), content = thisheading.next(options.content, container);
/* 2382 */ 
/* 2383 */ 			function scroll_to_viewport()
/* 2384 */ 			{
/* 2385 */ 			    //check if toggle title is in viewport. if not scroll up
/* 2386 */ 			    var el_offset = content.offset().top,
/* 2387 */ 			        scoll_target = el_offset - 50 - parseInt($('html').css('margin-top'),10);
/* 2388 */ 
/* 2389 */ 			    if(win.scrollTop() > el_offset)
/* 2390 */ 			    {
/* 2391 */ 			        $('html:not(:animated),body:not(:animated)').animate({scrollTop: scoll_target},200);
/* 2392 */ 			    }
/* 2393 */ 			}
/* 2394 */ 
/* 2395 */ 			if(content.css('visibility') != "hidden")
/* 2396 */ 			{
/* 2397 */ 				thisheading.addClass('activeTitle');
/* 2398 */ 			}
/* 2399 */ 
/* 2400 */ 			thisheading.on('click', function()

/* shortcodes.js */

/* 2401 */ 			{
/* 2402 */ 				if(content.css('visibility') != "hidden")
/* 2403 */ 				{
/* 2404 */ 					content.slideUp(200, function()
/* 2405 */ 					{
/* 2406 */ 						content.removeClass('active_tc').attr({style:''});
/* 2407 */ 						win.trigger('av-height-change');
/* 2408 */ 					});
/* 2409 */ 					thisheading.removeClass('activeTitle');
/* 2410 */ 
/* 2411 */ 				}
/* 2412 */ 				else
/* 2413 */ 				{
/* 2414 */ 					if(container.is('.toggle_close_all'))
/* 2415 */ 					{
/* 2416 */ 						allContent.not(content).slideUp(200, function()
/* 2417 */ 						{
/* 2418 */ 							$(this).removeClass('active_tc').attr({style:''});
/* 2419 */ 							scroll_to_viewport();
/* 2420 */ 						});
/* 2421 */ 						heading.removeClass('activeTitle');
/* 2422 */ 					}
/* 2423 */ 					content.addClass('active_tc').slideDown(200,
/* 2424 */ 					
/* 2425 */ 					function()
/* 2426 */ 					{
/* 2427 */                         if(!container.is('.toggle_close_all'))
/* 2428 */                         {
/* 2429 */                             scroll_to_viewport();
/* 2430 */                         }
/* 2431 */                         
/* 2432 */                         win.trigger('av-height-change');
/* 2433 */ 					}
/* 2434 */ 					
/* 2435 */ 					);
/* 2436 */ 					thisheading.addClass('activeTitle');
/* 2437 */ 					location.replace(thisheading.data('fake-id'));
/* 2438 */ 				}
/* 2439 */ 				
/* 2440 */ 				
/* 2441 */ 				
/* 2442 */ 			});
/* 2443 */ 		});
/* 2444 */ 
/* 2445 */ 
/* 2446 */ 		sortLinks.click(function(e){
/* 2447 */ 
/* 2448 */ 			e.preventDefault();
/* 2449 */ 			var show = toggles.filter('[data-tags~="'+$(this).data('tag')+'"]'),
/* 2450 */ 				hide = toggles.not('[data-tags~="'+$(this).data('tag')+'"]');

/* shortcodes.js */

/* 2451 */ 
/* 2452 */ 				sortLinks.removeClass('activeFilter');
/* 2453 */ 				$(this).addClass('activeFilter');
/* 2454 */ 				heading.filter('.activeTitle').trigger('click');
/* 2455 */ 				show.slideDown();
/* 2456 */ 				hide.slideUp();
/* 2457 */ 		});
/* 2458 */ 
/* 2459 */ 
/* 2460 */ 		function trigger_default_open(hash)
/* 2461 */ 		{
/* 2462 */ 			if(!hash && window.location.hash) hash = window.location.hash;
/* 2463 */ 			if(!hash) return;
/* 2464 */ 			
/* 2465 */ 			var open = heading.filter('[data-fake-id="'+hash+'"]');
/* 2466 */ 
/* 2467 */ 			if(open.length)
/* 2468 */ 			{
/* 2469 */ 				if(!open.is('.activeTitle')) open.trigger('click');
/* 2470 */ 				window.scrollTo(0, container.offset().top - 70);
/* 2471 */ 			}
/* 2472 */ 		}
/* 2473 */ 		trigger_default_open(false);
/* 2474 */ 		
/* 2475 */ 		$('a').on('click',function(){
/* 2476 */             var hash = $(this).attr('href');
/* 2477 */             if(typeof hash != "undefined" && hash)
/* 2478 */             {
/* 2479 */                 hash = hash.replace(/^.*?#/,'');
/* 2480 */                 trigger_default_open('#'+hash);
/* 2481 */             }
/* 2482 */         });
/* 2483 */ 
/* 2484 */ 	});
/* 2485 */ };
/* 2486 */ 
/* 2487 */ 
/* 2488 */ 
/* 2489 */ 
/* 2490 */ // -------------------------------------------------------------------------------------------
/* 2491 */ // Tab Shortcode
/* 2492 */ // -------------------------------------------------------------------------------------------
/* 2493 */ 
/* 2494 */ $.fn.avia_sc_tabs= function(options)
/* 2495 */ {
/* 2496 */ 	var defaults =
/* 2497 */ 	{
/* 2498 */ 		heading: '.tab',
/* 2499 */ 		content:'.tab_content',
/* 2500 */ 		active:'active_tab',

/* shortcodes.js */

/* 2501 */ 		sidebar: false
/* 2502 */ 	};
/* 2503 */ 
/* 2504 */ 	var win = $(window)
/* 2505 */ 		options = $.extend(defaults, options);
/* 2506 */ 
/* 2507 */ 	return this.each(function()
/* 2508 */ 	{
/* 2509 */ 		var container 	= $(this),
/* 2510 */ 			tab_titles 	= $('<div class="tab_titles"></div>').prependTo(container),
/* 2511 */ 			tabs 		= $(options.heading, container),
/* 2512 */ 			content 	= $(options.content, container),
/* 2513 */ 			newtabs 	= false,
/* 2514 */ 			oldtabs 	= false;
/* 2515 */ 
/* 2516 */ 		newtabs = tabs.clone();
/* 2517 */ 		oldtabs = tabs.addClass('fullsize-tab');
/* 2518 */ 		tabs = newtabs;
/* 2519 */ 
/* 2520 */ 		tabs.prependTo(tab_titles).each(function(i)
/* 2521 */ 		{
/* 2522 */ 			var tab = $(this), the_oldtab = false;
/* 2523 */ 
/* 2524 */ 			if(newtabs) the_oldtab = oldtabs.filter(':eq('+i+')');
/* 2525 */ 
/* 2526 */ 			tab.addClass('tab_counter_'+i).bind('click', function()
/* 2527 */ 			{
/* 2528 */ 				open_content(tab, i, the_oldtab);
/* 2529 */ 				return false;
/* 2530 */ 			});
/* 2531 */ 
/* 2532 */ 			if(newtabs)
/* 2533 */ 			{
/* 2534 */ 				the_oldtab.bind('click', function()
/* 2535 */ 				{
/* 2536 */ 					open_content(the_oldtab, i, tab);
/* 2537 */ 					return false;
/* 2538 */ 				});
/* 2539 */ 			}
/* 2540 */ 		});
/* 2541 */ 
/* 2542 */ 		set_size();
/* 2543 */ 		trigger_default_open(false);
/* 2544 */ 		win.on("debouncedresize", set_size);
/* 2545 */ 		
/* 2546 */         $('a').on('click',function(){
/* 2547 */             var hash = $(this).attr('href');
/* 2548 */             if(typeof hash != "undefined" && hash)
/* 2549 */             {
/* 2550 */                 hash = hash.replace(/^.*?#/,'');

/* shortcodes.js */

/* 2551 */                 trigger_default_open('#'+hash);
/* 2552 */             }
/* 2553 */         });
/* 2554 */ 
/* 2555 */ 		function set_size()
/* 2556 */ 		{
/* 2557 */ 			if(!options.sidebar) return;
/* 2558 */ 			content.css({'min-height': tab_titles.outerHeight() + 1});
/* 2559 */ 		}
/* 2560 */ 
/* 2561 */ 		function open_content(tab, i, alternate_tab)
/* 2562 */ 		{
/* 2563 */ 			if(!tab.is('.'+options.active))
/* 2564 */ 			{
/* 2565 */ 				$('.'+options.active, container).removeClass(options.active);
/* 2566 */ 				$('.'+options.active+'_content', container).removeClass(options.active+'_content');
/* 2567 */ 
/* 2568 */ 				tab.addClass(options.active);
/* 2569 */ 
/* 2570 */ 				var new_loc = tab.data('fake-id');
/* 2571 */ 				if(typeof new_loc == 'string') location.replace(new_loc);
/* 2572 */ 
/* 2573 */ 				if(alternate_tab) alternate_tab.addClass(options.active);
/* 2574 */ 				var active_c = content.filter(':eq('+i+')').addClass(options.active+'_content');
/* 2575 */ 
/* 2576 */ 				if(typeof click_container != 'undefined' && click_container.length)
/* 2577 */ 				{
/* 2578 */ 					sidebar_shadow.height(active_c.outerHeight());
/* 2579 */ 				}
/* 2580 */ 				
/* 2581 */ 				//check if tab title is in viewport. if not scroll up
/* 2582 */ 				var el_offset = active_c.offset().top,
/* 2583 */ 					scoll_target = el_offset - 50 - parseInt($('html').css('margin-top'),10);
/* 2584 */ 				
/* 2585 */ 				if(win.scrollTop() > el_offset)
/* 2586 */ 				{
/* 2587 */ 					$('html:not(:animated),body:not(:animated)').scrollTop(scoll_target);
/* 2588 */ 				}
/* 2589 */ 			}
/* 2590 */ 		}
/* 2591 */ 
/* 2592 */ 		function trigger_default_open(hash)
/* 2593 */ 		{
/* 2594 */ 			if(!hash && window.location.hash) hash = window.location.hash;
/* 2595 */             		if(!hash) return;
/* 2596 */             		
/* 2597 */ 			var open = tabs.filter('[data-fake-id="'+hash+'"]');
/* 2598 */ 
/* 2599 */ 			if(open.length)
/* 2600 */ 			{

/* shortcodes.js */

/* 2601 */ 				if(!open.is('.active_tab')) open.trigger('click');
/* 2602 */ 				window.scrollTo(0, container.offset().top - 70);
/* 2603 */ 			}
/* 2604 */ 		}
/* 2605 */ 
/* 2606 */ 	});
/* 2607 */ };
/* 2608 */ 
/* 2609 */ 
/* 2610 */ 
/* 2611 */ // -------------------------------------------------------------------------------------------
/* 2612 */ // Big Number animation shortcode javascript
/* 2613 */ // -------------------------------------------------------------------------------------------
/* 2614 */ 
/* 2615 */ (function($)
/* 2616 */ {
/* 2617 */ 	$.fn.avia_sc_animated_number = function(options)
/* 2618 */ 	{
/* 2619 */ 		var skipStep = false,
/* 2620 */ 		start_count = function(element, countTo, increment, current, fakeCountTo)
/* 2621 */ 		{
/* 2622 */ 			//calculate the new number
/* 2623 */ 			var newCount = current + increment;
/* 2624 */ 			
/* 2625 */ 			//if the number is bigger than our final number set the number and finish
/* 2626 */ 			if(newCount >= fakeCountTo) 
/* 2627 */ 			{
/* 2628 */ 				element.text(countTo); //exit
/* 2629 */ 			}
/* 2630 */ 			else
/* 2631 */ 			{
/* 2632 */ 				var prepend = "", addZeros = countTo.toString().length - newCount.toString().length
/* 2633 */ 				
/* 2634 */ 				//if the number has less digits than the final number some zeros where omitted. add them to the front
/* 2635 */ 				for(var i = addZeros; i > 0; i--){ prepend += "0"; }
/* 2636 */ 				
/* 2637 */ 				element.text(prepend + newCount);
/* 2638 */ 				window.requestAnimationFrame(function(){ start_count(element, countTo, increment, newCount, fakeCountTo) });
/* 2639 */ 			}
/* 2640 */ 		};
/* 2641 */ 	
/* 2642 */ 		return this.each(function()
/* 2643 */ 		{
/* 2644 */ 			var number_container = $(this), elements = number_container.find('.avia-single-number'), countTimer = number_container.data('timer') || 3000;
/* 2645 */ 			
/* 2646 */ 			//prepare elements
/* 2647 */ 			elements.each(function(i)
/* 2648 */ 			{
/* 2649 */ 				var element = $(this), text = element.text();
/* 2650 */ 				element.text( text.replace(/./g, "0")); 

/* shortcodes.js */

/* 2651 */ 			});
/* 2652 */ 			
/* 2653 */ 			//trigger number animation
/* 2654 */ 			number_container.addClass('number_prepared').on('avia_start_animation', function()
/* 2655 */ 			{
/* 2656 */ 				elements.each(function(i)
/* 2657 */ 				{
/* 2658 */ 					var element = $(this), countTo = element.data('number'), fakeCountTo = countTo, current = parseInt(element.text(),10), zeroOnly = /^0+$/.test(countTo), increment = 0;
/* 2659 */ 					
/* 2660 */ 					//fallback for decimals like 00 or 000
/* 2661 */ 					if(zeroOnly) fakeCountTo = countTo.replace(/0/g, '9');
/* 2662 */ 					
/* 2663 */ 					increment = Math.round( fakeCountTo * 32 / countTimer);
/* 2664 */ 					if(increment == 0 || increment % 10 == 0) increment += 1;
/* 2665 */ 					
/* 2666 */ 					setTimeout(function(){ start_count(element, countTo, increment, current, fakeCountTo);}, 300);
/* 2667 */ 				});
/* 2668 */ 			});
/* 2669 */ 		});
/* 2670 */ 	}
/* 2671 */ })(jQuery);
/* 2672 */ 
/* 2673 */ 
/* 2674 */ 
/* 2675 */ 
/* 2676 */ // -------------------------------------------------------------------------------------------
/* 2677 */ // contact form ajax
/* 2678 */ // -------------------------------------------------------------------------------------------
/* 2679 */ 
/* 2680 */ (function($)
/* 2681 */ {
/* 2682 */ 	$.fn.avia_ajax_form = function(variables)
/* 2683 */ 	{
/* 2684 */ 		var defaults =
/* 2685 */ 		{
/* 2686 */ 			sendPath: 'send.php',
/* 2687 */ 			responseContainer: '.ajaxresponse'
/* 2688 */ 		};
/* 2689 */ 
/* 2690 */ 		var options = $.extend(defaults, variables);
/* 2691 */ 
/* 2692 */ 		return this.each(function()
/* 2693 */ 		{
/* 2694 */ 			var form = $(this),
/* 2695 */ 				form_sent = false,
/* 2696 */ 				send =
/* 2697 */ 				{
/* 2698 */ 					formElements: form.find('textarea, select, input[type=text], input[type=checkbox], input[type=hidden]'),
/* 2699 */ 					validationError:false,
/* 2700 */ 					button : form.find('input:submit'),

/* shortcodes.js */

/* 2701 */ 					dataObj : {}
/* 2702 */ 				},
/* 2703 */ 
/* 2704 */ 				responseContainer = form.next(options.responseContainer+":eq(0)");
/* 2705 */ 
/* 2706 */ 				send.button.bind('click', checkElements);
/* 2707 */ 				
/* 2708 */ 				
/* 2709 */ 				//change type of email forms on mobile so the e-mail keyboard with @ sign is used
/* 2710 */ 				if($.avia_utilities.isMobile)
/* 2711 */ 				{
/* 2712 */ 					send.formElements.each(function(i)
/* 2713 */ 					{
/* 2714 */ 						var currentElement = $(this), is_email = currentElement.hasClass('is_email');
/* 2715 */ 						if(is_email) currentElement.attr('type','email');
/* 2716 */ 					});
/* 2717 */ 				}
/* 2718 */ 			
/* 2719 */ 			
/* 2720 */ 			
/* 2721 */ 			function send_ajax_form()
/* 2722 */ 			{
/* 2723 */ 				if(form_sent){ return false; }
/* 2724 */ 
/* 2725 */ 				form_sent = true;
/* 2726 */ 				send.button.addClass('av-sending-button');
/* 2727 */ 				send.button.val(send.button.data('sending-label'));
/* 2728 */ 				
/* 2729 */ 				var redirect_to = form.data('avia-redirect') || false,
/* 2730 */ 					action		= form.attr('action');
/* 2731 */ 				
/* 2732 */ 				responseContainer.load(action+' '+options.responseContainer, send.dataObj, function()
/* 2733 */ 				{
/* 2734 */ 					if(redirect_to && action != redirect_to)
/* 2735 */ 					{
/* 2736 */ 						form.attr('action', redirect_to);
/* 2737 */ 						form.submit();
/* 2738 */ 					}
/* 2739 */ 					else
/* 2740 */ 					{
/* 2741 */ 						responseContainer.removeClass('hidden').css({display:"block"});
/* 2742 */ 						form.slideUp(400, function(){responseContainer.slideDown(400, function(){ $('body').trigger('av_resize_finished'); }); send.formElements.val('');});
/* 2743 */ 					}
/* 2744 */ 				});
/* 2745 */ 			}
/* 2746 */ 
/* 2747 */ 			function checkElements()
/* 2748 */ 			{
/* 2749 */ 				// reset validation var and send data
/* 2750 */ 				send.validationError = false;

/* shortcodes.js */

/* 2751 */ 				send.datastring = 'ajax=true';
/* 2752 */ 
/* 2753 */ 				send.formElements.each(function(i)
/* 2754 */ 				{
/* 2755 */ 					var currentElement = $(this),
/* 2756 */ 						surroundingElement = currentElement.parent(),
/* 2757 */ 						value = currentElement.val(),
/* 2758 */ 						name = currentElement.attr('name'),
/* 2759 */ 					 	classes = currentElement.attr('class'),
/* 2760 */ 					 	nomatch = true;
/* 2761 */ 
/* 2762 */ 					 	if(currentElement.is(':checkbox'))
/* 2763 */ 					 	{
/* 2764 */ 					 		if(currentElement.is(':checked')) { value = true } else {value = ''}
/* 2765 */ 					 	}
/* 2766 */ 
/* 2767 */ 					 	send.dataObj[name] = encodeURIComponent(value);
/* 2768 */ 
/* 2769 */ 					 	if(classes && classes.match(/is_empty/))
/* 2770 */ 						{
/* 2771 */ 							if(value == '')
/* 2772 */ 							{
/* 2773 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("error");
/* 2774 */ 								send.validationError = true;
/* 2775 */ 							}
/* 2776 */ 							else
/* 2777 */ 							{
/* 2778 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("valid");
/* 2779 */ 							}
/* 2780 */ 							nomatch = false;
/* 2781 */ 						}
/* 2782 */ 
/* 2783 */ 						if(classes && classes.match(/is_email/))
/* 2784 */ 						{
/* 2785 */ 							if(!value.match(/^[\w|\.|\-]+@\w[\w|\.|\-]*\.[a-zA-Z]{2,20}$/))
/* 2786 */ 							{
/* 2787 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("error");
/* 2788 */ 								send.validationError = true;
/* 2789 */ 							}
/* 2790 */ 							else
/* 2791 */ 							{
/* 2792 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("valid");
/* 2793 */ 							}
/* 2794 */ 							nomatch = false;
/* 2795 */ 						}
/* 2796 */ 
/* 2797 */ 						if(classes && classes.match(/is_phone/))
/* 2798 */ 						{
/* 2799 */ 							if(!value.match(/^(\d|\s|\-|\/|\(|\)|\[|\]|e|x|t|ension|\.|\+|\_|\,|\:|\;){3,}$/))
/* 2800 */ 							{

/* shortcodes.js */

/* 2801 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("error");
/* 2802 */ 								send.validationError = true;
/* 2803 */ 							}
/* 2804 */ 							else
/* 2805 */ 							{
/* 2806 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("valid");
/* 2807 */ 							}
/* 2808 */ 							nomatch = false;
/* 2809 */ 						}
/* 2810 */ 
/* 2811 */ 						if(classes && classes.match(/is_number/))
/* 2812 */ 						{
/* 2813 */ 							if(!($.isNumeric(value)) || value == "")
/* 2814 */ 							{
/* 2815 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("error");
/* 2816 */ 								send.validationError = true;
/* 2817 */ 							}
/* 2818 */ 							else
/* 2819 */ 							{
/* 2820 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("valid");
/* 2821 */ 							}
/* 2822 */ 							nomatch = false;
/* 2823 */ 						}
/* 2824 */ 
/* 2825 */ 						if(classes && classes.match(/captcha/))
/* 2826 */ 						{
/* 2827 */ 							var verifier 	= form.find("#" + name + "_verifier").val(),
/* 2828 */ 								lastVer		= verifier.charAt(verifier.length-1),
/* 2829 */ 								finalVer	= verifier.charAt(lastVer);
/* 2830 */ 
/* 2831 */ 							if(value != finalVer)
/* 2832 */ 							{
/* 2833 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("error");
/* 2834 */ 								send.validationError = true;
/* 2835 */ 							}
/* 2836 */ 							else
/* 2837 */ 							{
/* 2838 */ 								surroundingElement.removeClass("valid error ajax_alert").addClass("valid");
/* 2839 */ 							}
/* 2840 */ 							nomatch = false;
/* 2841 */ 						}
/* 2842 */ 
/* 2843 */ 						if(nomatch && value != '')
/* 2844 */ 						{
/* 2845 */ 							surroundingElement.removeClass("valid error ajax_alert").addClass("valid");
/* 2846 */ 						}
/* 2847 */ 				});
/* 2848 */ 
/* 2849 */ 				if(send.validationError == false)
/* 2850 */ 				{

/* shortcodes.js */

/* 2851 */ 					send_ajax_form();
/* 2852 */ 				}
/* 2853 */ 				return false;
/* 2854 */ 			}
/* 2855 */ 		});
/* 2856 */ 	};
/* 2857 */ })(jQuery);
/* 2858 */ 
/* 2859 */ 
/* 2860 */ 
/* 2861 */ 
/* 2862 */ 
/* 2863 */ 
/* 2864 */ 
/* 2865 */ 
/* 2866 */ 
/* 2867 */ 
/* 2868 */ 
/* 2869 */ 
/* 2870 */ // -------------------------------------------------------------------------------------------
/* 2871 */ // Aviaccordion Slideshow 
/* 2872 */ // 
/* 2873 */ // accordion slider script
/* 2874 */ // -------------------------------------------------------------------------------------------
/* 2875 */ 
/* 2876 */ 	$.AviaccordionSlider  =  function(options, slider)
/* 2877 */ 	{
/* 2878 */ 	    this.$slider  	= $( slider );
/* 2879 */ 	    this.$inner	  	= this.$slider.find('.aviaccordion-inner');
/* 2880 */ 	    this.$slides	= this.$inner.find('.aviaccordion-slide');
/* 2881 */ 	    this.$images	= this.$inner.find('.aviaccordion-image');
/* 2882 */ 	    this.$last		= this.$slides.filter(':last');
/* 2883 */ 	    this.$titles  	= this.$slider.find('.aviaccordion-preview');
/* 2884 */ 	    this.$titlePos  = this.$slider.find('.aviaccordion-preview-title-pos');
/* 2885 */ 	    this.$titleWrap = this.$slider.find('.aviaccordion-preview-title-wrap');
/* 2886 */ 	    this.$win	  	= $( window );
/* 2887 */ 	    
/* 2888 */ 	    if($.avia_utilities.supported.transition === undefined)
/* 2889 */ 		{
/* 2890 */ 			$.avia_utilities.supported.transition = $.avia_utilities.supports('transition');
/* 2891 */ 		}
/* 2892 */ 		
/* 2893 */ 		this.browserPrefix 	= $.avia_utilities.supported.transition;
/* 2894 */ 	    this.cssActive 		= this.browserPrefix !== false ? true : false;
/* 2895 */ 	    this.transform3d	= document.documentElement.className.indexOf('avia_transform3d') !== -1 ? true : false;
/* 2896 */ 		this.isMobile 		= $.avia_utilities.isMobile;
/* 2897 */ 		this.property		= this.browserPrefix + 'transform',
/* 2898 */ 		this.count			= this.$slides.length;
/* 2899 */ 		this.open			= false;
/* 2900 */ 		this.autoplay		= false;

/* shortcodes.js */

/* 2901 */ 		this.increaseTitle  = this.$slider.is(".aviaccordion-title-on-hover");
/* 2902 */ 		// this.cssActive    = false; //testing no css3 browser
/* 2903 */ 		
/* 2904 */ 	    this._init( options );
/* 2905 */ 	}
/* 2906 */ 
/* 2907 */   	$.AviaccordionSlider.prototype =
/* 2908 */     {
/* 2909 */     	_init: function( options )
/* 2910 */     	{
/* 2911 */     		var _self = this;
/* 2912 */     		_self.options = $.extend({}, options, this.$slider.data());
/* 2913 */ 			 $.avia_utilities.preload({container: this.$slider , single_callback:  function(){ _self._kickOff(); }});
/* 2914 */     	},
/* 2915 */     	
/* 2916 */     	_kickOff: function()
/* 2917 */     	{
/* 2918 */     		var _self = this;
/* 2919 */     		
/* 2920 */     		_self._calcMovement();
/* 2921 */     		_self._bindEvents();
/* 2922 */     		_self._showImages();
/* 2923 */     		_self._autoplay();
/* 2924 */     	},
/* 2925 */     	
/* 2926 */     	_autoplay: function()
/* 2927 */     	{
/* 2928 */     		var _self = this;
/* 2929 */     		
/* 2930 */     		if(_self.options.autoplay)
/* 2931 */     		{
/* 2932 */     			_self.autoplay = setInterval(function()
/* 2933 */     			{
/* 2934 */     				_self.open = _self.open === false ? 0 : _self.open + 1;
/* 2935 */     				if(_self.open >= _self.count) _self.open = 0;
/* 2936 */     				_self._move({}, _self.open);
/* 2937 */     				
/* 2938 */     			}, _self.options.interval * 1000)
/* 2939 */     		}
/* 2940 */     	},
/* 2941 */     	
/* 2942 */     	_showImages: function()
/* 2943 */     	{
/* 2944 */     		var _self = this, counter = 0, delay = 300, title_delay = this.count * delay;
/* 2945 */     		
/* 2946 */     		if(this.cssActive)
/* 2947 */     		{
/* 2948 */     			setTimeout(function(){ _self.$slider.addClass('av-animation-active'); } , 10);
/* 2949 */     		}
/* 2950 */     		

/* shortcodes.js */

/* 2951 */     		this.$images.each(function(i)
/* 2952 */     		{
/* 2953 */     			var current = $(this), timer = delay * (i + 1);
/* 2954 */     				
/* 2955 */     			setTimeout(function()
/* 2956 */     			{ 
/* 2957 */     				current.avia_animate({opacity:1}, 400, function()
/* 2958 */     				{
/* 2959 */     					current.css($.avia_utilities.supported.transition + "transform", "none");
/* 2960 */     				}); 
/* 2961 */     			},timer);
/* 2962 */     		});
/* 2963 */     		
/* 2964 */     		if(_self.increaseTitle) title_delay = 0;
/* 2965 */     		
/* 2966 */     		this.$titlePos.each(function(i)
/* 2967 */     		{
/* 2968 */     			var current = $(this), new_timer = title_delay + 100 * (i + 1);
/* 2969 */     					
/* 2970 */     			setTimeout(function()
/* 2971 */     			{ 
/* 2972 */     				current.avia_animate({opacity:1}, 200, function()
/* 2973 */     				{
/* 2974 */     					current.css($.avia_utilities.supported.transition + "transform", "none");
/* 2975 */     				}); 
/* 2976 */     			},new_timer);
/* 2977 */     		});
/* 2978 */     	},
/* 2979 */     	
/* 2980 */     	_bindEvents: function()
/* 2981 */     	{
/* 2982 */     		var trigger = this.isMobile ? "click" : "mouseenter";
/* 2983 */     	
/* 2984 */     		this.$slider.on(trigger,'.aviaccordion-slide', $.proxy( this._move, this));
/* 2985 */     		this.$slider.on('mouseleave','.aviaccordion-inner', $.proxy( this._move, this));
/* 2986 */     		this.$win.on('debouncedresize', $.proxy( this._calcMovement, this));
/* 2987 */     		this.$slider.on('av-prev av-next', $.proxy( this._moveTo, this));
/* 2988 */     		
/* 2989 */     		if(this.isMobile)
/* 2990 */     		{
/* 2991 */     			this.$slider.avia_swipe_trigger({next: this.$slider, prev: this.$slider, event:{prev: 'av-prev', next: 'av-next'}});
/* 2992 */     		}
/* 2993 */     		
/* 2994 */     	},
/* 2995 */     	
/* 2996 */     	_titleHeight: function()
/* 2997 */     	{
/* 2998 */     		var th = 0;
/* 2999 */     		
/* 3000 */     		this.$titleWrap.css({'height':'auto'}).each(function()

/* shortcodes.js */

/* 3001 */     		{
/* 3002 */     			var new_h = $(this).outerHeight();
/* 3003 */     			if( new_h > th) th = new_h;
/* 3004 */     		
/* 3005 */     		}).css({'height':th + 2});
/* 3006 */     		
/* 3007 */     	},
/* 3008 */     	
/* 3009 */     	_calcMovement: function(event)
/* 3010 */     	{
/* 3011 */     		var _self			= this,
/* 3012 */     			containerWidth	= this.$slider.width(),
/* 3013 */     			defaultPos		= this.$last.data('av-left'),
/* 3014 */     			imgWidth		= this.$images.filter(':last').width() || containerWidth,
/* 3015 */     			imgWidthPercent = Math.floor((100 / containerWidth) * imgWidth),
/* 3016 */     			allImageWidth	= imgWidthPercent * _self.count,
/* 3017 */     			modifier		= 3, // 10 - _self.count,
/* 3018 */     			tempMinLeft		= 100 - imgWidthPercent,
/* 3019 */     			minLeft 		= tempMinLeft > defaultPos / modifier ? tempMinLeft : 0,
/* 3020 */     			oneLeft			= minLeft / (_self.count -1 ),
/* 3021 */     			titleWidth		= imgWidth;
/* 3022 */     		
/* 3023 */     		
/* 3024 */     		
/* 3025 */     		if(allImageWidth < 110)
/* 3026 */     		{
/* 3027 */     			//set height if necessary	
/* 3028 */     			var slideHeight = this.$slider.height(), 
/* 3029 */     				maxHeight 	= (slideHeight / allImageWidth) * 110 ;
/* 3030 */     				
/* 3031 */     			this.$slider.css({'max-height': maxHeight});
/* 3032 */     			_self._calcMovement(event);
/* 3033 */     			return;
/* 3034 */     		}
/* 3035 */     		
/* 3036 */     		//backup so the minimized slides dont get too small
/* 3037 */     		if(oneLeft < 2) minLeft = 0;
/* 3038 */     		
/* 3039 */ 			this.$slides.each(function(i)
/* 3040 */ 			{
/* 3041 */ 				var current = $(this), newLeft = 0, newRight = 0, defaultLeft = current.data('av-left');
/* 3042 */ 					
/* 3043 */ 				if( minLeft !== 0)
/* 3044 */ 				{
/* 3045 */ 					newLeft  = oneLeft * i;
/* 3046 */ 					newRight = imgWidthPercent + newLeft - oneLeft;
/* 3047 */ 				}
/* 3048 */ 				else
/* 3049 */ 				{
/* 3050 */ 					newLeft  = defaultLeft / Math.abs(modifier);

/* shortcodes.js */

/* 3051 */ 					newRight = 100 - ((newLeft / i) * (_self.count - i));
/* 3052 */ 				}
/* 3053 */ 				
/* 3054 */ 				if(i == 1 && _self.increaseTitle) { titleWidth = newRight + 1; } 
/* 3055 */ 				
/* 3056 */ 				if(_self.cssActive)
/* 3057 */ 				{	
/* 3058 */ 					//if we are not animating based on the css left value but on css transform we need to subtract the left value
/* 3059 */ 					newLeft = newLeft - defaultLeft;
/* 3060 */ 					newRight = newRight - defaultLeft;
/* 3061 */ 					defaultLeft = 0;
/* 3062 */ 				}
/* 3063 */ 				
/* 3064 */ 				current.data('av-calc-default', defaultLeft);
/* 3065 */ 				current.data('av-calc-left', newLeft);
/* 3066 */ 				current.data('av-calc-right', newRight);
/* 3067 */ 				
/* 3068 */ 			});
/* 3069 */ 			
/* 3070 */ 			if(_self.increaseTitle) { _self.$titles.css({width: titleWidth + "%"});} 
/* 3071 */     	},
/* 3072 */     	
/* 3073 */     	_moveTo: function(event)
/* 3074 */     	{
/* 3075 */     		var direction 	= event.type == "av-next" ? 1 : -1,
/* 3076 */     			nextSlide 	= this.open === false ? 0 : this.open + direction;
/* 3077 */     			
/* 3078 */     		if(nextSlide >= 0 && nextSlide < this.$slides.length) this._move(event, nextSlide);
/* 3079 */     	},
/* 3080 */     	
/* 3081 */     	_move: function(event, direct_open)
/* 3082 */     	{
/* 3083 */     		var _self  = this,
/* 3084 */     			slide  = event.currentTarget,
/* 3085 */     			itemNo = typeof direct_open != "undefined" ? direct_open : this.$slides.index(slide);
/* 3086 */     			
/* 3087 */     		this.open = itemNo;
/* 3088 */     		
/* 3089 */     		if(_self.autoplay && typeof slide != "undefined") { clearInterval(_self.autoplay); _self.autoplay == false; }
/* 3090 */     		
/* 3091 */     		this.$slides.removeClass('aviaccordion-active-slide').each(function(i)
/* 3092 */     		{
/* 3093 */     			var current 	= $(this),
/* 3094 */     				dataSet 	= current.data(),
/* 3095 */     				trans_val	= i <= itemNo ? dataSet.avCalcLeft : dataSet.avCalcRight,
/* 3096 */ 					transition 	= {},
/* 3097 */ 					reset		= event.type == 'mouseleave' ? 1 : 0,
/* 3098 */ 					active 		= itemNo === i ? _self.$titleWrap.eq(i) : false;
/* 3099 */     			
/* 3100 */     			if(active) current.addClass('aviaccordion-active-slide');

/* shortcodes.js */

/* 3101 */     				
/* 3102 */     			if(reset)
/* 3103 */     			{
/* 3104 */     				trans_val = dataSet.avCalcDefault; 
/* 3105 */     				this.open = false;
/* 3106 */     			}
/* 3107 */     				
/* 3108 */ 				if(_self.cssActive) //do a css3 animation
/* 3109 */ 				{
/* 3110 */ 					//move the slides
/* 3111 */ 					transition[_self.property]  = _self.transform3d ? "translate3d(" + trans_val  + "%, 0, 0)" : "translate(" + trans_val + "%,0)"; //3d or 2d transform?
/* 3112 */ 					current.css(transition);
/* 3113 */ 				}
/* 3114 */ 				else
/* 3115 */ 				{
/* 3116 */ 					transition.left =  trans_val + "%";
/* 3117 */ 					current.stop().animate(transition, 700, 'easeOutQuint');
/* 3118 */ 				}	
/* 3119 */     		});
/* 3120 */     	}
/* 3121 */     };
/* 3122 */ 
/* 3123 */ 
/* 3124 */ $.fn.aviaccordion = function( options )
/* 3125 */ {
/* 3126 */ 	return this.each(function()
/* 3127 */ 	{
/* 3128 */ 		var active = $.data( this, 'AviaccordionSlider' );
/* 3129 */ 
/* 3130 */ 		if(!active)
/* 3131 */ 		{
/* 3132 */ 			//make sure that the function doesnt get aplied a second time
/* 3133 */ 			$.data( this, 'AviaccordionSlider', 1 );
/* 3134 */ 			
/* 3135 */ 			//create the preparations for fullscreen slider
/* 3136 */ 			new $.AviaccordionSlider( options, this );
/* 3137 */ 		}
/* 3138 */ 	});
/* 3139 */ }
/* 3140 */ 
/* 3141 */ 
/* 3142 */ 
/* 3143 */ 
/* 3144 */ 
/* 3145 */ 
/* 3146 */ 
/* 3147 */ 
/* 3148 */ 
/* 3149 */ 
/* 3150 */ 

/* shortcodes.js */

/* 3151 */ 
/* 3152 */ 
/* 3153 */ 
/* 3154 */ 
/* 3155 */ 
/* 3156 */ 
/* 3157 */ 
/* 3158 */ 
/* 3159 */ 
/* 3160 */ 
/* 3161 */ 
/* 3162 */ 
/* 3163 */ 
/* 3164 */ 
/* 3165 */ 
/* 3166 */ 
/* 3167 */ // -------------------------------------------------------------------------------------------
/* 3168 */ // HELPER FUNCTIONS
/* 3169 */ // -------------------------------------------------------------------------------------------
/* 3170 */ 
/* 3171 */ 
/* 3172 */ //waipoint script when something comes into viewport
/* 3173 */  $.fn.avia_waypoints = function(options_passed)
/* 3174 */ 	{
/* 3175 */ 		if(! $('html').is('.avia_transform')) return;
/* 3176 */ 
/* 3177 */ 		var defaults = { offset: 'bottom-in-view' , triggerOnce: true},
/* 3178 */ 			options  = $.extend({}, defaults, options_passed),
/* 3179 */ 			isMobile = $.avia_utilities.isMobile;
/* 3180 */ 
/* 3181 */ 		return this.each(function()
/* 3182 */ 		{
/* 3183 */ 			var element = $(this);
/* 3184 */ 			
/* 3185 */ 			setTimeout(function()
/* 3186 */ 			{
/* 3187 */ 				if(isMobile)
/* 3188 */ 				{
/* 3189 */ 					element.addClass('avia_start_animation').trigger('avia_start_animation');
/* 3190 */ 				}
/* 3191 */ 				else
/* 3192 */ 				{
/* 3193 */ 					element.waypoint(function(direction)
/* 3194 */ 					{
/* 3195 */ 					 	$(this).addClass('avia_start_animation').trigger('avia_start_animation');
/* 3196 */ 	
/* 3197 */ 					}, options );
/* 3198 */ 				}
/* 3199 */ 			},100)
/* 3200 */ 			

/* shortcodes.js */

/* 3201 */ 		});
/* 3202 */ 	};
/* 3203 */ 
/* 3204 */ 
/* 3205 */ 
/* 3206 */ 
/* 3207 */ 
/* 3208 */ 
/* 3209 */ 
/* 3210 */ // window resize script
/* 3211 */ var $event = $.event, $special, resizeTimeout;
/* 3212 */ 
/* 3213 */ $special = $event.special.debouncedresize = {
/* 3214 */ 	setup: function() {
/* 3215 */ 		$( this ).on( "resize", $special.handler );
/* 3216 */ 	},
/* 3217 */ 	teardown: function() {
/* 3218 */ 		$( this ).off( "resize", $special.handler );
/* 3219 */ 	},
/* 3220 */ 	handler: function( event, execAsap ) {
/* 3221 */ 		// Save the context
/* 3222 */ 		var context = this,
/* 3223 */ 			args = arguments,
/* 3224 */ 			dispatch = function() {
/* 3225 */ 				// set correct event type
/* 3226 */ 				event.type = "debouncedresize";
/* 3227 */ 				$event.dispatch.apply( context, args );
/* 3228 */ 			};
/* 3229 */ 
/* 3230 */ 		if ( resizeTimeout ) {
/* 3231 */ 			clearTimeout( resizeTimeout );
/* 3232 */ 		}
/* 3233 */ 
/* 3234 */ 		execAsap ?
/* 3235 */ 			dispatch() :
/* 3236 */ 			resizeTimeout = setTimeout( dispatch, $special.threshold );
/* 3237 */ 	},
/* 3238 */ 	threshold: 150
/* 3239 */ };
/* 3240 */ 
/* 3241 */ 
/* 3242 */ 
/* 3243 */ 
/* 3244 */ 
/* 3245 */ $.easing['jswing'] = $.easing['swing'];
/* 3246 */ 
/* 3247 */ $.extend( $.easing,
/* 3248 */ {
/* 3249 */ 	def: 'easeOutQuad',
/* 3250 */ 	swing: function (x, t, b, c, d) { return $.easing[$.easing.def](x, t, b, c, d); },

/* shortcodes.js */

/* 3251 */ 	easeInQuad: function (x, t, b, c, d) { return c*(t/=d)*t + b; },
/* 3252 */ 	easeOutQuad: function (x, t, b, c, d) { return -c *(t/=d)*(t-2) + b; },
/* 3253 */ 	easeInOutQuad: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t + b; return -c/2 * ((--t)*(t-2) - 1) + b; },
/* 3254 */ 	easeInCubic: function (x, t, b, c, d) { return c*(t/=d)*t*t + b; },
/* 3255 */ 	easeOutCubic: function (x, t, b, c, d) { return c*((t=t/d-1)*t*t + 1) + b; },
/* 3256 */ 	easeInOutCubic: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t + b; return c/2*((t-=2)*t*t + 2) + b;	},
/* 3257 */ 	easeInQuart: function (x, t, b, c, d) { return c*(t/=d)*t*t*t + b;	},
/* 3258 */ 	easeOutQuart: function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; },
/* 3259 */ 	easeInOutQuart: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t + b; return -c/2 * ((t-=2)*t*t*t - 2) + b;	},
/* 3260 */ 	easeInQuint: function (x, t, b, c, d) { return c*(t/=d)*t*t*t*t + b;	},
/* 3261 */ 	easeOutQuint: function (x, t, b, c, d) { return c*((t=t/d-1)*t*t*t*t + 1) + b;	},
/* 3262 */ 	easeInOutQuint: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b; return c/2*((t-=2)*t*t*t*t + 2) + b;	},
/* 3263 */ 	easeInSine: function (x, t, b, c, d) {	return -c * Math.cos(t/d * (Math.PI/2)) + c + b;	},
/* 3264 */ 	easeOutSine: function (x, t, b, c, d) { return c * Math.sin(t/d * (Math.PI/2)) + b;	},
/* 3265 */ 	easeInOutSine: function (x, t, b, c, d) { return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;	},
/* 3266 */ 	easeInExpo: function (x, t, b, c, d) { return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;	},
/* 3267 */ 	easeOutExpo: function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;	},
/* 3268 */ 	easeInOutExpo: function (x, t, b, c, d) {
/* 3269 */ 		if (t==0) return b;
/* 3270 */ 		if (t==d) return b+c;
/* 3271 */ 		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
/* 3272 */ 		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
/* 3273 */ 	},
/* 3274 */ 	easeInCirc: function (x, t, b, c, d) { return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;	},
/* 3275 */ 	easeOutCirc: function (x, t, b, c, d) {return c * Math.sqrt(1 - (t=t/d-1)*t) + b;	},
/* 3276 */ 	easeInOutCirc: function (x, t, b, c, d) { if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;	return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;	},
/* 3277 */ 	easeInElastic: function (x, t, b, c, d) {
/* 3278 */ 		var s=1.70158;var p=0;var a=c;
/* 3279 */ 		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
/* 3280 */ 		if (a < Math.abs(c)) { a=c; var s=p/4; }
/* 3281 */ 		else var s = p/(2*Math.PI) * Math.asin (c/a);
/* 3282 */ 		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
/* 3283 */ 	},
/* 3284 */ 	easeOutElastic: function (x, t, b, c, d) {
/* 3285 */ 		var s=1.70158;var p=0;var a=c;
/* 3286 */ 		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
/* 3287 */ 		if (a < Math.abs(c)) { a=c; var s=p/4; }
/* 3288 */ 		else var s = p/(2*Math.PI) * Math.asin (c/a);
/* 3289 */ 		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
/* 3290 */ 	},
/* 3291 */ 	easeInOutElastic: function (x, t, b, c, d) {
/* 3292 */ 		var s=1.70158;var p=0;var a=c;
/* 3293 */ 		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
/* 3294 */ 		if (a < Math.abs(c)) { a=c; var s=p/4; }
/* 3295 */ 		else var s = p/(2*Math.PI) * Math.asin (c/a);
/* 3296 */ 		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
/* 3297 */ 		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
/* 3298 */ 	},
/* 3299 */ 	easeInBack: function (x, t, b, c, d, s) {
/* 3300 */ 		if (s == undefined) s = 1.70158;

/* shortcodes.js */

/* 3301 */ 		return c*(t/=d)*t*((s+1)*t - s) + b;
/* 3302 */ 	},
/* 3303 */ 	easeOutBack: function (x, t, b, c, d, s) {
/* 3304 */ 		if (s == undefined) s = 1.70158;
/* 3305 */ 		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
/* 3306 */ 	},
/* 3307 */ 	easeInOutBack: function (x, t, b, c, d, s) {
/* 3308 */ 		if (s == undefined) s = 1.70158;
/* 3309 */ 		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
/* 3310 */ 		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
/* 3311 */ 	},
/* 3312 */ 	easeInBounce: function (x, t, b, c, d) {
/* 3313 */ 		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
/* 3314 */ 	},
/* 3315 */ 	easeOutBounce: function (x, t, b, c, d) {
/* 3316 */ 		if ((t/=d) < (1/2.75)) {
/* 3317 */ 			return c*(7.5625*t*t) + b;
/* 3318 */ 		} else if (t < (2/2.75)) {
/* 3319 */ 			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
/* 3320 */ 		} else if (t < (2.5/2.75)) {
/* 3321 */ 			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
/* 3322 */ 		} else {
/* 3323 */ 			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
/* 3324 */ 		}
/* 3325 */ 	},
/* 3326 */ 	easeInOutBounce: function (x, t, b, c, d) {
/* 3327 */ 		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
/* 3328 */ 		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
/* 3329 */ 	}
/* 3330 */ });
/* 3331 */ 
/* 3332 */ })( jQuery );
/* 3333 */ 
/* 3334 */ 
/* 3335 */ 
/* 3336 */ /*utility functions*/
/* 3337 */ 
/* 3338 */ 
/* 3339 */ (function($)
/* 3340 */ {
/* 3341 */ 	"use strict";
/* 3342 */ 
/* 3343 */ 	$.avia_utilities = $.avia_utilities || {};
/* 3344 */ 
/* 3345 */ 	/************************************************************************
/* 3346 *| 	gloabl loading function
/* 3347 *| 	*************************************************************************/
/* 3348 */ 	$.avia_utilities.loading = function(attach_to, delay){
/* 3349 */ 
/* 3350 */ 		var loader = {

/* shortcodes.js */

/* 3351 */ 
/* 3352 */ 			active: false,
/* 3353 */ 
/* 3354 */ 			show: function()
/* 3355 */ 			{
/* 3356 */ 				if(loader.active === false)
/* 3357 */ 				{
/* 3358 */ 					loader.active = true;
/* 3359 */ 					loader.loading_item.css({display:'block', opacity:0});
/* 3360 */ 				}
/* 3361 */ 
/* 3362 */ 				loader.loading_item.stop().animate({opacity:0.7});
/* 3363 */ 			},
/* 3364 */ 
/* 3365 */ 			hide: function()
/* 3366 */ 			{	
/* 3367 */ 				if(typeof delay === 'undefined'){ delay = 600; }
/* 3368 */ 
/* 3369 */ 				loader.loading_item.stop().delay( delay ).animate({opacity:0}, function()
/* 3370 */ 				{
/* 3371 */ 					loader.loading_item.css({display:'none'});
/* 3372 */ 					loader.active = false;
/* 3373 */ 				});
/* 3374 */ 			},
/* 3375 */ 
/* 3376 */ 			attach: function()
/* 3377 */ 			{
/* 3378 */ 				if(typeof attach_to === 'undefined'){ attach_to = 'body';}
/* 3379 */ 
/* 3380 */ 				loader.loading_item = $('<div class="avia_loading_icon"></div>').css({display:"none"}).appendTo(attach_to);
/* 3381 */ 			}
/* 3382 */ 		}
/* 3383 */ 
/* 3384 */ 		loader.attach();
/* 3385 */ 		return loader;
/* 3386 */ 	};
/* 3387 */ 	
/* 3388 */ 	/************************************************************************
/* 3389 *| 	gloabl play/pause visualizer function
/* 3390 *| 	*************************************************************************/
/* 3391 */ 	$.avia_utilities.playpause = function(attach_to, delay){
/* 3392 */ 
/* 3393 */ 		var pp = {
/* 3394 */ 
/* 3395 */ 			active: false,
/* 3396 */ 			to1: "", 
/* 3397 */ 			to2: "", 
/* 3398 */ 			set: function(status)
/* 3399 */ 			{	
/* 3400 */ 				pp.loading_item.removeClass('av-play av-pause');

/* shortcodes.js */

/* 3401 */ 				pp.to1 = setTimeout(function(){ pp.loading_item.addClass('av-' + status); },10);
/* 3402 */ 				pp.to2 = setTimeout(function(){ pp.loading_item.removeClass('av-' + status); },1500);
/* 3403 */ 			},
/* 3404 */ 
/* 3405 */ 			attach: function()
/* 3406 */ 			{
/* 3407 */ 				if(typeof attach_to === 'undefined'){ attach_to = 'body';}
/* 3408 */ 
/* 3409 */ 				pp.loading_item = $('<div class="avia_playpause_icon"></div>').css({display:"none"}).appendTo(attach_to);
/* 3410 */ 			}
/* 3411 */ 		}
/* 3412 */ 
/* 3413 */ 		pp.attach();
/* 3414 */ 		return pp;
/* 3415 */ 	};
/* 3416 */ 	
/* 3417 */ 	
/* 3418 */ 
/* 3419 */ 	/************************************************************************
/* 3420 *| 	preload images, as soon as all are loaded trigger a special load ready event
/* 3421 *| 	*************************************************************************/
/* 3422 */ 	$.avia_utilities.preload_images = 0;
/* 3423 */ 	$.avia_utilities.preload = function(options_passed)
/* 3424 */ 	{
/* 3425 */ 		var win		= $(window),
/* 3426 */ 		defaults	=
/* 3427 */ 		{
/* 3428 */ 			container:			'body',
/* 3429 */ 			maxLoops:			10,
/* 3430 */ 			trigger_single:		true,
/* 3431 */ 			single_callback:	function(){},
/* 3432 */ 			global_callback:	function(){}
/* 3433 */ 
/* 3434 */ 		},
/* 3435 */ 
/* 3436 */ 		options		= $.extend({}, defaults, options_passed),
/* 3437 */ 
/* 3438 */ 		methods		= {
/* 3439 */ 
/* 3440 */ 			checkImage: function(container)
/* 3441 */ 			{
/* 3442 */ 				container.images.each(function()
/* 3443 */ 				{
/* 3444 */ 					if(this.complete === true)
/* 3445 */ 					{
/* 3446 */ 						container.images = container.images.not(this);
/* 3447 */ 						$.avia_utilities.preload_images -= 1;
/* 3448 */ 					}
/* 3449 */ 				});
/* 3450 */ 

/* shortcodes.js */

/* 3451 */ 				if(container.images.length && options.maxLoops >= 0)
/* 3452 */ 				{
/* 3453 */ 					options.maxLoops-=1;
/* 3454 */ 					setTimeout(function(){ methods.checkImage(container); }, 500);
/* 3455 */ 				}
/* 3456 */ 				else
/* 3457 */ 				{
/* 3458 */ 					$.avia_utilities.preload_images = $.avia_utilities.preload_images - container.images.length;
/* 3459 */ 					methods.trigger_loaded(container);
/* 3460 */ 				}
/* 3461 */ 			},
/* 3462 */ 
/* 3463 */ 			trigger_loaded: function(container)
/* 3464 */ 			{
/* 3465 */ 				if(options.trigger_single !== false)
/* 3466 */ 				{
/* 3467 */ 					win.trigger('avia_images_loaded_single', [container]);
/* 3468 */ 					options.single_callback.call(container);
/* 3469 */ 				}
/* 3470 */ 
/* 3471 */ 				if($.avia_utilities.preload_images === 0)
/* 3472 */ 				{
/* 3473 */ 					win.trigger('avia_images_loaded');
/* 3474 */ 					options.global_callback.call();
/* 3475 */ 				}
/* 3476 */ 
/* 3477 */ 			}
/* 3478 */ 		};
/* 3479 */ 
/* 3480 */ 		if(typeof options.container === 'string'){options.container = $(options.container); }
/* 3481 */ 
/* 3482 */ 		options.container.each(function()
/* 3483 */ 		{
/* 3484 */ 			var container		= $(this);
/* 3485 */ 
/* 3486 */ 			container.images	= container.find('img');
/* 3487 */ 			container.allImages	= container.images;
/* 3488 */ 
/* 3489 */ 			$.avia_utilities.preload_images += container.images.length;
/* 3490 */ 			setTimeout(function(){ methods.checkImage(container); }, 10);
/* 3491 */ 		});
/* 3492 */ 	};
/* 3493 */ 
/* 3494 */ 
/* 3495 */ 
/* 3496 */ 	/************************************************************************
/* 3497 *| 	CSS Easing transformation table
/* 3498 *| 	*************************************************************************/
/* 3499 */ 	/*
/* 3500 *| 	Easing transform table from jquery.animate-enhanced plugin

/* shortcodes.js */

/* 3501 *| 	http://github.com/benbarnett/jQuery-Animate-Enhanced
/* 3502 *| 	*/
/* 3503 */ 	$.avia_utilities.css_easings = {
/* 3504 */ 			linear:			'linear',
/* 3505 */ 			swing:			'ease-in-out',
/* 3506 */ 			bounce:			'cubic-bezier(0.0, 0.35, .5, 1.3)',
/* 3507 */ 			easeInQuad:     'cubic-bezier(0.550, 0.085, 0.680, 0.530)' ,
/* 3508 */ 			easeInCubic:    'cubic-bezier(0.550, 0.055, 0.675, 0.190)' ,
/* 3509 */ 			easeInQuart:    'cubic-bezier(0.895, 0.030, 0.685, 0.220)' ,
/* 3510 */ 			easeInQuint:    'cubic-bezier(0.755, 0.050, 0.855, 0.060)' ,
/* 3511 */ 			easeInSine:     'cubic-bezier(0.470, 0.000, 0.745, 0.715)' ,
/* 3512 */ 			easeInExpo:     'cubic-bezier(0.950, 0.050, 0.795, 0.035)' ,
/* 3513 */ 			easeInCirc:     'cubic-bezier(0.600, 0.040, 0.980, 0.335)' ,
/* 3514 */ 			easeInBack:     'cubic-bezier(0.600, -0.280, 0.735, 0.04)' ,
/* 3515 */ 			easeOutQuad:    'cubic-bezier(0.250, 0.460, 0.450, 0.940)' ,
/* 3516 */ 			easeOutCubic:   'cubic-bezier(0.215, 0.610, 0.355, 1.000)' ,
/* 3517 */ 			easeOutQuart:   'cubic-bezier(0.165, 0.840, 0.440, 1.000)' ,
/* 3518 */ 			easeOutQuint:   'cubic-bezier(0.230, 1.000, 0.320, 1.000)' ,
/* 3519 */ 			easeOutSine:    'cubic-bezier(0.390, 0.575, 0.565, 1.000)' ,
/* 3520 */ 			easeOutExpo:    'cubic-bezier(0.190, 1.000, 0.220, 1.000)' ,
/* 3521 */ 			easeOutCirc:    'cubic-bezier(0.075, 0.820, 0.165, 1.000)' ,
/* 3522 */ 			easeOutBack:    'cubic-bezier(0.175, 0.885, 0.320, 1.275)' ,
/* 3523 */ 			easeInOutQuad:  'cubic-bezier(0.455, 0.030, 0.515, 0.955)' ,
/* 3524 */ 			easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)' ,
/* 3525 */ 			easeInOutQuart: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)' ,
/* 3526 */ 			easeInOutQuint: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)' ,
/* 3527 */ 			easeInOutSine:  'cubic-bezier(0.445, 0.050, 0.550, 0.950)' ,
/* 3528 */ 			easeInOutExpo:  'cubic-bezier(1.000, 0.000, 0.000, 1.000)' ,
/* 3529 */ 			easeInOutCirc:  'cubic-bezier(0.785, 0.135, 0.150, 0.860)' ,
/* 3530 */ 			easeInOutBack:  'cubic-bezier(0.680, -0.550, 0.265, 1.55)' ,
/* 3531 */ 			easeInOutBounce:'cubic-bezier(0.580, -0.365, 0.490, 1.365)',
/* 3532 */ 			easeOutBounce:	'cubic-bezier(0.760, 0.085, 0.490, 1.365)' 
/* 3533 */ 		};
/* 3534 */ 
/* 3535 */ 	/************************************************************************
/* 3536 *| 	check if a css feature is supported and save it to the supported array
/* 3537 *| 	*************************************************************************/
/* 3538 */ 	$.avia_utilities.supported	= {};
/* 3539 */ 	$.avia_utilities.supports	= (function()
/* 3540 */ 	{
/* 3541 */ 		var div		= document.createElement('div'),
/* 3542 */ 			vendors	= ['Khtml', 'Ms','Moz','Webkit'];  // vendors	= ['Khtml', 'Ms','Moz','Webkit','O']; 
/* 3543 */ 
/* 3544 */ 		return function(prop, vendor_overwrite)
/* 3545 */ 		{
/* 3546 */ 			if ( div.style[prop] !== undefined  ) { return ""; }
/* 3547 */ 			if (vendor_overwrite !== undefined) { vendors = vendor_overwrite; }
/* 3548 */ 
/* 3549 */ 			prop = prop.replace(/^[a-z]/, function(val)
/* 3550 */ 			{

/* shortcodes.js */

/* 3551 */ 				return val.toUpperCase();
/* 3552 */ 			});
/* 3553 */ 
/* 3554 */ 			var len	= vendors.length;
/* 3555 */ 			while(len--)
/* 3556 */ 			{
/* 3557 */ 				if ( div.style[vendors[len] + prop] !== undefined )
/* 3558 */ 				{
/* 3559 */ 					return "-" + vendors[len].toLowerCase() + "-";
/* 3560 */ 				}
/* 3561 */ 			}
/* 3562 */ 
/* 3563 */ 			return false;
/* 3564 */ 		};
/* 3565 */ 
/* 3566 */ 	}());
/* 3567 */ 
/* 3568 */ 	/************************************************************************
/* 3569 *| 	animation function
/* 3570 *| 	*************************************************************************/
/* 3571 */ 	$.fn.avia_animate = function(prop, speed, easing, callback)
/* 3572 */ 	{
/* 3573 */ 		if(typeof speed === 'function') {callback = speed; speed = false; }
/* 3574 */ 		if(typeof easing === 'function'){callback = easing; easing = false;}
/* 3575 */ 		if(typeof speed === 'string'){easing = speed; speed = false;}
/* 3576 */ 
/* 3577 */ 		if(callback === undefined || callback === false){ callback = function(){}; }
/* 3578 */ 		if(easing === undefined || easing === false)	{ easing = 'easeInQuad'; }
/* 3579 */ 		if(speed === undefined || speed === false)		{ speed = 400; }
/* 3580 */ 
/* 3581 */ 		if($.avia_utilities.supported.transition === undefined)
/* 3582 */ 		{
/* 3583 */ 			$.avia_utilities.supported.transition = $.avia_utilities.supports('transition');
/* 3584 */ 		}
/* 3585 */ 
/* 3586 */ 
/* 3587 */ 		if($.avia_utilities.supported.transition !== false )
/* 3588 */ 		{
/* 3589 */ 			var prefix		= $.avia_utilities.supported.transition + 'transition',
/* 3590 */ 				cssRule		= {},
/* 3591 */ 				cssProp		= {},
/* 3592 */ 				thisStyle	= document.body.style,
/* 3593 */ 				end			= (thisStyle.WebkitTransition !== undefined) ? 'webkitTransitionEnd' : (thisStyle.OTransition !== undefined) ? 'oTransitionEnd' : 'transitionend';
/* 3594 */ 
/* 3595 */ 			//translate easing into css easing
/* 3596 */ 			easing = $.avia_utilities.css_easings[easing];
/* 3597 */ 
/* 3598 */ 			//create css transformation rule
/* 3599 */ 			cssRule[prefix]	=  'all '+(speed/1000)+'s '+easing;
/* 3600 */ 			//add namespace to the transition end trigger

/* shortcodes.js */

/* 3601 */ 			end = end + ".avia_animate";
/* 3602 */ 			
/* 3603 */ 			//since jquery 1.10 the items passed need to be {} and not [] so make sure they are converted properly
/* 3604 */ 			for (var rule in prop)
/* 3605 */ 			{
/* 3606 */ 				if (prop.hasOwnProperty(rule)) { cssProp[rule] = prop[rule]; }
/* 3607 */ 			}
/* 3608 */ 			prop = cssProp;
/* 3609 */ 			
/* 3610 */ 			
/* 3611 */ 			
/* 3612 */ 			this.each(function()
/* 3613 */ 			{
/* 3614 */ 				var element	= $(this), css_difference = false, rule, current_css;
/* 3615 */ 
/* 3616 */ 				for (rule in prop)
/* 3617 */ 				{
/* 3618 */ 					if (prop.hasOwnProperty(rule))
/* 3619 */ 					{
/* 3620 */ 						current_css = element.css(rule);
/* 3621 */ 
/* 3622 */ 						if(prop[rule] != current_css && prop[rule] != current_css.replace(/px|%/g,""))
/* 3623 */ 						{
/* 3624 */ 							css_difference = true;
/* 3625 */ 							break;
/* 3626 */ 						}
/* 3627 */ 					}
/* 3628 */ 				}
/* 3629 */ 
/* 3630 */ 				if(css_difference)
/* 3631 */ 				{
/* 3632 */ 					//if no transform property is set set a 3d translate to enable hardware acceleration
/* 3633 */ 					if(!($.avia_utilities.supported.transition+"transform" in prop))
/* 3634 */ 					{
/* 3635 */ 						prop[$.avia_utilities.supported.transition+"transform"] = "translateZ(0)";
/* 3636 */ 					}
/* 3637 */ 					
/* 3638 */ 					element.on(end,  function(event)
/* 3639 */ 					{
/* 3640 */ 						if(event.target != event.currentTarget) return false;
/* 3641 */ 
/* 3642 */ 						cssRule[prefix] = "none";
/* 3643 */ 
/* 3644 */ 						element.off(end);
/* 3645 */ 						element.css(cssRule);
/* 3646 */ 						setTimeout(function(){ callback.call(element); });
/* 3647 */ 					});
/* 3648 */ 					
/* 3649 */ 					setTimeout(function(){ element.css(cssRule);},10);
/* 3650 */ 					setTimeout(function(){ element.css(prop);	},20);

/* shortcodes.js */

/* 3651 */ 				}
/* 3652 */ 				else
/* 3653 */ 				{
/* 3654 */ 					setTimeout(function(){ callback.call(element); });
/* 3655 */ 				}
/* 3656 */ 
/* 3657 */ 			});
/* 3658 */ 		}
/* 3659 */ 		else // if css animation is not available use default JS animation
/* 3660 */ 		{
/* 3661 */ 			this.animate(prop, speed, easing, callback);
/* 3662 */ 		}
/* 3663 */ 
/* 3664 */ 		return this;
/* 3665 */ 	};
/* 3666 */ 
/* 3667 */ })( jQuery );
/* 3668 */ 
/* 3669 */ 
/* 3670 */ /* ======================================================================================================================================================
/* 3671 *| Avia Slideshow
/* 3672 *| ====================================================================================================================================================== */
/* 3673 */ 
/* 3674 */ (function($)
/* 3675 */ {
/* 3676 */     "use strict";
/* 3677 */ 
/* 3678 */ 	$.AviaSlider  =  function(options, slider)
/* 3679 */ 	{
/* 3680 */ 		var self = this;
/* 3681 */ 		
/* 3682 */ 		this.$win	 = $( window );
/* 3683 */ 		
/* 3684 */ 	    this.$slider = $( slider );
/* 3685 */ 	    
/* 3686 */ 		this.isMobile = $.avia_utilities.isMobile;
/* 3687 */ 	    
/* 3688 */ 	    this._prepareSlides(options);
/* 3689 */ 	    
/* 3690 */ 		//default preload images then init slideshow
/* 3691 */ 	    $.avia_utilities.preload({container: this.$slider , single_callback:  function(){ self._init( options ); }});
/* 3692 */ 	}
/* 3693 */ 
/* 3694 */ 	$.AviaSlider.defaults  = {
/* 3695 */ 
/* 3696 */ 		//interval between autorotation switches
/* 3697 */ 		interval:5,
/* 3698 */ 
/* 3699 */ 		//autorotation active or not
/* 3700 */ 		autoplay:false,

/* shortcodes.js */

/* 3701 */ 		
/* 3702 */ 		//set if the loop will stop at the last/first slide or if the slides will loop infinite
/* 3703 */ 		//set to false for infinite loop, "last" to stop at the last slide or "first" to stop at the first slide
/* 3704 */ 		stopinfiniteloop: false,
/* 3705 */ 
/* 3706 */ 		//fade or slide animation
/* 3707 */ 		animation:'slide',
/* 3708 */ 
/* 3709 */ 		//transition speed when switching slide
/* 3710 */ 		transitionSpeed:900,
/* 3711 */ 
/* 3712 */ 		//easing method for the transition
/* 3713 */ 		easing:'easeInOutQuart',
/* 3714 */ 
/* 3715 */ 		//slide wrapper
/* 3716 */ 		wrapElement: '>ul',
/* 3717 */ 
/* 3718 */ 		//slide element
/* 3719 */ 		slideElement: '>li',
/* 3720 */ 
/* 3721 */ 		//pause if mouse cursor is above item
/* 3722 */ 		hoverpause: false,
/* 3723 */ 		
/* 3724 */ 		//attach images as background
/* 3725 */ 		bg_slider: false,
/* 3726 */ 		
/* 3727 */ 		//delay of miliseconds to wait before showing the next slide
/* 3728 */ 		show_slide_delay: 0
/* 3729 */ 
/* 3730 */ 	};
/* 3731 */ 
/* 3732 */   	$.AviaSlider.prototype =
/* 3733 */     {
/* 3734 */     	_init: function( options )
/* 3735 */     	{
/* 3736 */ 			// set slider options
/* 3737 */ 			this.options = this._setOptions(options);
/* 3738 */ 
/* 3739 */ 			//slidewrap
/* 3740 */ 			this.$sliderUl  = this.$slider.find(this.options.wrapElement);
/* 3741 */ 
/* 3742 */ 			// slide elements
/* 3743 */ 			this.$slides = this.$sliderUl.find(this.options.slideElement);
/* 3744 */ 
/* 3745 */ 			// goto dots
/* 3746 */ 			this.gotoButtons = this.$slider.find('.avia-slideshow-dots a');
/* 3747 */ 			
/* 3748 */ 			//perma caption
/* 3749 */ 			this.permaCaption =  this.$slider.find('>.av-slideshow-caption');
/* 3750 */ 

/* shortcodes.js */

/* 3751 */ 			// slide count
/* 3752 */ 			this.itemsCount = this.$slides.length;
/* 3753 */ 
/* 3754 */ 			// current image index
/* 3755 */ 			this.current = 0;
/* 3756 */ 
/* 3757 */ 			//loop count
/* 3758 */ 			this.loopCount = 0;
/* 3759 */ 
/* 3760 */ 			// control if the slicebox is animating
/* 3761 */ 			this.isAnimating = false;
/* 3762 */ 
/* 3763 */ 			// css browser prefix like -webkit-, -moz-
/* 3764 */ 			this.browserPrefix = $.avia_utilities.supports('transition');
/* 3765 */ 			
/* 3766 */ 			// css3 animation?
/* 3767 */ 			this.cssActive = this.browserPrefix !== false ? true : false;
/* 3768 */ 			
/* 3769 */ 			// css3D animation?
/* 3770 */ 			this.css3DActive = document.documentElement.className.indexOf('avia_transform3d') !== -1 ? true : false;
/* 3771 */ 			
/* 3772 */ 			//store the aviaVideoApi object for the current slide if available
/* 3773 */ 			this.video	= false;
/* 3774 */ 			
/* 3775 */ 			//if we have a bg slider no images were preloaded yet. in that case start preloading and attaching images
/* 3776 */ 			if(this.options.bg_slider == true)
/* 3777 */ 			{
/* 3778 */ 				//create array that holds all image urls to preload
/* 3779 */ 				this.imageUrls = [];
/* 3780 */ 				
/* 3781 */ 				//create a preloader icon to indicate loading
/* 3782 */ 				this.loader = $.avia_utilities.loading(this.$slider);
/* 3783 */ 				
/* 3784 */ 				//preload the images ony by one
/* 3785 */ 				this._bgPreloadImages();
/* 3786 */ 				
/* 3787 */ 			}
/* 3788 */ 			else //if it was a default slider all images are already loaded and we can start showing the slider
/* 3789 */ 			{			
/* 3790 */ 				//kickoff the slider: bind functions, show first slide, if active start the autorotation timer
/* 3791 */ 				this._kickOff();
/* 3792 */ 			}
/* 3793 */     	},
/* 3794 */ 
/* 3795 */     	//set the slider options by first merging the efault options and the passed options, then checking the slider element if any data attributes overwrite the option set
/* 3796 */     	_setOptions: function(options)
/* 3797 */ 		{
/* 3798 */ 			var newOptions 	= $.extend( true, {}, $.AviaSlider.defaults, options ),
/* 3799 */ 				htmlData 	= this.$slider.data(),
/* 3800 */ 				i 			= "";

/* shortcodes.js */

/* 3801 */ 
/* 3802 */ 			//overwritte passed option set with any data properties on the html element
/* 3803 */ 			for (i in htmlData)
/* 3804 */ 			{
/* 3805 */ 				if (htmlData.hasOwnProperty(i))
/* 3806 */ 				{
/* 3807 */ 					if(typeof htmlData[i] === "string" || typeof htmlData[i] === "number" || typeof htmlData[i] === "boolean")
/* 3808 */ 					{
/* 3809 */ 						newOptions[i] = htmlData[i];
/* 3810 */ 					}
/* 3811 */ 				}
/* 3812 */ 			}
/* 3813 */ 
/* 3814 */ 			return newOptions;
/* 3815 */ 		},
/* 3816 */ 		
/* 3817 */ 		_prepareSlides: function(options)
/* 3818 */ 		{	
/* 3819 */ 			//if its a mobile device find all video slides that need to be altered
/* 3820 */ 			if(this.isMobile)
/* 3821 */ 			{
/* 3822 */ 				var alter = this.$slider.find('.av-mobile-fallback-image');
/* 3823 */ 				alter.each(function()
/* 3824 */ 				{	
/* 3825 */ 					var current  = $(this).removeClass('av-video-slide').data({'avia_video_events': true, 'video-ratio':0}),
/* 3826 */ 						fallback = current.data('mobile-img');
/* 3827 */ 						
/* 3828 */ 					current.find('.av-click-overlay, .mejs-mediaelement, .mejs-container').remove();
/* 3829 */ 					
/* 3830 */ 					if(!fallback)
/* 3831 */ 					{
/* 3832 */ 						var appendTo = current.find('.avia-slide-wrap');
/* 3833 */ 						$('<p class="av-fallback-message"><span>Please set a mobile device fallback image for this video in your wordpress backend</span></p>').appendTo(appendTo);
/* 3834 */ 					}
/* 3835 */ 					
/* 3836 */ 					if(options && options.bg_slider)
/* 3837 */ 					{
/* 3838 */ 						current.data('img-url', fallback);
/* 3839 */ 					}
/* 3840 */ 					else
/* 3841 */ 					{
/* 3842 */ 						var image = $('<img src="'+fallback+'" alt="" title="" />');
/* 3843 */ 						current.find('.avia-slide-wrap').append(image);
/* 3844 */ 					}
/* 3845 */ 					
/* 3846 */ 				});
/* 3847 */ 			}
/* 3848 */ 			
/* 3849 */ 		},
/* 3850 */ 		

/* shortcodes.js */

/* 3851 */ 		//start preloading the background images
/* 3852 */ 		_bgPreloadImages : function(callback)
/* 3853 */     	{
/* 3854 */     		this._getImageURLS();
/* 3855 */     		this._preloadSingle(0, function()
/* 3856 */     		{
/* 3857 */     			this._kickOff();
/* 3858 */ 				this._preloadNext(1);
/* 3859 */     		});
/* 3860 */     	},
/* 3861 */ 		
/* 3862 */     	//if we are using a background image slider, fetch the images from a data attribute and preload them one by one
/* 3863 */     	_getImageURLS: function()
/* 3864 */     	{
/* 3865 */     		var _self = this;
/* 3866 */     		
/* 3867 */     		//collect url strings of the images to preload
/* 3868 */ 			this.$slides.each(function(i)
/* 3869 */ 			{
/* 3870 */ 				_self.imageUrls[i] = [];
/* 3871 */ 				_self.imageUrls[i]['url'] = $(this).data("img-url");
/* 3872 */ 				
/* 3873 */ 				//if no image is passed we can set the slide to loaded
/* 3874 */ 				if(typeof _self.imageUrls[i]['url'] == 'string')
/* 3875 */ 				{
/* 3876 */ 					_self.imageUrls[i]['status'] = false;
/* 3877 */ 				}
/* 3878 */ 				else
/* 3879 */ 				{
/* 3880 */ 					_self.imageUrls[i]['status'] = true;
/* 3881 */ 				}
/* 3882 */ 			});
/* 3883 */     	},
/* 3884 */     	
/* 3885 */     	
/* 3886 */     	_preloadSingle: function(key, callback)
/* 3887 */ 		{
/* 3888 */ 			var _self 		= this,
/* 3889 */ 				objImage	= new Image();
/* 3890 */ 			
/* 3891 */ 			if(typeof _self.imageUrls[key]['url'] == 'string')
/* 3892 */ 			{
/* 3893 */ 				$(objImage).bind('load error', function()
/* 3894 */ 				{ 
/* 3895 */ 					_self.imageUrls[key]['status'] = true; 
/* 3896 */ 					_self.$slides.eq(key).css('background-image','url(' + _self.imageUrls[key]['url'] + ')');
/* 3897 */ 					if(typeof callback == 'function') callback.apply( _self, [objImage, key] );
/* 3898 */ 				});
/* 3899 */ 				
/* 3900 */ 				objImage.src = _self.imageUrls[key]['url'];

/* shortcodes.js */

/* 3901 */ 			}
/* 3902 */ 			else
/* 3903 */ 			{
/* 3904 */ 				if(typeof callback == 'function') callback.apply( _self, [objImage, key] );
/* 3905 */ 			}
/* 3906 */ 		},
/* 3907 */ 		
/* 3908 */ 		_preloadNext: function(key)
/* 3909 */ 		{
/* 3910 */ 			if(typeof this.imageUrls[key] != "undefined")
/* 3911 */     		{
/* 3912 */ 				this._preloadSingle(key, function()
/* 3913 */ 	    		{
/* 3914 */ 					this._preloadNext(key + 1);
/* 3915 */ 	    		});
/* 3916 */     		}
/* 3917 */ 		},
/* 3918 */     	
/* 3919 */ 
/* 3920 */     	//bind click events of slide controlls to the public functions
/* 3921 */     	_bindEvents: function()
/* 3922 */     	{
/* 3923 */     		var self = this,
/* 3924 */     			win  = $( window );
/* 3925 */ 
/* 3926 */     		this.$slider.on('click','.next-slide', $.proxy( this.next, this) );
/* 3927 */     		this.$slider.on('click','.prev-slide', $.proxy( this.previous, this) );
/* 3928 */     		this.$slider.on('click','.goto-slide', $.proxy( this.go2, this) );
/* 3929 */ 
/* 3930 */     		if(this.options.hoverpause)
/* 3931 */     		{
/* 3932 */     			this.$slider.on('mouseenter', $.proxy( this.pause, this) );
/* 3933 */     			this.$slider.on('mouseleave', $.proxy( this.resume, this) );
/* 3934 */     		}
/* 3935 */ 
/* 3936 */ 			if(this.options.stopinfiniteloop && this.options.autoplay)
/* 3937 */ 			{
/* 3938 */ 				if(this.options.stopinfiniteloop == 'last')
/* 3939 */ 				{
/* 3940 */ 					this.$slider.on('avia_slider_last_slide', $.proxy(this._stopSlideshow, this) );
/* 3941 */ 				}
/* 3942 */ 				else if(this.options.stopinfiniteloop == 'first')
/* 3943 */ 				{
/* 3944 */ 					this.$slider.on('avia_slider_first_slide', $.proxy(this._stopSlideshow, this) );
/* 3945 */ 				}
/* 3946 */ 			}
/* 3947 */ 
/* 3948 */     		win.on( 'debouncedresize.aviaSlider',  $.proxy( this._setSize, this) );
/* 3949 */ 
/* 3950 */     		//if its a desktop browser add arrow navigation, otherwise add touch nav

/* shortcodes.js */

/* 3951 */     		if(!this.isMobile)
/* 3952 */     		{
/* 3953 */     			this.$slider.avia_keyboard_controls();
/* 3954 */     		}
/* 3955 */     		else
/* 3956 */     		{
/* 3957 */     			this.$slider.avia_swipe_trigger();
/* 3958 */     		}
/* 3959 */ 			
/* 3960 */ 			self._attach_video_events();
/* 3961 */     	},
/* 3962 */ 
/* 3963 */     	//kickoff the slider by binding all functions to slides and buttons, show the first slide and start autoplay
/* 3964 */     	_kickOff: function()
/* 3965 */     	{
/* 3966 */     		var self 			= this,
/* 3967 */     			first_slide 	= self.$slides.eq(0),
/* 3968 */     			video			= first_slide.data('video-ratio');
/* 3969 */     		  		
/* 3970 */     		// bind events to to the controll buttons
/* 3971 */ 			self._bindEvents();
/* 3972 */     		
/* 3973 */     		//show the first slide. if its a video set the correct size, otherwise make sure to remove the % padding
/* 3974 */     		if(video)
/* 3975 */     		{ 
/* 3976 */     			self._setSize(true); 
/* 3977 */     		}
/* 3978 */     		else
/* 3979 */     		{
/* 3980 */     			self.$sliderUl.css('padding',0);
/* 3981 */     			self.$win.trigger('av-height-change');
/* 3982 */     		}
/* 3983 */     		
/* 3984 */     		first_slide.css({visibility:'visible', opacity:0}).avia_animate({opacity:1}, function()
/* 3985 */     		{
/* 3986 */     			var current = $(this).addClass('active-slide');
/* 3987 */     			
/* 3988 */     			if(self.permaCaption.length)
/* 3989 */ 	    		{
/* 3990 */ 	    			self.permaCaption.addClass('active-slide');
/* 3991 */ 	    		}
/* 3992 */     		});
/* 3993 */     		
/* 3994 */     		// start autoplay if active
/* 3995 */ 			if( self.options.autoplay )
/* 3996 */ 			{
/* 3997 */ 				self._startSlideshow();
/* 3998 */ 			}
/* 3999 */     		
/* 4000 */     	},

/* shortcodes.js */

/* 4001 */ 
/* 4002 */     	//calculate which slide should be displayed next and call the executing transition function
/* 4003 */     	_navigate : function( dir, pos ) {
/* 4004 */ 
/* 4005 */ 			if( this.isAnimating || this.itemsCount < 2 )
/* 4006 */ 			{
/* 4007 */ 				return false;
/* 4008 */ 			}
/* 4009 */ 			
/* 4010 */ 			this.isAnimating = true;
/* 4011 */ 
/* 4012 */ 			// current item's index
/* 4013 */ 			this.prev = this.current;
/* 4014 */ 
/* 4015 */ 			// if position is passed
/* 4016 */ 			if( pos !== undefined )
/* 4017 */ 			{
/* 4018 */ 				this.current = pos;
/* 4019 */ 				dir = this.current > this.prev ? 'next' : 'prev';
/* 4020 */ 			}
/* 4021 */ 			// if not check the boundaries
/* 4022 */ 			else if( dir === 'next' )
/* 4023 */ 			{
/* 4024 */ 				this.current = this.current < this.itemsCount - 1 ? this.current + 1 : 0;
/* 4025 */ 				
/* 4026 */ 				if( this.current === 0 && this.options.autoplay_stopper == 1 && this.options.autoplay )
/* 4027 */ 				{
/* 4028 */ 					this.isAnimating = false;
/* 4029 */ 					this.current = this.prev;
/* 4030 */ 					this._stopSlideshow();
/* 4031 */ 					return false;
/* 4032 */ 				}
/* 4033 */ 			}
/* 4034 */ 			else if( dir === 'prev' )
/* 4035 */ 			{
/* 4036 */ 				this.current = this.current > 0 ? this.current - 1 : this.itemsCount - 1;
/* 4037 */ 			}
/* 4038 */ 
/* 4039 */ 			//set goto button
/* 4040 */ 			this.gotoButtons.removeClass('active').eq(this.current).addClass('active');
/* 4041 */ 
/* 4042 */ 			//set slideshow size
/* 4043 */ 			this._setSize();
/* 4044 */ 			
/* 4045 */ 			//if we are using a background slider make sure that the image is loaded. if not preload it, then show the slide
/* 4046 */ 			if(this.options.bg_slider == true)
/* 4047 */ 			{
/* 4048 */ 				if(this.imageUrls[this.current]['status'] == true )
/* 4049 */ 				{
/* 4050 */ 					this['_' + this.options.animation].call(this, dir);

/* shortcodes.js */

/* 4051 */ 				}
/* 4052 */ 				else
/* 4053 */ 				{
/* 4054 */ 					this.loader.show();
/* 4055 */ 					this._preloadSingle(this.current, function()
/* 4056 */     				{
/* 4057 */     					this['_' + this.options.animation].call(this, dir);
/* 4058 */     					this.loader.hide();
/* 4059 */     				});
/* 4060 */ 				}
/* 4061 */ 			}
/* 4062 */ 			else //no background loader -> images are already loaded
/* 4063 */ 			{
/* 4064 */ 				//call the executing function. for example _slide, or _fade. since the function call is absed on a var we can easily extend the slider with new animations
/* 4065 */ 				this['_' + this.options.animation].call(this, dir);
/* 4066 */ 			}
/* 4067 */ 
/* 4068 */ 			if(this.current == 0)
/* 4069 */ 			{
/* 4070 */ 				this.loopCount++;
/* 4071 */ 				this.$slider.trigger('avia_slider_first_slide');
/* 4072 */ 			}
/* 4073 */ 			else if(this.current == this.itemsCount - 1)
/* 4074 */ 			{
/* 4075 */ 				this.$slider.trigger('avia_slider_last_slide');
/* 4076 */ 			}
/* 4077 */ 			else
/* 4078 */ 			{
/* 4079 */ 				this.$slider.trigger('avia_slider_navigate_slide');
/* 4080 */ 			}
/* 4081 */ 		},
/* 4082 */ 
/* 4083 */ 		//if the next slide has a different height than the current change the slideshow height
/* 4084 */ 		_setSize: function(instant)
/* 4085 */ 		{
/* 4086 */ 			//if images are attached as bg images the slider has a fixed height
/* 4087 */ 			if(this.options.bg_slider == true) return;
/* 4088 */ 		
/* 4089 */ 			var self    		= this,
/* 4090 */ 				slide 			= this.$slides.eq(this.current),
/* 4091 */ 				current			= Math.floor(this.$sliderUl.height()),
/* 4092 */ 				ratio			= slide.data('video-ratio'),
/* 4093 */ 				setTo   		= ratio ? this.$sliderUl.width() / ratio : Math.floor(slide.height()),
/* 4094 */ 				video_height 	= slide.data('video-height'), //forced video height %. needs to be set only once
/* 4095 */ 				video_toppos 	= slide.data('video-toppos'); //forced video top position
/* 4096 */ 				
/* 4097 */ 				this.$sliderUl.height(current).css('padding',0); //make sure to set the slideheight to an actual value
/* 4098 */ 
/* 4099 */ 				if(setTo != current)
/* 4100 */ 				{

/* shortcodes.js */

/* 4101 */ 					if(instant == true)
/* 4102 */ 					{
/* 4103 */ 						this.$sliderUl.css({height:setTo});
/* 4104 */ 						this.$win.trigger('av-height-change');
/* 4105 */ 					}
/* 4106 */ 					else
/* 4107 */ 					{
/* 4108 */ 						this.$sliderUl.avia_animate({height:setTo}, function()
/* 4109 */ 						{
/* 4110 */ 							self.$win.trigger('av-height-change');
/* 4111 */ 						});
/* 4112 */ 					}
/* 4113 */ 				}
/* 4114 */ 				
/* 4115 */ 				if(video_height && video_height!= "set")
/* 4116 */ 				{
/* 4117 */ 					slide.find('iframe, embed, video, object, .av_youtube_frame').css({height: video_height + '%', top: video_toppos + '%'});
/* 4118 */ 					slide.data('video-height','set');
/* 4119 */ 				}
/* 4120 */ 		},
/* 4121 */ 
/* 4122 */ 
/* 4123 */ 		
/* 4124 */ 		_slide: function(dir)
/* 4125 */ 		{
/* 4126 */ 			var sliderWidth		= this.$slider.width(),
/* 4127 */ 				direction		= dir === 'next' ? -1 : 1,
/* 4128 */ 				property  		= this.browserPrefix + 'transform',
/* 4129 */ 				reset			= {}, transition = {},  transition2 = {},
/* 4130 */ 				trans_val 		= ( sliderWidth * direction * -1),
/* 4131 */ 				trans_val2 		= ( sliderWidth * direction);
/* 4132 */ 			
/* 4133 */ 			//do a css3 animation
/* 4134 */ 			if(this.cssActive)
/* 4135 */ 			{
/* 4136 */ 				property  = this.browserPrefix + 'transform';
/* 4137 */ 
/* 4138 */ 				//do a translate 3d transformation if available, since it uses hardware acceleration
/* 4139 */ 				if(this.css3DActive)
/* 4140 */ 				{
/* 4141 */ 					reset[property]  = "translate3d(" + trans_val + "px, 0, 0)";
/* 4142 */ 					transition[property]  = "translate3d(" + trans_val2 + "px, 0, 0)";
/* 4143 */ 					transition2[property] = "translate3d(0,0,0)";
/* 4144 */ 				}
/* 4145 */ 				else //do a 2d transform. still faster than a position "left" change
/* 4146 */ 				{
/* 4147 */ 					reset[property]  = "translate(" + trans_val + "px,0)";
/* 4148 */ 					transition[property]  = "translate(" + trans_val2 + "px,0)";
/* 4149 */ 					transition2[property] = "translate(0,0)";					}
/* 4150 */ 			}

/* shortcodes.js */

/* 4151 */ 			else
/* 4152 */ 			{
/* 4153 */ 				reset.left = trans_val;
/* 4154 */ 				transition.left = trans_val2;
/* 4155 */ 				transition2.left = 0;
/* 4156 */ 			}
/* 4157 */ 			
/* 4158 */ 			this._slide_animate(reset, transition, transition2);
/* 4159 */ 		},
/* 4160 */ 		
/* 4161 */ 		_slide_up: function(dir)
/* 4162 */ 		{
/* 4163 */ 			var sliderHeight	= this.$slider.height(),
/* 4164 */ 				direction		= dir === 'next' ? -1 : 1,
/* 4165 */ 				property  		= this.browserPrefix + 'transform',
/* 4166 */ 				reset			= {}, transition = {},  transition2 = {},
/* 4167 */ 				trans_val 		= ( sliderHeight * direction * -1),
/* 4168 */ 				trans_val2 		= ( sliderHeight * direction);
/* 4169 */ 			
/* 4170 */ 			//do a css3 animation
/* 4171 */ 			if(this.cssActive)
/* 4172 */ 			{
/* 4173 */ 				property  = this.browserPrefix + 'transform';
/* 4174 */ 
/* 4175 */ 				//do a translate 3d transformation if available, since it uses hardware acceleration
/* 4176 */ 				if(this.css3DActive)
/* 4177 */ 				{
/* 4178 */ 					reset[property]  = "translate3d( 0," + trans_val + "px, 0)";
/* 4179 */ 					transition[property]  = "translate3d( 0," + trans_val2 + "px, 0)";
/* 4180 */ 					transition2[property] = "translate3d(0,0,0)";
/* 4181 */ 				}
/* 4182 */ 				else //do a 2d transform. still faster than a position "left" change
/* 4183 */ 				{
/* 4184 */ 					reset[property]  = "translate( 0," + trans_val + "px)";
/* 4185 */ 					transition[property]  = "translate( 0," + trans_val2 + "px)";
/* 4186 */ 					transition2[property] = "translate(0,0)";					}
/* 4187 */ 			}
/* 4188 */ 			else
/* 4189 */ 			{
/* 4190 */ 				reset.top = trans_val;
/* 4191 */ 				transition.top = trans_val2;
/* 4192 */ 				transition2.top = 0;
/* 4193 */ 			}
/* 4194 */ 			
/* 4195 */ 			this._slide_animate(reset, transition, transition2);
/* 4196 */ 		},
/* 4197 */ 		
/* 4198 */ 		
/* 4199 */ 		//slide animation: do a slide transition by css3 transform if possible. if not simply do a position left transition
/* 4200 */ 		_slide_animate: function( reset , transition , transition2 )

/* shortcodes.js */

/* 4201 */ 		{
/* 4202 */ 		
/* 4203 */ 			var self			= this,
/* 4204 */ 				displaySlide 	= this.$slides.eq(this.current),
/* 4205 */ 				hideSlide		= this.$slides.eq(this.prev);
/* 4206 */ 				
/* 4207 */ 				hideSlide.trigger('pause');	
/* 4208 */ 				if( !displaySlide.data('disableAutoplay') ) displaySlide.trigger('play');
/* 4209 */ 
/* 4210 */ 				displaySlide.css({visibility:'visible', zIndex:4, opacity:1, left:0, top:0});
/* 4211 */ 				displaySlide.css(reset);
/* 4212 */ 				
/* 4213 */ 				hideSlide.avia_animate(transition, this.options.transitionSpeed, this.options.easing);
/* 4214 */ 
/* 4215 */ 				var after_slide = function()
/* 4216 */ 				{
/* 4217 */ 					self.isAnimating = false;
/* 4218 */ 					displaySlide.addClass('active-slide');
/* 4219 */ 					hideSlide.css({visibility:'hidden'}).removeClass('active-slide');
/* 4220 */ 					self.$slider.trigger('avia-transition-done');
/* 4221 */ 				}
/* 4222 */ 				
/* 4223 */ 				if(self.options.show_slide_delay > 0)
/* 4224 */ 				{
/* 4225 */ 					setTimeout(function() { displaySlide.avia_animate(transition2, self.options.transitionSpeed, self.options.easing, after_slide); },self.options.show_slide_delay);
/* 4226 */ 				}
/* 4227 */ 				else
/* 4228 */ 				{
/* 4229 */ 					displaySlide.avia_animate(transition2, self.options.transitionSpeed, self.options.easing, after_slide);
/* 4230 */ 				}
/* 4231 */ 
/* 4232 */ 		},
/* 4233 */ 		
/* 4234 */ 		//simple fade transition of the slideshow
/* 4235 */ 		_fade: function()
/* 4236 */ 		{
/* 4237 */ 			var self			= this,
/* 4238 */ 				displaySlide 	= this.$slides.eq(this.current),
/* 4239 */ 				hideSlide		= this.$slides.eq(this.prev);
/* 4240 */ 			
/* 4241 */ 			hideSlide.trigger('pause');	
/* 4242 */ 			if( !displaySlide.data('disableAutoplay') ) displaySlide.trigger('play');
/* 4243 */ 
/* 4244 */ 			displaySlide.css({visibility:'visible', zIndex:3, opacity:0}).avia_animate({opacity:1}, this.options.transitionSpeed/2, 'linear', function()
/* 4245 */ 			{
/* 4246 */ 				hideSlide.avia_animate({opacity:0}, 200, 'linear', function()
/* 4247 */ 				{
/* 4248 */ 					self.isAnimating = false;
/* 4249 */ 					displaySlide.addClass('active-slide');
/* 4250 */ 					hideSlide.css({visibility:'hidden', zIndex:2}).removeClass('active-slide');

/* shortcodes.js */

/* 4251 */ 					self.$slider.trigger('avia-transition-done');
/* 4252 */ 				});
/* 4253 */ 			});
/* 4254 */ 			
/* 4255 */ 			
/* 4256 */ 		},
/* 4257 */ 		
/* 4258 */ 		
/* 4259 */ 		/************************************************************************
/* 4260 *| 		Video functions
/* 4261 *| 		*************************************************************************/
/* 4262 */ 		
/* 4263 */ 		//bind events to the video that tell the slider to autorotate once a video has been played
/* 4264 */ 		_attach_video_events: function()
/* 4265 */ 		{
/* 4266 */ 			var self = this, $html = $('html');
/* 4267 */ 						
/* 4268 */ 			self.$slides.each(function(i)
/* 4269 */ 			{
/* 4270 */ 				var currentSlide 	= $(this),
/* 4271 */ 					caption			= currentSlide.find('.caption_fullwidth, .av-click-overlay'),
/* 4272 */ 					mejs			= currentSlide.find('.mejs-mediaelement');
/* 4273 */ 								
/* 4274 */ 				if(currentSlide.data('avia_video_events') != true)
/* 4275 */ 				{
/* 4276 */ 					currentSlide.data('avia_video_events', true);
/* 4277 */ 					
/* 4278 */ 					currentSlide.on('av-video-events-bound', { slide: currentSlide, wrap: mejs , iteration: i , self: self }, onReady);
/* 4279 */ 					
/* 4280 */ 					currentSlide.on('av-video-ended', { slide: currentSlide , self: self}, onFinish);
/* 4281 */ 					
/* 4282 */ 					currentSlide.on('av-video-play-executed', function(){ setTimeout(function(){  self.pause() }, 100); });
/* 4283 */ 						
/* 4284 */ 					caption.on('click', { slide: currentSlide }, toggle);
/* 4285 */ 					
/* 4286 */ 					// also if the player was loaded before the _bindEvents function was bound trigger it manually
/* 4287 */ 					if(currentSlide.is('.av-video-events-bound')) currentSlide.trigger('av-video-events-bound');
/* 4288 */ 				}
/* 4289 */ 			});
/* 4290 */ 			
/* 4291 */ 			
/* 4292 */ 			//helper functions
/* 4293 */ 			function onReady( event ) 
/* 4294 */ 			{ 	
/* 4295 */ 				//autostart for first slide
/* 4296 */ 				if(event.data.iteration === 0) 
/* 4297 */ 				{	
/* 4298 */ 					event.data.wrap.css('opacity',0);
/* 4299 */ 					if(!event.data.self.isMobile && !event.data.slide.data('disableAutoplay')) { event.data.slide.trigger('play'); } 
/* 4300 */ 					setTimeout(function(){ event.data.wrap.avia_animate({opacity:1}, 400); }, 50);

/* shortcodes.js */

/* 4301 */ 				}
/* 4302 */ 				else if ($html.is('.avia-msie') && !event.data.slide.is('.av-video-service-html5'))
/* 4303 */ 				{	
/* 4304 */ 					/*
/* 4305 *| 					* Internet Explorer fires the ready event for external videos once they become visible 
/* 4306 *| 					* as oposed to other browsers which always fire immediately. 
/* 4307 *| 					*/
/* 4308 */ 					if( !event.data.slide.data('disableAutoplay') ) event.data.slide.trigger('play');
/* 4309 */ 				}
/* 4310 */ 				
/* 4311 */ 			}
/* 4312 */ 			
/* 4313 */ 			
/* 4314 */ 			
/* 4315 */ 			
/* 4316 */ 			function onFinish( event )
/* 4317 */ 			{ 	
/* 4318 */ 				//if the video is not looped resume the slideshow
/* 4319 */ 				if(!event.data.slide.is('.av-single-slide') && !event.data.slide.is('.av-loop-video'))
/* 4320 */ 				{
/* 4321 */ 					event.data.slide.trigger('reset');
/* 4322 */ 					self._navigate( 'next' );  
/* 4323 */ 					self.resume(); 
/* 4324 */ 				}
/* 4325 */ 			}
/* 4326 */ 			
/* 4327 */ 			function toggle( event )
/* 4328 */ 			{
/* 4329 */ 				if(event.target.tagName != "A") 
/* 4330 */ 				{
/* 4331 */ 					event.data.slide.trigger('toggle');
/* 4332 */ 				}
/* 4333 */ 			}
/* 4334 */ 			
/* 4335 */ 		},
/* 4336 */ 		
/* 4337 */ 		
/* 4338 */ 		
/* 4339 */ 		/************************************************************************
/* 4340 *| 		Slideshow control functions
/* 4341 *| 		*************************************************************************/
/* 4342 */ 		
/* 4343 */ 		_timer: function(callback, delay, first)
/* 4344 */ 		{	
/* 4345 */ 		    var self = this, start, remaining = delay;
/* 4346 */ 			
/* 4347 */ 			self.timerId = 0;
/* 4348 */ 			
/* 4349 */ 		    this.pause = function() {
/* 4350 */ 		        window.clearTimeout(self.timerId);

/* shortcodes.js */

/* 4351 */ 		        remaining -= new Date() - start;
/* 4352 */ 		    };
/* 4353 */ 
/* 4354 */ 		    this.resume = function() {
/* 4355 */ 		        start = new Date();
/* 4356 */ 		        self.timerId = window.setTimeout(callback, remaining);
/* 4357 */ 		    };
/* 4358 */ 
/* 4359 */ 		    this.destroy = function()
/* 4360 */ 		    {
/* 4361 */ 		    	window.clearTimeout(self.timerId);
/* 4362 */ 		    };
/* 4363 */ 
/* 4364 */ 		    this.resume(true);
/* 4365 */ 		},
/* 4366 */ 
/* 4367 */ 		//start autorotation
/* 4368 */ 		_startSlideshow: function()
/* 4369 */ 		{
/* 4370 */ 			var self = this;
/* 4371 */ 			
/* 4372 */ 			this.isPlaying = true;
/* 4373 */ 			
/* 4374 */ 			this.slideshow = new this._timer( function()
/* 4375 */ 			{
/* 4376 */ 				self._navigate( 'next' );
/* 4377 */ 	
/* 4378 */ 				if ( self.options.autoplay )
/* 4379 */ 				{
/* 4380 */ 					self._startSlideshow();
/* 4381 */ 				}
/* 4382 */ 
/* 4383 */ 			}, (this.options.interval * 1000));
/* 4384 */ 		},
/* 4385 */ 
/* 4386 */ 		//stop autorotation
/* 4387 */ 		_stopSlideshow: function()
/* 4388 */ 		{
/* 4389 */ 			if ( this.options.autoplay ) {
/* 4390 */ 
/* 4391 */ 				this.slideshow.destroy();
/* 4392 */ 				this.isPlaying = false;
/* 4393 */ 				this.options.autoplay = false;
/* 4394 */ 			}
/* 4395 */ 		},
/* 4396 */ 
/* 4397 */ 		// public method: shows next image
/* 4398 */ 		next : function(e)
/* 4399 */ 		{
/* 4400 */ 			e.preventDefault();

/* shortcodes.js */

/* 4401 */ 			this._stopSlideshow();
/* 4402 */ 			this._navigate( 'next' );
/* 4403 */ 		},
/* 4404 */ 
/* 4405 */ 		// public method: shows previous image
/* 4406 */ 		previous : function(e)
/* 4407 */ 		{
/* 4408 */ 			e.preventDefault();
/* 4409 */ 			this._stopSlideshow();
/* 4410 */ 			this._navigate( 'prev' );
/* 4411 */ 		},
/* 4412 */ 
/* 4413 */ 		// public method: goes to a specific image
/* 4414 */ 		go2 : function( pos )
/* 4415 */ 		{
/* 4416 */ 			//if we didnt pass a number directly lets asume someone clicked on a link that triggered the goto transition
/* 4417 */ 			if(isNaN(pos))
/* 4418 */ 			{
/* 4419 */ 				//in that case prevent the default link behavior and set the slide number to the links hash
/* 4420 */ 				pos.preventDefault();
/* 4421 */ 				pos = pos.currentTarget.hash.replace('#','');
/* 4422 */ 			}
/* 4423 */ 
/* 4424 */ 			pos -= 1;
/* 4425 */ 
/* 4426 */ 			if( pos === this.current || pos >= this.itemsCount || pos < 0 )
/* 4427 */ 			{
/* 4428 */ 				return false;
/* 4429 */ 			}
/* 4430 */ 
/* 4431 */ 			this._stopSlideshow();
/* 4432 */ 			this._navigate( false, pos );
/* 4433 */ 
/* 4434 */ 		},
/* 4435 */ 
/* 4436 */ 		// public method: starts the slideshow
/* 4437 */ 		// any call to next(), previous() or goto() will stop the slideshow autoplay
/* 4438 */ 		play : function()
/* 4439 */ 		{
/* 4440 */ 			if( !this.isPlaying )
/* 4441 */ 			{
/* 4442 */ 				this.isPlaying = true;
/* 4443 */ 
/* 4444 */ 				this._navigate( 'next' );
/* 4445 */ 				this.options.autoplay = true;
/* 4446 */ 				this._startSlideshow();
/* 4447 */ 			}
/* 4448 */ 
/* 4449 */ 		},
/* 4450 */ 

/* shortcodes.js */

/* 4451 */ 		// public methos: pauses the slideshow
/* 4452 */ 		pause : function()
/* 4453 */ 		{
/* 4454 */ 			if( this.isPlaying )
/* 4455 */ 			{
/* 4456 */ 				this.slideshow.pause();
/* 4457 */ 			}
/* 4458 */ 		},
/* 4459 */ 
/* 4460 */ 		// publiccmethos: resumes the slideshow
/* 4461 */ 		resume : function()
/* 4462 */ 		{
/* 4463 */ 			if( this.isPlaying )
/* 4464 */ 			{
/* 4465 */ 				this.slideshow.resume();
/* 4466 */ 			}
/* 4467 */ 		},
/* 4468 */ 
/* 4469 */ 		// public methos: destroys the instance
/* 4470 */ 		destroy : function( callback )
/* 4471 */ 		{
/* 4472 */ 			this.slideshow.destroy( callback );
/* 4473 */ 		}
/* 4474 */ 
/* 4475 */     }
/* 4476 */ 
/* 4477 */     //simple wrapper to call the slideshow. makes sure that the slide data is not applied twice
/* 4478 */     $.fn.aviaSlider = function( options )
/* 4479 */     {
/* 4480 */     	return this.each(function()
/* 4481 */     	{
/* 4482 */     		var self = $.data( this, 'aviaSlider' );
/* 4483 */ 
/* 4484 */     		if(!self)
/* 4485 */     		{
/* 4486 */     			self = $.data( this, 'aviaSlider', new $.AviaSlider( options, this ) );
/* 4487 */     		}
/* 4488 */     	});
/* 4489 */     }
/* 4490 */ 
/* 4491 */ 
/* 4492 */ 
/* 4493 */ })( jQuery );
/* 4494 */ 
/* 4495 */ 
/* 4496 */ 
/* 4497 */ 
/* 4498 */ // -------------------------------------------------------------------------------------------
/* 4499 */ // keyboard controls
/* 4500 */ // -------------------------------------------------------------------------------------------

/* shortcodes.js */

/* 4501 */ 
/* 4502 */ (function($)
/* 4503 */ {
/* 4504 */ 	"use strict";
/* 4505 */ 
/* 4506 */ 	/************************************************************************
/* 4507 *| 	keyboard arrow nav
/* 4508 *| 	*************************************************************************/
/* 4509 */ 	$.fn.avia_keyboard_controls = function(options_passed)
/* 4510 */ 	{
/* 4511 */ 		var defaults	=
/* 4512 */ 		{
/* 4513 */ 			37: '.prev-slide',	// prev
/* 4514 */ 			39: '.next-slide'	// next
/* 4515 */ 		},
/* 4516 */ 
/* 4517 */ 		methods		= {
/* 4518 */ 
/* 4519 */ 			mousebind: function(slider)
/* 4520 */ 			{
/* 4521 */ 				slider.hover(
/* 4522 */ 					function(){  slider.mouseover	= true;  },
/* 4523 */ 					function(){  slider.mouseover	= false; }
/* 4524 */ 				);
/* 4525 */ 			},
/* 4526 */ 
/* 4527 */ 			keybind: function(slider)
/* 4528 */ 			{
/* 4529 */ 				$(document).keydown(function(e)
/* 4530 */ 				{
/* 4531 */ 					if(slider.mouseover && typeof slider.options[e.keyCode] !== 'undefined')
/* 4532 */ 					{
/* 4533 */ 						var item;
/* 4534 */ 
/* 4535 */ 						if(typeof slider.options[e.keyCode] === 'string')
/* 4536 */ 						{
/* 4537 */ 							item = slider.find(slider.options[e.keyCode]);
/* 4538 */ 						}
/* 4539 */ 						else
/* 4540 */ 						{
/* 4541 */ 							item = slider.options[e.keyCode];
/* 4542 */ 						}
/* 4543 */ 
/* 4544 */ 						if(item.length)
/* 4545 */ 						{
/* 4546 */ 							item.trigger('click', ['keypress']);
/* 4547 */ 							return false;
/* 4548 */ 						}
/* 4549 */ 					}
/* 4550 */ 				});

/* shortcodes.js */

/* 4551 */ 			}
/* 4552 */ 		};
/* 4553 */ 
/* 4554 */ 
/* 4555 */ 		return this.each(function()
/* 4556 */ 		{
/* 4557 */ 			var slider			= $(this);
/* 4558 */ 			slider.options		= $.extend({}, defaults, options_passed);
/* 4559 */ 			slider.mouseover	= false;
/* 4560 */ 
/* 4561 */ 			methods.mousebind(slider);
/* 4562 */ 			methods.keybind(slider);
/* 4563 */ 
/* 4564 */ 		});
/* 4565 */ 	};
/* 4566 */ 
/* 4567 */ 
/* 4568 */ 	/************************************************************************
/* 4569 *| 	swipe nav
/* 4570 *| 	*************************************************************************/
/* 4571 */ 	$.fn.avia_swipe_trigger = function(passed_options)
/* 4572 */ 	{
/* 4573 */ 		var win		= $(window),
/* 4574 */ 		isMobile	= $.avia_utilities.isMobile,
/* 4575 */ 		defaults	=
/* 4576 */ 		{
/* 4577 */ 			prev: '.prev-slide',
/* 4578 */ 			next: '.next-slide',
/* 4579 */ 			event: {
/* 4580 */ 				prev: 'click',
/* 4581 */ 				next: 'click'
/* 4582 */ 			}
/* 4583 */ 		},
/* 4584 */ 
/* 4585 */ 		methods = {
/* 4586 */ 
/* 4587 */ 			activate_touch_control: function(slider)
/* 4588 */ 			{
/* 4589 */ 				var i, differenceX, differenceY;
/* 4590 */ 
/* 4591 */ 				slider.touchPos = {};
/* 4592 */ 				slider.hasMoved = false;
/* 4593 */ 
/* 4594 */ 				slider.on('touchstart', function(event)
/* 4595 */ 				{
/* 4596 */ 					slider.touchPos.X = event.originalEvent.touches[0].clientX;
/* 4597 */ 					slider.touchPos.Y = event.originalEvent.touches[0].clientY;
/* 4598 */ 				});
/* 4599 */ 
/* 4600 */ 				slider.on('touchend', function(event)

/* shortcodes.js */

/* 4601 */ 				{
/* 4602 */ 					slider.touchPos = {};
/* 4603 */ 	                if(slider.hasMoved) { event.preventDefault(); }
/* 4604 */ 	                slider.hasMoved = false;
/* 4605 */ 				});
/* 4606 */ 
/* 4607 */ 				slider.on('touchmove', function(event)
/* 4608 */ 				{
/* 4609 */ 					if(!slider.touchPos.X)
/* 4610 */ 					{
/* 4611 */ 						slider.touchPos.X = event.originalEvent.touches[0].clientX;
/* 4612 */ 						slider.touchPos.Y = event.originalEvent.touches[0].clientY;
/* 4613 */ 					}
/* 4614 */ 					else
/* 4615 */ 					{
/* 4616 */ 						differenceX = event.originalEvent.touches[0].clientX - slider.touchPos.X;
/* 4617 */ 						differenceY = event.originalEvent.touches[0].clientY - slider.touchPos.Y;
/* 4618 */ 
/* 4619 */ 						//check if user is scrolling the window or moving the slider
/* 4620 */ 						if(Math.abs(differenceX) > Math.abs(differenceY))
/* 4621 */ 						{
/* 4622 */ 							event.preventDefault();
/* 4623 */ 
/* 4624 */ 							if(slider.touchPos !== event.originalEvent.touches[0].clientX)
/* 4625 */ 							{
/* 4626 */ 								if(Math.abs(differenceX) > 50)
/* 4627 */ 								{
/* 4628 */ 									i = differenceX > 0 ? 'prev' : 'next';
/* 4629 */ 
/* 4630 */ 									if(typeof slider.options[i] === 'string')
/* 4631 */ 									{
/* 4632 */ 										slider.find(slider.options[i]).trigger(slider.options.event[i], ['swipe']);
/* 4633 */ 									}
/* 4634 */ 									else
/* 4635 */ 									{
/* 4636 */ 										slider.options[i].trigger(slider.options.event[i], ['swipe']);
/* 4637 */ 									}
/* 4638 */ 
/* 4639 */ 									slider.hasMoved = true;
/* 4640 */ 									slider.touchPos = {};
/* 4641 */ 									return false;
/* 4642 */ 								}
/* 4643 */ 							}
/* 4644 */ 						}
/* 4645 */ 	                }
/* 4646 */ 				});
/* 4647 */ 			}
/* 4648 */ 		};
/* 4649 */ 
/* 4650 */ 		return this.each(function()

/* shortcodes.js */

/* 4651 */ 		{
/* 4652 */ 			if(isMobile)
/* 4653 */ 			{
/* 4654 */ 				var slider	= $(this);
/* 4655 */ 
/* 4656 */ 				slider.options	= $.extend({}, defaults, passed_options);
/* 4657 */ 
/* 4658 */ 				methods.activate_touch_control(slider);
/* 4659 */ 			}
/* 4660 */ 		});
/* 4661 */ 	};
/* 4662 */ 
/* 4663 */ 
/* 4664 */ 
/* 4665 */ 
/* 4666 */ 
/* 4667 */ 
/* 4668 */ 
/* 4669 */ 
/* 4670 */ 
/* 4671 */ 
/* 4672 */ 
/* 4673 */ 
/* 4674 */ 
/* 4675 */ }(jQuery));
/* 4676 */ 
/* 4677 */ 
/* 4678 */ 
/* 4679 */ 
/* 4680 */ 

;
/* jquery.magnific-popup.min.js */

/* 1 */ /*! Magnific Popup - v0.9.9 - 2013-12-27
/* 2 *| * http://dimsemenov.com/plugins/magnific-popup/
/* 3 *| * Copyright (c) 2013 Dmitry Semenov; */
/* 4 */ (function(e){var t,n,i,o,r,a,s,l="Close",c="BeforeClose",d="AfterClose",u="BeforeAppend",p="MarkupParse",f="Open",m="Change",g="mfp",h="."+g,v="mfp-ready",C="mfp-removing",y="mfp-prevent-close",w=function(){},b=!!window.jQuery,I=e(window),x=function(e,n){t.ev.on(g+e+h,n)},k=function(t,n,i,o){var r=document.createElement("div");return r.className="mfp-"+t,i&&(r.innerHTML=i),o?n&&n.appendChild(r):(r=e(r),n&&r.appendTo(n)),r},T=function(n,i){t.ev.triggerHandler(g+n,i),t.st.callbacks&&(n=n.charAt(0).toLowerCase()+n.slice(1),t.st.callbacks[n]&&t.st.callbacks[n].apply(t,e.isArray(i)?i:[i]))},E=function(n){return n===s&&t.currTemplate.closeBtn||(t.currTemplate.closeBtn=e(t.st.closeMarkup.replace("%title%",t.st.tClose)),s=n),t.currTemplate.closeBtn},_=function(){e.magnificPopup.instance||(t=new w,t.init(),e.magnificPopup.instance=t)},S=function(){var e=document.createElement("p").style,t=["ms","O","Moz","Webkit"];if(void 0!==e.transition)return!0;for(;t.length;)if(t.pop()+"Transition"in e)return!0;return!1};w.prototype={constructor:w,init:function(){var n=navigator.appVersion;t.isIE7=-1!==n.indexOf("MSIE 7."),t.isIE8=-1!==n.indexOf("MSIE 8."),t.isLowIE=t.isIE7||t.isIE8,t.isAndroid=/android/gi.test(n),t.isIOS=/iphone|ipad|ipod/gi.test(n),t.supportsTransition=S(),t.probablyMobile=t.isAndroid||t.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent),o=e(document),t.popupsCache={}},open:function(n){i||(i=e(document.body));var r;if(n.isObj===!1){t.items=n.items.toArray(),t.index=0;var s,l=n.items;for(r=0;l.length>r;r++)if(s=l[r],s.parsed&&(s=s.el[0]),s===n.el[0]){t.index=r;break}}else t.items=e.isArray(n.items)?n.items:[n.items],t.index=n.index||0;if(t.isOpen)return t.updateItemHTML(),void 0;t.types=[],a="",t.ev=n.mainEl&&n.mainEl.length?n.mainEl.eq(0):o,n.key?(t.popupsCache[n.key]||(t.popupsCache[n.key]={}),t.currTemplate=t.popupsCache[n.key]):t.currTemplate={},t.st=e.extend(!0,{},e.magnificPopup.defaults,n),t.fixedContentPos="auto"===t.st.fixedContentPos?!t.probablyMobile:t.st.fixedContentPos,t.st.modal&&(t.st.closeOnContentClick=!1,t.st.closeOnBgClick=!1,t.st.showCloseBtn=!1,t.st.enableEscapeKey=!1),t.bgOverlay||(t.bgOverlay=k("bg").on("click"+h,function(){t.close()}),t.wrap=k("wrap").attr("tabindex",-1).on("click"+h,function(e){t._checkIfClose(e.target)&&t.close()}),t.container=k("container",t.wrap)),t.contentContainer=k("content"),t.st.preloader&&(t.preloader=k("preloader",t.container,t.st.tLoading));var c=e.magnificPopup.modules;for(r=0;c.length>r;r++){var d=c[r];d=d.charAt(0).toUpperCase()+d.slice(1),t["init"+d].call(t)}T("BeforeOpen"),t.st.showCloseBtn&&(t.st.closeBtnInside?(x(p,function(e,t,n,i){n.close_replaceWith=E(i.type)}),a+=" mfp-close-btn-in"):t.wrap.append(E())),t.st.alignTop&&(a+=" mfp-align-top"),t.fixedContentPos?t.wrap.css({overflow:t.st.overflowY,overflowX:"hidden",overflowY:t.st.overflowY}):t.wrap.css({top:I.scrollTop(),position:"absolute"}),(t.st.fixedBgPos===!1||"auto"===t.st.fixedBgPos&&!t.fixedContentPos)&&t.bgOverlay.css({height:o.height(),position:"absolute"}),t.st.enableEscapeKey&&o.on("keyup"+h,function(e){27===e.keyCode&&t.close()}),I.on("resize"+h,function(){t.updateSize()}),t.st.closeOnContentClick||(a+=" mfp-auto-cursor"),a&&t.wrap.addClass(a);var u=t.wH=I.height(),m={};if(t.fixedContentPos&&t._hasScrollBar(u)){var g=t._getScrollbarSize();g&&(m.marginRight=g)}t.fixedContentPos&&(t.isIE7?e("body, html").css("overflow","hidden"):m.overflow="hidden");var C=t.st.mainClass;return t.isIE7&&(C+=" mfp-ie7"),C&&t._addClassToMFP(C),t.updateItemHTML(),T("BuildControls"),e("html").css(m),t.bgOverlay.add(t.wrap).prependTo(t.st.prependTo||i),t._lastFocusedEl=document.activeElement,setTimeout(function(){t.content?(t._addClassToMFP(v),t._setFocus()):t.bgOverlay.addClass(v),o.on("focusin"+h,t._onFocusIn)},16),t.isOpen=!0,t.updateSize(u),T(f),n},close:function(){t.isOpen&&(T(c),t.isOpen=!1,t.st.removalDelay&&!t.isLowIE&&t.supportsTransition?(t._addClassToMFP(C),setTimeout(function(){t._close()},t.st.removalDelay)):t._close())},_close:function(){T(l);var n=C+" "+v+" ";if(t.bgOverlay.detach(),t.wrap.detach(),t.container.empty(),t.st.mainClass&&(n+=t.st.mainClass+" "),t._removeClassFromMFP(n),t.fixedContentPos){var i={marginRight:""};t.isIE7?e("body, html").css("overflow",""):i.overflow="",e("html").css(i)}o.off("keyup"+h+" focusin"+h),t.ev.off(h),t.wrap.attr("class","mfp-wrap").removeAttr("style"),t.bgOverlay.attr("class","mfp-bg"),t.container.attr("class","mfp-container"),!t.st.showCloseBtn||t.st.closeBtnInside&&t.currTemplate[t.currItem.type]!==!0||t.currTemplate.closeBtn&&t.currTemplate.closeBtn.detach(),t._lastFocusedEl&&e(t._lastFocusedEl).focus(),t.currItem=null,t.content=null,t.currTemplate=null,t.prevHeight=0,T(d)},updateSize:function(e){if(t.isIOS){var n=document.documentElement.clientWidth/window.innerWidth,i=window.innerHeight*n;t.wrap.css("height",i),t.wH=i}else t.wH=e||I.height();t.fixedContentPos||t.wrap.css("height",t.wH),T("Resize")},updateItemHTML:function(){var n=t.items[t.index];t.contentContainer.detach(),t.content&&t.content.detach(),n.parsed||(n=t.parseEl(t.index));var i=n.type;if(T("BeforeChange",[t.currItem?t.currItem.type:"",i]),t.currItem=n,!t.currTemplate[i]){var o=t.st[i]?t.st[i].markup:!1;T("FirstMarkupParse",o),t.currTemplate[i]=o?e(o):!0}r&&r!==n.type&&t.container.removeClass("mfp-"+r+"-holder");var a=t["get"+i.charAt(0).toUpperCase()+i.slice(1)](n,t.currTemplate[i]);t.appendContent(a,i),n.preloaded=!0,T(m,n),r=n.type,t.container.prepend(t.contentContainer),T("AfterChange")},appendContent:function(e,n){t.content=e,e?t.st.showCloseBtn&&t.st.closeBtnInside&&t.currTemplate[n]===!0?t.content.find(".mfp-close").length||t.content.append(E()):t.content=e:t.content="",T(u),t.container.addClass("mfp-"+n+"-holder"),t.contentContainer.append(t.content)},parseEl:function(n){var i,o=t.items[n];if(o.tagName?o={el:e(o)}:(i=o.type,o={data:o,src:o.src}),o.el){for(var r=t.types,a=0;r.length>a;a++)if(o.el.hasClass("mfp-"+r[a])){i=r[a];break}o.src=o.el.attr("data-mfp-src"),o.src||(o.src=o.el.attr("href"))}return o.type=i||t.st.type||"inline",o.index=n,o.parsed=!0,t.items[n]=o,T("ElementParse",o),t.items[n]},addGroup:function(e,n){var i=function(i){i.mfpEl=this,t._openClick(i,e,n)};n||(n={});var o="click.magnificPopup";n.mainEl=e,n.items?(n.isObj=!0,e.off(o).on(o,i)):(n.isObj=!1,n.delegate?e.off(o).on(o,n.delegate,i):(n.items=e,e.off(o).on(o,i)))},_openClick:function(n,i,o){var r=void 0!==o.midClick?o.midClick:e.magnificPopup.defaults.midClick;if(r||2!==n.which&&!n.ctrlKey&&!n.metaKey){var a=void 0!==o.disableOn?o.disableOn:e.magnificPopup.defaults.disableOn;if(a)if(e.isFunction(a)){if(!a.call(t))return!0}else if(a>I.width())return!0;n.type&&(n.preventDefault(),t.isOpen&&n.stopPropagation()),o.el=e(n.mfpEl),o.delegate&&(o.items=i.find(o.delegate)),t.open(o)}},updateStatus:function(e,i){if(t.preloader){n!==e&&t.container.removeClass("mfp-s-"+n),i||"loading"!==e||(i=t.st.tLoading);var o={status:e,text:i};T("UpdateStatus",o),e=o.status,i=o.text,t.preloader.html(i),t.preloader.find("a").on("click",function(e){e.stopImmediatePropagation()}),t.container.addClass("mfp-s-"+e),n=e}},_checkIfClose:function(n){if(!e(n).hasClass(y)){var i=t.st.closeOnContentClick,o=t.st.closeOnBgClick;if(i&&o)return!0;if(!t.content||e(n).hasClass("mfp-close")||t.preloader&&n===t.preloader[0])return!0;if(n===t.content[0]||e.contains(t.content[0],n)){if(i)return!0}else if(o&&e.contains(document,n))return!0;return!1}},_addClassToMFP:function(e){t.bgOverlay.addClass(e),t.wrap.addClass(e)},_removeClassFromMFP:function(e){this.bgOverlay.removeClass(e),t.wrap.removeClass(e)},_hasScrollBar:function(e){return(t.isIE7?o.height():document.body.scrollHeight)>(e||I.height())},_setFocus:function(){(t.st.focus?t.content.find(t.st.focus).eq(0):t.wrap).focus()},_onFocusIn:function(n){return n.target===t.wrap[0]||e.contains(t.wrap[0],n.target)?void 0:(t._setFocus(),!1)},_parseMarkup:function(t,n,i){var o;i.data&&(n=e.extend(i.data,n)),T(p,[t,n,i]),e.each(n,function(e,n){if(void 0===n||n===!1)return!0;if(o=e.split("_"),o.length>1){var i=t.find(h+"-"+o[0]);if(i.length>0){var r=o[1];"replaceWith"===r?i[0]!==n[0]&&i.replaceWith(n):"img"===r?i.is("img")?i.attr("src",n):i.replaceWith('<img src="'+n+'" class="'+i.attr("class")+'" />'):i.attr(o[1],n)}}else t.find(h+"-"+e).html(n)})},_getScrollbarSize:function(){if(void 0===t.scrollbarSize){var e=document.createElement("div");e.id="mfp-sbm",e.style.cssText="width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;",document.body.appendChild(e),t.scrollbarSize=e.offsetWidth-e.clientWidth,document.body.removeChild(e)}return t.scrollbarSize}},e.magnificPopup={instance:null,proto:w.prototype,modules:[],open:function(t,n){return _(),t=t?e.extend(!0,{},t):{},t.isObj=!0,t.index=n||0,this.instance.open(t)},close:function(){return e.magnificPopup.instance&&e.magnificPopup.instance.close()},registerModule:function(t,n){n.options&&(e.magnificPopup.defaults[t]=n.options),e.extend(this.proto,n.proto),this.modules.push(t)},defaults:{disableOn:0,key:null,midClick:!1,mainClass:"",preloader:!0,focus:"",closeOnContentClick:!1,closeOnBgClick:!0,closeBtnInside:!0,showCloseBtn:!0,enableEscapeKey:!0,modal:!1,alignTop:!1,removalDelay:0,prependTo:null,fixedContentPos:"auto",fixedBgPos:"auto",overflowY:"auto",closeMarkup:'<button title="%title%" type="button" class="mfp-close">&times;</button>',tClose:"Close (Esc)",tLoading:"Loading..."}},e.fn.magnificPopup=function(n){_();var i=e(this);if("string"==typeof n)if("open"===n){var o,r=b?i.data("magnificPopup"):i[0].magnificPopup,a=parseInt(arguments[1],10)||0;r.items?o=r.items[a]:(o=i,r.delegate&&(o=o.find(r.delegate)),o=o.eq(a)),t._openClick({mfpEl:o},i,r)}else t.isOpen&&t[n].apply(t,Array.prototype.slice.call(arguments,1));else n=e.extend(!0,{},n),b?i.data("magnificPopup",n):i[0].magnificPopup=n,t.addGroup(i,n);return i};var P,O,z,M="inline",B=function(){z&&(O.after(z.addClass(P)).detach(),z=null)};e.magnificPopup.registerModule(M,{options:{hiddenClass:"hide",markup:"",tNotFound:"Content not found"},proto:{initInline:function(){t.types.push(M),x(l+"."+M,function(){B()})},getInline:function(n,i){if(B(),n.src){var o=t.st.inline,r=e(n.src);if(r.length){var a=r[0].parentNode;a&&a.tagName&&(O||(P=o.hiddenClass,O=k(P),P="mfp-"+P),z=r.after(O).detach().removeClass(P)),t.updateStatus("ready")}else t.updateStatus("error",o.tNotFound),r=e("<div>");return n.inlineElement=r,r}return t.updateStatus("ready"),t._parseMarkup(i,{},n),i}}});var F,H="ajax",L=function(){F&&i.removeClass(F)},A=function(){L(),t.req&&t.req.abort()};e.magnificPopup.registerModule(H,{options:{settings:null,cursor:"mfp-ajax-cur",tError:'<a href="%url%">The content</a> could not be loaded.'},proto:{initAjax:function(){t.types.push(H),F=t.st.ajax.cursor,x(l+"."+H,A),x("BeforeChange."+H,A)},getAjax:function(n){F&&i.addClass(F),t.updateStatus("loading");var o=e.extend({url:n.src,success:function(i,o,r){var a={data:i,xhr:r};T("ParseAjax",a),t.appendContent(e(a.data),H),n.finished=!0,L(),t._setFocus(),setTimeout(function(){t.wrap.addClass(v)},16),t.updateStatus("ready"),T("AjaxContentAdded")},error:function(){L(),n.finished=n.loadError=!0,t.updateStatus("error",t.st.ajax.tError.replace("%url%",n.src))}},t.st.ajax.settings);return t.req=e.ajax(o),""}}});var j,N=function(n){if(n.data&&void 0!==n.data.title)return n.data.title;var i=t.st.image.titleSrc;if(i){if(e.isFunction(i))return i.call(t,n);if(n.el)return n.el.attr(i)||""}return""};e.magnificPopup.registerModule("image",{options:{markup:'<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',cursor:"mfp-zoom-out-cur",titleSrc:"title",verticalFit:!0,tError:'<a href="%url%">The image</a> could not be loaded.'},proto:{initImage:function(){var e=t.st.image,n=".image";t.types.push("image"),x(f+n,function(){"image"===t.currItem.type&&e.cursor&&i.addClass(e.cursor)}),x(l+n,function(){e.cursor&&i.removeClass(e.cursor),I.off("resize"+h)}),x("Resize"+n,t.resizeImage),t.isLowIE&&x("AfterChange",t.resizeImage)},resizeImage:function(){var e=t.currItem;if(e&&e.img&&t.st.image.verticalFit){var n=0;t.isLowIE&&(n=parseInt(e.img.css("padding-top"),10)+parseInt(e.img.css("padding-bottom"),10)),e.img.css("max-height",t.wH-n)}},_onImageHasSize:function(e){e.img&&(e.hasSize=!0,j&&clearInterval(j),e.isCheckingImgSize=!1,T("ImageHasSize",e),e.imgHidden&&(t.content&&t.content.removeClass("mfp-loading"),e.imgHidden=!1))},findImageSize:function(e){var n=0,i=e.img[0],o=function(r){j&&clearInterval(j),j=setInterval(function(){return i.naturalWidth>0?(t._onImageHasSize(e),void 0):(n>200&&clearInterval(j),n++,3===n?o(10):40===n?o(50):100===n&&o(500),void 0)},r)};o(1)},getImage:function(n,i){var o=0,r=function(){n&&(n.img[0].complete?(n.img.off(".mfploader"),n===t.currItem&&(t._onImageHasSize(n),t.updateStatus("ready")),n.hasSize=!0,n.loaded=!0,T("ImageLoadComplete")):(o++,200>o?setTimeout(r,100):a()))},a=function(){n&&(n.img.off(".mfploader"),n===t.currItem&&(t._onImageHasSize(n),t.updateStatus("error",s.tError.replace("%url%",n.src))),n.hasSize=!0,n.loaded=!0,n.loadError=!0)},s=t.st.image,l=i.find(".mfp-img");if(l.length){var c=document.createElement("img");c.className="mfp-img",n.img=e(c).on("load.mfploader",r).on("error.mfploader",a),c.src=n.src,l.is("img")&&(n.img=n.img.clone()),c=n.img[0],c.naturalWidth>0?n.hasSize=!0:c.width||(n.hasSize=!1)}return t._parseMarkup(i,{title:N(n),img_replaceWith:n.img},n),t.resizeImage(),n.hasSize?(j&&clearInterval(j),n.loadError?(i.addClass("mfp-loading"),t.updateStatus("error",s.tError.replace("%url%",n.src))):(i.removeClass("mfp-loading"),t.updateStatus("ready")),i):(t.updateStatus("loading"),n.loading=!0,n.hasSize||(n.imgHidden=!0,i.addClass("mfp-loading"),t.findImageSize(n)),i)}}});var W,R=function(){return void 0===W&&(W=void 0!==document.createElement("p").style.MozTransform),W};e.magnificPopup.registerModule("zoom",{options:{enabled:!1,easing:"ease-in-out",duration:300,opener:function(e){return e.is("img")?e:e.find("img")}},proto:{initZoom:function(){var e,n=t.st.zoom,i=".zoom";if(n.enabled&&t.supportsTransition){var o,r,a=n.duration,s=function(e){var t=e.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),i="all "+n.duration/1e3+"s "+n.easing,o={position:"fixed",zIndex:9999,left:0,top:0,"-webkit-backface-visibility":"hidden"},r="transition";return o["-webkit-"+r]=o["-moz-"+r]=o["-o-"+r]=o[r]=i,t.css(o),t},d=function(){t.content.css("visibility","visible")};x("BuildControls"+i,function(){if(t._allowZoom()){if(clearTimeout(o),t.content.css("visibility","hidden"),e=t._getItemToZoom(),!e)return d(),void 0;r=s(e),r.css(t._getOffset()),t.wrap.append(r),o=setTimeout(function(){r.css(t._getOffset(!0)),o=setTimeout(function(){d(),setTimeout(function(){r.remove(),e=r=null,T("ZoomAnimationEnded")},16)},a)},16)}}),x(c+i,function(){if(t._allowZoom()){if(clearTimeout(o),t.st.removalDelay=a,!e){if(e=t._getItemToZoom(),!e)return;r=s(e)}r.css(t._getOffset(!0)),t.wrap.append(r),t.content.css("visibility","hidden"),setTimeout(function(){r.css(t._getOffset())},16)}}),x(l+i,function(){t._allowZoom()&&(d(),r&&r.remove(),e=null)})}},_allowZoom:function(){return"image"===t.currItem.type},_getItemToZoom:function(){return t.currItem.hasSize?t.currItem.img:!1},_getOffset:function(n){var i;i=n?t.currItem.img:t.st.zoom.opener(t.currItem.el||t.currItem);var o=i.offset(),r=parseInt(i.css("padding-top"),10),a=parseInt(i.css("padding-bottom"),10);o.top-=e(window).scrollTop()-r;var s={width:i.width(),height:(b?i.innerHeight():i[0].offsetHeight)-a-r};return R()?s["-moz-transform"]=s.transform="translate("+o.left+"px,"+o.top+"px)":(s.left=o.left,s.top=o.top),s}}});var Z="iframe",q="//about:blank",D=function(e){if(t.currTemplate[Z]){var n=t.currTemplate[Z].find("iframe");n.length&&(e||(n[0].src=q),t.isIE8&&n.css("display",e?"block":"none"))}};e.magnificPopup.registerModule(Z,{options:{markup:'<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',srcAction:"iframe_src",patterns:{youtube:{index:"youtube.com",id:"v=",src:"//www.youtube.com/embed/%id%?autoplay=1"},vimeo:{index:"vimeo.com/",id:"/",src:"//player.vimeo.com/video/%id%?autoplay=1"},gmaps:{index:"//maps.google.",src:"%id%&output=embed"}}},proto:{initIframe:function(){t.types.push(Z),x("BeforeChange",function(e,t,n){t!==n&&(t===Z?D():n===Z&&D(!0))}),x(l+"."+Z,function(){D()})},getIframe:function(n,i){var o=n.src,r=t.st.iframe;e.each(r.patterns,function(){return o.indexOf(this.index)>-1?(this.id&&(o="string"==typeof this.id?o.substr(o.lastIndexOf(this.id)+this.id.length,o.length):this.id.call(this,o)),o=this.src.replace("%id%",o),!1):void 0});var a={};return r.srcAction&&(a[r.srcAction]=o),t._parseMarkup(i,a,n),t.updateStatus("ready"),i}}});var K=function(e){var n=t.items.length;return e>n-1?e-n:0>e?n+e:e},Y=function(e,t,n){return e.replace(/%curr%/gi,t+1).replace(/%total%/gi,n)};e.magnificPopup.registerModule("gallery",{options:{enabled:!1,arrowMarkup:'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',preload:[0,2],navigateByImgClick:!0,arrows:!0,tPrev:"Previous (Left arrow key)",tNext:"Next (Right arrow key)",tCounter:"%curr% of %total%"},proto:{initGallery:function(){var n=t.st.gallery,i=".mfp-gallery",r=Boolean(e.fn.mfpFastClick);return t.direction=!0,n&&n.enabled?(a+=" mfp-gallery",x(f+i,function(){n.navigateByImgClick&&t.wrap.on("click"+i,".mfp-img",function(){return t.items.length>1?(t.next(),!1):void 0}),o.on("keydown"+i,function(e){37===e.keyCode?t.prev():39===e.keyCode&&t.next()})}),x("UpdateStatus"+i,function(e,n){n.text&&(n.text=Y(n.text,t.currItem.index,t.items.length))}),x(p+i,function(e,i,o,r){var a=t.items.length;o.counter=a>1?Y(n.tCounter,r.index,a):""}),x("BuildControls"+i,function(){if(t.items.length>1&&n.arrows&&!t.arrowLeft){var i=n.arrowMarkup,o=t.arrowLeft=e(i.replace(/%title%/gi,n.tPrev).replace(/%dir%/gi,"left")).addClass(y),a=t.arrowRight=e(i.replace(/%title%/gi,n.tNext).replace(/%dir%/gi,"right")).addClass(y),s=r?"mfpFastClick":"click";o[s](function(){t.prev()}),a[s](function(){t.next()}),t.isIE7&&(k("b",o[0],!1,!0),k("a",o[0],!1,!0),k("b",a[0],!1,!0),k("a",a[0],!1,!0)),t.container.append(o.add(a))}}),x(m+i,function(){t._preloadTimeout&&clearTimeout(t._preloadTimeout),t._preloadTimeout=setTimeout(function(){t.preloadNearbyImages(),t._preloadTimeout=null},16)}),x(l+i,function(){o.off(i),t.wrap.off("click"+i),t.arrowLeft&&r&&t.arrowLeft.add(t.arrowRight).destroyMfpFastClick(),t.arrowRight=t.arrowLeft=null}),void 0):!1},next:function(){t.direction=!0,t.index=K(t.index+1),t.updateItemHTML()},prev:function(){t.direction=!1,t.index=K(t.index-1),t.updateItemHTML()},goTo:function(e){t.direction=e>=t.index,t.index=e,t.updateItemHTML()},preloadNearbyImages:function(){var e,n=t.st.gallery.preload,i=Math.min(n[0],t.items.length),o=Math.min(n[1],t.items.length);for(e=1;(t.direction?o:i)>=e;e++)t._preloadItem(t.index+e);for(e=1;(t.direction?i:o)>=e;e++)t._preloadItem(t.index-e)},_preloadItem:function(n){if(n=K(n),!t.items[n].preloaded){var i=t.items[n];i.parsed||(i=t.parseEl(n)),T("LazyLoad",i),"image"===i.type&&(i.img=e('<img class="mfp-img" />').on("load.mfploader",function(){i.hasSize=!0}).on("error.mfploader",function(){i.hasSize=!0,i.loadError=!0,T("LazyLoadError",i)}).attr("src",i.src)),i.preloaded=!0}}}});var U="retina";e.magnificPopup.registerModule(U,{options:{replaceSrc:function(e){return e.src.replace(/\.\w+$/,function(e){return"@2x"+e})},ratio:1},proto:{initRetina:function(){if(window.devicePixelRatio>1){var e=t.st.retina,n=e.ratio;n=isNaN(n)?n():n,n>1&&(x("ImageHasSize."+U,function(e,t){t.img.css({"max-width":t.img[0].naturalWidth/n,width:"100%"})}),x("ElementParse."+U,function(t,i){i.src=e.replaceSrc(i,n)}))}}}}),function(){var t=1e3,n="ontouchstart"in window,i=function(){I.off("touchmove"+r+" touchend"+r)},o="mfpFastClick",r="."+o;e.fn.mfpFastClick=function(o){return e(this).each(function(){var a,s=e(this);if(n){var l,c,d,u,p,f;s.on("touchstart"+r,function(e){u=!1,f=1,p=e.originalEvent?e.originalEvent.touches[0]:e.touches[0],c=p.clientX,d=p.clientY,I.on("touchmove"+r,function(e){p=e.originalEvent?e.originalEvent.touches:e.touches,f=p.length,p=p[0],(Math.abs(p.clientX-c)>10||Math.abs(p.clientY-d)>10)&&(u=!0,i())}).on("touchend"+r,function(e){i(),u||f>1||(a=!0,e.preventDefault(),clearTimeout(l),l=setTimeout(function(){a=!1},t),o())})})}s.on("click"+r,function(){a||o()})})},e.fn.destroyMfpFastClick=function(){e(this).off("touchstart"+r+" click"+r),n&&I.off("touchmove"+r+" touchend"+r)}}(),_()})(window.jQuery||window.Zepto);
