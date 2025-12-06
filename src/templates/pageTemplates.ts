interface PageConfig {
  pageName: string;
  pageData: {
    head: {
      slug: string;
      ttl: string;
      description: string;
      url: string;
    };
    breadcrumbs?: Array<{ text: string; link: string }>;
    contents: Record<string, any>;
  };
  sections: string[];
}

/**
 * ページテンプレート生成
 */
export function generatePageTemplate(config: PageConfig): string {
  const { pageName, pageData, sections } = config;
  const { head, breadcrumbs, contents } = pageData;

  // インポート文生成
  const imports = generateImports(pageName, sections, breadcrumbs);

  // pageオブジェクト生成
  const pageObject = generatePageObject(pageData);

  // セクションコンポーネント配置
  const sectionComponents = generateSectionComponents(
    pageName,
    sections,
    breadcrumbs
  );

  return `---
${imports}

import "@/scss/pages/_${pageName}.scss";

${pageObject}

const imgPath = "/_assets/img/" + page.head.slug + "/";
---

<Layout page={page.head}>
${breadcrumbs ? '  <LowerTitle title={page.head.ttl} />\n  <Breadcrumbs bread={page.breadcrumbs} />\n' : ""}
  <div class="contentInner">
    <div class="p_${pageName}">
${sectionComponents}
    </div>
  </div>
</Layout>
`;
}

function generateImports(
  pageName: string,
  sections: string[],
  breadcrumbs?: any[]
): string {
  const imports = ['import Layout from "@/layouts/Layout.astro";'];

  if (breadcrumbs) {
    imports.push('import LowerTitle from "@/components/LowerTitle.astro";');
    imports.push('import Breadcrumbs from "@/components/Breadcrumbs.astro";');
  }

  // セクションインポート
  sections.forEach((section) => {
    const componentName = toPascalCase(section) + "Section";
    imports.push(
      `import ${componentName} from "@/pages/_parts/_${pageName}/_${section}.astro";`
    );
  });

  return imports.join("\n");
}

function generatePageObject(pageData: any): string {
  return `const page = ${JSON.stringify(pageData, null, 2)};`;
}

function generateSectionComponents(
  pageName: string,
  sections: string[],
  breadcrumbs?: any[]
): string {
  return sections
    .map((section, index) => {
      const componentName = toPascalCase(section) + "Section";
      const props = `${section}={page.contents.${section}}`;
      const additionalProps =
        section === "articles" || section === "videos" ? " imgPath={imgPath}" : "";

      return `      <section id="${section}">
        <${componentName} ${props}${additionalProps} />
      </section>`;
    })
    .join("\n");
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
