import { Plugin } from 'webpack'

declare namespace HTMLAssetsInjectionPlugin {
  interface Options {
    pagePattern?: RegExp,
    scriptPattern?: RegExp,
    stylesheetPattern?: RegExp,
    scriptInjectCode?: InjectCodeFn,
    stylesheetInjectCode?: InjectCodeFn
  }

  type InjectCodeFn = (href: string) => string
}

export default class HTMLAssetsInjectionPlugin extends Plugin {
  constructor (options?: HTMLAssetsInjectionPlugin.Options)
}
