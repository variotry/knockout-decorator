import * as A from "knockout";
/*!
 * Knockout decorator
 * (c) vario
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
var x;
((f) => {
  function E(e) {
    let t;
    if (typeof e == "function")
      t = {
        pureComputed: !0
      };
    else {
      t = e;
      let s = {
        pureComputed: !0
      };
      if (!t)
        t = s;
      else
        for (let n in s)
          t[n] === void 0 && (t[n] = s[n]);
    }
    function r(s) {
      var n, i;
      let l = h.Get(s);
      const a = (i = class extends s {
        constructor(...g) {
          super(...g), this[n] = `kd${s.name}`;
          let o = this, m = Object.keys(o), c = m.length;
          for (let b = 0; b < c; ++b) {
            let u = m[b];
            if (u === p.Key || l.isIgnoreProperty(u) || I(o, u) || K(o, u))
              continue;
            let y = o[u];
            delete o[u], Array.isArray(y) ? F(a.prototype, u) : j(a.prototype, u), o[u] = y;
          }
          let S = Object.keys(s.prototype), P = [];
          c = S.length;
          for (let b = 0; b < c; ++b) {
            let u = S[b], y = Object.getOwnPropertyDescriptor(s.prototype, u);
            if (!y || !y.get || l.isIgnoreProperty(u) || (o[u], _(o, u)))
              continue;
            v({
              pure: t.pureComputed
            })(a.prototype, u, y), Object.defineProperty(a.prototype, u, y), P.push(u);
          }
          c = P.length;
          for (let b = 0; b < c; ++b)
            o[P[b]];
          t.init && typeof o[t.init] == "function" && o[t.init]();
        }
      }, n = Symbol.toStringTag, i);
      return Object.defineProperty(a, "name", {
        get: () => `kd${s.name}`
      }), a;
    }
    return typeof e == "function" ? r(e) : function(s) {
      return r(s);
    };
  }
  f.track = E;
  function w(e, t) {
    h.Get(e).pushIgnoreProperty(t);
  }
  f.ignore = w;
  function j(e, t) {
    Object.defineProperty(e, t, {
      get: function() {
        return p.Get(this).makeObservable(t), this[t];
      },
      set: function(r) {
        p.Get(this).makeObservable(t), this[t] = r;
      }
    });
  }
  f.observable = j;
  function F(e, t) {
    Object.defineProperty(e, t, {
      get: function() {
        return p.Get(this).makeObservableArray(t), this[t];
      },
      set: function(r) {
        p.Get(this).makeObservableArray(t), this[t] = r;
      }
    });
  }
  f.observableArray = F;
  function $() {
    if (arguments.length == 1)
      return v(arguments[0]);
    v(null).apply(this, arguments);
  }
  f.computed = $;
  function q(e, t, r) {
    v({ pure: !0 })(e, t, r);
  }
  f.pureComputed = q;
  function T(e) {
    return (t, r, s) => {
      h.Get(t).pushKoExtend(r, e);
    };
  }
  f.extend = T;
  function O(e) {
    return (t, r) => {
      h.Get(t).pushSetFilter(r, e);
    };
  }
  f.setFilter = O;
  function z(e, t) {
    h.Get(e).pushSetFilter(t, (r) => !r || typeof r == "number" ? r : (r = parseFloat(r), isNaN(r) ? 0 : r));
  }
  f.asNumber = z;
  function B(e) {
    return O((t) => t < e ? e : t);
  }
  f.min = B;
  function J(e) {
    return O((t) => t > e ? e : t);
  }
  f.max = J;
  function L(e, t) {
    if (e > t) {
      let r = e;
      e = t, t = r;
    }
    return O((r) => (r < e ? r = e : r > t && (r = t), r));
  }
  f.clamp = L;
  function I() {
    if (typeof arguments[0] == "function") {
      d = null, arguments[0]();
      let e = d;
      return d = null, e;
    } else {
      let e = arguments[0], t = arguments[1];
      return p.Get(e).getObservable(t);
    }
  }
  f.getObservable = I;
  function K() {
    if (typeof arguments[0] == "function") {
      H = null, arguments[0]();
      let e = H;
      return d = null, e;
    } else {
      let e = arguments[0], t = arguments[1];
      return p.Get(e).getObservableArray(t);
    }
  }
  f.getObservableArray = K;
  function _() {
    if (typeof arguments[0] == "function") {
      G = null, arguments[0]();
      let e = G;
      return G = null, e;
    } else {
      let e = arguments[0], t = arguments[1];
      return p.Get(e).getComputed(t);
    }
  }
  f.getComputed = _;
  function v(e) {
    return (t, r, s) => {
      let n = s.get;
      if (!n)
        throw "@Computed and @pureComputed require getter.";
      let i = s.set;
      s.get = function() {
        return p.Get(this).makeComputed(r, n, i, e), this[r];
      }, i && (s.set = function(l) {
        p.Get(this).makeComputed(r, n, i, e), this[r] = l;
      });
    };
  }
  let d = null, H = null, G = null;
  const C = class {
    static Get(e) {
      return e = typeof e == "function" ? e.prototype : e, e[C.Key] || (e[C.Key] = new this()), e[C.Key];
    }
    pushIgnoreProperty(e) {
      this.ignoreProperties || (this.ignoreProperties = []), this.ignoreProperties.push(e);
    }
    isIgnoreProperty(e) {
      return this.ignoreProperties != null && this.ignoreProperties.indexOf(e) != -1;
    }
    pushKoExtend(e, t) {
      this.extendsHash || (this.extendsHash = {}), this.extendsHash[e] || (this.extendsHash[e] = []), this.extendsHash[e].push(t);
    }
    applyKoExtend(e, t) {
      if (!this.extendsHash)
        return;
      let r = this.extendsHash[e];
      if (!r)
        return;
      let s = r.length;
      for (let n = 0; n < s; ++n)
        t.extend(r[n]);
    }
    pushSetFilter(e, t) {
      this.setFiltersHash || (this.setFiltersHash = {});
      let r = this.setFiltersHash[e];
      r || (r = this.setFiltersHash[e] = []), r.push(t);
    }
    getSetter(e, t) {
      if (!this.setFiltersHash)
        return t;
      let r = this.setFiltersHash[e];
      if (!r)
        return t;
      let s = r.length;
      return (n) => {
        for (let i = 0; i < s; ++i)
          n = r[i](n);
        t(n);
      };
    }
    constructor() {
    }
  };
  let h = C;
  h.Key = "__vtKnockoutDecoratorClassInfo__";
  const k = class {
    constructor(e) {
      this.koObservableHash = {}, this.koObservableArrayHash = {}, this.koComputedHash = {}, this.target = e;
    }
    static Get(e) {
      return e[k.Key] || (e[k.Key] = new this(e)), e[k.Key];
    }
    makeObservable(e) {
      let t = A.observable();
      this.koObservableHash[e] = t;
      let r = Object.getPrototypeOf(this.target), s = h.Get(r);
      s.applyKoExtend(e, t), h.Get(r), Object.defineProperty(this.target, e, {
        get: () => (d = t, t()),
        set: s.getSetter(e, t)
      });
    }
    makeObservableArray(e) {
      function t(l, a) {
        let g = {};
        ["splice", "pop", "push", "shift", "unshift", "reverse", "sort"].forEach((o) => {
          g[o] = l[o];
          let m = function() {
            l[o] = g[o];
            let c = a[o].apply(a, arguments);
            return l[o] = m, c;
          };
          l[o] = m;
        });
      }
      function r(l, a) {
        ["replace", "remove", "removeAll", "destroy", "destroyAll"].forEach((g) => {
          l[g] = function() {
            return a[g].apply(a, arguments);
          };
        });
      }
      let s = A.observableArray();
      this.koObservableArrayHash[e] = s;
      let n = Object.getPrototypeOf(this.target), i = h.Get(n);
      i.applyKoExtend(e, s), h.Get(n), Object.defineProperty(this.target, e, {
        get: () => (H = s, s()),
        set: function(l) {
          l && (t(l, s), r(l, s)), i.getSetter(e, s)(l);
        }
      });
    }
    makeComputed(e, t, r, s) {
      let n = {
        read: t,
        write: r,
        owner: this.target
      };
      if (s)
        for (let g in s)
          n[g] = s[g];
      let i = A.computed(n);
      this.koComputedHash[e] = i;
      let l = Object.getPrototypeOf(this.target), a = h.Get(l);
      a.applyKoExtend(e, i), Object.defineProperty(this.target, e, {
        get: () => (G = i, i()),
        set: r != null ? a.getSetter(e, i) : void 0
      });
    }
    getObservable(e) {
      return this.koObservableHash[e];
    }
    getObservableArray(e) {
      return this.koObservableArrayHash[e];
    }
    getComputed(e) {
      return this.koComputedHash[e];
    }
  };
  let p = k;
  p.Key = "__vtKnockoutDecoratorObjInfo__";
})(x || (x = {}));
const Q = x;
export {
  x as KnockoutDecorator,
  Q as default
};
