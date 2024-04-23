"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[610],{4073:(e,r,d)=>{d.r(r),d.d(r,{assets:()=>t,contentTitle:()=>l,default:()=>h,frontMatter:()=>i,metadata:()=>c,toc:()=>a});var n=d(4848),s=d(8453);const i={id:"use-form",sidebar_position:3,title:"useForm",tags:["React","Form"]},l=void 0,c={id:"api/react/use-form",title:"useForm",description:"Use form model in react component",source:"@site/docs/api/react/use-form.md",sourceDirName:"api/react",slug:"/api/react/use-form",permalink:"/effector-reform/docs/api/react/use-form",draft:!1,unlisted:!1,editUrl:"https://github.com/movpushmov/effector-reform/tree/main/docs/docs/api/react/use-form.md",tags:[{label:"React",permalink:"/effector-reform/docs/tags/react"},{label:"Form",permalink:"/effector-reform/docs/tags/form"}],version:"current",sidebarPosition:3,frontMatter:{id:"use-form",sidebar_position:3,title:"useForm",tags:["React","Form"]},sidebar:"apiSidebar",previous:{title:"useArrayField",permalink:"/effector-reform/docs/api/react/use-array-field"},next:{title:"yupAdapter",permalink:"/effector-reform/docs/api/yup/validation-adapter"}},t={},a=[{value:"Formulae",id:"formulae",level:3},{value:"Examples",id:"examples",level:3},{value:"API Reference",id:"api-reference",level:3},{value:"ReactForm",id:"reactform",level:4},{value:"ReactField (Primary)",id:"reactfield-primary",level:4},{value:"ReactField (Array)",id:"reactfield-array",level:4}];function o(e){const r={a:"a",code:"code",em:"em",h3:"h3",h4:"h4",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.p,{children:"Use form model in react component"}),"\n",(0,n.jsx)(r.h3,{id:"formulae",children:"Formulae"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-ts",children:"interface UseFormProps {\n  resetOnUnmount?: boolean;\n}\n\ntype AnyForm = FormType<any, any, any>;\n\nfunction useForm<\n  T extends AnyForm,\n  Schema extends ReadyFieldsGroupSchema = T extends FormType<infer K, any, any>\n    ? K\n    : never,\n  Values extends FormValues<any> = T extends FormType<any, infer K, any>\n    ? K\n    : never,\n  Errors extends FormErrors<any> = T extends FormType<any, any, infer K>\n    ? K\n    : never,\n>(form: T, props?: UseFormProps): ReactForm<Schema, Values, Errors>;\n"})}),"\n",(0,n.jsx)(r.h3,{id:"examples",children:"Examples"}),"\n",(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:"language-tsx",children:'import { useForm } from \'@effector-reform/react\';\nimport { createForm } from "@effector-reform/core";\n\nconst form = createForm({\n  schema: {\n    name: \'\',\n    age: 18,\n  },\n})\n\nfunction Form() {\n  const { fields, submit } = useForm(form);\n\n  return (\n    <form onSubmit={submit}>\n      <input\n        value={fields.name.value}\n        onChange={(event) => fields.name.onChange(event.currentTarget.value)}\n        onBlur={fields.name.onBlur}\n        onFocus={fields.name.onFocus}\n      />\n      \n      <input\n        type="number"\n        value={fields.age.value}\n        onChange={(event) => fields.age.onChange(parseInt(event.currentTarget.value))}\n        onBlur={fields.age.onBlur}\n        onFocus={fields.age.onFocus}\n      />\n      \n      <button type="submit">Submit</button>\n    </form>\n  )\n}\n'})}),"\n",(0,n.jsx)(r.h3,{id:"api-reference",children:"API Reference"}),"\n",(0,n.jsx)(r.h4,{id:"reactform",children:"ReactForm"}),"\n",(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:"name"}),(0,n.jsx)(r.th,{children:"type"}),(0,n.jsx)(r.th,{children:"description"})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"values"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"Values"})}),(0,n.jsx)(r.td,{children:"form values"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"errors"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"Errors"})}),(0,n.jsxs)(r.td,{children:["form errors (",(0,n.jsx)(r.em,{children:(0,n.jsx)(r.strong,{children:"Note:"})})," array field error stored in format ",(0,n.jsx)(r.code,{children:"{ error: null, errors: [] }"}),")"]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"fields"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"ReactFields<Schema>"})}),(0,n.jsx)(r.td,{children:"form fields (contains object of ReactFields)"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"isValid"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"boolean"})}),(0,n.jsx)(r.td,{children:"is form valid"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"isDirty"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"boolean"})}),(0,n.jsx)(r.td,{children:"is form changed"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"isValidationPending"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"boolean"})}),(0,n.jsx)(r.td,{children:"is validating"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"submit"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"() => void"})}),(0,n.jsx)(r.td,{children:"submit form"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"validate"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"() => void"})}),(0,n.jsx)(r.td,{children:"validate form"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"reset"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"() => void"})}),(0,n.jsx)(r.td,{children:"reset form values"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"setValues"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: Values) => void"})}),(0,n.jsx)(r.td,{children:"change values"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"setErrors"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: ErrorsSchemaPayload) => void"})}),(0,n.jsx)(r.td,{children:"set outer errors"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"setPartialValues"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: PartialRecursive<Values>) => void"})}),(0,n.jsx)(r.td,{children:"partially change values"})]})]})]}),"\n",(0,n.jsx)(r.h4,{id:"reactfield-primary",children:"ReactField (Primary)"}),"\n",(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:"name"}),(0,n.jsx)(r.th,{children:"type"}),(0,n.jsx)(r.th,{children:"description"})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"value"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"T"})}),(0,n.jsx)(r.td,{children:"field value"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"error"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"FieldError"})}),(0,n.jsx)(r.td,{children:"field outer error"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"isValid"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"boolean"})}),(0,n.jsx)(r.td,{children:"is field valid"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"isDirty"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"boolean"})}),(0,n.jsx)(r.td,{children:"is field changed"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"onChangeError"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(newError: FieldError) => void"})}),(0,n.jsx)(r.td,{children:"change field error"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"onChange"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(newValue: T) => void"})}),(0,n.jsx)(r.td,{children:"change field value"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"onFocus"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"() => void"})}),(0,n.jsx)(r.td,{children:"focus field"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"onBlur"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"() => void"})}),(0,n.jsx)(r.td,{children:"blur field"})]})]})]}),"\n",(0,n.jsx)(r.h4,{id:"reactfield-array",children:"ReactField (Array)"}),"\n",(0,n.jsxs)(r.table,{children:[(0,n.jsx)(r.thead,{children:(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.th,{children:"name"}),(0,n.jsx)(r.th,{children:"type"}),(0,n.jsx)(r.th,{children:"description"})]})}),(0,n.jsxs)(r.tbody,{children:[(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"values"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(T extends ReadyFieldsGroupSchema ? ReactFields<T> : T)[]"})}),(0,n.jsx)(r.td,{children:"array field values"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"error"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"FieldError"})}),(0,n.jsx)(r.td,{children:"array field error"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"isValid"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"boolean"})}),(0,n.jsx)(r.td,{children:"is array field valid"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"isDirty"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"boolean"})}),(0,n.jsx)(r.td,{children:"is array field changed"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"reset"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"() => void"})}),(0,n.jsx)(r.td,{children:"reset array field values"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"change"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(values: Payload[]) => void"})}),(0,n.jsx)(r.td,{children:"change array field values"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"changeError"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(error: FieldError) => void"})}),(0,n.jsx)(r.td,{children:"change array field outer error"})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"push"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: PushPayload<Payload>) => void"})}),(0,n.jsxs)(r.td,{children:["push item ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"swap"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: SwapPayload) => void"})}),(0,n.jsxs)(r.td,{children:["swap items ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"move"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: MovePayload) => void"})}),(0,n.jsxs)(r.td,{children:["move item ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"insert"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: InsertOrReplacePayload<Payload>) => void"})}),(0,n.jsxs)(r.td,{children:["insert item ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"unshift"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: UnshiftPayload<Payload>) => void"})}),(0,n.jsxs)(r.td,{children:["unshift item(s) ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"remove"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: RemovePayload) => void"})}),(0,n.jsxs)(r.td,{children:["remove item ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"pop"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: void) => void"})}),(0,n.jsxs)(r.td,{children:["pop item ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]}),(0,n.jsxs)(r.tr,{children:[(0,n.jsx)(r.td,{children:"replace"}),(0,n.jsx)(r.td,{children:(0,n.jsx)(r.code,{children:"(payload: InsertOrReplacePayload<Payload>) => void"})}),(0,n.jsxs)(r.td,{children:["replace item ",(0,n.jsx)(r.a,{href:"../core/create-array-field",children:"reference"})]})]})]})]})]})}function h(e={}){const{wrapper:r}={...(0,s.R)(),...e.components};return r?(0,n.jsx)(r,{...e,children:(0,n.jsx)(o,{...e})}):o(e)}},8453:(e,r,d)=>{d.d(r,{R:()=>l,x:()=>c});var n=d(6540);const s={},i=n.createContext(s);function l(e){const r=n.useContext(i);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function c(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),n.createElement(i.Provider,{value:r},e.children)}}}]);