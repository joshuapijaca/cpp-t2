import{r as o,j as e}from"./vendor-react-9N0TBUMw.js";const ie=new Set(["int","double","string","bool","char","void","struct","return","for","if","else","const","true","false","cin","cout","endl","while","do","break","continue","include","using","namespace","std","main"]),pe=["<<=",">>=","==","!=","<=",">=","&&","||","++","--","+=","-=","*=","/=","%=","<<",">>","->","::"],fe=new Set(["=","<",">","+","-","*","/","%","&","|","!","^","~","?"]),ue=new Set([";","{","}","(",")","[","]",".",",",":"]);function ce(t){return t===void 0?!1:t>="a"&&t<="z"||t>="A"&&t<="Z"||t==="_"}function Q(t){return t===void 0?!1:ce(t)||t>="0"&&t<="9"}function Z(t){return t===void 0?!1:t>="0"&&t<="9"}function W(t){const n=[],r=t.length;let a=0;for(;a<r;){const s=a,i=t[a];if(i===" "||i==="	"||i===`
`||i==="\r"){for(;a<r&&(t[a]===" "||t[a]==="	"||t[a]===`
`||t[a]==="\r");)a++;n.push({type:"whitespace",value:t.slice(s,a),start:s,end:a});continue}if(i==="/"&&t[a+1]==="/"){for(;a<r&&t[a]!==`
`;)a++;n.push({type:"comment",value:t.slice(s,a),start:s,end:a});continue}if(i==="/"&&t[a+1]==="*"){for(a+=2;a<r&&!(t[a]==="*"&&t[a+1]==="/");)a++;a<r&&(a+=2),n.push({type:"comment",value:t.slice(s,a),start:s,end:a});continue}if(i==='"'){for(a++;a<r&&t[a]!=='"';){if(t[a]==="\\"&&a+1<r){a+=2;continue}if(t[a]===`
`)break;a++}a<r&&t[a]==='"'&&a++,n.push({type:"string",value:t.slice(s,a),start:s,end:a});continue}if(i==="'"){for(a++;a<r&&t[a]!=="'";){if(t[a]==="\\"&&a+1<r){a+=2;continue}if(t[a]===`
`)break;a++}a<r&&t[a]==="'"&&a++,n.push({type:"string",value:t.slice(s,a),start:s,end:a});continue}if(i==="#"){for(a++;a<r&&Q(t[a]);)a++;n.push({type:"keyword",value:t.slice(s,a),start:s,end:a});continue}if(Z(i)){for(;a<r&&(Z(t[a])||t[a]===".");)a++;for(;a<r&&(t[a]==="f"||t[a]==="F"||t[a]==="u"||t[a]==="U"||t[a]==="l"||t[a]==="L");)a++;n.push({type:"number",value:t.slice(s,a),start:s,end:a});continue}if(ce(i)){for(;a<r&&Q(t[a]);)a++;const l=t.slice(s,a);n.push({type:ie.has(l)?"keyword":"identifier",value:l,start:s,end:a});continue}let c=null;for(const l of pe)if(t.startsWith(l,a)){c=l;break}if(c){n.push({type:"operator",value:c,start:s,end:s+c.length}),a+=c.length;continue}if(fe.has(i)){n.push({type:"operator",value:i,start:s,end:a+1}),a++;continue}if(ue.has(i)){n.push({type:"punctuation",value:i,start:s,end:a+1}),a++;continue}n.push({type:"identifier",value:i,start:s,end:a+1}),a++}return n}const xe=new Set(["{","(","["]),me=new Set(["}",")","]"]);function U(t){return t!==void 0&&xe.has(t)}function oe(t){return t!==void 0&&me.has(t)}function X(t){return U(t)||oe(t)}const O={"{":"}","(":")","[":"]","}":"{",")":"(","]":"["};function be(t,n){const r=new Uint8Array(n);for(const a of t)if(a.type==="string"||a.type==="comment")for(let s=a.start;s<a.end;s++)r[s]=1;return r}function he(t,n){const r=t.length;if(r===0)return null;const a=Math.max(0,Math.min(n,r)),s=W(t),i=be(s,r);let c=-1;if(a>0&&!i[a-1]){const d=t[a-1];X(d)&&(c=a-1)}if(c===-1&&a<r&&!i[a]){const d=t[a];X(d)&&(c=a)}if(c!==-1)return ee(t,i,c);const l={"{":0,"(":0,"[":0};for(let d=a-1;d>=0;d--){if(i[d])continue;const h=t[d];if(oe(h)){const u=O[h];l[u]++}else if(U(h)){if(l[h]===0)return ee(t,i,d);l[h]--}}return null}function ee(t,n,r){const a=t[r],s=U(a)?a:O[a],i=O[s];let c=0;{let h=0,u=0;for(let p=0;p<r;p++){if(n[p])continue;const x=t[p];x===s?h++:x===i&&u++}c=Math.max(0,h-u)}let l,d;return U(a)?(l=r,d=ge(t,n,r,s,i)):(d=r,l=ve(t,n,r,s,i)),{openPos:l,closePos:d,depth:c,matched:l!==-1&&d!==-1}}function ge(t,n,r,a,s){let i=0;for(let c=r;c<t.length;c++){if(n[c])continue;const l=t[c];if(l===a)i++;else if(l===s&&(i--,i===0))return c}return-1}function ve(t,n,r,a,s){let i=0;for(let c=r;c>=0;c--){if(n[c])continue;const l=t[c];if(l===s)i++;else if(l===a&&(i--,i===0))return c}return-1}function we(t,n){return o.useMemo(()=>he(t,n),[t,n])}const A="    ",ye={keyword:"ce-tok-keyword",identifier:"ce-tok-identifier",string:"ce-tok-string",number:"ce-tok-number",comment:"ce-tok-comment",operator:"ce-tok-operator",punctuation:"ce-tok-punctuation",whitespace:"ce-tok-ws"};function ke({code:t,braceOpen:n,braceClose:r,braceDepth:a,braceMatched:s}){const i=o.useMemo(()=>W(t),[t]),c=t.endsWith(`
`)?t+" ":t,l=c===t?i:W(c);return e.jsx("pre",{"aria-hidden":"true",className:"ce-highlight",children:l.map((d,h)=>{const u=n!==void 0&&d.start===n,p=r!==void 0&&d.start===r,x=u||p,f=[ye[d.type]];return x&&(f.push(s?"ce-brace-match":"ce-brace-mismatch"),a!==void 0&&s&&f.push(`ce-brace-d${a%3}`)),e.jsx("span",{className:f.join(" "),children:d.value},h)})})}function je({lineCount:t}){const n=o.useMemo(()=>Array.from({length:t},(r,a)=>a+1),[t]);return e.jsx("div",{className:"ce-gutter","aria-hidden":"true",children:n.map(r=>e.jsx("div",{className:"ce-gutter-line",children:r},r))})}function Ne(t,n,r){let a=n;for(;a>0&&t[a-1]!==`
`;)a--;let s=r;for(s>n&&t[s-1]===`
`&&s--;s<t.length&&t[s]!==`
`;)s++;return{firstLineStart:a,lastLineEnd:s,trailingBoundary:s}}function Ce(t,n){let r=n;for(;r>0&&t[r-1]!==`
`;)r--;let a=r;for(;a<t.length&&t[a]===" ";)a++;return t.slice(r,a)}function F(t,n,r,a){const s=Ne(t,n,r),i=t.slice(0,s.firstLineStart),c=t.slice(s.firstLineStart,s.lastLineEnd),l=t.slice(s.lastLineEnd),h=c.split(`
`).map(a).join(`
`),u=h.length-c.length;return{value:i+h+l,selStart:s.firstLineStart,selEnd:s.lastLineEnd+u}}const q=o.forwardRef(function({value:n,onChange:r,language:a,readOnly:s=!1,lineNumbers:i=!0,showBraceMatch:c=!0,className:l="",ariaLabel:d,placeholder:h,onEscape:u},p){const x=o.useRef(null),f=o.useRef(null),v=o.useId(),[b,m]=o.useState(0);o.useImperativeHandle(p,()=>({focus:()=>x.current?.focus(),getTextarea:()=>x.current}),[]);const g=o.useCallback(()=>{const k=x.current,E=f.current;if(!k||!E)return;const C=E.querySelector(".ce-highlight"),$=E.querySelector(".ce-gutter");C&&(C.scrollTop=k.scrollTop,C.scrollLeft=k.scrollLeft),$&&($.scrollTop=k.scrollTop)},[]);o.useLayoutEffect(()=>{g()},[n,g]);const y=o.useCallback(k=>{r(k.target.value),m(k.target.selectionStart)},[r]),w=o.useCallback(()=>{const k=x.current;k&&m(k.selectionStart)},[]),j=o.useCallback((k,E=0)=>{const C=x.current;if(!C)return;const $=C.selectionStart,z=C.selectionEnd,N=n.slice(0,$)+k+n.slice(z);r(N);const S=$+k.length-E;requestAnimationFrame(()=>{x.current&&(x.current.selectionStart=S,x.current.selectionEnd=S,m(S))})},[n,r]),_=o.useCallback((k,E,C)=>{r(k),requestAnimationFrame(()=>{x.current&&(x.current.selectionStart=E,x.current.selectionEnd=C,m(E))})},[r]),D=o.useCallback(k=>{if(s)return;const E=k.currentTarget,C=E.selectionStart,$=E.selectionEnd,z=C!==$;if(k.key==="Escape"){k.preventDefault(),E.blur(),u?.();return}if((k.ctrlKey||k.metaKey)&&k.key==="/"){k.preventDefault();const N=F(n,C,$,S=>{const T=S.trimStart(),B=S.slice(0,S.length-T.length);return T.startsWith("// ")?B+T.slice(3):T.startsWith("//")?B+T.slice(2):T.length===0?S:B+"// "+T});_(N.value,N.selStart,N.selEnd);return}if((k.ctrlKey||k.metaKey)&&k.key==="]"){k.preventDefault();const N=F(n,C,$,S=>A+S);_(N.value,N.selStart,N.selEnd);return}if((k.ctrlKey||k.metaKey)&&k.key==="["){k.preventDefault();const N=F(n,C,$,S=>{let T=0;for(;T<A.length&&S[T]===" ";)T++;return S.slice(T)});_(N.value,N.selStart,N.selEnd);return}if(k.key==="Tab"){if(k.preventDefault(),k.shiftKey){const N=F(n,C,$,S=>{let T=0;for(;T<A.length&&S[T]===" ";)T++;return S.slice(T)});_(N.value,N.selStart,N.selEnd)}else if(z){const N=F(n,C,$,S=>A+S);_(N.value,N.selStart,N.selEnd)}else j(A);return}if(k.key==="Enter"){k.preventDefault();const N=Ce(n,C),S=C>0?n[C-1]:"",T=C<n.length?n[C]:"";if(S==="{"&&T==="}"){const B=`
`+N+A+`
`+N,de=(`
`+N).length;j(B,de)}else j(S==="{"?`
`+N+A:`
`+N);return}},[n,s,j,_,u]),I=o.useMemo(()=>{let k=1;for(let E=0;E<n.length;E++)n[E]===`
`&&k++;return k},[n]),L=we(n,b),M=c&&L!==null&&L.openPos!==-1;return e.jsxs("div",{ref:f,className:`ce-root ${l}`,"data-readonly":s,"data-line-numbers":i,children:[e.jsx("style",{children:Se}),i&&e.jsx(je,{lineCount:I}),e.jsxs("div",{className:"ce-content",children:[e.jsx(ke,{code:n,braceOpen:M?L.openPos:void 0,braceClose:M&&L.matched?L.closePos:void 0,braceDepth:M?L.depth:void 0,braceMatched:M?L.matched:void 0}),e.jsx("textarea",{ref:x,id:`ce-${v}`,className:"ce-textarea",value:n,onChange:y,onKeyDown:D,onSelect:w,onScroll:g,readOnly:s,spellCheck:!1,autoCapitalize:"off",autoCorrect:"off",autoComplete:"off",wrap:"off",placeholder:h,role:"application","aria-label":d,"aria-multiline":"true","aria-readonly":s})]})]})}),Se=`
.ce-root {
  display: grid;
  grid-template-columns: auto 1fr;
  background: var(--bg-1, #161b22);
  color: var(--text-0, #e6edf3);
  font-family: var(--font-mono, "JetBrains Mono", "Fira Code", ui-monospace,
               SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 14px;
  line-height: 1.55;
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  overflow: hidden;
  min-height: 8rem;
}
.ce-root[data-line-numbers="false"] { grid-template-columns: 1fr; }

.ce-gutter {
  background: var(--bg-0, #0d1117);
  color: var(--text-2, #6e7681);
  padding: 12px 8px 12px 12px;
  text-align: right;
  user-select: none;
  border-right: 1px solid var(--border-1, #30363d);
  overflow: hidden;
  min-width: 2.5rem;
}
.ce-gutter-line { white-space: pre; }

.ce-content { position: relative; min-height: 6rem; }

.ce-highlight,
.ce-textarea {
  /* These properties MUST be identical in both layers. */
  margin: 0;
  padding: 12px 16px;
  font: inherit;
  line-height: inherit;
  letter-spacing: 0;
  tab-size: 4;
  white-space: pre;
  word-wrap: normal;
  overflow-wrap: normal;
  border: 0;
  outline: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 6rem;
}

.ce-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: auto;
  background: transparent;
  /* Hide scrollbars; the textarea owns scrolling. */
  scrollbar-width: none;
}
.ce-highlight::-webkit-scrollbar { display: none; }

.ce-textarea {
  position: relative;
  background: transparent;
  color: transparent;            /* glyphs come from the pre underneath */
  caret-color: var(--text-0, #e6edf3);
  resize: none;
  overflow: auto;
}
.ce-textarea::selection {
  background: var(--bg-3, #2d333b);
  color: transparent;
}
.ce-textarea::placeholder {
  color: var(--text-2, #6e7681);
}
.ce-textarea:focus {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}

/* Token colors — matched to theme palette (VSCode Dark+ + Dracula). */
.ce-tok-keyword     { color: var(--accent-cyan, #79c0ff); }
.ce-tok-identifier  { color: var(--text-0, #e6edf3); }
.ce-tok-string      { color: var(--accent-grn,  #7ee787); }
.ce-tok-number      { color: var(--accent-org,  #ffa657); }
.ce-tok-comment     { color: var(--text-2,      #6e7681); font-style: italic; }
.ce-tok-operator    { color: var(--accent-pink, #ff7b72); }
.ce-tok-punctuation { color: var(--text-1,      #8b949e); }
.ce-tok-ws          { color: inherit; }

/* Brace-match overlays. */
.ce-brace-match {
  background: rgba(121, 192, 255, 0.18);
  border-radius: 2px;
}
.ce-brace-mismatch {
  background: rgba(248, 81, 73, 0.30);
  border-radius: 2px;
  color: var(--state-err, #f85149) !important;
}
.ce-brace-d0 { color: var(--brace-d0, #ffd700) !important; }
.ce-brace-d1 { color: var(--brace-d1, #da70d6) !important; }
.ce-brace-d2 { color: var(--brace-d2, #87cefa) !important; }
`;function Ee(t){return t.length===0?"":t[t.length-1]??""}function ze(t){return t.length<=1?[]:t.slice(0,-1)}function Te(t){return{stale:ze(t),current:Ee(t),hasHistory:t.length>0}}const $e=["int","double","string","bool","char","struct"],_e=["local","param","global","static"];function H({kind:t,value:n,history:r,readOnly:a,onCommit:s,onAddRowFromLast:i,isLastCell:c,ariaLabel:l}){const[d,h]=o.useState(!1),[u,p]=o.useState(n),x=o.useRef(null);o.useEffect(()=>{d||p(n)},[n,d]),o.useEffect(()=>{d&&x.current&&(x.current.focus(),x.current instanceof HTMLInputElement&&x.current.select())},[d]);const f=()=>{h(!1),u!==n&&s(u)},v=()=>{h(!1),p(n)},b=g=>{if(g.key==="Enter"){if(g.preventDefault(),(g.metaKey||g.ctrlKey)&&c&&i){f(),i();return}f()}else g.key==="Escape"?(g.preventDefault(),v()):g.key==="Tab"&&f()},m=g=>{d&&f()};if(!d&&t==="value"){const g=Te(r??(n?[n]:[]));return e.jsxs("button",{type:"button",className:"vp-cell vp-cell--value",onClick:a?void 0:()=>h(!0),onFocus:a?void 0:()=>h(!0),disabled:a,"aria-label":l,tabIndex:0,children:[g.stale.map((y,w)=>e.jsx("span",{className:"vp-stale",children:y},w)),e.jsx("span",{className:g.hasHistory?"vp-current":"vp-empty",children:g.current||(a?"":"click to edit")})]})}return d?t==="type"?e.jsx("select",{ref:x,className:`vp-cell vp-cell--${t} vp-cell--editing`,value:u,onChange:g=>p(g.target.value),onBlur:m,onKeyDown:b,"aria-label":l,children:$e.map(g=>e.jsx("option",{value:g,children:g},g))}):t==="scope"?e.jsx("select",{ref:x,className:`vp-cell vp-cell--${t} vp-cell--editing`,value:u,onChange:g=>p(g.target.value),onBlur:m,onKeyDown:b,"aria-label":l,children:_e.map(g=>e.jsx("option",{value:g,children:g},g))}):e.jsx("input",{ref:x,type:"text",className:`vp-cell vp-cell--${t} vp-cell--editing`,value:u,onChange:g=>p(g.target.value),onBlur:m,onKeyDown:b,spellCheck:!1,autoComplete:"off","aria-label":l}):e.jsx("button",{type:"button",className:`vp-cell vp-cell--${t}`,onClick:a?void 0:()=>h(!0),onFocus:a?void 0:()=>h(!0),disabled:a,"aria-label":l,tabIndex:0,children:n||(a?"":e.jsx("span",{className:"vp-empty",children:"—"}))})}function Le({rowIndex:t,rowCount:n,onMoveUp:r,onMoveDown:a,onRemove:s,readOnly:i,draggable:c,onDragStart:l,onDragOver:d,onDrop:h}){const u=p=>{i||(p.altKey&&p.key==="ArrowUp"?(p.preventDefault(),r()):p.altKey&&p.key==="ArrowDown"?(p.preventDefault(),a()):(p.metaKey||p.ctrlKey)&&p.key==="Backspace"&&(p.preventDefault(),s()))};return e.jsx("button",{type:"button",className:"vp-grip",draggable:c&&!i,onDragStart:l,onDragOver:d,onDrop:h,onKeyDown:u,disabled:i,"aria-label":`reorder row ${t+1} of ${n}; alt+up/down to move, ctrl+backspace to remove`,title:"drag to reorder · alt+↑/↓",tabIndex:0,children:e.jsx("span",{"aria-hidden":"true",children:"⋮⋮"})})}function Re({variables:t,onAdd:n,onUpdate:r,onRemove:a,onReorder:s,readOnly:i=!1,title:c}){const l=o.useRef(null),d=o.useCallback(()=>{if(i||!n)return;const m=t[t.length-1];n(m?.id)},[i,n,t]),h=o.useCallback((m,g,y)=>{if(!(i||!r)){if(g==="value"){const w=t.find(_=>_.id===m);if(!w)return;const j=[...w.history,y];r(m,{value:y,history:j});return}r(m,{[g]:y})}},[i,r,t]),u=o.useCallback((m,g)=>{if(i||!s)return;const y=t.findIndex(j=>j.id===m);if(y<0)return;const w=Math.max(0,Math.min(t.length-1,y+g));w!==y&&s(m,w)},[i,s,t]),p=m=>g=>{i||(l.current=m,g.dataTransfer.effectAllowed="move")},x=m=>{i||(m.preventDefault(),m.dataTransfer.dropEffect="move")},f=m=>g=>{if(i)return;g.preventDefault();const y=l.current;if(l.current=null,!y||y===m||!s)return;const w=t.findIndex(j=>j.id===m);w<0||s(y,w)},v=t.length===0,b=o.useMemo(()=>({gridTemplateColumns:"24px 1fr 100px 1.4fr 100px 28px"}),[]);return e.jsxs("section",{className:"vp","aria-label":c??"variables watch table",children:[e.jsxs("header",{className:"vp-header",children:[e.jsx("span",{className:"vp-title",children:c??"variables"}),e.jsxs("span",{className:"vp-count","aria-live":"polite",children:[t.length," ",t.length===1?"row":"rows"]})]}),e.jsxs("div",{role:"grid","aria-rowcount":t.length+1,className:"vp-grid",children:[e.jsxs("div",{role:"row",className:"vp-row vp-row--head",style:b,children:[e.jsx("span",{role:"columnheader","aria-label":"reorder",className:"vp-h"}),e.jsx("span",{role:"columnheader",className:"vp-h",children:"name"}),e.jsx("span",{role:"columnheader",className:"vp-h",children:"type"}),e.jsx("span",{role:"columnheader",className:"vp-h",children:"value"}),e.jsx("span",{role:"columnheader",className:"vp-h",children:"scope"}),e.jsx("span",{role:"columnheader","aria-label":"remove",className:"vp-h"})]}),v&&e.jsx("div",{className:"vp-empty-row",role:"row",children:e.jsx("span",{role:"cell",children:i?"no variables":'no variables — click "+ row" to add'})}),t.map((m,g)=>{const y=g===t.length-1,w=["vp-row",m.stale?"vp-row--stale":"",m.scope==="global"?"vp-row--global":"",m.scope==="static"?"vp-row--static":""].filter(Boolean).join(" ");return e.jsxs("div",{role:"row","aria-rowindex":g+2,className:w,style:b,"data-testid":`vp-row-${g}`,children:[e.jsx(Le,{rowIndex:g,rowCount:t.length,onMoveUp:()=>u(m.id,-1),onMoveDown:()=>u(m.id,1),onRemove:()=>!i&&a?.(m.id),readOnly:i,draggable:!0,onDragStart:p(m.id),onDragOver:x,onDrop:f(m.id)}),e.jsx("div",{role:"cell",children:e.jsx(H,{kind:"name",value:m.name,readOnly:i,onCommit:j=>h(m.id,"name",j),ariaLabel:`name for variable ${g+1}`})}),e.jsx("div",{role:"cell",children:e.jsx(H,{kind:"type",value:m.type,readOnly:i,onCommit:j=>h(m.id,"type",j),ariaLabel:`type for variable ${g+1}`})}),e.jsx("div",{role:"cell",children:e.jsx(H,{kind:"value",value:m.value,type:m.type,history:m.history,readOnly:i,onCommit:j=>h(m.id,"value",j),onAddRowFromLast:y?d:void 0,isLastCell:y,ariaLabel:`value for ${m.name||`variable ${g+1}`}`})}),e.jsx("div",{role:"cell",children:e.jsx(H,{kind:"scope",value:m.scope,readOnly:i,onCommit:j=>h(m.id,"scope",j),ariaLabel:`scope for variable ${g+1}`})}),e.jsx("div",{role:"cell",children:!i&&e.jsx("button",{type:"button",className:"vp-remove",onClick:j=>a?.(m.id),"aria-label":`remove variable ${m.name||g+1}`,tabIndex:0,children:"x"})})]},m.id)})]}),!i&&e.jsxs("div",{className:"vp-footer",children:[e.jsx("button",{type:"button",className:"vp-add",onClick:d,"aria-label":"add new variable row",children:"+ row"}),e.jsxs("span",{className:"vp-hint",children:[e.jsx("span",{className:"vp-kbd",children:"⌘↵"})," from last cell · drag handle or"," ",e.jsx("span",{className:"vp-kbd",children:"alt"}),"+",e.jsx("span",{className:"vp-kbd",children:"↑↓"})," to reorder"]})]}),e.jsx("style",{children:`
        .vp {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: var(--bg-1, var(--color-bg-card, #161b22));
          border: 1px solid var(--border-1, var(--color-border, #30363d));
          border-radius: 6px;
          padding: 10px 12px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          color: var(--text-0, var(--color-text, #e6edf3));
        }
        .vp-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 12px;
        }
        .vp-title {
          color: var(--text-1, var(--color-text-mute, #8b949e));
          letter-spacing: 0.05em;
          text-transform: lowercase;
        }
        .vp-count {
          color: var(--text-2, var(--color-text-faint, #6e7681));
          font-size: 11px;
        }
        .vp-grid {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .vp-row {
          display: grid;
          align-items: stretch;
          gap: 4px;
          padding: 2px 0;
          border-radius: 4px;
        }
        .vp-row--head .vp-h {
          font-size: 10px;
          color: var(--text-2, var(--color-text-faint, #6e7681));
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 8px;
        }
        .vp-row--stale {
          opacity: 0.4;
          text-decoration: line-through;
        }
        .vp-row--global {
          border-left: 2px solid var(--accent-pink, #ff7b72);
        }
        .vp-row--static {
          border-left: 2px solid var(--accent-cyan, #79c0ff);
        }
        .vp-empty-row {
          padding: 14px 8px;
          font-size: 12px;
          color: var(--text-2, #6e7681);
          text-align: center;
          font-style: italic;
        }
        .vp-grip {
          width: 24px;
          background: transparent;
          border: none;
          color: var(--text-2, #6e7681);
          cursor: grab;
          font-size: 10px;
          padding: 0;
          letter-spacing: -1px;
          line-height: 1;
        }
        .vp-grip:hover:not(:disabled) {
          color: var(--accent-cyan, #79c0ff);
        }
        .vp-grip:focus-visible {
          outline: 1px dashed var(--accent-cyan, #79c0ff);
          outline-offset: 1px;
        }
        .vp-grip:active:not(:disabled) {
          cursor: grabbing;
        }
        .vp-grip:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .vp-cell {
          width: 100%;
          background: var(--bg-2, var(--color-bg-elevated, #1f2937));
          border: 1px solid var(--border-1, var(--color-border, #30363d));
          color: var(--text-0, #e6edf3);
          font-family: inherit;
          font-size: 12px;
          padding: 4px 8px;
          text-align: left;
          border-radius: 3px;
          min-height: 24px;
          line-height: 1.4;
          cursor: text;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .vp-cell:hover:not(:disabled) {
          border-color: var(--border-2, var(--color-border-emph, #484f58));
        }
        .vp-cell:focus-visible,
        .vp-cell--editing {
          outline: none;
          border-color: var(--accent-cyan, #79c0ff);
          box-shadow: 0 0 0 1px var(--accent-cyan, #79c0ff);
        }
        .vp-cell--type,
        .vp-cell--scope {
          font-size: 11px;
          color: var(--accent-cyan, #79c0ff);
        }
        .vp-cell--name {
          color: var(--text-0, #e6edf3);
          font-weight: 600;
        }
        .vp-cell--value {
          background: var(--bg-0, var(--color-bg, #0d1117));
        }
        .vp-stale {
          color: var(--text-2, #6e7681);
          text-decoration: line-through;
          opacity: 0.6;
        }
        .vp-current {
          color: var(--accent-grn, var(--color-accent, #7ee787));
          font-weight: 600;
        }
        .vp-empty {
          color: var(--text-2, #6e7681);
          font-style: italic;
        }
        .vp-remove {
          width: 22px;
          height: 22px;
          background: transparent;
          border: none;
          color: var(--text-2, #6e7681);
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          padding: 0;
          align-self: center;
          justify-self: center;
        }
        .vp-remove:hover {
          color: var(--accent-pink, var(--color-danger, #ff7b72));
        }
        .vp-remove:focus-visible {
          outline: 1px dashed var(--accent-pink, #ff7b72);
          outline-offset: 1px;
        }
        .vp-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 4px;
          gap: 12px;
        }
        .vp-add {
          background: transparent;
          border: 1px dashed var(--accent-cyan, #79c0ff);
          color: var(--accent-cyan, #79c0ff);
          font-family: inherit;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 3px;
          cursor: pointer;
        }
        .vp-add:hover {
          background: rgba(121, 192, 255, 0.08);
        }
        .vp-add:focus-visible {
          outline: 1px solid var(--accent-cyan, #79c0ff);
          outline-offset: 1px;
        }
        .vp-hint {
          font-size: 10px;
          color: var(--text-2, #6e7681);
        }
        .vp-kbd {
          background: var(--bg-2, #1f2937);
          border: 1px solid var(--border-1, #30363d);
          border-radius: 2px;
          padding: 0 4px;
          font-size: 10px;
          color: var(--text-1, #8b949e);
          margin: 0 1px;
        }
      `})]})}function De({stdoutLines:t,stdinPrompts:n,stdinValues:r=[],onStdinSubmit:a,exitCode:s,prompt:i="student@cpp-t2:~/q1$",title:c,readOnly:l=!1}){const[d,h]=o.useState(""),u=o.useRef(null),p=o.useRef(null),x=r.length<n.length?r.length:-1,f=x>=0?n[x]:null;o.useEffect(()=>{f!==null&&!l&&requestAnimationFrame(()=>u.current?.focus())},[f,l]),o.useEffect(()=>{const g=p.current;g&&(g.scrollTop=g.scrollHeight)},[t,n,r,s]);const v=g=>{if(g.key==="Enter"&&!g.shiftKey){if(g.preventDefault(),!a)return;a(d),h("")}},b=s===void 0?"tp-badge tp-badge--running":s===0?"tp-badge tp-badge--ok":"tp-badge tp-badge--err",m=s===void 0?"running…":`exit ${s}`;return e.jsxs("section",{className:"tp","aria-label":c??"simulated terminal",children:[e.jsxs("header",{className:"tp-header",children:[e.jsxs("span",{className:"tp-dots","aria-hidden":"true",children:[e.jsx("span",{className:"tp-dot tp-dot--r"}),e.jsx("span",{className:"tp-dot tp-dot--y"}),e.jsx("span",{className:"tp-dot tp-dot--g"})]}),e.jsx("span",{className:"tp-title",children:c??"terminal"}),e.jsx("span",{className:b,"aria-live":"polite",children:m})]}),e.jsxs("div",{className:"tp-body",ref:p,"aria-live":"polite","aria-label":"terminal output",children:[e.jsxs("div",{className:"tp-line tp-line--prompt",children:[e.jsx("span",{className:"tp-shell",children:"$"}),e.jsx("span",{className:"tp-prompt",children:i})]}),t.map((g,y)=>e.jsx("div",{className:"tp-line tp-line--out",children:g===""?" ":g},`out-${y}`)),n.map((g,y)=>{const w=r[y];return w!==void 0?e.jsxs("div",{className:"tp-line tp-line--in",children:[e.jsx("span",{className:"tp-cin-prompt",children:g}),e.jsx("span",{className:"tp-cin-value",children:w})]},`in-${y}`):y===x?e.jsxs("div",{className:"tp-line tp-line--in tp-line--active",children:[e.jsx("label",{className:"tp-cin-prompt",htmlFor:`tp-stdin-${y}`,children:g}),e.jsx("input",{id:`tp-stdin-${y}`,ref:u,type:"text",className:"tp-cin-input",value:d,onChange:j=>h(j.target.value),onKeyDown:v,disabled:l,spellCheck:!1,autoComplete:"off","aria-label":`stdin for: ${g.trim()||"cin prompt"}`,placeholder:""}),e.jsx("span",{className:l?"tp-cursor tp-cursor--off":"tp-cursor","aria-hidden":"true",children:"▍"})]},`in-${y}`):null})]}),e.jsx("style",{children:`
        .tp {
          display: flex;
          flex-direction: column;
          background: var(--bg-0, var(--color-bg, #0d1117));
          border: 1px solid var(--border-1, var(--color-border, #30363d));
          border-radius: 6px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          color: var(--text-0, var(--color-text, #e6edf3));
          overflow: hidden;
          font-size: 12px;
        }
        .tp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 5px 10px;
          background: var(--bg-1, var(--color-bg-card, #161b22));
          border-bottom: 1px solid var(--border-1, #30363d);
          font-size: 11px;
        }
        .tp-dots { display: flex; gap: 4px; }
        .tp-dot {
          width: 9px; height: 9px; border-radius: 50%;
          opacity: 0.7;
        }
        .tp-dot--r { background: #ff7b72; }
        .tp-dot--y { background: #ffd60a; }
        .tp-dot--g { background: #7ee787; }
        .tp-title {
          color: var(--text-1, var(--color-text-mute, #8b949e));
          letter-spacing: 0.05em;
          flex: 1;
        }
        .tp-badge {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 3px;
          font-family: inherit;
          letter-spacing: 0.04em;
        }
        .tp-badge--running {
          background: rgba(255, 214, 10, 0.1);
          color: var(--color-warning, #ffd60a);
          border: 1px solid var(--color-warning, #ffd60a);
        }
        .tp-badge--ok {
          background: rgba(126, 231, 135, 0.1);
          color: var(--accent-grn, var(--color-accent, #7ee787));
          border: 1px solid var(--accent-grn, #7ee787);
        }
        .tp-badge--err {
          background: rgba(255, 123, 114, 0.1);
          color: var(--accent-pink, var(--color-danger, #ff7b72));
          border: 1px solid var(--accent-pink, #ff7b72);
        }
        .tp-body {
          padding: 8px 10px;
          min-height: 80px;
          max-height: 320px;
          overflow-y: auto;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .tp-line {
          display: flex;
          align-items: baseline;
          gap: 6px;
          min-height: 1.5em;
        }
        .tp-line--prompt {
          color: var(--text-1, #8b949e);
          margin-bottom: 2px;
        }
        .tp-shell {
          color: var(--accent-cyan, #79c0ff);
          font-weight: 600;
        }
        .tp-prompt {
          color: var(--text-1, #8b949e);
        }
        .tp-line--out {
          color: var(--text-0, #e6edf3);
          display: block;
        }
        .tp-cin-prompt {
          color: var(--text-1, #8b949e);
          flex-shrink: 0;
        }
        .tp-cin-value {
          color: var(--accent-grn, #7ee787);
          font-weight: 600;
        }
        .tp-cin-input {
          background: transparent;
          border: none;
          color: var(--accent-grn, #7ee787);
          font-family: inherit;
          font-size: inherit;
          padding: 0;
          outline: none;
          flex: 1;
          min-width: 60px;
          font-weight: 600;
        }
        .tp-cin-input:focus-visible {
          outline: none;
        }
        .tp-cin-input:disabled {
          opacity: 0.5;
        }
        .tp-cursor {
          color: var(--accent-grn, #7ee787);
          animation: tp-blink 1s steps(2, start) infinite;
        }
        .tp-cursor--off {
          animation: none;
          opacity: 0.3;
        }
        @keyframes tp-blink {
          to { visibility: hidden; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tp-cursor { animation: none; opacity: 0.7; }
        }
      `})]})}const Me=["<<",">>","==","!=","<=",">=","&&","||"],qe=["<",">","=","+","-","*","/","%"],Ie=new Set(["true","false","nullptr","cout","endl","cin"]);function K(t){if(t==null)return"";let n=t.trim().replace(/\s+/g," ");for(const r of Me){const a=te(r),s=new RegExp(`\\s*${a}\\s*`,"g");n=n.replace(s,r)}for(const r of qe){const a=te(r),s=new RegExp(`\\s*${a}\\s*`,"g");n=n.replace(s,r)}return n=n.replace(/[A-Za-z_][A-Za-z0-9_]*/g,r=>{const a=r.toLowerCase();return Ie.has(a)?a:r}),n}function te(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Ae(t,n){return K(t)===K(n)}function Ke(t){if(!t)return[];const r=t.replace(/\r\n?/g,`
`).split(`
`);return r.length>0&&r[r.length-1]===""&&r.pop(),r}function Pe(t){const n=new Map,r=[];for(const s of t.expectedTrace)!s.variable||s.variable===""||(n.has(s.variable)||r.push(s.variable),n.set(s.variable,s.value));return{variables:r.map(s=>({name:s,value:n.get(s)??""})),terminalLines:t.terminalOutput.slice()}}function Be(t,n){const r=n.variables.map(u=>{const p=t.variables.find(v=>v.name===u.name);if(!p)return{name:u.name,correct:!1,expected:u.value,actual:"",missing:!0};const x=p.history.length>0?p.history[p.history.length-1]??"":p.value??"",f=Ae(x,u.value);return{name:u.name,correct:f,expected:u.value,actual:x,missing:!1}}),a=r.every(u=>u.correct),s=Ke(t.terminalText),i=n.terminalLines.slice();let c=s.length===i.length;if(c)for(let u=0;u<i.length;u++){const p=s[u]??"",x=i[u]??"";if(K(p)!==K(x)){c=!1;break}}const l=i.join(`
`),d=s.join(`
`),h={pass:a&&c,varResults:r,terminalCorrect:c,expectedTerminalText:l,actualTerminalText:d};return c||(h.terminalDiff=Fe(s,i)),h}function Fe(t,n){const r=Math.max(t.length,n.length),a=[];for(let s=0;s<r;s++){const i=t[s],c=n[s];i===void 0&&c!==void 0?a.push(`- ${c}`):i!==void 0&&c===void 0?a.push(`+ ${i}`):i!==void 0&&c!==void 0&&(K(i)!==K(c)?(a.push(`- ${c}`),a.push(`+ ${i}`)):a.push(`  ${i}`))}return a.join(`
`)}const Ye={int:""};function He(t,n){if(n===null||n<1)return t;const r=t.split(`
`);if(n>r.length)return t;const a=n-1,s=r[a]??"";return s.startsWith("▶ ")?t:(r[a]=`▶ ${s}`,r.join(`
`))}function We(t){let n=1;for(let r=0;r<t.length;r++)t[r]===`
`&&n++;return n}function Ue(){return`vp_${Math.random().toString(36).slice(2,9)}`}function At({card:t,onComplete:n}){const r=o.useMemo(()=>Pe(t),[t]),a=o.useMemo(()=>We(t.code),[t.code]),[s,i]=o.useState([]),[c,l]=o.useState(""),[d,h]=o.useState(null),[u,p]=o.useState(null),[x,f]=o.useState(null);o.useEffect(()=>{i([]),l(""),h(null),p(null),f(null)},[t.id]);const v=o.useCallback(()=>{i(k=>[...k,{id:Ue(),name:"",type:"int",value:Ye.int,scope:"local",history:[]}])},[]),b=o.useCallback((k,E)=>{i(C=>C.map($=>$.id===k?{...$,...E}:$))},[]),m=o.useCallback(k=>{i(E=>E.filter(C=>C.id!==k))},[]),g=o.useCallback((k,E)=>{i(C=>{const $=C.findIndex(S=>S.id===k);if($<0)return C;const z=[...C],[N]=z.splice($,1);return N?(z.splice(E,0,N),z):C})},[]),y=o.useCallback(()=>{h(null),i([]),l(""),f(null)},[]),w=o.useCallback(()=>{h(k=>{if(k===null)return 1;if(k===-1)return-1;const E=k+1;return E>a?-1:E})},[a]),j=o.useCallback(()=>{h(-1)},[]),_=o.useCallback(()=>{const k=Be({variables:s,terminalText:c},r);f(k),k.pass&&n(!0)},[s,c,r,n]),D=o.useCallback(()=>f(null),[]),I=o.useMemo(()=>He(t.code,d===-1?null:d),[t.code,d]),L=o.useCallback(k=>{},[]),M=o.useMemo(()=>({display:"grid",gridTemplateColumns:"minmax(0, 1.4fr) minmax(0, 1fr)",gridTemplateRows:"auto 1fr auto",gridTemplateAreas:`
        "header   header"
        "code     panes"
        "footer   footer"
      `,gap:"12px",padding:"12px",width:"100%",maxWidth:"1280px",margin:"0 auto",minHeight:"560px"}),[]);return e.jsxs("section",{className:"tc-root",role:"application","aria-label":`Trace exercise — atom ${t.atomId}`,"data-testid":"trace-card",style:M,children:[e.jsxs("header",{className:"tc-header",style:{gridArea:"header"},children:[e.jsx("div",{className:"tc-stem","aria-label":"trace prompt",children:e.jsx("span",{className:"tc-stem-text",children:t.stem})}),e.jsxs("div",{className:"tc-meta",children:[e.jsx("span",{className:"tc-atom-id","aria-label":"atom id",children:t.atomId}),e.jsx("span",{className:"tc-q-tags","aria-label":"question tags",children:t.qTags.join(" · ")}),e.jsx(Ge,{value:u,onChange:p})]})]}),e.jsx("div",{className:"tc-code-pane",style:{gridArea:"code",minHeight:0,display:"flex"},children:e.jsx(q,{value:I,onChange:L,language:"cpp",readOnly:!0,ariaLabel:d&&d>0?`C++ trace, active line ${d}`:"C++ trace, code panel"})}),e.jsxs("div",{className:"tc-right-col",style:{gridArea:"panes",display:"grid",gridTemplateRows:"minmax(0, 1.5fr) minmax(0, 1fr)",gap:"12px",minHeight:0},children:[e.jsx("div",{className:"tc-vars-pane",style:{minHeight:0,overflow:"auto"},"aria-label":"variables panel",children:e.jsx(Re,{variables:s,onAdd:v,onUpdate:b,onRemove:m,onReorder:g,title:"memory (you fill this in)"})}),e.jsx("div",{className:"tc-term-pane",style:{minHeight:0,display:"flex",flexDirection:"column"},"aria-label":"terminal panel",children:e.jsx(Je,{value:c,onChange:l,readOnly:x?.pass===!0})})]}),e.jsxs("footer",{className:"tc-footer",style:{gridArea:"footer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px"},children:[e.jsxs("div",{className:"tc-step-controls",role:"group","aria-label":"step controls",children:[e.jsxs("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:y,"aria-label":"reset trace to initial state",children:[e.jsx("span",{"aria-hidden":"true",children:"⏮"}),e.jsx("span",{className:"tc-btn-label",children:"reset"})]}),e.jsxs("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:w,"aria-label":"step to next line",disabled:d===-1,children:[e.jsx("span",{"aria-hidden":"true",children:"⏵"}),e.jsx("span",{className:"tc-btn-label",children:"step"}),d!==null&&d>0&&e.jsxs("span",{className:"tc-step-pos","aria-hidden":"true",children:[d,"/",a]})]}),e.jsxs("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:j,"aria-label":"run to end (skip line highlighting)",children:[e.jsx("span",{"aria-hidden":"true",children:"⏩"}),e.jsx("span",{className:"tc-btn-label",children:"run"})]})]}),e.jsxs("div",{className:"tc-submit-area",children:[x&&!x.pass&&e.jsx("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:D,"aria-label":"dismiss feedback and try again",children:"try again"}),e.jsx("button",{type:"button",className:"tc-btn tc-btn--primary",onClick:_,"aria-label":"submit trace for grading",disabled:x?.pass===!0,children:x?.pass?"passed":"submit"})]})]}),x&&e.jsx(Ve,{grade:x,onTryAgain:D,teachMe:t.teachMe}),e.jsx("style",{children:Oe})]})}function Ge({value:t,onChange:n}){const r=[{v:0,label:"?",title:"unsure"},{v:1,label:"◔",title:"low"},{v:2,label:"◑",title:"medium"},{v:3,label:"●",title:"high"}];return e.jsxs("div",{className:"tc-conf",role:"group","aria-label":"confidence rating (placeholder)",children:[e.jsx("span",{className:"tc-conf-label",children:"confidence:"}),r.map(a=>e.jsx("button",{type:"button",className:`tc-conf-stop ${t===a.v?"is-active":""}`,onClick:()=>n(a.v),"aria-label":`confidence ${a.title}`,"aria-pressed":t===a.v,title:a.title,children:a.label},a.v))]})}function Je({value:t,onChange:n,readOnly:r}){const a=t===""?[]:t.split(/\r\n?|\n/);return a.length>0&&a[a.length-1]===""&&a.pop(),e.jsxs("div",{className:"tc-term-wrap","aria-label":"predicted terminal output",children:[e.jsx(De,{stdoutLines:a,stdinPrompts:[],title:"predicted output",readOnly:!0}),e.jsx("label",{htmlFor:"tc-term-input",className:"tc-term-label",children:"type the stdout you predict, one line per row"}),e.jsx("textarea",{id:"tc-term-input",className:"tc-term-input",value:t,onChange:s=>n(s.target.value),readOnly:r,spellCheck:!1,autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",wrap:"off",rows:3,placeholder:"(no output expected — leave blank if so)","aria-label":"terminal input — type predicted stdout","aria-multiline":"true"})]})}function Ve({grade:t,onTryAgain:n,teachMe:r}){return e.jsxs("div",{className:`tc-feedback ${t.pass?"tc-feedback--ok":"tc-feedback--fail"}`,role:"status","aria-live":"polite",children:[e.jsxs("header",{className:"tc-feedback-header",children:[e.jsx("strong",{children:t.pass?"✓ pass":"✗ not yet"}),!t.pass&&e.jsx("button",{type:"button",className:"tc-btn tc-btn--ghost tc-btn--small",onClick:n,"aria-label":"close feedback",children:"close"})]}),e.jsxs("section",{className:"tc-feedback-section",children:[e.jsx("h4",{children:"variables"}),e.jsx("ul",{className:"tc-var-results",children:t.varResults.map(a=>e.jsxs("li",{className:a.correct?"tc-var-ok":"tc-var-bad",children:[e.jsx("code",{children:a.name}),a.correct?e.jsxs("span",{"aria-label":"correct",children:[" ✓ ",a.actual]}):a.missing?e.jsxs("span",{"aria-label":"missing",children:[" ","✗ missing — expected ",e.jsx("code",{children:a.expected})]}):e.jsxs("span",{"aria-label":"incorrect",children:[" ","✗ got ",e.jsx("code",{children:a.actual||'""'}),", expected"," ",e.jsx("code",{children:a.expected})]})]},a.name))})]}),e.jsxs("section",{className:"tc-feedback-section",children:[e.jsx("h4",{children:"terminal"}),t.terminalCorrect?e.jsx("p",{children:e.jsx("span",{"aria-label":"correct",children:"✓ matches expected output"})}):e.jsx("pre",{className:"tc-term-diff","aria-label":"terminal diff",children:t.terminalDiff||"(no diff)"})]}),!t.pass&&r&&e.jsxs("details",{className:"tc-teach-me",children:[e.jsx("summary",{children:"teach me"}),e.jsx("pre",{className:"tc-teach-me-body",children:r})]})]})}const Oe=`
.tc-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  position: relative;
}
.tc-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.tc-stem {
  flex: 1 1 320px;
  color: var(--text-0, #e6edf3);
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.tc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
  flex-wrap: wrap;
}
.tc-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.tc-q-tags {
  color: var(--accent-org, #ffa657);
  letter-spacing: 0.05em;
}
.tc-conf {
  display: flex;
  align-items: center;
  gap: 4px;
}
.tc-conf-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tc-conf-stop {
  width: 22px;
  height: 22px;
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-2, #6e7681);
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  font-family: inherit;
}
.tc-conf-stop:hover { color: var(--accent-cyan, #79c0ff); }
.tc-conf-stop.is-active {
  background: rgba(121,192,255,0.12);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.tc-conf-stop:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 1px;
}

.tc-step-controls,
.tc-submit-area {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 0.02em;
}
.tc-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.tc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.tc-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.tc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.tc-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
  color: var(--bg-0, #0d1117);
}
.tc-btn--ghost {
  background: transparent;
}
.tc-btn--small { font-size: 10px; padding: 3px 8px; }
.tc-btn-label { letter-spacing: 0.04em; }
.tc-step-pos {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  margin-left: 2px;
}

.tc-term-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
}
.tc-term-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: lowercase;
  letter-spacing: 0.05em;
}
.tc-term-input {
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 10px;
  resize: vertical;
  min-height: 56px;
  outline: 0;
  caret-color: var(--accent-grn, #7ee787);
}
.tc-term-input:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}

.tc-feedback {
  position: absolute;
  inset: auto 12px 12px 12px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 14px;
  font-size: 12px;
  z-index: 5;
  max-height: 60vh;
  overflow: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.tc-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.tc-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.tc-feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}
.tc-feedback--ok .tc-feedback-header strong { color: var(--accent-grn, #7ee787); }
.tc-feedback--fail .tc-feedback-header strong { color: var(--accent-pink, #ff7b72); }
.tc-feedback-section {
  border-top: 1px dashed var(--border-1, #30363d);
  padding-top: 8px;
  margin-top: 8px;
}
.tc-feedback-section h4 {
  font-size: 10px;
  margin: 0 0 6px 0;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.tc-var-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tc-var-results code {
  background: var(--bg-2, #1f2937);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.tc-var-ok { color: var(--accent-grn, #7ee787); }
.tc-var-bad { color: var(--accent-pink, #ff7b72); }
.tc-term-diff {
  margin: 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  font-size: 11px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
.tc-teach-me {
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.tc-teach-me summary {
  cursor: pointer;
  color: var(--accent-cyan, #79c0ff);
}
.tc-teach-me-body {
  margin: 6px 0 0 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
}
`,Qe=["identifier","number","string"],Ze=new Set(["main","cout","cin","endl","std"]);function Xe(t,n,r){let a=Qe,s={};Array.isArray(n)&&(a=n.filter(x=>["keyword","identifier","string","number","comment","operator","punctuation","whitespace"].includes(x)),s={});const i=s.placeholder??"___",c=new Set([...Ze,...s.keepTokens??[]]),l=new Set(a),d=W(t),h=d.map(x=>!l.has(x.type)||x.type==="identifier"&&(c.has(x.value)||ie.has(x.value))?x.value:i),u=[];let p=0;for(;p<h.length;){const x=h[p]??"";if(u.push(x),x===i){let f=p+1,v="";for(;f<h.length&&h[f]!==i&&d[f]?.type==="whitespace"&&!h[f]?.includes(`
`);)v+=h[f]??"",f++;if(f<h.length&&h[f]===i&&v.length>0){u.push(v),u.push(i),p=f+1;continue}}p++}return u.join("")}const et=["<<=",">>=","==","!=","<=",">=","&&","||","++","--","+=","-=","*=","/=","%=","<<",">>","->","::"],tt=["=","<",">","+","-","*","/","%","&","|","!","^","~","?"];function ae(t){let n=t.replace(/\t/g,"    ");for(const r of et){const a=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");n=n.replace(new RegExp(`\\s*${a}\\s*`,"g"),r)}for(const r of tt){const a=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");n=n.replace(new RegExp(`\\s*${a}\\s*`,"g"),r)}return n=n.replace(/\s+/g," ").trim(),n}function le(t,n){const r=t.split(`
`);return n.split(`
`).map((s,i)=>{const c=r[i];return c===void 0?!1:ae(c)===ae(s)})}function at(t,n){const r=le(t,n),a=r.findIndex(d=>!d),s=t.split(`
`),i=n.split(`
`);let c=!1;for(let d=i.length;d<s.length;d++)if((s[d]??"").trim().length>0){c=!0;break}return{ok:a===-1&&!c,matched:r,firstMismatch:a}}function rt(t){let n=0,r=0,a=!1,s=null;for(;r<t.length;){const i=t[r],c=t[r+1];if(a){i===`
`&&(a=!1),r++;continue}if(s){if(i==="\\"){r+=2;continue}i===s&&(s=null),r++;continue}if(i==="/"&&c==="/"){a=!0,r+=2;continue}if(i==='"'||i==="'"){s=i,r++;continue}i==="{"?n++:i==="}"&&n--,r++}return n}const re="✓",nt="✗";function Kt({card:t,onComplete:n,mode:r,studySeconds:a=5,skeletonOverride:s}){const[i,c]=o.useState("STUDY"),[l,d]=o.useState(""),[h,u]=o.useState(a),[p,x]=o.useState(!1),[f,v]=o.useState(null),b=o.useRef(null),m=t.canonicalAnswer,g=o.useMemo(()=>s!==void 0?s:Xe(t.template??m),[s,t.template,m]),y=o.useMemo(()=>le(l,m),[l,m]),w=m.split(`
`).length,j=y.filter(Boolean).length,_=o.useMemo(()=>rt(l),[l]),D=o.useMemo(()=>{if(r!=="line-by-line")return-1;const z=y.findIndex(N=>!N);return z===-1?w:z},[r,y,w]);o.useEffect(()=>{if(i!=="STUDY"||a<=0)return;u(a);const z=Date.now(),N=window.setInterval(()=>{const S=(Date.now()-z)/1e3,T=Math.max(0,a-S);u(T),T<=0&&(window.clearInterval(N),c("HIDE"))},100);return()=>window.clearInterval(N)},[i,a]),o.useEffect(()=>{i==="TYPE"&&requestAnimationFrame(()=>b.current?.focus())},[i]);const I=o.useCallback(()=>{const z=at(l,m);v({ok:z.ok,firstMismatch:z.firstMismatch}),c("GRADED"),n(z.ok)},[l,m,n]),L=o.useCallback(()=>{x(!0)},[]),M=o.useCallback(()=>{x(!1),i==="STUDY"?c("HIDE"):i==="HIDE"?c("TYPE"):i==="TYPE"&&I()},[i,I]),k=o.useCallback(()=>x(!1),[]),E=o.useCallback(z=>{if(z.key==="Escape"){if(z.preventDefault(),i==="GRADED")return;L()}},[i,L]),C=(z,N)=>e.jsxs("header",{className:"trc-header",children:[e.jsx("h2",{className:"trc-stage",children:z}),N?e.jsx("p",{className:"trc-sub",children:N}):null]}),$=e.jsxs("div",{role:"status","aria-live":"polite",className:"trc-sr-only",children:["Stage: ",i,". ",i==="TYPE"?`${j} of ${w} lines matched.`:""]});return e.jsxs("div",{className:"trc-root","data-stage":i,onKeyDown:E,tabIndex:-1,"aria-label":`Template recall card: ${t.stem}`,children:[e.jsx("style",{children:st}),e.jsxs("div",{className:"trc-prompt",children:[e.jsx("span",{className:"trc-prompt-label",children:"PROMPT"}),e.jsx("p",{children:t.prompt})]}),$,i==="STUDY"&&e.jsxs("section",{"aria-labelledby":"trc-h-study",children:[C("Stage 1 — STUDY",a>0?`Read the canonical code. Auto-advance in ${h.toFixed(1)}s.`:"Read the canonical code. Press [I'm ready] when memorized."),e.jsx("div",{className:"trc-editor-wrap",children:e.jsx(q,{value:m,onChange:()=>{},language:"cpp",readOnly:!0,ariaLabel:"Canonical code (study)"})}),e.jsxs("div",{className:"trc-actions",children:[e.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:()=>c("HIDE"),children:"I'm ready"}),e.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:L,children:"Skip (Esc)"})]})]}),i==="HIDE"&&e.jsxs("section",{"aria-labelledby":"trc-h-hide",children:[C("Stage 2 — HIDE","Commit the shape. Names hidden. Press [Recall] to type."),e.jsx("div",{className:"trc-editor-wrap trc-skeleton",children:e.jsx(q,{value:g,onChange:()=>{},language:"cpp",readOnly:!0,ariaLabel:"Skeleton hint (structure preserved, names hidden)"})}),e.jsxs("div",{className:"trc-actions",children:[e.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:()=>c("TYPE"),children:"Recall"}),e.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:L,children:"Skip (Esc)"})]})]}),i==="TYPE"&&e.jsxs("section",{"aria-labelledby":"trc-h-type",children:[C(r==="line-by-line"?"Stage 3 — TYPE (line by line)":"Stage 3 — TYPE (all at once)","Reproduce the canonical code. Ticks appear as each line matches."),e.jsxs("div",{className:"trc-type-grid",children:[e.jsx("ul",{className:"trc-tick-col","aria-hidden":"true",children:Array.from({length:Math.max(w,1)}).map((z,N)=>{const S=y[N]===!0,T=r==="line-by-line"&&N===D;return e.jsx("li",{className:`trc-tick ${S?"trc-tick-ok":T?"trc-tick-active":"trc-tick-pending"}`,children:S?re:T?"▸":""},N)})}),e.jsx("div",{className:"trc-editor-wrap",children:e.jsx(q,{ref:b,value:l,onChange:d,language:"cpp",ariaLabel:`Type your answer. ${j} of ${w} lines match.`,placeholder:"Type the canonical code here…"})})]}),e.jsxs("div",{className:"trc-meta",children:[e.jsxs("span",{className:`trc-counter ${_===0?"trc-counter-ok":"trc-counter-bad"}`,children:["braces: ",_>=0?"+":"",_]}),e.jsxs("span",{className:"trc-counter",children:["lines: ",j,"/",w]})]}),e.jsxs("div",{className:"trc-actions",children:[e.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:I,children:"Submit"}),e.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:L,children:"Give up (Esc)"})]})]}),i==="GRADED"&&f&&e.jsxs("section",{"aria-labelledby":"trc-h-graded",children:[C(f.ok?"PASS ✓":"FAIL ✗",f.ok?"Verbatim match. Move on.":`First mismatch at line ${f.firstMismatch+1}. See diff below.`),!f.ok&&e.jsxs("div",{className:"trc-diff","aria-label":"Diff: your answer vs canonical",children:[e.jsxs("div",{className:"trc-diff-col",children:[e.jsx("h3",{children:"Your answer"}),e.jsx("pre",{className:"trc-diff-pre",children:l.split(`
`).map((z,N)=>e.jsxs("div",{className:y[N]?"trc-diff-ok":"trc-diff-bad",children:[e.jsx("span",{className:"trc-diff-mark",children:y[N]?re:nt})," ",z||" "]},N))})]}),e.jsxs("div",{className:"trc-diff-col",children:[e.jsx("h3",{children:"Canonical"}),e.jsx("pre",{className:"trc-diff-pre",children:m.split(`
`).map((z,N)=>e.jsx("div",{children:z||" "},N))})]})]}),t.explanation&&e.jsxs("details",{className:"trc-explanation",children:[e.jsx("summary",{children:"Why this shape?"}),e.jsx("p",{children:t.explanation})]})]}),p&&e.jsx("div",{role:"alertdialog","aria-modal":"true","aria-labelledby":"trc-skip-h",className:"trc-modal",children:e.jsxs("div",{className:"trc-modal-card",children:[e.jsx("h3",{id:"trc-skip-h",children:"Skip this stage?"}),e.jsx("p",{children:i==="STUDY"?"You won't see the canonical again until you've graded.":i==="HIDE"?"You'll go straight to typing without the structure hint.":"Submitting now will grade your current answer."}),e.jsxs("div",{className:"trc-actions",children:[e.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:M,autoFocus:!0,children:"Skip"}),e.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:k,children:"Cancel"})]})]})})]})}const st=`
.trc-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
}

.trc-prompt {
  border-left: 3px solid var(--accent-cyan, #79c0ff);
  padding: 8px 12px;
  background: var(--bg-1, #161b22);
  border-radius: 0 4px 4px 0;
}
.trc-prompt-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--text-2, #6e7681);
  margin-bottom: 4px;
}
.trc-prompt p { margin: 0; font-size: 14px; }

.trc-header { margin: 0; }
.trc-stage {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-cyan, #79c0ff);
}
.trc-sub {
  margin: 0;
  color: var(--text-1, #8b949e);
  font-size: 13px;
}

.trc-editor-wrap { min-height: 8rem; }
.trc-skeleton .ce-tok-identifier { color: var(--text-2, #6e7681); }

.trc-type-grid {
  display: grid;
  grid-template-columns: 2.25rem 1fr;
  gap: 0;
  align-items: stretch;
}
.trc-tick-col {
  list-style: none;
  margin: 0;
  padding: 12px 0;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-right: none;
  border-radius: 6px 0 0 6px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 14px;
  line-height: 1.55;
}
.trc-tick {
  padding: 0 8px;
  text-align: center;
}
.trc-tick-ok { color: var(--accent-grn, #7ee787); }
.trc-tick-active { color: var(--accent-org, #ffa657); }
.trc-tick-pending { color: var(--text-2, #6e7681); }
.trc-type-grid .ce-root { border-radius: 0 6px 6px 0; }

.trc-meta {
  display: flex;
  gap: 16px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  color: var(--text-1, #8b949e);
}
.trc-counter-ok { color: var(--accent-grn, #7ee787); }
.trc-counter-bad { color: var(--state-err, #f85149); }

.trc-actions { display: flex; gap: 8px; }
.trc-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #21262d);
  color: var(--text-0, #e6edf3);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.trc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.trc-btn-primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.trc-btn-ghost { background: transparent; }

.trc-diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.trc-diff-col { min-width: 0; }
.trc-diff-col h3 {
  margin: 0 0 4px 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-2, #6e7681);
}
.trc-diff-pre {
  margin: 0;
  padding: 8px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre;
  overflow-x: auto;
}
.trc-diff-ok { color: var(--accent-grn, #7ee787); }
.trc-diff-bad { color: var(--state-err, #f85149); }
.trc-diff-mark { display: inline-block; width: 1ch; }

.trc-explanation {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-1, #8b949e);
}
.trc-explanation summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }

.trc-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.trc-modal-card {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 20px;
  max-width: 28rem;
}

.trc-sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
`;function R(t){let n=t.replace(/\t/g,"    ");return n=n.replace(/[ \t]+/g," "),n=n.split(`
`).map(r=>r.trim()).filter(r=>r.length>0).join(`
`),n=n.replace(/\s*([{};,()<>=+\-*/\[\]])\s*/g,"$1"),n.trim()}function it(t,n){if(t===n)return 1;if(t.length===0||n.length===0)return 0;const r=t.length,a=n.length;let s=new Array(a+1),i=new Array(a+1);for(let l=0;l<=a;l++)s[l]=l;for(let l=1;l<=r;l++){i[0]=l;for(let d=1;d<=a;d++){const h=t[l-1]===n[d-1]?0:1;i[d]=Math.min((s[d]??0)+1,(i[d-1]??0)+1,(s[d-1]??0)+h)}[s,i]=[i,s]}const c=s[a]??0;return Math.max(0,1-c/Math.max(r,a))}function J(t,n,r){let a=0,s=0,i=!1,c=!1,l=!1,d=!1;for(let h=0;h<t.length;h++){const u=t[h],p=t[h+1];if(l){u===`
`&&(l=!1);continue}if(d){u==="*"&&p==="/"&&(d=!1,h++);continue}if(i){if(u==="\\"&&p!==void 0){h++;continue}u==='"'&&(i=!1);continue}if(c){if(u==="\\"&&p!==void 0){h++;continue}u==="'"&&(c=!1);continue}if(u==="/"&&p==="/"){l=!0,h++;continue}if(u==="/"&&p==="*"){d=!0,h++;continue}if(u==='"'){i=!0;continue}if(u==="'"){c=!0;continue}u===n?a++:u===r&&s++}return[a,s]}function ne(t,n){const r=t.indexOf(n);if(r===-1)return;let a=1;for(let s=0;s<r;s++)t[s]===`
`&&a++;return a}function se(t,n){const r=t.split(`
`),a=n.split(`
`),s=Math.max(r.length,a.length),i=[];for(let c=0;c<s;c++){const l=r[c]??"",d=a[c]??"";i.push({line:c+1,studentLine:l,canonicalLine:d,match:R(l)===R(d)})}return i}function P(t,n){const r=[];if(t.trim().length===0)return{pass:!1,score:0,errors:[{kind:"empty",message:"You haven’t written anything yet — start with `struct`."}],diff:se("",n.canonicalAnswer)};const[a,s]=J(t,"{","}");a!==s&&r.push({kind:"brace-imbalance",expected:String(a),actual:String(s),message:a>s?`Missing ${a-s} closing brace${a-s>1?"s":""} \`}\`.`:`Extra ${s-a} closing brace${s-a>1?"s":""} \`}\`.`});const[i,c]=J(t,"(",")");i!==c&&r.push({kind:"paren-imbalance",expected:String(i),actual:String(c),message:`Unbalanced parentheses (${i} \`(\` vs ${c} \`)\`).`});const[l,d]=J(t,"[","]");l!==d&&r.push({kind:"bracket-imbalance",expected:String(l),actual:String(d),message:`Unbalanced square brackets (${l} \`[\` vs ${d} \`]\`).`});const h=n.requireSemicolon??!0;if(h&&!t.includes(";")&&r.push({kind:"missing-semicolon",message:"No `;` found. Struct/function bodies need at least one."}),h&&/struct\s+\w+/.test(t)){const w=t.lastIndexOf("}");if(w!==-1&&!t.slice(w+1).trim().startsWith(";")){const _=ne(t,"}"),D={kind:"missing-semicolon",expected:"};",actual:"}",message:"Missing `;` after the closing `}` — struct definitions need `};`."};_!==void 0&&(D.line=_),r.push(D)}}for(const w of n.forbiddenTokens??[])if(t.includes(w)){const j=ne(t,w),_={kind:"forbidden-token",actual:w,message:`Don’t use \`${w}\` here.`};j!==void 0&&(_.line=j),r.push(_)}const u=R(t);for(const w of n.keyChecks??[]){const j=R(w);u.includes(j)||r.push({kind:"missing-keycheck",expected:w,message:`Missing required token: \`${w}\`.`})}const p=R(n.canonicalAnswer),x=it(u,p);x<.85&&r.push({kind:"char-mismatch",expected:n.canonicalAnswer,actual:t,message:`Code shape doesn’t match the canonical solution (${Math.round(x*100)}% similar).`});const f=n.keyChecks?.length??0,v=f-r.filter(w=>w.kind==="missing-keycheck").length,b=f===0?1:v/f,m=(r.some(w=>w.kind==="brace-imbalance")?0:1)*(r.some(w=>w.kind==="paren-imbalance")?0:1)*(r.some(w=>w.kind==="missing-semicolon")?0:1)*(r.some(w=>w.kind==="forbidden-token")?0:1),g=Math.round(x*60+b*25+m*15);return{pass:!r.some(w=>w.kind==="forbidden-token"||w.kind==="missing-keycheck"||w.kind==="brace-imbalance"||w.kind==="missing-semicolon"||w.kind==="empty")&&x>=.85,score:g,errors:r,diff:se(t,n.canonicalAnswer)}}function Pt({card:t,onComplete:n,showSkeleton:r=!1}){const[a,s]=o.useState(""),[i,c]=o.useState(null),l=o.useRef(null),d=o.useId(),h=o.useId(),u=o.useMemo(()=>{let b=0,m=0;for(let g=0;g<a.length;g++)a[g]==="{"?b++:a[g]==="}"&&m++;return{opens:b,closes:m,balanced:b===m}},[a]),p=t.requiredFields??[],x=o.useCallback(()=>{const b=P(a,{canonicalAnswer:t.canonicalAnswer,keyChecks:t.keyChecks,forbiddenTokens:t.forbiddenTokens,requireSemicolon:!0});c(b),n(b.pass)},[a,t,n]),f=o.useCallback(()=>{c(null),s(""),requestAnimationFrame(()=>l.current?.focus())},[]),v=i?i.pass?"Pass":i.errors[0]?.message??"Not quite — review the diff below.":"";return e.jsxs("div",{className:"swc-root",children:[e.jsx("style",{children:dt}),e.jsxs("div",{className:"swc-grid",children:[e.jsxs("section",{className:"swc-prompt","aria-labelledby":`${h}-title`,children:[e.jsxs("header",{children:[e.jsx("span",{className:"swc-eyebrow",children:"Q2 · struct write"}),e.jsx("h2",{id:`${h}-title`,children:t.stem})]}),e.jsxs("div",{className:"swc-entity",children:[e.jsx("p",{children:t.prompt}),p.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("h3",{children:"Required fields"}),e.jsx("ul",{children:p.map(b=>e.jsx("li",{children:e.jsx("code",{children:b})},b))})]})]}),r&&e.jsxs("div",{className:"swc-hint","aria-label":"Skeleton hint",children:[e.jsx("h3",{children:"Skeleton (Stage 1 only)"}),e.jsx("pre",{children:e.jsx("code",{children:`struct ___ {
    ___;
    ___;
    ___;
};`})}),e.jsxs("p",{className:"swc-hint-note",children:["Replace each ",e.jsx("code",{children:"___"})," with the right type + field name. You can also type from a blank page."]})]})]}),e.jsxs("section",{className:"swc-editor","aria-label":"Your struct definition",children:[e.jsxs("header",{className:"swc-editor-header",children:[e.jsx("span",{className:"swc-editor-title",children:"struct.cpp"}),e.jsx("span",{className:`swc-brace-counter${u.balanced?"":" swc-brace-counter--bad"}`,"aria-label":`Braces: ${u.opens} open, ${u.closes} close`,children:`{ ${u.opens} / } ${u.closes}`})]}),e.jsx(q,{ref:l,value:a,onChange:s,language:"cpp",ariaLabel:`Struct write editor — ${t.stem}`,placeholder:"// Type the struct definition here…",readOnly:i!==null}),e.jsx("div",{className:"swc-actions",children:i===null?e.jsx("button",{type:"button",onClick:x,disabled:a.trim().length===0,className:"swc-btn swc-btn--primary","aria-describedby":d,children:"Submit"}):e.jsx("button",{type:"button",onClick:f,className:"swc-btn swc-btn--secondary",children:"Retry"})})]})]}),e.jsx("div",{id:d,className:"swc-grade",role:"status","aria-live":"polite","aria-atomic":"true",children:i&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:`swc-banner${i.pass?" swc-banner--pass":" swc-banner--fail"}`,children:[e.jsx("strong",{children:i.pass?"Pass":"Not yet"}),e.jsxs("span",{className:"swc-score",children:[i.score,"/100"]}),e.jsx("span",{className:"swc-headline",children:v})]}),i.errors.length>0&&e.jsx("ul",{className:"swc-errors",children:i.errors.map((b,m)=>e.jsx("li",{children:e.jsx(ct,{err:b})},`${b.kind}-${m}`))}),e.jsx(lt,{diff:i.diff}),e.jsxs("details",{className:"swc-explain",children:[e.jsx("summary",{children:"Why?"}),e.jsx("p",{children:t.explanation})]})]})})]})}function ct({err:t}){return e.jsxs("span",{className:"swc-error-row",children:[e.jsx("span",{className:`swc-tag swc-tag--${t.kind}`,children:ot(t.kind)}),e.jsx("span",{className:"swc-error-msg",children:t.message}),t.line!==void 0&&e.jsxs("span",{className:"swc-line",children:["line ",t.line]})]})}function ot(t){switch(t){case"brace-imbalance":return"braces";case"paren-imbalance":return"parens";case"bracket-imbalance":return"brackets";case"missing-semicolon":return"semicolon";case"forbidden-token":return"forbidden";case"missing-keycheck":return"missing";case"char-mismatch":return"shape";case"empty":return"empty"}}function lt({diff:t}){return e.jsxs("table",{className:"swc-diff","aria-label":"Per-line comparison",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",children:"#"}),e.jsx("th",{scope:"col",children:"Your code"}),e.jsx("th",{scope:"col",children:"Canonical"}),e.jsx("th",{scope:"col","aria-label":"Match",children:"✓"})]})}),e.jsx("tbody",{children:t.map(n=>e.jsxs("tr",{className:n.match?"swc-diff-row--ok":"swc-diff-row--bad",children:[e.jsx("td",{children:n.line}),e.jsx("td",{children:e.jsx("code",{children:n.studentLine||" "})}),e.jsx("td",{children:e.jsx("code",{children:n.canonicalLine||" "})}),e.jsx("td",{"aria-label":n.match?"match":"differ",children:n.match?"✓":"✗"})]},n.line))})]})}const dt=`
.swc-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--text-0, #e6edf3);
  font-family: var(--font-sans, system-ui, sans-serif);
}
.swc-grid {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 16px;
  align-items: stretch;
}
.swc-prompt {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.swc-prompt header { display: flex; flex-direction: column; gap: 4px; }
.swc-eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-2, #6e7681);
}
.swc-prompt h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
  color: var(--text-0, #e6edf3);
}
.swc-entity p {
  margin: 0 0 12px;
  line-height: 1.55;
  color: var(--text-1, #8b949e);
}
.swc-entity h3 {
  margin: 8px 0 6px;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-2, #6e7681);
}
.swc-entity ul {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.swc-entity code,
.swc-hint code {
  background: var(--bg-2, #21262d);
  padding: 1px 6px;
  border-radius: 3px;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
}
.swc-hint {
  margin-top: auto;
  border: 1px dashed var(--accent-cyan, #79c0ff);
  border-radius: 6px;
  padding: 12px;
  background: rgba(121, 192, 255, 0.04);
}
.swc-hint h3 {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-cyan, #79c0ff);
}
.swc-hint pre {
  margin: 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 4px;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  white-space: pre;
  overflow-x: auto;
}
.swc-hint-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-2, #6e7681);
}
.swc-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.swc-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-2, #21262d);
  border: 1px solid var(--border-1, #30363d);
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
  padding: 6px 12px;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 12px;
  color: var(--text-1, #8b949e);
}
.swc-editor-title { font-weight: 600; }
.swc-brace-counter {
  font-variant-numeric: tabular-nums;
  color: var(--accent-cyan, #79c0ff);
}
.swc-brace-counter--bad { color: var(--state-err, #f85149); }
.swc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
.swc-btn {
  font: inherit;
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #21262d);
  color: var(--text-0, #e6edf3);
  cursor: pointer;
  transition: background 100ms ease-out, border-color 100ms ease-out;
}
.swc-btn:hover:not(:disabled) { background: var(--bg-3, #2d333b); }
.swc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.swc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.swc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
}
.swc-btn--primary:hover:not(:disabled) {
  background: #9dccff;
  border-color: #9dccff;
}
.swc-btn--secondary { background: var(--bg-2, #21262d); }

.swc-grade { display: flex; flex-direction: column; gap: 12px; }
.swc-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.swc-banner--pass {
  border-color: var(--state-ok, #56d364);
  background: rgba(86, 211, 100, 0.08);
}
.swc-banner--fail {
  border-color: var(--state-err, #f85149);
  background: rgba(248, 81, 73, 0.08);
}
.swc-banner strong { font-size: 16px; }
.swc-banner--pass strong { color: var(--state-ok, #56d364); }
.swc-banner--fail strong { color: var(--state-err, #f85149); }
.swc-score {
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  color: var(--text-2, #6e7681);
  font-variant-numeric: tabular-nums;
}
.swc-headline { color: var(--text-1, #8b949e); font-size: 14px; }

.swc-errors {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.swc-error-row { display: inline-flex; align-items: center; gap: 10px; }
.swc-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  background: var(--bg-2, #21262d);
  color: var(--text-1, #8b949e);
}
.swc-tag--brace-imbalance,
.swc-tag--paren-imbalance,
.swc-tag--bracket-imbalance,
.swc-tag--missing-semicolon,
.swc-tag--forbidden-token,
.swc-tag--missing-keycheck,
.swc-tag--empty {
  background: rgba(248, 81, 73, 0.15);
  color: var(--state-err, #f85149);
}
.swc-tag--char-mismatch {
  background: rgba(255, 166, 87, 0.15);
  color: var(--accent-org, #ffa657);
}
.swc-error-msg { color: var(--text-0, #e6edf3); }
.swc-line {
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 11px;
  color: var(--text-2, #6e7681);
}

.swc-diff {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  overflow: hidden;
}
.swc-diff thead {
  background: var(--bg-2, #21262d);
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-2, #6e7681);
}
.swc-diff th,
.swc-diff td {
  padding: 6px 10px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.swc-diff th:first-child,
.swc-diff td:first-child { width: 28px; text-align: right; color: var(--text-2, #6e7681); }
.swc-diff th:last-child,
.swc-diff td:last-child { width: 28px; text-align: center; }
.swc-diff td code { white-space: pre; }
.swc-diff-row--ok td:last-child { color: var(--state-ok, #56d364); }
.swc-diff-row--bad td:last-child { color: var(--state-err, #f85149); }
.swc-diff-row--bad { background: rgba(248, 81, 73, 0.04); }

.swc-explain {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 8px 12px;
}
.swc-explain summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-0, #e6edf3);
}
.swc-explain p {
  margin: 8px 0 0;
  color: var(--text-1, #8b949e);
  line-height: 1.55;
}
`;function G(t){return t.split(`
`).map(n=>n.replace(/[ \t]+$/g,"").replace(/[ \t]+/g," ")).join(`
`).trim()}const pt=["void","&","[]","int"];function ft(t,n){const r=G(t),a=G(n),s=pt.map(p=>({token:p,ok:r.includes(p)})),i=r===a,c=s.every(p=>p.ok),l=i&&c;let d="";i?d=`= ${r}`:d=`- ${a}
+ ${r}`;const h=s.find(p=>!p.ok);let u="Signature matches the canonical form.";return l||(h?u=ut(h.token):u="Signature has all the required tokens but does not match the canonical form character-for-character (after whitespace normalization). Compare the diff above."),{ok:l,tokenChecks:s,diff:d,explanation:u}}function ut(t){switch(t){case"void":return"Q3's read function must return `void` — it fills the array via reference instead of returning anything.";case"&":return"The array parameter must be passed BY REFERENCE (`&`) — without it, the function writes into a copy and the caller's array stays empty.";case"[]":return"The parameter is an array — declare it with `[]` after the name (e.g. `Computer &list[]`).";case"int":return"You also need an `int n` parameter so the function knows how many records to read.";default:return`Missing required token: ${t}`}}function xt(t,n,r){const a=G(t),s=n.map(u=>({needle:u,ok:a.includes(G(u))})),i=r.filter(u=>new RegExp(`\\b${mt(u)}\\b`).test(a)),c=s.every(u=>u.ok),l=i.length===0,d=c&&l;let h="Body covers every required pattern.";return d||(c?i.length>0&&(h=`Body contains forbidden token(s): ${i.map(u=>"`"+u+"`").join(", ")}. Q3 read functions only use cin (no cout, no return value).`):h=`Body is missing the pattern \`${s.find(p=>!p.ok).needle}\` — Q3 always reads each field with \`cin >>\` inside a counted \`for\` loop.`),{ok:d,keyCheckResults:s,forbiddenHits:i,explanation:h}}function mt(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function bt(t){const n=t.replace(/\r\n/g,`
`).split(`
`),r=n[0]??"",a=n.findIndex((c,l)=>l>0&&c.trim()==="{");let s=-1;for(let c=n.length-1;c>=0;c--)if(n[c].trim()==="}"){s=c;break}if(a===-1||s===-1||s<=a)return{signature:r,openBrace:"{",body:"",closeBrace:"}"};const i=n.slice(a+1,s);return{signature:r,openBrace:n[a]??"{",body:i.join(`
`),closeBrace:n[s]??"}"}}function ht(t){let n=0,r=0;for(const a of t)a==="{"?n++:a==="}"&&r++;return{open:n,close:r,balanced:n===r}}function Bt({card:t,onComplete:n,structContext:r}){const a=o.useMemo(()=>bt(t.canonicalAnswer),[t]),s=o.useMemo(()=>[a.signature,a.openBrace,"    ",a.closeBrace,""].join(`
`),[a]),[i,c]=o.useState(s);o.useEffect(()=>c(s),[s]);const[l,d]=o.useState(null),h=o.useRef(null),u=o.useRef(null),p=o.useCallback(b=>{const m=b.replace(/\r\n/g,`
`).split(`
`);let g=m.findIndex(j=>j.trim()===a.signature.trim());g===-1&&(g=0);let y=-1;for(let j=g;j<m.length;j++)if(m[j].trim()==="{"){y=j;break}let w=-1;for(let j=m.length-1;j>=0;j--)if(m[j].trim()==="}"){w=j;break}return y===-1||w===-1||w<=y?b:m.slice(y+1,w).join(`
`)},[a]),x=o.useCallback(b=>b.replace(/\r\n/g,`
`).split(`
`).find(y=>y.trim()!=="")??"",[]),f=o.useCallback(()=>{const b=x(i),m=p(i),g=ft(b,a.signature),y=xt(m,t.keyChecks,t.forbiddenTokens),w=g.ok&&y.ok;d({sig:g,body:y,overall:w}),n(w)},[i,p,x,a.signature,t.keyChecks,t.forbiddenTokens,n]);o.useEffect(()=>{const b=m=>{(m.ctrlKey||m.metaKey)&&m.key==="Enter"&&(m.preventDefault(),f())};return window.addEventListener("keydown",b),()=>window.removeEventListener("keydown",b)},[f]);const v=o.useMemo(()=>ht(i),[i]);return e.jsxs("div",{className:"fwc-root",children:[e.jsx("style",{children:gt}),e.jsxs("div",{className:"fwc-grid",children:[e.jsxs("section",{className:"fwc-left",role:"region","aria-label":"Question 3 specification",children:[e.jsxs("div",{className:"fwc-spec",role:"region","aria-label":"English specification and struct context",tabIndex:0,children:[e.jsx("h2",{className:"fwc-h",children:"Q3 — Read array of structs"}),e.jsx("p",{className:"fwc-prompt",children:t.prompt}),r?e.jsxs(e.Fragment,{children:[e.jsx("h3",{className:"fwc-h-sub",children:"Given struct"}),e.jsx("pre",{className:"fwc-readonly",children:r})]}):null]}),e.jsxs("div",{className:"fwc-sig-given",role:"region","aria-label":"Function signature given to the student",tabIndex:0,children:[e.jsx("h3",{className:"fwc-h-sub",children:"Function signature (given)"}),e.jsx("pre",{className:"fwc-readonly fwc-sig-line",children:a.signature}),e.jsx("p",{className:"fwc-hint",children:"Fill in the body of this function. The signature is fixed — copy it exactly into the editor."})]})]}),e.jsxs("section",{className:"fwc-right",role:"region","aria-label":"Code editor — write the function body",children:[e.jsx("div",{className:"fwc-editor-wrap",children:e.jsx(q,{ref:h,value:i,onChange:c,language:"cpp",ariaLabel:"C++ function body editor — type the for-loop and cin reads here",showBraceMatch:!0,lineNumbers:!0})}),e.jsxs("div",{className:"fwc-toolbar",role:"group","aria-label":"Editor toolbar",children:[e.jsxs("span",{className:`fwc-brace ${v.balanced?"ok":"bad"}`,"aria-label":`Brace counter: ${v.open} open, ${v.close} close, ${v.balanced?"balanced":"unbalanced"}`,children:["{ ",v.open," / ",v.close," }",v.balanced?"  ok":"  unbalanced"]}),e.jsx("button",{ref:u,type:"button",className:"fwc-submit",onClick:f,"aria-label":"Submit function (Ctrl+Enter)",children:"Submit (Ctrl+Enter)"})]})]})]}),l?e.jsxs("div",{className:`fwc-feedback ${l.overall?"ok":"bad"}`,role:"status","aria-live":"polite",children:[e.jsx("h3",{className:"fwc-h-sub",children:l.overall?"Pass":"Needs fixing"}),e.jsxs("div",{className:"fwc-fb-section",children:[e.jsx("strong",{children:"Signature:"})," ",l.sig.ok?"matches canonical.":"mismatch.",e.jsx("ul",{className:"fwc-token-list","aria-label":"Required signature tokens",children:l.sig.tokenChecks.map(b=>e.jsxs("li",{className:b.ok?"ok":"bad",children:[e.jsx("code",{children:b.token})," ",e.jsx("span",{className:"fwc-mark",children:b.ok?"ok":"missing"})]},b.token))}),l.sig.ok?null:e.jsx("pre",{className:"fwc-diff",children:l.sig.diff}),e.jsx("p",{className:"fwc-explain",children:l.sig.explanation})]}),e.jsxs("div",{className:"fwc-fb-section",children:[e.jsx("strong",{children:"Body:"})," ",l.body.ok?"all key patterns present.":"missing patterns.",e.jsx("ul",{className:"fwc-token-list","aria-label":"Required body patterns",children:l.body.keyCheckResults.map(b=>e.jsxs("li",{className:b.ok?"ok":"bad",children:[e.jsx("code",{children:b.needle})," ",e.jsx("span",{className:"fwc-mark",children:b.ok?"ok":"missing"})]},b.needle))}),l.body.forbiddenHits.length>0?e.jsxs("p",{className:"fwc-forbidden",children:["Forbidden token(s) found:"," ",l.body.forbiddenHits.map(b=>e.jsx("code",{children:b},b))]}):null,e.jsx("p",{className:"fwc-explain",children:l.body.explanation})]}),e.jsxs("details",{className:"fwc-canon",children:[e.jsx("summary",{children:"Show canonical answer"}),e.jsx("pre",{className:"fwc-readonly",children:t.canonicalAnswer}),e.jsx("p",{className:"fwc-explain",children:t.explanation})]})]}):null]})}const gt=`
.fwc-root {
  font-family: var(--font-sans, system-ui, -apple-system, "Segoe UI", sans-serif);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

/* 40 / 60 split */
.fwc-grid {
  display: grid;
  grid-template-columns: 40fr 60fr;
  gap: 16px;
  min-height: 28rem;
}

/* ── Left pane ─────────────────────────────────────────────────────── */
.fwc-left {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  min-width: 0;
}
.fwc-spec,
.fwc-sig-given {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 16px;
  overflow: auto;
}
.fwc-spec:focus,
.fwc-sig-given:focus {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.fwc-h {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-cyan, #79c0ff);
  margin: 0 0 8px;
}
.fwc-h-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-1, #8b949e);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 12px 0 6px;
}
.fwc-prompt {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-0, #e6edf3);
  white-space: pre-wrap;
}
.fwc-readonly {
  margin: 0;
  padding: 8px 12px;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--text-0, #e6edf3);
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  line-height: 1.55;
  overflow: auto;
  white-space: pre;
}
.fwc-sig-line {
  color: var(--accent-grn, #7ee787);
}
.fwc-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-2, #6e7681);
  line-height: 1.4;
}

/* ── Right pane ────────────────────────────────────────────────────── */
.fwc-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.fwc-editor-wrap {
  flex: 1;
  min-height: 22rem;
  display: flex;
}
.fwc-editor-wrap > * {
  flex: 1;
  min-height: 0;
}
.fwc-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
}
.fwc-brace {
  color: var(--text-1, #8b949e);
}
.fwc-brace.ok {
  color: var(--accent-grn, #7ee787);
}
.fwc-brace.bad {
  color: var(--state-err, #f85149);
}
.fwc-submit {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border: 0;
  border-radius: 4px;
  padding: 8px 14px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.fwc-submit:focus {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.fwc-submit:hover {
  filter: brightness(1.1);
}

/* ── Feedback row ──────────────────────────────────────────────────── */
.fwc-feedback {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 16px;
}
.fwc-feedback.ok {
  border-color: var(--accent-grn, #7ee787);
}
.fwc-feedback.bad {
  border-color: var(--state-err, #f85149);
}
.fwc-fb-section {
  margin: 8px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-1, #30363d);
}
.fwc-fb-section:last-of-type {
  border-bottom: 0;
}
.fwc-token-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
}
.fwc-token-list li.ok { color: var(--accent-grn, #7ee787); }
.fwc-token-list li.bad { color: var(--state-err, #f85149); }
.fwc-token-list .fwc-mark {
  font-style: italic;
  font-size: 11px;
  margin-left: 4px;
}
.fwc-diff {
  margin: 6px 0;
  padding: 8px 12px;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  white-space: pre;
  color: var(--text-0, #e6edf3);
}
.fwc-explain {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-1, #8b949e);
}
.fwc-forbidden {
  color: var(--state-err, #f85149);
  font-size: 13px;
  margin: 6px 0 0;
}
.fwc-forbidden code {
  margin: 0 4px;
  padding: 1px 4px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
}
.fwc-canon {
  margin-top: 12px;
}
.fwc-canon summary {
  cursor: pointer;
  font-size: 12px;
  color: var(--text-1, #8b949e);
  user-select: none;
}
.fwc-canon[open] summary {
  color: var(--accent-cyan, #79c0ff);
}

@media (max-width: 768px) {
  .fwc-grid {
    grid-template-columns: 1fr;
  }
}
`;function Y(t){let n=t.toLowerCase();return n=n.replace(/\t/g,"    ").replace(/\s+/g," "),n=n.replace(/\s*(>>|<<|>=|<=|!=|==|\+=|-=|\*=|\/=|%=|&&|\|\|)\s*/g,"$1"),n=n.replace(/\s*([=<>+\-*/%&|!])\s*/g,"$1"),n.trim()}function vt(t,n){const r=n.extractor?t.match(n.extractor)?.[0]??"":t,a=Y(r),s=[];for(const c of n.mustInclude)a.includes(Y(c))||s.push(c);const i=[];for(const c of n.mustNotInclude??[])a.includes(Y(c))&&i.push(c);return{id:n.id,label:n.label,pass:s.length===0&&i.length===0,missing:s,forbiddenHit:i}}function wt(t,n){const r=Y(t),a=[];for(const s of n)r.includes(Y(s))||a.push(s);return{pass:a.length===0,missing:a}}function Ft({card:t,extras:n,onComplete:r}){const a=n?.scaffold??"",[s,i]=o.useState(a),[c,l]=o.useState(!1),[d,h]=o.useState(null),u=t.id;o.useEffect(()=>{i(n?.scaffold??""),l(!1),h(null)},[u,n?.scaffold]);const p=o.useRef(null),x=o.useCallback(()=>{const b=P(s,{canonicalAnswer:t.canonicalAnswer,keyChecks:t.keyChecks,forbiddenTokens:t.forbiddenTokens,requireSemicolon:!0}),m=(n?.sections??[]).map(j=>vt(s,j)),g=wt(s,n?.structuralRequired??[]);h({overall:b,sections:m,structural:g}),l(!0);const y=m.every(j=>j.pass),w=b.pass&&y&&g.pass;r(w)},[s,t.canonicalAnswer,t.keyChecks,t.forbiddenTokens,n?.sections,n?.structuralRequired,r]),f=o.useCallback(()=>{i(n?.scaffold??""),l(!1),h(null)},[n?.scaffold]),v=o.useMemo(()=>{if(!d)return"";const b=[];b.push(d.overall.pass&&d.sections.every(m=>m.pass)&&d.structural.pass?"All sections passed.":`${d.sections.filter(m=>!m.pass).length+(d.structural.pass?0:1)} section${d.sections.filter(m=>!m.pass).length+(d.structural.pass?0:1)===1?"":"s"} failed.`);for(const m of d.sections)b.push(`${m.label}: ${m.pass?"pass":"fail"}.`);return n?.structuralRequired?.length&&b.push(`Structure: ${d.structural.pass?"pass":"fail"}.`),b.join(" ")},[d,n?.structuralRequired]);return e.jsxs("div",{className:"mwc-root",role:"group","aria-label":"Main-function writing exercise",children:[e.jsx("style",{children:yt}),e.jsxs("aside",{className:"mwc-left","aria-label":"Exercise specification and prior context",children:[e.jsx("h2",{className:"mwc-title",children:"Q4 — Write `int main()`"}),e.jsxs("section",{className:"mwc-spec","aria-label":"English specification",children:[e.jsx("h3",{className:"mwc-h3",children:"What to write"}),e.jsx("p",{className:"mwc-prompt",children:t.prompt})]}),n?.contextStruct&&e.jsxs("section",{className:"mwc-context","aria-label":"Previously-defined struct (read-only)",children:[e.jsx("h3",{className:"mwc-h3",children:"Struct (already defined)"}),e.jsx("pre",{className:"mwc-context-code",children:e.jsx("code",{children:n.contextStruct})})]}),n?.contextReadFn&&e.jsxs("section",{className:"mwc-context","aria-label":"Previously-defined read function (read-only)",children:[e.jsx("h3",{className:"mwc-h3",children:"Read function (already defined)"}),e.jsx("pre",{className:"mwc-context-code",children:e.jsx("code",{children:n.contextReadFn})})]})]}),e.jsxs("main",{className:"mwc-right","aria-label":"Main-function editor",children:[e.jsx("div",{className:"mwc-editor-shell",children:e.jsx(q,{value:s,onChange:i,language:"cpp",ariaLabel:"Write your int main() function here",placeholder:"// Write int main() { … } below",lineNumbers:!0,showBraceMatch:!0})}),e.jsx("div",{className:"mwc-actions",children:c?e.jsx("button",{type:"button",className:"mwc-btn mwc-btn-secondary",onClick:f,"aria-label":"Reset and try again",children:"Try again"}):e.jsx("button",{type:"button",className:"mwc-btn mwc-btn-primary",onClick:x,"aria-label":"Submit your main() for grading",children:"Submit (Ctrl+Enter)"})}),e.jsx("div",{ref:p,className:"mwc-sr-only","aria-live":"polite","aria-atomic":"true",children:v}),c&&d&&e.jsxs("section",{className:"mwc-feedback","aria-label":"Sectional grading feedback",children:[e.jsx("h3",{className:"mwc-h3",children:d.overall.pass&&d.sections.every(b=>b.pass)&&d.structural.pass?"All sections passed":"Some sections failed"}),e.jsxs("ul",{className:"mwc-section-list",children:[d.sections.map(b=>e.jsxs("li",{className:`mwc-section-row ${b.pass?"pass":"fail"}`,"aria-label":`${b.label}: ${b.pass?"pass":"fail"}`,children:[e.jsx("span",{className:"mwc-section-icon","aria-hidden":"true",children:b.pass?"[OK]":"[X]"}),e.jsx("span",{className:"mwc-section-label",children:b.label}),!b.pass&&b.missing.length>0&&e.jsxs("span",{className:"mwc-section-missing",children:["missing: ",b.missing.map(m=>`\`${m}\``).join(", ")]}),!b.pass&&b.forbiddenHit.length>0&&e.jsxs("span",{className:"mwc-section-forbidden",children:["forbidden: ",b.forbiddenHit.map(m=>`\`${m}\``).join(", ")]})]},b.id)),n?.structuralRequired&&n.structuralRequired.length>0&&e.jsxs("li",{className:`mwc-section-row ${d.structural.pass?"pass":"fail"}`,"aria-label":`Top-level structure: ${d.structural.pass?"pass":"fail"}`,children:[e.jsx("span",{className:"mwc-section-icon","aria-hidden":"true",children:d.structural.pass?"[OK]":"[X]"}),e.jsx("span",{className:"mwc-section-label",children:"Top-level structure"}),!d.structural.pass&&e.jsxs("span",{className:"mwc-section-missing",children:["missing:"," ",d.structural.missing.map(b=>`\`${b}\``).join(", ")]})]})]}),d.overall.errors.length>0&&e.jsxs("details",{className:"mwc-overall-errors",children:[e.jsxs("summary",{children:["Other findings (",d.overall.errors.length,")"]}),e.jsx("ul",{children:d.overall.errors.map((b,m)=>e.jsxs("li",{children:[e.jsx("strong",{children:b.kind}),": ",b.message]},m))})]}),e.jsxs("details",{className:"mwc-explanation",open:!0,children:[e.jsx("summary",{children:"Explanation"}),e.jsx("p",{children:t.explanation})]})]})]})]})}const yt=`
.mwc-root {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: 16px;
  padding: 16px;
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  font-family: var(--font-sans, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
  min-height: 100%;
}
@media (max-width: 900px) {
  .mwc-root { grid-template-columns: 1fr; }
}

.mwc-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text-0, #e6edf3);
}
.mwc-h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
  color: var(--text-1, #8b949e);
}

.mwc-left {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mwc-spec .mwc-prompt {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-0, #e6edf3);
}
.mwc-context-code {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 10px 12px;
  font-family: var(--font-mono, "JetBrains Mono", "Fira Code", ui-monospace, Consolas, monospace);
  font-size: 12.5px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  margin: 0;
  color: var(--text-0, #e6edf3);
}

.mwc-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.mwc-editor-shell {
  flex: 1 1 auto;
  min-height: 320px;
  display: flex;
}
.mwc-editor-shell > * { flex: 1 1 auto; }

.mwc-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.mwc-btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 100ms ease-out, border-color 100ms ease-out;
}
.mwc-btn-primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
}
.mwc-btn-primary:hover { filter: brightness(1.08); }
.mwc-btn-primary:focus-visible {
  outline: 2px solid var(--state-info, #58a6ff);
  outline-offset: 2px;
}
.mwc-btn-secondary {
  background: var(--bg-2, #1f2937);
  color: var(--text-0, #e6edf3);
  border-color: var(--border-2, #484f58);
}
.mwc-btn-secondary:hover { background: var(--bg-3, #2d333b); }

.mwc-feedback {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mwc-section-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mwc-section-row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 3px solid transparent;
  font-size: 13.5px;
  background: var(--bg-2, #1f2937);
}
.mwc-section-row.pass {
  border-left-color: var(--state-ok, #3fb950);
}
.mwc-section-row.fail {
  border-left-color: var(--state-err, #f85149);
}
.mwc-section-icon {
  font-family: var(--font-mono, monospace);
  color: var(--text-1, #8b949e);
}
.mwc-section-row.pass .mwc-section-icon { color: var(--state-ok, #3fb950); }
.mwc-section-row.fail .mwc-section-icon { color: var(--state-err, #f85149); }
.mwc-section-label {
  font-weight: 500;
  color: var(--text-0, #e6edf3);
}
.mwc-section-missing,
.mwc-section-forbidden {
  display: block;
  grid-column: 2 / 3;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--text-2, #6e7681);
  margin-top: 2px;
}
.mwc-section-row.fail .mwc-section-missing { color: var(--state-err, #f85149); }
.mwc-section-row.fail .mwc-section-forbidden { color: var(--state-warn, #d29922); }

.mwc-overall-errors,
.mwc-explanation {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
}
.mwc-overall-errors summary,
.mwc-explanation summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--text-0, #e6edf3);
}
.mwc-overall-errors ul {
  margin: 8px 0 0;
  padding-left: 18px;
}
.mwc-explanation p {
  margin: 8px 0 0;
  line-height: 1.6;
}

/* Visually-hidden but screen-reader-available */
.mwc-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;function kt(t){const n=[],r=/_{3,}/g;let a=0,s=0,i;for(;(i=r.exec(t))!==null;)i.index>a&&n.push({kind:"text",value:t.slice(a,i.index)}),n.push({kind:"blank",value:"",blankIdx:s++}),a=i.index+i[0].length;return a<t.length&&n.push({kind:"text",value:t.slice(a)}),s===0&&(n.push({kind:"text",value:`
`}),n.push({kind:"blank",value:"",blankIdx:0})),n}function Yt({card:t,onComplete:n}){const r=o.useMemo(()=>kt(t.code),[t.code]),a=r.filter(f=>f.kind==="blank").length,[s,i]=o.useState(()=>new Array(a).fill("")),[c,l]=o.useState(null),d=o.useRef(null);o.useEffect(()=>{i(new Array(a).fill("")),l(null),requestAnimationFrame(()=>d.current?.focus())},[t.id,a]);const h=o.useCallback((f,v)=>{i(b=>{const m=b.slice();return m[f]=v,m})},[]),u=o.useCallback(()=>{const f=r.map(w=>w.kind==="blank"?s[w.blankIdx]??"":w.value).join(""),v=R(f),b=R(t.code.replace(/_{3,}/g,t.answer)),m=R(s.join(" ")),g=R(t.answer),y=v===b||m===g||v.includes(g);l({pass:y,reason:y?"Matches the canonical answer.":`Expected: ${t.answer}`}),n(y)},[r,s,t.code,t.answer,n]),p=o.useCallback(()=>{i(new Array(a).fill("")),l(null),requestAnimationFrame(()=>d.current?.focus())},[a]),x=o.useCallback(f=>{f.key==="Enter"?(f.preventDefault(),u()):f.key==="Escape"&&c&&(f.preventDefault(),p())},[u,p,c]);return e.jsxs("section",{className:"cz-root",role:"application","aria-label":`Cloze exercise — atom ${t.atomId}`,children:[e.jsx("style",{children:jt}),e.jsxs("header",{className:"cz-header",children:[e.jsx("h2",{className:"cz-stem",children:t.stem}),e.jsxs("div",{className:"cz-meta",children:[e.jsx("span",{className:"cz-atom",children:t.atomId}),e.jsx("span",{className:"cz-q",children:t.qTags.join(" · ")})]})]}),e.jsx("p",{className:"cz-sentence","aria-label":"cloze sentence",children:t.clozeSentence}),e.jsx("pre",{className:"cz-code","aria-label":"code with blanks",children:r.map((f,v)=>f.kind==="text"?e.jsx("span",{className:"cz-text",children:f.value},v):e.jsx("input",{ref:f.blankIdx===0?d:null,type:"text",className:`cz-blank ${c?c.pass?"is-ok":"is-bad":""}`,"aria-label":`blank ${(f.blankIdx??0)+1} of ${a}`,value:s[f.blankIdx]??"",onChange:b=>h(f.blankIdx,b.target.value),onKeyDown:x,autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",spellCheck:!1,size:Math.max(8,(s[f.blankIdx]??"").length+2)},v))}),e.jsxs("div",{className:"cz-actions",children:[e.jsx("button",{type:"button",className:"cz-btn cz-btn--primary",onClick:u,disabled:c?.pass===!0,"aria-label":"submit cloze (Enter)",children:c?.pass?"Passed":"Submit (Enter)"}),c&&!c.pass&&e.jsx("button",{type:"button",className:"cz-btn",onClick:p,"aria-label":"reset blanks and try again",children:"Try again (Esc)"})]}),c&&e.jsxs("div",{className:`cz-feedback ${c.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[e.jsx("strong",{children:c.pass?"✓ pass":"✗ not yet"})," ",e.jsx("span",{children:c.reason}),!c.pass&&e.jsxs("details",{className:"cz-explain",children:[e.jsx("summary",{children:"show explanation"}),e.jsx("p",{children:t.explanation})]})]})]})}const jt=`
.cz-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 920px;
  margin: 0 auto;
}
.cz-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.cz-stem { margin: 0; font-size: 14px; line-height: 1.5; flex: 1; }
.cz-meta { display: flex; gap: 8px; font-size: 11px; }
.cz-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.cz-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.cz-sentence {
  margin: 0;
  padding: 8px 12px;
  background: var(--bg-1, #161b22);
  border-left: 3px solid var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-1, #8b949e);
}
.cz-code {
  margin: 0;
  padding: 12px 14px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-x: auto;
}
.cz-text { white-space: pre-wrap; }
.cz-blank {
  background: var(--bg-2, #1f2937);
  border: 0;
  border-bottom: 2px solid var(--accent-cyan, #79c0ff);
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: inherit;
  padding: 1px 4px;
  margin: 0 2px;
  outline: 0;
  min-width: 64px;
}
.cz-blank:focus-visible {
  background: var(--bg-3, #2d333b);
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.cz-blank.is-ok { border-bottom-color: var(--accent-grn, #7ee787); }
.cz-blank.is-bad { border-bottom-color: var(--state-err, #f85149); }
.cz-actions { display: flex; gap: 8px; justify-content: flex-end; }
.cz-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.cz-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.cz-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.cz-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cz-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
  border-color: var(--accent-cyan, #79c0ff);
}
.cz-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.cz-feedback.is-ok {
  border-color: var(--accent-grn, #7ee787);
  color: var(--accent-grn, #7ee787);
}
.cz-feedback.is-bad {
  border-color: var(--state-err, #f85149);
  color: var(--state-err, #f85149);
}
.cz-explain { margin-top: 8px; font-size: 12px; color: var(--text-1, #8b949e); }
.cz-explain summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
`;function Ht({card:t,onComplete:n}){const r=t.steps.length,[a,s]=o.useState(0),i=o.useMemo(()=>t.fullCode.split(`
`),[t.fullCode]),c=a>0?t.steps[a-1]?.line??null:null;o.useEffect(()=>{s(0)},[t.id]);const l=o.useCallback(()=>{s(u=>{const p=Math.min(r,u+1);return p===r&&n(!0),p})},[r,n]),d=o.useCallback(()=>{s(u=>Math.max(0,u-1))},[]),h=o.useCallback(()=>{s(r),n(!0)},[r,n]);return o.useEffect(()=>{const u=p=>{p.target instanceof HTMLElement&&(p.target.tagName==="INPUT"||p.target.tagName==="TEXTAREA")||(p.key===" "||p.key==="ArrowRight"||p.key==="Enter"?(p.preventDefault(),l()):p.key==="Backspace"||p.key==="ArrowLeft"?(p.preventDefault(),d()):(p.key==="End"||(p.ctrlKey||p.metaKey)&&p.key==="Enter")&&(p.preventDefault(),h()))};return window.addEventListener("keydown",u),()=>window.removeEventListener("keydown",u)},[l,d,h]),e.jsxs("section",{className:"wt-root",role:"application","aria-label":`Walkthrough — ${t.levelLabel}`,children:[e.jsx("style",{children:Nt}),e.jsxs("header",{className:"wt-header",children:[e.jsxs("div",{children:[e.jsx("span",{className:"wt-level",children:t.levelLabel}),e.jsx("h2",{className:"wt-stem",children:t.stem})]}),e.jsxs("div",{className:"wt-progress","aria-label":`step ${a} of ${r}`,children:[a," / ",r]})]}),e.jsxs("div",{className:"wt-grid",children:[e.jsx("pre",{className:"wt-code","aria-label":"walk-through code panel",tabIndex:0,children:i.map((u,p)=>{const x=p+1,f=x===c;return e.jsxs("span",{className:`wt-line ${f?"is-active":""}`,"aria-current":f?"step":void 0,children:[e.jsx("span",{className:"wt-lineno","aria-hidden":"true",children:String(x).padStart(2," ")}),e.jsx("span",{className:"wt-linecode",children:u||" "}),`
`]},p)})}),e.jsxs("ol",{className:"wt-steps","aria-live":"polite",children:[t.steps.slice(0,a).map((u,p)=>e.jsxs("li",{className:"wt-step",children:[e.jsxs("div",{className:"wt-step-head",children:[e.jsxs("span",{className:"wt-step-num",children:["step ",p+1]}),e.jsxs("span",{className:"wt-step-line",children:["line ",u.line]}),u.atomIds.length>0&&e.jsx("span",{className:"wt-step-atoms","aria-label":"atoms touched",children:u.atomIds.map(x=>e.jsx("code",{className:"wt-atom-tag",children:x},x))})]}),e.jsx("pre",{className:"wt-step-code",children:u.code}),e.jsx("p",{className:"wt-step-note",children:u.annotation})]},p)),a<r&&e.jsx("li",{className:"wt-step wt-step--ghost","aria-label":"next step",children:e.jsxs("span",{className:"wt-step-prompt",children:["press ",e.jsx("kbd",{children:"Space"})," to reveal the next step"]})})]})]}),e.jsxs("footer",{className:"wt-footer",children:[e.jsx("button",{type:"button",className:"wt-btn",onClick:d,disabled:a===0,"aria-label":"step back (Backspace)",children:"← back"}),e.jsx("button",{type:"button",className:"wt-btn wt-btn--primary",onClick:l,disabled:a===r,"aria-label":"reveal next step (Space)",children:a===r?"done":"reveal next (Space)"}),e.jsx("button",{type:"button",className:"wt-btn",onClick:h,disabled:a===r,"aria-label":"reveal all (End)",children:"reveal all"})]})]})}const Nt=`
.wt-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto;
}
.wt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.wt-level {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-org, #ffa657);
  margin-bottom: 4px;
}
.wt-stem { margin: 0; font-size: 15px; line-height: 1.4; }
.wt-progress {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--text-2, #6e7681);
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 4px 10px;
  border-radius: 3px;
  align-self: center;
}
.wt-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 380px;
}
.wt-code {
  margin: 0;
  padding: 10px 0;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
  color: var(--text-0, #e6edf3);
}
.wt-code:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: -2px; }
.wt-line { display: inline; }
.wt-line.is-active { background: rgba(121,192,255,0.12); }
.wt-line.is-active .wt-linecode { color: var(--accent-cyan, #79c0ff); font-weight: 600; }
.wt-lineno {
  display: inline-block;
  width: 32px;
  padding: 0 8px;
  text-align: right;
  color: var(--text-2, #6e7681);
  user-select: none;
}
.wt-linecode { padding-right: 8px; }
.wt-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 480px;
}
.wt-step {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wt-step--ghost {
  border-style: dashed;
  background: transparent;
  color: var(--text-2, #6e7681);
  text-align: center;
  font-size: 12px;
  align-items: center;
}
.wt-step-prompt kbd {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 1px 6px;
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  color: var(--accent-cyan, #79c0ff);
}
.wt-step-head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 11px; }
.wt-step-num { color: var(--accent-cyan, #79c0ff); font-weight: 600; }
.wt-step-line { color: var(--text-2, #6e7681); }
.wt-step-atoms { display: inline-flex; gap: 4px; }
.wt-atom-tag {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 2px;
  padding: 1px 5px;
  font-size: 10px;
  color: var(--accent-yel, #d2a8ff);
}
.wt-step-code {
  margin: 0;
  padding: 6px 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--accent-grn, #7ee787);
  white-space: pre-wrap;
  overflow-x: auto;
}
.wt-step-note { margin: 0; font-size: 12px; line-height: 1.5; color: var(--text-1, #8b949e); }
.wt-footer { display: flex; justify-content: flex-end; gap: 8px; }
.wt-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.wt-btn:hover:not(:disabled) { border-color: var(--accent-cyan, #79c0ff); color: var(--accent-cyan, #79c0ff); }
.wt-btn:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.wt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.wt-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
@media (max-width: 768px) {
  .wt-grid { grid-template-columns: 1fr; }
}
`;function Ct(t,n){if(n.length===0)return t;const r=[...n].filter(c=>c.length>0).sort((c,l)=>l.length-c.length);if(r.length===0)return t;const a=r.map(c=>c.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),s=new RegExp(`(${a.join("|")})`,"g");return t.split(s).map((c,l)=>r.includes(c)?e.jsx("mark",{className:"dc-hl",children:c},l):e.jsx("span",{children:c},l))}function Wt({card:t,onComplete:n}){const[r,a]=o.useState(!1),s=o.useMemo(()=>Ct(t.demoCode,t.highlightTokens),[t.demoCode,t.highlightTokens]);o.useEffect(()=>{a(!1)},[t.id]);const i=o.useCallback(()=>{r||(a(!0),n(!0))},[r,n]);return o.useEffect(()=>{const c=l=>{l.target instanceof HTMLElement&&l.target.tagName==="INPUT"||(l.key===" "||l.key==="Enter")&&(l.preventDefault(),i())};return window.addEventListener("keydown",c),()=>window.removeEventListener("keydown",c)},[i]),e.jsxs("section",{className:"dc-root",role:"application","aria-label":`Demo example — atom ${t.atomId}`,children:[e.jsx("style",{children:St}),e.jsxs("header",{className:"dc-header",children:[e.jsx("h2",{className:"dc-stem",children:t.stem}),e.jsxs("div",{className:"dc-meta",children:[e.jsx("span",{className:"dc-atom",children:t.atomId}),e.jsx("span",{className:"dc-q",children:t.qTags.join(" · ")})]})]}),e.jsxs("p",{className:"dc-why","aria-label":"why this matters",children:[e.jsx("span",{className:"dc-why-eyebrow",children:"why"}),e.jsx("span",{className:"dc-why-text",children:t.whyOneLine})]}),e.jsx("pre",{className:"dc-code","aria-label":"demo code (read-only)",tabIndex:0,children:s}),t.usedIn.length>0&&e.jsxs("div",{className:"dc-used","aria-label":"used in",children:[e.jsx("span",{className:"dc-used-eyebrow",children:"used in"}),t.usedIn.map(c=>e.jsx("span",{className:"dc-used-tag",children:c},c))]}),e.jsx("footer",{className:"dc-footer",children:e.jsx("button",{type:"button",className:"dc-btn dc-btn--primary",onClick:i,disabled:r,"aria-label":"acknowledge and continue (Space)",children:r?"acknowledged":"got it (Space)"})})]})}const St=`
.dc-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
}
.dc-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.dc-stem { margin: 0; font-size: 14px; line-height: 1.5; flex: 1; }
.dc-meta { display: flex; gap: 8px; font-size: 11px; }
.dc-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.dc-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.dc-why {
  margin: 0;
  padding: 10px 12px;
  background: var(--bg-1, #161b22);
  border-left: 3px solid var(--accent-yel, #d2a8ff);
  border-radius: 3px;
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 13px;
  line-height: 1.5;
}
.dc-why-eyebrow {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--accent-yel, #d2a8ff);
  font-weight: 700;
  flex-shrink: 0;
}
.dc-why-text { color: var(--text-0, #e6edf3); }
.dc-code {
  margin: 0;
  padding: 12px 14px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-x: auto;
  color: var(--text-0, #e6edf3);
}
.dc-code:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.dc-hl {
  background: rgba(210,168,255,0.18);
  color: var(--accent-yel, #d2a8ff);
  padding: 0 2px;
  border-radius: 2px;
}
.dc-used {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11px;
}
.dc-used-eyebrow {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-2, #6e7681);
}
.dc-used-tag {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 8px;
  color: var(--accent-org, #ffa657);
}
.dc-footer { display: flex; justify-content: flex-end; }
.dc-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dc-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.dc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.dc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.dc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
`;function Et(t){return new Set(t.split(/[,\s]+/g).map(n=>n.trim().toUpperCase()).filter(n=>n.length>0))}function zt(t,n){if(t.size!==n.size)return!1;for(const r of t)if(!n.has(r))return!1;return!0}function Ut({card:t,onComplete:n}){const r=o.useMemo(()=>Et(t.correctLabel),[t.correctLabel]),a=r.size>1,[s,i]=o.useState(new Set),[c,l]=o.useState(null);o.useEffect(()=>{i(new Set),l(null)},[t.id]);const d=o.useCallback(p=>{c?.pass||i(x=>{const f=new Set(x),v=p.toUpperCase();return f.has(v)?f.delete(v):(a||f.clear(),f.add(v)),f})},[c,a]),h=o.useCallback(()=>{if(s.size===0)return;const p=zt(s,r);l({pass:p}),n(p)},[s,r,n]),u=o.useCallback(()=>{i(new Set),l(null)},[]);return o.useEffect(()=>{const p=x=>{const f=x.key.toLowerCase();if(f>="1"&&f<="4"){x.preventDefault();const v=t.options[parseInt(f,10)-1];v&&d(v.label)}else f>="a"&&f<="d"?(x.preventDefault(),d(f.toUpperCase())):x.key==="Enter"?(x.preventDefault(),h()):x.key==="Escape"&&c&&!c.pass&&(x.preventDefault(),u())};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)},[d,h,u,t.options,c]),e.jsxs("section",{className:"dec-root",role:"application","aria-label":`Decompose — atom ${t.atomId}`,children:[e.jsx("style",{children:Tt}),e.jsxs("header",{className:"dec-header",children:[e.jsx("h2",{id:"dec-stem",className:"dec-stem",children:t.stem}),e.jsxs("div",{className:"dec-meta",children:[e.jsx("span",{className:"dec-atom",children:t.atomId}),e.jsx("span",{className:"dec-q",children:t.qTags.join(" · ")})]})]}),e.jsx("pre",{className:"dec-code","aria-label":"code under analysis",tabIndex:0,children:t.code}),e.jsx("p",{className:"dec-question",children:t.question}),e.jsx("ul",{role:a?"group":"radiogroup","aria-labelledby":"dec-stem",className:"dec-options",children:t.options.map(p=>{const x=p.label.toUpperCase(),f=s.has(x),v=c&&r.has(x),b=c&&f&&!r.has(x),m=["dec-opt",f?"is-picked":"",v?"is-correct":"",b?"is-wrong":""].filter(Boolean).join(" ");return e.jsx("li",{children:e.jsxs("button",{type:"button",role:a?"checkbox":"radio","aria-checked":f,className:m,onClick:()=>d(p.label),disabled:c?.pass===!0,"aria-label":`option ${p.label}: ${p.text}`,children:[e.jsx("span",{className:"dec-letter","aria-hidden":"true",children:p.label}),e.jsx("span",{className:"dec-text",children:p.text})]})},p.label)})}),e.jsxs("div",{className:"dec-actions",children:[a&&e.jsxs("span",{className:"dec-hint","aria-live":"polite",children:["picked: ",Array.from(s).sort().join(", ")||"(none)"]}),e.jsx("button",{type:"button",className:"dec-btn dec-btn--primary",onClick:h,disabled:s.size===0||c?.pass===!0,"aria-label":"submit (Enter)",children:c?.pass?"Passed":"Submit (Enter)"}),c&&!c.pass&&e.jsx("button",{type:"button",className:"dec-btn",onClick:u,"aria-label":"reset and try again (Esc)",children:"Try again (Esc)"})]}),c&&e.jsxs("div",{className:`dec-feedback ${c.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[e.jsx("strong",{children:c.pass?"✓ correct":"✗ not quite"}),!c.pass&&e.jsxs("span",{children:[" ","— correct ",a?"set":"answer"," was"," ",e.jsx("code",{children:Array.from(r).sort().join(", ")}),"."]}),e.jsxs("details",{className:"dec-explain",children:[e.jsx("summary",{children:"show explanation"}),e.jsx("p",{children:t.explanation})]})]})]})}const Tt=`
.dec-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 860px;
  margin: 0 auto;
}
.dec-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.dec-stem { margin: 0; font-size: 14px; line-height: 1.5; flex: 1; }
.dec-meta { display: flex; gap: 8px; font-size: 11px; }
.dec-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.dec-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.dec-code {
  margin: 0;
  padding: 12px 14px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-x: auto;
  color: var(--text-0, #e6edf3);
}
.dec-code:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: -2px; }
.dec-question {
  margin: 0;
  font-size: 13px;
  color: var(--text-1, #8b949e);
  line-height: 1.5;
}
.dec-options { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.dec-opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 10px 12px;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  line-height: 1.45;
}
.dec-opt:hover:not(:disabled) { border-color: var(--accent-cyan, #79c0ff); }
.dec-opt:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.dec-opt:disabled { cursor: not-allowed; }
.dec-opt.is-picked {
  border-color: var(--accent-cyan, #79c0ff);
  background: rgba(121,192,255,0.08);
}
.dec-opt.is-correct {
  border-color: var(--accent-grn, #7ee787);
  background: rgba(126,231,135,0.08);
  color: var(--accent-grn, #7ee787);
}
.dec-opt.is-wrong {
  border-color: var(--state-err, #f85149);
  background: rgba(248,81,73,0.08);
  color: var(--state-err, #f85149);
}
.dec-letter {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  background: var(--bg-2, #1f2937);
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-cyan, #79c0ff);
  flex-shrink: 0;
  margin-top: 1px;
}
.dec-opt.is-correct .dec-letter { color: var(--accent-grn, #7ee787); }
.dec-opt.is-wrong .dec-letter { color: var(--state-err, #f85149); }
.dec-text { flex: 1; }
.dec-actions { display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.dec-hint {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--text-2, #6e7681);
  margin-right: auto;
}
.dec-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dec-btn:hover:not(:disabled) { border-color: var(--accent-cyan, #79c0ff); color: var(--accent-cyan, #79c0ff); }
.dec-btn:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.dec-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.dec-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.dec-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.dec-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.dec-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.dec-feedback code {
  background: var(--bg-2, #1f2937);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.dec-explain { margin-top: 8px; color: var(--text-1, #8b949e); }
.dec-explain summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.dec-explain p { margin: 6px 0 0; line-height: 1.5; }
`,V=["A","B","C","D"];function $t(t){let n=5381;for(let r=0;r<t.length;r++)n=(n<<5)+n+t.charCodeAt(r)>>>0;return n}function _t(t,n){const r=t.slice();for(let a=r.length-1;a>0;a--){n=n*1664525+1013904223>>>0;const s=n%(a+1);[r[a],r[s]]=[r[s],r[a]]}return r}function Gt({card:t,onComplete:n}){const r=o.useMemo(()=>{const p=[t.correct,...t.distractors];return _t(p,$t(t.id))},[t.id,t.correct,t.distractors]),a=r.indexOf(t.correct),[s,i]=o.useState(null),[c,l]=o.useState(null);o.useEffect(()=>{i(null),l(null)},[t.id]);const d=o.useCallback(p=>{c?.pass||i(p)},[c]),h=o.useCallback(()=>{if(s===null)return;const p=s===a;l({pass:p}),n(p)},[s,a,n]),u=o.useCallback(()=>{i(null),l(null)},[]);return o.useEffect(()=>{const p=x=>{const f=x.key.toLowerCase();f>="1"&&f<="4"?(x.preventDefault(),d(parseInt(f,10)-1)):f>="a"&&f<="d"?(x.preventDefault(),d(f.charCodeAt(0)-97)):x.key==="Enter"?(x.preventDefault(),h()):x.key==="Escape"&&c&&!c.pass&&(x.preventDefault(),u())};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)},[d,h,u,c]),e.jsxs("section",{className:"mcq-root",role:"application","aria-label":`Multiple choice — atom ${t.atomId}`,children:[e.jsx("style",{children:Lt}),e.jsxs("header",{className:"mcq-header",children:[e.jsx("h2",{id:"mcq-stem",className:"mcq-stem",children:t.stem}),e.jsxs("div",{className:"mcq-meta",children:[e.jsx("span",{className:"mcq-atom",children:t.atomId}),e.jsx("span",{className:"mcq-q",children:t.qTags.join(" · ")})]})]}),e.jsx("ul",{role:"radiogroup","aria-labelledby":"mcq-stem",className:"mcq-options",children:r.map((p,x)=>{const f=s===x,v=c&&x===a,b=c&&f&&!c.pass,m=["mcq-opt",f?"is-picked":"",v?"is-correct":"",b?"is-wrong":""].filter(Boolean).join(" ");return e.jsx("li",{children:e.jsxs("button",{type:"button",role:"radio","aria-checked":f,"aria-label":`option ${V[x]}: ${p}`,className:m,onClick:()=>d(x),disabled:c?.pass===!0,children:[e.jsx("span",{className:"mcq-letter","aria-hidden":"true",children:V[x]}),e.jsx("span",{className:"mcq-text",children:p})]})},x)})}),e.jsxs("div",{className:"mcq-actions",children:[e.jsx("button",{type:"button",className:"mcq-btn mcq-btn--primary",onClick:h,disabled:s===null||c?.pass===!0,"aria-label":"submit answer (Enter)",children:c?.pass?"Passed":"Submit (Enter)"}),c&&!c.pass&&e.jsx("button",{type:"button",className:"mcq-btn",onClick:u,"aria-label":"clear and try again (Esc)",children:"Try again (Esc)"})]}),c&&e.jsxs("div",{className:`mcq-feedback ${c.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[e.jsx("strong",{children:c.pass?"✓ correct":"✗ not quite"}),!c.pass&&e.jsxs("span",{children:[" ","— correct answer was"," ",e.jsx("code",{children:V[a]}),"."]}),e.jsxs("details",{className:"mcq-explain",children:[e.jsx("summary",{children:"show explanation"}),e.jsx("p",{children:t.explanation})]})]})]})}const Lt=`
.mcq-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 760px;
  margin: 0 auto;
}
.mcq-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.mcq-stem { margin: 0; font-size: 15px; line-height: 1.5; flex: 1; }
.mcq-meta { display: flex; gap: 8px; font-size: 11px; align-items: flex-start; }
.mcq-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.mcq-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.mcq-options { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mcq-opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 10px 12px;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  line-height: 1.45;
}
.mcq-opt:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
}
.mcq-opt:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.mcq-opt:disabled { cursor: not-allowed; }
.mcq-opt.is-picked {
  border-color: var(--accent-cyan, #79c0ff);
  background: rgba(121,192,255,0.08);
}
.mcq-opt.is-correct {
  border-color: var(--accent-grn, #7ee787);
  background: rgba(126,231,135,0.08);
  color: var(--accent-grn, #7ee787);
}
.mcq-opt.is-wrong {
  border-color: var(--state-err, #f85149);
  background: rgba(248,81,73,0.08);
  color: var(--state-err, #f85149);
}
.mcq-letter {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  background: var(--bg-2, #1f2937);
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-cyan, #79c0ff);
  flex-shrink: 0;
  margin-top: 1px;
}
.mcq-opt.is-correct .mcq-letter { color: var(--accent-grn, #7ee787); }
.mcq-opt.is-wrong .mcq-letter { color: var(--state-err, #f85149); }
.mcq-text {
  flex: 1;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  white-space: pre-wrap;
}
.mcq-actions { display: flex; gap: 8px; justify-content: flex-end; }
.mcq-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.mcq-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.mcq-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.mcq-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.mcq-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.mcq-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.mcq-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.mcq-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.mcq-feedback code {
  background: var(--bg-2, #1f2937);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.mcq-explain { margin-top: 8px; color: var(--text-1, #8b949e); }
.mcq-explain summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.mcq-explain p { margin: 6px 0 0; line-height: 1.5; }
`;function Jt({card:t,onComplete:n,targetStreak:r=3}){const a=o.useMemo(()=>[{prompt:t.prompt,expectedAnswer:t.expectedAnswer},...t.variants],[t.prompt,t.expectedAnswer,t.variants]),s=Math.min(r,a.length),[i,c]=o.useState(0),[l,d]=o.useState(""),[h,u]=o.useState(0),[p,x]=o.useState(null),f=o.useRef(null),v=a[i];o.useEffect(()=>{c(0),d(""),u(0),x(null),requestAnimationFrame(()=>f.current?.focus())},[t.id]);const b=o.useCallback(()=>{const g=P(l,{canonicalAnswer:v.expectedAnswer,keyChecks:t.keyChecks,forbiddenTokens:[],requireSemicolon:!1});if(x(g),g.pass){const y=h+1;u(y),y>=s?n(!0):setTimeout(()=>{c(w=>(w+1)%a.length),d(""),x(null),f.current?.focus()},800)}else u(0)},[l,v.expectedAnswer,t.keyChecks,h,s,n,a.length]),m=o.useCallback(()=>{d(""),x(null),requestAnimationFrame(()=>f.current?.focus())},[]);return o.useEffect(()=>{const g=y=>{(y.ctrlKey||y.metaKey)&&y.key==="Enter"?(y.preventDefault(),b()):y.key==="Escape"&&p&&!p.pass&&(y.preventDefault(),m())};return window.addEventListener("keydown",g),()=>window.removeEventListener("keydown",g)},[b,m,p]),e.jsxs("section",{className:"pc-root",role:"application","aria-label":`Procedural — ${t.section}`,children:[e.jsx("style",{children:Dt}),e.jsxs("header",{className:"pc-header",children:[e.jsxs("div",{children:[e.jsx("span",{className:"pc-section",children:t.section}),e.jsx("h2",{className:"pc-stem",children:t.stem})]}),e.jsxs("div",{className:"pc-meta",children:[e.jsx(Rt,{streak:h,target:s}),e.jsx("span",{className:"pc-atom",children:t.atomId}),e.jsx("span",{className:"pc-q",children:t.qTags.join(" · ")})]})]}),e.jsxs("p",{className:"pc-prompt","aria-live":"polite",children:[e.jsxs("span",{className:"pc-prompt-eyebrow",children:["prompt ",i+1,"/",a.length]}),e.jsx("span",{children:v.prompt})]}),e.jsx("div",{className:"pc-editor",children:e.jsx(q,{ref:f,value:l,onChange:d,language:"cpp",ariaLabel:"C++ code editor — write your answer here",showBraceMatch:!0,lineNumbers:!0})}),e.jsxs("div",{className:"pc-actions",children:[e.jsx("button",{type:"button",className:"pc-btn pc-btn--primary",onClick:b,"aria-label":"submit (Ctrl+Enter)",children:"Submit (Ctrl+Enter)"}),e.jsx("button",{type:"button",className:"pc-btn",onClick:m,"aria-label":"clear editor (Esc)",disabled:l.length===0,children:"Clear (Esc)"})]}),p&&e.jsxs("div",{className:`pc-feedback ${p.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[e.jsx("strong",{children:p.pass?`✓ pass · streak ${h}/${s}`:"✗ not yet"}),!p.pass&&p.errors[0]&&e.jsx("p",{className:"pc-err",children:p.errors[0].message})]})]})}function Rt({streak:t,target:n}){const r=[];for(let a=0;a<n;a++)r.push(e.jsx("span",{className:`pc-dot ${a<t?"is-on":""}`,"aria-hidden":"true"},a));return e.jsxs("div",{className:"pc-streak",role:"status","aria-label":`streak ${t} of ${n}`,children:[e.jsx("span",{className:"pc-streak-label",children:"streak"}),e.jsx("span",{className:"pc-streak-dots",children:r})]})}const Dt=`
.pc-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1080px;
  margin: 0 auto;
}
.pc-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.pc-section {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-org, #ffa657);
  margin-bottom: 4px;
}
.pc-stem { margin: 0; font-size: 14px; line-height: 1.4; }
.pc-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; flex-wrap: wrap; justify-content: flex-end; }
.pc-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.pc-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.pc-streak {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 3px 8px;
  border-radius: 3px;
}
.pc-streak-label {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-2, #6e7681);
}
.pc-streak-dots { display: inline-flex; gap: 4px; }
.pc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-3, #2d333b);
  border: 1px solid var(--border-1, #30363d);
}
.pc-dot.is-on {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
  box-shadow: 0 0 4px rgba(126,231,135,0.6);
}
.pc-prompt {
  margin: 0;
  padding: 10px 12px;
  background: var(--bg-1, #161b22);
  border-left: 3px solid var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  line-height: 1.5;
}
.pc-prompt-eyebrow {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--accent-cyan, #79c0ff);
  font-weight: 700;
}
.pc-editor { display: flex; min-height: 220px; }
.pc-editor > * { flex: 1; min-height: 0; }
.pc-actions { display: flex; justify-content: flex-end; gap: 8px; }
.pc-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.pc-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.pc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.pc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.pc-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.pc-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.pc-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.pc-err { margin: 6px 0 0; font-size: 12px; line-height: 1.5; }
`,Mt=new Set(["Shift","Control","Alt","Meta","CapsLock","Tab","Escape","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]);function qt(t,n){if(n.length===0)return t.trim().length>0;const r=R(t);return n.every(a=>r.includes(R(a)))}function Vt({card:t,onComplete:n}){const[r,a]=o.useState("display"),[s,i]=o.useState(""),[c,l]=o.useState(!1),d=o.useRef(null);o.useEffect(()=>{a("display"),i(""),l(!1)},[t.id]),o.useEffect(()=>{r==="input"&&d.current?.focus()},[r]),o.useEffect(()=>{r==="input"&&s.length!==0&&R(s)===R(t.fact)&&(a("graded-pass"),window.setTimeout(()=>n(!0),500))},[s,r,t.fact,n]);const h=o.useCallback(()=>{if(r!=="input")return;qt(s,t.keyChecks)?(a("graded-pass"),window.setTimeout(()=>n(!0),500)):c?(a("final-fail"),window.setTimeout(()=>n(!1),1200)):(a("graded-fail"),l(!0))},[r,s,t.keyChecks,c,n]),u=f=>{f.key==="Enter"&&!f.shiftKey&&(f.preventDefault(),h())};o.useEffect(()=>{const f=v=>{if(r==="display"){if(Mt.has(v.key))return;v.preventDefault(),a("input")}else r==="graded-fail"&&v.code==="Space"?(v.preventDefault(),i(""),a("display")):r==="final-fail"&&v.code==="Space"&&(v.preventDefault(),n(!1))};return window.addEventListener("keydown",f),()=>window.removeEventListener("keydown",f)},[r,n]);const p=r==="graded-pass"?"card card--graded-pass":r==="graded-fail"||r==="final-fail"?"card card--graded-fail":"card",x=r==="display"||r==="final-fail";return e.jsxs("div",{className:p,children:[e.jsxs("div",{className:"atom-id",children:[t.level," · ",t.atomId]}),t.context&&e.jsx("div",{className:x?"memorize-context":"memorize-context memorize-context--hidden",children:t.context}),e.jsx("div",{className:x?"memorize-fact":"memorize-fact memorize-fact--hidden",children:t.fact}),t.codeExample&&e.jsx("pre",{className:"memorize-code",children:t.codeExample}),(r==="input"||r==="graded-fail"||r==="graded-pass")&&e.jsxs("div",{className:"input-area",children:[e.jsx("label",{className:"input-area__label",htmlFor:`memorize-${t.id}`,children:"type the fact verbatim"}),e.jsx("textarea",{id:`memorize-${t.id}`,ref:d,className:"input-area__textarea",value:s,onChange:f=>i(f.target.value),onKeyDown:u,disabled:r!=="input",rows:2,spellCheck:!1})]}),r==="graded-pass"&&e.jsx("div",{className:"feedback",children:e.jsx("div",{className:"feedback__title feedback__title--pass",children:"pass"})}),r==="graded-fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"not quite — see fact again"}),e.jsxs("div",{className:"feedback__detail",children:[e.jsxs("div",{children:["expected one of: ",e.jsx("strong",{children:t.keyChecks.join(", ")})]}),e.jsx("div",{className:"explanation",children:t.explanation})]})]}),r==="final-fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"correct answer"}),e.jsxs("div",{className:"feedback__detail",children:[e.jsx("strong",{children:t.fact}),e.jsx("div",{className:"explanation",children:t.explanation})]})]}),e.jsxs("div",{className:"kbd-hint",children:[r==="display"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"any key"})," to start typing"]}),r==="input"&&e.jsx(e.Fragment,{children:"type from memory — auto-advance on match"}),r==="graded-fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to see fact again"]}),r==="final-fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to continue"]})]})]})}function Ot({card:t,onComplete:n}){const[r,a]=o.useState("input"),[s,i]=o.useState(""),[c,l]=o.useState(!1),d=o.useRef(null);o.useEffect(()=>{a("input"),i(""),l(!1)},[t.id]),o.useEffect(()=>{r==="input"&&d.current?.focus()},[r]);const h=o.useCallback(()=>{if(r!=="input")return;P(s,{canonicalAnswer:t.expectedAnswer,keyChecks:t.keyChecks,forbiddenTokens:t.forbidden,requireSemicolon:t.writeLevel!==1}).pass?(a("graded-pass"),window.setTimeout(()=>n(!0),700)):c?(a("final-fail"),window.setTimeout(()=>n(!1),1500)):(a("graded-fail"),l(!0))},[r,s,t.expectedAnswer,t.keyChecks,t.forbidden,t.writeLevel,c,n]),u=o.useCallback(()=>{i(""),a("input")},[]),p=b=>{b.key==="Enter"&&(b.ctrlKey||b.metaKey)&&(b.preventDefault(),h())},x=b=>{b.key==="Enter"&&(b.preventDefault(),h())};o.useEffect(()=>{const b=m=>{r==="graded-fail"&&m.code==="Space"?(m.preventDefault(),u()):r==="final-fail"&&m.code==="Space"&&(m.preventDefault(),n(!1))};return window.addEventListener("keydown",b),()=>window.removeEventListener("keydown",b)},[r,n,u]);const f=r==="graded-pass"?"card card--graded-pass":r==="graded-fail"||r==="final-fail"?"card card--graded-fail":"card",v=t.writeLevel===1?"fill blank":t.writeLevel===2?"complete body":"free form";return e.jsxs("div",{className:`${f} write-card`,children:[e.jsxs("div",{className:"atom-id",children:[t.level," · ",t.atomId," · write · ",v]}),e.jsx("div",{className:"write-spec",children:t.spec}),t.template&&e.jsx("pre",{className:"write-template",children:e.jsx("code",{children:t.template})}),(r==="input"||r==="graded-fail"||r==="graded-pass")&&e.jsx("div",{className:"write-input-area",children:t.writeLevel===1?e.jsx("input",{ref:d,type:"text",className:"write-input write-input--single",value:s,onChange:b=>i(b.target.value),onKeyDown:x,disabled:r!=="input",placeholder:"answer",spellCheck:!1}):e.jsx("textarea",{ref:d,className:"write-input write-input--multi",value:s,onChange:b=>i(b.target.value),onKeyDown:p,disabled:r!=="input",placeholder:t.writeLevel===2?"fill the blank":"write your answer",spellCheck:!1,rows:t.writeLevel===3?8:4})}),r==="graded-pass"&&e.jsx("div",{className:"feedback",children:e.jsx("div",{className:"feedback__title feedback__title--pass",children:"pass"})}),r==="graded-fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"not quite — retry once"}),e.jsxs("div",{className:"feedback__detail",children:[e.jsxs("div",{children:["required tokens: ",e.jsx("code",{children:t.keyChecks.join(", ")})]}),t.forbidden&&t.forbidden.length>0&&e.jsxs("div",{children:["must NOT contain: ",e.jsx("code",{children:t.forbidden.join(", ")})]}),e.jsx("div",{className:"explanation",children:t.explanation})]})]}),r==="final-fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"correct answer"}),e.jsxs("div",{className:"feedback__detail",children:[e.jsx("pre",{className:"write-expected",children:e.jsx("code",{children:t.expectedAnswer})}),e.jsx("div",{className:"explanation",children:t.explanation})]})]}),e.jsxs("div",{className:"kbd-hint",children:[r==="input"&&t.writeLevel===1&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"enter"})," to submit"]}),r==="input"&&t.writeLevel!==1&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"ctrl"}),"+",e.jsx("span",{className:"kbd",children:"enter"})," to submit"]}),r==="graded-fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to retry"]}),r==="final-fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to continue"]})]})]})}function Qt({card:t,onComplete:n}){const[r,a]=o.useState(""),[s,i]=o.useState("input"),[c,l]=o.useState(!1),d=o.useRef(null);o.useEffect(()=>{a(""),i("input"),l(!1)},[t.id]),o.useEffect(()=>{s==="input"&&d.current?.focus()},[s]);const h=o.useCallback(()=>{if(s!=="input")return;P(r,{canonicalAnswer:t.expectedAnswer,keyChecks:t.keyChecks,forbiddenTokens:[],requireSemicolon:!0}).pass?(i("pass"),window.setTimeout(()=>n(!0),700)):c?(i("final-fail"),window.setTimeout(()=>n(!1),1500)):(i("fail"),l(!0))},[s,r,t.expectedAnswer,t.keyChecks,c,n]),u=f=>{f.key==="Enter"&&(f.ctrlKey||f.metaKey)&&(f.preventDefault(),h())};o.useEffect(()=>{const f=v=>{s==="fail"&&v.code==="Space"?(v.preventDefault(),a(""),i("input")):s==="final-fail"&&v.code==="Space"&&(v.preventDefault(),n(!1))};return window.addEventListener("keydown",f),()=>window.removeEventListener("keydown",f)},[s,n]);const p=s==="pass"?"card card--graded-pass":s==="fail"||s==="final-fail"?"card card--graded-fail":"card",x=t.matrixType==="algorithm"?"Algorithm Transfer":t.matrixType==="entity"?"Entity Swap":"Complexity Progression";return e.jsxs("div",{className:`${p} matrix-card`,children:[e.jsxs("div",{className:"atom-id",children:[t.level," · Code Matrix · ",x," · ",t.atomId]}),e.jsx("div",{className:"matrix-examples",children:t.examples.map((f,v)=>e.jsxs("div",{className:"matrix-example",children:[e.jsx("div",{className:"matrix-example__label",children:f.label}),e.jsx("pre",{className:"matrix-example__code",children:f.code})]},v))}),e.jsx("div",{className:"matrix-divider",children:e.jsx("span",{className:"matrix-divider__arrow",children:"your turn"})}),e.jsx("div",{className:"write-spec",children:t.prompt}),(s==="input"||s==="fail"||s==="pass")&&e.jsx("div",{className:"write-input-area",children:e.jsx("textarea",{ref:d,className:"write-input write-input--multi",value:r,onChange:f=>a(f.target.value),onKeyDown:u,disabled:s!=="input",placeholder:"write your answer",spellCheck:!1,rows:10})}),s==="pass"&&e.jsx("div",{className:"feedback",children:e.jsx("div",{className:"feedback__title feedback__title--pass",children:"pass — pattern transferred"})}),s==="fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"not quite — retry"}),e.jsx("div",{className:"feedback__detail",children:e.jsxs("div",{children:["required: ",e.jsx("code",{children:t.keyChecks.join(", ")})]})})]}),s==="final-fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"correct answer"}),e.jsx("div",{className:"feedback__detail",children:e.jsx("pre",{className:"write-expected",children:e.jsx("code",{children:t.expectedAnswer})})})]}),e.jsxs("div",{className:"kbd-hint",children:[s==="input"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"ctrl"}),"+",e.jsx("span",{className:"kbd",children:"enter"})," to submit"]}),s==="fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to retry"]}),s==="final-fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to continue"]})]})]})}function Zt({card:t,onComplete:n}){const[r,a]=o.useState("study"),[s,i]=o.useState(""),[c,l]=o.useState(!1),d=o.useRef(null);o.useEffect(()=>{a("study"),i(""),l(!1)},[t.id]),o.useEffect(()=>{r==="input"&&d.current?.focus()},[r]);const h=o.useCallback(()=>{if(r!=="input")return;P(s,{canonicalAnswer:t.code,keyChecks:t.keyChecks,forbiddenTokens:[],requireSemicolon:!1}).pass?(a("pass"),window.setTimeout(()=>n(!0),700)):c?a("final-fail"):(a("fail"),l(!0))},[r,s,t.code,t.keyChecks,c]);o.useEffect(()=>{const f=v=>{r==="study"&&v.code==="Space"?(v.preventDefault(),a("input")):r==="fail"&&v.code==="Space"?(v.preventDefault(),i(""),a("input")):r==="final-fail"&&v.code==="Space"&&(v.preventDefault(),i(""),l(!1),a("study"),n(!1))};return window.addEventListener("keydown",f),()=>window.removeEventListener("keydown",f)},[r,n]);const u=f=>{f.key==="Enter"&&(f.ctrlKey||f.metaKey)&&(f.preventDefault(),h())},p=r==="pass"?"card card--graded-pass":r==="fail"||r==="final-fail"?"card card--graded-fail":"card",x=t.code.split(`
`).length;return e.jsxs("div",{className:`${p} cmem-card`,children:[e.jsxs("div",{className:"atom-id",children:[t.level," · Code Memorize · ",t.section," · ",t.atomId]}),e.jsx("div",{className:"write-spec",children:t.question}),r==="study"&&e.jsxs("div",{className:"cmem-study",children:[e.jsx("div",{className:"cmem-study__label",children:"memorize this code:"}),e.jsx("pre",{className:"cmem-study__code",children:t.code})]}),(r==="input"||r==="fail"||r==="pass")&&e.jsx("div",{className:"write-input-area",children:e.jsx("textarea",{ref:d,className:"write-input write-input--multi",value:s,onChange:f=>i(f.target.value),onKeyDown:u,disabled:r!=="input",placeholder:"type the code from memory",spellCheck:!1,rows:Math.max(x+2,6)})}),r==="pass"&&e.jsx("div",{className:"feedback",children:e.jsx("div",{className:"feedback__title feedback__title--pass",children:"pass — memorized"})}),r==="fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"not quite — retry"}),e.jsx("div",{className:"feedback__detail",children:e.jsxs("div",{children:["required: ",e.jsx("code",{children:t.keyChecks.join(", ")})]})})]}),r==="final-fail"&&e.jsxs("div",{className:"feedback",children:[e.jsx("div",{className:"feedback__title feedback__title--fail",children:"correct code"}),e.jsx("div",{className:"feedback__detail",children:e.jsx("pre",{className:"write-expected",children:e.jsx("code",{children:t.code})})})]}),e.jsxs("div",{className:"kbd-hint",children:[r==="study"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to hide code and begin typing"]}),r==="input"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"ctrl"}),"+",e.jsx("span",{className:"kbd",children:"enter"})," to submit"]}),r==="fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to retry"]}),r==="final-fail"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"kbd",children:"space"})," to re-study"]})]})]})}export{Zt as C,Ut as D,Bt as F,Qt as M,Jt as P,Pt as S,Kt as T,Ot as W,Vt as a,Gt as b,Wt as c,Ht as d,Yt as e,Ft as f,At as g};
