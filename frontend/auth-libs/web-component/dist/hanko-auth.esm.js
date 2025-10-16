/*! For license information please see elements.js.LICENSE.txt */
var To = { 7: function(o, t, e) {
  (function(n, a, r) {
    var c = function() {
      return c = Object.assign || function(C) {
        for (var A, S = 1, x = arguments.length; S < x; S++) for (var I in A = arguments[S]) Object.prototype.hasOwnProperty.call(A, I) && (C[I] = A[I]);
        return C;
      }, c.apply(this, arguments);
    };
    function l(C, A) {
      var S = typeof Symbol == "function" && C[Symbol.iterator];
      if (!S) return C;
      var x, I, D = S.call(C), M = [];
      try {
        for (; (A === void 0 || A-- > 0) && !(x = D.next()).done; ) M.push(x.value);
      } catch (U) {
        I = { error: U };
      } finally {
        try {
          x && !x.done && (S = D.return) && S.call(D);
        } finally {
          if (I) throw I.error;
        }
      }
      return M;
    }
    function u(C, A) {
      return [C, !C || C.endsWith("/") ? "" : "/", A, ".json"].join("");
    }
    function s(C, A) {
      var S = C;
      return A && Object.keys(A).forEach(function(x) {
        var I = A[x], D = new RegExp("{".concat(x, "}"), "gm");
        S = S.replace(D, I.toString());
      }), S;
    }
    function d(C, A, S) {
      var x = C[A];
      if (!x) return S;
      var I = S.split("."), D = "";
      do {
        var M = x[D += I.shift()];
        M === void 0 || typeof M != "object" && I.length ? I.length ? D += "." : x = S : (x = M, D = "");
      } while (I.length);
      return x;
    }
    var p = {}, g = { root: "", lang: "en", fallbackLang: "en" }, f = a.createContext(null);
    n.TranslateContext = f, n.TranslateProvider = function(C) {
      var A = function(M, U) {
        M = Object.assign({}, g, M), p = U || p;
        var ie = l(r.useState(M.lang), 2), ge = ie[0], ae = ie[1], be = l(r.useState(p), 2), H = be[0], F = be[1], me = l(r.useState(!1), 2), Pe = me[0], Oe = me[1], Ee = function(re) {
          if (!H.hasOwnProperty(re)) {
            Oe(!1);
            var se = u(M.root, re);
            fetch(se).then(function(ue) {
              return ue.json();
            }).then(function(ue) {
              p[re] = ue, F(c({}, p)), Oe(!0);
            }).catch(function(ue) {
              console.log("Aww, snap.", ue), F(c({}, p)), Oe(!0);
            });
          }
        };
        return r.useEffect(function() {
          Ee(M.fallbackLang), Ee(ge);
        }, [ge]), { lang: ge, setLang: ae, t: function(re, se) {
          if (!H.hasOwnProperty(ge)) return re;
          var ue = d(H, ge, re);
          return ue === re && ge !== M.fallbackLang && (ue = d(H, M.fallbackLang, re)), s(ue, se);
        }, isReady: Pe };
      }({ root: C.root || "assets", lang: C.lang || "en", fallbackLang: C.fallbackLang || "en" }, C.translations), S = A.t, x = A.setLang, I = A.lang, D = A.isReady;
      return a.h(f.Provider, { value: { t: S, setLang: x, lang: I, isReady: D } }, C.children);
    }, n.format = s, n.getResourceUrl = u, n.getValue = d, Object.defineProperty(n, "__esModule", { value: !0 });
  })(t, e(616), e(78));
}, 633: (o, t) => {
  var e;
  (function() {
    var n = {}.hasOwnProperty;
    function a() {
      for (var r = [], c = 0; c < arguments.length; c++) {
        var l = arguments[c];
        if (l) {
          var u = typeof l;
          if (u === "string" || u === "number") r.push(l);
          else if (Array.isArray(l)) {
            if (l.length) {
              var s = a.apply(null, l);
              s && r.push(s);
            }
          } else if (u === "object") {
            if (l.toString !== Object.prototype.toString && !l.toString.toString().includes("[native code]")) {
              r.push(l.toString());
              continue;
            }
            for (var d in l) n.call(l, d) && l[d] && r.push(d);
          }
        }
      }
      return r.join(" ");
    }
    o.exports ? (a.default = a, o.exports = a) : (e = (function() {
      return a;
    }).apply(t, [])) === void 0 || (o.exports = e);
  })();
}, 21: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, '.hanko_accordion{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);width:100%;overflow:hidden}.hanko_accordion .hanko_accordionItem{color:var(--color, #333333);margin:.25rem 0;overflow:hidden}.hanko_accordion .hanko_accordionItem.hanko_dropdown{margin:0}.hanko_accordion .hanko_accordionItem .hanko_label{border-radius:var(--border-radius, 8px);border-style:none;height:var(--item-height, 42px);background:var(--background-color, white);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 1rem;margin:0;cursor:pointer;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hanko_accordion .hanko_accordionItem .hanko_label .hanko_labelText .hanko_description{color:var(--color-shade-1, #8f9095)}.hanko_accordion .hanko_accordionItem .hanko_label.hanko_dropdown{margin:0;color:var(--link-color, #506cf0);justify-content:flex-start}.hanko_accordion .hanko_accordionItem .hanko_label:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb)}.hanko_accordion .hanko_accordionItem .hanko_label:hover .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_label:hover.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_label:not(.hanko_dropdown)::after{content:"❯";width:1rem;text-align:center;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionInput{position:absolute;opacity:0;z-index:-1}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label .hanko_description{color:var(--brand-contrast-color, white)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label.hanko_dropdown{color:var(--link-color, #506cf0);background:none}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label:not(.hanko_dropdown)::after{transform:rotate(90deg)}.hanko_accordion .hanko_accordionItem .hanko_accordionInput:checked+.hanko_label~.hanko_accordionContent{margin:.25rem 1rem;opacity:1;max-height:100vh}.hanko_accordion .hanko_accordionItem .hanko_accordionContent{max-height:0;margin:0 1rem;opacity:0;overflow:hidden;transition:all .35s}.hanko_accordion .hanko_accordionItem .hanko_accordionContent.hanko_dropdownContent{border-style:none}', ""]), c.locals = { accordion: "hanko_accordion", accordionItem: "hanko_accordionItem", dropdown: "hanko_dropdown", label: "hanko_label", labelText: "hanko_labelText", description: "hanko_description", accordionInput: "hanko_accordionInput", accordionContent: "hanko_accordionContent", dropdownContent: "hanko_dropdownContent" };
  const l = c;
}, 905: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_errorBox{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);color:var(--error-color, #e82020);background:var(--background-color, white);margin:var(--item-margin, 0.5rem 0);display:flex;align-items:start;box-sizing:border-box;line-height:1.5rem;padding:.25em;gap:.2em}.hanko_errorBox>span{display:inline-flex}.hanko_errorBox>span:first-child{padding:.25em 0 .25em .19em}.hanko_errorBox[hidden]{display:none}.hanko_errorMessage{color:var(--error-color, #e82020)}", ""]), c.locals = { errorBox: "hanko_errorBox", errorMessage: "hanko_errorMessage" };
  const l = c;
}, 577: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, '.hanko_form{display:flex;flex-grow:1}.hanko_form .hanko_ul{flex-grow:1;margin:var(--item-margin, 0.5rem 0);padding-inline-start:0;list-style-type:none;display:flex;flex-wrap:wrap;gap:1em}.hanko_form .hanko_li{display:flex;max-width:100%;flex-grow:1;flex-basis:min-content}.hanko_form .hanko_li.hanko_maxWidth{min-width:100%}.hanko_button{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);white-space:nowrap;width:100%;min-width:var(--button-min-width, 7em);min-height:var(--item-height, 42px);outline:none;cursor:pointer;transition:.1s ease-out;flex-grow:1;flex-shrink:1;display:inline-flex}.hanko_button:disabled{cursor:default}.hanko_button.hanko_primary{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--brand-color, #506cf0);justify-content:center}.hanko_button.hanko_primary:hover{color:var(--brand-contrast-color, white);background:var(--brand-color-shade-1, #6b84fb);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_primary:focus{color:var(--brand-contrast-color, white);background:var(--brand-color, #506cf0);border-color:var(--color, #333333)}.hanko_button.hanko_primary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-2, #e5e6ef)}.hanko_button.hanko_secondary{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--color, #333333);justify-content:flex-start}.hanko_button.hanko_secondary:hover{color:var(--color, #333333);background:var(--color-shade-2, #e5e6ef);border-color:var(--color, #333333)}.hanko_button.hanko_secondary:focus{color:var(--color, #333333);background:var(--background-color, white);border-color:var(--brand-color, #506cf0)}.hanko_button.hanko_secondary:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_button.hanko_dangerous{color:var(--error-color, #e82020);background:var(--background-color, white);border-color:var(--error-color, #e82020);flex-grow:0;width:auto}.hanko_caption{flex-grow:1;flex-wrap:wrap;display:flex;justify-content:space-between;align-items:baseline}.hanko_lastUsed{color:var(--color-shade-1, #8f9095);font-size:smaller}.hanko_inputWrapper{flex-grow:1;position:relative;display:flex;min-width:var(--input-min-width, 14em);max-width:100%}.hanko_input{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);border-radius:var(--border-radius, 8px);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);height:var(--item-height, 42px);color:var(--color, #333333);border-color:var(--color-shade-1, #8f9095);background:var(--background-color, white);padding:0 .5rem;outline:none;width:100%;box-sizing:border-box;transition:.1s ease-out}.hanko_input.hanko_error{border-color:var(--error-color, #e82020)}.hanko_input:-webkit-autofill,.hanko_input:-webkit-autofill:hover,.hanko_input:-webkit-autofill:focus{-webkit-text-fill-color:var(--color, #333333);-webkit-box-shadow:0 0 0 50px var(--background-color, white) inset}.hanko_input::-ms-reveal,.hanko_input::-ms-clear{display:none}.hanko_input::placeholder{color:var(--color-shade-1, #8f9095)}.hanko_input:focus{color:var(--color, #333333);border-color:var(--color, #333333)}.hanko_input:disabled{color:var(--color-shade-1, #8f9095);background:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_passcodeInputWrapper{flex-grow:1;min-width:var(--input-min-width, 14em);max-width:fit-content;position:relative;display:flex;justify-content:space-between}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper{flex-grow:1;margin:0 .5rem 0 0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper:last-child{margin:0}.hanko_passcodeInputWrapper .hanko_passcodeDigitWrapper .hanko_input{text-align:center}.hanko_checkboxWrapper{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);align-items:center;display:flex}.hanko_checkboxWrapper .hanko_label{color:inherit;padding-left:.5rem;cursor:pointer}.hanko_checkboxWrapper .hanko_label.hanko_disabled{cursor:default;color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox{border:currentColor solid 1px;border-radius:.15em;appearance:none;-webkit-appearance:none;width:1.1rem;height:1.1rem;margin:0;color:currentColor;background-color:var(--background-color, white);font:inherit;box-shadow:none;display:inline-flex;place-content:center;cursor:pointer}.hanko_checkboxWrapper .hanko_checkbox:checked{background-color:var(--color, #333333)}.hanko_checkboxWrapper .hanko_checkbox:disabled{cursor:default;background-color:var(--color-shade-2, #e5e6ef);border-color:var(--color-shade-1, #8f9095)}.hanko_checkboxWrapper .hanko_checkbox:checked:after{content:"✓";color:var(--background-color, white);position:absolute;line-height:1.1rem}.hanko_checkboxWrapper .hanko_checkbox:disabled:after{color:var(--color-shade-1, #8f9095)}', ""]), c.locals = { form: "hanko_form", ul: "hanko_ul", li: "hanko_li", maxWidth: "hanko_maxWidth", button: "hanko_button", primary: "hanko_primary", secondary: "hanko_secondary", dangerous: "hanko_dangerous", caption: "hanko_caption", lastUsed: "hanko_lastUsed", inputWrapper: "hanko_inputWrapper", input: "hanko_input", error: "hanko_error", passcodeInputWrapper: "hanko_passcodeInputWrapper", passcodeDigitWrapper: "hanko_passcodeDigitWrapper", checkboxWrapper: "hanko_checkboxWrapper", label: "hanko_label", disabled: "hanko_disabled", checkbox: "hanko_checkbox" };
  const l = c;
}, 619: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_headline{color:var(--color, #333333);font-family:var(--font-family, sans-serif);text-align:left;letter-spacing:0;font-style:normal;line-height:1.1}.hanko_headline.hanko_grade1{font-size:var(--headline1-font-size, 24px);font-weight:var(--headline1-font-weight, 600);margin:var(--headline1-margin, 0 0 0.5rem)}.hanko_headline.hanko_grade2{font-size:var(--headline2-font-size, 16px);font-weight:var(--headline2-font-weight, 600);margin:var(--headline2-margin, 1rem 0 0.5rem)}", ""]), c.locals = { headline: "hanko_headline", grade1: "hanko_grade1", grade2: "hanko_grade2" };
  const l = c;
}, 697: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_icon,.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner,.hanko_exclamationMark,.hanko_checkmark{display:inline-block;fill:var(--brand-contrast-color, white);width:18px}.hanko_icon.hanko_secondary,.hanko_loadingSpinnerWrapper .hanko_secondary.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_secondary.hanko_loadingSpinner,.hanko_secondary.hanko_exclamationMark,.hanko_secondary.hanko_checkmark{fill:var(--color, #333333)}.hanko_icon.hanko_disabled,.hanko_loadingSpinnerWrapper .hanko_disabled.hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_disabled.hanko_loadingSpinner,.hanko_disabled.hanko_exclamationMark,.hanko_disabled.hanko_checkmark{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark{fill:var(--brand-color, #506cf0)}.hanko_checkmark.hanko_secondary{fill:var(--color-shade-1, #8f9095)}.hanko_checkmark.hanko_fadeOut{animation:hanko_fadeOut ease-out 1.5s forwards !important}@keyframes hanko_fadeOut{0%{opacity:1}100%{opacity:0}}.hanko_exclamationMark{fill:var(--error-color, #e82020)}.hanko_loadingSpinnerWrapperIcon{width:100%;column-gap:10px;margin-left:10px}.hanko_loadingSpinnerWrapper,.hanko_loadingSpinnerWrapperIcon{display:inline-flex;align-items:center;height:100%;margin:0 5px;justify-content:inherit;flex-wrap:inherit}.hanko_loadingSpinnerWrapper.hanko_centerContent,.hanko_centerContent.hanko_loadingSpinnerWrapperIcon{justify-content:center}.hanko_loadingSpinnerWrapper.hanko_maxWidth,.hanko_maxWidth.hanko_loadingSpinnerWrapperIcon{width:100%}.hanko_loadingSpinnerWrapper .hanko_loadingSpinner,.hanko_loadingSpinnerWrapperIcon .hanko_loadingSpinner{fill:var(--brand-color, #506cf0);animation:hanko_spin 500ms ease-in-out infinite}.hanko_loadingSpinnerWrapper.hanko_secondary,.hanko_secondary.hanko_loadingSpinnerWrapperIcon{fill:var(--color-shade-1, #8f9095)}@keyframes hanko_spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.hanko_googleIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_googleIcon.hanko_blue{fill:#4285f4}.hanko_googleIcon.hanko_green{fill:#34a853}.hanko_googleIcon.hanko_yellow{fill:#fbbc05}.hanko_googleIcon.hanko_red{fill:#ea4335}.hanko_microsoftIcon.hanko_disabled{fill:var(--color-shade-1, #8f9095)}.hanko_microsoftIcon.hanko_blue{fill:#00a4ef}.hanko_microsoftIcon.hanko_green{fill:#7fba00}.hanko_microsoftIcon.hanko_yellow{fill:#ffb900}.hanko_microsoftIcon.hanko_red{fill:#f25022}.hanko_facebookIcon.hanko_outline{fill:#0866ff}.hanko_facebookIcon.hanko_disabledOutline{fill:var(--color-shade-1, #8f9095)}.hanko_facebookIcon.hanko_letter{fill:#fff}.hanko_facebookIcon.hanko_disabledLetter{fill:var(--color-shade-2, #e5e6ef)}", ""]), c.locals = { icon: "hanko_icon", loadingSpinnerWrapper: "hanko_loadingSpinnerWrapper", loadingSpinner: "hanko_loadingSpinner", loadingSpinnerWrapperIcon: "hanko_loadingSpinnerWrapperIcon", exclamationMark: "hanko_exclamationMark", checkmark: "hanko_checkmark", secondary: "hanko_secondary", disabled: "hanko_disabled", fadeOut: "hanko_fadeOut", centerContent: "hanko_centerContent", maxWidth: "hanko_maxWidth", spin: "hanko_spin", googleIcon: "hanko_googleIcon", blue: "hanko_blue", green: "hanko_green", yellow: "hanko_yellow", red: "hanko_red", microsoftIcon: "hanko_microsoftIcon", facebookIcon: "hanko_facebookIcon", outline: "hanko_outline", disabledOutline: "hanko_disabledOutline", letter: "hanko_letter", disabledLetter: "hanko_disabledLetter" };
  const l = c;
}, 995: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_link{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--link-color, #506cf0);text-decoration:var(--link-text-decoration, none);cursor:pointer;background:none !important;border:none;padding:0 !important;transition:all .1s}.hanko_link:hover{text-decoration:var(--link-text-decoration-hover, underline)}.hanko_link:disabled{color:var(--color, #333333) !important;pointer-events:none;cursor:default}.hanko_link.hanko_danger{color:var(--error-color, #e82020)}.hanko_linkWrapper{display:inline-flex;flex-direction:row;justify-content:space-between;align-items:center;overflow:hidden}.hanko_linkWrapper.hanko_reverse{flex-direction:row-reverse}", ""]), c.locals = { link: "hanko_link", danger: "hanko_danger", linkWrapper: "hanko_linkWrapper", reverse: "hanko_reverse" };
  const l = c;
}, 560: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_otpCreationDetails{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);display:flex;justify-content:center;align-items:center;flex-direction:column;font-size:smaller}", ""]), c.locals = { otpCreationDetails: "hanko_otpCreationDetails" };
  const l = c;
}, 489: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_paragraph{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);color:var(--color, #333333);margin:var(--item-margin, 0.5rem 0);text-align:left;word-break:break-word}", ""]), c.locals = { paragraph: "hanko_paragraph" };
  const l = c;
}, 111: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_spacer{height:1em}.hanko_divider{font-weight:var(--font-weight, 400);font-size:var(--font-size, 16px);font-family:var(--font-family, sans-serif);line-height:var(--line-height, 1.4rem);display:flex;visibility:var(--divider-visibility, visible);color:var(--color-shade-1, #8f9095);margin:var(--item-margin, 0.5rem 0);padding:.5em 0}.hanko_divider .hanko_line{border-bottom-style:var(--border-style, solid);border-bottom-width:var(--border-width, 1px);color:inherit;font:inherit;width:100%}.hanko_divider .hanko_text{font:inherit;color:inherit;background:var(--background-color, white);padding:var(--divider-padding, 0 42px);line-height:.1em}", ""]), c.locals = { spacer: "hanko_spacer", divider: "hanko_divider", line: "hanko_line", text: "hanko_text" };
  const l = c;
}, 914: (o, t, e) => {
  e.d(t, { A: () => l });
  var n = e(645), a = e.n(n), r = e(278), c = e.n(r)()(a());
  c.push([o.id, ".hanko_container{background-color:var(--background-color, white);padding:var(--container-padding, 30px);max-width:var(--container-max-width, 410px);display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:center;align-items:center;align-content:flex-start;box-sizing:border-box}.hanko_content{box-sizing:border-box;flex:0 1 auto;width:100%;height:100%}.hanko_footer{padding:.5rem 0 0;box-sizing:border-box;width:100%}.hanko_footer :nth-child(1){float:left}.hanko_footer :nth-child(2){float:right}.hanko_clipboardContainer{display:flex}.hanko_clipboardIcon{display:flex;margin:auto;cursor:pointer}", ""]), c.locals = { container: "hanko_container", content: "hanko_content", footer: "hanko_footer", clipboardContainer: "hanko_clipboardContainer", clipboardIcon: "hanko_clipboardIcon" };
  const l = c;
}, 278: (o) => {
  o.exports = function(t) {
    var e = [];
    return e.toString = function() {
      return this.map(function(n) {
        var a = "", r = n[5] !== void 0;
        return n[4] && (a += "@supports (".concat(n[4], ") {")), n[2] && (a += "@media ".concat(n[2], " {")), r && (a += "@layer".concat(n[5].length > 0 ? " ".concat(n[5]) : "", " {")), a += t(n), r && (a += "}"), n[2] && (a += "}"), n[4] && (a += "}"), a;
      }).join("");
    }, e.i = function(n, a, r, c, l) {
      typeof n == "string" && (n = [[null, n, void 0]]);
      var u = {};
      if (r) for (var s = 0; s < this.length; s++) {
        var d = this[s][0];
        d != null && (u[d] = !0);
      }
      for (var p = 0; p < n.length; p++) {
        var g = [].concat(n[p]);
        r && u[g[0]] || (l !== void 0 && (g[5] === void 0 || (g[1] = "@layer".concat(g[5].length > 0 ? " ".concat(g[5]) : "", " {").concat(g[1], "}")), g[5] = l), a && (g[2] && (g[1] = "@media ".concat(g[2], " {").concat(g[1], "}")), g[2] = a), c && (g[4] ? (g[1] = "@supports (".concat(g[4], ") {").concat(g[1], "}"), g[4] = c) : g[4] = "".concat(c)), e.push(g));
      }
    }, e;
  };
}, 645: (o) => {
  o.exports = function(t) {
    return t[1];
  };
}, 616: (o, t, e) => {
  e.r(t), e.d(t, { Component: () => U, Fragment: () => M, cloneElement: () => Ue, createContext: () => He, createElement: () => x, createRef: () => D, h: () => x, hydrate: () => Me, isValidElement: () => c, options: () => a, render: () => he, toChildArray: () => me });
  var n, a, r, c, l, u, s, d, p, g = {}, f = [], C = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function A(m, v) {
    for (var y in v) m[y] = v[y];
    return m;
  }
  function S(m) {
    var v = m.parentNode;
    v && v.removeChild(m);
  }
  function x(m, v, y) {
    var E, N, P, q = {};
    for (P in v) P == "key" ? E = v[P] : P == "ref" ? N = v[P] : q[P] = v[P];
    if (arguments.length > 2 && (q.children = arguments.length > 3 ? n.call(arguments, 2) : y), typeof m == "function" && m.defaultProps != null) for (P in m.defaultProps) q[P] === void 0 && (q[P] = m.defaultProps[P]);
    return I(m, q, E, N, null);
  }
  function I(m, v, y, E, N) {
    var P = { type: m, props: v, key: y, ref: E, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: N ?? ++r };
    return N == null && a.vnode != null && a.vnode(P), P;
  }
  function D() {
    return { current: null };
  }
  function M(m) {
    return m.children;
  }
  function U(m, v) {
    this.props = m, this.context = v;
  }
  function ie(m, v) {
    if (v == null) return m.__ ? ie(m.__, m.__.__k.indexOf(m) + 1) : null;
    for (var y; v < m.__k.length; v++) if ((y = m.__k[v]) != null && y.__e != null) return y.__e;
    return typeof m.type == "function" ? ie(m) : null;
  }
  function ge(m) {
    var v, y;
    if ((m = m.__) != null && m.__c != null) {
      for (m.__e = m.__c.base = null, v = 0; v < m.__k.length; v++) if ((y = m.__k[v]) != null && y.__e != null) {
        m.__e = m.__c.base = y.__e;
        break;
      }
      return ge(m);
    }
  }
  function ae(m) {
    (!m.__d && (m.__d = !0) && l.push(m) && !be.__r++ || u !== a.debounceRendering) && ((u = a.debounceRendering) || s)(be);
  }
  function be() {
    var m, v, y, E, N, P, q, G;
    for (l.sort(d); m = l.shift(); ) m.__d && (v = l.length, E = void 0, N = void 0, q = (P = (y = m).__v).__e, (G = y.__P) && (E = [], (N = A({}, P)).__v = P.__v + 1, Ae(G, P, N, y.__n, G.ownerSVGElement !== void 0, P.__h != null ? [q] : null, E, q ?? ie(P), P.__h), k(E, P), P.__e != q && ge(P)), l.length > v && l.sort(d));
    be.__r = 0;
  }
  function H(m, v, y, E, N, P, q, G, Y, ve) {
    var w, _e, J, W, j, ye, B, $ = E && E.__k || f, Te = $.length;
    for (y.__k = [], w = 0; w < v.length; w++) if ((W = y.__k[w] = (W = v[w]) == null || typeof W == "boolean" || typeof W == "function" ? null : typeof W == "string" || typeof W == "number" || typeof W == "bigint" ? I(null, W, null, null, W) : Array.isArray(W) ? I(M, { children: W }, null, null, null) : W.__b > 0 ? I(W.type, W.props, W.key, W.ref ? W.ref : null, W.__v) : W) != null) {
      if (W.__ = y, W.__b = y.__b + 1, (J = $[w]) === null || J && W.key == J.key && W.type === J.type) $[w] = void 0;
      else for (_e = 0; _e < Te; _e++) {
        if ((J = $[_e]) && W.key == J.key && W.type === J.type) {
          $[_e] = void 0;
          break;
        }
        J = null;
      }
      Ae(m, W, J = J || g, N, P, q, G, Y, ve), j = W.__e, (_e = W.ref) && J.ref != _e && (B || (B = []), J.ref && B.push(J.ref, null, W), B.push(_e, W.__c || j, W)), j != null ? (ye == null && (ye = j), typeof W.type == "function" && W.__k === J.__k ? W.__d = Y = F(W, Y, m) : Y = Pe(m, W, J, $, j, Y), typeof y.type == "function" && (y.__d = Y)) : Y && J.__e == Y && Y.parentNode != m && (Y = ie(J));
    }
    for (y.__e = ye, w = Te; w--; ) $[w] != null && (typeof y.type == "function" && $[w].__e != null && $[w].__e == y.__d && (y.__d = Oe(E).nextSibling), T($[w], $[w]));
    if (B) for (w = 0; w < B.length; w++) b(B[w], B[++w], B[++w]);
  }
  function F(m, v, y) {
    for (var E, N = m.__k, P = 0; N && P < N.length; P++) (E = N[P]) && (E.__ = m, v = typeof E.type == "function" ? F(E, v, y) : Pe(y, E, E, N, E.__e, v));
    return v;
  }
  function me(m, v) {
    return v = v || [], m == null || typeof m == "boolean" || (Array.isArray(m) ? m.some(function(y) {
      me(y, v);
    }) : v.push(m)), v;
  }
  function Pe(m, v, y, E, N, P) {
    var q, G, Y;
    if (v.__d !== void 0) q = v.__d, v.__d = void 0;
    else if (y == null || N != P || N.parentNode == null) e: if (P == null || P.parentNode !== m) m.appendChild(N), q = null;
    else {
      for (G = P, Y = 0; (G = G.nextSibling) && Y < E.length; Y += 1) if (G == N) break e;
      m.insertBefore(N, P), q = P;
    }
    return q !== void 0 ? q : N.nextSibling;
  }
  function Oe(m) {
    var v, y, E;
    if (m.type == null || typeof m.type == "string") return m.__e;
    if (m.__k) {
      for (v = m.__k.length - 1; v >= 0; v--) if ((y = m.__k[v]) && (E = Oe(y))) return E;
    }
    return null;
  }
  function Ee(m, v, y) {
    v[0] === "-" ? m.setProperty(v, y ?? "") : m[v] = y == null ? "" : typeof y != "number" || C.test(v) ? y : y + "px";
  }
  function re(m, v, y, E, N) {
    var P;
    e: if (v === "style") if (typeof y == "string") m.style.cssText = y;
    else {
      if (typeof E == "string" && (m.style.cssText = E = ""), E) for (v in E) y && v in y || Ee(m.style, v, "");
      if (y) for (v in y) E && y[v] === E[v] || Ee(m.style, v, y[v]);
    }
    else if (v[0] === "o" && v[1] === "n") P = v !== (v = v.replace(/Capture$/, "")), v = v.toLowerCase() in m ? v.toLowerCase().slice(2) : v.slice(2), m.l || (m.l = {}), m.l[v + P] = y, y ? E || m.addEventListener(v, P ? ue : se, P) : m.removeEventListener(v, P ? ue : se, P);
    else if (v !== "dangerouslySetInnerHTML") {
      if (N) v = v.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (v !== "width" && v !== "height" && v !== "href" && v !== "list" && v !== "form" && v !== "tabIndex" && v !== "download" && v in m) try {
        m[v] = y ?? "";
        break e;
      } catch {
      }
      typeof y == "function" || (y == null || y === !1 && v.indexOf("-") == -1 ? m.removeAttribute(v) : m.setAttribute(v, y));
    }
  }
  function se(m) {
    return this.l[m.type + !1](a.event ? a.event(m) : m);
  }
  function ue(m) {
    return this.l[m.type + !0](a.event ? a.event(m) : m);
  }
  function Ae(m, v, y, E, N, P, q, G, Y) {
    var ve, w, _e, J, W, j, ye, B, $, Te, Ye, pe, xt, Xe, R, V = v.type;
    if (v.constructor !== void 0) return null;
    y.__h != null && (Y = y.__h, G = v.__e = y.__e, v.__h = null, P = [G]), (ve = a.__b) && ve(v);
    try {
      e: if (typeof V == "function") {
        if (B = v.props, $ = (ve = V.contextType) && E[ve.__c], Te = ve ? $ ? $.props.value : ve.__ : E, y.__c ? ye = (w = v.__c = y.__c).__ = w.__E : ("prototype" in V && V.prototype.render ? v.__c = w = new V(B, Te) : (v.__c = w = new U(B, Te), w.constructor = V, w.render = K), $ && $.sub(w), w.props = B, w.state || (w.state = {}), w.context = Te, w.__n = E, _e = w.__d = !0, w.__h = [], w._sb = []), w.__s == null && (w.__s = w.state), V.getDerivedStateFromProps != null && (w.__s == w.state && (w.__s = A({}, w.__s)), A(w.__s, V.getDerivedStateFromProps(B, w.__s))), J = w.props, W = w.state, w.__v = v, _e) V.getDerivedStateFromProps == null && w.componentWillMount != null && w.componentWillMount(), w.componentDidMount != null && w.__h.push(w.componentDidMount);
        else {
          if (V.getDerivedStateFromProps == null && B !== J && w.componentWillReceiveProps != null && w.componentWillReceiveProps(B, Te), !w.__e && w.shouldComponentUpdate != null && w.shouldComponentUpdate(B, w.__s, Te) === !1 || v.__v === y.__v) {
            for (v.__v !== y.__v && (w.props = B, w.state = w.__s, w.__d = !1), w.__e = !1, v.__e = y.__e, v.__k = y.__k, v.__k.forEach(function($e) {
              $e && ($e.__ = v);
            }), Ye = 0; Ye < w._sb.length; Ye++) w.__h.push(w._sb[Ye]);
            w._sb = [], w.__h.length && q.push(w);
            break e;
          }
          w.componentWillUpdate != null && w.componentWillUpdate(B, w.__s, Te), w.componentDidUpdate != null && w.__h.push(function() {
            w.componentDidUpdate(J, W, j);
          });
        }
        if (w.context = Te, w.props = B, w.__P = m, pe = a.__r, xt = 0, "prototype" in V && V.prototype.render) {
          for (w.state = w.__s, w.__d = !1, pe && pe(v), ve = w.render(w.props, w.state, w.context), Xe = 0; Xe < w._sb.length; Xe++) w.__h.push(w._sb[Xe]);
          w._sb = [];
        } else do
          w.__d = !1, pe && pe(v), ve = w.render(w.props, w.state, w.context), w.state = w.__s;
        while (w.__d && ++xt < 25);
        w.state = w.__s, w.getChildContext != null && (E = A(A({}, E), w.getChildContext())), _e || w.getSnapshotBeforeUpdate == null || (j = w.getSnapshotBeforeUpdate(J, W)), R = ve != null && ve.type === M && ve.key == null ? ve.props.children : ve, H(m, Array.isArray(R) ? R : [R], v, y, E, N, P, q, G, Y), w.base = v.__e, v.__h = null, w.__h.length && q.push(w), ye && (w.__E = w.__ = null), w.__e = !1;
      } else P == null && v.__v === y.__v ? (v.__k = y.__k, v.__e = y.__e) : v.__e = h(y.__e, v, y, E, N, P, q, Y);
      (ve = a.diffed) && ve(v);
    } catch ($e) {
      v.__v = null, (Y || P != null) && (v.__e = G, v.__h = !!Y, P[P.indexOf(G)] = null), a.__e($e, v, y);
    }
  }
  function k(m, v) {
    a.__c && a.__c(v, m), m.some(function(y) {
      try {
        m = y.__h, y.__h = [], m.some(function(E) {
          E.call(y);
        });
      } catch (E) {
        a.__e(E, y.__v);
      }
    });
  }
  function h(m, v, y, E, N, P, q, G) {
    var Y, ve, w, _e = y.props, J = v.props, W = v.type, j = 0;
    if (W === "svg" && (N = !0), P != null) {
      for (; j < P.length; j++) if ((Y = P[j]) && "setAttribute" in Y == !!W && (W ? Y.localName === W : Y.nodeType === 3)) {
        m = Y, P[j] = null;
        break;
      }
    }
    if (m == null) {
      if (W === null) return document.createTextNode(J);
      m = N ? document.createElementNS("http://www.w3.org/2000/svg", W) : document.createElement(W, J.is && J), P = null, G = !1;
    }
    if (W === null) _e === J || G && m.data === J || (m.data = J);
    else {
      if (P = P && n.call(m.childNodes), ve = (_e = y.props || g).dangerouslySetInnerHTML, w = J.dangerouslySetInnerHTML, !G) {
        if (P != null) for (_e = {}, j = 0; j < m.attributes.length; j++) _e[m.attributes[j].name] = m.attributes[j].value;
        (w || ve) && (w && (ve && w.__html == ve.__html || w.__html === m.innerHTML) || (m.innerHTML = w && w.__html || ""));
      }
      if (function(ye, B, $, Te, Ye) {
        var pe;
        for (pe in $) pe === "children" || pe === "key" || pe in B || re(ye, pe, null, $[pe], Te);
        for (pe in B) Ye && typeof B[pe] != "function" || pe === "children" || pe === "key" || pe === "value" || pe === "checked" || $[pe] === B[pe] || re(ye, pe, B[pe], $[pe], Te);
      }(m, J, _e, N, G), w) v.__k = [];
      else if (j = v.props.children, H(m, Array.isArray(j) ? j : [j], v, y, E, N && W !== "foreignObject", P, q, P ? P[0] : y.__k && ie(y, 0), G), P != null) for (j = P.length; j--; ) P[j] != null && S(P[j]);
      G || ("value" in J && (j = J.value) !== void 0 && (j !== m.value || W === "progress" && !j || W === "option" && j !== _e.value) && re(m, "value", j, _e.value, !1), "checked" in J && (j = J.checked) !== void 0 && j !== m.checked && re(m, "checked", j, _e.checked, !1));
    }
    return m;
  }
  function b(m, v, y) {
    try {
      typeof m == "function" ? m(v) : m.current = v;
    } catch (E) {
      a.__e(E, y);
    }
  }
  function T(m, v, y) {
    var E, N;
    if (a.unmount && a.unmount(m), (E = m.ref) && (E.current && E.current !== m.__e || b(E, null, v)), (E = m.__c) != null) {
      if (E.componentWillUnmount) try {
        E.componentWillUnmount();
      } catch (P) {
        a.__e(P, v);
      }
      E.base = E.__P = null, m.__c = void 0;
    }
    if (E = m.__k) for (N = 0; N < E.length; N++) E[N] && T(E[N], v, y || typeof m.type != "function");
    y || m.__e == null || S(m.__e), m.__ = m.__e = m.__d = void 0;
  }
  function K(m, v, y) {
    return this.constructor(m, y);
  }
  function he(m, v, y) {
    var E, N, P;
    a.__ && a.__(m, v), N = (E = typeof y == "function") ? null : y && y.__k || v.__k, P = [], Ae(v, m = (!E && y || v).__k = x(M, null, [m]), N || g, g, v.ownerSVGElement !== void 0, !E && y ? [y] : N ? null : v.firstChild ? n.call(v.childNodes) : null, P, !E && y ? y : N ? N.__e : v.firstChild, E), k(P, m);
  }
  function Me(m, v) {
    he(m, v, Me);
  }
  function Ue(m, v, y) {
    var E, N, P, q = A({}, m.props);
    for (P in v) P == "key" ? E = v[P] : P == "ref" ? N = v[P] : q[P] = v[P];
    return arguments.length > 2 && (q.children = arguments.length > 3 ? n.call(arguments, 2) : y), I(m.type, q, E || m.key, N || m.ref, null);
  }
  function He(m, v) {
    var y = { __c: v = "__cC" + p++, __: m, Consumer: function(E, N) {
      return E.children(N);
    }, Provider: function(E) {
      var N, P;
      return this.getChildContext || (N = [], (P = {})[v] = this, this.getChildContext = function() {
        return P;
      }, this.shouldComponentUpdate = function(q) {
        this.props.value !== q.value && N.some(function(G) {
          G.__e = !0, ae(G);
        });
      }, this.sub = function(q) {
        N.push(q);
        var G = q.componentWillUnmount;
        q.componentWillUnmount = function() {
          N.splice(N.indexOf(q), 1), G && G.call(q);
        };
      }), E.children;
    } };
    return y.Provider.__ = y.Consumer.contextType = y;
  }
  n = f.slice, a = { __e: function(m, v, y, E) {
    for (var N, P, q; v = v.__; ) if ((N = v.__c) && !N.__) try {
      if ((P = N.constructor) && P.getDerivedStateFromError != null && (N.setState(P.getDerivedStateFromError(m)), q = N.__d), N.componentDidCatch != null && (N.componentDidCatch(m, E || {}), q = N.__d), q) return N.__E = N;
    } catch (G) {
      m = G;
    }
    throw m;
  } }, r = 0, c = function(m) {
    return m != null && m.constructor === void 0;
  }, U.prototype.setState = function(m, v) {
    var y;
    y = this.__s != null && this.__s !== this.state ? this.__s : this.__s = A({}, this.state), typeof m == "function" && (m = m(A({}, y), this.props)), m && A(y, m), m != null && this.__v && (v && this._sb.push(v), ae(this));
  }, U.prototype.forceUpdate = function(m) {
    this.__v && (this.__e = !0, m && this.__h.push(m), ae(this));
  }, U.prototype.render = M, l = [], s = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, d = function(m, v) {
    return m.__v.__b - v.__v.__b;
  }, be.__r = 0, p = 0;
}, 78: (o, t, e) => {
  e.r(t), e.d(t, { useCallback: () => ae, useContext: () => be, useDebugValue: () => H, useEffect: () => D, useErrorBoundary: () => F, useId: () => me, useImperativeHandle: () => ie, useLayoutEffect: () => M, useMemo: () => ge, useReducer: () => I, useRef: () => U, useState: () => x });
  var n, a, r, c, l = e(616), u = 0, s = [], d = [], p = l.options.__b, g = l.options.__r, f = l.options.diffed, C = l.options.__c, A = l.options.unmount;
  function S(k, h) {
    l.options.__h && l.options.__h(a, k, u || h), u = 0;
    var b = a.__H || (a.__H = { __: [], __h: [] });
    return k >= b.__.length && b.__.push({ __V: d }), b.__[k];
  }
  function x(k) {
    return u = 1, I(Ae, k);
  }
  function I(k, h, b) {
    var T = S(n++, 2);
    if (T.t = k, !T.__c && (T.__ = [b ? b(h) : Ae(void 0, h), function(Ue) {
      var He = T.__N ? T.__N[0] : T.__[0], m = T.t(He, Ue);
      He !== m && (T.__N = [m, T.__[1]], T.__c.setState({}));
    }], T.__c = a, !a.u)) {
      var K = function(Ue, He, m) {
        if (!T.__c.__H) return !0;
        var v = T.__c.__H.__.filter(function(E) {
          return E.__c;
        });
        if (v.every(function(E) {
          return !E.__N;
        })) return !he || he.call(this, Ue, He, m);
        var y = !1;
        return v.forEach(function(E) {
          if (E.__N) {
            var N = E.__[0];
            E.__ = E.__N, E.__N = void 0, N !== E.__[0] && (y = !0);
          }
        }), !(!y && T.__c.props === Ue) && (!he || he.call(this, Ue, He, m));
      };
      a.u = !0;
      var he = a.shouldComponentUpdate, Me = a.componentWillUpdate;
      a.componentWillUpdate = function(Ue, He, m) {
        if (this.__e) {
          var v = he;
          he = void 0, K(Ue, He, m), he = v;
        }
        Me && Me.call(this, Ue, He, m);
      }, a.shouldComponentUpdate = K;
    }
    return T.__N || T.__;
  }
  function D(k, h) {
    var b = S(n++, 3);
    !l.options.__s && ue(b.__H, h) && (b.__ = k, b.i = h, a.__H.__h.push(b));
  }
  function M(k, h) {
    var b = S(n++, 4);
    !l.options.__s && ue(b.__H, h) && (b.__ = k, b.i = h, a.__h.push(b));
  }
  function U(k) {
    return u = 5, ge(function() {
      return { current: k };
    }, []);
  }
  function ie(k, h, b) {
    u = 6, M(function() {
      return typeof k == "function" ? (k(h()), function() {
        return k(null);
      }) : k ? (k.current = h(), function() {
        return k.current = null;
      }) : void 0;
    }, b == null ? b : b.concat(k));
  }
  function ge(k, h) {
    var b = S(n++, 7);
    return ue(b.__H, h) ? (b.__V = k(), b.i = h, b.__h = k, b.__V) : b.__;
  }
  function ae(k, h) {
    return u = 8, ge(function() {
      return k;
    }, h);
  }
  function be(k) {
    var h = a.context[k.__c], b = S(n++, 9);
    return b.c = k, h ? (b.__ == null && (b.__ = !0, h.sub(a)), h.props.value) : k.__;
  }
  function H(k, h) {
    l.options.useDebugValue && l.options.useDebugValue(h ? h(k) : k);
  }
  function F(k) {
    var h = S(n++, 10), b = x();
    return h.__ = k, a.componentDidCatch || (a.componentDidCatch = function(T, K) {
      h.__ && h.__(T, K), b[1](T);
    }), [b[0], function() {
      b[1](void 0);
    }];
  }
  function me() {
    var k = S(n++, 11);
    if (!k.__) {
      for (var h = a.__v; h !== null && !h.__m && h.__ !== null; ) h = h.__;
      var b = h.__m || (h.__m = [0, 0]);
      k.__ = "P" + b[0] + "-" + b[1]++;
    }
    return k.__;
  }
  function Pe() {
    for (var k; k = s.shift(); ) if (k.__P && k.__H) try {
      k.__H.__h.forEach(re), k.__H.__h.forEach(se), k.__H.__h = [];
    } catch (h) {
      k.__H.__h = [], l.options.__e(h, k.__v);
    }
  }
  l.options.__b = function(k) {
    a = null, p && p(k);
  }, l.options.__r = function(k) {
    g && g(k), n = 0;
    var h = (a = k.__c).__H;
    h && (r === a ? (h.__h = [], a.__h = [], h.__.forEach(function(b) {
      b.__N && (b.__ = b.__N), b.__V = d, b.__N = b.i = void 0;
    })) : (h.__h.forEach(re), h.__h.forEach(se), h.__h = [])), r = a;
  }, l.options.diffed = function(k) {
    f && f(k);
    var h = k.__c;
    h && h.__H && (h.__H.__h.length && (s.push(h) !== 1 && c === l.options.requestAnimationFrame || ((c = l.options.requestAnimationFrame) || Ee)(Pe)), h.__H.__.forEach(function(b) {
      b.i && (b.__H = b.i), b.__V !== d && (b.__ = b.__V), b.i = void 0, b.__V = d;
    })), r = a = null;
  }, l.options.__c = function(k, h) {
    h.some(function(b) {
      try {
        b.__h.forEach(re), b.__h = b.__h.filter(function(T) {
          return !T.__ || se(T);
        });
      } catch (T) {
        h.some(function(K) {
          K.__h && (K.__h = []);
        }), h = [], l.options.__e(T, b.__v);
      }
    }), C && C(k, h);
  }, l.options.unmount = function(k) {
    A && A(k);
    var h, b = k.__c;
    b && b.__H && (b.__H.__.forEach(function(T) {
      try {
        re(T);
      } catch (K) {
        h = K;
      }
    }), b.__H = void 0, h && l.options.__e(h, b.__v));
  };
  var Oe = typeof requestAnimationFrame == "function";
  function Ee(k) {
    var h, b = function() {
      clearTimeout(T), Oe && cancelAnimationFrame(h), setTimeout(k);
    }, T = setTimeout(b, 100);
    Oe && (h = requestAnimationFrame(b));
  }
  function re(k) {
    var h = a, b = k.__c;
    typeof b == "function" && (k.__c = void 0, b()), a = h;
  }
  function se(k) {
    var h = a;
    k.__c = k.__(), a = h;
  }
  function ue(k, h) {
    return !k || k.length !== h.length || h.some(function(b, T) {
      return b !== k[T];
    });
  }
  function Ae(k, h) {
    return typeof h == "function" ? h(k) : h;
  }
}, 292: (o) => {
  var t = [];
  function e(r) {
    for (var c = -1, l = 0; l < t.length; l++) if (t[l].identifier === r) {
      c = l;
      break;
    }
    return c;
  }
  function n(r, c) {
    for (var l = {}, u = [], s = 0; s < r.length; s++) {
      var d = r[s], p = c.base ? d[0] + c.base : d[0], g = l[p] || 0, f = "".concat(p, " ").concat(g);
      l[p] = g + 1;
      var C = e(f), A = { css: d[1], media: d[2], sourceMap: d[3], supports: d[4], layer: d[5] };
      if (C !== -1) t[C].references++, t[C].updater(A);
      else {
        var S = a(A, c);
        c.byIndex = s, t.splice(s, 0, { identifier: f, updater: S, references: 1 });
      }
      u.push(f);
    }
    return u;
  }
  function a(r, c) {
    var l = c.domAPI(c);
    return l.update(r), function(u) {
      if (u) {
        if (u.css === r.css && u.media === r.media && u.sourceMap === r.sourceMap && u.supports === r.supports && u.layer === r.layer) return;
        l.update(r = u);
      } else l.remove();
    };
  }
  o.exports = function(r, c) {
    var l = n(r = r || [], c = c || {});
    return function(u) {
      u = u || [];
      for (var s = 0; s < l.length; s++) {
        var d = e(l[s]);
        t[d].references--;
      }
      for (var p = n(u, c), g = 0; g < l.length; g++) {
        var f = e(l[g]);
        t[f].references === 0 && (t[f].updater(), t.splice(f, 1));
      }
      l = p;
    };
  };
}, 88: (o) => {
  o.exports = function(t) {
    var e = document.createElement("style");
    return t.setAttributes(e, t.attributes), t.insert(e, t.options), e;
  };
}, 884: (o, t, e) => {
  o.exports = function(n) {
    var a = e.nc;
    a && n.setAttribute("nonce", a);
  };
}, 360: (o) => {
  var t, e = (t = [], function(r, c) {
    return t[r] = c, t.filter(Boolean).join(`
`);
  });
  function n(r, c, l, u) {
    var s;
    if (l) s = "";
    else {
      s = "", u.supports && (s += "@supports (".concat(u.supports, ") {")), u.media && (s += "@media ".concat(u.media, " {"));
      var d = u.layer !== void 0;
      d && (s += "@layer".concat(u.layer.length > 0 ? " ".concat(u.layer) : "", " {")), s += u.css, d && (s += "}"), u.media && (s += "}"), u.supports && (s += "}");
    }
    if (r.styleSheet) r.styleSheet.cssText = e(c, s);
    else {
      var p = document.createTextNode(s), g = r.childNodes;
      g[c] && r.removeChild(g[c]), g.length ? r.insertBefore(p, g[c]) : r.appendChild(p);
    }
  }
  var a = { singleton: null, singletonCounter: 0 };
  o.exports = function(r) {
    if (typeof document > "u") return { update: function() {
    }, remove: function() {
    } };
    var c = a.singletonCounter++, l = a.singleton || (a.singleton = r.insertStyleElement(r));
    return { update: function(u) {
      n(l, c, !1, u);
    }, remove: function(u) {
      n(l, c, !0, u);
    } };
  };
}, 6: (o, t, e) => {
  e.d(t, { en: () => n });
  const n = { headlines: { error: "An error has occurred", loginEmail: "Sign in or create account", loginEmailNoSignup: "Sign in", loginFinished: "Login successful", loginPasscode: "Enter passcode", loginPassword: "Enter password", registerAuthenticator: "Create a passkey", registerConfirm: "Create account?", registerPassword: "Set new password", otpSetUp: "Set up authenticator app", profileEmails: "Emails", profilePassword: "Password", profilePasskeys: "Passkeys", isPrimaryEmail: "Primary email address", setPrimaryEmail: "Set primary email address", createEmail: "Enter a new email", createUsername: "Enter a new username", emailVerified: "Verified", emailUnverified: "Unverified", emailDelete: "Delete", renamePasskey: "Rename passkey", deletePasskey: "Delete passkey", lastUsedAt: "Last used at", createdAt: "Created at", connectedAccounts: "Connected accounts", deleteAccount: "Delete account", accountNotFound: "Account not found", signIn: "Sign in", signUp: "Create account", selectLoginMethod: "Select login method", setupLoginMethod: "Set up login method", lastUsed: "Last seen", ipAddress: "IP address", revokeSession: "Revoke session", profileSessions: "Sessions", mfaSetUp: "Set up MFA", securityKeySetUp: "Add security key", securityKeyLogin: "Security key", otpLogin: "Authentication code", renameSecurityKey: "Rename security key", deleteSecurityKey: "Delete security key", securityKeys: "Security keys", authenticatorApp: "Authenticator app", authenticatorAppAlreadySetUp: "Authenticator app is set up", authenticatorAppNotSetUp: "Set up authenticator app", trustDevice: "Trust this browser?" }, texts: { enterPasscode: 'Enter the passcode that was sent to "{emailAddress}".', enterPasscodeNoEmail: "Enter the passcode that was sent to your primary email address.", setupPasskey: "Sign in to your account easily and securely with a passkey. Note: Your biometric data is only stored on your devices and will never be shared with anyone.", createAccount: 'No account exists for "{emailAddress}". Do you want to create a new account?', otpEnterVerificationCode: "Enter the one-time password (OTP) obtained from your authenticator app below:", otpScanQRCode: "Scan the QR code using your authenticator app (such as Google Authenticator or any other TOTP app). Alternatively, you can manually enter the OTP secret key into the app.", otpSecretKey: "OTP secret key", passwordFormatHint: "Must be between {minLength} and {maxLength} characters long.", securityKeySetUp: "Use a dedicated security key via USB, Bluetooth, or NFC, or your mobile phone. Connect or activate your security key, then click the button below and follow the prompts to complete the registration.", setPrimaryEmail: "Set this email address to be used for contacting you.", isPrimaryEmail: "This email address will be used to contact you if necessary.", emailVerified: "This email address has been verified.", emailUnverified: "This email address has not been verified.", emailDelete: "If you delete this email address, it can no longer be used to sign in.", renamePasskey: "Set a name for the passkey.", deletePasskey: "Delete this passkey from your account.", deleteAccount: "Are you sure you want to delete this account? All data will be deleted immediately and cannot be recovered.", noAccountExists: 'No account exists for "{emailAddress}".', selectLoginMethodForFutureLogins: "Select one of the following login methods to use for future logins.", howDoYouWantToLogin: "How do you want to login?", mfaSetUp: "Protect your account with Multi-Factor Authentication (MFA). MFA adds an additional step to your login process, ensuring that even if your password or email account is compromised, your account stays secure.", securityKeyLogin: "Connect or activate your security key, then click the button below. Once ready, use it via USB, NFC, your mobile phone. Follow the prompts to complete the login process.", otpLogin: "Open your authenticator app to obtain the one-time password (OTP). Enter the code in the field below to complete your login.", renameSecurityKey: "Set a name for the security key.", deleteSecurityKey: "Delete this security key from your account.", authenticatorAppAlreadySetUp: "Your account is secured with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", authenticatorAppNotSetUp: "Secure your account with an authenticator app that generates time-based one-time passwords (TOTP) for multi-factor authentication.", trustDevice: "If you trust this browser, you won’t need to enter your OTP (One-Time-Password) or use your security key for multi-factor authentication (MFA) the next time you log in." }, labels: { or: "or", no: "no", yes: "yes", email: "Email", continue: "Continue", copied: "copied", skip: "Skip", save: "Save", password: "Password", passkey: "Passkey", passcode: "Passcode", signInPassword: "Sign in with a password", signInPasscode: "Sign in with a passcode", forgotYourPassword: "Forgot your password?", back: "Back", signInPasskey: "Sign in with a passkey", registerAuthenticator: "Create a passkey", signIn: "Sign in", signUp: "Create account", sendNewPasscode: "Send new code", passwordRetryAfter: "Retry in {passwordRetryAfter}", passcodeResendAfter: "Request a new code in {passcodeResendAfter}", unverifiedEmail: "unverified", primaryEmail: "primary", setAsPrimaryEmail: "Set as primary", verify: "Verify", delete: "Delete", newEmailAddress: "New email address", newPassword: "New password", rename: "Rename", newPasskeyName: "New passkey name", addEmail: "Add email", createPasskey: "Create a passkey", webauthnUnsupported: "Passkeys are not supported by your browser", signInWith: "Sign in with {provider}", deleteAccount: "Yes, delete this account.", emailOrUsername: "Email or username", username: "Username", optional: "optional", dontHaveAnAccount: "Don't have an account?", alreadyHaveAnAccount: "Already have an account?", changeUsername: "Change username", setUsername: "Set username", changePassword: "Change password", setPassword: "Set password", revoke: "Revoke", currentSession: "Current session", authenticatorApp: "Authenticator app", securityKey: "Security key", securityKeyUse: "Use security key", newSecurityKeyName: "New security key name", createSecurityKey: "Add a security key", authenticatorAppManage: "Manage authenticator app", authenticatorAppAdd: "Set up", configured: "configured", useAnotherMethod: "Use another method", lastUsed: "Last used", trustDevice: "Trust this browser", staySignedIn: "Stay signed in" }, errors: { somethingWentWrong: "A technical error has occurred. Please try again later.", requestTimeout: "The request timed out.", invalidPassword: "Wrong email or password.", invalidPasscode: "The passcode provided was not correct.", passcodeAttemptsReached: "The passcode was entered incorrectly too many times. Please request a new code.", tooManyRequests: "Too many requests have been made. Please wait to repeat the requested operation.", unauthorized: "Your session has expired. Please log in again.", invalidWebauthnCredential: "This passkey cannot be used anymore.", passcodeExpired: "The passcode has expired. Please request a new one.", userVerification: "User verification required. Please ensure your authenticator device is protected with a PIN or biometric.", emailAddressAlreadyExistsError: "The email address already exists.", maxNumOfEmailAddressesReached: "No further email addresses can be added.", thirdPartyAccessDenied: "Access denied. The request was cancelled by the user or the provider has denied access for other reasons.", thirdPartyMultipleAccounts: "Cannot identify account. The email address is used by multiple accounts.", thirdPartyUnverifiedEmail: "Email verification required. Please verify the used email address with your provider.", signupDisabled: "Account registration is disabled.", handlerNotFoundError: "The current step in your process is not supported by this application version. Please try again later or contact support if the issue persists." }, flowErrors: { technical_error: "A technical error has occurred. Please try again later.", flow_expired_error: "The session has expired, please click the button to restart.", value_invalid_error: "The entered value is invalid.", passcode_invalid: "The passcode provided was not correct.", passkey_invalid: "This passkey cannot be used anymore", passcode_max_attempts_reached: "The passcode was entered incorrectly too many times. Please request a new code.", rate_limit_exceeded: "Too many requests have been made. Please wait to repeat the requested operation.", unknown_username_error: "The username is unknown.", unknown_email_error: "The email address is unknown.", username_already_exists: "The username is already taken.", invalid_username_error: "The username must contain only letters, numbers, and underscores.", email_already_exists: "The email is already taken.", not_found: "The requested resource was not found.", operation_not_permitted_error: "The operation is not permitted.", flow_discontinuity_error: "The process cannot be continued due to user settings or the provider's configuration.", form_data_invalid_error: "The submitted form data contains errors.", unauthorized: "Your session has expired. Please log in again.", value_missing_error: "The value is missing.", value_too_long_error: "Value is too long.", value_too_short_error: "The value is too short.", webauthn_credential_invalid_mfa_only: "This credential can be used as a second factor security key only.", webauthn_credential_already_exists: "The request either timed out, was canceled or the device is already registered. Please try again or try using another device.", platform_authenticator_required: "Your account is configured to use platform authenticators, but your current device or browser does not support this feature. Please try again with a compatible device or browser." } };
} }, Hn = {};
function X(o) {
  var t = Hn[o];
  if (t !== void 0) return t.exports;
  var e = Hn[o] = { id: o, exports: {} };
  return To[o].call(e.exports, e, e.exports, X), e.exports;
}
X.n = (o) => {
  var t = o && o.__esModule ? () => o.default : () => o;
  return X.d(t, { a: t }), t;
}, X.d = (o, t) => {
  for (var e in t) X.o(t, e) && !X.o(o, e) && Object.defineProperty(o, e, { enumerable: !0, get: t[e] });
}, X.o = (o, t) => Object.prototype.hasOwnProperty.call(o, t), X.r = (o) => {
  typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(o, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(o, "__esModule", { value: !0 });
}, X.nc = void 0;
var oe = {};
X.d(oe, { fK: () => Jt, tJ: () => yo, Z7: () => Gt, Q9: () => So, Lv: () => wo, qQ: () => Yt, I4: () => Io, O8: () => we, ku: () => kn, ls: () => yn, bO: () => wn, yv: () => Xt, AT: () => Sn, m_: () => yt, KG: () => xn, DH: () => Qt, kf: () => En, oY: () => je, xg: () => Co, Wg: () => ze, J: () => Oo, AC: () => Cn, D_: () => Be, jx: () => xo, nX: () => On, Nx: () => bn, Sd: () => tt, kz: () => Oa, fX: () => An, qA: () => In, tz: () => Pn, gN: () => jn });
var vn = {};
X.r(vn), X.d(vn, { apple: () => Si, checkmark: () => Ci, copy: () => Oi, customProvider: () => Ai, discord: () => Ii, exclamation: () => ji, facebook: () => Pi, github: () => Ei, google: () => Di, linkedin: () => Li, mail: () => Ti, microsoft: () => Ni, passkey: () => Mi, password: () => Ui, qrCodeScanner: () => Hi, securityKey: () => Wi, spinner: () => Ri });
var O = X(616), No = 0;
function i(o, t, e, n, a, r) {
  var c, l, u = {};
  for (l in t) l == "ref" ? c = t[l] : u[l] = t[l];
  var s = { type: o, props: u, key: e, ref: c, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: --No, __source: a, __self: r };
  if (typeof o == "function" && (c = o.defaultProps)) for (l in c) u[l] === void 0 && (u[l] = c[l]);
  return O.options.vnode && O.options.vnode(s), s;
}
function Bt() {
  return Bt = Object.assign ? Object.assign.bind() : function(o) {
    for (var t = 1; t < arguments.length; t++) {
      var e = arguments[t];
      for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (o[n] = e[n]);
    }
    return o;
  }, Bt.apply(this, arguments);
}
var Mo = ["context", "children"];
function Uo(o) {
  this.getChildContext = function() {
    return o.context;
  };
  var t = o.children, e = function(n, a) {
    if (n == null) return {};
    var r, c, l = {}, u = Object.keys(n);
    for (c = 0; c < u.length; c++) a.indexOf(r = u[c]) >= 0 || (l[r] = n[r]);
    return l;
  }(o, Mo);
  return (0, O.cloneElement)(t, e);
}
function Ho() {
  var o = new CustomEvent("_preact", { detail: {}, bubbles: !0, cancelable: !0 });
  this.dispatchEvent(o), this._vdom = (0, O.h)(Uo, Bt({}, this._props, { context: o.detail.context }), lo(this, this._vdomComponent)), (this.hasAttribute("hydrate") ? O.hydrate : O.render)(this._vdom, this._root);
}
function so(o) {
  return o.replace(/-(\w)/g, function(t, e) {
    return e ? e.toUpperCase() : "";
  });
}
function Wo(o, t, e) {
  if (this._vdom) {
    var n = {};
    n[o] = e = e ?? void 0, n[so(o)] = e, this._vdom = (0, O.cloneElement)(this._vdom, n), (0, O.render)(this._vdom, this._root);
  }
}
function Ro() {
  (0, O.render)(this._vdom = null, this._root);
}
function Wn(o, t) {
  var e = this;
  return (0, O.h)("slot", Bt({}, o, { ref: function(n) {
    n ? (e.ref = n, e._listener || (e._listener = function(a) {
      a.stopPropagation(), a.detail.context = t;
    }, n.addEventListener("_preact", e._listener))) : e.ref.removeEventListener("_preact", e._listener);
  } }));
}
function lo(o, t) {
  if (o.nodeType === 3) return o.data;
  if (o.nodeType !== 1) return null;
  var e = [], n = {}, a = 0, r = o.attributes, c = o.childNodes;
  for (a = r.length; a--; ) r[a].name !== "slot" && (n[r[a].name] = r[a].value, n[so(r[a].name)] = r[a].value);
  for (a = c.length; a--; ) {
    var l = lo(c[a], null), u = c[a].slot;
    u ? n[u] = (0, O.h)(Wn, { name: u }, l) : e[a] = l;
  }
  var s = t ? (0, O.h)(Wn, null, e) : e;
  return (0, O.h)(t || o.nodeName.toLowerCase(), n, s);
}
var Z = X(7), _ = X(78);
function co(o, t) {
  for (var e in t) o[e] = t[e];
  return o;
}
function Rn(o, t) {
  for (var e in o) if (e !== "__source" && !(e in t)) return !0;
  for (var n in t) if (n !== "__source" && o[n] !== t[n]) return !0;
  return !1;
}
function qn(o) {
  this.props = o;
}
(qn.prototype = new O.Component()).isPureReactComponent = !0, qn.prototype.shouldComponentUpdate = function(o, t) {
  return Rn(this.props, o) || Rn(this.state, t);
};
var Fn = O.options.__b;
O.options.__b = function(o) {
  o.type && o.type.__f && o.ref && (o.props.ref = o.ref, o.ref = null), Fn && Fn(o);
};
var qo = typeof Symbol < "u" && Symbol.for && Symbol.for("react.forward_ref") || 3911, Fo = (O.toChildArray, O.options.__e);
O.options.__e = function(o, t, e, n) {
  if (o.then) {
    for (var a, r = t; r = r.__; ) if ((a = r.__c) && a.__c) return t.__e == null && (t.__e = e.__e, t.__k = e.__k), a.__c(o, t);
  }
  Fo(o, t, e, n);
};
var zn = O.options.unmount;
function uo(o, t, e) {
  return o && (o.__c && o.__c.__H && (o.__c.__H.__.forEach(function(n) {
    typeof n.__c == "function" && n.__c();
  }), o.__c.__H = null), (o = co({}, o)).__c != null && (o.__c.__P === e && (o.__c.__P = t), o.__c = null), o.__k = o.__k && o.__k.map(function(n) {
    return uo(n, t, e);
  })), o;
}
function ho(o, t, e) {
  return o && (o.__v = null, o.__k = o.__k && o.__k.map(function(n) {
    return ho(n, t, e);
  }), o.__c && o.__c.__P === t && (o.__e && e.insertBefore(o.__e, o.__d), o.__c.__e = !0, o.__c.__P = e)), o;
}
function an() {
  this.__u = 0, this.t = null, this.__b = null;
}
function po(o) {
  var t = o.__.__c;
  return t && t.__a && t.__a(o);
}
function St() {
  this.u = null, this.o = null;
}
O.options.unmount = function(o) {
  var t = o.__c;
  t && t.__R && t.__R(), t && o.__h === !0 && (o.type = null), zn && zn(o);
}, (an.prototype = new O.Component()).__c = function(o, t) {
  var e = t.__c, n = this;
  n.t == null && (n.t = []), n.t.push(e);
  var a = po(n.__v), r = !1, c = function() {
    r || (r = !0, e.__R = null, a ? a(l) : l());
  };
  e.__R = c;
  var l = function() {
    if (!--n.__u) {
      if (n.state.__a) {
        var s = n.state.__a;
        n.__v.__k[0] = ho(s, s.__c.__P, s.__c.__O);
      }
      var d;
      for (n.setState({ __a: n.__b = null }); d = n.t.pop(); ) d.forceUpdate();
    }
  }, u = t.__h === !0;
  n.__u++ || u || n.setState({ __a: n.__b = n.__v.__k[0] }), o.then(c, c);
}, an.prototype.componentWillUnmount = function() {
  this.t = [];
}, an.prototype.render = function(o, t) {
  if (this.__b) {
    if (this.__v.__k) {
      var e = document.createElement("div"), n = this.__v.__k[0].__c;
      this.__v.__k[0] = uo(this.__b, e, n.__O = n.__P);
    }
    this.__b = null;
  }
  var a = t.__a && (0, O.createElement)(O.Fragment, null, o.fallback);
  return a && (a.__h = null), [(0, O.createElement)(O.Fragment, null, t.__a ? null : o.children), a];
};
var $n = function(o, t, e) {
  if (++e[1] === e[0] && o.o.delete(t), o.props.revealOrder && (o.props.revealOrder[0] !== "t" || !o.o.size)) for (e = o.u; e; ) {
    for (; e.length > 3; ) e.pop()();
    if (e[1] < e[0]) break;
    o.u = e = e[2];
  }
};
(St.prototype = new O.Component()).__a = function(o) {
  var t = this, e = po(t.__v), n = t.o.get(o);
  return n[0]++, function(a) {
    var r = function() {
      t.props.revealOrder ? (n.push(a), $n(t, o, n)) : a();
    };
    e ? e(r) : r();
  };
}, St.prototype.render = function(o) {
  this.u = null, this.o = /* @__PURE__ */ new Map();
  var t = (0, O.toChildArray)(o.children);
  o.revealOrder && o.revealOrder[0] === "b" && t.reverse();
  for (var e = t.length; e--; ) this.o.set(t[e], this.u = [1, 0, this.u]);
  return o.children;
}, St.prototype.componentDidUpdate = St.prototype.componentDidMount = function() {
  var o = this;
  this.o.forEach(function(t, e) {
    $n(o, e, t);
  });
};
var zo = typeof Symbol < "u" && Symbol.for && Symbol.for("react.element") || 60103, $o = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, Ko = /^on(Ani|Tra|Tou|BeforeInp|Compo)/, Bo = /[A-Z0-9]/g, Vo = typeof document < "u", Zo = function(o) {
  return (typeof Symbol < "u" && typeof Symbol() == "symbol" ? /fil|che|rad/ : /fil|che|ra/).test(o);
};
O.Component.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(o) {
  Object.defineProperty(O.Component.prototype, o, { configurable: !0, get: function() {
    return this["UNSAFE_" + o];
  }, set: function(t) {
    Object.defineProperty(this, o, { configurable: !0, writable: !0, value: t });
  } });
});
var Kn = O.options.event;
function Jo() {
}
function Qo() {
  return this.cancelBubble;
}
function Yo() {
  return this.defaultPrevented;
}
O.options.event = function(o) {
  return Kn && (o = Kn(o)), o.persist = Jo, o.isPropagationStopped = Qo, o.isDefaultPrevented = Yo, o.nativeEvent = o;
};
var Bn = { configurable: !0, get: function() {
  return this.class;
} }, Vn = O.options.vnode;
O.options.vnode = function(o) {
  var t = o.type, e = o.props, n = e;
  if (typeof t == "string") {
    for (var a in n = {}, e) {
      var r = e[a];
      if (!(a === "value" && "defaultValue" in e && r == null || Vo && a === "children" && t === "noscript")) {
        var c = a.toLowerCase();
        a === "defaultValue" && "value" in e && e.value == null ? a = "value" : a === "download" && r === !0 ? r = "" : c === "ondoubleclick" ? a = "ondblclick" : c !== "onchange" || t !== "input" && t !== "textarea" || Zo(e.type) ? c === "onfocus" ? a = "onfocusin" : c === "onblur" ? a = "onfocusout" : Ko.test(a) ? a = c : t.indexOf("-") === -1 && $o.test(a) ? a = a.replace(Bo, "-$&").toLowerCase() : r === null && (r = void 0) : c = a = "oninput", c === "oninput" && n[a = c] && (a = "oninputCapture"), n[a] = r;
      }
    }
    t == "select" && n.multiple && Array.isArray(n.value) && (n.value = (0, O.toChildArray)(e.children).forEach(function(l) {
      l.props.selected = n.value.indexOf(l.props.value) != -1;
    })), t == "select" && n.defaultValue != null && (n.value = (0, O.toChildArray)(e.children).forEach(function(l) {
      l.props.selected = n.multiple ? n.defaultValue.indexOf(l.props.value) != -1 : n.defaultValue == l.props.value;
    })), o.props = n, e.class != e.className && (Bn.enumerable = "className" in e, e.className != null && (n.class = e.className), Object.defineProperty(n, "className", Bn));
  }
  o.$$typeof = zo, Vn && Vn(o);
};
var Zn = O.options.__r;
O.options.__r = function(o) {
  Zn && Zn(o), o.__c;
};
var Jn = O.options.diffed;
function fo(o) {
  const t = "==".slice(0, (4 - o.length % 4) % 4), e = o.replace(/-/g, "+").replace(/_/g, "/") + t, n = atob(e), a = new ArrayBuffer(n.length), r = new Uint8Array(a);
  for (let c = 0; c < n.length; c++) r[c] = n.charCodeAt(c);
  return a;
}
function mo(o) {
  const t = new Uint8Array(o);
  let e = "";
  for (const n of t) e += String.fromCharCode(n);
  return btoa(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
O.options.diffed = function(o) {
  Jn && Jn(o);
  var t = o.props, e = o.__e;
  e != null && o.type === "textarea" && "value" in t && t.value !== e.value && (e.value = t.value == null ? "" : t.value);
}, O.Fragment, _.useLayoutEffect, _.useState, _.useId, _.useReducer, _.useEffect, _.useLayoutEffect, _.useRef, _.useImperativeHandle, _.useMemo, _.useCallback, _.useContext, _.useDebugValue, O.createElement, O.createContext, O.createRef, O.Fragment, O.Component;
var le = "copy", qe = "convert";
function nt(o, t, e) {
  if (t === le) return e;
  if (t === qe) return o(e);
  if (t instanceof Array) return e.map((n) => nt(o, t[0], n));
  if (t instanceof Object) {
    const n = {};
    for (const [a, r] of Object.entries(t)) {
      if (r.derive) {
        const c = r.derive(e);
        c !== void 0 && (e[a] = c);
      }
      if (a in e) e[a] != null ? n[a] = nt(o, r.schema, e[a]) : n[a] = null;
      else if (r.required) throw new Error(`Missing key: ${a}`);
    }
    return n;
  }
}
function gn(o, t) {
  return { required: !0, schema: o, derive: t };
}
function fe(o) {
  return { required: !0, schema: o };
}
function ke(o) {
  return { required: !1, schema: o };
}
var vo = { type: fe(le), id: fe(qe), transports: ke(le) }, go = { appid: ke(le), appidExclude: ke(le), credProps: ke(le) }, _o = { appid: ke(le), appidExclude: ke(le), credProps: ke(le) }, Xo = { publicKey: fe({ rp: fe(le), user: fe({ id: fe(qe), name: fe(le), displayName: fe(le) }), challenge: fe(qe), pubKeyCredParams: fe(le), timeout: ke(le), excludeCredentials: ke([vo]), authenticatorSelection: ke(le), attestation: ke(le), extensions: ke(go) }), signal: ke(le) }, Go = { type: fe(le), id: fe(le), rawId: fe(qe), authenticatorAttachment: ke(le), response: fe({ clientDataJSON: fe(qe), attestationObject: fe(qe), transports: gn(le, (o) => {
  var t;
  return ((t = o.getTransports) == null ? void 0 : t.call(o)) || [];
}) }), clientExtensionResults: gn(_o, (o) => o.getClientExtensionResults()) }, ei = { mediation: ke(le), publicKey: fe({ challenge: fe(qe), timeout: ke(le), rpId: ke(le), allowCredentials: ke([vo]), userVerification: ke(le), extensions: ke(go) }), signal: ke(le) }, ti = { type: fe(le), id: fe(le), rawId: fe(qe), authenticatorAttachment: ke(le), response: fe({ clientDataJSON: fe(qe), authenticatorData: fe(qe), signature: fe(qe), userHandle: fe(qe) }), clientExtensionResults: gn(_o, (o) => o.getClientExtensionResults()) };
async function Qn(o) {
  const t = await navigator.credentials.create(function(e) {
    return nt(fo, Xo, e);
  }(o));
  return function(e) {
    return nt(mo, Go, e);
  }(t);
}
async function Yn(o) {
  const t = await navigator.credentials.get(function(e) {
    return nt(fo, ei, e);
  }(o));
  return function(e) {
    return nt(mo, ti, e);
  }(t);
}
function Vt() {
  return Vt = Object.assign ? Object.assign.bind() : function(o) {
    for (var t = 1; t < arguments.length; t++) {
      var e = arguments[t];
      for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (o[n] = e[n]);
    }
    return o;
  }, Vt.apply(this, arguments);
}
var ni = 0;
function bo(o) {
  return "__private_" + ni++ + "_" + o;
}
function rn(o, t) {
  if (!Object.prototype.hasOwnProperty.call(o, t)) throw new TypeError("attempted to use private field on non-instance");
  return o;
}
class we extends Error {
  constructor(t, e, n) {
    super(t), this.code = void 0, this.cause = void 0, this.code = e, this.cause = n, Object.setPrototypeOf(this, we.prototype);
  }
}
class je extends we {
  constructor(t) {
    super("Technical error", "somethingWentWrong", t), Object.setPrototypeOf(this, je.prototype);
  }
}
class Jt extends we {
  constructor(t, e) {
    super("Conflict error", "conflict", e), Object.setPrototypeOf(this, Jt.prototype);
  }
}
class Qt extends we {
  constructor(t) {
    super("Request timed out error", "requestTimeout", t), Object.setPrototypeOf(this, Qt.prototype);
  }
}
class bn extends we {
  constructor(t) {
    super("Request cancelled error", "requestCancelled", t), Object.setPrototypeOf(this, bn.prototype);
  }
}
class yn extends we {
  constructor(t) {
    super("Invalid password error", "invalidPassword", t), Object.setPrototypeOf(this, yn.prototype);
  }
}
class kn extends we {
  constructor(t) {
    super("Invalid Passcode error", "invalidPasscode", t), Object.setPrototypeOf(this, kn.prototype);
  }
}
class wn extends we {
  constructor(t) {
    super("Invalid WebAuthn credential error", "invalidWebauthnCredential", t), Object.setPrototypeOf(this, wn.prototype);
  }
}
class xn extends we {
  constructor(t) {
    super("Passcode expired error", "passcodeExpired", t), Object.setPrototypeOf(this, xn.prototype);
  }
}
class Sn extends we {
  constructor(t) {
    super("Maximum number of Passcode attempts reached error", "passcodeAttemptsReached", t), Object.setPrototypeOf(this, Sn.prototype);
  }
}
class yt extends we {
  constructor(t) {
    super("Not found error", "notFound", t), Object.setPrototypeOf(this, yt.prototype);
  }
}
class Cn extends we {
  constructor(t, e) {
    super("Too many requests error", "tooManyRequests", e), this.retryAfter = void 0, this.retryAfter = t, Object.setPrototypeOf(this, Cn.prototype);
  }
}
class Be extends we {
  constructor(t) {
    super("Unauthorized error", "unauthorized", t), Object.setPrototypeOf(this, Be.prototype);
  }
}
class Yt extends we {
  constructor(t) {
    super("Forbidden error", "forbidden", t), Object.setPrototypeOf(this, Yt.prototype);
  }
}
class On extends we {
  constructor(t) {
    super("User verification error", "userVerification", t), Object.setPrototypeOf(this, On.prototype);
  }
}
class Xt extends we {
  constructor(t) {
    super("Maximum number of email addresses reached error", "maxNumOfEmailAddressesReached", t), Object.setPrototypeOf(this, Xt.prototype);
  }
}
class Gt extends we {
  constructor(t) {
    super("The email address already exists", "emailAddressAlreadyExistsError", t), Object.setPrototypeOf(this, Gt.prototype);
  }
}
class ze extends we {
  constructor(t, e) {
    super("An error occurred during third party sign up/sign in", t, e), Object.setPrototypeOf(this, ze.prototype);
  }
}
const An = "hanko-session-created", In = "hanko-session-expired", jn = "hanko-user-logged-out", Pn = "hanko-user-deleted";
class yo extends CustomEvent {
  constructor(t, e) {
    super(t, { detail: e });
  }
}
class ko {
  constructor() {
    this._dispatchEvent = document.dispatchEvent.bind(document);
  }
  dispatch(t, e) {
    this._dispatchEvent(new yo(t, e));
  }
  dispatchSessionCreatedEvent(t) {
    this.dispatch(An, t);
  }
  dispatchSessionExpiredEvent() {
    this.dispatch(In, null);
  }
  dispatchUserLoggedOutEvent() {
    this.dispatch(jn, null);
  }
  dispatchUserDeletedEvent() {
    this.dispatch(Pn, null);
  }
}
function Ct(o) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t];
    for (var n in e) o[n] = e[n];
  }
  return o;
}
var sn = function o(t, e) {
  function n(a, r, c) {
    if (typeof document < "u") {
      typeof (c = Ct({}, e, c)).expires == "number" && (c.expires = new Date(Date.now() + 864e5 * c.expires)), c.expires && (c.expires = c.expires.toUTCString()), a = encodeURIComponent(a).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var l = "";
      for (var u in c) c[u] && (l += "; " + u, c[u] !== !0 && (l += "=" + c[u].split(";")[0]));
      return document.cookie = a + "=" + t.write(r, a) + l;
    }
  }
  return Object.create({ set: n, get: function(a) {
    if (typeof document < "u" && (!arguments.length || a)) {
      for (var r = document.cookie ? document.cookie.split("; ") : [], c = {}, l = 0; l < r.length; l++) {
        var u = r[l].split("="), s = u.slice(1).join("=");
        try {
          var d = decodeURIComponent(u[0]);
          if (c[d] = t.read(s, d), a === d) break;
        } catch {
        }
      }
      return a ? c[a] : c;
    }
  }, remove: function(a, r) {
    n(a, "", Ct({}, r, { expires: -1 }));
  }, withAttributes: function(a) {
    return o(this.converter, Ct({}, this.attributes, a));
  }, withConverter: function(a) {
    return o(Ct({}, this.converter, a), this.attributes);
  } }, { attributes: { value: Object.freeze(e) }, converter: { value: Object.freeze(t) } });
}({ read: function(o) {
  return o[0] === '"' && (o = o.slice(1, -1)), o.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
}, write: function(o) {
  return encodeURIComponent(o).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
} }, { path: "/" });
class oi {
  constructor(t) {
    var e;
    this.authCookieName = void 0, this.authCookieDomain = void 0, this.authCookieSameSite = void 0, this.authCookieName = t.cookieName, this.authCookieDomain = t.cookieDomain, this.authCookieSameSite = (e = t.cookieSameSite) != null ? e : "lax";
  }
  getAuthCookie() {
    return sn.get(this.authCookieName);
  }
  setAuthCookie(t, e) {
    const n = { secure: !0, sameSite: this.authCookieSameSite };
    this.authCookieDomain !== void 0 && (n.domain = this.authCookieDomain);
    const a = Vt({}, n, e);
    if ((a.sameSite === "none" || a.sameSite === "None") && a.secure === !1) throw new je(new Error("Secure attribute must be set when SameSite=None"));
    sn.set(this.authCookieName, t, a);
  }
  removeAuthCookie() {
    sn.remove(this.authCookieName);
  }
}
class ii {
  constructor(t) {
    this.keyName = void 0, this.keyName = t.keyName;
  }
  getSessionToken() {
    return sessionStorage.getItem(this.keyName);
  }
  setSessionToken(t) {
    sessionStorage.setItem(this.keyName, t);
  }
  removeSessionToken() {
    sessionStorage.removeItem(this.keyName);
  }
}
class ai {
  constructor(t) {
    this._xhr = void 0, this._xhr = t;
  }
  getResponseHeader(t) {
    return this._xhr.getResponseHeader(t);
  }
}
class ri {
  constructor(t) {
    this.headers = void 0, this.ok = void 0, this.status = void 0, this.statusText = void 0, this.url = void 0, this._decodedJSON = void 0, this.xhr = void 0, this.headers = new ai(t), this.ok = t.status >= 200 && t.status <= 299, this.status = t.status, this.statusText = t.statusText, this.url = t.responseURL, this.xhr = t;
  }
  json() {
    return this._decodedJSON || (this._decodedJSON = JSON.parse(this.xhr.response)), this._decodedJSON;
  }
  parseNumericHeader(t) {
    const e = parseInt(this.headers.getResponseHeader(t), 10);
    return isNaN(e) ? 0 : e;
  }
}
class si {
  constructor(t, e) {
    this.timeout = void 0, this.api = void 0, this.dispatcher = void 0, this.cookie = void 0, this.sessionTokenStorage = void 0, this.lang = void 0, this.sessionTokenLocation = void 0, this.api = t, this.timeout = e.timeout, this.dispatcher = new ko(), this.cookie = new oi(Vt({}, e)), this.sessionTokenStorage = new ii({ keyName: e.cookieName }), this.lang = e.lang, this.sessionTokenLocation = e.sessionTokenLocation;
  }
  _fetch(t, e, n = new XMLHttpRequest()) {
    const a = this, r = this.api + t, c = this.timeout, l = this.getAuthToken(), u = this.lang;
    return new Promise(function(s, d) {
      n.open(e.method, r, !0), n.setRequestHeader("Accept", "application/json"), n.setRequestHeader("Content-Type", "application/json"), n.setRequestHeader("X-Language", u), l && n.setRequestHeader("Authorization", `Bearer ${l}`), n.timeout = c, n.withCredentials = !0, n.onload = () => {
        a.processHeaders(n), s(new ri(n));
      }, n.onerror = () => {
        d(new je());
      }, n.ontimeout = () => {
        d(new Qt());
      }, n.send(e.body ? e.body.toString() : null);
    });
  }
  _fetch_blocking(t, e, n = new XMLHttpRequest()) {
    const a = this.api + t, r = this.getAuthToken();
    return n.open(e.method, a, !1), n.setRequestHeader("Accept", "application/json"), n.setRequestHeader("Content-Type", "application/json"), r && n.setRequestHeader("Authorization", `Bearer ${r}`), n.withCredentials = !0, n.send(e.body ? e.body.toString() : null), n.responseText;
  }
  processHeaders(t) {
    let e = "", n = 0, a = "";
    if (t.getAllResponseHeaders().split(`\r
`).forEach((r) => {
      const c = r.toLowerCase();
      c.startsWith("x-auth-token") ? e = t.getResponseHeader("X-Auth-Token") : c.startsWith("x-session-lifetime") ? n = parseInt(t.getResponseHeader("X-Session-Lifetime"), 10) : c.startsWith("x-session-retention") && (a = t.getResponseHeader("X-Session-Retention"));
    }), e) {
      const r = new RegExp("^https://"), c = !!this.api.match(r) && !!window.location.href.match(r), l = a === "session" ? void 0 : new Date((/* @__PURE__ */ new Date()).getTime() + 1e3 * n);
      this.setAuthToken(e, { secure: c, expires: l });
    }
  }
  get(t) {
    return this._fetch(t, { method: "GET" });
  }
  post(t, e) {
    return this._fetch(t, { method: "POST", body: JSON.stringify(e) });
  }
  put(t, e) {
    return this._fetch(t, { method: "PUT", body: JSON.stringify(e) });
  }
  patch(t, e) {
    return this._fetch(t, { method: "PATCH", body: JSON.stringify(e) });
  }
  delete(t) {
    return this._fetch(t, { method: "DELETE" });
  }
  getAuthToken() {
    let t = "";
    switch (this.sessionTokenLocation) {
      case "cookie":
        t = this.cookie.getAuthCookie();
        break;
      case "sessionStorage":
        t = this.sessionTokenStorage.getSessionToken();
    }
    return t;
  }
  setAuthToken(t, e) {
    switch (this.sessionTokenLocation) {
      case "cookie":
        return this.cookie.setAuthCookie(t, e);
      case "sessionStorage":
        return this.sessionTokenStorage.setSessionToken(t);
    }
  }
}
class Ge {
  constructor(t, e) {
    this.client = void 0, this.client = new si(t, e);
  }
}
class wo extends Ge {
  getDomain(t) {
    if (!t) throw new ze("somethingWentWrong", new Error("email missing from request"));
    const e = t.split("@");
    if (e.length !== 2) throw new ze("somethingWentWrong", new Error("email is not in a valid email format."));
    const n = e[1].trim();
    if (n === "") throw new ze("somethingWentWrong", new Error("email is not in a valid email format."));
    return n;
  }
  async hasProvider(t) {
    const e = this.getDomain(t);
    return this.client.get(`/saml/provider?domain=${e}`).then((n) => {
      if (n.status == 404) throw new yt(new Error("provider not found"));
      if (!n.ok) throw new je(new Error("unable to fetch provider"));
      return n.ok;
    });
  }
  auth(t, e) {
    const n = new URL("/saml/auth", this.client.api), a = this.getDomain(t);
    if (!e) throw new ze("somethingWentWrong", new Error("redirectTo missing from request"));
    n.searchParams.append("domain", a), n.searchParams.append("redirect_to", e), window.location.assign(n.href);
  }
  getError() {
    const t = new URLSearchParams(window.location.search), e = t.get("error"), n = t.get("error_description");
    if (e) {
      let a;
      switch (e) {
        case "access_denied":
          a = "enterpriseAccessDenied";
          break;
        case "user_conflict":
          a = "emailAddressAlreadyExistsError";
          break;
        case "multiple_accounts":
          a = "enterpriseMultipleAccounts";
          break;
        case "unverified_email":
          a = "enterpriseUnverifiedEmail";
          break;
        case "email_maxnum":
          a = "maxNumOfEmailAddressesReached";
          break;
        default:
          a = "somethingWentWrong";
      }
      return new ze(a, new Error(n));
    }
  }
}
class xo extends Ge {
  async getInfo(t) {
    const e = await this.client.post("/user", { email: t });
    if (e.status === 404) throw new yt();
    if (!e.ok) throw new je();
    return e.json();
  }
  async create(t) {
    const e = await this.client.post("/users", { email: t });
    if (e.status === 409) throw new Jt();
    if (e.status === 403) throw new Yt();
    if (!e.ok) throw new je();
    return e.json();
  }
  async getCurrent() {
    const t = await this.client.get("/me");
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Be();
    if (!t.ok) throw new je();
    const e = t.json(), n = await this.client.get(`/users/${e.id}`);
    if (n.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Be();
    if (!n.ok) throw new je();
    return n.json();
  }
  async delete() {
    const t = await this.client.delete("/user");
    if (t.ok) return this.client.sessionTokenStorage.removeSessionToken(), this.client.cookie.removeAuthCookie(), void this.client.dispatcher.dispatchUserDeletedEvent();
    throw t.status === 401 ? (this.client.dispatcher.dispatchSessionExpiredEvent(), new Be()) : new je();
  }
  async logout() {
    const t = await this.client.post("/logout");
    if (this.client.sessionTokenStorage.removeSessionToken(), this.client.cookie.removeAuthCookie(), this.client.dispatcher.dispatchUserLoggedOutEvent(), t.status !== 401 && !t.ok) throw new je();
  }
}
class So extends Ge {
  async list() {
    const t = await this.client.get("/emails");
    if (t.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Be();
    if (!t.ok) throw new je();
    return t.json();
  }
  async create(t) {
    const e = await this.client.post("/emails", { address: t });
    if (e.ok) return e.json();
    throw e.status === 400 ? new Gt() : e.status === 401 ? (this.client.dispatcher.dispatchSessionExpiredEvent(), new Be()) : e.status === 409 ? new Xt() : new je();
  }
  async setPrimaryEmail(t) {
    const e = await this.client.post(`/emails/${t}/set_primary`);
    if (e.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Be();
    if (!e.ok) throw new je();
  }
  async delete(t) {
    const e = await this.client.delete(`/emails/${t}`);
    if (e.status === 401) throw this.client.dispatcher.dispatchSessionExpiredEvent(), new Be();
    if (!e.ok) throw new je();
  }
}
class Co extends Ge {
  async auth(t, e) {
    const n = new URL("/thirdparty/auth", this.client.api);
    if (!t) throw new ze("somethingWentWrong", new Error("provider missing from request"));
    if (!e) throw new ze("somethingWentWrong", new Error("redirectTo missing from request"));
    n.searchParams.append("provider", t), n.searchParams.append("redirect_to", e), window.location.assign(n.href);
  }
  getError() {
    const t = new URLSearchParams(window.location.search), e = t.get("error"), n = t.get("error_description");
    if (e) {
      let a = "";
      switch (e) {
        case "access_denied":
          a = "thirdPartyAccessDenied";
          break;
        case "user_conflict":
          a = "emailAddressAlreadyExistsError";
          break;
        case "multiple_accounts":
          a = "thirdPartyMultipleAccounts";
          break;
        case "unverified_email":
          a = "thirdPartyUnverifiedEmail";
          break;
        case "email_maxnum":
          a = "maxNumOfEmailAddressesReached";
          break;
        case "signup_disabled":
          a = "signupDisabled";
          break;
        default:
          a = "somethingWentWrong";
      }
      return new ze(a, new Error(n));
    }
  }
}
class Oo extends Ge {
  async validate() {
    const t = new URLSearchParams(window.location.search).get("hanko_token");
    if (!t) return;
    window.history.replaceState(null, null, window.location.pathname);
    const e = await this.client.post("/token", { value: t });
    if (!e.ok) throw new je();
    return e.json();
  }
}
class li {
  static throttle(t, e, n = {}) {
    const { leading: a = !0, trailing: r = !0 } = n;
    let c, l, u, s = 0;
    const d = () => {
      s = a === !1 ? 0 : Date.now(), u = null, t.apply(c, l);
    };
    return function(...p) {
      const g = Date.now();
      s || a !== !1 || (s = g);
      const f = e - (g - s);
      c = this, l = p, f <= 0 || f > e ? (u && (window.clearTimeout(u), u = null), s = g, t.apply(c, l)) : u || r === !1 || (u = window.setTimeout(d, f));
    };
  }
}
class en {
  constructor() {
    this.throttleLimit = 1e3, this._addEventListener = document.addEventListener.bind(document), this._removeEventListener = document.removeEventListener.bind(document), this._throttle = li.throttle;
  }
  wrapCallback(t, e) {
    const n = (a) => {
      t(a.detail);
    };
    return e ? this._throttle(n, this.throttleLimit, { leading: !0, trailing: !1 }) : n;
  }
  addEventListenerWithType({ type: t, callback: e, once: n = !1, throttle: a = !1 }) {
    const r = this.wrapCallback(e, a);
    return this._addEventListener(t, r, { once: n }), () => this._removeEventListener(t, r);
  }
  static mapAddEventListenerParams(t, { once: e, callback: n }, a) {
    return { type: t, callback: n, once: e, throttle: a };
  }
  addEventListener(t, e, n) {
    return this.addEventListenerWithType(en.mapAddEventListenerParams(t, e, n));
  }
  onSessionCreated(t, e) {
    return this.addEventListener(An, { callback: t, once: e }, !0);
  }
  onSessionExpired(t, e) {
    return this.addEventListener(In, { callback: t, once: e }, !0);
  }
  onUserLoggedOut(t, e) {
    return this.addEventListener(jn, { callback: t, once: e });
  }
  onUserDeleted(t, e) {
    return this.addEventListener(Pn, { callback: t, once: e });
  }
}
class En extends Ge {
  async validate() {
    const t = await this.client.get("/sessions/validate");
    if (!t.ok) throw new je();
    return await t.json();
  }
}
class ci extends Ge {
  isValid() {
    let t;
    try {
      const e = this.client._fetch_blocking("/sessions/validate", { method: "GET" });
      t = JSON.parse(e);
    } catch (e) {
      throw new je(e);
    }
    return !!t && t.is_valid;
  }
}
class di {
  constructor(t) {
    this.storageKey = void 0, this.defaultState = { expiration: 0, lastCheck: 0 }, this.storageKey = t;
  }
  load() {
    const t = window.localStorage.getItem(this.storageKey);
    return t == null ? this.defaultState : JSON.parse(t);
  }
  save(t) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(t || this.defaultState));
  }
}
class ui {
  constructor(t, e) {
    this.onActivityCallback = void 0, this.onInactivityCallback = void 0, this.handleFocus = () => {
      this.onActivityCallback();
    }, this.handleBlur = () => {
      this.onInactivityCallback();
    }, this.handleVisibilityChange = () => {
      document.visibilityState === "visible" ? this.onActivityCallback() : this.onInactivityCallback();
    }, this.hasFocus = () => document.hasFocus(), this.onActivityCallback = t, this.onInactivityCallback = e, window.addEventListener("focus", this.handleFocus), window.addEventListener("blur", this.handleBlur), document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }
}
class hi {
  constructor(t, e, n) {
    this.intervalID = null, this.timeoutID = null, this.checkInterval = void 0, this.checkSession = void 0, this.onSessionExpired = void 0, this.checkInterval = t, this.checkSession = e, this.onSessionExpired = n;
  }
  scheduleSessionExpiry(t) {
    var e = this;
    this.stop(), this.timeoutID = setTimeout(async function() {
      e.stop(), e.onSessionExpired();
    }, t);
  }
  start(t = 0, e = 0) {
    var n = this;
    const a = this.calcTimeToNextCheck(t);
    this.sessionExpiresSoon(e) ? this.scheduleSessionExpiry(a) : this.timeoutID = setTimeout(async function() {
      let r = await n.checkSession();
      if (r.is_valid) {
        if (n.sessionExpiresSoon(r.expiration)) return void n.scheduleSessionExpiry(r.expiration - Date.now());
        n.intervalID = setInterval(async function() {
          r = await n.checkSession(), r.is_valid ? n.sessionExpiresSoon(r.expiration) && n.scheduleSessionExpiry(r.expiration - Date.now()) : n.stop();
        }, n.checkInterval);
      } else n.stop();
    }, a);
  }
  stop() {
    this.timeoutID && (clearTimeout(this.timeoutID), this.timeoutID = null), this.intervalID && (clearInterval(this.intervalID), this.intervalID = null);
  }
  isRunning() {
    return this.timeoutID !== null || this.intervalID !== null;
  }
  sessionExpiresSoon(t) {
    return t > 0 && t - Date.now() <= this.checkInterval;
  }
  calcTimeToNextCheck(t) {
    const e = Date.now() - t;
    return this.checkInterval >= e ? this.checkInterval - e % this.checkInterval : 0;
  }
}
class pi {
  constructor(t = "hanko_session", e, n, a) {
    this.channel = void 0, this.onSessionExpired = void 0, this.onSessionCreated = void 0, this.onLeadershipRequested = void 0, this.handleMessage = (r) => {
      const c = r.data;
      switch (c.action) {
        case "sessionExpired":
          this.onSessionExpired(c);
          break;
        case "sessionCreated":
          this.onSessionCreated(c);
          break;
        case "requestLeadership":
          this.onLeadershipRequested(c);
      }
    }, this.onSessionExpired = e, this.onSessionCreated = n, this.onLeadershipRequested = a, this.channel = new BroadcastChannel(t), this.channel.onmessage = this.handleMessage;
  }
  post(t) {
    this.channel.postMessage(t);
  }
}
class fi extends ko {
  constructor(t, e) {
    super(), this.listener = new en(), this.checkInterval = 3e4, this.client = void 0, this.sessionState = void 0, this.windowActivityManager = void 0, this.scheduler = void 0, this.sessionChannel = void 0, this.isLoggedIn = void 0, this.client = new En(t, e), this.checkInterval = e.sessionCheckInterval, this.sessionState = new di(`${e.cookieName}_session_state`), this.sessionChannel = new pi(this.getSessionCheckChannelName(e.sessionTokenLocation, e.sessionCheckChannelName), () => this.onChannelSessionExpired(), (r) => this.onChannelSessionCreated(r), () => this.onChannelLeadershipRequested()), this.scheduler = new hi(this.checkInterval, () => this.checkSession(), () => this.onSessionExpired()), this.windowActivityManager = new ui(() => this.startSessionCheck(), () => this.scheduler.stop());
    const n = Date.now(), { expiration: a } = this.sessionState.load();
    this.isLoggedIn = n < a, this.initializeEventListeners(), this.startSessionCheck();
  }
  initializeEventListeners() {
    this.listener.onSessionCreated((t) => {
      const { claims: e } = t, n = Date.parse(e.expiration), a = Date.now();
      this.isLoggedIn = !0, this.sessionState.save({ expiration: n, lastCheck: a }), this.sessionChannel.post({ action: "sessionCreated", claims: e }), this.startSessionCheck();
    }), this.listener.onUserLoggedOut(() => {
      this.isLoggedIn = !1, this.sessionChannel.post({ action: "sessionExpired" }), this.sessionState.save(null), this.scheduler.stop();
    }), window.addEventListener("beforeunload", () => this.scheduler.stop());
  }
  startSessionCheck() {
    if (!this.windowActivityManager.hasFocus() || (this.sessionChannel.post({ action: "requestLeadership" }), this.scheduler.isRunning())) return;
    const { lastCheck: t, expiration: e } = this.sessionState.load();
    this.isLoggedIn && this.scheduler.start(t, e);
  }
  async checkSession() {
    const t = Date.now(), { is_valid: e, claims: n, expiration_time: a } = await this.client.validate(), r = a ? Date.parse(a) : 0;
    return !e && this.isLoggedIn && this.dispatchSessionExpiredEvent(), e ? (this.isLoggedIn = !0, this.sessionState.save({ lastCheck: t, expiration: r })) : (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" })), { is_valid: e, claims: n, expiration: r };
  }
  onSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.sessionState.save(null), this.sessionChannel.post({ action: "sessionExpired" }), this.dispatchSessionExpiredEvent());
  }
  onChannelSessionExpired() {
    this.isLoggedIn && (this.isLoggedIn = !1, this.dispatchSessionExpiredEvent());
  }
  onChannelSessionCreated(t) {
    const { claims: e } = t, n = Date.now(), a = Date.parse(e.expiration) - n;
    this.isLoggedIn = !0, this.dispatchSessionCreatedEvent({ claims: e, expirationSeconds: a });
  }
  onChannelLeadershipRequested() {
    this.windowActivityManager.hasFocus() || this.scheduler.stop();
  }
  getSessionCheckChannelName(t, e) {
    if (t == "cookie") return e;
    let n = sessionStorage.getItem("sessionCheckChannelName");
    return n != null && n !== "" || (n = `${e}-${Math.floor(100 * Math.random()) + 1}`, sessionStorage.setItem("sessionCheckChannelName", n)), n;
  }
}
var et, ot = bo("actionDefinitions"), ln = bo("createActionsProxy");
class cn {
  toJSON() {
    return { name: this.name, payload: this.payload, error: this.error, status: this.status, csrf_token: this.csrf_token, actions: rn(this, ot)[ot] };
  }
  constructor({ name: t, payload: e, error: n, status: a, actions: r, csrf_token: c }, l) {
    Object.defineProperty(this, ln, { value: mi }), this.name = void 0, this.payload = void 0, this.error = void 0, this.status = void 0, this.csrf_token = void 0, Object.defineProperty(this, ot, { writable: !0, value: void 0 }), this.actions = void 0, this.fetchNextState = void 0, this.name = t, this.payload = e, this.error = n, this.status = a, this.csrf_token = c, rn(this, ot)[ot] = r, this.actions = rn(this, ln)[ln](r, c), this.fetchNextState = l;
  }
  runAction(t, e) {
    const n = {};
    if ("inputs" in t && typeof t.inputs == "object" && t.inputs !== null) {
      const a = t.inputs;
      for (const r in t.inputs) {
        const c = a[r];
        c && "value" in c && (n[r] = c.value);
      }
    }
    return this.fetchNextState(t.href, { input_data: n, csrf_token: e });
  }
  validateAction(t) {
    if ("inputs" in t) for (const e in t.inputs) {
      let a = function(c, l, u, s) {
        throw new Ao({ reason: c, inputName: e, wanted: u, actual: s, message: l });
      };
      const n = t.inputs[e], r = n.value;
      n.required && !r && a(et.Required, "is required"), (n.min_length != null || n.max_length != null) && ("length" in r || a(et.InvalidInputDefinition, 'has min/max length requirement, but is missing "length" property', "string", typeof r), n.min_length != null && r < n.min_length && a(et.MinLength, `too short (min ${n.min_length})`, n.min_length, r.length), n.max_length != null && r > n.max_length && a(et.MaxLength, `too long (max ${n.max_length})`, n.max_length, r.length));
    }
  }
}
function mi(o, t) {
  const e = (a) => this.runAction(a, t), n = (a) => this.validateAction(a);
  return new Proxy(o, { get(a, r) {
    if (typeof r == "symbol") return a[r];
    const c = a[r];
    return c == null ? null : (l) => {
      const u = Object.assign(JSON.parse(JSON.stringify(c)), { validate: () => (n(u), u), tryValidate() {
        try {
          n(u);
        } catch (s) {
          if (s instanceof Ao) return s;
          throw s;
        }
      }, run: () => e(u) });
      if (u !== null && typeof u == "object" && "inputs" in u) for (const s in l) {
        const d = u.inputs;
        d[s] || (d[s] = { name: s, type: "" }), d[s].value = l[s];
      }
      return u;
    };
  } });
}
(function(o) {
  o[o.InvalidInputDefinition = 0] = "InvalidInputDefinition", o[o.MinLength = 1] = "MinLength", o[o.MaxLength = 2] = "MaxLength", o[o.Required = 3] = "Required";
})(et || (et = {}));
class Ao extends Error {
  constructor(t) {
    super(`"${t.inputName}" ${t.message}`), this.reason = void 0, this.inputName = void 0, this.wanted = void 0, this.actual = void 0, this.name = "ValidationError", this.reason = t.reason, this.inputName = t.inputName, this.wanted = t.wanted, this.actual = t.actual;
  }
}
function Xn(o) {
  return typeof o == "object" && o !== null && "status" in o && "error" in o && "name" in o && !!o.name && !!o.status;
}
class vi extends Ge {
  constructor(...t) {
    var e;
    super(...t), e = this, this.run = async function(n, a) {
      try {
        if (!Xn(n)) throw new gi(n);
        const c = a[n.name];
        if (!c) throw new Dn(n);
        let l = await c(n);
        if (typeof (r = l) == "object" && r !== null && "href" in r && "inputs" in r && (l = await l.run()), Xn(l)) return e.run(l, a);
      } catch (c) {
        if (typeof a.onError == "function") return a.onError(c);
      }
      var r;
    };
  }
  async init(t, e) {
    var n = this;
    const a = await async function r(c, l) {
      try {
        const u = await n.client.post(c, l);
        return new cn(u.json(), r);
      } catch (u) {
        e.onError == null || e.onError(u);
      }
    }(t);
    await this.run(a, e);
  }
  async fromString(t, e) {
    var n = this;
    const a = new cn(JSON.parse(t), async function r(c, l) {
      try {
        const u = await n.client.post(c, l);
        return new cn(u.json(), r);
      } catch (u) {
        e.onError == null || e.onError(u);
      }
    });
    await this.run(a, e);
  }
}
class Dn extends we {
  constructor(t) {
    super("No handler found for state: " + (typeof t.name == "string" ? `"${t.name}"` : `(${typeof t.name})`), "handlerNotFoundError"), this.state = void 0, this.state = t, Object.setPrototypeOf(this, Dn.prototype);
  }
}
class gi extends Error {
  constructor(t) {
    super("Invalid state: " + (typeof t.name == "string" ? `"${t.name}"` : `(${typeof t.name})`)), this.state = void 0, this.state = t;
  }
}
class Io extends en {
  constructor(t, e) {
    super(), this.api = void 0, this.user = void 0, this.email = void 0, this.thirdParty = void 0, this.enterprise = void 0, this.token = void 0, this.sessionClient = void 0, this.session = void 0, this.relay = void 0, this.flow = void 0;
    const n = { timeout: 13e3, cookieName: "hanko", localStorageKey: "hanko", sessionCheckInterval: 3e4, sessionCheckChannelName: "hanko-session-check", sessionTokenLocation: "cookie" };
    (e == null ? void 0 : e.cookieName) !== void 0 && (n.cookieName = e.cookieName), (e == null ? void 0 : e.timeout) !== void 0 && (n.timeout = e.timeout), (e == null ? void 0 : e.localStorageKey) !== void 0 && (n.localStorageKey = e.localStorageKey), (e == null ? void 0 : e.cookieDomain) !== void 0 && (n.cookieDomain = e.cookieDomain), (e == null ? void 0 : e.cookieSameSite) !== void 0 && (n.cookieSameSite = e.cookieSameSite), (e == null ? void 0 : e.lang) !== void 0 && (n.lang = e.lang), (e == null ? void 0 : e.sessionCheckInterval) !== void 0 && (n.sessionCheckInterval = e.sessionCheckInterval < 3e3 ? 3e3 : e.sessionCheckInterval), (e == null ? void 0 : e.sessionCheckChannelName) !== void 0 && (n.sessionCheckChannelName = e.sessionCheckChannelName), (e == null ? void 0 : e.sessionTokenLocation) !== void 0 && (n.sessionTokenLocation = e.sessionTokenLocation), this.api = t, this.user = new xo(t, n), this.email = new So(t, n), this.thirdParty = new Co(t, n), this.enterprise = new wo(t, n), this.token = new Oo(t, n), this.sessionClient = new En(t, n), this.session = new ci(t, n), this.relay = new fi(t, n), this.flow = new vi(t, n);
  }
  setLang(t) {
    this.flow.client.lang = t;
  }
}
class tt {
  static supported() {
    return !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get && window.PublicKeyCredential);
  }
  static async isPlatformAuthenticatorAvailable() {
    return !(!this.supported() || !window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
  static async isSecurityKeySupported() {
    return window.PublicKeyCredential !== void 0 && window.PublicKeyCredential.isExternalCTAP2SecurityKeySupported ? window.PublicKeyCredential.isExternalCTAP2SecurityKeySupported() : this.supported();
  }
  static async isConditionalMediationAvailable() {
    return !(!window.PublicKeyCredential || !window.PublicKeyCredential.isConditionalMediationAvailable) && window.PublicKeyCredential.isConditionalMediationAvailable();
  }
}
var _i = X(292), Ve = X.n(_i), bi = X(360), Ze = X.n(bi), yi = X(884), Je = X.n(yi), ki = X(88), Qe = X.n(ki), Mt = X(914), it = {};
it.setAttributes = Je(), it.insert = (o) => {
  window._hankoStyle = o;
}, it.domAPI = Ze(), it.insertStyleElement = Qe(), Ve()(Mt.A, it);
const _t = Mt.A && Mt.A.locals ? Mt.A.locals : void 0, wi = function(o) {
  function t(e) {
    var n = co({}, e);
    return delete n.ref, o(n, e.ref || null);
  }
  return t.$$typeof = qo, t.render = t, t.prototype.isReactComponent = t.__f = !0, t.displayName = "ForwardRef(" + (o.displayName || o.name) + ")", t;
}((o, t) => {
  const { lang: e, hanko: n, setHanko: a } = (0, _.useContext)(de), { setLang: r } = (0, _.useContext)(Z.TranslateContext);
  return (0, _.useEffect)(() => {
    r(e.replace(/[-]/, "")), a((c) => (c.setLang(e), c));
  }, [n, e, a, r]), i("section", Object.assign({ part: "container", className: _t.container, ref: t }, { children: o.children }));
});
var Ut = X(697), at = {};
at.setAttributes = Je(), at.insert = (o) => {
  window._hankoStyle = o;
}, at.domAPI = Ze(), at.insertStyleElement = Qe(), Ve()(Ut.A, at);
const L = Ut.A && Ut.A.locals ? Ut.A.locals : void 0;
var xi = X(633), Q = X.n(xi);
const Si = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-apple", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "20.5 16 15 19", className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z" }) })), Ci = ({ secondary: o, size: t, fadeOut: e, disabled: n }) => i("svg", Object.assign({ id: "icon-checkmark", xmlns: "http://www.w3.org/2000/svg", viewBox: "4 4 40 40", width: t, height: t, className: Q()(L.checkmark, o && L.secondary, e && L.fadeOut, n && L.disabled) }, { children: i("path", { d: "M21.05 33.1 35.2 18.95l-2.3-2.25-11.85 11.85-6-6-2.25 2.25ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z" }) })), Oi = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: o, height: o, className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" }) })), Ai = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-custom-provider", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: [i("path", { d: "M0 0h24v24H0z", fill: "none" }), i("path", { d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" })] })), Ii = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-discord", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "0 0 127.14 96.36", className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" }) })), ji = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-exclamation", xmlns: "http://www.w3.org/2000/svg", viewBox: "5 2 13 20", width: o, height: o, className: Q()(L.exclamationMark, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" }) })), Pi = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ width: o, height: o, viewBox: "0 0 666.66668 666.66717", xmlns: "http://www.w3.org/2000/svg" }, { children: [i("defs", Object.assign({ id: "defs13" }, { children: i("clipPath", Object.assign({ clipPathUnits: "userSpaceOnUse", id: "clipPath25" }, { children: i("path", { d: "M 0,700 H 700 V 0 H 0 Z", id: "path23" }) })) })), i("g", Object.assign({ id: "g17", transform: "matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)" }, { children: i("g", Object.assign({ id: "g19" }, { children: i("g", Object.assign({ id: "g21", clipPath: "url(#clipPath25)" }, { children: [i("g", Object.assign({ id: "g27", transform: "translate(600,350)" }, { children: i("path", { className: Q()(L.facebookIcon, e ? L.disabledOutline : L.outline), d: "m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0", id: "path29" }) })), i("g", Object.assign({ id: "g31", transform: "translate(447.9175,273.6036)" }, { children: i("path", { className: Q()(L.facebookIcon, e ? L.disabledLetter : L.letter), d: "M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z", id: "path33" }) }))] })) })) }))] })), Ei = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-github", xmlns: "http://www.w3.org/2000/svg", fill: "#fff", viewBox: "0 0 97.63 96", width: o, height: o, className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: [i("path", { d: "M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" }), " "] })), Di = ({ size: o, disabled: t }) => i("svg", Object.assign({ id: "icon-google", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: L.googleIcon }, { children: [i("path", { className: Q()(L.googleIcon, t ? L.disabled : L.blue), d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), i("path", { className: Q()(L.googleIcon, t ? L.disabled : L.green), d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), i("path", { className: Q()(L.googleIcon, t ? L.disabled : L.yellow), d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), i("path", { className: Q()(L.googleIcon, t ? L.disabled : L.red), d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" }), i("path", { d: "M1 1h22v22H1z", fill: "none" })] })), Li = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-linkedin", fill: "#fff", xmlns: "http://www.w3.org/2000/svg", width: o, viewBox: "0 0 24 24", height: o, className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" }) })), Ti = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-mail", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "0 -960 960 960", className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" }) })), Ni = ({ size: o, disabled: t }) => i("svg", Object.assign({ id: "icon-microsoft", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: L.microsoftIcon }, { children: [i("rect", { className: Q()(L.microsoftIcon, t ? L.disabled : L.blue), x: "1", y: "1", width: "9", height: "9" }), i("rect", { className: Q()(L.microsoftIcon, t ? L.disabled : L.green), x: "1", y: "11", width: "9", height: "9" }), i("rect", { className: Q()(L.microsoftIcon, t ? L.disabled : L.yellow), x: "11", y: "1", width: "9", height: "9" }), i("rect", { className: Q()(L.microsoftIcon, t ? L.disabled : L.red), x: "11", y: "11", width: "9", height: "9" })] })), Mi = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-passkey", xmlns: "http://www.w3.org/2000/svg", viewBox: "3 1.5 19.5 19", width: o, height: o, className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("g", Object.assign({ id: "icon-passkey-all" }, { children: [i("circle", { id: "icon-passkey-head", cx: "10.5", cy: "6", r: "4.5" }), i("path", { id: "icon-passkey-key", d: "M22.5,10.5a3.5,3.5,0,1,0-5,3.15V19L19,20.5,21.5,18,20,16.5,21.5,15l-1.24-1.24A3.5,3.5,0,0,0,22.5,10.5Zm-3.5,0a1,1,0,1,1,1-1A1,1,0,0,1,19,10.5Z" }), i("path", { id: "icon-passkey-body", d: "M14.44,12.52A6,6,0,0,0,12,12H9a6,6,0,0,0-6,6v2H16V14.49A5.16,5.16,0,0,1,14.44,12.52Z" })] })) })), Ui = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ id: "icon-password", xmlns: "http://www.w3.org/2000/svg", width: o, height: o, viewBox: "0 -960 960 960", className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z" }) })), Hi = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: o, height: o, className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" }) })), Wi = ({ size: o, secondary: t, disabled: e }) => i("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -960 960 960", width: o, height: o, className: Q()(L.icon, t && L.secondary, e && L.disabled) }, { children: i("path", { d: "M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" }) })), Ri = ({ size: o, disabled: t }) => i("svg", Object.assign({ id: "icon-spinner", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: o, height: o, className: Q()(L.loadingSpinner, t && L.disabled) }, { children: [i("path", { d: "M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z", opacity: ".25" }), i("path", { d: "M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" })] })), bt = ({ name: o, secondary: t, size: e = 18, fadeOut: n, disabled: a }) => i(vn[o], { size: e, secondary: t, fadeOut: n, disabled: a }), Ln = ({ children: o, isLoading: t, isSuccess: e, fadeOut: n, secondary: a, hasIcon: r, maxWidth: c }) => i(O.Fragment, { children: i("div", t ? Object.assign({ className: Q()(L.loadingSpinnerWrapper, L.centerContent, c && L.maxWidth) }, { children: i(bt, { name: "spinner", secondary: a }) }) : e ? Object.assign({ className: Q()(L.loadingSpinnerWrapper, L.centerContent, c && L.maxWidth) }, { children: i(bt, { name: "checkmark", secondary: a, fadeOut: n }) }) : Object.assign({ className: r ? L.loadingSpinnerWrapperIcon : L.loadingSpinnerWrapper }, { children: o })) }), qi = () => {
  const { setLoadingAction: o } = (0, _.useContext)(de);
  return (0, _.useEffect)(() => {
    o(null);
  }, []), i(Ln, { isLoading: !0 });
}, De = (o) => {
  const [t, e] = (0, _.useState)(o);
  return (0, _.useEffect)(() => {
    o && e(o);
  }, [o]), { flowState: t };
};
var Ht = X(577), rt = {};
rt.setAttributes = Je(), rt.insert = (o) => {
  window._hankoStyle = o;
}, rt.domAPI = Ze(), rt.insertStyleElement = Qe(), Ve()(Ht.A, rt);
const xe = Ht.A && Ht.A.locals ? Ht.A.locals : void 0, Fi = () => {
  const { t: o } = (0, _.useContext)(Z.TranslateContext);
  return i("span", Object.assign({ className: Q()(xe.lastUsed) }, { children: o("labels.lastUsed") }));
}, te = (o) => {
  var { uiAction: t, title: e, children: n, secondary: a, dangerous: r, autofocus: c, showLastUsed: l, onClick: u, icon: s } = o, d = function(x, I) {
    var D = {};
    for (var M in x) Object.prototype.hasOwnProperty.call(x, M) && I.indexOf(M) < 0 && (D[M] = x[M]);
    if (x != null && typeof Object.getOwnPropertySymbols == "function") {
      var U = 0;
      for (M = Object.getOwnPropertySymbols(x); U < M.length; U++) I.indexOf(M[U]) < 0 && Object.prototype.propertyIsEnumerable.call(x, M[U]) && (D[M[U]] = x[M[U]]);
    }
    return D;
  }(o, ["uiAction", "title", "children", "secondary", "dangerous", "autofocus", "showLastUsed", "onClick", "icon"]);
  const p = (0, _.useRef)(null), { uiState: g, isDisabled: f } = (0, _.useContext)(de);
  (0, _.useEffect)(() => {
    const { current: x } = p;
    x && c && x.focus();
  }, [c]);
  const C = (0, _.useMemo)(() => t && g.loadingAction === t || d.isLoading, [d, t, g]), A = (0, _.useMemo)(() => t && g.succeededAction === t || d.isSuccess, [d, t, g]), S = (0, _.useMemo)(() => f || d.disabled, [d, f]);
  return i("button", Object.assign({ part: r ? "button dangerous-button" : a ? "button secondary-button" : "button primary-button", title: e, ref: p, type: "submit", disabled: S, onClick: u, className: Q()(xe.button, r ? xe.dangerous : a ? xe.secondary : xe.primary) }, { children: i(Ln, Object.assign({ isLoading: C, isSuccess: A, secondary: !0, hasIcon: !!s, maxWidth: !0 }, { children: [s ? i(bt, { name: s, secondary: a, disabled: S }) : null, i("div", Object.assign({ className: xe.caption }, { children: [i("span", { children: n }), l ? i(Fi, {}) : null] }))] })) }));
}, Re = (o) => {
  var t, e, n, a, r, { label: c } = o, l = function(f, C) {
    var A = {};
    for (var S in f) Object.prototype.hasOwnProperty.call(f, S) && C.indexOf(S) < 0 && (A[S] = f[S]);
    if (f != null && typeof Object.getOwnPropertySymbols == "function") {
      var x = 0;
      for (S = Object.getOwnPropertySymbols(f); x < S.length; x++) C.indexOf(S[x]) < 0 && Object.prototype.propertyIsEnumerable.call(f, S[x]) && (A[S[x]] = f[S[x]]);
    }
    return A;
  }(o, ["label"]);
  const u = (0, _.useRef)(null), { isDisabled: s } = (0, _.useContext)(de), { t: d } = (0, _.useContext)(Z.TranslateContext), p = (0, _.useMemo)(() => s || l.disabled, [l, s]);
  (0, _.useEffect)(() => {
    const { current: f } = u;
    f && l.autofocus && (f.focus(), f.select());
  }, [l.autofocus]);
  const g = (0, _.useMemo)(() => {
    var f;
    return l.markOptional && !(!((f = l.flowInput) === null || f === void 0) && f.required) ? `${l.placeholder} (${d("labels.optional")})` : l.placeholder;
  }, [l.markOptional, l.placeholder, l.flowInput, d]);
  return i("div", Object.assign({ className: xe.inputWrapper }, { children: i("input", Object.assign({ part: "input text-input", required: (t = l.flowInput) === null || t === void 0 ? void 0 : t.required, maxLength: (e = l.flowInput) === null || e === void 0 ? void 0 : e.max_length, minLength: (n = l.flowInput) === null || n === void 0 ? void 0 : n.min_length, hidden: (a = l.flowInput) === null || a === void 0 ? void 0 : a.hidden }, l, { ref: u, "aria-label": g, placeholder: g, className: Q()(xe.input, !!(!((r = l.flowInput) === null || r === void 0) && r.error) && l.markError && xe.error), disabled: p })) }));
}, Se = ({ children: o }) => i("section", Object.assign({ className: _t.content }, { children: o })), ne = ({ onSubmit: o, children: t, hidden: e, maxWidth: n }) => e ? null : i("form", Object.assign({ onSubmit: o, className: xe.form }, { children: i("ul", Object.assign({ className: xe.ul }, { children: (0, O.toChildArray)(t).map((a, r) => i("li", Object.assign({ part: "form-item", className: Q()(xe.li, n ? xe.maxWidth : null) }, { children: a }), r)) })) }));
var Wt = X(111), st = {};
st.setAttributes = Je(), st.insert = (o) => {
  window._hankoStyle = o;
}, st.domAPI = Ze(), st.insertStyleElement = Qe(), Ve()(Wt.A, st);
const gt = Wt.A && Wt.A.locals ? Wt.A.locals : void 0, Tn = ({ children: o, hidden: t }) => t ? null : i("section", Object.assign({ part: "divider", className: gt.divider }, { children: [i("div", { part: "divider-line", className: gt.line }), o ? i("div", Object.assign({ part: "divider-text", class: gt.text }, { children: o })) : null, i("div", { part: "divider-line", className: gt.line })] }));
var Rt = X(905), lt = {};
lt.setAttributes = Je(), lt.insert = (o) => {
  window._hankoStyle = o;
}, lt.domAPI = Ze(), lt.insertStyleElement = Qe(), Ve()(Rt.A, lt);
const jo = Rt.A && Rt.A.locals ? Rt.A.locals : void 0, Ce = ({ state: o, error: t, flowError: e }) => {
  var n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { uiState: c, setUIState: l } = (0, _.useContext)(de);
  return (0, _.useEffect)(() => {
    var u, s;
    if (((u = o == null ? void 0 : o.error) === null || u === void 0 ? void 0 : u.code) == "form_data_invalid_error") for (const d of Object.values(o == null ? void 0 : o.actions)) {
      const p = d == null ? void 0 : d(null);
      let g = !1;
      for (const f of Object.values(p == null ? void 0 : p.inputs)) if (!((s = f.error) === null || s === void 0) && s.code) return l(Object.assign(Object.assign({}, c), { error: f.error })), void (g = !0);
      g || l(Object.assign(Object.assign({}, c), { error: o.error }));
    }
    else o != null && o.error && l(Object.assign(Object.assign({}, c), { error: o == null ? void 0 : o.error }));
  }, [o]), i("section", Object.assign({ part: "error", className: jo.errorBox, hidden: !(!((n = c.error) === null || n === void 0) && n.code) && !(e != null && e.code) && !t }, { children: [i("span", { children: i(bt, { name: "exclamation", size: 15 }) }), i("span", Object.assign({ id: "errorMessage", part: "error-text" }, { children: r(t ? `errors.${t.code}` : `flowErrors.${((a = c.error) === null || a === void 0 ? void 0 : a.code) || (e == null ? void 0 : e.code)}`) }))] }));
};
var qt = X(619), ct = {};
ct.setAttributes = Je(), ct.insert = (o) => {
  window._hankoStyle = o;
}, ct.domAPI = Ze(), ct.insertStyleElement = Qe(), Ve()(qt.A, ct);
const Zt = qt.A && qt.A.locals ? qt.A.locals : void 0, ce = ({ children: o }) => i("h1", Object.assign({ part: "headline1", className: Q()(Zt.headline, Zt.grade1) }, { children: o }));
var Ft = X(995), dt = {};
dt.setAttributes = Je(), dt.insert = (o) => {
  window._hankoStyle = o;
}, dt.domAPI = Ze(), dt.insertStyleElement = Qe(), Ve()(Ft.A, dt);
const Ot = Ft.A && Ft.A.locals ? Ft.A.locals : void 0, _n = (o) => {
  var { loadingSpinnerPosition: t, dangerous: e = !1, onClick: n, uiAction: a } = o, r = function(I, D) {
    var M = {};
    for (var U in I) Object.prototype.hasOwnProperty.call(I, U) && D.indexOf(U) < 0 && (M[U] = I[U]);
    if (I != null && typeof Object.getOwnPropertySymbols == "function") {
      var ie = 0;
      for (U = Object.getOwnPropertySymbols(I); ie < U.length; ie++) D.indexOf(U[ie]) < 0 && Object.prototype.propertyIsEnumerable.call(I, U[ie]) && (M[U[ie]] = I[U[ie]]);
    }
    return M;
  }(o, ["loadingSpinnerPosition", "dangerous", "onClick", "uiAction"]);
  const { t: c } = (0, _.useContext)(Z.TranslateContext), { uiState: l, isDisabled: u } = (0, _.useContext)(de), [s, d] = (0, _.useState)();
  let p;
  const g = (I) => {
    I.preventDefault(), d(!0);
  }, f = (I) => {
    I.preventDefault(), d(!1);
  }, C = (0, _.useMemo)(() => a && l.loadingAction === a || r.isLoading, [r, a, l]), A = (0, _.useMemo)(() => a && l.succeededAction === a || r.isSuccess, [r, a, l]), S = (0, _.useCallback)((I) => {
    I.preventDefault(), d(!1), n(I);
  }, [n]), x = (0, _.useCallback)(() => i(O.Fragment, { children: [s ? i(O.Fragment, { children: [i(_n, Object.assign({ onClick: S }, { children: c("labels.yes") })), " / ", i(_n, Object.assign({ onClick: f }, { children: c("labels.no") })), " "] }) : null, i("button", Object.assign({}, r, { onClick: e ? g : n, disabled: s || r.disabled || u, part: "link", className: Q()(Ot.link, e ? Ot.danger : null) }, { children: r.children }))] }), [s, e, n, S, r, c, u]);
  return i(O.Fragment, { children: i("span", Object.assign({ className: Q()(Ot.linkWrapper, t === "right" ? Ot.reverse : null), hidden: r.hidden, onMouseEnter: () => {
    p && window.clearTimeout(p);
  }, onMouseLeave: () => {
    p = window.setTimeout(() => {
      d(!1);
    }, 1e3);
  } }, { children: i(O.Fragment, t && (C || A) ? { children: [i(Ln, { isLoading: C, isSuccess: A, secondary: r.secondary, fadeOut: !0 }), x()] } : { children: x() }) })) });
}, ee = _n, Le = ({ children: o, hidden: t = !1 }) => t ? null : i("section", Object.assign({ className: _t.footer }, { children: o })), Nn = (o) => {
  var { label: t } = o, e = function(n, a) {
    var r = {};
    for (var c in n) Object.prototype.hasOwnProperty.call(n, c) && a.indexOf(c) < 0 && (r[c] = n[c]);
    if (n != null && typeof Object.getOwnPropertySymbols == "function") {
      var l = 0;
      for (c = Object.getOwnPropertySymbols(n); l < c.length; l++) a.indexOf(c[l]) < 0 && Object.prototype.propertyIsEnumerable.call(n, c[l]) && (r[c[l]] = n[c[l]]);
    }
    return r;
  }(o, ["label"]);
  return i("div", Object.assign({ className: xe.inputWrapper }, { children: i("label", Object.assign({ className: xe.checkboxWrapper }, { children: [i("input", Object.assign({ part: "input checkbox-input", type: "checkbox", "aria-label": t, className: xe.checkbox }, e)), i("span", Object.assign({ className: Q()(xe.label, e.disabled ? xe.disabled : null) }, { children: t }))] })) }));
}, tn = () => i("section", { className: gt.spacer });
var ut = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const zi = (o) => {
  var t, e, n, a, r, c, l, u, s;
  const { t: d } = (0, _.useContext)(Z.TranslateContext), { init: p, hanko: g, initialComponentName: f, setLoadingAction: C, uiState: A, setUIState: S, stateHandler: x, hidePasskeyButtonOnLogin: I, lastLogin: D } = (0, _.useContext)(de), [M, U] = (0, _.useState)(null), [ie, ge] = (0, _.useState)(A.username || A.email), { flowState: ae } = De(o.state), be = tt.supported(), [H, F] = (0, _.useState)(void 0), [me, Pe] = (0, _.useState)(null), [Oe, Ee] = (0, _.useState)(!1), re = (k) => {
    if (k.preventDefault(), k.target instanceof HTMLInputElement) {
      const { value: h } = k.target;
      ge(h), se(h);
    }
  }, se = (k) => {
    const h = () => S((T) => Object.assign(Object.assign({}, T), { email: k, username: null })), b = () => S((T) => Object.assign(Object.assign({}, T), { email: null, username: k }));
    switch (M) {
      case "email":
        h();
        break;
      case "username":
        b();
        break;
      case "identifier":
        k.match(/^[^@]+@[^@]+\.[^@]+$/) ? h() : b();
    }
  }, ue = (0, _.useMemo)(() => {
    var k, h, b, T;
    return !!(!((h = (k = ae.actions).webauthn_generate_request_options) === null || h === void 0) && h.call(k, null)) || !!(!((T = (b = ae.actions).thirdparty_oauth) === null || T === void 0) && T.call(b, null));
  }, [ae.actions]), Ae = (e = (t = ae.actions).continue_with_login_identifier) === null || e === void 0 ? void 0 : e.call(t, null).inputs;
  return (0, _.useEffect)(() => {
    var k, h;
    const b = (h = (k = ae.actions).continue_with_login_identifier) === null || h === void 0 ? void 0 : h.call(k, null).inputs;
    U(b != null && b.email ? "email" : b != null && b.username ? "username" : "identifier");
  }, [ae]), (0, _.useEffect)(() => {
    const k = new URLSearchParams(window.location.search);
    if (k.get("error") == null || k.get("error").length === 0) return;
    let h = "";
    h = k.get("error") === "access_denied" ? "thirdPartyAccessDenied" : "somethingWentWrong";
    const b = { name: h, code: h, message: k.get("error_description") };
    F(b), k.delete("error"), k.delete("error_description"), history.replaceState(null, null, window.location.pathname + (k.size < 1 ? "" : `?${k.toString()}`));
  }, []), i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: d("headlines.signIn") }), i(Ce, { state: ae, error: H }), Ae ? i(O.Fragment, { children: [i(ne, Object.assign({ onSubmit: (k) => ut(void 0, void 0, void 0, function* () {
    k.preventDefault(), C("email-submit");
    const h = yield ae.actions.continue_with_login_identifier({ [M]: ie }).run();
    se(ie), C(null), yield g.flow.run(h, x);
  }), maxWidth: !0 }, { children: [Ae.email ? i(Re, { type: "email", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ae.email, onInput: re, value: ie, placeholder: d("labels.email"), pattern: "^[^@]+@[^@]+\\.[^@]+$" }) : Ae.username ? i(Re, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ae.username, onInput: re, value: ie, placeholder: d("labels.username") }) : i(Re, { type: "text", autoComplete: "username webauthn", autoCorrect: "off", flowInput: Ae.identifier, onInput: re, value: ie, placeholder: d("labels.emailOrUsername") }), i(te, Object.assign({ uiAction: "email-submit" }, { children: d("labels.continue") }))] })), i(Tn, Object.assign({ hidden: !ue }, { children: d("labels.or") }))] }) : null, !((a = (n = ae.actions).webauthn_generate_request_options) === null || a === void 0) && a.call(n, null) && !I ? i(ne, Object.assign({ onSubmit: (k) => ((h) => ut(void 0, void 0, void 0, function* () {
    h.preventDefault(), C("passkey-submit");
    const b = yield ae.actions.webauthn_generate_request_options(null).run();
    yield g.flow.run(b, x);
  }))(k) }, { children: i(te, Object.assign({ uiAction: "passkey-submit", secondary: !0, title: be ? null : d("labels.webauthnUnsupported"), disabled: !be, icon: "passkey" }, { children: d("labels.signInPasskey") })) })) : null, !((c = (r = ae.actions).thirdparty_oauth) === null || c === void 0) && c.call(r, null) ? (l = ae.actions.thirdparty_oauth(null).inputs.provider.allowed_values) === null || l === void 0 ? void 0 : l.map((k) => i(ne, Object.assign({ onSubmit: (h) => ((b, T) => ut(void 0, void 0, void 0, function* () {
    b.preventDefault(), Pe(T);
    const K = yield ae.actions.thirdparty_oauth({ provider: T, redirect_to: window.location.toString() }).run();
    K.error && Pe(null), yield g.flow.run(K, x);
  }))(h, k.value) }, { children: i(te, Object.assign({ isLoading: k.value == me, secondary: !0, icon: k.value.startsWith("custom_") ? "customProvider" : k.value, showLastUsed: (D == null ? void 0 : D.login_method) == "third_party" && (D == null ? void 0 : D.third_party_provider) == k.value }, { children: d("labels.signInWith", { provider: k.name }) })) }), k.value)) : null, ((s = (u = ae.actions).remember_me) === null || s === void 0 ? void 0 : s.call(u, null)) && i(O.Fragment, { children: [i(tn, {}), i(Nn, { required: !1, type: "checkbox", label: d("labels.staySignedIn"), checked: Oe, onChange: (k) => ut(void 0, void 0, void 0, function* () {
    const h = yield ae.actions.remember_me({ remember_me: !Oe }).run();
    Ee((b) => !b), yield g.flow.run(h, x);
  }) })] })] }), i(Le, Object.assign({ hidden: f !== "auth" }, { children: [i("span", { hidden: !0 }), i(ee, Object.assign({ uiAction: "switch-flow", onClick: (k) => ut(void 0, void 0, void 0, function* () {
    k.preventDefault(), p("registration");
  }), loadingSpinnerPosition: "left" }, { children: d("labels.dontHaveAnAccount") }))] }))] });
}, $i = (o) => {
  var { index: t, focus: e, digit: n = "" } = o, a = function(s, d) {
    var p = {};
    for (var g in s) Object.prototype.hasOwnProperty.call(s, g) && d.indexOf(g) < 0 && (p[g] = s[g]);
    if (s != null && typeof Object.getOwnPropertySymbols == "function") {
      var f = 0;
      for (g = Object.getOwnPropertySymbols(s); f < g.length; f++) d.indexOf(g[f]) < 0 && Object.prototype.propertyIsEnumerable.call(s, g[f]) && (p[g[f]] = s[g[f]]);
    }
    return p;
  }(o, ["index", "focus", "digit"]);
  const r = (0, _.useRef)(null), { isDisabled: c } = (0, _.useContext)(de), l = () => {
    const { current: s } = r;
    s && (s.focus(), s.select());
  }, u = (0, _.useMemo)(() => c || a.disabled, [a, c]);
  return (0, _.useEffect)(() => {
    t === 0 && l();
  }, [t, a.disabled]), (0, _.useMemo)(() => {
    e && l();
  }, [e]), i("div", Object.assign({ className: xe.passcodeDigitWrapper }, { children: i("input", Object.assign({}, a, { part: "input passcode-input", "aria-label": `${a.name}-digit-${t + 1}`, name: a.name + t.toString(10), type: "text", inputMode: "numeric", maxLength: 1, ref: r, value: n.charAt(0), required: !0, className: xe.input, disabled: u })) }));
}, Mn = ({ passcodeDigits: o = [], numberOfInputs: t = 6, onInput: e, disabled: n = !1 }) => {
  const [a, r] = (0, _.useState)(0), c = () => o.slice(), l = () => {
    a < t - 1 && r(a + 1);
  }, u = () => {
    a > 0 && r(a - 1);
  }, s = (f) => {
    const C = c();
    C[a] = f.charAt(0), e(C);
  }, d = (f) => {
    if (f.preventDefault(), n) return;
    const C = f.clipboardData.getData("text/plain").slice(0, t - a).split(""), A = c();
    let S = a;
    for (let x = 0; x < t; ++x) x >= a && C.length > 0 && (A[x] = C.shift(), S++);
    r(S), e(A);
  }, p = (f) => {
    f.key === "Backspace" ? (f.preventDefault(), s(""), u()) : f.key === "Delete" ? (f.preventDefault(), s("")) : f.key === "ArrowLeft" ? (f.preventDefault(), u()) : f.key === "ArrowRight" ? (f.preventDefault(), l()) : f.key !== " " && f.key !== "Spacebar" && f.key !== "Space" || f.preventDefault();
  }, g = (f) => {
    f.target instanceof HTMLInputElement && s(f.target.value), l();
  };
  return (0, _.useEffect)(() => {
    o.length === 0 && r(0);
  }, [o]), i("div", Object.assign({ className: xe.passcodeInputWrapper }, { children: Array.from(Array(t)).map((f, C) => i($i, { name: "passcode", index: C, focus: a === C, digit: o[C], onKeyDown: p, onInput: g, onPaste: d, onFocus: () => ((A) => {
    r(A);
  })(C), disabled: n }, C)) }));
};
var zt = X(489), ht = {};
ht.setAttributes = Je(), ht.insert = (o) => {
  window._hankoStyle = o;
}, ht.domAPI = Ze(), ht.insertStyleElement = Qe(), Ve()(zt.A, ht);
const Ki = zt.A && zt.A.locals ? zt.A.locals : void 0, z = ({ children: o, hidden: t }) => t ? null : i("p", Object.assign({ part: "paragraph", className: Ki.paragraph }, { children: o }));
var At = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Bi = (o) => {
  var t, e;
  const { t: n } = (0, _.useContext)(Z.TranslateContext), { flowState: a } = De(o.state), { hanko: r, uiState: c, setUIState: l, setLoadingAction: u, setSucceededAction: s, stateHandler: d } = (0, _.useContext)(de), [p, g] = (0, _.useState)(), [f, C] = (0, _.useState)(a.payload.resend_after), [A, S] = (0, _.useState)([]), x = (0, _.useMemo)(() => {
    var D;
    return ((D = a.error) === null || D === void 0 ? void 0 : D.code) === "passcode_max_attempts_reached";
  }, [a]), I = (0, _.useCallback)((D) => At(void 0, void 0, void 0, function* () {
    u("passcode-submit");
    const M = yield a.actions.verify_passcode({ code: D }).run();
    u(null), yield r.flow.run(M, d);
  }), [r, a, u, d]);
  return (0, _.useEffect)(() => {
    a.payload.passcode_resent && (s("passcode-resend"), setTimeout(() => s(null), 1e3));
  }, [a, s]), (0, _.useEffect)(() => {
    p <= 0 && c.succeededAction;
  }, [c, p]), (0, _.useEffect)(() => {
    const D = p > 0 && setInterval(() => g(p - 1), 1e3);
    return () => clearInterval(D);
  }, [p]), (0, _.useEffect)(() => {
    const D = f > 0 && setInterval(() => {
      C(f - 1);
    }, 1e3);
    return () => clearInterval(D);
  }, [f]), (0, _.useEffect)(() => {
    var D;
    f == 0 && ((D = a.error) === null || D === void 0 ? void 0 : D.code) == "rate_limit_exceeded" && l((M) => Object.assign(Object.assign({}, M), { error: null }));
  }, [f]), (0, _.useEffect)(() => {
    var D;
    ((D = a.error) === null || D === void 0 ? void 0 : D.code) === "passcode_invalid" && S([]), a.payload.resend_after >= 0 && C(a.payload.resend_after);
  }, [a]), i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: n("headlines.loginPasscode") }), i(Ce, { state: a }), i(z, { children: c.email ? n("texts.enterPasscode", { emailAddress: c.email }) : n("texts.enterPasscodeNoEmail") }), i(ne, Object.assign({ onSubmit: (D) => At(void 0, void 0, void 0, function* () {
    return D.preventDefault(), I(A.join(""));
  }) }, { children: [i(Mn, { onInput: (D) => {
    if (S(D), D.filter((M) => M !== "").length === 6) return I(D.join(""));
  }, passcodeDigits: A, numberOfInputs: 6, disabled: p <= 0 || x }), i(te, Object.assign({ disabled: p <= 0 || x, uiAction: "passcode-submit" }, { children: n("labels.continue") }))] }))] }), i(Le, { children: [i(ee, Object.assign({ hidden: !(!((e = (t = a.actions).back) === null || e === void 0) && e.call(t, null)), onClick: (D) => At(void 0, void 0, void 0, function* () {
    D.preventDefault(), u("back");
    const M = yield a.actions.back(null).run();
    u(null), yield r.flow.run(M, d);
  }), loadingSpinnerPosition: "right", isLoading: c.loadingAction === "back" }, { children: n("labels.back") })), i(ee, Object.assign({ uiAction: "passcode-resend", disabled: f > 0, onClick: (D) => At(void 0, void 0, void 0, function* () {
    D.preventDefault(), u("passcode-resend");
    const M = yield a.actions.resend_passcode(null).run();
    u(null), yield r.flow.run(M, d);
  }), loadingSpinnerPosition: "left" }, { children: f > 0 ? n("labels.passcodeResendAfter", { passcodeResendAfter: f }) : n("labels.sendNewPasscode") }))] })] });
};
var dn = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Vi = (o) => {
  var t, e, n, a, r, c, l, u;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: d, setLoadingAction: p, stateHandler: g } = (0, _.useContext)(de), { flowState: f } = De(o.state);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: s("headlines.registerAuthenticator") }), i(Ce, { state: f }), i(z, { children: s("texts.setupPasskey") }), i(ne, Object.assign({ onSubmit: (C) => dn(void 0, void 0, void 0, function* () {
    C.preventDefault(), p("passkey-submit");
    const A = yield f.actions.webauthn_generate_creation_options(null).run();
    yield d.flow.run(A, g);
  }) }, { children: i(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "passkey" }, { children: s("labels.registerAuthenticator") })) }))] }), i(Le, Object.assign({ hidden: !(!((e = (t = f.actions).skip) === null || e === void 0) && e.call(t, null)) && !(!((a = (n = f.actions).back) === null || a === void 0) && a.call(n, null)) }, { children: [i(ee, Object.assign({ uiAction: "back", onClick: (C) => dn(void 0, void 0, void 0, function* () {
    C.preventDefault(), p("back");
    const A = yield f.actions.back(null).run();
    p(null), yield d.flow.run(A, g);
  }), loadingSpinnerPosition: "right", hidden: !(!((c = (r = f.actions).back) === null || c === void 0) && c.call(r, null)) }, { children: s("labels.back") })), i(ee, Object.assign({ uiAction: "skip", onClick: (C) => dn(void 0, void 0, void 0, function* () {
    C.preventDefault(), p("skip");
    const A = yield f.actions.skip(null).run();
    p(null), yield d.flow.run(A, g);
  }), loadingSpinnerPosition: "left", hidden: !(!((u = (l = f.actions).skip) === null || u === void 0) && u.call(l, null)) }, { children: s("labels.skip") }))] }))] });
};
var pt = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Zi = (o) => {
  var t, e, n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { hanko: c, stateHandler: l, setLoadingAction: u } = (0, _.useContext)(de), { flowState: s } = De(o.state), [d, p] = (0, _.useState)(), [g, f] = (0, _.useState)(), C = (I) => pt(void 0, void 0, void 0, function* () {
    I.preventDefault(), u("password-recovery");
    const D = yield s.actions.continue_to_passcode_confirmation_recovery(null).run();
    u(null), yield c.flow.run(D, l);
  }), A = (I) => pt(void 0, void 0, void 0, function* () {
    I.preventDefault(), u("choose-login-method");
    const D = yield s.actions.continue_to_login_method_chooser(null).run();
    u(null), yield c.flow.run(D, l);
  }), S = (0, _.useMemo)(() => {
    var I, D;
    return i(ee, Object.assign({ hidden: !(!((D = (I = s.actions).continue_to_passcode_confirmation_recovery) === null || D === void 0) && D.call(I, null)), uiAction: "password-recovery", onClick: C, loadingSpinnerPosition: "left" }, { children: r("labels.forgotYourPassword") }));
  }, [C, r]), x = (0, _.useMemo)(() => i(ee, Object.assign({ uiAction: "choose-login-method", onClick: A, loadingSpinnerPosition: "left" }, { children: "Choose another method" })), [A]);
  return (0, _.useEffect)(() => {
    const I = g > 0 && setInterval(() => f(g - 1), 1e3);
    return () => clearInterval(I);
  }, [g]), i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r("headlines.loginPassword") }), i(Ce, { state: s }), i(ne, Object.assign({ onSubmit: (I) => pt(void 0, void 0, void 0, function* () {
    I.preventDefault(), u("password-submit");
    const D = yield s.actions.password_login({ password: d }).run();
    u(null), yield c.flow.run(D, l);
  }) }, { children: [i(Re, { type: "password", flowInput: s.actions.password_login(null).inputs.password, autocomplete: "current-password", placeholder: r("labels.password"), onInput: (I) => pt(void 0, void 0, void 0, function* () {
    I.target instanceof HTMLInputElement && p(I.target.value);
  }), autofocus: !0 }), i(te, Object.assign({ uiAction: "password-submit", disabled: g > 0 }, { children: g > 0 ? r("labels.passwordRetryAfter", { passwordRetryAfter: g }) : r("labels.signIn") }))] })), !((e = (t = s.actions).continue_to_login_method_chooser) === null || e === void 0) && e.call(t, null) ? S : null] }), i(Le, { children: [i(ee, Object.assign({ uiAction: "back", onClick: (I) => pt(void 0, void 0, void 0, function* () {
    I.preventDefault(), u("back");
    const D = yield s.actions.back(null).run();
    u(null), yield c.flow.run(D, l);
  }), loadingSpinnerPosition: "right" }, { children: r("labels.back") })), !((a = (n = s.actions).continue_to_login_method_chooser) === null || a === void 0) && a.call(n, null) ? x : S] })] });
};
var Gn = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Ji = (o) => {
  const { t } = (0, _.useContext)(Z.TranslateContext), { hanko: e, stateHandler: n, setLoadingAction: a } = (0, _.useContext)(de), { flowState: r } = De(o.state), [c, l] = (0, _.useState)();
  return i(Se, { children: [i(ce, { children: t("headlines.registerPassword") }), i(Ce, { state: r }), i(z, { children: t("texts.passwordFormatHint", { minLength: r.actions.password_recovery(null).inputs.new_password.min_length, maxLength: 72 }) }), i(ne, Object.assign({ onSubmit: (u) => Gn(void 0, void 0, void 0, function* () {
    u.preventDefault(), a("password-submit");
    const s = yield r.actions.password_recovery({ new_password: c }).run();
    a(null), yield e.flow.run(s, n);
  }) }, { children: [i(Re, { type: "password", autocomplete: "new-password", flowInput: r.actions.password_recovery(null).inputs.new_password, placeholder: t("labels.newPassword"), onInput: (u) => Gn(void 0, void 0, void 0, function* () {
    u.target instanceof HTMLInputElement && l(u.target.value);
  }), autofocus: !0 }), i(te, Object.assign({ uiAction: "password-submit" }, { children: t("labels.continue") }))] }))] });
};
var It = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Qi = (o) => {
  var t, e, n, a, r, c;
  const { t: l } = (0, _.useContext)(Z.TranslateContext), { hanko: u, setLoadingAction: s, stateHandler: d, lastLogin: p } = (0, _.useContext)(de), { flowState: g } = De(o.state);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: l("headlines.selectLoginMethod") }), i(Ce, { flowError: g == null ? void 0 : g.error }), i(z, { children: l("texts.howDoYouWantToLogin") }), i(ne, Object.assign({ hidden: !(!((e = (t = g.actions).continue_to_passcode_confirmation) === null || e === void 0) && e.call(t, null)), onSubmit: (f) => It(void 0, void 0, void 0, function* () {
    f.preventDefault(), s("passcode-submit");
    const C = yield g.actions.continue_to_passcode_confirmation(null).run();
    s(null), yield u.flow.run(C, d);
  }) }, { children: i(te, Object.assign({ secondary: !0, uiAction: "passcode-submit", icon: "mail" }, { children: l("labels.passcode") })) })), i(ne, Object.assign({ hidden: !(!((a = (n = g.actions).continue_to_password_login) === null || a === void 0) && a.call(n, null)), onSubmit: (f) => It(void 0, void 0, void 0, function* () {
    f.preventDefault(), s("password-submit");
    const C = yield g.actions.continue_to_password_login(null).run();
    s(null), yield u.flow.run(C, d);
  }) }, { children: i(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "password" }, { children: l("labels.password") })) })), i(ne, Object.assign({ hidden: !(!((c = (r = g.actions).webauthn_generate_request_options) === null || c === void 0) && c.call(r, null)), onSubmit: (f) => It(void 0, void 0, void 0, function* () {
    f.preventDefault(), s("passkey-submit");
    const C = yield g.actions.webauthn_generate_request_options(null).run();
    s(null), yield u.flow.run(C, d);
  }) }, { children: i(te, Object.assign({ secondary: !0, uiAction: "passkey-submit", icon: "passkey" }, { children: l("labels.passkey") })) }))] }), i(Le, { children: i(ee, Object.assign({ uiAction: "back", onClick: (f) => It(void 0, void 0, void 0, function* () {
    f.preventDefault(), s("back");
    const C = yield g.actions.back(null).run();
    s(null), yield u.flow.run(C, d);
  }), loadingSpinnerPosition: "right" }, { children: l("labels.back") })) })] });
};
var jt = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Yi = (o) => {
  var t, e, n, a, r, c, l;
  const { t: u } = (0, _.useContext)(Z.TranslateContext), { init: s, hanko: d, uiState: p, setUIState: g, stateHandler: f, setLoadingAction: C, initialComponentName: A } = (0, _.useContext)(de), { flowState: S } = De(o.state), x = (e = (t = S.actions).register_login_identifier) === null || e === void 0 ? void 0 : e.call(t, null).inputs, I = !(!(x != null && x.email) || !(x != null && x.username)), [D, M] = (0, _.useState)(void 0), [U, ie] = (0, _.useState)(null), [ge, ae] = (0, _.useState)(!1), be = (0, _.useMemo)(() => {
    var H, F;
    return !!(!((F = (H = S.actions).thirdparty_oauth) === null || F === void 0) && F.call(H, null));
  }, [S.actions]);
  return (0, _.useEffect)(() => {
    const H = new URLSearchParams(window.location.search);
    if (H.get("error") == null || H.get("error").length === 0) return;
    let F = "";
    F = H.get("error") === "access_denied" ? "thirdPartyAccessDenied" : "somethingWentWrong";
    const me = { name: F, code: F, message: H.get("error_description") };
    M(me), H.delete("error"), H.delete("error_description"), history.replaceState(null, null, window.location.pathname + (H.size < 1 ? "" : `?${H.toString()}`));
  }, []), i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: u("headlines.signUp") }), i(Ce, { state: S, error: D }), x ? i(O.Fragment, { children: [i(ne, Object.assign({ onSubmit: (H) => jt(void 0, void 0, void 0, function* () {
    H.preventDefault(), C("email-submit");
    const F = yield S.actions.register_login_identifier({ email: p.email, username: p.username }).run();
    C(null), yield d.flow.run(F, f);
  }), maxWidth: !0 }, { children: [x.username ? i(Re, { markOptional: I, markError: I, type: "text", autoComplete: "username", autoCorrect: "off", flowInput: x.username, onInput: (H) => {
    if (H.preventDefault(), H.target instanceof HTMLInputElement) {
      const { value: F } = H.target;
      g((me) => Object.assign(Object.assign({}, me), { username: F }));
    }
  }, value: p.username, placeholder: u("labels.username") }) : null, x.email ? i(Re, { markOptional: I, markError: I, type: "email", autoComplete: "email", autoCorrect: "off", flowInput: x.email, onInput: (H) => {
    if (H.preventDefault(), H.target instanceof HTMLInputElement) {
      const { value: F } = H.target;
      g((me) => Object.assign(Object.assign({}, me), { email: F }));
    }
  }, value: p.email, placeholder: u("labels.email"), pattern: "^.*[^0-9]+$" }) : null, i(te, Object.assign({ uiAction: "email-submit", autofocus: !0 }, { children: u("labels.continue") }))] })), i(Tn, Object.assign({ hidden: !be }, { children: u("labels.or") }))] }) : null, !((a = (n = S.actions).thirdparty_oauth) === null || a === void 0) && a.call(n, null) ? (r = S.actions.thirdparty_oauth(null).inputs.provider.allowed_values) === null || r === void 0 ? void 0 : r.map((H) => i(ne, Object.assign({ onSubmit: (F) => ((me, Pe) => jt(void 0, void 0, void 0, function* () {
    me.preventDefault(), ie(Pe);
    const Oe = yield S.actions.thirdparty_oauth({ provider: Pe, redirect_to: window.location.toString() }).run();
    ie(null), yield d.flow.run(Oe, f);
  }))(F, H.value) }, { children: i(te, Object.assign({ isLoading: H.value == U, secondary: !0, icon: H.value.startsWith("custom_") ? "customProvider" : H.value }, { children: u("labels.signInWith", { provider: H.name }) })) }), H.value)) : null, ((l = (c = S.actions).remember_me) === null || l === void 0 ? void 0 : l.call(c, null)) && i(O.Fragment, { children: [i(tn, {}), i(Nn, { required: !1, type: "checkbox", label: u("labels.staySignedIn"), checked: ge, onChange: (H) => jt(void 0, void 0, void 0, function* () {
    const F = yield S.actions.remember_me({ remember_me: !ge }).run();
    ae((me) => !me), yield d.flow.run(F, f);
  }) })] })] }), i(Le, Object.assign({ hidden: A !== "auth" }, { children: [i("span", { hidden: !0 }), i(ee, Object.assign({ uiAction: "switch-flow", onClick: (H) => jt(void 0, void 0, void 0, function* () {
    H.preventDefault(), s("login");
  }), loadingSpinnerPosition: "left" }, { children: u("labels.alreadyHaveAnAccount") }))] }))] });
};
var Pt = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Xi = (o) => {
  var t, e, n, a, r, c, l, u;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: d, stateHandler: p, setLoadingAction: g } = (0, _.useContext)(de), { flowState: f } = De(o.state), [C, A] = (0, _.useState)();
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: s("headlines.registerPassword") }), i(Ce, { state: f }), i(z, { children: s("texts.passwordFormatHint", { minLength: f.actions.register_password(null).inputs.new_password.min_length, maxLength: 72 }) }), i(ne, Object.assign({ onSubmit: (S) => Pt(void 0, void 0, void 0, function* () {
    S.preventDefault(), g("password-submit");
    const x = yield f.actions.register_password({ new_password: C }).run();
    g(null), yield d.flow.run(x, p);
  }) }, { children: [i(Re, { type: "password", autocomplete: "new-password", flowInput: f.actions.register_password(null).inputs.new_password, placeholder: s("labels.newPassword"), onInput: (S) => Pt(void 0, void 0, void 0, function* () {
    S.target instanceof HTMLInputElement && A(S.target.value);
  }), autofocus: !0 }), i(te, Object.assign({ uiAction: "password-submit" }, { children: s("labels.continue") }))] }))] }), i(Le, Object.assign({ hidden: !(!((e = (t = f.actions).back) === null || e === void 0) && e.call(t, null)) && !(!((a = (n = f.actions).skip) === null || a === void 0) && a.call(n, null)) }, { children: [i(ee, Object.assign({ uiAction: "back", onClick: (S) => Pt(void 0, void 0, void 0, function* () {
    S.preventDefault(), g("back");
    const x = yield f.actions.back(null).run();
    g(null), yield d.flow.run(x, p);
  }), loadingSpinnerPosition: "right", hidden: !(!((c = (r = f.actions).back) === null || c === void 0) && c.call(r, null)) }, { children: s("labels.back") })), i(ee, Object.assign({ uiAction: "skip", onClick: (S) => Pt(void 0, void 0, void 0, function* () {
    S.preventDefault(), g("skip");
    const x = yield f.actions.skip(null).run();
    g(null), yield d.flow.run(x, p);
  }), loadingSpinnerPosition: "left", hidden: !(!((u = (l = f.actions).skip) === null || u === void 0) && u.call(l, null)) }, { children: s("labels.skip") }))] }))] });
};
var $t = X(21), ft = {};
ft.setAttributes = Je(), ft.insert = (o) => {
  window._hankoStyle = o;
}, ft.domAPI = Ze(), ft.insertStyleElement = Qe(), Ve()($t.A, ft);
const Fe = $t.A && $t.A.locals ? $t.A.locals : void 0, nn = function({ name: o, columnSelector: t, contentSelector: e, data: n, checkedItemID: a, setCheckedItemID: r, dropdown: c = !1 }) {
  const l = (0, _.useCallback)((d) => `${o}-${d}`, [o]), u = (0, _.useCallback)((d) => l(d) === a, [a, l]), s = (d) => {
    if (!(d.target instanceof HTMLInputElement)) return;
    const p = parseInt(d.target.value, 10), g = l(p);
    r(g === a ? null : g);
  };
  return i("div", Object.assign({ className: Fe.accordion }, { children: n.map((d, p) => i("div", Object.assign({ className: Fe.accordionItem }, { children: [i("input", { type: "radio", className: Fe.accordionInput, id: `${o}-${p}`, name: o, onClick: s, value: p, checked: u(p) }), i("label", Object.assign({ className: Q()(Fe.label, c && Fe.dropdown), for: `${o}-${p}` }, { children: i("span", Object.assign({ className: Fe.labelText }, { children: t(d, p) })) })), i("div", Object.assign({ className: Q()(Fe.accordionContent, c && Fe.dropdownContent) }, { children: e(d, p) }))] }), p)) }));
}, Ne = ({ children: o }) => i("h2", Object.assign({ part: "headline2", className: Q()(Zt.headline, Zt.grade2) }, { children: o })), Gi = ({ onEmailDelete: o, onEmailSetPrimary: t, onEmailVerify: e, checkedItemID: n, setCheckedItemID: a, emails: r = [], deletableEmailIDs: c = [] }) => {
  const { t: l } = (0, _.useContext)(Z.TranslateContext), u = (0, _.useMemo)(() => !1, []);
  return i(nn, { name: "email-edit-dropdown", columnSelector: (s) => {
    const d = i("span", Object.assign({ className: Fe.description }, { children: s.is_verified ? s.is_primary ? i(O.Fragment, { children: [" -", " ", l("labels.primaryEmail")] }) : null : i(O.Fragment, { children: [" -", " ", l("labels.unverifiedEmail")] }) }));
    return s.is_primary ? i(O.Fragment, { children: [i("b", { children: s.address }), d] }) : i(O.Fragment, { children: [s.address, d] });
  }, data: r, contentSelector: (s) => {
    var d;
    return i(O.Fragment, { children: [s.is_primary ? i(O.Fragment, { children: i(z, { children: [i(Ne, { children: l("headlines.isPrimaryEmail") }), l("texts.isPrimaryEmail")] }) }) : i(O.Fragment, { children: i(z, { children: [i(Ne, { children: l("headlines.setPrimaryEmail") }), l("texts.setPrimaryEmail"), i("br", {}), i(ee, Object.assign({ uiAction: "email-set-primary", onClick: (p) => t(p, s.id), loadingSpinnerPosition: "right" }, { children: l("labels.setAsPrimaryEmail") }))] }) }), s.is_verified ? i(O.Fragment, { children: i(z, { children: [i(Ne, { children: l("headlines.emailVerified") }), l("texts.emailVerified")] }) }) : i(O.Fragment, { children: i(z, { children: [i(Ne, { children: l("headlines.emailUnverified") }), l("texts.emailUnverified"), i("br", {}), i(ee, Object.assign({ uiAction: "email-verify", onClick: (p) => e(p, s.id), loadingSpinnerPosition: "right" }, { children: l("labels.verify") }))] }) }), c.includes(s.id) ? i(O.Fragment, { children: i(z, { children: [i(Ne, { children: l("headlines.emailDelete") }), l("texts.emailDelete"), i("br", {}), i(ee, Object.assign({ uiAction: "email-delete", dangerous: !0, onClick: (p) => o(p, s.id), disabled: u, loadingSpinnerPosition: "right" }, { children: l("labels.delete") }))] }) }) : null, ((d = s.identities) === null || d === void 0 ? void 0 : d.length) > 0 ? i(O.Fragment, { children: i(z, { children: [i(Ne, { children: l("headlines.connectedAccounts") }), s.identities.map((p) => p.provider).join(", ")] }) }) : null] });
  }, checkedItemID: n, setCheckedItemID: a });
}, ea = ({ onCredentialNameSubmit: o, oldName: t, onBack: e, credential: n, credentialType: a }) => {
  const { t: r } = (0, _.useContext)(Z.TranslateContext), [c, l] = (0, _.useState)(t);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r(a === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), i(Ce, { flowError: null }), i(z, { children: r(a === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey") }), i(ne, Object.assign({ onSubmit: (u) => o(u, n.id, c) }, { children: [i(Re, { type: "text", name: a, value: c, minLength: 3, maxLength: 32, required: !0, placeholder: r(a === "security-key" ? "labels.newSecurityKeyName" : "labels.newPasskeyName"), onInput: (u) => {
    return s = void 0, d = void 0, g = function* () {
      u.target instanceof HTMLInputElement && l(u.target.value);
    }, new ((p = void 0) || (p = Promise))(function(f, C) {
      function A(I) {
        try {
          x(g.next(I));
        } catch (D) {
          C(D);
        }
      }
      function S(I) {
        try {
          x(g.throw(I));
        } catch (D) {
          C(D);
        }
      }
      function x(I) {
        var D;
        I.done ? f(I.value) : (D = I.value, D instanceof p ? D : new p(function(M) {
          M(D);
        })).then(A, S);
      }
      x((g = g.apply(s, d || [])).next());
    });
    var s, d, p, g;
  }, autofocus: !0 }), i(te, Object.assign({ uiAction: "webauthn-credential-rename" }, { children: r("labels.save") }))] }))] }), i(Le, { children: i(ee, Object.assign({ onClick: e, loadingSpinnerPosition: "right" }, { children: r("labels.back") })) })] });
}, eo = ({ credentials: o = [], checkedItemID: t, setCheckedItemID: e, onBack: n, onCredentialNameSubmit: a, onCredentialDelete: r, allowCredentialDeletion: c, credentialType: l }) => {
  const { t: u } = (0, _.useContext)(Z.TranslateContext), { setPage: s } = (0, _.useContext)(de), d = (g) => {
    if (g.name) return g.name;
    const f = g.public_key.replace(/[\W_]/g, "");
    return `${l === "security-key" ? "SecurityKey" : "Passkey"}-${f.substring(f.length - 7, f.length)}`;
  }, p = (g) => new Date(g).toLocaleString();
  return i(nn, { name: l === "security-key" ? "security-key-edit-dropdown" : "passkey-edit-dropdown", columnSelector: (g) => d(g), data: o, contentSelector: (g) => i(O.Fragment, { children: [i(z, { children: [i(Ne, { children: u(l === "security-key" ? "headlines.renameSecurityKey" : "headlines.renamePasskey") }), u(l === "security-key" ? "texts.renameSecurityKey" : "texts.renamePasskey"), i("br", {}), i(ee, Object.assign({ onClick: (f) => ((C, A, S) => {
    C.preventDefault(), s(i(ea, { oldName: d(A), credential: A, credentialType: S, onBack: n, onCredentialNameSubmit: a }));
  })(f, g, l), loadingSpinnerPosition: "right" }, { children: u("labels.rename") }))] }), i(z, Object.assign({ hidden: !c }, { children: [i(Ne, { children: u(l === "security-key" ? "headlines.deleteSecurityKey" : "headlines.deletePasskey") }), u(l === "security-key" ? "texts.deleteSecurityKey" : "texts.deletePasskey"), i("br", {}), i(ee, Object.assign({ uiAction: "password-delete", dangerous: !0, onClick: (f) => r(f, g.id), loadingSpinnerPosition: "right" }, { children: u("labels.delete") }))] })), i(z, { children: [i(Ne, { children: u("headlines.lastUsedAt") }), g.last_used_at ? p(g.last_used_at) : "-"] }), i(z, { children: [i(Ne, { children: u("headlines.createdAt") }), p(g.created_at)] })] }), checkedItemID: t, setCheckedItemID: e });
}, kt = ({ name: o, title: t, children: e, checkedItemID: n, setCheckedItemID: a }) => i(nn, { dropdown: !0, name: o, columnSelector: () => t, contentSelector: () => i(O.Fragment, { children: e }), setCheckedItemID: a, checkedItemID: n, data: [{}] }), Un = ({ flowError: o }) => {
  const { t } = (0, _.useContext)(Z.TranslateContext);
  return i(O.Fragment, { children: o ? i("div", Object.assign({ className: jo.errorMessage }, { children: t(`flowErrors.${o == null ? void 0 : o.code}`) })) : null });
}, ta = ({ inputs: o, onEmailSubmit: t, checkedItemID: e, setCheckedItemID: n }) => {
  var a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), [c, l] = (0, _.useState)();
  return i(kt, Object.assign({ name: "email-create-dropdown", title: r("labels.addEmail"), checkedItemID: e, setCheckedItemID: n }, { children: [i(Un, { flowError: (a = o.email) === null || a === void 0 ? void 0 : a.error }), i(ne, Object.assign({ onSubmit: (u) => t(u, c).then(() => l("")) }, { children: [i(Re, { markError: !0, type: "email", placeholder: r("labels.newEmailAddress"), onInput: (u) => {
    u.preventDefault(), u.target instanceof HTMLInputElement && l(u.target.value);
  }, value: c, flowInput: o.email }), i(te, Object.assign({ uiAction: "email-submit" }, { children: r("labels.save") }))] }))] }));
}, to = ({ inputs: o, checkedItemID: t, setCheckedItemID: e, onPasswordSubmit: n, onPasswordDelete: a, allowPasswordDelete: r, passwordExists: c }) => {
  var l, u, s;
  const { t: d } = (0, _.useContext)(Z.TranslateContext), [p, g] = (0, _.useState)("");
  return i(kt, Object.assign({ name: "password-edit-dropdown", title: d(c ? "labels.changePassword" : "labels.setPassword"), checkedItemID: t, setCheckedItemID: e }, { children: [i(z, { children: d("texts.passwordFormatHint", { minLength: (l = o.password.min_length) === null || l === void 0 ? void 0 : l.toString(10), maxLength: (u = o.password.max_length) === null || u === void 0 ? void 0 : u.toString(10) }) }), i(Un, { flowError: (s = o.password) === null || s === void 0 ? void 0 : s.error }), i(ne, Object.assign({ onSubmit: (f) => n(f, p).then(() => g("")) }, { children: [i(Re, { markError: !0, autoComplete: "new-password", placeholder: d("labels.newPassword"), type: "password", onInput: (f) => {
    f.preventDefault(), f.target instanceof HTMLInputElement && g(f.target.value);
  }, value: p, flowInput: o.password }), i(te, Object.assign({ uiAction: "password-submit" }, { children: d("labels.save") }))] })), i(ee, Object.assign({ hidden: !r, uiAction: "password-delete", dangerous: !0, onClick: (f) => a(f).then(() => g("")), loadingSpinnerPosition: "right" }, { children: d("labels.delete") }))] }));
}, no = ({ checkedItemID: o, setCheckedItemID: t, onCredentialSubmit: e, credentialType: n }) => {
  const { t: a } = (0, _.useContext)(Z.TranslateContext), r = tt.supported();
  return i(kt, Object.assign({ name: n === "security-key" ? "security-key-create-dropdown" : "passkey-create-dropdown", title: a(n === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey"), checkedItemID: o, setCheckedItemID: t }, { children: [i(z, { children: a(n === "security-key" ? "texts.securityKeySetUp" : "texts.setupPasskey") }), i(ne, Object.assign({ onSubmit: e }, { children: i(te, Object.assign({ uiAction: n === "security-key" ? "security-key-submit" : "passkey-submit", title: r ? null : a("labels.webauthnUnsupported") }, { children: a(n === "security-key" ? "labels.createSecurityKey" : "labels.createPasskey") })) }))] }));
}, oo = ({ inputs: o, checkedItemID: t, setCheckedItemID: e, onUsernameSubmit: n, onUsernameDelete: a, hasUsername: r, allowUsernameDeletion: c }) => {
  var l;
  const { t: u } = (0, _.useContext)(Z.TranslateContext), [s, d] = (0, _.useState)();
  return i(kt, Object.assign({ name: "username-edit-dropdown", title: u(r ? "labels.changeUsername" : "labels.setUsername"), checkedItemID: t, setCheckedItemID: e }, { children: [i(Un, { flowError: (l = o.username) === null || l === void 0 ? void 0 : l.error }), i(ne, Object.assign({ onSubmit: (p) => n(p, s).then(() => d("")) }, { children: [i(Re, { markError: !0, placeholder: u("labels.username"), type: "text", onInput: (p) => {
    p.preventDefault(), p.target instanceof HTMLInputElement && d(p.target.value);
  }, value: s, flowInput: o.username }), i(te, Object.assign({ uiAction: "username-set" }, { children: u("labels.save") }))] })), i(ee, Object.assign({ hidden: !c, uiAction: "username-delete", dangerous: !0, onClick: (p) => a(p).then(() => d("")), loadingSpinnerPosition: "right" }, { children: u("labels.delete") }))] }));
}, na = ({ onBack: o, onAccountDelete: t }) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: e("headlines.deleteAccount") }), i(Ce, { flowError: null }), i(z, { children: e("texts.deleteAccount") }), i(ne, Object.assign({ onSubmit: t }, { children: [i(Nn, { required: !0, type: "checkbox", label: e("labels.deleteAccount") }), i(te, Object.assign({ uiAction: "account_delete" }, { children: e("labels.delete") }))] }))] }), i(Le, { children: i(ee, Object.assign({ onClick: o }, { children: e("labels.back") })) })] });
}, oa = ({ sessions: o = [], checkedItemID: t, setCheckedItemID: e, onSessionDelete: n, deletableSessionIDs: a }) => {
  const { t: r } = (0, _.useContext)(Z.TranslateContext), c = (l) => new Date(l).toLocaleString();
  return i(nn, { name: "session-edit-dropdown", columnSelector: (l) => {
    const u = i("b", { children: l.user_agent ? l.user_agent : l.id }), s = l.current ? i("span", Object.assign({ className: Fe.description }, { children: i(O.Fragment, { children: [" -", " ", r("labels.currentSession")] }) })) : null;
    return i(O.Fragment, { children: [u, s] });
  }, data: o, contentSelector: (l) => i(O.Fragment, { children: [i(z, Object.assign({ hidden: !l.ip_address }, { children: [i(Ne, { children: r("headlines.ipAddress") }), l.ip_address] })), i(z, { children: [i(Ne, { children: r("headlines.lastUsed") }), c(l.last_used)] }), i(z, { children: [i(Ne, { children: r("headlines.createdAt") }), c(l.created_at)] }), a != null && a.includes(l.id) ? i(z, { children: [i(Ne, { children: r("headlines.revokeSession") }), i(ee, Object.assign({ uiAction: "session-delete", dangerous: !0, onClick: (u) => n(u, l.id), loadingSpinnerPosition: "right" }, { children: r("labels.revoke") }))] }) : null] }), checkedItemID: t, setCheckedItemID: e });
}, ia = ({ checkedItemID: o, setCheckedItemID: t, onDelete: e, onConnect: n, authAppSetUp: a, allowDeletion: r }) => {
  const { t: c } = (0, _.useContext)(Z.TranslateContext), l = i("span", Object.assign({ className: Fe.description }, { children: a ? i(O.Fragment, { children: [" -", " ", c("labels.configured")] }) : null })), u = i(O.Fragment, { children: [c("labels.authenticatorAppManage"), " ", l] });
  return i(kt, Object.assign({ name: "authenticator-app-manage-dropdown", title: u, checkedItemID: o, setCheckedItemID: t }, { children: [i(Ne, { children: c(a ? "headlines.authenticatorAppAlreadySetUp" : "headlines.authenticatorAppNotSetUp") }), i(z, { children: [c(a ? "texts.authenticatorAppAlreadySetUp" : "texts.authenticatorAppNotSetUp"), i("br", {}), i(ee, a ? Object.assign({ hidden: !r, uiAction: "auth-app-remove", onClick: (s) => e(s), loadingSpinnerPosition: "right", dangerous: !0 }, { children: c("labels.delete") }) : Object.assign({ uiAction: "auth-app-add", onClick: (s) => n(s), loadingSpinnerPosition: "right" }, { children: c("labels.authenticatorAppAdd") }))] })] }));
};
var Ie = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Po = (o) => {
  var t, e, n, a, r, c, l, u, s, d, p, g, f, C, A, S, x, I, D, M, U, ie, ge, ae, be, H, F, me, Pe, Oe, Ee, re, se, ue, Ae, k, h, b, T, K, he, Me, Ue, He, m, v, y, E, N, P, q, G;
  const { t: Y } = (0, _.useContext)(Z.TranslateContext), { hanko: ve, setLoadingAction: w, stateHandler: _e, setUIState: J, setPage: W } = (0, _.useContext)(de), { flowState: j } = De(o.state), [ye, B] = (0, _.useState)(""), $ = (R, V, $e) => Ie(void 0, void 0, void 0, function* () {
    R.preventDefault(), w(V);
    const on = yield $e();
    on != null && on.error || (B(null), yield new Promise((Lo) => setTimeout(Lo, 360))), w(null), yield ve.flow.run(on, _e);
  }), Te = (R) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "password-delete", j.actions.password_delete(null).run);
  }), Ye = (R) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "username-delete", j.actions.username_delete(null).run);
  }), pe = (R, V, $e) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "webauthn-credential-rename", j.actions.webauthn_credential_rename({ passkey_id: V, passkey_name: $e }).run);
  }), xt = (R) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "account_delete", j.actions.account_delete(null).run);
  }), Xe = (R) => (R.preventDefault(), W(i(Po, { state: j, enablePasskeys: o.enablePasskeys })), Promise.resolve());
  return i(Se, { children: [i(Ce, { state: ((t = j == null ? void 0 : j.error) === null || t === void 0 ? void 0 : t.code) !== "form_data_invalid_error" ? j : null }), !((n = (e = j.actions).username_create) === null || n === void 0) && n.call(e, null) || !((r = (a = j.actions).username_update) === null || r === void 0) && r.call(a, null) || !((l = (c = j.actions).username_delete) === null || l === void 0) && l.call(c, null) ? i(O.Fragment, { children: [i(ce, { children: Y("labels.username") }), j.payload.user.username ? i(z, { children: i("b", { children: j.payload.user.username.username }) }) : null, i(z, { children: [!((s = (u = j.actions).username_create) === null || s === void 0) && s.call(u, null) ? i(oo, { inputs: j.actions.username_create(null).inputs, hasUsername: !!j.payload.user.username, allowUsernameDeletion: !!(!((p = (d = j.actions).username_delete) === null || p === void 0) && p.call(d, null)), onUsernameSubmit: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "username-set", j.actions.username_create({ username: V }).run);
  }), onUsernameDelete: Ye, checkedItemID: ye, setCheckedItemID: B }) : null, !((f = (g = j.actions).username_update) === null || f === void 0) && f.call(g, null) ? i(oo, { inputs: j.actions.username_update(null).inputs, hasUsername: !!j.payload.user.username, allowUsernameDeletion: !!(!((A = (C = j.actions).username_delete) === null || A === void 0) && A.call(C, null)), onUsernameSubmit: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "username-set", j.actions.username_update({ username: V }).run);
  }), onUsernameDelete: Ye, checkedItemID: ye, setCheckedItemID: B }) : null] })] }) : null, !((x = (S = j.payload) === null || S === void 0 ? void 0 : S.user) === null || x === void 0) && x.emails || !((D = (I = j.actions).email_create) === null || D === void 0) && D.call(I, null) ? i(O.Fragment, { children: [i(ce, { children: Y("headlines.profileEmails") }), i(z, { children: [i(Gi, { emails: j.payload.user.emails, onEmailDelete: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "email-delete", j.actions.email_delete({ email_id: V }).run);
  }), onEmailSetPrimary: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "email-set-primary", j.actions.email_set_primary({ email_id: V }).run);
  }), onEmailVerify: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "email-verify", j.actions.email_verify({ email_id: V }).run);
  }), checkedItemID: ye, setCheckedItemID: B, deletableEmailIDs: (ie = (U = (M = j.actions).email_delete) === null || U === void 0 ? void 0 : U.call(M, null).inputs.email_id.allowed_values) === null || ie === void 0 ? void 0 : ie.map((R) => R.value) }), !((ae = (ge = j.actions).email_create) === null || ae === void 0) && ae.call(ge, null) ? i(ta, { inputs: j.actions.email_create(null).inputs, onEmailSubmit: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return J(($e) => Object.assign(Object.assign({}, $e), { email: V })), $(R, "email-submit", j.actions.email_create({ email: V }).run);
  }), checkedItemID: ye, setCheckedItemID: B }) : null] })] }) : null, !((H = (be = j.actions).password_create) === null || H === void 0) && H.call(be, null) ? i(O.Fragment, { children: [i(ce, { children: Y("headlines.profilePassword") }), i(z, { children: i(to, { inputs: j.actions.password_create(null).inputs, onPasswordSubmit: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "password-submit", j.actions.password_create({ password: V }).run);
  }), onPasswordDelete: Te, checkedItemID: ye, setCheckedItemID: B }) })] }) : null, !((me = (F = j.actions).password_update) === null || me === void 0) && me.call(F, null) ? i(O.Fragment, { children: [i(ce, { children: Y("headlines.profilePassword") }), i(z, { children: i(to, { allowPasswordDelete: !!(!((Oe = (Pe = j.actions).password_delete) === null || Oe === void 0) && Oe.call(Pe, null)), inputs: j.actions.password_update(null).inputs, onPasswordSubmit: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "password-submit", j.actions.password_update({ password: V }).run);
  }), onPasswordDelete: Te, checkedItemID: ye, setCheckedItemID: B, passwordExists: !0 }) })] }) : null, o.enablePasskeys && (!((re = (Ee = j.payload) === null || Ee === void 0 ? void 0 : Ee.user) === null || re === void 0) && re.passkeys || !((ue = (se = j.actions).webauthn_credential_create) === null || ue === void 0) && ue.call(se, null)) ? i(O.Fragment, { children: [i(ce, { children: Y("headlines.profilePasskeys") }), i(z, { children: [i(eo, { onBack: Xe, onCredentialNameSubmit: pe, onCredentialDelete: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "passkey-delete", j.actions.webauthn_credential_delete({ passkey_id: V }).run);
  }), credentials: j.payload.user.passkeys, setError: null, checkedItemID: ye, setCheckedItemID: B, allowCredentialDeletion: !!(!((k = (Ae = j.actions).webauthn_credential_delete) === null || k === void 0) && k.call(Ae, null)), credentialType: "passkey" }), !((b = (h = j.actions).webauthn_credential_create) === null || b === void 0) && b.call(h, null) ? i(no, { credentialType: "passkey", onCredentialSubmit: (R) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "passkey-submit", j.actions.webauthn_credential_create(null).run);
  }), setError: null, checkedItemID: ye, setCheckedItemID: B }) : null] })] }) : null, !((T = j.payload.user.mfa_config) === null || T === void 0) && T.security_keys_enabled ? i(O.Fragment, { children: [i(ce, { children: Y("headlines.securityKeys") }), i(z, { children: [i(eo, { onBack: Xe, onCredentialNameSubmit: pe, onCredentialDelete: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "security-key-delete", j.actions.security_key_delete({ security_key_id: V }).run);
  }), credentials: j.payload.user.security_keys, setError: null, checkedItemID: ye, setCheckedItemID: B, allowCredentialDeletion: !!(!((he = (K = j.actions).security_key_delete) === null || he === void 0) && he.call(K, null)), credentialType: "security-key" }), !((Ue = (Me = j.actions).security_key_create) === null || Ue === void 0) && Ue.call(Me, null) ? i(no, { credentialType: "security-key", onCredentialSubmit: (R) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "security-key-submit", j.actions.security_key_create(null).run);
  }), setError: null, checkedItemID: ye, setCheckedItemID: B }) : null] })] }) : null, !((He = j.payload.user.mfa_config) === null || He === void 0) && He.totp_enabled ? i(O.Fragment, { children: [i(ce, { children: Y("headlines.authenticatorApp") }), i(z, { children: i(ia, { onConnect: (R) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "auth-app-add", j.actions.continue_to_otp_secret_creation(null).run);
  }), onDelete: (R) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "auth-app-remove", j.actions.otp_secret_delete(null).run);
  }), allowDeletion: !!(!((v = (m = j.actions).otp_secret_delete) === null || v === void 0) && v.call(m, null)), authAppSetUp: (y = j.payload.user.mfa_config) === null || y === void 0 ? void 0 : y.auth_app_set_up, checkedItemID: ye, setCheckedItemID: B }) })] }) : null, j.payload.sessions ? i(O.Fragment, { children: [i(ce, { children: Y("headlines.profileSessions") }), i(z, { children: i(oa, { sessions: j.payload.sessions, setError: null, checkedItemID: ye, setCheckedItemID: B, onSessionDelete: (R, V) => Ie(void 0, void 0, void 0, function* () {
    return $(R, "session-delete", j.actions.session_delete({ session_id: V }).run);
  }), deletableSessionIDs: (P = (N = (E = j.actions).session_delete) === null || N === void 0 ? void 0 : N.call(E, null).inputs.session_id.allowed_values) === null || P === void 0 ? void 0 : P.map((R) => R.value) }) })] }) : null, !((G = (q = j.actions).account_delete) === null || G === void 0) && G.call(q, null) ? i(O.Fragment, { children: [i(tn, {}), i(z, { children: i(Tn, {}) }), i(z, { children: i(ne, Object.assign({ onSubmit: (R) => (R.preventDefault(), W(i(na, { onBack: Xe, onAccountDelete: xt })), Promise.resolve()) }, { children: i(te, Object.assign({ dangerous: !0 }, { children: Y("headlines.deleteAccount") })) })) })] }) : null] });
}, aa = Po, io = ({ state: o, error: t }) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext), { init: n, componentName: a } = (0, _.useContext)(de), r = (0, _.useCallback)(() => n(a), [a, n]);
  return (0, _.useEffect)(() => (addEventListener("hankoAuthSuccess", r), () => {
    removeEventListener("hankoAuthSuccess", r);
  }), [r]), i(Se, { children: [i(ce, { children: e("headlines.error") }), i(Ce, { state: o, error: t }), i(ne, Object.assign({ onSubmit: (c) => {
    c.preventDefault(), r();
  } }, { children: i(te, Object.assign({ uiAction: "retry" }, { children: e("labels.continue") })) }))] });
};
var un = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const ra = (o) => {
  var t, e, n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { hanko: c, stateHandler: l, setLoadingAction: u } = (0, _.useContext)(de), { flowState: s } = De(o.state), [d, p] = (0, _.useState)();
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r("headlines.createEmail") }), i(Ce, { state: s }), i(ne, Object.assign({ onSubmit: (g) => un(void 0, void 0, void 0, function* () {
    g.preventDefault(), u("email-submit");
    const f = yield s.actions.email_address_set({ email: d }).run();
    u(null), yield c.flow.run(f, l);
  }) }, { children: [i(Re, { type: "email", autoComplete: "email", autoCorrect: "off", flowInput: (e = (t = s.actions).email_address_set) === null || e === void 0 ? void 0 : e.call(t, null).inputs.email, onInput: (g) => un(void 0, void 0, void 0, function* () {
    g.target instanceof HTMLInputElement && p(g.target.value);
  }), placeholder: r("labels.email"), pattern: "^.*[^0-9]+$", value: d }), i(te, Object.assign({ uiAction: "email-submit" }, { children: r("labels.continue") }))] }))] }), i(Le, Object.assign({ hidden: !(!((a = (n = s.actions).skip) === null || a === void 0) && a.call(n, null)) }, { children: [i("span", { hidden: !0 }), i(ee, Object.assign({ uiAction: "skip", onClick: (g) => un(void 0, void 0, void 0, function* () {
    g.preventDefault(), u("skip");
    const f = yield s.actions.skip(null).run();
    u(null), yield c.flow.run(f, l);
  }), loadingSpinnerPosition: "left" }, { children: r("labels.skip") }))] }))] });
};
var hn = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const sa = (o) => {
  var t, e, n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { hanko: c, stateHandler: l, setLoadingAction: u } = (0, _.useContext)(de), { flowState: s } = De(o.state), [d, p] = (0, _.useState)();
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r("headlines.createUsername") }), i(Ce, { state: s }), i(ne, Object.assign({ onSubmit: (g) => hn(void 0, void 0, void 0, function* () {
    g.preventDefault(), u("username-set");
    const f = yield s.actions.username_create({ username: d }).run();
    u(null), yield c.flow.run(f, l);
  }) }, { children: [i(Re, { type: "text", autoComplete: "username", autoCorrect: "off", flowInput: (e = (t = s.actions).username_create) === null || e === void 0 ? void 0 : e.call(t, null).inputs.username, onInput: (g) => hn(void 0, void 0, void 0, function* () {
    g.target instanceof HTMLInputElement && p(g.target.value);
  }), value: d, placeholder: r("labels.username") }), i(te, Object.assign({ uiAction: "username-set" }, { children: r("labels.continue") }))] }))] }), i(Le, Object.assign({ hidden: !(!((a = (n = s.actions).skip) === null || a === void 0) && a.call(n, null)) }, { children: [i("span", { hidden: !0 }), i(ee, Object.assign({ uiAction: "skip", onClick: (g) => hn(void 0, void 0, void 0, function* () {
    g.preventDefault(), u("skip");
    const f = yield s.actions.skip(null).run();
    u(null), yield c.flow.run(f, l);
  }), loadingSpinnerPosition: "left" }, { children: r("labels.skip") }))] }))] });
};
var Et = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const la = (o) => {
  var t, e, n, a, r, c, l, u, s, d, p, g;
  const { t: f } = (0, _.useContext)(Z.TranslateContext), { hanko: C, setLoadingAction: A, stateHandler: S } = (0, _.useContext)(de), { flowState: x } = De(o.state);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: f("headlines.setupLoginMethod") }), i(Ce, { flowError: x == null ? void 0 : x.error }), i(z, { children: f("texts.selectLoginMethodForFutureLogins") }), i(ne, Object.assign({ hidden: !(!((e = (t = x.actions).continue_to_passkey_registration) === null || e === void 0) && e.call(t, null)), onSubmit: (I) => Et(void 0, void 0, void 0, function* () {
    I.preventDefault(), A("passkey-submit");
    const D = yield x.actions.continue_to_passkey_registration(null).run();
    A(null), yield C.flow.run(D, S);
  }) }, { children: i(te, Object.assign({ secondary: !0, uiAction: "passkey-submit", icon: "passkey" }, { children: f("labels.passkey") })) })), i(ne, Object.assign({ hidden: !(!((a = (n = x.actions).continue_to_password_registration) === null || a === void 0) && a.call(n, null)), onSubmit: (I) => Et(void 0, void 0, void 0, function* () {
    I.preventDefault(), A("password-submit");
    const D = yield x.actions.continue_to_password_registration(null).run();
    A(null), yield C.flow.run(D, S);
  }) }, { children: i(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "password" }, { children: f("labels.password") })) }))] }), i(Le, Object.assign({ hidden: !(!((c = (r = x.actions).back) === null || c === void 0) && c.call(r, null)) && !(!((u = (l = x.actions).skip) === null || u === void 0) && u.call(l, null)) }, { children: [i(ee, Object.assign({ uiAction: "back", onClick: (I) => Et(void 0, void 0, void 0, function* () {
    I.preventDefault(), A("back");
    const D = yield x.actions.back(null).run();
    A(null), yield C.flow.run(D, S);
  }), loadingSpinnerPosition: "right", hidden: !(!((d = (s = x.actions).back) === null || d === void 0) && d.call(s, null)) }, { children: f("labels.back") })), i(ee, Object.assign({ uiAction: "skip", onClick: (I) => Et(void 0, void 0, void 0, function* () {
    I.preventDefault(), A("skip");
    const D = yield x.actions.skip(null).run();
    A(null), yield C.flow.run(D, S);
  }), loadingSpinnerPosition: "left", hidden: !(!((g = (p = x.actions).skip) === null || g === void 0) && g.call(p, null)) }, { children: f("labels.skip") }))] }))] });
};
var pn = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const ca = (o) => {
  var t, e, n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { flowState: c } = De(o.state), { hanko: l, setLoadingAction: u, stateHandler: s } = (0, _.useContext)(de), [d, p] = (0, _.useState)([]), g = (0, _.useCallback)((f) => pn(void 0, void 0, void 0, function* () {
    u("passcode-submit");
    const C = yield c.actions.otp_code_validate({ otp_code: f }).run();
    u(null), yield l.flow.run(C, s);
  }), [l, c, u, s]);
  return (0, _.useEffect)(() => {
    var f;
    ((f = c.error) === null || f === void 0 ? void 0 : f.code) === "passcode_invalid" && p([]);
  }, [c]), i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r("headlines.otpLogin") }), i(Ce, { state: c }), i(z, { children: r("texts.otpLogin") }), i(ne, Object.assign({ onSubmit: (f) => pn(void 0, void 0, void 0, function* () {
    return f.preventDefault(), g(d.join(""));
  }) }, { children: [i(Mn, { onInput: (f) => {
    if (p(f), f.filter((C) => C !== "").length === 6) return g(f.join(""));
  }, passcodeDigits: d, numberOfInputs: 6 }), i(te, Object.assign({ uiAction: "passcode-submit" }, { children: r("labels.continue") }))] }))] }), i(Le, Object.assign({ hidden: !(!((e = (t = c.actions).continue_to_login_security_key) === null || e === void 0) && e.call(t, null)) }, { children: i(ee, Object.assign({ uiAction: "skip", onClick: (f) => pn(void 0, void 0, void 0, function* () {
    f.preventDefault(), u("skip");
    const C = yield c.actions.continue_to_login_security_key(null).run();
    u(null), yield l.flow.run(C, s);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (n = c.actions).continue_to_login_security_key) === null || a === void 0) && a.call(n, null)) }, { children: r("labels.useAnotherMethod") })) }))] });
};
var ao = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const da = (o) => {
  var t, e, n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { hanko: c, setLoadingAction: l, stateHandler: u } = (0, _.useContext)(de), { flowState: s } = De(o.state);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r("headlines.securityKeyLogin") }), i(Ce, { state: s }), i(z, { children: r("texts.securityKeyLogin") }), i(ne, Object.assign({ onSubmit: (d) => ao(void 0, void 0, void 0, function* () {
    d.preventDefault(), l("passkey-submit");
    const p = yield s.actions.webauthn_generate_request_options(null).run();
    yield c.flow.run(p, u);
  }) }, { children: i(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "securityKey" }, { children: r("labels.securityKeyUse") })) }))] }), i(Le, Object.assign({ hidden: !(!((e = (t = s.actions).continue_to_login_otp) === null || e === void 0) && e.call(t, null)) }, { children: i(ee, Object.assign({ uiAction: "skip", onClick: (d) => ao(void 0, void 0, void 0, function* () {
    d.preventDefault(), l("skip");
    const p = yield s.actions.continue_to_login_otp(null).run();
    l(null), yield c.flow.run(p, u);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (n = s.actions).continue_to_login_otp) === null || a === void 0) && a.call(n, null)) }, { children: r("labels.useAnotherMethod") })) }))] });
};
var Dt = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const ua = (o) => {
  var t, e, n, a, r, c, l, u;
  const { t: s } = (0, _.useContext)(Z.TranslateContext), { hanko: d, setLoadingAction: p, stateHandler: g } = (0, _.useContext)(de), { flowState: f } = De(o.state), C = (x) => Dt(void 0, void 0, void 0, function* () {
    x.preventDefault(), p("passcode-submit");
    const I = yield f.actions.continue_to_security_key_creation(null).run();
    p(null), yield d.flow.run(I, g);
  }), A = (x) => Dt(void 0, void 0, void 0, function* () {
    x.preventDefault(), p("password-submit");
    const I = yield f.actions.continue_to_otp_secret_creation(null).run();
    p(null), yield d.flow.run(I, g);
  }), S = (0, _.useMemo)(() => {
    const { actions: x } = f;
    return x.continue_to_security_key_creation && !x.continue_to_otp_secret_creation ? C : !x.continue_to_security_key_creation && x.continue_to_otp_secret_creation ? A : void 0;
  }, [f, C, A]);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: s("headlines.mfaSetUp") }), i(Ce, { flowError: f == null ? void 0 : f.error }), i(z, { children: s("texts.mfaSetUp") }), S ? i(ne, Object.assign({ onSubmit: S }, { children: i(te, Object.assign({ uiAction: "passcode-submit" }, { children: s("labels.continue") })) })) : i(O.Fragment, { children: [i(ne, Object.assign({ hidden: !(!((e = (t = f.actions).continue_to_security_key_creation) === null || e === void 0) && e.call(t, null)), onSubmit: C }, { children: i(te, Object.assign({ secondary: !0, uiAction: "passcode-submit", icon: "securityKey" }, { children: s("labels.securityKey") })) })), i(ne, Object.assign({ hidden: !(!((a = (n = f.actions).continue_to_otp_secret_creation) === null || a === void 0) && a.call(n, null)), onSubmit: A }, { children: i(te, Object.assign({ secondary: !0, uiAction: "password-submit", icon: "qrCodeScanner" }, { children: s("labels.authenticatorApp") })) }))] })] }), i(Le, { children: [i(ee, Object.assign({ uiAction: "back", onClick: (x) => Dt(void 0, void 0, void 0, function* () {
    x.preventDefault(), p("back");
    const I = yield f.actions.back(null).run();
    p(null), yield d.flow.run(I, g);
  }), loadingSpinnerPosition: "right", hidden: !(!((c = (r = f.actions).back) === null || c === void 0) && c.call(r, null)) }, { children: s("labels.back") })), i(ee, Object.assign({ uiAction: "skip", onClick: (x) => Dt(void 0, void 0, void 0, function* () {
    x.preventDefault(), p("skip");
    const I = yield f.actions.skip(null).run();
    p(null), yield d.flow.run(I, g);
  }), loadingSpinnerPosition: "left", hidden: !(!((u = (l = f.actions).skip) === null || u === void 0) && u.call(l, null)) }, { children: s("labels.skip") }))] })] });
};
var Kt = X(560), mt = {};
mt.setAttributes = Je(), mt.insert = (o) => {
  window._hankoStyle = o;
}, mt.domAPI = Ze(), mt.insertStyleElement = Qe(), Ve()(Kt.A, mt);
const ha = Kt.A && Kt.A.locals ? Kt.A.locals : void 0, pa = ({ children: o, text: t }) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext), [n, a] = (0, _.useState)(!1);
  return i("section", Object.assign({ className: _t.clipboardContainer }, { children: [i("div", { children: [o, " "] }), i("div", Object.assign({ className: _t.clipboardIcon, onClick: (r) => {
    return c = void 0, l = void 0, s = function* () {
      r.preventDefault();
      try {
        yield navigator.clipboard.writeText(t), a(!0), setTimeout(() => a(!1), 1500);
      } catch (d) {
        console.error("Failed to copy: ", d);
      }
    }, new ((u = void 0) || (u = Promise))(function(d, p) {
      function g(A) {
        try {
          C(s.next(A));
        } catch (S) {
          p(S);
        }
      }
      function f(A) {
        try {
          C(s.throw(A));
        } catch (S) {
          p(S);
        }
      }
      function C(A) {
        var S;
        A.done ? d(A.value) : (S = A.value, S instanceof u ? S : new u(function(x) {
          x(S);
        })).then(g, f);
      }
      C((s = s.apply(c, l || [])).next());
    });
    var c, l, u, s;
  } }, { children: n ? i("span", { children: ["- ", e("labels.copied")] }) : i(bt, { name: "copy", secondary: !0, size: 13 }) }))] }));
}, fa = ({ src: o, secret: t }) => {
  const { t: e } = (0, _.useContext)(Z.TranslateContext);
  return i("div", Object.assign({ className: ha.otpCreationDetails }, { children: [i("img", { alt: "QR-Code", src: o }), i(tn, {}), i(pa, Object.assign({ text: t }, { children: e("texts.otpSecretKey") })), i("div", { children: t })] }));
};
var fn = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const ma = (o) => {
  const { t } = (0, _.useContext)(Z.TranslateContext), { flowState: e } = De(o.state), { hanko: n, uiState: a, setLoadingAction: r, stateHandler: c } = (0, _.useContext)(de), [l, u] = (0, _.useState)([]), s = (0, _.useCallback)((d) => fn(void 0, void 0, void 0, function* () {
    r("passcode-submit");
    const p = yield e.actions.otp_code_verify({ otp_code: d }).run();
    r(null), yield n.flow.run(p, c);
  }), [e, r, c]);
  return (0, _.useEffect)(() => {
    var d;
    ((d = e.error) === null || d === void 0 ? void 0 : d.code) === "passcode_invalid" && u([]);
  }, [e]), i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: t("headlines.otpSetUp") }), i(Ce, { state: e }), i(z, { children: t("texts.otpScanQRCode") }), i(fa, { src: e.payload.otp_image_source, secret: e.payload.otp_secret }), i(z, { children: t("texts.otpEnterVerificationCode") }), i(ne, Object.assign({ onSubmit: (d) => fn(void 0, void 0, void 0, function* () {
    return d.preventDefault(), s(l.join(""));
  }) }, { children: [i(Mn, { onInput: (d) => {
    if (u(d), d.filter((p) => p !== "").length === 6) return s(d.join(""));
  }, passcodeDigits: l, numberOfInputs: 6 }), i(te, Object.assign({ uiAction: "passcode-submit" }, { children: t("labels.continue") }))] }))] }), i(Le, { children: i(ee, Object.assign({ onClick: (d) => fn(void 0, void 0, void 0, function* () {
    d.preventDefault(), r("back");
    const p = yield e.actions.back(null).run();
    r(null), yield n.flow.run(p, c);
  }), loadingSpinnerPosition: "right", isLoading: a.loadingAction === "back" }, { children: t("labels.back") })) })] });
};
var ro = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const va = (o) => {
  var t, e, n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { hanko: c, setLoadingAction: l, stateHandler: u } = (0, _.useContext)(de), { flowState: s } = De(o.state);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r("headlines.securityKeySetUp") }), i(Ce, { state: s }), i(z, { children: r("texts.securityKeySetUp") }), i(ne, Object.assign({ onSubmit: (d) => ro(void 0, void 0, void 0, function* () {
    d.preventDefault(), l("passkey-submit");
    const p = yield s.actions.webauthn_generate_creation_options(null).run();
    yield c.flow.run(p, u);
  }) }, { children: i(te, Object.assign({ uiAction: "passkey-submit", autofocus: !0, icon: "securityKey" }, { children: r("labels.createSecurityKey") })) }))] }), i(Le, Object.assign({ hidden: !(!((e = (t = s.actions).back) === null || e === void 0) && e.call(t, null)) }, { children: i(ee, Object.assign({ uiAction: "back", onClick: (d) => ro(void 0, void 0, void 0, function* () {
    d.preventDefault(), l("back");
    const p = yield s.actions.back(null).run();
    l(null), yield c.flow.run(p, u);
  }), loadingSpinnerPosition: "right", hidden: !(!((a = (n = s.actions).back) === null || a === void 0) && a.call(n, null)) }, { children: r("labels.back") })) }))] });
};
var mn = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const ga = (o) => {
  var t, e, n, a;
  const { t: r } = (0, _.useContext)(Z.TranslateContext), { hanko: c, setLoadingAction: l, stateHandler: u } = (0, _.useContext)(de), { flowState: s } = De(o.state);
  return i(O.Fragment, { children: [i(Se, { children: [i(ce, { children: r("headlines.trustDevice") }), i(Ce, { flowError: s == null ? void 0 : s.error }), i(z, { children: r("texts.trustDevice") }), i(ne, Object.assign({ onSubmit: (d) => mn(void 0, void 0, void 0, function* () {
    d.preventDefault(), l("trust-device-submit");
    const p = yield s.actions.trust_device(null).run();
    l(null), yield c.flow.run(p, u);
  }) }, { children: i(te, Object.assign({ uiAction: "trust-device-submit" }, { children: r("labels.trustDevice") })) }))] }), i(Le, { children: [i(ee, Object.assign({ uiAction: "back", onClick: (d) => mn(void 0, void 0, void 0, function* () {
    d.preventDefault(), l("back");
    const p = yield s.actions.back(null).run();
    l(null), yield c.flow.run(p, u);
  }), loadingSpinnerPosition: "right", hidden: !(!((e = (t = s.actions).back) === null || e === void 0) && e.call(t, null)) }, { children: r("labels.back") })), i(ee, Object.assign({ uiAction: "skip", onClick: (d) => mn(void 0, void 0, void 0, function* () {
    d.preventDefault(), l("skip");
    const p = yield s.actions.skip(null).run();
    l(null), yield c.flow.run(p, u);
  }), loadingSpinnerPosition: "left", hidden: !(!((a = (n = s.actions).skip) === null || a === void 0) && a.call(n, null)) }, { children: r("labels.skip") }))] })] });
};
var We = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Lt = "flow-state", de = (0, O.createContext)(null), _a = (o) => {
  var { lang: t, experimental: e = "", prefilledEmail: n, prefilledUsername: a, globalOptions: r, createWebauthnAbortSignal: c } = o, l = function(h, b) {
    var T = {};
    for (var K in h) Object.prototype.hasOwnProperty.call(h, K) && b.indexOf(K) < 0 && (T[K] = h[K]);
    if (h != null && typeof Object.getOwnPropertySymbols == "function") {
      var he = 0;
      for (K = Object.getOwnPropertySymbols(h); he < K.length; he++) b.indexOf(K[he]) < 0 && Object.prototype.propertyIsEnumerable.call(h, K[he]) && (T[K[he]] = h[K[he]]);
    }
    return T;
  }(o, ["lang", "experimental", "prefilledEmail", "prefilledUsername", "globalOptions", "createWebauthnAbortSignal"]);
  const { hanko: u, injectStyles: s, hidePasskeyButtonOnLogin: d, translations: p, translationsLocation: g, fallbackLanguage: f } = r;
  u.setLang((t == null ? void 0 : t.toString()) || f);
  const C = (0, _.useRef)(null), A = (0, _.useMemo)(() => `${r.storageKey}_last_login`, [r.storageKey]), [S, x] = (0, _.useState)(l.componentName), I = (0, _.useMemo)(() => e.split(" ").filter((h) => h.length).map((h) => h), [e]), D = (0, _.useMemo)(() => i(qi, {}), []), [M, U] = (0, _.useState)(D), [, ie] = (0, _.useState)(u), [ge, ae] = (0, _.useState)(), [be, H] = (0, _.useState)({ email: n, username: a }), F = (0, _.useCallback)((h) => {
    H((b) => Object.assign(Object.assign({}, b), { loadingAction: h, succeededAction: null, error: null, lastAction: h || b.lastAction }));
  }, []), me = (0, _.useCallback)((h) => {
    H((b) => Object.assign(Object.assign({}, b), { succeededAction: h, loadingAction: null }));
  }, []), Pe = (0, _.useCallback)(() => {
    H((h) => Object.assign(Object.assign({}, h), { succeededAction: h.lastAction, loadingAction: null, error: null }));
  }, []), Oe = (0, _.useMemo)(() => !!be.loadingAction || !!be.succeededAction, [be]), Ee = function(h, b) {
    var T;
    (T = C.current) === null || T === void 0 || T.dispatchEvent(new CustomEvent(h, { detail: b, bubbles: !1, composed: !0 }));
  }, re = (h) => {
    F(null), U(i(io, { error: h instanceof we ? h : new je(h) }));
  }, se = (0, _.useMemo)(() => ({ onError: (h) => {
    re(h);
  }, preflight(h) {
    return We(this, void 0, void 0, function* () {
      const b = yield tt.isConditionalMediationAvailable(), T = yield tt.isPlatformAuthenticatorAvailable(), K = yield h.actions.register_client_capabilities({ webauthn_available: k, webauthn_conditional_mediation_available: b, webauthn_platform_authenticator_available: T }).run();
      return u.flow.run(K, se);
    });
  }, login_init(h) {
    return We(this, void 0, void 0, function* () {
      U(i(zi, { state: h })), function() {
        We(this, void 0, void 0, function* () {
          if (h.payload.request_options) {
            let b;
            try {
              b = yield Yn({ publicKey: h.payload.request_options.publicKey, mediation: "conditional", signal: c() });
            } catch {
              return;
            }
            F("passkey-submit");
            const T = yield h.actions.webauthn_verify_assertion_response({ assertion_response: b }).run();
            F(null), yield u.flow.run(T, se);
          }
        });
      }();
    });
  }, passcode_confirmation(h) {
    U(i(Bi, { state: h }));
  }, login_otp(h) {
    return We(this, void 0, void 0, function* () {
      U(i(ca, { state: h }));
    });
  }, login_passkey(h) {
    return We(this, void 0, void 0, function* () {
      let b;
      F("passkey-submit");
      try {
        b = yield Yn(Object.assign(Object.assign({}, h.payload.request_options), { signal: c() }));
      } catch {
        const he = yield h.actions.back(null).run();
        return H((Me) => Object.assign(Object.assign({}, Me), { error: h.error, loadingAction: null })), u.flow.run(he, se);
      }
      const T = yield h.actions.webauthn_verify_assertion_response({ assertion_response: b }).run();
      F(null), yield u.flow.run(T, se);
    });
  }, onboarding_create_passkey(h) {
    U(i(Vi, { state: h }));
  }, onboarding_verify_passkey_attestation(h) {
    return We(this, void 0, void 0, function* () {
      let b;
      try {
        b = yield Qn(Object.assign(Object.assign({}, h.payload.creation_options), { signal: c() }));
      } catch {
        const he = yield h.actions.back(null).run();
        return F(null), yield u.flow.run(he, se), void H((Me) => Object.assign(Object.assign({}, Me), { error: { code: "webauthn_credential_already_exists", message: "Webauthn credential already exists" } }));
      }
      const T = yield h.actions.webauthn_verify_attestation_response({ public_key: b }).run();
      F(null), yield u.flow.run(T, se);
    });
  }, webauthn_credential_verification(h) {
    return We(this, void 0, void 0, function* () {
      let b;
      try {
        b = yield Qn(Object.assign(Object.assign({}, h.payload.creation_options), { signal: c() }));
      } catch {
        const he = yield h.actions.back(null).run();
        return F(null), yield u.flow.run(he, se), void H((Me) => Object.assign(Object.assign({}, Me), { error: { code: "webauthn_credential_already_exists", message: "Webauthn credential already exists" } }));
      }
      const T = yield h.actions.webauthn_verify_attestation_response({ public_key: b }).run();
      yield u.flow.run(T, se);
    });
  }, login_password(h) {
    U(i(Zi, { state: h }));
  }, login_password_recovery(h) {
    U(i(Ji, { state: h }));
  }, login_security_key(h) {
    return We(this, void 0, void 0, function* () {
      U(i(da, { state: h }));
    });
  }, mfa_method_chooser(h) {
    return We(this, void 0, void 0, function* () {
      U(i(ua, { state: h }));
    });
  }, mfa_otp_secret_creation(h) {
    return We(this, void 0, void 0, function* () {
      U(i(ma, { state: h }));
    });
  }, mfa_security_key_creation(h) {
    return We(this, void 0, void 0, function* () {
      U(i(va, { state: h }));
    });
  }, login_method_chooser(h) {
    U(i(Qi, { state: h }));
  }, registration_init(h) {
    U(i(Yi, { state: h }));
  }, password_creation(h) {
    U(i(Xi, { state: h }));
  }, success(h) {
    var b;
    !((b = h.payload) === null || b === void 0) && b.last_login && localStorage.setItem(A, JSON.stringify(h.payload.last_login));
    const { claims: T } = h.payload, K = Date.parse(T.expiration) - Date.now();
    u.relay.dispatchSessionCreatedEvent({ claims: T, expirationSeconds: K }), Pe();
  }, profile_init(h) {
    U(i(aa, { state: h, enablePasskeys: r.enablePasskeys }));
  }, thirdparty(h) {
    return We(this, void 0, void 0, function* () {
      const b = new URLSearchParams(window.location.search).get("hanko_token");
      if (b && b.length > 0) {
        const T = new URLSearchParams(window.location.search), K = yield h.actions.exchange_token({ token: T.get("hanko_token") }).run();
        T.delete("hanko_token"), T.delete("saml_hint"), history.replaceState(null, null, window.location.pathname + (T.size < 1 ? "" : `?${T.toString()}`)), yield u.flow.run(K, se);
      } else H((T) => Object.assign(Object.assign({}, T), { lastAction: null })), localStorage.setItem(Lt, JSON.stringify(h.toJSON())), window.location.assign(h.payload.redirect_url);
    });
  }, error(h) {
    F(null), U(i(io, { state: h }));
  }, onboarding_email(h) {
    U(i(ra, { state: h }));
  }, onboarding_username(h) {
    U(i(sa, { state: h }));
  }, credential_onboarding_chooser(h) {
    U(i(la, { state: h }));
  }, account_deleted(h) {
    return We(this, void 0, void 0, function* () {
      yield u.user.logout(), u.relay.dispatchUserDeletedEvent();
    });
  }, device_trust(h) {
    U(i(ga, { state: h }));
  } }), [r.enablePasskeys, u, Pe, F]), ue = (0, _.useCallback)((h) => We(void 0, void 0, void 0, function* () {
    F("switch-flow");
    const b = localStorage.getItem(A);
    b && ae(JSON.parse(b));
    const T = new URLSearchParams(window.location.search).get("hanko_token"), K = localStorage.getItem(Lt);
    new URLSearchParams(window.location.search).get("saml_hint") === "idp_initiated" ? yield u.flow.init("/token_exchange", Object.assign({}, se)) : K && K.length > 0 && T && T.length > 0 ? (yield u.flow.fromString(localStorage.getItem(Lt), Object.assign({}, se)), localStorage.removeItem(Lt)) : yield u.flow.init(h, Object.assign({}, se)), F(null);
  }), [se]), Ae = (0, _.useCallback)((h) => {
    switch (h) {
      case "auth":
      case "login":
        ue("/login").catch(re);
        break;
      case "registration":
        ue("/registration").catch(re);
        break;
      case "profile":
        ue("/profile").catch(re);
    }
  }, [ue]);
  (0, _.useEffect)(() => Ae(S), []), (0, _.useEffect)(() => {
    u.onUserDeleted(() => {
      Ee("onUserDeleted");
    }), u.onSessionCreated((h) => {
      Ee("onSessionCreated", h);
    }), u.onSessionExpired(() => {
      Ee("onSessionExpired");
    }), u.onUserLoggedOut(() => {
      Ee("onUserLoggedOut");
    });
  }, [u]), (0, _.useMemo)(() => {
    const h = () => {
      Ae(S);
    };
    ["auth", "login", "registration"].includes(S) ? (u.onUserLoggedOut(h), u.onSessionExpired(h), u.onUserDeleted(h)) : S === "profile" && u.onSessionCreated(h);
  }, []);
  const k = tt.supported();
  return i(de.Provider, Object.assign({ value: { init: Ae, initialComponentName: l.componentName, isDisabled: Oe, setUIState: H, setLoadingAction: F, setSucceededAction: me, uiState: be, hanko: u, setHanko: ie, lang: (t == null ? void 0 : t.toString()) || f, prefilledEmail: n, prefilledUsername: a, componentName: S, setComponentName: x, experimentalFeatures: I, hidePasskeyButtonOnLogin: d, page: M, setPage: U, stateHandler: se, lastLogin: ge } }, { children: i(Z.TranslateProvider, Object.assign({ translations: p, fallbackLang: f, root: g }, { children: i(wi, Object.assign({ ref: C }, { children: S !== "events" ? i(O.Fragment, { children: [s ? i("style", { dangerouslySetInnerHTML: { __html: window._hankoStyle.innerHTML } }) : null, M] }) : null })) })) }));
}, ba = { en: X(6).en };
var Eo = function(o, t, e, n) {
  return new (e || (e = Promise))(function(a, r) {
    function c(s) {
      try {
        u(n.next(s));
      } catch (d) {
        r(d);
      }
    }
    function l(s) {
      try {
        u(n.throw(s));
      } catch (d) {
        r(d);
      }
    }
    function u(s) {
      var d;
      s.done ? a(s.value) : (d = s.value, d instanceof e ? d : new e(function(p) {
        p(d);
      })).then(c, l);
    }
    u((n = n.apply(o, [])).next());
  });
};
const Ke = {}, wt = (o, t) => i(_a, Object.assign({ componentName: o, globalOptions: Ke, createWebauthnAbortSignal: Ca }, t)), ya = (o) => wt("auth", o), ka = (o) => wt("login", o), wa = (o) => wt("registration", o), xa = (o) => wt("profile", o), Sa = (o) => wt("events", o);
let Tt = new AbortController();
const Ca = () => (Tt && Tt.abort(), Tt = new AbortController(), Tt.signal), vt = ({ tagName: o, entryComponent: t, shadow: e = !0, observedAttributes: n }) => Eo(void 0, void 0, void 0, function* () {
  customElements.get(o) || function(a, r, c, l) {
    function u() {
      var s = Reflect.construct(HTMLElement, [], u);
      return s._vdomComponent = a, s._root = l && l.shadow ? s.attachShadow({ mode: "open" }) : s, s;
    }
    (u.prototype = Object.create(HTMLElement.prototype)).constructor = u, u.prototype.connectedCallback = Ho, u.prototype.attributeChangedCallback = Wo, u.prototype.disconnectedCallback = Ro, c = c || a.observedAttributes || Object.keys(a.propTypes || {}), u.observedAttributes = c, c.forEach(function(s) {
      Object.defineProperty(u.prototype, s, { get: function() {
        var d, p, g, f;
        return (d = (p = this._vdom) == null || (g = p.props) == null ? void 0 : g[s]) != null ? d : (f = this._props) == null ? void 0 : f[s];
      }, set: function(d) {
        this._vdom ? this.attributeChangedCallback(s, null, d) : (this._props || (this._props = {}), this._props[s] = d, this.connectedCallback());
        var p = typeof d;
        d != null && p !== "string" && p !== "boolean" && p !== "number" || this.setAttribute(s, d);
      } });
    }), customElements.define(r || a.tagName || a.displayName || a.name, u);
  }(t, o, n, { shadow: e });
}), Oa = (o, t = {}) => Eo(void 0, void 0, void 0, function* () {
  const e = ["api", "lang", "experimental", "prefilled-email", "entry"];
  return t = Object.assign({ shadow: !0, injectStyles: !0, enablePasskeys: !0, hidePasskeyButtonOnLogin: !1, translations: null, translationsLocation: "/i18n", fallbackLanguage: "en", storageKey: "hanko", sessionCheckInterval: 3e4 }, t), Ke.hanko = new Io(o, { cookieName: t.storageKey, cookieDomain: t.cookieDomain, cookieSameSite: t.cookieSameSite, localStorageKey: t.storageKey, sessionCheckInterval: t.sessionCheckInterval, sessionTokenLocation: t.sessionTokenLocation }), Ke.injectStyles = t.injectStyles, Ke.enablePasskeys = t.enablePasskeys, Ke.hidePasskeyButtonOnLogin = t.hidePasskeyButtonOnLogin, Ke.translations = t.translations || ba, Ke.translationsLocation = t.translationsLocation, Ke.fallbackLanguage = t.fallbackLanguage, Ke.storageKey = t.storageKey, yield Promise.all([vt(Object.assign(Object.assign({}, t), { tagName: "hanko-auth", entryComponent: ya, observedAttributes: e })), vt(Object.assign(Object.assign({}, t), { tagName: "hanko-login", entryComponent: ka, observedAttributes: e })), vt(Object.assign(Object.assign({}, t), { tagName: "hanko-registration", entryComponent: wa, observedAttributes: e })), vt(Object.assign(Object.assign({}, t), { tagName: "hanko-profile", entryComponent: xa, observedAttributes: e.filter((n) => ["api", "lang"].includes(n)) })), vt(Object.assign(Object.assign({}, t), { tagName: "hanko-events", entryComponent: Sa, observedAttributes: [] }))]), { hanko: Ke.hanko };
});
oe.fK;
oe.tJ;
oe.Z7;
oe.Q9;
oe.Lv;
oe.qQ;
var Aa = oe.I4;
oe.O8;
oe.ku;
oe.ls;
oe.bO;
oe.yv;
oe.AT;
oe.m_;
oe.KG;
oe.DH;
oe.kf;
oe.oY;
oe.xg;
oe.Wg;
oe.J;
oe.AC;
oe.D_;
oe.jx;
oe.nX;
oe.Nx;
oe.Sd;
var Do = oe.kz;
oe.fX;
oe.qA;
oe.tz;
oe.gN;
const Nt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Hanko: Aa,
  register: Do
}, Symbol.toStringTag, { value: "Module" }));
class Ia extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this.state = {
      user: null,
      osmConnected: !1,
      osmData: null,
      loading: !0,
      error: null
    }, this._trailingSlashCache = {}, this._debugMode = this._checkDebugMode(), this.handleHankoSuccess = this.handleHankoSuccess.bind(this), this.handleOSMConnect = this.handleOSMConnect.bind(this), this.handleLogout = this.handleLogout.bind(this);
  }
  // Observed attributes
  static get observedAttributes() {
    return [
      "hanko-url",
      "base-path",
      "auth-path",
      "osm-enabled",
      "osm-required",
      "osm-scopes",
      "show-profile",
      "redirect-after-login"
    ];
  }
  // Getters for attributes
  get hankoUrl() {
    const t = this.getAttribute("hanko-url");
    if (t)
      return t;
    const e = document.querySelector('meta[name="hanko-url"]');
    if (e) {
      const a = e.getAttribute("content");
      if (a)
        return this.log("🔍 hanko-url auto-detected from <meta> tag:", a), a;
    }
    if (window.HANKO_URL)
      return this.log("🔍 hanko-url auto-detected from window.HANKO_URL:", window.HANKO_URL), window.HANKO_URL;
    const n = window.location.origin;
    return this.log("🔍 hanko-url auto-detected from window.location.origin:", n), n;
  }
  get basePath() {
    return this.getAttribute("base-path");
  }
  get authPath() {
    return this.getAttribute("auth-path") || "/api/auth/osm";
  }
  get osmEnabled() {
    return this.hasAttribute("osm-enabled") && this.getAttribute("osm-enabled") !== "false";
  }
  get osmRequired() {
    return this.hasAttribute("osm-required") && this.getAttribute("osm-required") !== "false";
  }
  get osmScopes() {
    return this.getAttribute("osm-scopes") || "read_prefs";
  }
  get showProfile() {
    return !this.hasAttribute("show-profile") || this.getAttribute("show-profile") !== "false";
  }
  get redirectAfterLogin() {
    return this.getAttribute("redirect-after-login");
  }
  // Check if debug mode is enabled
  _checkDebugMode() {
    if (new URLSearchParams(window.location.search).get("debug") === "true")
      return !0;
    try {
      return localStorage.getItem("hanko-auth-debug") === "true";
    } catch {
      return !1;
    }
  }
  // Conditional logging (only logs if debug mode is enabled)
  log(...t) {
    this._debugMode && console.log(...t);
  }
  // Warning and error logs always show (even without debug mode)
  warn(...t) {
    console.warn(...t);
  }
  error(...t) {
    console.error(...t);
  }
  // Helper to get base path from attribute or document.baseURI (respects <base> tag)
  getBasePath() {
    if (this.hasAttribute("base-path"))
      return this.log("🔍 getBasePath() using attribute:", this.basePath), this.basePath || "";
    try {
      const t = new URL(document.baseURI || window.location.href), e = t.pathname.replace(/\/$/, "");
      return this.log("🔍 getBasePath() called:"), this.log("  document.baseURI:", document.baseURI), this.log("  window.location.href:", window.location.href), this.log("  baseUri.pathname:", t.pathname), this.log("  result:", e), e;
    } catch (t) {
      return this.error("getBasePath() error:", t), "";
    }
  }
  // Helper to add trailing slash based on auto-detected preference for this basePath
  addTrailingSlash(t, e) {
    const n = this._trailingSlashCache[e];
    return n !== void 0 && n && !t.endsWith("/") ? t + "/" : t;
  }
  // Auto-detect if trailing slash is needed by checking response.url after redirect
  async detectTrailingSlash(t, e) {
    if (this._trailingSlashCache[t] !== void 0)
      return this.log(`🔍 Using cached trailing slash preference for ${t}: ${this._trailingSlashCache[t]}`), this._trailingSlashCache[t];
    const n = window.location.origin, a = `${t}${e}`;
    this.log("🔍 Auto-detecting trailing slash preference..."), this.log(`  Testing: ${n}${a}`);
    try {
      const r = await fetch(`${n}${a}`, {
        method: "GET",
        credentials: "include",
        redirect: "follow"
        // Let browser follow redirects
      }), l = new URL(r.url).pathname;
      return this.log(`  Original path: ${a}`), this.log(`  Final path: ${l}`), !a.endsWith("/") && l.endsWith("/") ? (this.log(`  ✅ Detected trailing slash needed (redirected to ${l})`), this._trailingSlashCache[t] = !0, !0) : (this.log("  ✅ Detected no trailing slash needed"), this._trailingSlashCache[t] = !1, !1);
    } catch (r) {
      return console.error("  ❌ Error during trailing slash detection:", r), this._trailingSlashCache[t] = !1, !1;
    }
  }
  connectedCallback() {
    this.log("🔌 hanko-auth connectedCallback called"), this.log("  hankoUrl:", this.hankoUrl), this.log('  getAttribute("hanko-url"):', this.getAttribute("hanko-url")), this.log("  all attributes:", Array.from(this.attributes).map((t) => `${t.name}="${t.value}"`)), this.render(), this.log("✅ Starting init with hankoUrl:", this.hankoUrl), this.init();
  }
  attributeChangedCallback(t, e, n) {
    e !== n && this.render();
  }
  async init() {
    try {
      await Do(this.hankoUrl), await this.checkSession(), this.osmEnabled && await this.checkOSMConnection(), this.state.loading = !1, this.render(), this.setupEventListeners();
    } catch (t) {
      console.error("Failed to initialize hanko-auth:", t), this.state.error = t.message, this.state.loading = !1, this.render();
    }
  }
  async checkSession() {
    this.log("🔍 Checking for existing Hanko session...");
    try {
      const { Hanko: t } = await Promise.resolve().then(() => Nt), e = new t(this.hankoUrl);
      this.log("📡 Hanko client created, checking session validity...");
      try {
        const n = await e.user.getCurrent();
        this.log("✅ Valid Hanko session found"), this.log("👤 Existing user session:", n), this.state.user = {
          id: n.id,
          email: n.email,
          username: n.username,
          emailVerified: n.email_verified || !1
        }, this.dispatchEvent(new CustomEvent("hanko-login", {
          detail: { user: this.state.user }
        })), this.dispatchEvent(new CustomEvent("auth-complete")), await this.syncJWTToCookie();
      } catch {
        this.log("ℹ️ No valid Hanko session found - user needs to login");
      }
    } catch (t) {
      this.log("⚠️ Session check error:", t), this.log("ℹ️ No existing session - user needs to login");
    }
  }
  async syncJWTToCookie() {
    try {
      const { Hanko: t } = await Promise.resolve().then(() => Nt), e = new t(this.hankoUrl);
      let n;
      try {
        n = await e.session.getToken();
      } catch {
        this.log("⚠️ No valid Hanko session for JWT sync");
        return;
      }
      if (n) {
        const a = window.location.hostname, r = a === "localhost" || a === "127.0.0.1", c = r ? "; domain=localhost" : "";
        document.cookie = `hanko=${n}; path=/${c}; max-age=86400; SameSite=Lax`, this.log(`🔐 JWT synced to cookie for SSO${r ? " (domain=localhost)" : ""}`);
      } else
        this.log("⚠️ No JWT found in Hanko session");
    } catch (t) {
      console.error("Failed to sync JWT to cookie:", t);
    }
  }
  async checkOSMConnection() {
    try {
      const t = this.getBasePath(), e = this.authPath;
      await this.detectTrailingSlash(t, `${e}/status`);
      const n = window.location.origin;
      let a = `${t}${e}/status`;
      a = this.addTrailingSlash(a, t);
      const r = `${n}${a}`;
      this.log("🔍 Checking OSM connection at:", r), this.log("🍪 Current cookies:", document.cookie);
      const c = await fetch(r, {
        credentials: "include",
        redirect: "follow"
        // Follow redirects but with cookies
      });
      if (this.log("📡 OSM status response:", c.status), this.log("📡 Final URL after redirects:", c.url), c.ok) {
        const l = await c.json();
        this.log("📡 OSM status data:", l), l.connected ? (this.log("✅ OSM is connected:", l.osm_username), this.state.osmConnected = !0, this.state.osmData = l) : this.log("❌ OSM is NOT connected");
      }
    } catch (t) {
      console.error("OSM connection check failed:", t);
    }
  }
  setupEventListeners() {
    const t = this.shadowRoot.querySelector("hanko-auth");
    t && (t.addEventListener("onSessionCreated", (r) => {
      var l, u;
      this.log("🎯 Hanko event: onSessionCreated", r.detail);
      const c = (u = (l = r.detail) == null ? void 0 : l.claims) == null ? void 0 : u.session_id;
      if (c && this._lastSessionId === c) {
        this.log("⏭️ Skipping duplicate session event");
        return;
      }
      this._lastSessionId = c, this.handleHankoSuccess(r);
    }), t.addEventListener("hankoAuthLogout", this.handleLogout));
    const e = this.shadowRoot.querySelector("#osm-connect-btn");
    e && e.addEventListener("click", this.handleOSMConnect);
    const n = this.shadowRoot.querySelector("#logout-btn");
    n && n.addEventListener("click", this.handleLogout);
    const a = this.shadowRoot.querySelector("#skip-osm-btn");
    a && a.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("osm-skipped")), this.dispatchEvent(new CustomEvent("auth-complete")), this.redirectAfterLogin && (window.location.href = this.redirectAfterLogin);
    });
  }
  async handleHankoSuccess(t) {
    var a;
    this.log("Hanko auth success:", t.detail);
    const e = ((a = t.detail) == null ? void 0 : a.claims) || {}, n = e.subject || e.sub;
    if (!n) {
      console.error("No user ID found in claims");
      return;
    }
    try {
      const { Hanko: r } = await Promise.resolve().then(() => Nt), l = await new r(this.hankoUrl).user.getCurrent();
      this.log("👤 User data from Hanko:", l), this.state.user = {
        id: l.id || n,
        email: l.email,
        username: l.username,
        emailVerified: l.email_verified || !1
      };
    } catch (r) {
      console.error("Failed to fetch user info:", r), this.state.user = {
        id: n,
        email: null,
        username: null,
        emailVerified: !1
      };
    }
    this.log("✅ User state updated:", this.state.user), this.render(), this.dispatchEvent(new CustomEvent("hanko-login", {
      detail: { user: this.state.user }
    })), this.dispatchEvent(new CustomEvent("auth-complete")), await this.syncJWTToCookie(), this.redirectAfterLogin && (window.location.href = this.redirectAfterLogin);
  }
  async handleOSMConnect() {
    const t = this.osmScopes.split(" ").join("+"), e = this.getBasePath(), n = this.authPath;
    await this.detectTrailingSlash(e, `${n}/login`);
    const a = window.location.origin;
    let r = `${e}${n}/login`;
    r = this.addTrailingSlash(r, e);
    const c = `${a}${r}?scopes=${t}`;
    this.log("🔗 OSM Connect clicked!"), this.log("  window.location.origin:", a), this.log("  basePath:", e), this.log("  authPath:", n), this.log("  loginPath:", r), this.log("  Full URL to redirect to:", c), this.log("  About to set window.location.href..."), window.location.href = c, this.log("  window.location.href was set (this may not log if redirect is immediate)");
  }
  async handleLogout() {
    if (this.log("🚪 Logout initiated"), this.log("📊 Current state before logout:", {
      user: this.state.user,
      osmConnected: this.state.osmConnected,
      osmData: this.state.osmData
    }), this.log("🍪 Cookies before logout:", document.cookie), this.osmEnabled)
      try {
        const t = this.getBasePath(), e = this.authPath, n = window.location.origin, a = this.addTrailingSlash(`${t}${e}/disconnect`, t), r = `${n}${a}`;
        this.log("🔌 Calling OSM disconnect:", r);
        const c = await fetch(r, {
          method: "POST",
          credentials: "include"
        });
        this.log("📡 Disconnect response status:", c.status), this.log("📡 Disconnect response headers:", [...c.headers.entries()]);
        const l = await c.json();
        this.log("📡 Disconnect response data:", l), this.log("✅ OSM disconnected");
      } catch (t) {
        console.error("❌ OSM disconnect failed:", t);
      }
    try {
      const { Hanko: t } = await Promise.resolve().then(() => Nt);
      await new t(this.hankoUrl).user.logout(), this.log("✅ Hanko logout successful");
    } catch (t) {
      console.error("Hanko logout failed:", t);
    }
    document.cookie = "hanko=; path=/; domain=localhost; max-age=0", document.cookie = "hanko=; path=/; max-age=0", document.cookie = "osm_connection=; path=/; domain=localhost; max-age=0", document.cookie = "osm_connection=; path=/; max-age=0", this.log("🍪 Cookies cleared"), this.state.user = null, this.state.osmConnected = !1, this.state.osmData = null, this.dispatchEvent(new CustomEvent("logout")), this.log("🔄 Reloading page to clear all session data..."), window.location.reload();
  }
  render() {
    var n;
    const t = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          padding: 12px;
          color: #c33;
          margin-bottom: 16px;
        }

        .profile {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          color: #666;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .profile-email {
          font-size: 14px;
          color: #666;
        }

        .osm-section {
          border-top: 1px solid #e5e5e5;
          padding-top: 16px;
          padding-bottom: 16px;
          margin-top: 16px;
          margin-bottom: 16px;
          text-align: center;
        }

        .osm-connected {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
          border-radius: 8px;
          border: 1px solid #c3e6c3;
        }

        .osm-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2d7a2d;
          font-weight: 500;
          font-size: 14px;
          text-align: left;
        }

        .osm-badge-icon {
          font-size: 18px;
        }

        .osm-username {
          font-size: 13px;
          color: #5a905a;
          margin-top: 4px;
        }

        button {
          width: 100%;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #d73f3f;
          color: white;
        }

        .btn-primary:hover {
          background: #c23535;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          margin-top: 8px;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-logout {
          background: transparent;
          border: 1px solid #ddd;
          color: #666;
        }

        .btn-logout:hover {
          background: #f5f5f5;
        }

        .osm-prompt {
          background: #fff8e6;
          border: 1px solid #ffe066;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          text-align: center;
        }

        .osm-prompt-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 12px;
          color: #333;
          text-align: center;
        }

        .osm-prompt-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
          text-align: center;
        }
      </style>
    `;
    let e = "";
    if (this.state.loading)
      e = `
        <div class="container">
          <div class="loading">Loading...</div>
        </div>
      `;
    else if (this.state.error)
      e = `
        <div class="container">
          <div class="error">${this.state.error}</div>
        </div>
      `;
    else if (this.state.user) {
      const a = this.osmEnabled && !this.state.osmConnected, r = this.state.user.username || this.state.user.email || this.state.user.id, c = r ? r[0].toUpperCase() : "U";
      e = `
        <div class="container">
          ${this.showProfile ? `
            <div class="profile">
              <div class="profile-header">
                <div class="profile-avatar">${c}</div>
                <div class="profile-info">
                  <div class="profile-name">${this.state.user.username || this.state.user.email || "User"}</div>
                  <div class="profile-email">${this.state.user.email || this.state.user.id}</div>
                </div>
              </div>

              ${this.osmEnabled && this.state.osmConnected ? `
                <div class="osm-section">
                  <div class="osm-connected">
                    <div class="osm-badge">
                      <span class="osm-badge-icon">🗺️</span>
                      <div>
                        <div>Connected to OpenStreetMap</div>
                        ${(n = this.state.osmData) != null && n.osm_username ? `
                          <div class="osm-username">@${this.state.osmData.osm_username}</div>
                        ` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ` : ""}

              ${a ? `
                <div class="osm-section">
                  <div class="osm-prompt-title">
                    ${this.osmRequired ? "🗺️ OSM Required" : "🗺️ Connect OSM"}
                  </div>
                  <div class="osm-prompt-text">
                    ${this.osmRequired ? "This endpoint requires OSM connection." : "Connect your OSM account for full features."}
                  </div>
                  <button id="osm-connect-btn" class="btn-primary">
                    Connect OSM Account
                  </button>
                  ${this.osmRequired ? "" : `
                    <button id="skip-osm-btn" class="btn-secondary">
                      Skip for now
                    </button>
                  `}
                </div>
              ` : ""}

              <button id="logout-btn" class="btn-logout">
                Logout
              </button>
            </div>
          ` : a ? `
            <div class="osm-prompt">
              <div class="osm-prompt-title">
                ${this.osmRequired ? "OpenStreetMap Required" : "Connect OpenStreetMap"}
              </div>
              <div class="osm-prompt-text">
                ${this.osmRequired ? "This app requires an OSM connection to continue." : "Connect your OSM account for full features."}
              </div>
              <button id="osm-connect-btn" class="btn-primary">
                Connect OSM Account
              </button>
              ${this.osmRequired ? "" : `
                <button id="skip-osm-btn" class="btn-secondary">
                  Skip for now
                </button>
              `}
            </div>
          ` : ""}
        </div>
      `;
    } else
      e = `
        <div class="container">
          <hanko-auth></hanko-auth>
        </div>
      `;
    this.shadowRoot.innerHTML = t + e, this.state.loading || setTimeout(() => this.setupEventListeners(), 0);
  }
}
customElements.define("hotosm-auth", Ia);
export {
  Ia as default
};
