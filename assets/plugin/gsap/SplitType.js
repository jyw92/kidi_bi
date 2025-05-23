/**
 * SplitType
 * https://github.com/lukePeavey/SplitType
 * @version 0.3.2
 * @author Luke Peavey <lwpeavey@gmail.com>
 */

!function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).SplitType = e()
}(this, (function() {
    "use strict";
    function t(t, e) {
        return Object.getOwnPropertyNames(Object(t)).reduce(( (n, s) => {
            const i = Object.getOwnPropertyDescriptor(Object(t), s)
              , o = Object.getOwnPropertyDescriptor(Object(e), s);
            return Object.defineProperty(n, s, o || i)
        }
        ), {})
    }
    function e(t) {
        return "string" == typeof t
    }
    function n(t) {
        return Array.isArray(t)
    }
    function s(s={}) {
        const i = t(s);
        let o;
        return void 0 !== i.types ? o = i.types : void 0 !== i.split && (o = i.split),
        void 0 !== o && (i.types = (e(o) || n(o) ? String(o) : "").split(",").map((t => String(t).trim())).filter((t => /((line)|(word)|(char))/i.test(t)))),
        (i.absolute || i.position) && (i.absolute = i.absolute || /absolute/.test(s.position)),
        i
    }
    function i(t) {
        const s = e(t) || n(t) ? String(t) : "";
        return {
            none: !s,
            lines: /line/i.test(s),
            words: /word/i.test(s),
            chars: /char/i.test(s)
        }
    }
    function o(t) {
        return null !== t && "object" == typeof t
    }
    function r(t) {
        return o(t) && /^(1|3|11)$/.test(t.nodeType)
    }
    function l(t) {
        return n(t) ? t : null == t ? [] : function(t) {
            return o(t) && function(t) {
                return "number" == typeof t && t > -1 && t % 1 == 0
            }(t.length)
        }(t) ? Array.prototype.slice.call(t) : [t]
    }
    function c(t) {
        let n = t;
        return e(t) && (n = /^(#[a-z]\w+)$/.test(t.trim()) ? document.getElementById(t.trim().slice(1)) : document.querySelectorAll(t)),
        l(n).reduce(( (t, e) => [...t, ...l(e).filter(r)]), [])
    }
    ( () => {
        function t(...t) {
            const e = t.length;
            for (let n = 0; n < e; n++) {
                const e = t[n];
                1 === e.nodeType || 11 === e.nodeType ? this.appendChild(e) : this.appendChild(document.createTextNode(String(e)))
            }
        }
        function e(...t) {
            for (; this.lastChild; )
                this.removeChild(this.lastChild);
            t.length && this.append(...t)
        }
        function n(...t) {
            const e = this.parentNode;
            let n = t.length;
            if (e)
                for (n || e.removeChild(this); n--; ) {
                    let s = t[n];
                    "object" != typeof s ? s = this.ownerDocument.createTextNode(s) : s.parentNode && s.parentNode.removeChild(s),
                    n ? e.insertBefore(this.previousSibling, s) : e.replaceChild(s, this)
                }
        }
        "undefined" != typeof Element && (Element.prototype.append || (Element.prototype.append = t,
        DocumentFragment.prototype.append = t),
        Element.prototype.replaceChildren || (Element.prototype.replaceChildren = e,
        DocumentFragment.prototype.replaceChildren = e),
        Element.prototype.replaceWith || (Element.prototype.replaceWith = n,
        DocumentFragment.prototype.replaceWith = n))
    }
    )();
    const {entries: d, keys: p, values: h} = Object
      , u = "_splittype"
      , a = {};
    let f = 0;
    function g(t, e, n) {
        if (!o(t))
            return console.warn("[data.set] owner is not an object"),
            null;
        const s = t[u] || (t[u] = ++f)
          , i = a[s] || (a[s] = {});
        return void 0 === n ? e && Object.getPrototypeOf(e) === Object.prototype && (a[s] = {
            ...i,
            ...e
        }) : void 0 !== e && (i[e] = n),
        n
    }
    function y(t, e) {
        const n = o(t) ? t[u] : null
          , s = n && a[n] || {};
        return void 0 === e ? s : s[e]
    }
    function m(t) {
        const e = t && t[u];
        e && (delete t[e],
        delete a[e])
    }
    const w = "\\ud800-\\udfff"
      , b = "\\u0300-\\u036f\\ufe20-\\ufe23"
      , C = "\\u20d0-\\u20f0"
      , E = "\\ufe0e\\ufe0f"
      , S = "[\\ud800-\\udfff]"
      , v = `[${b}\\u20d0-\\u20f0]`
      , x = "\\ud83c[\\udffb-\\udfff]"
      , $ = "[^\\ud800-\\udfff]"
      , j = "(?:\\ud83c[\\udde6-\\uddff]){2}"
      , O = "[\\ud800-\\udbff][\\udc00-\\udfff]"
      , W = "\\u200d"
      , T = `(?:${v}|${x})` + "?"
      , N = "[\\ufe0e\\ufe0f]?"
      , D = N + T + ("(?:\\u200d(?:" + [$, j, O].join("|") + ")" + N + T + ")*")
      , R = `(?:${[`${$}${v}?`, v, j, O, S].join("|")}\n)`
      , k = RegExp(`${x}(?=${x})|${R}${D}`, "g")
      , A = RegExp(`[${[W, w, b, C, E].join("")}]`);
    function B(t) {
        return A.test(t)
    }
    function F(t) {
        return B(t) ? function(t) {
            return t.match(k) || []
        }(t) : function(t) {
            return t.split("")
        }(t)
    }
    function L(t, n="") {
        var s;
        return (t = null == (s = t) ? "" : String(s)) && e(t) && !n && B(t) ? F(t) : t.split(n)
    }
    function P(t, n) {
        const s = document.createElement(t);
        return n ? (Object.keys(n).forEach((t => {
            const i = n[t]
              , o = e(i) ? i.trim() : i;
            null !== o && "" !== o && ("children" === t ? s.append(...l(o)) : s.setAttribute(t, o))
        }
        )),
        s) : s
    }
    var H = {
        splitClass: "",
        lineClass: "line",
        wordClass: "word",
        charClass: "char",
        types: ["lines", "words", "chars"],
        absolute: !1,
        tagName: "div"
    };
    function M(e, n) {
        const s = i((n = t(H, n)).types)
          , o = n.tagName
          , r = e.nodeValue
          , l = document.createDocumentFragment();
        let c = []
          , d = [];
        return /^\s/.test(r) && l.append(" "),
        c = function(t, e=" ") {
            return (t ? String(t) : "").trim().replace(/\s+/g, " ").split(e)
        }(r).reduce(( (t, e, i, r) => {
            let c, p;
            return s.chars && (p = L(e).map((t => {
                const e = P(o, {
                    class: `${n.splitClass} ${n.charClass}`,
                    style: "display: inline-block;",
                    children: t
                });
                return g(e, "isChar", !0),
                d = [...d, e],
                e
            }
            ))),
            s.words || s.lines ? (c = P(o, {
                class: `${n.wordClass} ${n.splitClass}`,
                style: "display: inline-block; " + (s.words && n.absolute ? "position: relative;" : ""),
                children: s.chars ? p : e
            }),
            g(c, {
                isWord: !0,
                isWordStart: !0,
                isWordEnd: !0
            }),
            l.appendChild(c)) : p.forEach((t => {
                l.appendChild(t)
            }
            )),
            i < r.length - 1 && l.append(" "),
            s.words ? t.concat(c) : t
        }
        ), []),
        /\s$/.test(r) && l.append(" "),
        e.replaceWith(l),
        {
            words: c,
            chars: d
        }
    }
    function z(t, e) {
        const n = t.nodeType
          , s = {
            words: [],
            chars: []
        };
        if (!/(1|3|11)/.test(n))
            return s;
        if (3 === n && /\S/.test(t.nodeValue))
            return M(t, e);
        const i = l(t.childNodes);
        if (i.length && (g(t, "isSplit", !0),
        !y(t).isRoot)) {
            t.style.display = "inline-block",
            t.style.position = "relative";
            const e = t.nextSibling
              , n = t.previousSibling
              , s = t.textContent || ""
              , i = e ? e.textContent : " "
              , o = n ? n.textContent : " ";
            g(t, {
                isWordEnd: /\s$/.test(s) || /^\s/.test(i),
                isWordStart: /^\s/.test(s) || /\s$/.test(o)
            })
        }
        return i.reduce(( (t, n) => {
            const {words: s, chars: i} = z(n, e);
            return {
                words: [...t.words, ...s],
                chars: [...t.chars, ...i]
            }
        }
        ), s)
    }
    function V(t) {
        y(t).isWord ? (m(t),
        t.replaceWith(...t.childNodes)) : l(t.children).forEach((t => V(t)))
    }
    function q(t, e, n) {
        const s = i(e.types)
          , o = e.tagName
          , r = t.getElementsByTagName("*")
          , c = [];
        let d, p, h, u = [], a = null, f = [];
        const m = t.parentElement
          , w = t.nextElementSibling
          , b = document.createDocumentFragment()
          , C = window.getComputedStyle(t)
          , E = C.textAlign
          , S = .2 * parseFloat(C.fontSize);
        return e.absolute && (h = {
            left: t.offsetLeft,
            top: t.offsetTop,
            width: t.offsetWidth
        },
        p = t.offsetWidth,
        d = t.offsetHeight,
        g(t, {
            cssWidth: t.style.width,
            cssHeight: t.style.height
        })),
        l(r).forEach((i => {
            const o = i.parentElement === t
              , {width: r, height: l, top: d, left: p} = function(t, e, n, s) {
                if (!n.absolute)
                    return {
                        top: e ? t.offsetTop : null
                    };
                const i = t.offsetParent
                  , [o,r] = s;
                let l = 0
                  , c = 0;
                if (i && i !== document.body) {
                    const t = i.getBoundingClientRect();
                    l = t.x + o,
                    c = t.y + r
                }
                const {width: d, height: p, x: h, y: u} = t.getBoundingClientRect();
                return {
                    width: d,
                    height: p,
                    top: u + r - c,
                    left: h + o - l
                }
            }(i, o, e, n);
            /^br$/i.test(i.nodeName) || (s.lines && o && ((null === a || d - a >= S) && (a = d,
            c.push(u = [])),
            u.push(i)),
            e.absolute && g(i, {
                top: d,
                left: p,
                width: r,
                height: l
            }))
        }
        )),
        m && m.removeChild(t),
        s.lines && (f = c.map((t => {
            const n = P(o, {
                class: `${e.splitClass} ${e.lineClass}`,
                style: `display: block; text-align: ${E}; width: 100%;`
            });
            g(n, "isLine", !0);
            const s = {
                height: 0,
                top: 1e4
            };
            return b.appendChild(n),
            t.forEach(( (t, e, i) => {
                const {isWordEnd: o, top: r, height: l} = y(t)
                  , c = i[e + 1];
                s.height = Math.max(s.height, l),
                s.top = Math.min(s.top, r),
                n.appendChild(t),
                o && y(c).isWordStart && n.append(" ")
            }
            )),
            e.absolute && g(n, {
                height: s.height,
                top: s.top
            }),
            n
        }
        )),
        s.words || V(b),
        t.replaceChildren(b)),
        e.absolute && (t.style.width = (t.style.width || p) + "px",
        t.style.height = d + "px",
        l(r).forEach((t => {
            const {isLine: e, top: n, left: s, width: i, height: o} = y(t)
              , r = y(t.parentElement)
              , l = !e && r.isLine;
            t.style.top = (l ? n - r.top : n) + "px",
            t.style.left = e ? h.left + "px" : s - (l ? h.left : 0) + "px",
            t.style.height = o + "px",
            t.style.width = e ? h.width + "px" : i + "px",
            t.style.position = "absolute"
        }
        ))),
        m && (w ? m.insertBefore(t, w) : m.appendChild(t)),
        f
    }
    let I = t(H, {});
    class X {
        static get data() {
            return a
        }
        static get defaults() {
            return I
        }
        static set defaults(e) {
            I = t(I, s(e))
        }
        static setDefaults(e) {
            return I = t(I, s(e)),
            H
        }
        static revert(t) {
            c(t).forEach((t => {
                const {isSplit: e, html: n, cssWidth: s, cssHeight: i} = y(t);
                e && (t.innerHTML = n,
                t.style.width = s || "",
                t.style.height = i || "",
                m(t))
            }
            ))
        }
        static create(t, e) {
            return new X(t,e)
        }
        constructor(e, n) {
            this.isSplit = !1,
            this.settings = t(I, s(n)),
            this.elements = c(e),
            this.revert(),
            this.elements.forEach((t => {
                g(t, "html", t.innerHTML)
            }
            )),
            this.split()
        }
        split(e) {
            this.revert(),
            this.lines = [],
            this.words = [],
            this.chars = [];
            const n = [window.pageXOffset, window.pageYOffset];
            void 0 !== e && (this.settings = t(this.settings, s(e)));
            const o = i(this.settings.types);
            o.none || (this.elements.forEach((t => {
                g(t, "isRoot", !0);
                const {words: e, chars: n} = z(t, this.settings);
                this.words = [...this.words, ...e],
                this.chars = [...this.chars, ...n]
            }
            )),
            this.elements.forEach((t => {
                if (o.lines || this.settings.absolute) {
                    const e = q(t, this.settings, n);
                    this.lines = [...this.lines, ...e]
                }
            }
            )),
            this.isSplit = !0,
            window.scrollTo(n[0], n[1]),
            d(a).forEach(( ([t,{isRoot: e, isSplit: n}]) => {
                e && n || (a[t] = null,
                delete a[t])
            }
            )))
        }
        revert() {
            this.isSplit && (this.lines = null,
            this.words = null,
            this.chars = null,
            this.isSplit = !1),
            X.revert(this.elements)
        }
    }
    return X
}
));