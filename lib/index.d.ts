import { Plugin } from 'webpack'

export = HTMLAssetsInjectionPlugin;

declare class HTMLAssetsInjectionPlugin extends Plugin {
  constructor (options?: HTMLAssetsInjectionPlugin.Options);
}

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
