/*
===============================================================================================

		Unify Project

		Homepage: unify-project.org
		License: MIT + Apache (V2)
		Copyright: 2010, Sebastian Fastner, Mainz, Germany, http://unify-training.com

===============================================================================================
*/

/**
 * EXPERIMENTAL
 */
core.Class("unify.ui.container.ToolBar", {
	include: [unify.ui.container.Bar],
	
	construct : function() {
		unify.ui.container.Bar.call(this);
		this._setLayout(new unify.ui.layout.special.NavigationBar());
	},
	
	properties : {
		// overridden
		appearance : {
			init: "toolbar"
		},
		
		height: {
			init: 44
		}
	},
	
	members : {
		/*
		---------------------------------------------------------------------------
			PRIVATE METHODS
		---------------------------------------------------------------------------
		*/
		
		__segmented : null,
		__segmentToWidget : null,
		
		_createItemElement : function(config)
		{
			var itemElem;
			
			if (config.kind == "button") {
				itemElem = new unify.ui.basic.NavigationButton();
	
				var navigation = {};
				
				// rel is independently usable
				if (config.rel) {
					itemElem.setRelation(config.rel);
				}
				
				// there can be only one of [jump, exec, show]
				if (config.jump) {
					itemElem.setGoTo(config.jump);
				} else if (config.exec) {
					itemElem.setExecute(config.exec);
				} else if (config.show) {
					itemElem.setShow(config.show);
				}
	
				if (config.label) {
					itemElem.setValue(config.label);
				}
	
			} else if (config.kind == "segmented") {
				itemElem = this.__segmented = new unify.ui.container.Composite(new unify.ui.layout.HBox());
				itemElem.set({
					appearance: "toolbar.segmented.container"
				});
				
				this.__segmentToWidget = {};
				
				config.view.addListener("changeSegment", this.__changeSegment, this);
				var segment = config.view.getSegment();
				
				var buttons = config.buttons;
				for (var i=0,ii=buttons.length; i<ii; i++) {
					var button = buttons[i];
					
					var el = new unify.ui.basic.NavigationButton(button.label);
					el.set({
						appearance: "toolbar.segmented.button"
					});
					if (i==0) {
						el.addState("first");
					} else if (i == buttons.length-1) {
						el.addState("last");
					}
					el.setGoTo("."+button.segment);
					
					if (!segment || segment == button.segment) {
						el.addState("active");
					}
					
					this.__segmentToWidget[button.segment] = el.getHash();
					itemElem.add(el);
				}
			}
			
			itemElem.setLayoutProperties({
				position: config.position
			});
			
			return itemElem;
		},
		
		/**
		 * Change segment handler
		 *
		 * @param e {lowland.events.Data} Event
		 */
		__changeSegment : function(e) {
			var s2w = this.__segmentToWidget;
			var segment = e.getData();
			
			for (var key in s2w) {
				var v = s2w[key];
				var w = v && lowland.ObjectManager.find(v);
				
				if (w) {
					if (key == segment) {
						w.addState("active");
					} else {
						w.removeState("active");
					}
				}
			}
		}
	}
});
