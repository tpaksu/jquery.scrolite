/**
* jQuery Scrolite Plugin v0.1 alpha
* 
* @author Taha PAKSU (http://www.tahapaksu.com/)
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to  
* permit persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
* Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
* WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
* COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function($){

		var classnames = {
			wrapper :   ".scrolite",
			scrollbed : ".scrolite-bed",
			scrollbar : ".scrolite-bar",
			container : ".scrolite-container"
		}

		var scroliteInstance = function(element, settings){
			var $obj = $(element);
			var obj = this;
			var vars = {};
			var defaults = {
				barColor:"rgba(128,128,128,0.7)",
				bedColor:"rgba(128,128,128,0.5)",
				bedWidth:10,
				bedCornerRadius:5,
				barWidth:6,
				barCornerRadius:3,
				width:"auto",
				height:"auto",
				scrollSensitivity:4
			};

			var config = jQuery.extend(defaults,(settings)?settings:{});
			var init = function(){
				$obj.wrap("<div class='"+classnames.wrapper.replace(".","")+"' style='padding:0px;margin:0px;position:relative;display:inline-block;width:"+config.width+"px;height:"+config.height+"px;overflow:hidden;'></div>");
				vars.scrolite = $obj.closest(classnames.wrapper);
				$obj.wrap("<div class='"+classnames.container.replace(".","")+"' style='padding:0px;margin:0px;position:relative;display:inline-block;width:"+(config.width-config.bedWidth-5)+"px;height:"+config.height+"px;overflow:hidden;'></div>");
				vars.scrolitecontainer = $(classnames.container,vars.scrolite);
				vars.scrolite.append("<div class='"+classnames.scrollbed.replace(".","")+"' style='\
					position:absolute;\
					padding:"+ ((config.bedWidth - config.barWidth) / 2) +"px;\
					right:0px;\
					top:0px;\
					margin:0px;\
					background:"+config.bedColor+";\
					width:"+ config.barWidth +"px;\
					border-radius:"+config.bedCornerRadius+"px;\
					'><div class='"+classnames.scrollbar.replace(".","")+"' style='\
					margin-top:0px;background-color:"+config.barColor+";\
					width:"+config.barWidth+"px;\
					border-radius:"+ config.barCornerRadius + "px;\
					'></div></div>");
				vars.scrolitebed = $(classnames.scrollbed,vars.scrolite);
				vars.scrolitebar = $(classnames.scrollbar,vars.scrolite);
				vars.scrolitebar.data("attached",$obj);
				vars.scrolitebed.height(vars.scrolite.height()
					- (parseInt(vars.scrolitebed.css("padding-top")) + parseInt(vars.scrolitebed.css("padding-top"))));
				vars.scrolitebar.height(vars.scrolitebed.innerHeight() - (parseInt(vars.scrolitebed.css("padding-top")) + parseInt(vars.scrolitebed.css("padding-top"))));
				vars.scrolitebed.on("contextmenu",function(){return false;});
				vars.scrolitebed.get(0).onselectstart = function(){return false;};
			};
			obj.refresh = function(){
				var divHeight = vars.scrolitecontainer.innerHeight();
				var scrollheight = (obj.scrollHeight)?obj.scrollHeight:$obj.height();
				var barMax = vars.scrolitebed.innerHeight() - (parseInt(vars.scrolitebed.css("padding-top")) + parseInt(vars.scrolitebed.css("padding-top")));
				vars.scrolitebar.data("maxY",barMax);
				var barCurrent = barMax * divHeight / scrollheight;
				vars.scrolitebar.height(barCurrent);
			}
			var setEvents = function(){
				$obj.unbind("mousewheel").bind("mousewheel",function(event, delta, deltaX, deltaY){
						var delta = parseInt(deltaY * config.scrollSensitivity);
						var scrollElement = $(this).parents(classnames.wrapper).find(classnames.scrollbar);
						if(scrollElement){

							if((parseInt(scrollElement.css("margin-top")) - delta )>=0){
								if((parseInt(scrollElement.css("margin-top")) - delta ) <= scrollElement.data("maxY")-scrollElement.outerHeight())
									{
									scrollElement.css("margin-top", (parseInt(scrollElement.css("margin-top")) - delta) + "px");
									scrollContent(scrollElement.data("attached").closest(classnames.container).get(0),parseInt(scrollElement.css("margin-top")),scrollElement.data("maxY")-scrollElement.outerHeight());
									preventDefault(event);
								}else{
									scrollElement.css("margin-top", (scrollElement.data("maxY")-scrollElement.outerHeight()) + "px");
									scrollContent(scrollElement.data("attached").closest(classnames.container).get(0),scrollElement.data("maxY")-scrollElement.outerHeight(),scrollElement.data("maxY")-scrollElement.outerHeight());
								}
							}else{
								scrollElement.css("margin-top", "0px");
								scrollContent(scrollElement.data("attached").closest(classnames.container).get(0),0,scrollElement.data("maxY")-scrollElement.outerHeight());
							}

						}
				});
				vars.scrolitebar.unbind("mousedown").bind("mousedown",function(e){
						$(document).data("scrollElement",$(this));
						$(this).data("scrolling",true);
						$(this).data("scrollY",e.pageY - parseInt($(this).css("margin-top")));
						disableSelection($(this).data("attached"));
				});
				$(document).unbind("mouseup").bind("mouseup",function(e){
						var scrollElement = $(document).data("scrollElement");
						if(scrollElement){
							scrollElement.trigger("mouseup");
						}
				});
				vars.scrolitebar.unbind("mouseup").bind("mouseup",function(){
						$(this).data("scrolling",false);
						$(this).data("scrollY",null);
						$(document).data("scrollElement",null);
						enableSelection($(this).data("attached"));
				});
				$(document).unbind("mousemove").bind("mousemove",function(e){
						var scrollElement = $(document).data("scrollElement");
						if(scrollElement){
							if(scrollElement.data("scrolling")==true){
								if(((scrollElement.data("scrollY") - e.pageY)<=0) &&
									((-(scrollElement.data("scrollY") - e.pageY) + scrollElement.outerHeight()) <= scrollElement.data("maxY")))
									{
									scrollElement.css("margin-top", -(scrollElement.data("scrollY")-e.pageY) + "px");
									scrollContent(scrollElement.data("attached").closest(classnames.container).get(0),parseInt(scrollElement.css("margin-top")),scrollElement.data("maxY")-scrollElement.outerHeight());
								}
							}
						}
				});
			}

			init();

			obj.refresh();
			$obj.load(function(){
					$(this).data("scrolite").refresh();
			});				

			setEvents();

		}
		$.fn.scrolite = function(options) 
		{
			return this.each(function () 
				{
					var element = $(this);
					if (element.data('scrolite')) return element.data('scrolite');
					var scrolite = new scroliteInstance(this, options);
					element.data('scrolite', scrolite);
					return element.data('scrolite');
				}
			);
		}
		function disableSelection(target){
			target.attr("unselectable","on").addClass("unselectable");
		}
		function enableSelection(target){
			target.attr("unselectable",null).removeClass("unselectable");
		}
		function scrollContent(target,current,max){
			var scrH = target.scrollHeight - $(target).height();
			var scrT = parseInt(scrH * current / max);
			target.scrollTop = scrT;			
		}

		function preventDefault(e) {
			e = e || window.event;
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;  
		}

})(jQuery);