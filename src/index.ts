import { fileURLToPath } from 'url'
import { green, blue, cyan } from 'kolorist'
import { join, resolve, dirname } from 'path'

import fs from 'fs-extra'
import prompts from 'prompts'

import { FrameworkItem } from './type'

// 框架选项
const FRAMEWORKS: FrameworkItem[] = [
  {
    name: 'vue',
    color: green,
    variants: [
      {
        name: 'vue3',
        color: green
      }
    ]
  }
]

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, '')
}

async function init() {
  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: '请输入项目名称:',
      initial: 'sure-project',
      validate: (val) => !!formatTargetDir(val)
    },
    {
      type: 'select',
      name: 'framework',
      message: '请选择框架:',
      choices: FRAMEWORKS.map((framework) => ({
        title: framework.color(framework.name),
        value: framework
      }))
    },
    {
      type: 'select',
      name: 'templateName',
      message: '请选择模板:',
      choices: (framework) => {
        return framework.variants.map((variant: FrameworkItem) => ({
          title: variant.color(variant.name),
          value: variant.name
        }))
      }
    }
  ]).catch((err) => {
    console.log(err)
  })

  const projectName = response?.projectName
  const frameworkName = response?.framework.name
  const templateName = response?.templateName

  // 拿到用户选择的数据,开始拼接路径
  const cwd = process.cwd()

  // 目标目录
  const root = join(cwd, projectName)
  await fs.ensureDir(root)

  const existing = await fs.readdir(root)
  if (existing.length) {
    console.error(`Error: 目标目录不是一个空文件夹.`)
    process.exit(1)
  }

  const dirPath = dirname(fileURLToPath(import.meta.url))

  // 模板目录
  const templateDir = resolve(
    dirPath,
    '../template',
    frameworkName,
    templateName
  )

  // 先读取目标目录下所有的文件,然后递归的去拷贝到模板目录中~
  function readDirFile(path: string, dirPath: string) {
    const files = fs.readdirSync(path, { withFileTypes: true })

    files.forEach((file) => {
      const filePath = join(dirPath, file.name)

      if (!filePath.includes('node_modules')) {
        if (file.isDirectory()) {
          if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath)
          }

          readDirFile(resolve(path, file.name), filePath)
        } else {
          fs.copyFileSync(join(path, file.name), filePath)
        }
      }
    })
  }

  readDirFile(templateDir, root)

  console.log(`
    您的项目创建在 ${blue(root)}...

    运行命令:

      cd ${cyan(projectName)}
      npm install
      npm run dev
  `)
}

init().catch((err) => {
  console.log(`创建模板失败 ${err}`)
})
