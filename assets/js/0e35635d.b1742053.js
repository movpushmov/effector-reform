"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[6640],{1695:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>u,contentTitle:()=>p,default:()=>h,frontMatter:()=>d,metadata:()=>f,toc:()=>x});var i=n(4848),a=n(8453),t=n(9084),o=n(4754),l=n(2664),m=n(5053);const s=(0,t.DG)({schema:{nick:"",email:""},validation:(0,o.K)((0,l.Ik)({nick:(0,l.Yj)().min(4,"nick-min-limit").max(16,"nick-max-limit").required("nick-required"),email:(0,l.Yj)().email("invalid-email").required("email-required")}))}),c=()=>{const{fields:e}=(0,m.mN)(s);return(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)("form",{children:[(0,i.jsx)("input",{value:e.nick.value,onChange:r=>e.nick.onChange(r.currentTarget.value)}),(0,i.jsxs)("p",{children:["nick error: ",e.nick.error]}),(0,i.jsx)("input",{value:e.email.value,onChange:r=>e.email.onChange(r.currentTarget.value)}),(0,i.jsxs)("p",{children:["email error: ",e.email.error]})]})})},d={sidebar_position:8,title:"Form with yup validation example",id:"yup-form",tags:["Learn","Getting started","Form with yup validation","Example","Examples"]},p=void 0,f={id:"learn/examples/yup-form",title:"Form with yup validation example",description:"",source:"@site/docs/learn/examples/yup-form.mdx",sourceDirName:"learn/examples",slug:"/learn/examples/yup-form",permalink:"/effector-reform/docs/learn/examples/yup-form",draft:!1,unlisted:!1,editUrl:"https://github.com/movpushmov/effector-reform/tree/main/docs/docs/learn/examples/yup-form.mdx",tags:[{label:"Learn",permalink:"/effector-reform/docs/tags/learn"},{label:"Getting started",permalink:"/effector-reform/docs/tags/getting-started"},{label:"Form with yup validation",permalink:"/effector-reform/docs/tags/form-with-yup-validation"},{label:"Example",permalink:"/effector-reform/docs/tags/example"},{label:"Examples",permalink:"/effector-reform/docs/tags/examples"}],version:"current",sidebarPosition:8,frontMatter:{sidebar_position:8,title:"Form with yup validation example",id:"yup-form",tags:["Learn","Getting started","Form with yup validation","Example","Examples"]},sidebar:"learnSidebar",previous:{title:"Use field out of form",permalink:"/effector-reform/docs/learn/examples/field-out-of-form"},next:{title:"Form with zod validation example",permalink:"/effector-reform/docs/learn/examples/zod-form"}},u={},x=[];function g(e){const r={code:"code",pre:"pre",...(0,a.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(c,{}),"\n",(0,i.jsx)("br",{}),"\n",(0,i.jsx)(r.pre,{children:(0,i.jsx)(r.code,{className:"language-tsx",children:"import { createForm } from '@effector-reform/core';\nimport { yupAdapter } from '@effector-reform/yup';\nimport { object, string } from 'yup';\nimport { useForm } from '@effector-reform/react';\n\nconst form = createForm({\n  schema: {\n    nick: '',\n    email: '',\n  },\n\n  validation: yupAdapter(\n    object({\n      nick: string()\n        .min(4, 'nick-min-limit')\n        .max(16, 'nick-max-limit')\n        .required('nick-required'),\n      email: string().email('invalid-email').required('email-required'),\n    }),\n  ),\n});\n\nexport const FormWithYup = () => {\n  const { fields } = useForm(form);\n\n  return (\n    <>\n      <form>\n        <input\n          value={fields.nick.value}\n          onChange={(e) => fields.nick.onChange(e.currentTarget.value)}\n        />\n\n        <p>nick error: {fields.nick.error}</p>\n\n        <input\n          value={fields.email.value}\n          onChange={(e) => fields.email.onChange(e.currentTarget.value)}\n        />\n\n        <p>email error: {fields.email.error}</p>\n      </form>\n    </>\n  );\n};\n"})})]})}function h(e={}){const{wrapper:r}={...(0,a.R)(),...e.components};return r?(0,i.jsx)(r,{...e,children:(0,i.jsx)(g,{...e})}):g(e)}}}]);