/* ***********************************************************************************************

    Unify Project

    Homepage: unify-project.org
    License: MIT + Apache (V2)
    Copyright: 2011, Sebastian Fastner, Mainz, Germany, http://unify-training.com

*********************************************************************************************** */

/**
 * EXPERIMENTAL
 */
qx.Class.define("unify.view.TabViewManager", {
  extend : qx.core.Object,
  include : [unify.view.MNavigatable],
  implement : [unify.view.IViewManager],
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param viewManager {unify.view.ViewManager} ViewManager to attach to
   */
  construct : function(viewManager)
  {
    this.base(arguments);
    
    if (qx.core.Environment.get("qx.debug"))
    {
      if (viewManager == null) {
        throw new Error("TabViewManager needs a ViewManager at construction time!");
      }
    }
    
    // Maps root views to full path objects
    this.__paths = {};
    
    // Maps of views controlled by this manager
    this.__viewmap = {};
    
    // Remember view manager and react on changes of its path
    this.__viewManager = viewManager;
    viewManager.addListener("changePath", this.__onViewManagerChangePath, this);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  properties : 
  {
    /** ID of selected view */
    selected : 
    {
      check : "String",
      event : "changeSelected",
      nullable : true,
      apply : "_applySelected"      
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __paths : null,
  
    /** {unify.view.ViewManager} Instance of attached view manager */
    __viewManager : null,
    
    /** {Element} Container of "bar" and "pane" */
    __element : null,
    
    /** {Element} Root element which is used for the button bar */
    __bar : null,
    
    /** {Element} Root element of the attached view manager */
    __pane : null,
    
    __viewmap : null,
    
    /**
     * Creates the widget element that is the base layer of the viewmanager.
     *
     * @return {unify.ui.core.Widget} Base widget of the viewmanager
     */
    _createWidgetElement : function() {
      var elem = new unify.ui.container.Composite(new qx.ui.layout.VBox());
      
      elem.add(this.__viewManager.getWidgetElement(), {
        flex: 1
      });
      
      var bar = this.__getBar();
      bar.setHeight(49);
      elem.add(bar);
      
      this._makeNavigatable(bar);
      
      return elem;
    },
    
    /**
     * Returns the already created of new created base widget of the viewmanager.
     *
     * @return {unify.ui.core.Widget} Base widget of the viewmanager
     */
    _getWidgetElement : function() {
      if (this.__widgetElement) {
        return this.__widgetElement;
      }
      
      var e = this.__widgetElement = this._createWidgetElement();
      
      return e;
    },
    
    /**
     * Returns the already created of new created base widget of the viewmanager.
     *
     * @return {unify.ui.core.Widget} Base widget of the viewmanager
     */
    getWidgetElement : function() {
      return this._getWidgetElement();
    },
    
    /**
     * Returns the tab view element
     * 
     * @return {Element} Root DOM element of tab view
     */
    getElement : function()
    {
      return this.getWidgetElement().getElement();
    },
    
    /**
     * Returns the currently selected view instance
     *
     * @return {unify.view.StaticView} View instance which is currently selected
     */
    getCurrentView : function() {
      return this.__viewManager.getCurrentView(); 
    },
    
    /**
     * Returns the local path of the view manager
     *
     * @return {Map[]} List of dictonaries (with keys view, segment and param)
     */
    getPath : function() {
      return this.__viewManager.getPath();
    },
    
    /**
     * Returns the view instance stored behind the given ID.
     *
     * @param id {String} Identifier of the view.
     * @return {unify.view.StaticView} Instance derived from the StaticView class.
     */
    getView : function(id) {
      return this.__viewManager.getView(id);
    },
    
    /**
     * Navigates to the given path
     *
     * @param path {unify.view.Path} Path to navigate to
     */
    navigate : function(path) {
      this.__viewManager.navigate(path);
    },
        
    
    /**
     * Adds a view to the tab bar. The buttons are displayed in the order of
     * execution of this function.
     *
     * @param viewClass {Class} Class of the view to register {@see unify.view.StaticView}
     */
    add : function(viewClass)
    {
      var viewInstance = viewClass.getInstance();

      /*var elem = document.createElement("div");
      elem.className = "tab-bar-element";
      elem.setAttribute("view", viewInstance.getId());
      elem.innerHTML = "<div class='tab-bar-element-image'></div>" + viewInstance.getTitle("tab-bar");*/

      var elem = new unify.ui.basic.NavigationButton(viewInstance.getTitle("tab-bar"));
      elem.set({
        appearance: "tabbar.button",
        goTo: viewInstance.getId(),
        relation: "same",
        height: 44
      });
      
      this.__viewmap[viewInstance.getId()] = elem;
      this.__getBar().add(elem);
    },

    /**
     * lazy intialization for __bar
     */
    __getBar : function(){
      var bar=this.__bar;
      if(!bar){
        // TODO: Check in master the next line!
        var layout = new qx.ui.layout.HBox();
        layout.set({
          alignX: "center",
          alignY: "middle"
        });
        this.__bar = bar = new unify.ui.container.Composite(layout);
        bar.setAppearance("tabbar");
      }
      return bar;
    },
    
    /**
     * Reacts on path changes of the view manager and updates "selected" property accordingly.
     *
     * @param e {qx.event.type.Data} Data event
     */
    __onViewManagerChangePath : function(e)
    {
      var path = e.getData();
      if (path)
      {
        var first = path[0];
        if (first) {
          return this.setSelected(first.view);
        }
      }
      
      this.resetSelected();
    },
    
    
    // property apply
    _applySelected : function(value, old)
    {
      var viewmap = this.__viewmap;
      
      var n = value && viewmap[value];
      if (n) {
        n.addState("active");
      }
      
      var o = old && viewmap[old];
      if (o) {
        o.removeState("active");
      }
    },
    
    /**
     * Event handler for onTap event
     *
     * @param e {qx.event.type.Touch} Event
     */
    _onTap : function(e) {
      var widget = this._getTapFollowElement(e);
      this.__onTap(widget);
    },
    
    /**
     * Placeholder event handler, empty
     */
    _onTouchHold : function() {},
    
    /**
     * Placeholder event handler, empty
     */
    _onTouchRelease : function() {},
    
    /**
     * Reacts on tabbing on the tabbar buttons.
     * 
     * @param widget {unify.ui.core.Widget} Touch event
     */
    __onTap : function(widget) 
    {
      if (widget)
      {
        var viewManager = this.__viewManager;
        var oldPath = viewManager.getPath();
        var oldRootView = oldPath[0].view;
        
        var newRootView = widget.getGoTo();
        
        // If root view has not changed we force jump to root of the view and not
        // using the stored deep path. This results into the intented behavior to
        // jump to top on the second click on the same button.
        
        var newPath;
        
        if (oldRootView != newRootView) {
          newPath = this.__paths[newRootView];
        }
        
        if (!newPath) {
          newPath = unify.view.Path.fromString(newRootView);
        }
        
        this.__viewManager.navigate(newPath);
        
        // Store path for old view
        this.__paths[oldRootView] = oldPath;
      }
    }
  }
});