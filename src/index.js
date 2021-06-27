import * as React from "react"

const defaultBlockList = [
  "iframe",
  "script",
  "link",
  "base",
  "meta",
  "noscript",
  "template"
]

const stringifyArray = (arr) => {
  return arr.filter((a, b, c) => b === c.indexOf(a)).join(", ")
}

function validateMarkup(value, listType, list) {
  let html
  const disallowedElements = []
  if (listType === "allow") {
    const regex = new RegExp("<(\\w+).*(\\/|<\\/\\w+)?>", "gm")
    html = value.replace(regex, (match, element) => {
      if (!list.includes(element)) {
        disallowedElements.push(element)
        return ""
      }
      return match
    })
  } else {
    html = list.reduce((acc, element) => {
      const regex = new RegExp(`<${element}.*(\\/|<\\/${element})?>`, "gm")
      return acc.replace(regex, () => {
        disallowedElements.push(element)
        return ""
      })
    }, value)
  }
  const formatWarning = stringifyArray(disallowedElements)
  return {
    html: srcPathCleaner(html),
    warn: disallowedElements.length ? `Blocked: ${formatWarning}` : null
  }
}

function scopeStyles(htmlValue, scope) {
  const regex = /<style>(.*?)<\/style>/gms
  const withScoped = htmlValue.replace(regex, (match) => {
    const replaceMent = `.${scope} $&`
    return match.replace(/([\\.#\\[].+?|\w+|\*)(?={)/gm, replaceMent)
  })
  return `<span class="${scope}">${withScoped}</span>`
}

function srcPathCleaner(htmlValue) {
  return htmlValue.replace(/src=["'](.*?)["']/gm, (match, source) => {
    if (/https?:\/\/((?:[\w\d-]+\.)+[\w\d]{2,})/.test(source)) {
      return match
    }
    return 'src=""'
  })
}

/**
 * HTMLSandboxInput
 * Uses a allow/block list to show only accepted html
 * Scopes styles if enabled
 * Removes faulty src paths like referencing a local file
 * @param {import("react").ElementType} as
 * @param {array[str]} allow list of elements to allow
 * @param {array[str]} block list of elements not to allow
 * @param {boolean} scope determines if css style is scoped
 * @param {function} onChange
 * @param {function} onWarn
 */
export default function HTMLSandboxInput({
  as: Component = "textarea",
  allow = [],
  block = [],
  scope = "sandbox-scope",
  onChange = () => null,
  onWarn = () => null,
  ...props
}) {
  if (!Array.isArray(allow) || !Array.isArray(block)) {
    throw new TypeError(
      "invalid argument type supplied to allow or block list. Expected an array"
    )
  }
  const blockList = block.length ? block : defaultBlockList
  const listType = allow.length ? "allow" : "block"
  const list = allow.length ? allow : blockList
  const inputRef = React.useRef()

  const handleChange = () => {
    let { html, warn } = validateMarkup(inputRef.current.value, listType, list)
    if (scope) {
      html = scopeStyles(html, scope)
    }
    onWarn(warn)
    onChange(html)
  }

  return <Component onChange={handleChange} ref={inputRef} {...props} />
}

HTMLSandboxInput.defaults = {
  blockList: defaultBlockList
}

