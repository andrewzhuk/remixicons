const fs = require('fs').promises
const camelcase = require('camelcase')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const svgr = require('@svgr/core').default
const babel = require('@babel/core')
const { compile: compileVue } = require('@vue/compiler-dom')
const { dirname } = require('path')

let transform = {
  react: async (svg, componentName, format) => {
    // Add an underscore to numbers that start with one
    if (/^\d/.test(componentName)) {
      componentName = `_${componentName}`;
    }
    let component = await svgr(svg, { ref: true }, { componentName })
    let { code } = await babel.transformAsync(component, {
      plugins: [[require('@babel/plugin-transform-react-jsx'), { useBuiltIns: true }]],
    })

    if (format === 'esm') {
      return code
    }

    return code
      .replace('import * as React from "react"', 'const React = require("react")')
      .replace('export default', 'module.exports =')
  },
  vue: (svg, componentName, format) => {
    // Add an underscore to numbers that start with one
    if (/^\d/.test(componentName)) {
      componentName = `_${componentName}`;
    }
    let { code } = compileVue(svg, {
      mode: 'module',
    })

    if (format === 'esm') {
      return code.replace('export function', 'export default function')
    }

    return code
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+(['"])(.*?)\2/,
        (_match, imports, _quote, mod) => {
          let newImports = imports
            .split(',')
            .map((i) => i.trim().replace(/\s+as\s+/, ': '))
            .join(', ')

          return `const { ${newImports} } = require("${mod}")`
        }
      )
      .replace('export function render', 'module.exports = function render')
  },
}

class Semaphore {
  constructor(max) {
    this.max = max
    this.count = 0
    this.queue = []
  }

  async acquire() {
    if (this.count < this.max) {
      this.count++
      return Promise.resolve()
    }

    return new Promise(resolve => this.queue.push(resolve))
  }

  release() {
    this.count--
    if (this.queue.length > 0) {
      this.count++
      const next = this.queue.shift()
      next()
    }
  }
}

const fileSemaphore = new Semaphore(50)

async function ensureWrite(file, text) {
  await fileSemaphore.acquire()
  try {
    await fs.mkdir(dirname(file), { recursive: true })
    await fs.writeFile(file, text, 'utf8')
  } finally {
    fileSemaphore.release()
  }
}

async function getIcons(style) {
  let files = await fs.readdir(`./optimized/${style}`)
  return Promise.all(
    files.map(async (file) => ({
      svg: await fs.readFile(`./optimized/${style}/${file}`, 'utf8'),
      componentName: `${camelcase(file.replace(/\.svg$/, ''), {
        pascalCase: true,
      })}Icon`,
    }))
  )
}

function exportAll(icons, format, includeExtension = true) {
  return icons
    .map(({ componentName }) => {
      let extension = includeExtension ? '.js' : ''
      if (format === 'esm') {
        return `export { default as ${componentName} } from './${componentName}${extension}'`
      }
      return `module.exports.${componentName} = require("./${componentName}${extension}")`
    })
    .join('\n')
}

async function ensureWriteJson(file, json) {
  await ensureWrite(file, JSON.stringify(json, null, 2))
}

async function buildIcons(package, style, format) {
  let outDir = `./${package}/${style}`
  if (format === 'esm') {
    outDir += '/esm'
  }

  let icons = await getIcons(style)

  await Promise.all(
    icons.flatMap(async ({ componentName, svg }) => {
      let content = await transform[package](svg, componentName, format)
      let types =
        package === 'react'
          ? `import * as React from 'react';\ndeclare function ${componentName}(props: React.ComponentProps<'svg'>): JSX.Element;\nexport default ${componentName};\n`
          : `import type { FunctionalComponent, HTMLAttributes, VNodeProps } from 'vue';\ndeclare const ${componentName}: FunctionalComponent<HTMLAttributes & VNodeProps>;\nexport default ${componentName};\n`

      return [
        ensureWrite(`${outDir}/${componentName}.js`, content),
        ...(types ? [ensureWrite(`${outDir}/${componentName}.d.ts`, types)] : []),
      ]
    })
  )

  await ensureWrite(`${outDir}/index.js`, exportAll(icons, format))

  await ensureWrite(`${outDir}/index.d.ts`, exportAll(icons, 'esm', false))
}

async function main(package) {
  const cjsPackageJson = { module: './esm/index.js', sideEffects: false }
  const esmPackageJson = { type: 'module', sideEffects: false }

  console.log(`Building ${package} package...`)

  await Promise.all([rimraf(`./${package}/line/*`), rimraf(`./${package}/fill/*`)])

  await Promise.all([
    buildIcons(package, 'fill', 'esm'),
    buildIcons(package, 'fill', 'cjs'),
    buildIcons(package, 'line', 'esm'),
    buildIcons(package, 'line', 'cjs'),
    ensureWriteJson(`./${package}/line/package.json`, cjsPackageJson),
    ensureWriteJson(`./${package}/line/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./${package}/fill/package.json`, cjsPackageJson),
    ensureWriteJson(`./${package}/fill/esm/package.json`, esmPackageJson),
  ])

  return console.log(`Finished building ${package} package.`)
}

let [package] = process.argv.slice(2)

if (!package) {
  throw new Error('Please specify a package')
}

main(package)
