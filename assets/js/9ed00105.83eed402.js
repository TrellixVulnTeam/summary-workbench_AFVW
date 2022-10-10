"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>d});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),u=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=u(e.components);return a.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=u(n),d=r,g=c["".concat(p,".").concat(d)]||c[d]||m[d]||i;return n?a.createElement(g,o(o({ref:t},s),{},{components:n})):a.createElement(g,o({ref:t},s))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=c;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},9733:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>u});var a=n(7462),r=(n(7294),n(3905));const i={title:"Configuration",sidebar_position:2},o=void 0,l={unversionedId:"configuration",id:"configuration",title:"Configuration",description:"configure.py",source:"@site/docs/configuration.md",sourceDirName:".",slug:"/configuration",permalink:"/summary-workbench/configuration",draft:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/configuration.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Configuration",sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Setup Quickstart",permalink:"/summary-workbench/setup_quickstart"},next:{title:"Writing a Plugin",permalink:"/summary-workbench/writing-a-plugin"}},p={},u=[{value:"configure.py",id:"configurepy",level:2},{value:"sw-config.yaml",id:"sw-configyaml",level:2},{value:"Completion",id:"completion",level:3}],s={toc:u};function m(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"configurepy"},"configure.py"),(0,r.kt)("p",null,"The root of the repository contains a ",(0,r.kt)("inlineCode",{parentName:"p"},"configure.py")," script, which is used to:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"generate a docker-compose file"),(0,r.kt)("li",{parentName:"ul"},"generate deployment files for kubernetes"),(0,r.kt)("li",{parentName:"ul"},"build images"),(0,r.kt)("li",{parentName:"ul"},"pushing image to dockerhub.")),(0,r.kt)("p",null,"Before you can use the ",(0,r.kt)("inlineCode",{parentName:"p"},"configure.py")," script you need to run ",(0,r.kt)("inlineCode",{parentName:"p"},"pip install -r requirements.txt")," in the project root, to install all necessary dependencies."),(0,r.kt)("p",null,"Following commands are available:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"command"),(0,r.kt)("th",{parentName:"tr",align:null},"description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"gen-docker-compose"),(0,r.kt)("td",{parentName:"tr",align:null},"generate a docker-compose.yaml to run the application locally")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"build"),(0,r.kt)("td",{parentName:"tr",align:null},"build images for the plugins (metrics, summarizers)")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"push"),(0,r.kt)("td",{parentName:"tr",align:null},"push an image to dockerhub for later deployment")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"gen-kubernetes"),(0,r.kt)("td",{parentName:"tr",align:null},"generates kubernetes files for the deployment")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"gen-schema"),(0,r.kt)("td",{parentName:"tr",align:null},"generate json schema files for ",(0,r.kt)("inlineCode",{parentName:"td"},"sw-config.yaml")," and ",(0,r.kt)("inlineCode",{parentName:"td"},"sw-plugin-config.yaml")," which can be used to provide completion in your editor/IDE (see ",(0,r.kt)("a",{parentName:"td",href:"/configuration#completion"},"configuration#completion"),")")))),(0,r.kt)("h2",{id:"sw-configyaml"},"sw-config.yaml"),(0,r.kt)("p",null,"The application is configured with the ",(0,r.kt)("inlineCode",{parentName:"p"},"sw-config.yaml")," file.\nIt has the following top level options:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"option"),(0,r.kt)("th",{parentName:"tr",align:null},"required for"),(0,r.kt)("th",{parentName:"tr",align:null},"description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"docker_username"),(0,r.kt)("td",{parentName:"tr",align:null},"push, gen-kubernetes"),(0,r.kt)("td",{parentName:"tr",align:null},"username of your dockerhub")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"extern_environment"),(0,r.kt)("td",{parentName:"tr",align:null},"optional"),(0,r.kt)("td",{parentName:"tr",align:null},"key value pairs that will be environment variables inside of all the plugins (not during build time, but also in kubernetes files)")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"deploy"),(0,r.kt)("td",{parentName:"tr",align:null},"gen-kubernetes"),(0,r.kt)("td",{parentName:"tr",align:null},"configure the deployment")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"metrics"),(0,r.kt)("td",{parentName:"tr",align:null},"all"),(0,r.kt)("td",{parentName:"tr",align:null},"list of metrics (path or git url to the metric folder or repository)")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"summarizers"),(0,r.kt)("td",{parentName:"tr",align:null},"all"),(0,r.kt)("td",{parentName:"tr",align:null},"list of summarizers (path or git url to the summarizer folder or repository)")))),(0,r.kt)("p",null,"To configure a metric or a summarizer specify the path or git url to the metric or to the summarizer as an list entry under the ",(0,r.kt)("inlineCode",{parentName:"p"},"metrics")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"summarizers")," option.\nAlternatively you can specify the following options as dictionary:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"option"),(0,r.kt)("th",{parentName:"tr",align:null},"description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"source"),(0,r.kt)("td",{parentName:"tr",align:null},"path or git url to the plugin folder or repository")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"disabled"),(0,r.kt)("td",{parentName:"tr",align:null},"if true, the plugin will not be loaded but information about the plugin will still be shown in the application")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"environment"),(0,r.kt)("td",{parentName:"tr",align:null},"key-value pairs that will be add to the plugin as environment variables during build time and are present in the running plugin container. It is useful e.g. when a plugin provides different models and one wants to choose a model.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"extern_environment"),(0,r.kt)("td",{parentName:"tr",align:null},"key value pairs that will be environment variables inside the plugin (not during build time, but also in kubernetes files)")))),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"The default application configuration file is ",(0,r.kt)("inlineCode",{parentName:"p"},"sw-config.yaml")," which can be found in the project root. To use a different file specify the path to the file via the ",(0,r.kt)("inlineCode",{parentName:"p"},"--config")," option to the ",(0,r.kt)("inlineCode",{parentName:"p"},"configure.py")," script.")),(0,r.kt)("h3",{id:"completion"},"Completion"),(0,r.kt)("p",null,"You are advised to run ",(0,r.kt)("inlineCode",{parentName:"p"},"./configure.py gen-schema")," to generate the json schemas which can provide completion for IDE when you edit the configuration files.\nThe generated files are located under ",(0,r.kt)("inlineCode",{parentName:"p"},"schema/")," in the repository."),(0,r.kt)("p",null,"To enable completion in VSCode, you need to install the ",(0,r.kt)("a",{parentName:"p",href:"https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml"},"yaml extension")," and add the following lines to your ",(0,r.kt)("a",{parentName:"p",href:"https://code.visualstudio.com/docs/getstarted/settings#_settingsjson"},(0,r.kt)("inlineCode",{parentName:"a"},"settings.json"))," file:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "yaml.schemas": {\n    "<path to repository>/schema/sw-config.schema.json": "*sw-config.yaml",\n    "<path to repository>/schema/sw-plugin-config.schema.json": "sw-plugin-config.yaml"\n  }\n}\n')),(0,r.kt)("p",null,"Don't forget to replace ",(0,r.kt)("inlineCode",{parentName:"p"},"<path to repository>")," with the path to the repository on your system.\nIf the repository is located under ",(0,r.kt)("inlineCode",{parentName:"p"},"/home/me/summary-workbench")," than ",(0,r.kt)("inlineCode",{parentName:"p"},"<path to repository>/schema/sw-config.schema.json")," becomes ",(0,r.kt)("inlineCode",{parentName:"p"},"/home/me/summary-workbench/schema/sw-config.schema.json")))}m.isMDXComponent=!0}}]);