interface ScssConfig {
  name: string;
  design?: {
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    layout?: "grid" | "flex" | "block";
  };
}

/**
 * SCSSコード生成
 */
export async function generateScss(config: ScssConfig): Promise<string> {
  const { name, design = {} } = config;
  const className = `.c_${toSnakeCase(name)}`;

  const {
    colors = { primary: "#0ea5e9", background: "#fff" },
    typography = { size: "1.6rem", lineHeight: "1.6" },
    layout = "flex",
  } = design;

  return `${className} {
  display: ${layout === "grid" ? "grid" : layout === "flex" ? "flex" : "block"};
  ${layout === "flex" ? "flex-direction: column;" : ""}
  ${layout === "grid" ? "grid-template-columns: 1fr;\n  gap: 1.6rem;" : ""}
  padding: 2rem;
  background: ${colors.background || "#fff"};
  border-radius: 0.8rem;
  transition: transform 0.3s ease;

  @include mq() {
    padding: 2.4rem;
    ${layout === "grid" ? "grid-template-columns: repeat(2, 1fr);" : ""}
  }

  &:hover {
    transform: translateY(-0.4rem);
  }

  &_img {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 0.4rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &_body {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  &_ttl {
    font-size: ${typography.size || "1.8rem"};
    font-weight: 700;
    line-height: ${typography.lineHeight || "1.6"};
    color: ${colors.primary || "#333"};
  }

  &_desc {
    font-size: 1.4rem;
    line-height: 1.7;
    color: #666;
  }
}
`;
}

function toSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}
