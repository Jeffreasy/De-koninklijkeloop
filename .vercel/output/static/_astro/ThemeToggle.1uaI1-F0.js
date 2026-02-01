import{j as s}from"./jsx-runtime.D_zvdyIk.js";import{r as c}from"./index.Da02gyCa.js";import{B as h}from"./button.DWfk5HI0.js";import{c as m}from"./createLucideIcon.DcHKBUZ7.js";import"./utils.CDN07tui.js";/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],i=m("moon",d);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],u=m("sun",l);function x(){const[o,a]=c.useState("dark");c.useEffect(()=>{const t=document.documentElement.getAttribute("data-theme");if(t)a(t);else{const e=localStorage.getItem("theme"),n=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";a(e||n)}},[]);const r=()=>{const t=o==="dark"?"light":"dark";a(t);const e=document.documentElement;e.setAttribute("data-theme",t),e.className=t,localStorage.setItem("theme",t)};return s.jsx(h,{variant:"ghost",size:"icon",onClick:r,className:"rounded-full text-text-body hover:bg-glass-bg/50",title:`Switch to ${o==="dark"?"light":"dark"} mode`,children:o==="dark"?s.jsx(u,{className:"h-5 w-5"}):s.jsx(i,{className:"h-5 w-5"})})}export{x as default};
