import{r as d,j as t}from"./vendor-react-9N0TBUMw.js";const oe=new Set(["int","double","string","bool","char","void","struct","return","for","if","else","const","true","false","cin","cout","endl","while","do","break","continue","include","using","namespace","std","main"]),ge=["<<=",">>=","==","!=","<=",">=","&&","||","++","--","+=","-=","*=","/=","%=","<<",">>","->","::"],ve=new Set(["=","<",">","+","-","*","/","%","&","|","!","^","~","?"]),ye=new Set([";","{","}","(",")","[","]",".",",",":"]);function ce(e){return e===void 0?!1:e>="a"&&e<="z"||e>="A"&&e<="Z"||e==="_"}function J(e){return e===void 0?!1:ce(e)||e>="0"&&e<="9"}function X(e){return e===void 0?!1:e>="0"&&e<="9"}function W(e){const r=[],a=e.length;let n=0;for(;n<a;){const s=n,i=e[n];if(i===" "||i==="	"||i===`
`||i==="\r"){for(;n<a&&(e[n]===" "||e[n]==="	"||e[n]===`
`||e[n]==="\r");)n++;r.push({type:"whitespace",value:e.slice(s,n),start:s,end:n});continue}if(i==="/"&&e[n+1]==="/"){for(;n<a&&e[n]!==`
`;)n++;r.push({type:"comment",value:e.slice(s,n),start:s,end:n});continue}if(i==="/"&&e[n+1]==="*"){for(n+=2;n<a&&!(e[n]==="*"&&e[n+1]==="/");)n++;n<a&&(n+=2),r.push({type:"comment",value:e.slice(s,n),start:s,end:n});continue}if(i==='"'){for(n++;n<a&&e[n]!=='"';){if(e[n]==="\\"&&n+1<a){n+=2;continue}if(e[n]===`
`)break;n++}n<a&&e[n]==='"'&&n++,r.push({type:"string",value:e.slice(s,n),start:s,end:n});continue}if(i==="'"){for(n++;n<a&&e[n]!=="'";){if(e[n]==="\\"&&n+1<a){n+=2;continue}if(e[n]===`
`)break;n++}n<a&&e[n]==="'"&&n++,r.push({type:"string",value:e.slice(s,n),start:s,end:n});continue}if(i==="#"){for(n++;n<a&&J(e[n]);)n++;r.push({type:"keyword",value:e.slice(s,n),start:s,end:n});continue}if(X(i)){for(;n<a&&(X(e[n])||e[n]===".");)n++;for(;n<a&&(e[n]==="f"||e[n]==="F"||e[n]==="u"||e[n]==="U"||e[n]==="l"||e[n]==="L");)n++;r.push({type:"number",value:e.slice(s,n),start:s,end:n});continue}if(ce(i)){for(;n<a&&J(e[n]);)n++;const c=e.slice(s,n);r.push({type:oe.has(c)?"keyword":"identifier",value:c,start:s,end:n});continue}let o=null;for(const c of ge)if(e.startsWith(c,n)){o=c;break}if(o){r.push({type:"operator",value:o,start:s,end:s+o.length}),n+=o.length;continue}if(ve.has(i)){r.push({type:"operator",value:i,start:s,end:n+1}),n++;continue}if(ye.has(i)){r.push({type:"punctuation",value:i,start:s,end:n+1}),n++;continue}r.push({type:"identifier",value:i,start:s,end:n+1}),n++}return r}const we=new Set(["{","(","["]),ke=new Set(["}",")","]"]);function H(e){return e!==void 0&&we.has(e)}function le(e){return e!==void 0&&ke.has(e)}function ee(e){return H(e)||le(e)}const Q={"{":"}","(":")","[":"]","}":"{",")":"(","]":"["};function je(e,r){const a=new Uint8Array(r);for(const n of e)if(n.type==="string"||n.type==="comment")for(let s=n.start;s<n.end;s++)a[s]=1;return a}function Ne(e,r){const a=e.length;if(a===0)return null;const n=Math.max(0,Math.min(r,a)),s=W(e),i=je(s,a);let o=-1;if(n>0&&!i[n-1]){const l=e[n-1];ee(l)&&(o=n-1)}if(o===-1&&n<a&&!i[n]){const l=e[n];ee(l)&&(o=n)}if(o!==-1)return te(e,i,o);const c={"{":0,"(":0,"[":0};for(let l=n-1;l>=0;l--){if(i[l])continue;const f=e[l];if(le(f)){const u=Q[f];c[u]++}else if(H(f)){if(c[f]===0)return te(e,i,l);c[f]--}}return null}function te(e,r,a){const n=e[a],s=H(n)?n:Q[n],i=Q[s];let o=0;{let f=0,u=0;for(let p=0;p<a;p++){if(r[p])continue;const m=e[p];m===s?f++:m===i&&u++}o=Math.max(0,f-u)}let c,l;return H(n)?(c=a,l=Se(e,r,a,s,i)):(l=a,c=Ce(e,r,a,s,i)),{openPos:c,closePos:l,depth:o,matched:c!==-1&&l!==-1}}function Se(e,r,a,n,s){let i=0;for(let o=a;o<e.length;o++){if(r[o])continue;const c=e[o];if(c===n)i++;else if(c===s&&(i--,i===0))return o}return-1}function Ce(e,r,a,n,s){let i=0;for(let o=a;o>=0;o--){if(r[o])continue;const c=e[o];if(c===s)i++;else if(c===n&&(i--,i===0))return o}return-1}function ze(e,r){return d.useMemo(()=>Ne(e,r),[e,r])}const D="    ",Ee={keyword:"ce-tok-keyword",identifier:"ce-tok-identifier",string:"ce-tok-string",number:"ce-tok-number",comment:"ce-tok-comment",operator:"ce-tok-operator",punctuation:"ce-tok-punctuation",whitespace:"ce-tok-ws"};function Te({code:e,braceOpen:r,braceClose:a,braceDepth:n,braceMatched:s}){const i=d.useMemo(()=>W(e),[e]),o=e.endsWith(`
`)?e+" ":e,c=o===e?i:W(o);return t.jsx("pre",{"aria-hidden":"true",className:"ce-highlight",children:c.map((l,f)=>{const u=r!==void 0&&l.start===r,p=a!==void 0&&l.start===a,m=u||p,x=[Ee[l.type]];return m&&(x.push(s?"ce-brace-match":"ce-brace-mismatch"),n!==void 0&&s&&x.push(`ce-brace-d${n%3}`)),t.jsx("span",{className:x.join(" "),children:l.value},f)})})}function _e({lineCount:e}){const r=d.useMemo(()=>Array.from({length:e},(a,n)=>n+1),[e]);return t.jsx("div",{className:"ce-gutter","aria-hidden":"true",children:r.map(a=>t.jsx("div",{className:"ce-gutter-line",children:a},a))})}function Re(e,r,a){let n=r;for(;n>0&&e[n-1]!==`
`;)n--;let s=a;for(s>r&&e[s-1]===`
`&&s--;s<e.length&&e[s]!==`
`;)s++;return{firstLineStart:n,lastLineEnd:s,trailingBoundary:s}}function $e(e,r){let a=r;for(;a>0&&e[a-1]!==`
`;)a--;let n=a;for(;n<e.length&&e[n]===" ";)n++;return e.slice(a,n)}function F(e,r,a,n){const s=Re(e,r,a),i=e.slice(0,s.firstLineStart),o=e.slice(s.firstLineStart,s.lastLineEnd),c=e.slice(s.lastLineEnd),f=o.split(`
`).map(n).join(`
`),u=f.length-o.length;return{value:i+f+c,selStart:s.firstLineStart,selEnd:s.lastLineEnd+u}}const A=d.forwardRef(function({value:r,onChange:a,language:n,readOnly:s=!1,lineNumbers:i=!0,showBraceMatch:o=!0,className:c="",ariaLabel:l,placeholder:f,onEscape:u},p){const m=d.useRef(null),x=d.useRef(null),b=d.useId(),[h,g]=d.useState(0);d.useImperativeHandle(p,()=>({focus:()=>m.current?.focus(),getTextarea:()=>m.current}),[]);const k=d.useCallback(()=>{const j=m.current,_=x.current;if(!j||!_)return;const N=_.querySelector(".ce-highlight"),M=_.querySelector(".ce-gutter");N&&(N.scrollTop=j.scrollTop,N.scrollLeft=j.scrollLeft),M&&(M.scrollTop=j.scrollTop)},[]);d.useLayoutEffect(()=>{k()},[r,k]);const y=d.useCallback(j=>{a(j.target.value),g(j.target.selectionStart)},[a]),v=d.useCallback(()=>{const j=m.current;j&&g(j.selectionStart)},[]),E=d.useCallback((j,_=0)=>{const N=m.current;if(!N)return;const M=N.selectionStart,z=N.selectionEnd,w=r.slice(0,M)+j+r.slice(z);a(w);const S=M+j.length-_;requestAnimationFrame(()=>{m.current&&(m.current.selectionStart=S,m.current.selectionEnd=S,g(S))})},[r,a]),T=d.useCallback((j,_,N)=>{a(j),requestAnimationFrame(()=>{m.current&&(m.current.selectionStart=_,m.current.selectionEnd=N,g(_))})},[a]),R=d.useCallback(j=>{if(s)return;const _=j.currentTarget,N=_.selectionStart,M=_.selectionEnd,z=N!==M;if(j.key==="Escape"){j.preventDefault(),_.blur(),u?.();return}if((j.ctrlKey||j.metaKey)&&j.key==="/"){j.preventDefault();const w=F(r,N,M,S=>{const C=S.trimStart(),P=S.slice(0,S.length-C.length);return C.startsWith("// ")?P+C.slice(3):C.startsWith("//")?P+C.slice(2):C.length===0?S:P+"// "+C});T(w.value,w.selStart,w.selEnd);return}if((j.ctrlKey||j.metaKey)&&j.key==="]"){j.preventDefault();const w=F(r,N,M,S=>D+S);T(w.value,w.selStart,w.selEnd);return}if((j.ctrlKey||j.metaKey)&&j.key==="["){j.preventDefault();const w=F(r,N,M,S=>{let C=0;for(;C<D.length&&S[C]===" ";)C++;return S.slice(C)});T(w.value,w.selStart,w.selEnd);return}if(j.key==="Tab"){if(j.preventDefault(),j.shiftKey){const w=F(r,N,M,S=>{let C=0;for(;C<D.length&&S[C]===" ";)C++;return S.slice(C)});T(w.value,w.selStart,w.selEnd)}else if(z){const w=F(r,N,M,S=>D+S);T(w.value,w.selStart,w.selEnd)}else E(D);return}if(j.key==="Enter"){j.preventDefault();const w=$e(r,N),S=N>0?r[N-1]:"",C=N<r.length?r[N]:"";if(S==="{"&&C==="}"){const P=`
`+w+D+`
`+w,he=(`
`+w).length;E(P,he)}else E(S==="{"?`
`+w+D:`
`+w);return}},[r,s,E,T,u]),I=d.useMemo(()=>{let j=1;for(let _=0;_<r.length;_++)r[_]===`
`&&j++;return j},[r]),$=ze(r,h),q=o&&$!==null&&$.openPos!==-1;return t.jsxs("div",{ref:x,className:`ce-root ${c}`,"data-readonly":s,"data-line-numbers":i,children:[t.jsx("style",{children:Me}),i&&t.jsx(_e,{lineCount:I}),t.jsxs("div",{className:"ce-content",children:[t.jsx(Te,{code:r,braceOpen:q?$.openPos:void 0,braceClose:q&&$.matched?$.closePos:void 0,braceDepth:q?$.depth:void 0,braceMatched:q?$.matched:void 0}),t.jsx("textarea",{ref:m,id:`ce-${b}`,className:"ce-textarea",value:r,onChange:y,onKeyDown:R,onSelect:v,onScroll:k,readOnly:s,spellCheck:!1,autoCapitalize:"off",autoCorrect:"off",autoComplete:"off",wrap:"off",placeholder:f,role:"application","aria-label":l,"aria-multiline":"true","aria-readonly":s})]})]})}),Me=`
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
`;function Ie(e){if(!e||e.length===0)return{past:[],current:null};const r=e.slice(0,-1),a=e[e.length-1]??null;return{past:r,current:a}}function de({label:e,varPath:r,values:a,editable:n,onAddValue:s}){const{past:i,current:o}=Ie(a),[c,l]=d.useState(""),f=d.useCallback(()=>{const p=c.trim();p.length!==0&&(s?.(r,p),l(""))},[c,r,s]),u=d.useCallback(p=>{p.key==="Enter"&&(p.preventDefault(),f())},[f]);return t.jsxs("div",{className:"mb-row",role:"row","aria-label":`variable ${e}`,children:[t.jsx("div",{className:"mb-label",role:"rowheader",children:e}),t.jsxs("div",{className:"mb-cells mb-cells--scalar",role:"cell",children:[i.map((p,m)=>t.jsx("span",{className:"mb-val mb-val--past",children:p},`p${m}`)),o!==null&&t.jsx("span",{className:"mb-val mb-val--current","aria-label":"current value",children:o}),n&&t.jsx("input",{className:"mb-input",type:"text",value:c,onChange:p=>l(p.target.value),onKeyDown:u,onBlur:f,placeholder:"+ value","aria-label":`new value for ${e}`,spellCheck:!1,autoComplete:"off"})]})]})}function pe({label:e,size:r,cells:a}){const n=Array.from({length:r},(s,i)=>a[i]??"");return t.jsxs("div",{className:"mb-row",role:"row","aria-label":`array ${e}`,children:[t.jsx("div",{className:"mb-label",role:"rowheader",children:e}),t.jsxs("div",{className:"mb-array",role:"cell",children:[t.jsx("div",{className:"mb-array-indices","aria-hidden":"true",children:n.map((s,i)=>t.jsxs("span",{className:"mb-array-idx",children:["[",i,"]"]},`idx${i}`))}),t.jsx("div",{className:"mb-array-cells",children:n.map((s,i)=>t.jsx("span",{className:"mb-array-cell","aria-label":`${e}[${i}] = ${s||"empty"}`,children:s},`cell${i}`))})]})]})}function Le({shape:e,history:r,arrayInits:a,editable:n,onAddValue:s}){return t.jsxs("div",{className:"mb-struct",role:"group","aria-label":`struct ${e.name}${e.structType?` (${e.structType})`:""}`,children:[t.jsxs("div",{className:"mb-struct-header",children:[t.jsx("span",{className:"mb-struct-name",children:e.name}),e.structType&&t.jsx("span",{className:"mb-struct-type","aria-label":"struct type",children:e.structType})]}),t.jsx("div",{className:"mb-struct-body",children:e.fields.map(i=>{const o=`${e.name}.${i.name}`;return i.kind==="array"&&i.size?t.jsx(pe,{label:i.name,size:i.size,cells:a[o]??a[i.name]??[]},o):t.jsx(de,{label:i.name,varPath:o,values:r[o],editable:n,onAddValue:s},o)})})]})}function fe({shapes:e,history:r,arrayInits:a={},passByRef:n,editable:s=!1,onAddValue:i,title:o}){const c={display:"flex",flexDirection:"column",gap:12};return t.jsxs("section",{className:"mb-root",role:"region","aria-label":o??"memory diagram",style:c,children:[o&&t.jsx("h3",{className:"mb-title",children:o}),n&&t.jsxs("div",{className:"mb-passbyref",role:"note","aria-label":"pass-by-reference alias",children:[t.jsx("code",{className:"mb-passbyref-param",children:n.paramName}),t.jsx("span",{className:"mb-passbyref-arrow","aria-hidden":"true",children:"──→"}),t.jsx("code",{className:"mb-passbyref-caller",children:n.callerName}),t.jsx("span",{className:"mb-passbyref-note",children:"(alias — same memory)"})]}),t.jsx("div",{className:"mb-vars",children:e.map(l=>l.kind==="scalar"?t.jsx(de,{label:l.name,varPath:l.name,values:r[l.name],editable:s,onAddValue:i},l.name):l.kind==="array"?t.jsx(pe,{label:l.name,size:l.size,cells:a[l.name]??[]},l.name):t.jsx(Le,{shape:l,history:r,arrayInits:a,editable:s,onAddValue:i},l.name))}),t.jsx("style",{children:Ae})]})}function ue(e,r={}){const a=new Map;for(const s of e){const i=/^([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)\[(\d+)\]$/.exec(s);if(i){const[,f,u,p]=i;if(!f||!u||!p)continue;const m=parseInt(p,10),x=a.get(f);(!x||x.kind!=="struct")&&a.set(f,{kind:"struct",fields:new Map});const b=a.get(f);if(b&&b.kind==="struct"){const h=b.fields.get(u),g=Math.max(m+1,h?.kind==="array"?h.size:0);b.fields.set(u,{kind:"array",size:g})}continue}const o=/^([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)$/.exec(s);if(o){const[,f,u]=o;if(!f||!u)continue;const p=a.get(f);(!p||p.kind!=="struct")&&a.set(f,{kind:"struct",fields:new Map});const m=a.get(f);m&&m.kind==="struct"&&(m.fields.has(u)||m.fields.set(u,{kind:"scalar"}));continue}const c=/^([A-Za-z_][\w]*)\[(\d+)\]$/.exec(s);if(c){const[,f,u]=c;if(!f||!u)continue;const p=parseInt(u,10),m=a.get(f),x=Math.max(p+1,m?.kind==="array"?m.size:0);a.set(f,{kind:"array",size:x});continue}/^([A-Za-z_][\w]*)$/.exec(s)&&!a.has(s)&&a.set(s,{kind:"scalar"})}for(const[s,i]of Object.entries(r)){const o=s.indexOf(".");if(o>=0){const c=s.slice(0,o),l=s.slice(o+1),f=a.get(c);if(f&&f.kind==="struct"){const u=f.fields.get(l),p=Math.max(i.length,u?.kind==="array"?u.size:0);f.fields.set(l,{kind:"array",size:p})}}else{const c=a.get(s);if(!c||c.kind==="array"){const l=Math.max(i.length,c?.kind==="array"?c.size:0);a.set(s,{kind:"array",size:l})}}}const n=[];for(const[s,i]of a.entries())if(i.kind==="scalar")n.push({kind:"scalar",name:s});else if(i.kind==="array")n.push({kind:"array",name:s,size:i.size});else{const o=[];for(const[c,l]of i.fields.entries())l.kind==="array"?o.push({name:c,kind:"array",size:l.size}):o.push({name:c,kind:"scalar"});n.push({kind:"struct",name:s,fields:o})}return n}const Ae=`
.mb-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  padding: 12px;
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
}
.mb-title {
  font-size: 11px;
  margin: 0 0 8px 0;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.mb-passbyref {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: var(--bg-1, #161b22);
  border: 1px dashed var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  font-size: 11px;
  width: max-content;
}
.mb-passbyref-param,
.mb-passbyref-caller {
  font-weight: 600;
  color: var(--accent-cyan, #79c0ff);
  background: transparent;
  padding: 0 2px;
}
.mb-passbyref-arrow {
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.mb-passbyref-note {
  color: var(--text-2, #6e7681);
  font-size: 10px;
  font-style: italic;
}

.mb-vars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mb-row {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  background: var(--bg-1, #161b22);
}
.mb-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 10px;
  min-width: 80px;
  border-right: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #1f2937);
  color: var(--accent-cyan, #79c0ff);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.mb-cells {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 10px;
  flex: 1;
  min-height: 28px;
}
.mb-val {
  font-size: 12px;
  font-family: inherit;
}
.mb-val--past {
  color: var(--text-2, #6e7681);
  text-decoration: line-through;
  opacity: 0.7;
}
.mb-val--current {
  color: var(--text-0, #e6edf3);
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(121,192,255,0.08);
  border-radius: 2px;
}
.mb-input {
  background: var(--bg-0, #0d1117);
  border: 1px dashed var(--border-1, #30363d);
  border-radius: 2px;
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 2px 6px;
  width: 80px;
  outline: 0;
}
.mb-input:focus-visible {
  border-style: solid;
  border-color: var(--accent-cyan, #79c0ff);
}
.mb-input::placeholder {
  color: var(--text-2, #6e7681);
}

.mb-array {
  display: flex;
  flex-direction: column;
  padding: 4px 10px;
  flex: 1;
}
.mb-array-indices {
  display: flex;
  gap: 0;
}
.mb-array-idx {
  font-size: 9px;
  color: var(--text-2, #6e7681);
  min-width: 56px;
  text-align: center;
  padding-bottom: 2px;
  letter-spacing: 0.05em;
}
.mb-array-cells {
  display: flex;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-0, #0d1117);
}
.mb-array-cell {
  min-width: 56px;
  padding: 6px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-0, #e6edf3);
  border-right: 1px solid var(--border-1, #30363d);
  font-variant-numeric: tabular-nums;
}
.mb-array-cell:last-child {
  border-right: 0;
}

.mb-struct {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--accent-cyan, #79c0ff);
  border-radius: 4px;
  background: var(--bg-1, #161b22);
  padding: 0;
}
.mb-struct-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #1f2937);
}
.mb-struct-name {
  font-weight: 700;
  color: var(--accent-cyan, #79c0ff);
  font-size: 13px;
}
.mb-struct-type {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  font-style: italic;
}
.mb-struct-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 8px;
}
.mb-struct-body .mb-row {
  border-radius: 2px;
}
`,De=["<<",">>","==","!=","<=",">=","&&","||"],qe=["<",">","=","+","-","*","/","%"],Be=new Set(["true","false","nullptr","cout","endl","cin"]);function B(e){if(e==null)return"";let r=e.trim().replace(/\s+/g," ");for(const a of De){const n=ne(a),s=new RegExp(`\\s*${n}\\s*`,"g");r=r.replace(s,a)}for(const a of qe){const n=ne(a),s=new RegExp(`\\s*${n}\\s*`,"g");r=r.replace(s,a)}return r=r.replace(/[A-Za-z_][A-Za-z0-9_]*/g,a=>{const n=a.toLowerCase();return Be.has(n)?n:a}),r}function ne(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Pe(e,r){return B(e)===B(r)}function Fe(e){if(!e)return[];const a=e.replace(/\r\n?/g,`
`).split(`
`);return a.length>0&&a[a.length-1]===""&&a.pop(),a}function Ke(e){const r=new Map,a=[];for(const s of e.expectedTrace)!s.variable||s.variable===""||(r.has(s.variable)||a.push(s.variable),r.set(s.variable,s.value));return{variables:a.map(s=>({name:s,value:r.get(s)??""})),terminalLines:e.terminalOutput.slice()}}function Oe(e,r){const a=r.variables.map(u=>{const p=e.variables.find(b=>b.name===u.name);if(!p)return{name:u.name,correct:!1,expected:u.value,actual:"",missing:!0};const m=p.history.length>0?p.history[p.history.length-1]??"":p.value??"",x=Pe(m,u.value);return{name:u.name,correct:x,expected:u.value,actual:m,missing:!1}}),n=a.every(u=>u.correct),s=Fe(e.terminalText),i=r.terminalLines.slice();let o=s.length===i.length;if(o)for(let u=0;u<i.length;u++){const p=s[u]??"",m=i[u]??"";if(B(p)!==B(m)){o=!1;break}}const c=i.join(`
`),l=s.join(`
`),f={pass:n&&o,varResults:a,terminalCorrect:o,expectedTerminalText:c,actualTerminalText:l};return o||(f.terminalDiff=We(s,i)),f}function We(e,r){const a=Math.max(e.length,r.length),n=[];for(let s=0;s<a;s++){const i=e[s],o=r[s];i===void 0&&o!==void 0?n.push(`- ${o}`):i!==void 0&&o===void 0?n.push(`+ ${i}`):i!==void 0&&o!==void 0&&(B(i)!==B(o)?(n.push(`- ${o}`),n.push(`+ ${i}`)):n.push(`  ${i}`))}return n.join(`
`)}function U(e){let r="",a=0;for(;a<e.length;)if(e[a]==="/"&&e[a+1]==="/")for(;a<e.length&&e[a]!==`
`;)a++;else if(e[a]==="/"&&e[a+1]==="*"){for(a+=2;a<e.length&&!(e[a]==="*"&&e[a+1]==="/");)a++;a+=2}else r+=e[a],a++;return r}function He(e){const r=U(e),a=[],n=/\bconst\s+int\s+([A-Za-z_][\w]*)\s*=\s*(-?\d+)\s*;/g;let s;for(;(s=n.exec(r))!==null;){const i=s[1],o=parseInt(s[2]??"0",10);i&&Number.isFinite(o)&&a.push({name:i,value:o})}return a}function Ye(e){const r=U(e),a=[],n=/\bstruct\s+([A-Za-z_][\w]*)\s*\{([\s\S]*?)\}\s*;/g;let s;for(;(s=n.exec(r))!==null;){const i=s[1],o=s[2];if(!i||o===void 0)continue;const c=[],l=/\b([A-Za-z_][\w]*)\s+([A-Za-z_][\w]*)\s*(?:\[\s*([A-Za-z_0-9]+)\s*\])?\s*;/g;let f;for(;(f=l.exec(o))!==null;){const u=f[1],p=f[2],m=f[3];!u||!p||(m?c.push({name:p,kind:"array",cppType:u,sizeRef:m}):c.push({name:p,kind:"scalar",cppType:u}))}a.push({name:i,fields:c})}return a}function Ze(e){const r=U(e),a=[],n=/\b([A-Za-z_][\w]*)\s+([A-Za-z_][\w]*)\s*=\s*(\{[\s\S]*?\}|[^;]+?)\s*;/g;let s;for(;(s=n.exec(r))!==null;){const i=s[1],o=s[2],c=s[3];!i||!o||i==="return"||i==="const"||i==="struct"||a.push({name:o,cppType:i,...c!==void 0?{init:c.trim()}:{}})}return a}function Ue(e){const r=e.trim();if(!r.startsWith("{")||!r.endsWith("}"))return[];const a=r.slice(1,-1),n=[];let s=0,i="";for(let o=0;o<a.length;o++){const c=a[o];c==="{"?(s++,i+=c):c==="}"?(s--,i+=c):c===","&&s===0?(n.push(i.trim()),i=""):i+=c}return i.trim().length>0&&n.push(i.trim()),n}function Y(e){return Ue(e)}function Ve(e){const r=U(e),n=/\b(?:void|int|double|bool|char|string)\s+([A-Za-z_][\w]*)\s*\(\s*[A-Za-z_][\w]*\s*&\s*([A-Za-z_][\w]*)\s*\)/.exec(r);if(!n)return null;const s=n[1],i=n[2];if(!s||!i)return null;const o=n.index+n[0].length,c=r.slice(o),f=new RegExp(`\\b${s}\\s*\\(\\s*([A-Za-z_][\\w]*)\\s*\\)\\s*;`).exec(c);if(!f)return null;const u=f[1];return!u||u===i?null:{paramName:i,callerName:u}}function me(e){return{sizeConsts:He(e),structDefs:Ye(e),varDecls:Ze(e),passByRef:Ve(e)}}function xe(e,r){return/^\d+$/.test(e)?parseInt(e,10):r.find(n=>n.name===e)?.value}function Ge(e,r){if(r===null||r<1)return e;const a=e.split(`
`);if(r>a.length)return e;const n=r-1,s=a[n]??"";return s.startsWith("▶ ")?e:(a[n]=`▶ ${s}`,a.join(`
`))}function Qe(e){let r=1;for(let a=0;a<e.length;a++)e[a]===`
`&&r++;return r}function Je(e){const r=[];for(const[a,n]of Object.entries(e)){if(!n||n.length===0)continue;const s=n.slice(0,-1),i=n[n.length-1]??"";r.push({id:`mb_${a}`,name:a,type:"int",value:i,scope:"local",history:s})}return r}function Xe(e){const r=me(e.code),a=e.passByRef??r.passByRef??void 0,n=new Map;for(const o of r.structDefs){const c=o.fields.map(l=>{if(l.kind==="array"){const f=l.sizeRef?xe(l.sizeRef,r.sizeConsts)??5:5;return{name:l.name,kind:"array",size:f,cppType:l.cppType}}return{name:l.name,kind:"scalar",cppType:l.cppType}});n.set(o.name,c)}let s=[];if(e.varShapes&&e.varShapes.length>0)s=e.varShapes;else{const o=[];for(const u of r.varDecls){const p=n.get(u.cppType);p&&o.push({kind:"struct",name:u.name,structType:u.cppType,fields:p})}const c=new Set(o.map(u=>u.name)),l=e.variables.filter(u=>{const p=u.indexOf("."),m=p>=0?u.slice(0,p):u;return!c.has(m)}),f=ue(l);s=[...o,...f]}const i={};if(e.arrayInits)for(const o of e.arrayInits)i[o.name]=o.values;else for(const o of r.varDecls){const c=n.get(o.cppType);if(!c||!o.init)continue;const l=Y(o.init);for(let f=0;f<c.length&&f<l.length;f++){const u=c[f],p=l[f];if(!(!u||p===void 0)&&u.kind==="array"){const m=Y(p);m.length>0&&(i[`${o.name}.${u.name}`]=m)}}}return{shapes:s,arrayInits:i,passByRef:a}}function et({card:e,onComplete:r}){const a=d.useMemo(()=>Ke(e),[e]),n=d.useMemo(()=>Qe(e.code),[e.code]),s=d.useMemo(()=>Xe(e),[e]),[i,o]=d.useState({}),[c,l]=d.useState(""),[f,u]=d.useState(null),[p,m]=d.useState(null);d.useEffect(()=>{o({}),l(""),u(null),m(null)},[e.id]);const x=d.useCallback((R,I)=>{o($=>({...$,[R]:[...$[R]??[],I]}))},[]),b=d.useCallback(()=>{u(null),o({}),l(""),m(null)},[]),h=d.useCallback(()=>{u(R=>{if(R===null)return 1;if(R===-1)return-1;const I=R+1;return I>n?-1:I})},[n]),g=d.useCallback(()=>{u(-1)},[]),k=d.useCallback(()=>{const R=Je(i),I=Oe({variables:R,terminalText:c},a);m(I),I.pass&&r(!0)},[i,c,a,r]),y=d.useCallback(()=>m(null),[]),v=d.useMemo(()=>Ge(e.code,f===-1?null:f),[e.code,f]),E=d.useCallback(R=>{},[]),T=d.useMemo(()=>({display:"grid",gridTemplateColumns:"minmax(0, 1.2fr) minmax(0, 1fr)",gridTemplateRows:"auto 1fr auto",gridTemplateAreas:`
        "header   header"
        "code     panes"
        "footer   footer"
      `,gap:12,padding:12,width:"100%",maxWidth:1280,margin:"0 auto",minHeight:560}),[]);return t.jsxs("section",{className:"tc-root",role:"application","aria-label":"trace exercise","data-testid":"trace-card",style:T,children:[t.jsx("header",{className:"tc-header",style:{gridArea:"header"},children:t.jsx("div",{className:"tc-stem","aria-label":"trace prompt",children:e.stem})}),t.jsx("div",{className:"tc-code-pane",style:{gridArea:"code",minHeight:0,display:"flex"},children:t.jsx(A,{value:v,onChange:E,language:"cpp",readOnly:!0,ariaLabel:f&&f>0?`C++ trace, active line ${f}`:"C++ trace, code panel"})}),t.jsxs("div",{className:"tc-right-col",style:{gridArea:"panes",display:"grid",gridTemplateRows:"minmax(0, 1.6fr) minmax(0, 1fr)",gap:12,minHeight:0},children:[t.jsx("div",{className:"tc-vars-pane",style:{minHeight:0,overflow:"auto"},"aria-label":"memory diagram",children:t.jsx(fe,{shapes:s.shapes,history:i,arrayInits:s.arrayInits,passByRef:s.passByRef,editable:p?.pass!==!0,onAddValue:x,title:"memory (you fill this in)"})}),t.jsx("div",{className:"tc-term-pane",style:{minHeight:0,display:"flex",flexDirection:"column"},"aria-label":"terminal panel",children:t.jsx(tt,{value:c,onChange:l,readOnly:p?.pass===!0})})]}),t.jsxs("footer",{className:"tc-footer",style:{gridArea:"footer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12},children:[t.jsxs("div",{className:"tc-step-controls",role:"group","aria-label":"step controls",children:[t.jsxs("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:b,"aria-label":"reset trace to initial state",children:[t.jsx("span",{"aria-hidden":"true",children:"⏮"}),t.jsx("span",{className:"tc-btn-label",children:"reset"})]}),t.jsxs("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:h,"aria-label":"step to next line",disabled:f===-1,children:[t.jsx("span",{"aria-hidden":"true",children:"⏵"}),t.jsx("span",{className:"tc-btn-label",children:"step"})]}),t.jsxs("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:g,"aria-label":"run to end (skip line highlighting)",children:[t.jsx("span",{"aria-hidden":"true",children:"⏩"}),t.jsx("span",{className:"tc-btn-label",children:"run"})]})]}),t.jsxs("div",{className:"tc-submit-area",children:[p&&!p.pass&&t.jsx("button",{type:"button",className:"tc-btn tc-btn--ghost",onClick:y,"aria-label":"dismiss feedback and try again",children:"try again"}),t.jsx("button",{type:"button",className:"tc-btn tc-btn--primary",onClick:k,"aria-label":"submit trace for grading",disabled:p?.pass===!0,children:p?.pass?"passed":"submit"})]})]}),p&&t.jsx(nt,{grade:p,onTryAgain:y,teachMe:e.teachMe}),t.jsx("style",{children:at})]})}function tt({value:e,onChange:r,readOnly:a}){const n=e===""?[]:e.split(/\r\n?|\n/);return n.length>0&&n[n.length-1]===""&&n.pop(),t.jsxs("div",{className:"tc-term-wrap","aria-label":"predicted terminal output",children:[t.jsxs("div",{className:"tc-term-display",role:"region","aria-label":"output preview",children:[t.jsx("div",{className:"tc-term-label",children:"output"}),t.jsx("pre",{className:"tc-term-pre",children:n.length===0?t.jsx("span",{className:"tc-term-empty",children:"(no output yet)"}):n.map((s,i)=>t.jsx("div",{className:"tc-term-line",children:s||" "},i))})]}),t.jsx("textarea",{id:"tc-term-input",className:"tc-term-input",value:e,onChange:s=>r(s.target.value),readOnly:a,spellCheck:!1,autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",wrap:"off",rows:3,placeholder:"type predicted stdout here, one line per row","aria-label":"terminal input — type predicted stdout","aria-multiline":"true"})]})}function nt({grade:e,onTryAgain:r,teachMe:a}){return t.jsxs("div",{className:`tc-feedback ${e.pass?"tc-feedback--ok":"tc-feedback--fail"}`,role:"status","aria-live":"polite",children:[t.jsxs("header",{className:"tc-feedback-header",children:[t.jsx("strong",{children:e.pass?"✓ pass":"✗ not yet"}),!e.pass&&t.jsx("button",{type:"button",className:"tc-btn tc-btn--ghost tc-btn--small",onClick:r,"aria-label":"close feedback",children:"close"})]}),t.jsxs("section",{className:"tc-feedback-section",children:[t.jsx("h4",{children:"variables"}),t.jsx("ul",{className:"tc-var-results",children:e.varResults.map(n=>t.jsxs("li",{className:n.correct?"tc-var-ok":"tc-var-bad",children:[t.jsx("code",{children:n.name}),n.correct?t.jsxs("span",{"aria-label":"correct",children:[" ✓ ",n.actual]}):n.missing?t.jsxs("span",{"aria-label":"missing",children:[" ","✗ missing — expected ",t.jsx("code",{children:n.expected})]}):t.jsxs("span",{"aria-label":"incorrect",children:[" ","✗ got ",t.jsx("code",{children:n.actual||'""'}),", expected"," ",t.jsx("code",{children:n.expected})]})]},n.name))})]}),t.jsxs("section",{className:"tc-feedback-section",children:[t.jsx("h4",{children:"terminal"}),e.terminalCorrect?t.jsx("p",{children:t.jsx("span",{"aria-label":"correct",children:"✓ matches expected output"})}):t.jsx("pre",{className:"tc-term-diff","aria-label":"terminal diff",children:e.terminalDiff||"(no diff)"})]}),!e.pass&&a&&t.jsxs("details",{className:"tc-teach-me",children:[t.jsx("summary",{children:"teach me"}),t.jsx("pre",{className:"tc-teach-me-body",children:a})]})]})}const at=`
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
  justify-content: flex-start;
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
.tc-btn--ghost { background: transparent; }
.tc-btn--small { font-size: 10px; padding: 3px 8px; }
.tc-btn-label { letter-spacing: 0.04em; }

.tc-term-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
}
.tc-term-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 8px 10px;
  flex: 1;
  min-height: 0;
}
.tc-term-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.tc-term-pre {
  margin: 0;
  flex: 1;
  font-family: inherit;
  font-size: 12px;
  color: var(--accent-grn, #7ee787);
  white-space: pre-wrap;
  overflow: auto;
}
.tc-term-line {
  min-height: 16px;
}
.tc-term-empty {
  color: var(--text-2, #6e7681);
  font-style: italic;
}
.tc-term-input {
  background: var(--bg-0, #0d1117);
  border: 1px dashed var(--border-1, #30363d);
  border-radius: 3px;
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 10px;
  resize: vertical;
  min-height: 56px;
  outline: 0;
}
.tc-term-input:focus-visible {
  border-style: solid;
  border-color: var(--accent-cyan, #79c0ff);
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
`,rt=["identifier","number","string"],st=new Set(["main","cout","cin","endl","std"]);function it(e,r,a){let n=rt,s={};Array.isArray(r)&&(n=r.filter(m=>["keyword","identifier","string","number","comment","operator","punctuation","whitespace"].includes(m)),s={});const i=s.placeholder??"___",o=new Set([...st,...s.keepTokens??[]]),c=new Set(n),l=W(e),f=l.map(m=>!c.has(m.type)||m.type==="identifier"&&(o.has(m.value)||oe.has(m.value))?m.value:i),u=[];let p=0;for(;p<f.length;){const m=f[p]??"";if(u.push(m),m===i){let x=p+1,b="";for(;x<f.length&&f[x]!==i&&l[x]?.type==="whitespace"&&!f[x]?.includes(`
`);)b+=f[x]??"",x++;if(x<f.length&&f[x]===i&&b.length>0){u.push(b),u.push(i),p=x+1;continue}}p++}return u.join("")}const ot=["<<=",">>=","==","!=","<=",">=","&&","||","++","--","+=","-=","*=","/=","%=","<<",">>","->","::"],ct=["=","<",">","+","-","*","/","%","&","|","!","^","~","?"];function ae(e){let r=e.replace(/\t/g,"    ");for(const a of ot){const n=a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");r=r.replace(new RegExp(`\\s*${n}\\s*`,"g"),a)}for(const a of ct){const n=a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");r=r.replace(new RegExp(`\\s*${n}\\s*`,"g"),a)}return r=r.replace(/\s+/g," ").trim(),r}function be(e,r){const a=e.split(`
`);return r.split(`
`).map((s,i)=>{const o=a[i];return o===void 0?!1:ae(o)===ae(s)})}function lt(e,r){const a=be(e,r),n=a.findIndex(l=>!l),s=e.split(`
`),i=r.split(`
`);let o=!1;for(let l=i.length;l<s.length;l++)if((s[l]??"").trim().length>0){o=!0;break}return{ok:n===-1&&!o,matched:a,firstMismatch:n}}function dt(e){let r=0,a=0,n=!1,s=null;for(;a<e.length;){const i=e[a],o=e[a+1];if(n){i===`
`&&(n=!1),a++;continue}if(s){if(i==="\\"){a+=2;continue}i===s&&(s=null),a++;continue}if(i==="/"&&o==="/"){n=!0,a+=2;continue}if(i==='"'||i==="'"){s=i,a++;continue}i==="{"?r++:i==="}"&&r--,a++}return r}const re="✓",pt="✗";function Jt({card:e,onComplete:r,mode:a,studySeconds:n=5,skeletonOverride:s}){const[i,o]=d.useState("STUDY"),[c,l]=d.useState(""),[f,u]=d.useState(n),[p,m]=d.useState(!1),[x,b]=d.useState(null),h=d.useRef(null),g=e.canonicalAnswer,k=d.useMemo(()=>s!==void 0?s:it(e.template??g),[s,e.template,g]),y=d.useMemo(()=>be(c,g),[c,g]),v=g.split(`
`).length,E=y.filter(Boolean).length,T=d.useMemo(()=>dt(c),[c]),R=d.useMemo(()=>{if(a!=="line-by-line")return-1;const z=y.findIndex(w=>!w);return z===-1?v:z},[a,y,v]);d.useEffect(()=>{if(i!=="STUDY"||n<=0)return;u(n);const z=Date.now(),w=window.setInterval(()=>{const S=(Date.now()-z)/1e3,C=Math.max(0,n-S);u(C),C<=0&&(window.clearInterval(w),o("HIDE"))},100);return()=>window.clearInterval(w)},[i,n]),d.useEffect(()=>{i==="TYPE"&&requestAnimationFrame(()=>h.current?.focus())},[i]);const I=d.useCallback(()=>{const z=lt(c,g);b({ok:z.ok,firstMismatch:z.firstMismatch}),o("GRADED"),r(z.ok)},[c,g,r]),$=d.useCallback(()=>{m(!0)},[]),q=d.useCallback(()=>{m(!1),i==="STUDY"?o("HIDE"):i==="HIDE"?o("TYPE"):i==="TYPE"&&I()},[i,I]),j=d.useCallback(()=>m(!1),[]),_=d.useCallback(z=>{if(z.key==="Escape"){if(z.preventDefault(),i==="GRADED")return;$()}},[i,$]),N=(z,w)=>t.jsxs("header",{className:"trc-header",children:[t.jsx("h2",{className:"trc-stage",children:z}),w?t.jsx("p",{className:"trc-sub",children:w}):null]}),M=t.jsxs("div",{role:"status","aria-live":"polite",className:"trc-sr-only",children:["Stage: ",i,". ",i==="TYPE"?`${E} of ${v} lines matched.`:""]});return t.jsxs("div",{className:"trc-root","data-stage":i,onKeyDown:_,tabIndex:-1,"aria-label":`Template recall card: ${e.stem}`,children:[t.jsx("style",{children:ft}),t.jsx("div",{className:"trc-prompt",children:t.jsx("p",{children:e.prompt})}),M,i==="STUDY"&&t.jsxs("section",{"aria-labelledby":"trc-h-study",children:[N("Stage 1 — STUDY",n>0?`Read the canonical code. Auto-advance in ${f.toFixed(1)}s.`:"Read the canonical code. Press [I'm ready] when memorized."),t.jsx("div",{className:"trc-editor-wrap",children:t.jsx(A,{value:g,onChange:()=>{},language:"cpp",readOnly:!0,ariaLabel:"Canonical code (study)"})}),t.jsxs("div",{className:"trc-actions",children:[t.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:()=>o("HIDE"),children:"I'm ready"}),t.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:$,children:"Skip (Esc)"})]})]}),i==="HIDE"&&t.jsxs("section",{"aria-labelledby":"trc-h-hide",children:[N("Stage 2 — HIDE","Commit the shape. Names hidden. Press [Recall] to type."),t.jsx("div",{className:"trc-editor-wrap trc-skeleton",children:t.jsx(A,{value:k,onChange:()=>{},language:"cpp",readOnly:!0,ariaLabel:"Skeleton hint (structure preserved, names hidden)"})}),t.jsxs("div",{className:"trc-actions",children:[t.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:()=>o("TYPE"),children:"Recall"}),t.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:$,children:"Skip (Esc)"})]})]}),i==="TYPE"&&t.jsxs("section",{"aria-labelledby":"trc-h-type",children:[N(a==="line-by-line"?"Stage 3 — TYPE (line by line)":"Stage 3 — TYPE (all at once)","Reproduce the canonical code. Ticks appear as each line matches."),t.jsxs("div",{className:"trc-type-grid",children:[t.jsx("ul",{className:"trc-tick-col","aria-hidden":"true",children:Array.from({length:Math.max(v,1)}).map((z,w)=>{const S=y[w]===!0,C=a==="line-by-line"&&w===R;return t.jsx("li",{className:`trc-tick ${S?"trc-tick-ok":C?"trc-tick-active":"trc-tick-pending"}`,children:S?re:C?"▸":""},w)})}),t.jsx("div",{className:"trc-editor-wrap",children:t.jsx(A,{ref:h,value:c,onChange:l,language:"cpp",ariaLabel:`Type your answer. ${E} of ${v} lines match.`,placeholder:"Type the canonical code here…"})})]}),t.jsxs("div",{className:"trc-meta",children:[t.jsxs("span",{className:`trc-counter ${T===0?"trc-counter-ok":"trc-counter-bad"}`,children:["braces: ",T>=0?"+":"",T]}),t.jsxs("span",{className:"trc-counter",children:["lines: ",E,"/",v]})]}),t.jsxs("div",{className:"trc-actions",children:[t.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:I,children:"Submit"}),t.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:$,children:"Give up (Esc)"})]})]}),i==="GRADED"&&x&&t.jsxs("section",{"aria-labelledby":"trc-h-graded",children:[N(x.ok?"PASS ✓":"FAIL ✗",x.ok?"Verbatim match. Move on.":`First mismatch at line ${x.firstMismatch+1}. See diff below.`),!x.ok&&t.jsxs("div",{className:"trc-diff","aria-label":"Diff: your answer vs canonical",children:[t.jsxs("div",{className:"trc-diff-col",children:[t.jsx("h3",{children:"Your answer"}),t.jsx("pre",{className:"trc-diff-pre",children:c.split(`
`).map((z,w)=>t.jsxs("div",{className:y[w]?"trc-diff-ok":"trc-diff-bad",children:[t.jsx("span",{className:"trc-diff-mark",children:y[w]?re:pt})," ",z||" "]},w))})]}),t.jsxs("div",{className:"trc-diff-col",children:[t.jsx("h3",{children:"Canonical"}),t.jsx("pre",{className:"trc-diff-pre",children:g.split(`
`).map((z,w)=>t.jsx("div",{children:z||" "},w))})]})]}),e.explanation&&t.jsxs("details",{className:"trc-explanation",children:[t.jsx("summary",{children:"Why this shape?"}),t.jsx("p",{children:e.explanation})]})]}),p&&t.jsx("div",{role:"alertdialog","aria-modal":"true","aria-labelledby":"trc-skip-h",className:"trc-modal",children:t.jsxs("div",{className:"trc-modal-card",children:[t.jsx("h3",{id:"trc-skip-h",children:"Skip this stage?"}),t.jsx("p",{children:i==="STUDY"?"You won't see the canonical again until you've graded.":i==="HIDE"?"You'll go straight to typing without the structure hint.":"Submitting now will grade your current answer."}),t.jsxs("div",{className:"trc-actions",children:[t.jsx("button",{type:"button",className:"trc-btn trc-btn-primary",onClick:q,autoFocus:!0,children:"Skip"}),t.jsx("button",{type:"button",className:"trc-btn trc-btn-ghost",onClick:j,children:"Cancel"})]})]})})]})}const ft=`
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
`;function L(e){let r=e.replace(/\t/g,"    ");return r=r.replace(/[ \t]+/g," "),r=r.split(`
`).map(a=>a.trim()).filter(a=>a.length>0).join(`
`),r=r.replace(/\s*([{};,()<>=+\-*/\[\]])\s*/g,"$1"),r.trim()}function ut(e,r){if(e===r)return 1;if(e.length===0||r.length===0)return 0;const a=e.length,n=r.length;let s=new Array(n+1),i=new Array(n+1);for(let c=0;c<=n;c++)s[c]=c;for(let c=1;c<=a;c++){i[0]=c;for(let l=1;l<=n;l++){const f=e[c-1]===r[l-1]?0:1;i[l]=Math.min((s[l]??0)+1,(i[l-1]??0)+1,(s[l-1]??0)+f)}[s,i]=[i,s]}const o=s[n]??0;return Math.max(0,1-o/Math.max(a,n))}function V(e,r,a){let n=0,s=0,i=!1,o=!1,c=!1,l=!1;for(let f=0;f<e.length;f++){const u=e[f],p=e[f+1];if(c){u===`
`&&(c=!1);continue}if(l){u==="*"&&p==="/"&&(l=!1,f++);continue}if(i){if(u==="\\"&&p!==void 0){f++;continue}u==='"'&&(i=!1);continue}if(o){if(u==="\\"&&p!==void 0){f++;continue}u==="'"&&(o=!1);continue}if(u==="/"&&p==="/"){c=!0,f++;continue}if(u==="/"&&p==="*"){l=!0,f++;continue}if(u==='"'){i=!0;continue}if(u==="'"){o=!0;continue}u===r?n++:u===a&&s++}return[n,s]}function se(e,r){const a=e.indexOf(r);if(a===-1)return;let n=1;for(let s=0;s<a;s++)e[s]===`
`&&n++;return n}function ie(e,r){const a=e.split(`
`),n=r.split(`
`),s=Math.max(a.length,n.length),i=[];for(let o=0;o<s;o++){const c=a[o]??"",l=n[o]??"";i.push({line:o+1,studentLine:c,canonicalLine:l,match:L(c)===L(l)})}return i}function O(e,r){const a=[];if(e.trim().length===0)return{pass:!1,score:0,errors:[{kind:"empty",message:"You haven’t written anything yet — start with `struct`."}],diff:ie("",r.canonicalAnswer)};const[n,s]=V(e,"{","}");n!==s&&a.push({kind:"brace-imbalance",expected:String(n),actual:String(s),message:n>s?`Missing ${n-s} closing brace${n-s>1?"s":""} \`}\`.`:`Extra ${s-n} closing brace${s-n>1?"s":""} \`}\`.`});const[i,o]=V(e,"(",")");i!==o&&a.push({kind:"paren-imbalance",expected:String(i),actual:String(o),message:`Unbalanced parentheses (${i} \`(\` vs ${o} \`)\`).`});const[c,l]=V(e,"[","]");c!==l&&a.push({kind:"bracket-imbalance",expected:String(c),actual:String(l),message:`Unbalanced square brackets (${c} \`[\` vs ${l} \`]\`).`});const f=r.requireSemicolon??!0;if(f&&!e.includes(";")&&a.push({kind:"missing-semicolon",message:"No `;` found. Struct/function bodies need at least one."}),f&&/struct\s+\w+/.test(e)){const v=e.lastIndexOf("}");if(v!==-1&&!e.slice(v+1).trim().startsWith(";")){const T=se(e,"}"),R={kind:"missing-semicolon",expected:"};",actual:"}",message:"Missing `;` after the closing `}` — struct definitions need `};`."};T!==void 0&&(R.line=T),a.push(R)}}for(const v of r.forbiddenTokens??[])if(e.includes(v)){const E=se(e,v),T={kind:"forbidden-token",actual:v,message:`Don’t use \`${v}\` here.`};E!==void 0&&(T.line=E),a.push(T)}const u=L(e);for(const v of r.keyChecks??[]){const E=L(v);u.includes(E)||a.push({kind:"missing-keycheck",expected:v,message:`Missing required token: \`${v}\`.`})}const p=L(r.canonicalAnswer),m=ut(u,p);m<.85&&a.push({kind:"char-mismatch",expected:r.canonicalAnswer,actual:e,message:`Code shape doesn’t match the canonical solution (${Math.round(m*100)}% similar).`});const x=r.keyChecks?.length??0,b=x-a.filter(v=>v.kind==="missing-keycheck").length,h=x===0?1:b/x,g=(a.some(v=>v.kind==="brace-imbalance")?0:1)*(a.some(v=>v.kind==="paren-imbalance")?0:1)*(a.some(v=>v.kind==="missing-semicolon")?0:1)*(a.some(v=>v.kind==="forbidden-token")?0:1),k=Math.round(m*60+h*25+g*15);return{pass:!a.some(v=>v.kind==="forbidden-token"||v.kind==="missing-keycheck"||v.kind==="brace-imbalance"||v.kind==="missing-semicolon"||v.kind==="empty")&&m>=.85,score:k,errors:a,diff:ie(e,r.canonicalAnswer)}}function Xt({card:e,onComplete:r,showSkeleton:a=!1}){const[n,s]=d.useState(""),[i,o]=d.useState(null),c=d.useRef(null),l=d.useId(),f=d.useId(),u=e.requiredFields??[],p=d.useCallback(()=>{const b=O(n,{canonicalAnswer:e.canonicalAnswer,keyChecks:e.keyChecks,forbiddenTokens:e.forbiddenTokens,requireSemicolon:!0});o(b),r(b.pass)},[n,e,r]),m=d.useCallback(()=>{o(null),s(""),requestAnimationFrame(()=>c.current?.focus())},[]),x=i?i.pass?"Pass":i.errors[0]?.message??"Not quite — review the diff below.":"";return t.jsxs("div",{className:"swc-root",children:[t.jsx("style",{children:ht}),t.jsxs("div",{className:"swc-stack",children:[t.jsxs("section",{className:"swc-prompt","aria-labelledby":`${f}-title`,children:[t.jsx("h2",{id:`${f}-title`,className:"swc-stem",children:e.stem}),t.jsxs("div",{className:"swc-entity",children:[t.jsx("p",{children:e.prompt}),u.length>0&&t.jsxs(t.Fragment,{children:[t.jsx("h3",{children:"Required fields"}),t.jsx("ul",{children:u.map(b=>t.jsx("li",{children:t.jsx("code",{children:b})},b))})]})]})]}),t.jsxs("section",{className:"swc-editor","aria-label":"Your struct definition",children:[a&&t.jsxs("div",{className:"swc-hint","aria-label":"Skeleton hint",children:[t.jsx("pre",{children:t.jsx("code",{children:`struct ___ {
    ___;
    ___;
    ___;
};`})}),t.jsxs("p",{className:"swc-hint-note",children:["Skeleton hint — replace each ",t.jsx("code",{children:"___"})," with the right type + field name. You can also type from a blank page."]})]}),t.jsx(A,{ref:c,value:n,onChange:s,language:"cpp",ariaLabel:`Struct write editor — ${e.stem}`,placeholder:"// Type the struct definition here…",readOnly:i!==null}),t.jsx("div",{className:"swc-actions",children:i===null?t.jsx("button",{type:"button",onClick:p,disabled:n.trim().length===0,className:"swc-btn swc-btn--primary","aria-describedby":l,children:"Submit"}):t.jsx("button",{type:"button",onClick:m,className:"swc-btn swc-btn--secondary",children:"Retry"})})]})]}),t.jsx("div",{id:l,className:"swc-grade",role:"status","aria-live":"polite","aria-atomic":"true",children:i&&t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:`swc-banner${i.pass?" swc-banner--pass":" swc-banner--fail"}`,children:[t.jsx("strong",{children:i.pass?"Pass":"Not yet"}),t.jsxs("span",{className:"swc-score",children:[i.score,"/100"]}),t.jsx("span",{className:"swc-headline",children:x})]}),i.errors.length>0&&t.jsx("ul",{className:"swc-errors",children:i.errors.map((b,h)=>t.jsx("li",{children:t.jsx(mt,{err:b})},`${b.kind}-${h}`))}),t.jsx(bt,{diff:i.diff}),t.jsxs("details",{className:"swc-explain",children:[t.jsx("summary",{children:"Why?"}),t.jsx("p",{children:e.explanation})]})]})})]})}function mt({err:e}){return t.jsxs("span",{className:"swc-error-row",children:[t.jsx("span",{className:`swc-tag swc-tag--${e.kind}`,children:xt(e.kind)}),t.jsx("span",{className:"swc-error-msg",children:e.message}),e.line!==void 0&&t.jsxs("span",{className:"swc-line",children:["line ",e.line]})]})}function xt(e){switch(e){case"brace-imbalance":return"braces";case"paren-imbalance":return"parens";case"bracket-imbalance":return"brackets";case"missing-semicolon":return"semicolon";case"forbidden-token":return"forbidden";case"missing-keycheck":return"missing";case"char-mismatch":return"shape";case"empty":return"empty"}}function bt({diff:e}){return t.jsxs("table",{className:"swc-diff","aria-label":"Per-line comparison",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{scope:"col",children:"#"}),t.jsx("th",{scope:"col",children:"Your code"}),t.jsx("th",{scope:"col",children:"Canonical"}),t.jsx("th",{scope:"col","aria-label":"Match",children:"✓"})]})}),t.jsx("tbody",{children:e.map(r=>t.jsxs("tr",{className:r.match?"swc-diff-row--ok":"swc-diff-row--bad",children:[t.jsx("td",{children:r.line}),t.jsx("td",{children:t.jsx("code",{children:r.studentLine||" "})}),t.jsx("td",{children:t.jsx("code",{children:r.canonicalLine||" "})}),t.jsx("td",{"aria-label":r.match?"match":"differ",children:r.match?"✓":"✗"})]},r.line))})]})}const ht=`
.swc-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--text-0, #e6edf3);
  font-family: var(--font-sans, system-ui, sans-serif);
}
.swc-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.swc-prompt {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.swc-stem {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  color: var(--text-0, #e6edf3);
  font-weight: 500;
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
  border: 1px dashed var(--accent-cyan, #79c0ff);
  border-radius: 6px;
  padding: 10px 12px;
  background: rgba(121, 192, 255, 0.04);
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
`;function Z(e){return e.split(`
`).map(r=>r.replace(/[ \t]+$/g,"").replace(/[ \t]+/g," ")).join(`
`).trim()}const gt=["void","&","[]","int"];function vt(e,r){const a=Z(e),n=Z(r),s=gt.map(p=>({token:p,ok:a.includes(p)})),i=a===n,o=s.every(p=>p.ok),c=i&&o;let l="";i?l=`= ${a}`:l=`- ${n}
+ ${a}`;const f=s.find(p=>!p.ok);let u="Signature matches the canonical form.";return c||(f?u=yt(f.token):u="Signature has all the required tokens but does not match the canonical form character-for-character (after whitespace normalization). Compare the diff above."),{ok:c,tokenChecks:s,diff:l,explanation:u}}function yt(e){switch(e){case"void":return"Q3's read function must return `void` — it fills the array via reference instead of returning anything.";case"&":return"The array parameter must be passed BY REFERENCE (`&`) — without it, the function writes into a copy and the caller's array stays empty.";case"[]":return"The parameter is an array — declare it with `[]` after the name (e.g. `Computer &list[]`).";case"int":return"You also need an `int n` parameter so the function knows how many records to read.";default:return`Missing required token: ${e}`}}function wt(e,r,a){const n=Z(e),s=r.map(u=>({needle:u,ok:n.includes(Z(u))})),i=a.filter(u=>new RegExp(`\\b${kt(u)}\\b`).test(n)),o=s.every(u=>u.ok),c=i.length===0,l=o&&c;let f="Body covers every required pattern.";return l||(o?i.length>0&&(f=`Body contains forbidden token(s): ${i.map(u=>"`"+u+"`").join(", ")}. Q3 read functions only use cin (no cout, no return value).`):f=`Body is missing the pattern \`${s.find(p=>!p.ok).needle}\` — Q3 always reads each field with \`cin >>\` inside a counted \`for\` loop.`),{ok:l,keyCheckResults:s,forbiddenHits:i,explanation:f}}function kt(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function jt(e){const r=e.replace(/\r\n/g,`
`).split(`
`),a=r[0]??"",n=r.findIndex((o,c)=>c>0&&o.trim()==="{");let s=-1;for(let o=r.length-1;o>=0;o--)if(r[o].trim()==="}"){s=o;break}if(n===-1||s===-1||s<=n)return{signature:a,openBrace:"{",body:"",closeBrace:"}"};const i=r.slice(n+1,s);return{signature:a,openBrace:r[n]??"{",body:i.join(`
`),closeBrace:r[s]??"}"}}function en({card:e,onComplete:r,structContext:a}){const n=d.useMemo(()=>jt(e.canonicalAnswer),[e]),s=d.useMemo(()=>[n.signature,n.openBrace,"    ",n.closeBrace,""].join(`
`),[n]),[i,o]=d.useState(s);d.useEffect(()=>o(s),[s]);const[c,l]=d.useState(null),f=d.useRef(null),u=d.useRef(null),p=d.useCallback(b=>{const h=b.replace(/\r\n/g,`
`).split(`
`);let g=h.findIndex(v=>v.trim()===n.signature.trim());g===-1&&(g=0);let k=-1;for(let v=g;v<h.length;v++)if(h[v].trim()==="{"){k=v;break}let y=-1;for(let v=h.length-1;v>=0;v--)if(h[v].trim()==="}"){y=v;break}return k===-1||y===-1||y<=k?b:h.slice(k+1,y).join(`
`)},[n]),m=d.useCallback(b=>b.replace(/\r\n/g,`
`).split(`
`).find(k=>k.trim()!=="")??"",[]),x=d.useCallback(()=>{const b=m(i),h=p(i),g=vt(b,n.signature),k=wt(h,e.keyChecks,e.forbiddenTokens),y=g.ok&&k.ok;l({sig:g,body:k,overall:y}),r(y)},[i,p,m,n.signature,e.keyChecks,e.forbiddenTokens,r]);return d.useEffect(()=>{const b=h=>{(h.ctrlKey||h.metaKey)&&h.key==="Enter"&&(h.preventDefault(),x())};return window.addEventListener("keydown",b),()=>window.removeEventListener("keydown",b)},[x]),t.jsxs("div",{className:"fwc-root",children:[t.jsx("style",{children:Nt}),t.jsxs("div",{className:"fwc-stack",children:[t.jsxs("section",{className:"fwc-spec",role:"region","aria-label":"Question specification",children:[t.jsx("p",{className:"fwc-prompt",children:e.prompt}),t.jsx("h3",{className:"fwc-h-sub",children:"Function signature (given)"}),t.jsx("pre",{className:"fwc-readonly fwc-sig-line",children:n.signature}),a?t.jsxs(t.Fragment,{children:[t.jsx("h3",{className:"fwc-h-sub",children:"Given struct"}),t.jsx("pre",{className:"fwc-readonly",children:a})]}):null]}),t.jsxs("section",{className:"fwc-right",role:"region","aria-label":"Code editor — write the function body",children:[t.jsx("div",{className:"fwc-editor-wrap",children:t.jsx(A,{ref:f,value:i,onChange:o,language:"cpp",ariaLabel:"C++ function body editor — type the for-loop and cin reads here",showBraceMatch:!0,lineNumbers:!0})}),t.jsx("div",{className:"fwc-toolbar",role:"group","aria-label":"Editor toolbar",children:t.jsx("button",{ref:u,type:"button",className:"fwc-submit",onClick:x,"aria-label":"Submit function (Ctrl+Enter)",children:"Submit (Ctrl+Enter)"})})]})]}),c?t.jsxs("div",{className:`fwc-feedback ${c.overall?"ok":"bad"}`,role:"status","aria-live":"polite",children:[t.jsx("h3",{className:"fwc-h-sub",children:c.overall?"Pass":"Needs fixing"}),t.jsxs("div",{className:"fwc-fb-section",children:[t.jsx("strong",{children:"Signature:"})," ",c.sig.ok?"matches canonical.":"mismatch.",t.jsx("ul",{className:"fwc-token-list","aria-label":"Required signature tokens",children:c.sig.tokenChecks.map(b=>t.jsxs("li",{className:b.ok?"ok":"bad",children:[t.jsx("code",{children:b.token})," ",t.jsx("span",{className:"fwc-mark",children:b.ok?"ok":"missing"})]},b.token))}),c.sig.ok?null:t.jsx("pre",{className:"fwc-diff",children:c.sig.diff}),t.jsx("p",{className:"fwc-explain",children:c.sig.explanation})]}),t.jsxs("div",{className:"fwc-fb-section",children:[t.jsx("strong",{children:"Body:"})," ",c.body.ok?"all key patterns present.":"missing patterns.",t.jsx("ul",{className:"fwc-token-list","aria-label":"Required body patterns",children:c.body.keyCheckResults.map(b=>t.jsxs("li",{className:b.ok?"ok":"bad",children:[t.jsx("code",{children:b.needle})," ",t.jsx("span",{className:"fwc-mark",children:b.ok?"ok":"missing"})]},b.needle))}),c.body.forbiddenHits.length>0?t.jsxs("p",{className:"fwc-forbidden",children:["Forbidden token(s) found:"," ",c.body.forbiddenHits.map(b=>t.jsx("code",{children:b},b))]}):null,t.jsx("p",{className:"fwc-explain",children:c.body.explanation})]}),t.jsxs("details",{className:"fwc-canon",children:[t.jsx("summary",{children:"Show canonical answer"}),t.jsx("pre",{className:"fwc-readonly",children:e.canonicalAnswer}),t.jsx("p",{className:"fwc-explain",children:e.explanation})]})]}):null]})}const Nt=`
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

.fwc-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fwc-spec {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 16px;
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
  justify-content: flex-end;
  align-items: center;
  padding: 4px 0;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
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

`;function K(e){let r=e.toLowerCase();return r=r.replace(/\t/g,"    ").replace(/\s+/g," "),r=r.replace(/\s*(>>|<<|>=|<=|!=|==|\+=|-=|\*=|\/=|%=|&&|\|\|)\s*/g,"$1"),r=r.replace(/\s*([=<>+\-*/%&|!])\s*/g,"$1"),r.trim()}function St(e,r){const a=r.extractor?e.match(r.extractor)?.[0]??"":e,n=K(a),s=[];for(const o of r.mustInclude)n.includes(K(o))||s.push(o);const i=[];for(const o of r.mustNotInclude??[])n.includes(K(o))&&i.push(o);return{id:r.id,label:r.label,pass:s.length===0&&i.length===0,missing:s,forbiddenHit:i}}function Ct(e,r){const a=K(e),n=[];for(const s of r)a.includes(K(s))||n.push(s);return{pass:n.length===0,missing:n}}function tn({card:e,extras:r,onComplete:a}){const n=r?.scaffold??"",[s,i]=d.useState(n),[o,c]=d.useState(!1),[l,f]=d.useState(null),u=e.id;d.useEffect(()=>{i(r?.scaffold??""),c(!1),f(null)},[u,r?.scaffold]);const p=d.useRef(null),m=d.useCallback(()=>{const h=O(s,{canonicalAnswer:e.canonicalAnswer,keyChecks:e.keyChecks,forbiddenTokens:e.forbiddenTokens,requireSemicolon:!0}),g=(r?.sections??[]).map(E=>St(s,E)),k=Ct(s,r?.structuralRequired??[]);f({overall:h,sections:g,structural:k}),c(!0);const y=g.every(E=>E.pass),v=h.pass&&y&&k.pass;a(v)},[s,e.canonicalAnswer,e.keyChecks,e.forbiddenTokens,r?.sections,r?.structuralRequired,a]),x=d.useCallback(()=>{i(r?.scaffold??""),c(!1),f(null)},[r?.scaffold]),b=d.useMemo(()=>{if(!l)return"";const h=[];h.push(l.overall.pass&&l.sections.every(g=>g.pass)&&l.structural.pass?"All sections passed.":`${l.sections.filter(g=>!g.pass).length+(l.structural.pass?0:1)} section${l.sections.filter(g=>!g.pass).length+(l.structural.pass?0:1)===1?"":"s"} failed.`);for(const g of l.sections)h.push(`${g.label}: ${g.pass?"pass":"fail"}.`);return r?.structuralRequired?.length&&h.push(`Structure: ${l.structural.pass?"pass":"fail"}.`),h.join(" ")},[l,r?.structuralRequired]);return t.jsxs("div",{className:"mwc-root",role:"group","aria-label":"Main-function writing exercise",children:[t.jsx("style",{children:zt}),t.jsxs("section",{className:"mwc-spec-block","aria-label":"Exercise specification and prior context",children:[t.jsx("p",{className:"mwc-prompt",children:e.prompt}),r?.contextStruct&&t.jsxs("div",{className:"mwc-context","aria-label":"Previously-defined struct (read-only)",children:[t.jsx("h3",{className:"mwc-h3",children:"Struct (already defined)"}),t.jsx("pre",{className:"mwc-context-code",children:t.jsx("code",{children:r.contextStruct})})]}),r?.contextReadFn&&t.jsxs("div",{className:"mwc-context","aria-label":"Previously-defined read function (read-only)",children:[t.jsx("h3",{className:"mwc-h3",children:"Read function (already defined)"}),t.jsx("pre",{className:"mwc-context-code",children:t.jsx("code",{children:r.contextReadFn})})]})]}),t.jsxs("main",{className:"mwc-right","aria-label":"Main-function editor",children:[t.jsx("div",{className:"mwc-editor-shell",children:t.jsx(A,{value:s,onChange:i,language:"cpp",ariaLabel:"Write your int main() function here",placeholder:"// Write int main() { … } below",lineNumbers:!0,showBraceMatch:!0})}),t.jsx("div",{className:"mwc-actions",children:o?t.jsx("button",{type:"button",className:"mwc-btn mwc-btn-secondary",onClick:x,"aria-label":"Reset and try again",children:"Try again"}):t.jsx("button",{type:"button",className:"mwc-btn mwc-btn-primary",onClick:m,"aria-label":"Submit your main() for grading",children:"Submit (Ctrl+Enter)"})}),t.jsx("div",{ref:p,className:"mwc-sr-only","aria-live":"polite","aria-atomic":"true",children:b}),o&&l&&t.jsxs("section",{className:"mwc-feedback","aria-label":"Sectional grading feedback",children:[t.jsx("h3",{className:"mwc-h3",children:l.overall.pass&&l.sections.every(h=>h.pass)&&l.structural.pass?"All sections passed":"Some sections failed"}),t.jsxs("ul",{className:"mwc-section-list",children:[l.sections.map(h=>t.jsxs("li",{className:`mwc-section-row ${h.pass?"pass":"fail"}`,"aria-label":`${h.label}: ${h.pass?"pass":"fail"}`,children:[t.jsx("span",{className:"mwc-section-icon","aria-hidden":"true",children:h.pass?"[OK]":"[X]"}),t.jsx("span",{className:"mwc-section-label",children:h.label}),!h.pass&&h.missing.length>0&&t.jsxs("span",{className:"mwc-section-missing",children:["missing: ",h.missing.map(g=>`\`${g}\``).join(", ")]}),!h.pass&&h.forbiddenHit.length>0&&t.jsxs("span",{className:"mwc-section-forbidden",children:["forbidden: ",h.forbiddenHit.map(g=>`\`${g}\``).join(", ")]})]},h.id)),r?.structuralRequired&&r.structuralRequired.length>0&&t.jsxs("li",{className:`mwc-section-row ${l.structural.pass?"pass":"fail"}`,"aria-label":`Top-level structure: ${l.structural.pass?"pass":"fail"}`,children:[t.jsx("span",{className:"mwc-section-icon","aria-hidden":"true",children:l.structural.pass?"[OK]":"[X]"}),t.jsx("span",{className:"mwc-section-label",children:"Top-level structure"}),!l.structural.pass&&t.jsxs("span",{className:"mwc-section-missing",children:["missing:"," ",l.structural.missing.map(h=>`\`${h}\``).join(", ")]})]})]}),l.overall.errors.length>0&&t.jsxs("details",{className:"mwc-overall-errors",children:[t.jsxs("summary",{children:["Other findings (",l.overall.errors.length,")"]}),t.jsx("ul",{children:l.overall.errors.map((h,g)=>t.jsxs("li",{children:[t.jsx("strong",{children:h.kind}),": ",h.message]},g))})]}),t.jsxs("details",{className:"mwc-explanation",open:!0,children:[t.jsx("summary",{children:"Explanation"}),t.jsx("p",{children:e.explanation})]})]})]})]})}const zt=`
.mwc-root {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  font-family: var(--font-sans, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
  min-height: 100%;
}

.mwc-h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
  color: var(--text-1, #8b949e);
}

.mwc-spec-block {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mwc-spec-block .mwc-prompt {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-0, #e6edf3);
  white-space: pre-wrap;
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
`;function Et(e){const r=[],a=/_{3,}/g;let n=0,s=0,i;for(;(i=a.exec(e))!==null;)i.index>n&&r.push({kind:"text",value:e.slice(n,i.index)}),r.push({kind:"blank",value:"",blankIdx:s++}),n=i.index+i[0].length;return n<e.length&&r.push({kind:"text",value:e.slice(n)}),s===0&&(r.push({kind:"text",value:`
`}),r.push({kind:"blank",value:"",blankIdx:0})),r}function nn({card:e,onComplete:r}){const a=d.useMemo(()=>Et(e.code),[e.code]),n=a.filter(x=>x.kind==="blank").length,[s,i]=d.useState(()=>new Array(n).fill("")),[o,c]=d.useState(null),l=d.useRef(null);d.useEffect(()=>{i(new Array(n).fill("")),c(null),requestAnimationFrame(()=>l.current?.focus())},[e.id,n]);const f=d.useCallback((x,b)=>{i(h=>{const g=h.slice();return g[x]=b,g})},[]),u=d.useCallback(()=>{const x=a.map(v=>v.kind==="blank"?s[v.blankIdx]??"":v.value).join(""),b=L(x),h=L(e.code.replace(/_{3,}/g,e.answer)),g=L(s.join(" ")),k=L(e.answer),y=b===h||g===k||b.includes(k);c({pass:y,reason:y?"Matches the canonical answer.":`Expected: ${e.answer}`}),r(y)},[a,s,e.code,e.answer,r]),p=d.useCallback(()=>{i(new Array(n).fill("")),c(null),requestAnimationFrame(()=>l.current?.focus())},[n]),m=d.useCallback(x=>{x.key==="Enter"?(x.preventDefault(),u()):x.key==="Escape"&&o&&(x.preventDefault(),p())},[u,p,o]);return t.jsxs("section",{className:"cz-root",role:"application","aria-label":`Cloze exercise — atom ${e.atomId}`,children:[t.jsx("style",{children:Tt}),t.jsx("header",{className:"cz-header",children:t.jsx("h2",{className:"cz-stem",children:e.stem})}),t.jsx("p",{className:"cz-sentence","aria-label":"cloze sentence",children:e.clozeSentence}),t.jsx("pre",{className:"cz-code","aria-label":"code with blanks",children:a.map((x,b)=>x.kind==="text"?t.jsx("span",{className:"cz-text",children:x.value},b):t.jsx("input",{ref:x.blankIdx===0?l:null,type:"text",className:`cz-blank ${o?o.pass?"is-ok":"is-bad":""}`,"aria-label":`blank ${(x.blankIdx??0)+1} of ${n}`,value:s[x.blankIdx]??"",onChange:h=>f(x.blankIdx,h.target.value),onKeyDown:m,autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",spellCheck:!1,size:Math.max(8,(s[x.blankIdx]??"").length+2)},b))}),t.jsxs("div",{className:"cz-actions",children:[t.jsx("button",{type:"button",className:"cz-btn cz-btn--primary",onClick:u,disabled:o?.pass===!0,"aria-label":"submit cloze (Enter)",children:o?.pass?"Passed":"Submit (Enter)"}),o&&!o.pass&&t.jsx("button",{type:"button",className:"cz-btn",onClick:p,"aria-label":"reset blanks and try again",children:"Try again (Esc)"})]}),o&&t.jsxs("div",{className:`cz-feedback ${o.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[t.jsx("strong",{children:o.pass?"✓ pass":"✗ not yet"})," ",t.jsx("span",{children:o.reason}),!o.pass&&t.jsxs("details",{className:"cz-explain",children:[t.jsx("summary",{children:"show explanation"}),t.jsx("p",{children:e.explanation})]})]})]})}const Tt=`
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
`;function _t(e,r){if(r===null||r<1)return e;const a=e.split(`
`);if(r>a.length)return e;const n=r-1,s=a[n]??"";return s.startsWith("▶ ")?e:(a[n]=`▶ ${s}`,a.join(`
`))}function Rt(e,r){const a={};for(let n=0;n<r&&n<e.length;n++){const s=e[n];if(s?.vars)for(const i of s.vars){const o=a[i.name];!o||o.length===0?a[i.name]=[i.value]:o[o.length-1]!==i.value&&(a[i.name]=[...o,i.value])}}return a}function $t(e,r){for(let a=r-1;a>=0;a--){const n=e[a]?.terminal;if(n)return n}return[]}function Mt(e){const r=me(e.fullCode),a=e.passByRef??r.passByRef??void 0,n=new Map;for(const o of r.structDefs){const c=o.fields.map(l=>{if(l.kind==="array"){const f=l.sizeRef?xe(l.sizeRef,r.sizeConsts)??5:5;return{name:l.name,kind:"array",size:f,cppType:l.cppType}}return{name:l.name,kind:"scalar",cppType:l.cppType}});n.set(o.name,c)}let s=[];if(e.varShapes&&e.varShapes.length>0)s=e.varShapes;else{const o=[];for(const p of r.varDecls){const m=n.get(p.cppType);m&&o.push({kind:"struct",name:p.name,structType:p.cppType,fields:m})}const c=new Set(o.map(p=>p.name)),l=new Set;for(const p of e.steps)if(p.vars)for(const m of p.vars)l.add(m.name);const f=[...l].filter(p=>{const m=p.indexOf("."),x=m>=0?p.slice(0,m):p;return!c.has(x)}),u=ue(f);s=[...o,...u]}const i={};if(e.arrayInits)for(const o of e.arrayInits)i[o.name]=o.values;else for(const o of r.varDecls){const c=n.get(o.cppType);if(!c||!o.init)continue;const l=Y(o.init);for(let f=0;f<c.length&&f<l.length;f++){const u=c[f],p=l[f];if(!(!u||p===void 0)&&u.kind==="array"){const m=Y(p);m.length>0&&(i[`${o.name}.${u.name}`]=m)}}}return{shapes:s,arrayInits:i,passByRef:a}}function It({card:e,onComplete:r}){const a=e.steps.length,[n,s]=d.useState(0),i=d.useMemo(()=>Mt(e),[e]),o=n>0?e.steps[n-1]?.line??null:null,c=d.useMemo(()=>Rt(e.steps,n),[e.steps,n]),l=d.useMemo(()=>$t(e.steps,n),[e.steps,n]),f=d.useMemo(()=>e.steps.some(k=>!!k.vars),[e.steps]),u=n>0?e.steps[n-1]?.annotation??"":"";d.useEffect(()=>{s(0)},[e.id]);const p=d.useCallback(()=>{s(k=>{const y=Math.min(a,k+1);return y===a&&r(!0),y})},[a,r]),m=d.useCallback(()=>{s(k=>Math.max(0,k-1))},[]),x=d.useCallback(()=>{s(a),r(!0)},[a,r]);d.useEffect(()=>{const k=y=>{y.target instanceof HTMLElement&&(y.target.tagName==="INPUT"||y.target.tagName==="TEXTAREA")||(y.key===" "||y.key==="ArrowRight"||y.key==="Enter"?(y.preventDefault(),p()):y.key==="Backspace"||y.key==="ArrowLeft"?(y.preventDefault(),m()):(y.key==="End"||(y.ctrlKey||y.metaKey)&&y.key==="Enter")&&(y.preventDefault(),x()))};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[p,m,x]);const b=d.useMemo(()=>_t(e.fullCode,o),[e.fullCode,o]),h=d.useCallback(k=>{},[]),g=d.useMemo(()=>({display:"grid",gridTemplateColumns:"minmax(0, 1.2fr) minmax(0, 1fr)",gridTemplateRows:"auto 1fr auto",gridTemplateAreas:`
        "header   header"
        "code     panes"
        "footer   footer"
      `,gap:12,padding:12,width:"100%",maxWidth:1280,margin:"0 auto",minHeight:560}),[]);return t.jsxs("section",{className:"wt-root",role:"application","aria-label":"walkthrough",style:g,children:[t.jsx("header",{className:"wt-header",style:{gridArea:"header"},children:t.jsx("h2",{className:"wt-stem",children:e.stem})}),t.jsx("div",{className:"wt-code-pane",style:{gridArea:"code",minHeight:0,display:"flex"},children:t.jsx(A,{value:b,onChange:h,language:"cpp",readOnly:!0,ariaLabel:o&&o>0?`walkthrough code, active line ${o}`:"walkthrough code"})}),t.jsxs("div",{className:"wt-right-col",style:{gridArea:"panes",display:"grid",gridTemplateRows:f?"minmax(0, 1.4fr) minmax(0, 1fr)":"1fr",gap:12,minHeight:0},children:[f&&t.jsx("div",{className:"wt-vars-pane",style:{minHeight:0,overflow:"auto"},"aria-label":"memory diagram",children:t.jsx(fe,{shapes:i.shapes,history:c,arrayInits:i.arrayInits,passByRef:i.passByRef,editable:!1,title:"memory (auto-revealing)"})}),t.jsx("div",{className:"wt-prose-pane","aria-live":"polite","aria-label":"walkthrough notes",children:n===0?t.jsxs("p",{className:"wt-prose-empty",children:["press ",t.jsx("kbd",{children:"Space"})," to begin the walkthrough."]}):t.jsxs(t.Fragment,{children:[t.jsx("p",{className:"wt-prose-body",children:u}),l.length>0&&t.jsxs("div",{className:"wt-terminal","aria-label":"terminal so far",children:[t.jsx("div",{className:"wt-terminal-label",children:"terminal"}),t.jsx("pre",{className:"wt-terminal-pre",children:l.map((k,y)=>t.jsx("div",{children:k||" "},y))})]})]})})]}),t.jsxs("footer",{className:"wt-footer",style:{gridArea:"footer",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8},children:[t.jsx("button",{type:"button",className:"wt-btn",onClick:m,disabled:n===0,"aria-label":"step back (Backspace)",children:"← back"}),t.jsx("button",{type:"button",className:"wt-btn wt-btn--primary",onClick:p,disabled:n===a,"aria-label":"reveal next step (Space)",children:n===a?"done":"reveal next"}),t.jsx("button",{type:"button",className:"wt-btn",onClick:x,disabled:n===a,"aria-label":"reveal all (End)",children:"reveal all"})]}),t.jsx("style",{children:Lt})]})}const Lt=`
.wt-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
}
.wt-header {
  padding: 8px 4px;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.wt-stem {
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-0, #e6edf3);
  font-weight: 500;
  white-space: pre-wrap;
}

.wt-prose-pane {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 10px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wt-prose-empty {
  margin: 0;
  font-size: 12px;
  color: var(--text-2, #6e7681);
  font-style: italic;
}
.wt-prose-empty kbd {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 1px 6px;
  color: var(--accent-cyan, #79c0ff);
  font-family: inherit;
  font-size: 11px;
}
.wt-prose-body {
  margin: 0;
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-0, #e6edf3);
  white-space: pre-wrap;
}

.wt-terminal {
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 6px 10px;
}
.wt-terminal-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-bottom: 4px;
}
.wt-terminal-pre {
  margin: 0;
  font-size: 12px;
  color: var(--accent-grn, #7ee787);
  white-space: pre-wrap;
}

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
.wt-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.wt-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.wt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.wt-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
@media (max-width: 768px) {
  .wt-right-col { grid-template-rows: auto auto !important; }
}
`;function At(e,r){if(r.length===0)return e;const a=[...r].filter(o=>o.length>0).sort((o,c)=>c.length-o.length);if(a.length===0)return e;const n=a.map(o=>o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),s=new RegExp(`(${n.join("|")})`,"g");return e.split(s).map((o,c)=>a.includes(o)?t.jsx("mark",{className:"dc-hl",children:o},c):t.jsx("span",{children:o},c))}function an({card:e,onComplete:r}){const[a,n]=d.useState(!1),s=d.useMemo(()=>At(e.demoCode,e.highlightTokens),[e.demoCode,e.highlightTokens]);d.useEffect(()=>{n(!1)},[e.id]);const i=d.useCallback(()=>{a||(n(!0),r(!0))},[a,r]);return d.useEffect(()=>{const o=c=>{c.target instanceof HTMLElement&&c.target.tagName==="INPUT"||(c.key===" "||c.key==="Enter")&&(c.preventDefault(),i())};return window.addEventListener("keydown",o),()=>window.removeEventListener("keydown",o)},[i]),t.jsxs("section",{className:"dc-root",role:"application","aria-label":`Demo example — atom ${e.atomId}`,children:[t.jsx("style",{children:Dt}),t.jsx("header",{className:"dc-header",children:t.jsx("h2",{className:"dc-stem",children:e.stem})}),t.jsxs("p",{className:"dc-why","aria-label":"why this matters",children:[t.jsx("span",{className:"dc-why-eyebrow",children:"why"}),t.jsx("span",{className:"dc-why-text",children:e.whyOneLine})]}),t.jsx("pre",{className:"dc-code","aria-label":"demo code (read-only)",tabIndex:0,children:s}),t.jsx("footer",{className:"dc-footer",children:t.jsx("button",{type:"button",className:"dc-btn dc-btn--primary",onClick:i,disabled:a,"aria-label":"acknowledge and continue (Space)",children:a?"acknowledged":"got it (Space)"})})]})}const Dt=`
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
`;function qt(e){return new Set(e.split(/[,\s]+/g).map(r=>r.trim().toUpperCase()).filter(r=>r.length>0))}function Bt(e,r){if(e.size!==r.size)return!1;for(const a of e)if(!r.has(a))return!1;return!0}function rn({card:e,onComplete:r}){const a=d.useMemo(()=>qt(e.correctLabel),[e.correctLabel]),n=a.size>1,[s,i]=d.useState(new Set),[o,c]=d.useState(null);d.useEffect(()=>{i(new Set),c(null)},[e.id]);const l=d.useCallback(p=>{o?.pass||i(m=>{const x=new Set(m),b=p.toUpperCase();return x.has(b)?x.delete(b):(n||x.clear(),x.add(b)),x})},[o,n]),f=d.useCallback(()=>{if(s.size===0)return;const p=Bt(s,a);c({pass:p}),r(p)},[s,a,r]),u=d.useCallback(()=>{i(new Set),c(null)},[]);return d.useEffect(()=>{const p=m=>{const x=m.key.toLowerCase();if(x>="1"&&x<="4"){m.preventDefault();const b=e.options[parseInt(x,10)-1];b&&l(b.label)}else x>="a"&&x<="d"?(m.preventDefault(),l(x.toUpperCase())):m.key==="Enter"?(m.preventDefault(),f()):m.key==="Escape"&&o&&!o.pass&&(m.preventDefault(),u())};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)},[l,f,u,e.options,o]),t.jsxs("section",{className:"dec-root",role:"application","aria-label":`Decompose — atom ${e.atomId}`,children:[t.jsx("style",{children:Pt}),t.jsx("header",{className:"dec-header",children:t.jsx("h2",{id:"dec-stem",className:"dec-stem",children:e.stem})}),t.jsx("pre",{className:"dec-code","aria-label":"code under analysis",tabIndex:0,children:e.code}),t.jsx("p",{className:"dec-question",children:e.question}),t.jsx("ul",{role:n?"group":"radiogroup","aria-labelledby":"dec-stem",className:"dec-options",children:e.options.map(p=>{const m=p.label.toUpperCase(),x=s.has(m),b=o&&a.has(m),h=o&&x&&!a.has(m),g=["dec-opt",x?"is-picked":"",b?"is-correct":"",h?"is-wrong":""].filter(Boolean).join(" ");return t.jsx("li",{children:t.jsxs("button",{type:"button",role:n?"checkbox":"radio","aria-checked":x,className:g,onClick:()=>l(p.label),disabled:o?.pass===!0,"aria-label":`option ${p.label}: ${p.text}`,children:[t.jsx("span",{className:"dec-letter","aria-hidden":"true",children:p.label}),t.jsx("span",{className:"dec-text",children:p.text})]})},p.label)})}),t.jsxs("div",{className:"dec-actions",children:[n&&t.jsxs("span",{className:"dec-hint","aria-live":"polite",children:["picked: ",Array.from(s).sort().join(", ")||"(none)"]}),t.jsx("button",{type:"button",className:"dec-btn dec-btn--primary",onClick:f,disabled:s.size===0||o?.pass===!0,"aria-label":"submit (Enter)",children:o?.pass?"Passed":"Submit (Enter)"}),o&&!o.pass&&t.jsx("button",{type:"button",className:"dec-btn",onClick:u,"aria-label":"reset and try again (Esc)",children:"Try again (Esc)"})]}),o&&t.jsxs("div",{className:`dec-feedback ${o.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[t.jsx("strong",{children:o.pass?"✓ correct":"✗ not quite"}),!o.pass&&t.jsxs("span",{children:[" ","— correct ",n?"set":"answer"," was"," ",t.jsx("code",{children:Array.from(a).sort().join(", ")}),"."]}),t.jsxs("details",{className:"dec-explain",children:[t.jsx("summary",{children:"show explanation"}),t.jsx("p",{children:e.explanation})]})]})]})}const Pt=`
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
`,G=["A","B","C","D"];function Ft(e){let r=5381;for(let a=0;a<e.length;a++)r=(r<<5)+r+e.charCodeAt(a)>>>0;return r}function Kt(e,r){const a=e.slice();for(let n=a.length-1;n>0;n--){r=r*1664525+1013904223>>>0;const s=r%(n+1);[a[n],a[s]]=[a[s],a[n]]}return a}function sn({card:e,onComplete:r}){const a=d.useMemo(()=>{const p=[e.correct,...e.distractors];return Kt(p,Ft(e.id))},[e.id,e.correct,e.distractors]),n=a.indexOf(e.correct),[s,i]=d.useState(null),[o,c]=d.useState(null);d.useEffect(()=>{i(null),c(null)},[e.id]);const l=d.useCallback(p=>{o?.pass||i(p)},[o]),f=d.useCallback(()=>{if(s===null)return;const p=s===n;c({pass:p}),r(p)},[s,n,r]),u=d.useCallback(()=>{i(null),c(null)},[]);return d.useEffect(()=>{const p=m=>{const x=m.key.toLowerCase();x>="1"&&x<="4"?(m.preventDefault(),l(parseInt(x,10)-1)):x>="a"&&x<="d"?(m.preventDefault(),l(x.charCodeAt(0)-97)):m.key==="Enter"?(m.preventDefault(),f()):m.key==="Escape"&&o&&!o.pass&&(m.preventDefault(),u())};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)},[l,f,u,o]),t.jsxs("section",{className:"mcq-root",role:"application","aria-label":`Multiple choice — atom ${e.atomId}`,children:[t.jsx("style",{children:Ot}),t.jsx("header",{className:"mcq-header",children:t.jsx("h2",{id:"mcq-stem",className:"mcq-stem",children:e.stem})}),t.jsx("ul",{role:"radiogroup","aria-labelledby":"mcq-stem",className:"mcq-options",children:a.map((p,m)=>{const x=s===m,b=o&&m===n,h=o&&x&&!o.pass,g=["mcq-opt",x?"is-picked":"",b?"is-correct":"",h?"is-wrong":""].filter(Boolean).join(" ");return t.jsx("li",{children:t.jsxs("button",{type:"button",role:"radio","aria-checked":x,"aria-label":`option ${G[m]}: ${p}`,className:g,onClick:()=>l(m),disabled:o?.pass===!0,children:[t.jsx("span",{className:"mcq-letter","aria-hidden":"true",children:G[m]}),t.jsx("span",{className:"mcq-text",children:p})]})},m)})}),t.jsxs("div",{className:"mcq-actions",children:[t.jsx("button",{type:"button",className:"mcq-btn mcq-btn--primary",onClick:f,disabled:s===null||o?.pass===!0,"aria-label":"submit answer (Enter)",children:o?.pass?"Passed":"Submit (Enter)"}),o&&!o.pass&&t.jsx("button",{type:"button",className:"mcq-btn",onClick:u,"aria-label":"clear and try again (Esc)",children:"Try again (Esc)"})]}),o&&t.jsxs("div",{className:`mcq-feedback ${o.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[t.jsx("strong",{children:o.pass?"✓ correct":"✗ not quite"}),!o.pass&&t.jsxs("span",{children:[" ","— correct answer was"," ",t.jsx("code",{children:G[n]}),"."]}),t.jsxs("details",{className:"mcq-explain",children:[t.jsx("summary",{children:"show explanation"}),t.jsx("p",{children:e.explanation})]})]})]})}const Ot=`
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
`;function on({card:e,onComplete:r,targetStreak:a=3}){const n=d.useMemo(()=>[{prompt:e.prompt,expectedAnswer:e.expectedAnswer},...e.variants],[e.prompt,e.expectedAnswer,e.variants]),s=Math.min(a,n.length),[i,o]=d.useState(0),[c,l]=d.useState(""),[f,u]=d.useState(0),[p,m]=d.useState(null),x=d.useRef(null),b=n[i];d.useEffect(()=>{o(0),l(""),u(0),m(null),requestAnimationFrame(()=>x.current?.focus())},[e.id]);const h=d.useCallback(()=>{const k=O(c,{canonicalAnswer:b.expectedAnswer,keyChecks:e.keyChecks,forbiddenTokens:[],requireSemicolon:!1});if(m(k),k.pass){const y=f+1;u(y),y>=s?r(!0):setTimeout(()=>{o(v=>(v+1)%n.length),l(""),m(null),x.current?.focus()},800)}else u(0)},[c,b.expectedAnswer,e.keyChecks,f,s,r,n.length]),g=d.useCallback(()=>{l(""),m(null),requestAnimationFrame(()=>x.current?.focus())},[]);return d.useEffect(()=>{const k=y=>{(y.ctrlKey||y.metaKey)&&y.key==="Enter"?(y.preventDefault(),h()):y.key==="Escape"&&p&&!p.pass&&(y.preventDefault(),g())};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[h,g,p]),t.jsxs("section",{className:"pc-root",role:"application","aria-label":`Procedural — ${e.section}`,children:[t.jsx("style",{children:Ht}),t.jsxs("header",{className:"pc-header",children:[t.jsx("h2",{className:"pc-stem",children:e.stem}),t.jsx("div",{className:"pc-meta",children:t.jsx(Wt,{streak:f,target:s})})]}),t.jsx("p",{className:"pc-prompt","aria-live":"polite",children:t.jsx("span",{children:b.prompt})}),t.jsx("div",{className:"pc-editor",children:t.jsx(A,{ref:x,value:c,onChange:l,language:"cpp",ariaLabel:"C++ code editor — write your answer here",showBraceMatch:!0,lineNumbers:!0})}),t.jsxs("div",{className:"pc-actions",children:[t.jsx("button",{type:"button",className:"pc-btn pc-btn--primary",onClick:h,"aria-label":"submit (Ctrl+Enter)",children:"Submit (Ctrl+Enter)"}),t.jsx("button",{type:"button",className:"pc-btn",onClick:g,"aria-label":"clear editor (Esc)",disabled:c.length===0,children:"Clear (Esc)"})]}),p&&t.jsxs("div",{className:`pc-feedback ${p.pass?"is-ok":"is-bad"}`,role:"status","aria-live":"polite",children:[t.jsx("strong",{children:p.pass?`✓ pass · streak ${f}/${s}`:"✗ not yet"}),!p.pass&&p.errors[0]&&t.jsx("p",{className:"pc-err",children:p.errors[0].message})]})]})}function Wt({streak:e,target:r}){const a=[];for(let n=0;n<r;n++)a.push(t.jsx("span",{className:`pc-dot ${n<e?"is-on":""}`,"aria-hidden":"true"},n));return t.jsxs("div",{className:"pc-streak",role:"status","aria-label":`streak ${e} of ${r}`,children:[t.jsx("span",{className:"pc-streak-label",children:"streak"}),t.jsx("span",{className:"pc-streak-dots",children:a})]})}const Ht=`
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
`,Yt=new Set(["Shift","Control","Alt","Meta","CapsLock","Tab","Escape","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]);function Zt(e,r){if(r.length===0)return e.trim().length>0;const a=L(e);return r.every(n=>a.includes(L(n)))}function cn({card:e,onComplete:r}){const[a,n]=d.useState("display"),[s,i]=d.useState(""),[o,c]=d.useState(!1),l=d.useRef(null);d.useEffect(()=>{n("display"),i(""),c(!1)},[e.id]),d.useEffect(()=>{a==="input"&&l.current?.focus()},[a]),d.useEffect(()=>{a==="input"&&s.length!==0&&L(s)===L(e.fact)&&(n("graded-pass"),window.setTimeout(()=>r(!0),500))},[s,a,e.fact,r]);const f=d.useCallback(()=>{if(a!=="input")return;Zt(s,e.keyChecks)?(n("graded-pass"),window.setTimeout(()=>r(!0),500)):o?(n("final-fail"),window.setTimeout(()=>r(!1),1200)):(n("graded-fail"),c(!0))},[a,s,e.keyChecks,o,r]),u=x=>{x.key==="Enter"&&!x.shiftKey&&(x.preventDefault(),f())};d.useEffect(()=>{const x=b=>{if(a==="display"){if(Yt.has(b.key))return;b.preventDefault(),n("input")}else a==="graded-fail"&&b.code==="Space"?(b.preventDefault(),i(""),n("display")):a==="final-fail"&&b.code==="Space"&&(b.preventDefault(),r(!1))};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)},[a,r]);const p=a==="graded-pass"?"card card--graded-pass":a==="graded-fail"||a==="final-fail"?"card card--graded-fail":"card",m=a==="display"||a==="final-fail";return t.jsxs("div",{className:p,children:[e.context&&t.jsx("div",{className:m?"memorize-context":"memorize-context memorize-context--hidden",children:e.context}),t.jsx("div",{className:m?"memorize-fact":"memorize-fact memorize-fact--hidden",children:e.fact}),e.codeExample&&t.jsx("pre",{className:"memorize-code",children:e.codeExample}),(a==="input"||a==="graded-fail"||a==="graded-pass")&&t.jsxs("div",{className:"input-area",children:[t.jsx("label",{className:"input-area__label",htmlFor:`memorize-${e.id}`,children:"type the fact verbatim"}),t.jsx("textarea",{id:`memorize-${e.id}`,ref:l,className:"input-area__textarea",value:s,onChange:x=>i(x.target.value),onKeyDown:u,disabled:a!=="input",rows:2,spellCheck:!1})]}),a==="graded-pass"&&t.jsx("div",{className:"feedback",children:t.jsx("div",{className:"feedback__title feedback__title--pass",children:"pass"})}),a==="graded-fail"&&t.jsxs("div",{className:"feedback",children:[t.jsx("div",{className:"feedback__title feedback__title--fail",children:"not quite — see fact again"}),t.jsxs("div",{className:"feedback__detail",children:[t.jsxs("div",{children:["expected one of: ",t.jsx("strong",{children:e.keyChecks.join(", ")})]}),t.jsx("div",{className:"explanation",children:e.explanation})]})]}),a==="final-fail"&&t.jsxs("div",{className:"feedback",children:[t.jsx("div",{className:"feedback__title feedback__title--fail",children:"correct answer"}),t.jsxs("div",{className:"feedback__detail",children:[t.jsx("strong",{children:e.fact}),t.jsx("div",{className:"explanation",children:e.explanation})]})]}),t.jsxs("div",{className:"kbd-hint",children:[a==="display"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"any key"})," to start typing"]}),a==="input"&&t.jsx(t.Fragment,{children:"type from memory — auto-advance on match"}),a==="graded-fail"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"space"})," to see fact again"]}),a==="final-fail"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"space"})," to continue"]})]})]})}function ln({card:e,onComplete:r}){const[a,n]=d.useState("input"),[s,i]=d.useState(""),[o,c]=d.useState(!1),l=d.useRef(null);d.useEffect(()=>{n("input"),i(""),c(!1)},[e.id]),d.useEffect(()=>{a==="input"&&l.current?.focus()},[a]);const f=d.useCallback(()=>{if(a!=="input")return;O(s,{canonicalAnswer:e.expectedAnswer,keyChecks:e.keyChecks,forbiddenTokens:e.forbidden,requireSemicolon:e.writeLevel!==1}).pass?(n("graded-pass"),window.setTimeout(()=>r(!0),700)):o?(n("final-fail"),window.setTimeout(()=>r(!1),1500)):(n("graded-fail"),c(!0))},[a,s,e.expectedAnswer,e.keyChecks,e.forbidden,e.writeLevel,o,r]),u=d.useCallback(()=>{i(""),n("input")},[]),p=h=>{h.key==="Enter"&&(h.ctrlKey||h.metaKey)&&(h.preventDefault(),f())},m=h=>{h.key==="Enter"&&(h.preventDefault(),f())};d.useEffect(()=>{const h=g=>{a==="graded-fail"&&g.code==="Space"?(g.preventDefault(),u()):a==="final-fail"&&g.code==="Space"&&(g.preventDefault(),r(!1))};return window.addEventListener("keydown",h),()=>window.removeEventListener("keydown",h)},[a,r,u]);const x=a==="graded-pass"?"card card--graded-pass":a==="graded-fail"||a==="final-fail"?"card card--graded-fail":"card",b=e.writeLevel===1?"fill blank":e.writeLevel===2?"complete body":"free form";return t.jsxs("div",{className:`${x} write-card`,children:[t.jsxs("div",{className:"atom-id",children:[e.level," · ",e.atomId," · write · ",b]}),t.jsx("div",{className:"write-spec",children:e.spec}),e.template&&t.jsx("pre",{className:"write-template",children:t.jsx("code",{children:e.template})}),(a==="input"||a==="graded-fail"||a==="graded-pass")&&t.jsx("div",{className:"write-input-area",children:e.writeLevel===1?t.jsx("input",{ref:l,type:"text",className:"write-input write-input--single",value:s,onChange:h=>i(h.target.value),onKeyDown:m,disabled:a!=="input",placeholder:"answer",spellCheck:!1}):t.jsx("textarea",{ref:l,className:"write-input write-input--multi",value:s,onChange:h=>i(h.target.value),onKeyDown:p,disabled:a!=="input",placeholder:e.writeLevel===2?"fill the blank":"write your answer",spellCheck:!1,rows:e.writeLevel===3?8:4})}),a==="graded-pass"&&t.jsx("div",{className:"feedback",children:t.jsx("div",{className:"feedback__title feedback__title--pass",children:"pass"})}),a==="graded-fail"&&t.jsxs("div",{className:"feedback",children:[t.jsx("div",{className:"feedback__title feedback__title--fail",children:"not quite — retry once"}),t.jsxs("div",{className:"feedback__detail",children:[t.jsxs("div",{children:["required tokens: ",t.jsx("code",{children:e.keyChecks.join(", ")})]}),e.forbidden&&e.forbidden.length>0&&t.jsxs("div",{children:["must NOT contain: ",t.jsx("code",{children:e.forbidden.join(", ")})]}),t.jsx("div",{className:"explanation",children:e.explanation})]})]}),a==="final-fail"&&t.jsxs("div",{className:"feedback",children:[t.jsx("div",{className:"feedback__title feedback__title--fail",children:"correct answer"}),t.jsxs("div",{className:"feedback__detail",children:[t.jsx("pre",{className:"write-expected",children:t.jsx("code",{children:e.expectedAnswer})}),t.jsx("div",{className:"explanation",children:e.explanation})]})]}),t.jsxs("div",{className:"kbd-hint",children:[a==="input"&&e.writeLevel===1&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"enter"})," to submit"]}),a==="input"&&e.writeLevel!==1&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"ctrl"}),"+",t.jsx("span",{className:"kbd",children:"enter"})," to submit"]}),a==="graded-fail"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"space"})," to retry"]}),a==="final-fail"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"space"})," to continue"]})]})]})}function dn({card:e,onComplete:r}){const[a,n]=d.useState("study"),[s,i]=d.useState(""),[o,c]=d.useState(!1),l=d.useRef(null);d.useEffect(()=>{n("study"),i(""),c(!1)},[e.id]),d.useEffect(()=>{a==="input"&&l.current?.focus()},[a]);const f=d.useCallback(()=>{if(a!=="input")return;O(s,{canonicalAnswer:e.code,keyChecks:e.keyChecks,forbiddenTokens:[],requireSemicolon:!1}).pass?(n("pass"),window.setTimeout(()=>r(!0),700)):o?n("final-fail"):(n("fail"),c(!0))},[a,s,e.code,e.keyChecks,o]);d.useEffect(()=>{const x=b=>{a==="study"&&b.code==="Space"?(b.preventDefault(),n("input")):a==="fail"&&b.code==="Space"?(b.preventDefault(),i(""),n("input")):a==="final-fail"&&b.code==="Space"&&(b.preventDefault(),i(""),c(!1),n("study"),r(!1))};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)},[a,r]);const u=x=>{x.key==="Enter"&&(x.ctrlKey||x.metaKey)&&(x.preventDefault(),f())},p=a==="pass"?"card card--graded-pass":a==="fail"||a==="final-fail"?"card card--graded-fail":"card",m=e.code.split(`
`).length;return t.jsxs("div",{className:`${p} cmem-card`,children:[t.jsx("div",{className:"write-spec",children:e.question}),a==="study"&&t.jsxs("div",{className:"cmem-study",children:[t.jsx("div",{className:"cmem-study__label",children:"memorize this code:"}),t.jsx("pre",{className:"cmem-study__code",children:e.code})]}),(a==="input"||a==="fail"||a==="pass")&&t.jsx("div",{className:"write-input-area",children:t.jsx("textarea",{ref:l,className:"write-input write-input--multi",value:s,onChange:x=>i(x.target.value),onKeyDown:u,disabled:a!=="input",placeholder:"type the code from memory",spellCheck:!1,rows:Math.max(m+2,6)})}),a==="pass"&&t.jsx("div",{className:"feedback",children:t.jsx("div",{className:"feedback__title feedback__title--pass",children:"pass — memorized"})}),a==="fail"&&t.jsxs("div",{className:"feedback",children:[t.jsx("div",{className:"feedback__title feedback__title--fail",children:"not quite — retry"}),t.jsx("div",{className:"feedback__detail",children:t.jsxs("div",{children:["required: ",t.jsx("code",{children:e.keyChecks.join(", ")})]})})]}),a==="final-fail"&&t.jsxs("div",{className:"feedback",children:[t.jsx("div",{className:"feedback__title feedback__title--fail",children:"correct code"}),t.jsx("div",{className:"feedback__detail",children:t.jsx("pre",{className:"write-expected",children:t.jsx("code",{children:e.code})})})]}),t.jsxs("div",{className:"kbd-hint",children:[a==="study"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"space"})," to hide code and begin typing"]}),a==="input"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"ctrl"}),"+",t.jsx("span",{className:"kbd",children:"enter"})," to submit"]}),a==="fail"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"space"})," to retry"]}),a==="final-fail"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"kbd",children:"space"})," to re-study"]})]})]})}const Ut={id:"devpreview-Q1-who-am-i",schemaVersion:"v2",atomId:"F-22a",qTags:["Q1"],stage:1,level:"L1",type:"TraceCard",stem:"Hand-execute who_am_i(d) where d is initialized as shown. Track i and d.mystery in the memory diagram. Predict any terminal output.",source:{kind:"practice",ref:"Q1"},commonMistakeIds:[],status:"NEW",createdBy:"devpreview",reviewedBy:[],code:["const int SIZE = 5;","","struct stat_double {","  double numbers[SIZE];","  double mystery;","};","","void who_am_i(stat_double &data) {","  int i;","  data.mystery = data.numbers[0];","  for (i = 0; i < SIZE; i++) {","    if (data.numbers[i] > data.mystery) {","      data.mystery = data.numbers[i];","    }","  }","  return;","}","","int main() {","  stat_double d = { {-20.0, 3.2, 1.9, -1.5, 1.3}, 0.0 };","  who_am_i(d);","  return 0;","}"].join(`
`),variables:["i","d.mystery"],expectedTrace:[{line:10,variable:"d.mystery",value:"-20.0"},{line:11,variable:"i",value:"0"},{line:12,variable:"d.mystery",value:"3.2"},{line:11,variable:"i",value:"5"}],userInputs:[],inputLabels:[],terminalOutput:[],inputMode:"final-only"};function pn(){const[e,r]=d.useState(!1);return t.jsxs("div",{style:{background:"#0d1117",minHeight:"100vh",padding:16,color:"#e6edf3",fontFamily:"monospace"},children:[t.jsxs("div",{style:{marginBottom:12,fontSize:12,color:"#7ee787"},children:["DEV PREVIEW · TraceCard · Q1 who_am_i fixture · status:"," ",e?"COMPLETED":"in-progress"]}),t.jsx(et,{card:Ut,onComplete:()=>r(!0)})]})}const Vt={id:"devpreview-walkthrough-memory",schemaVersion:"v2",atomId:"F-03",qTags:["Q1"],stage:0,level:"L0",type:"WalkthroughCard",stem:"Hand-execute step by step. Watch the memory diagram build as each line runs. Reveal the next step with Space.",source:{kind:"pfg",ref:"PFG/part-1/3-control-flow/0-panorama/07-hand-execution"},commonMistakeIds:[],status:"NEW",createdBy:"devpreview",reviewedBy:[],levelLabel:"L0 Foundation · F-03 hand-execution",fullCode:["#include <iostream>","using namespace std;","int main() {","  int x = 5;","  int y = 7;","  int sum = x + y;","  cout << sum << endl;","  return 0;","}"].join(`
`),steps:[{line:4,code:"int x = 5;",annotation:"Open a memory box for x. Write 5 inside it.",atomIds:[],vars:[{name:"x",value:"5",history:[]}]},{line:5,code:"int y = 7;",annotation:"Open a memory box for y. Write 7 inside it.",atomIds:[],vars:[{name:"x",value:"5",history:[]},{name:"y",value:"7",history:[]}]},{line:6,code:"int sum = x + y;",annotation:"Read x (5), read y (7), add → 12. Open box for sum, write 12 inside.",atomIds:[],vars:[{name:"x",value:"5",history:[]},{name:"y",value:"7",history:[]},{name:"sum",value:"12",history:[]}]},{line:7,code:"cout << sum << endl;",annotation:"Print the value of sum (12) to the terminal, then newline.",atomIds:[],vars:[{name:"x",value:"5",history:[]},{name:"y",value:"7",history:[]},{name:"sum",value:"12",history:[]}],terminal:["12"]},{line:8,code:"return 0;",annotation:"Program exits cleanly with status 0.",atomIds:[],vars:[{name:"x",value:"5",history:[]},{name:"y",value:"7",history:[]},{name:"sum",value:"12",history:[]}],terminal:["12"]}]},Gt={id:"devpreview-walkthrough-prose",schemaVersion:"v2",atomId:"F-20",qTags:["Q2"],stage:0,level:"L0",type:"WalkthroughCard",stem:"Read this struct definition left-to-right. Each step explains what one line of syntax does. No memory yet — this is a declaration, not execution.",source:{kind:"pfg",ref:"PFG/part-2/3-structuring-data"},commonMistakeIds:[],status:"NEW",createdBy:"devpreview",reviewedBy:[],levelLabel:"L0 Foundation · F-20 struct syntax",fullCode:["const int SIZE = 5;","","struct stat_double {","  double numbers[SIZE];","  double mystery;","};"].join(`
`),steps:[{line:1,code:"const int SIZE = 5;",annotation:"A compile-time constant SIZE = 5. Used as the array dimension below. const means we cannot reassign it.",atomIds:[]},{line:3,code:"struct stat_double {",annotation:"Open a struct definition. The keyword struct introduces a new compound type. The name stat_double is the type identifier we will declare variables of below. The opening brace begins the field list.",atomIds:[]},{line:4,code:"  double numbers[SIZE];",annotation:"A field named numbers that holds an array of 5 doubles (SIZE = 5 from line 1). Each element will be a 64-bit floating-point value. Indices are 0..4.",atomIds:[]},{line:5,code:"  double mystery;",annotation:"A second field — a single double named mystery.",atomIds:[]},{line:6,code:"};",annotation:"CRITICAL line. Closing brace }, then a semicolon ;. The semicolon is required after a struct definition — forgetting it is the #1 syntax error students make on Q2.",atomIds:[]}]};function fn(){const[e,r]=d.useState("memory"),[a,n]=d.useState(!1),s=e==="memory"?Vt:Gt;return t.jsxs("div",{style:{background:"#0d1117",minHeight:"100vh",padding:16,color:"#e6edf3",fontFamily:"monospace"},children:[t.jsxs("div",{style:{marginBottom:12,fontSize:12,color:"#7ee787"},children:["DEV PREVIEW · WalkthroughCard · status: ",a?"COMPLETED":"in-progress"]}),t.jsxs("div",{style:{marginBottom:12,display:"flex",gap:8},children:[t.jsx("button",{onClick:()=>{r("memory"),n(!1)},style:{background:e==="memory"?"#79c0ff":"#161b22",color:e==="memory"?"#0d1117":"#e6edf3",border:"1px solid #30363d",padding:"6px 12px",borderRadius:4,fontFamily:"inherit",cursor:"pointer"},children:"With memory snapshots"}),t.jsx("button",{onClick:()=>{r("prose"),n(!1)},style:{background:e==="prose"?"#79c0ff":"#161b22",color:e==="prose"?"#0d1117":"#e6edf3",border:"1px solid #30363d",padding:"6px 12px",borderRadius:4,fontFamily:"inherit",cursor:"pointer"},children:"Prose-only (legacy)"})]}),t.jsx(It,{card:s,onComplete:()=>n(!0)},s.id)]})}export{dn as C,rn as D,en as F,cn as M,on as P,Xt as S,Jt as T,ln as W,sn as a,an as b,It as c,nn as d,tn as e,et as f,fe as g,pn as h,fn as i};
