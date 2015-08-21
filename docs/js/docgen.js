// Generated by CoffeeScript 1.9.2
(function() {
  var Docs;

  Docs = (function() {
    function Docs(template_id) {
      this.flatTree = [];
      this.json = {};
      this.elems = {};
      this.sortedElems = [];
      this.tree = {};
      this.resizeTimeout = -1;
      this.scrollTimeout = -1;
      this.uiTimerID = -1;
      this.coverDemoTimeout = -1;
      this.coverDemoLoaded = false;
      this.isDocReady = false;
      this.activeDemo = {
        elem: null,
        script: null,
        path: "demo/"
      };
      this.dom = {
        frame: document.querySelector("body"),
        cover: document.querySelector("#cover"),
        head: document.querySelector("#head"),
        overview: document.querySelector("#overview"),
        page: document.querySelector("#page"),
        menu: document.querySelector("#menu"),
        submenu: document.querySelector("#submenu"),
        content: document.querySelector("#content"),
        demo: document.querySelector("#pt"),
        mobileMenu: document.querySelector("#mobile"),
        template: _.template(document.querySelector(template_id).innerHTML)
      };
      this.layout = {
        sticky: [
          {
            name: "step1",
            y: 1500,
            passed: false
          }
        ]
      };
      this.inited = false;
      window.addEventListener("scroll", this.onScroll.bind(this), false);
      window.addEventListener("touchmove", this.onScroll.bind(this), false);
      window.addEventListener("resize", (function(evt) {
        clearTimeout(this.resizeTimeout);
        return setTimeout(((function(_this) {
          return function() {
            return _this.resize(evt);
          };
        })(this)), 200);
      }).bind(this));
    }

    Docs.prototype.ready = function() {
      this.isDocReady = true;
      this.getMembers("Space");
      this.dom.mobileMenu.addEventListener("click", ((function(_this) {
        return function() {
          return _this.dom.menu.classList.toggle("show");
        };
      })(this)));
    };

    Docs.prototype.getJSON = function(url) {
      var request;
      request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onload = (function(_this) {
        return function() {
          if (request.status >= 200 && request.status < 400) {
            _this.json = JSON.parse(request.responseText);
            _this.getList();
            _this.tree = _this.getTree();
            _this.buildMenu(_this.tree, _this.dom.menu);
            _this.buildContent();
            _this.scrollToHashID(window.location.hash);
            return _this.ready();
          } else {
            return showError("Cannot get contents");
          }
        };
      })(this);
      request.onerror = function() {
        return showError("Error loading contents");
      };
      return request.send();
    };

    Docs.prototype.getList = function() {
      return _.each(this.json, (function(_this) {
        return function(v, k) {
          var ext;
          ext = v.extend.length > 0 ? [v.extend] : [];
          return _this.elems[v.cls] = {
            name: v.cls,
            extend: ext
          };
        };
      })(this));
    };

    Docs.prototype.buildContent = function() {
      var j, k, l, len, len1, n, pa, parents, ref, ref1, results, sec, v;
      ref = this.flatTree;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        k = ref[j];
        v = this.json[k];
        sec = document.createElement("section");
        sec.classList.add("element");
        sec.setAttribute("id", "elem" + k);
        this.dom.content.appendChild(sec);
        parents = [];
        ref1 = this.elems[v.cls].extend;
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          n = ref1[l];
          if (this.elems[n]) {
            pa = {
              cls: n,
              funcs: this.elems[n].funcs,
              props: this.elems[n].props
            };
            parents.push(pa);
          }
        }
        v.parents = parents;
        results.push(sec.innerHTML = this.dom.template(v));
      }
      return results;
    };

    Docs.prototype.buildMenu = function(tree, node, depth) {
      var sec;
      if (depth == null) {
        depth = 0;
      }
      if (Object.keys(tree).length > 0) {
        sec = document.createElement("ul");
        sec.classList.add("depth-" + depth);
        node.appendChild(sec);
        return _.each(tree, (function(_this) {
          return function(v, k) {
            var li;
            li = document.createElement("li");
            li.setAttribute("data-name", k);
            _this.bindSubMenu(li);
            li.innerHTML = "<a href='#elem" + k + "'>" + k + "</a>";
            sec.appendChild(li);
            _this.flatTree.push(k);
            _this.elems[k].funcs = _.pluck(_this.json[k].funcs, 'name');
            _this.elems[k].props = _.pluck(_this.json[k].props, 'name');
            _this.elems[k].statics = _.pluck(_this.json[k].statics, 'name');
            _this.elems[k].inherited = depth > 0;
            return _this.buildMenu(v, li, depth + 1);
          };
        })(this));
      }
    };

    Docs.prototype.bindSubMenu = function(elem) {
      return elem.addEventListener("click", (function(_this) {
        return function(evt) {
          var k;
          k = evt.currentTarget.getAttribute("data-name");
          if (k) {
            _this.getMembers(k);
          }
          return evt.stopPropagation();
        };
      })(this));
    };

    Docs.prototype.getMembers = function(k) {
      var _createSub;
      if (this.elems[k]) {
        this.dom.submenu.innerHTML = "";
        _createSub = (function(_this) {
          return function(list, name, key) {
            var item, j, len, li, sub, subtitle;
            if (!list || list.length <= 0) {
              return false;
            }
            sub = document.createElement("div");
            sub.classList.add("subsection");
            subtitle = document.createElement("h4");
            subtitle.innerText = name;
            sub.appendChild(subtitle);
            _this.dom.submenu.appendChild(sub);
            if (list === "inherited") {
              item = document.createElement("a");
              item.setAttribute("href", "#" + key + "-" + k);
              item.innerText = name;
              return sub.appendChild(item);
            } else {
              for (j = 0, len = list.length; j < len; j++) {
                li = list[j];
                item = document.createElement("a");
                item.setAttribute("href", "#" + key + "-" + k + "-" + li);
                item.innerText = li;
                item.classList.add("subitem");
                sub.appendChild(item);
              }
              return sub;
            }
          };
        })(this);
        _createSub(this.elems[k].funcs, "Functions", "func");
        _createSub(this.elems[k].props, "Properties", "prop");
        _createSub(this.elems[k].statics, "Statics", "static");
        if (this.elems[k].inherited) {
          return _createSub("inherited", "Inherited", "inherited");
        }
      }
    };

    Docs.prototype.getTree = function() {
      var c, elemTree, findPath, getParent, j, len, parent, sortedLevels;
      elemTree = {};
      findPath = (function(_this) {
        return function(parents) {
          var el;
          if (!parents || parents.length === 0) {
            return parents;
          }
          el = _this.elems[parents[0]];
          if (el && el.extend.length > 0) {
            return findPath(el.extend.concat(parents));
          } else {
            return parents;
          }
        };
      })(this);
      getParent = function(parents, target, depth) {
        var j, len, v;
        for (j = 0, len = parents.length; j < len; j++) {
          v = parents[j];
          if (target[v]) {
            return getParent(parents, target[v], depth + 1);
          }
          if (depth > 20) {
            return target;
          }
        }
        return target;
      };
      sortedLevels = [];
      _.each(this.elems, function(v, k) {
        v.extend = findPath(v.extend);
        return sortedLevels.push(v);
      });
      sortedLevels.sort(function(a, b) {
        var ai, bi, i;
        i = a.name > b.name ? 0.1 : -0.1;
        ai = a.extend.length;
        bi = b.extend.length;
        if (a.name === "Space") {
          ai = -100;
        }
        if (a.name === "Form") {
          ai = -99;
        }
        if (a.name === "Point") {
          ai = -98;
        }
        if (b.name === "Space") {
          bi = -100;
        }
        if (b.name === "Form") {
          bi = -99;
        }
        if (b.name === "Point") {
          bi = -98;
        }
        return (ai - bi) + i;
      });
      this.sortedElems = sortedLevels;
      for (j = 0, len = sortedLevels.length; j < len; j++) {
        c = sortedLevels[j];
        if (c.extend.length === 0) {
          elemTree[c.name] = {};
        } else {
          parent = getParent(c.extend, elemTree, 0, this.flatTree);
          parent[c.name] = {};
        }
      }
      return elemTree;
    };

    Docs.prototype.showError = function(err) {
      return console.error(err);
    };

    Docs.prototype.scrollTo = function(evt, elem) {
      var toElem, ypos;
      if (evt && elem) {
        toElem = elem.getAttribute("data-to");
        if (toElem) {
          ypos = document.querySelector(toElem).offsetTop;
          clearInterval(this.uiTimerID);
          this.uiTimerID = setInterval(((function(_this) {
            return function() {
              var d;
              d = ypos - window.scrollY;
              if (Math.abs(d) <= 1) {
                clearInterval(_this.uiTimerID);
                return;
              }
              return window.scrollBy(0, Math.ceil(d / 3));
            };
          })(this)), 40);
          evt.preventDefault();
          return evt.stopPropagation();
        }
      }
    };

    Docs.prototype.resize = function(evt) {
      this.dom.head.style.height = window.innerHeight + "px";
      this.layout.sticky[0].y = window.innerHeight;
      return this.syncScroll();
    };

    Docs.prototype.isInView = function(elem) {
      var rect;
      rect = elem.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    };


    /*
    loadDemo: () ->
      demos = document.querySelectorAll(".demo")
      for d in demos
        if @isInView(d)
          console.log("in view", d)
          @activeDemo.elem = d
          @activeDemo.script = document.createElement('script')
          @activeDemo.script.type = "text/javascript"
          @activeDemo.script.src = @activeDemo.path + d.getAttribute("data-demo") + ".js"
          @activeDemo.script.onload = (evt) =>
            @dom.demo.classList.add("active")
            console.log("loaded")
    
          document.querySelector("body").appendChild( @activeDemo.script )
    
          return
    
    
    unloadDemo: () ->
      if @activeDemo.elem and !@isInView( @activeDemo.elem )
        @dom.demo.classList.remove("active")
        document.querySelector("body").removeChild( @activeDemo.script )
        @dom.demo.removeChild( @dom.demo.querySelector("canvas") )
        @activeDemo.elem = null
     */

    Docs.prototype.scrollToHashID = function(id) {
      var elem;
      if (id) {
        elem = document.querySelector("" + id);
        if (elem) {
          window.scrollTo(0, elem.offsetTop + window.innerHeight);
          clearTimeout(this.coverDemoTimeout);
          return;
        }
      }
      if (window.scrollY < window.innerHeight / 2) {
        clearTimeout(this.coverDemoTimeout);
        if (window.coverDemo) {
          return this.coverDemoTimeout = setTimeout(((function(_this) {
            return function() {
              window.coverDemo();
              return _this.coverDemoLoaded = true;
            };
          })(this)), 1000);
        }
      }
    };

    Docs.prototype.onScroll = function(evt) {
      var _stick, j, l, len, len1, ref, ref1, st;
      _stick = (function(_this) {
        return function(t) {
          if (t.passed) {
            _this.dom.frame.classList.add("sticky-" + t.name);
          } else {
            _this.dom.frame.classList.remove("sticky-" + t.name);
          }
          if (!_this.inited && t.passed) {
            return _this.inited = true;
          }
        };
      })(this);
      ref = this.layout.sticky;
      for (j = 0, len = ref.length; j < len; j += 1) {
        st = ref[j];
        if (window.scrollY > st.y && !st.passed) {
          st.passed = true;
          _stick(st);
        } else if (window.scrollY < st.y && st.passed) {
          st.passed = false;
          _stick(st);
        }
      }
      if (window.scrollY <= 0) {
        ref1 = this.layout.sticky;
        for (l = 0, len1 = ref1.length; l < len1; l += 1) {
          st = ref1[l];
          this.dom.frame.classList.remove("sticky-" + st.name);
        }
      }
      return this.syncScroll();

      /*
       * load or unload demo
      @unloadDemo()
      clearTimeout( @scrollTimeout )
      @scrollTimeout = setTimeout( (
        () => @loadDemo()
      ), 500 )
       */
    };

    Docs.prototype.syncScroll = function() {
      if (this.isDocReady && window.coverDemo && !this.coverDemoLoaded && window.scrollY < window.innerHeight / 2) {
        clearTimeout(this.coverDemoTimeout);
        window.coverDemo();
        this.coverDemoLoaded = true;
      } else {
        if (this.coverDemoLoaded) {
          if (window.scrollY < window.innerHeight / 2) {
            window.restartCoverDemo();
          } else {
            window.stopCoverDemo();
          }
        }
      }
    };

    return Docs;

  })();

  window.Docs = Docs;

}).call(this);
